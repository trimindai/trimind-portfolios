// Clerk-gated CV parser. Accepts a file (PDF/DOCX/TXT/image) via multipart, or
// pasted text via JSON. Extracts text (unpdf / mammoth), sends it to OpenRouter
// google/gemini-2.5-flash for a structured CV, then creates the signed-in user's
// portfolio and patches it with the parsed sections.
//
// Ported from cv-bot/{parsers,llm_extract}.py. Owner = the Clerk session, so all
// writes go through the user-scoped Convex client (no server secret, no IDOR).

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { enforceUserRateLimit } from "@/lib/ratelimit";
import { convexClientForUser } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  CvSchema,
  PARSE_SYSTEM,
  toCreateBasics,
  toUpdatePatch,
} from "@/lib/cv-schema";
import {
  openrouterChat,
  parseJsonLoose,
  type ORMessage,
} from "@/lib/openrouter";
import { buildUserContent, type Img } from "@/lib/cv-content";

export const maxDuration = 120; // CV parse can take a few seconds on cold start

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
// ponytail: 5 files / 20 MB total bounds LLM cost per parse; lift if users hit it.
const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB across all files
const MAX_TEXT_CHARS = 24_000; // ~6k tokens — matches the Python MAX_INPUT_CHARS
const MAX_INSTRUCTIONS_CHARS = 4_000; // extra plain-English notes merged into the CV
const MIN_TEXT_CHARS = 150; // below this a PDF is treated as scanned → vision
const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp"]);

const TextBody = z.object({
  text: z.string().trim().min(20, "Paste a bit more of your CV.").max(40_000),
  locale: z.enum(["en", "ar"]).default("en"),
  instructions: z.string().trim().max(MAX_INSTRUCTIONS_CHARS).optional(),
});

function ext(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "";
}

async function pdfToText(buf: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(text) ? text.join("\n") : text || "").trim();
}

async function docxToText(buf: Buffer): Promise<string> {
  const mammoth = (await import("mammoth")).default;
  const { value } = await mammoth.extractRawText({ buffer: buf });
  return (value || "").trim();
}

const userContent = (text: string | null, images?: Img[]): ORMessage["content"] =>
  buildUserContent(text, images, MAX_TEXT_CHARS);

/** Extract one uploaded file → text, or an image for the vision path. */
async function extractFile(file: File): Promise<{ text?: string; image?: Img }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const e = ext(file.name);
  if (IMAGE_EXTS.has(e)) {
    return { image: { buf, mime: e === "jpg" ? "image/jpeg" : `image/${e}` } };
  }
  if (e === "pdf") {
    const text = await pdfToText(buf);
    // Scanned / image-only PDF → vision path on the raw bytes.
    return text.length < MIN_TEXT_CHARS
      ? { image: { buf, mime: "application/pdf" } }
      : { text };
  }
  if (e === "docx") return { text: await docxToText(buf) };
  if (e === "txt" || e === "md") return { text: buf.toString("utf8").trim() };
  throw new Error("Unsupported file type. Use PDF, Word, text, or an image.");
}

/** ONE call + one repair retry, validating against the zod CV schema. */
async function extractCv(content: ORMessage["content"], instructions?: string) {
  const messages: ORMessage[] = [
    { role: "system", content: PARSE_SYSTEM },
    { role: "user", content },
  ];
  // Combined path: merge the user's plain-English notes into the same parse.
  const notes = instructions?.trim();
  if (notes) {
    messages.push({
      role: "user",
      content: `ADDITIONAL INSTRUCTIONS from the candidate — merge these into the CV:\n${notes.slice(
        0,
        MAX_INSTRUCTIONS_CHARS
      )}`,
    });
  }
  let totalIn = 0;
  let totalOut = 0;

  const run = async (msgs: ORMessage[]) => {
    const { message, usage } = await openrouterChat({
      messages: msgs,
      response_format: { type: "json_object" },
    });
    totalIn += usage.prompt_tokens;
    totalOut += usage.completion_tokens;
    const raw = typeof message.content === "string" ? message.content : "";
    return CvSchema.parse(parseJsonLoose(raw));
  };

  try {
    const cv = await run(messages);
    return { cv, usage: { in: totalIn, out: totalOut } };
  } catch (err) {
    // ONE repair retry — hand the model its error and the schema again.
    const repair: ORMessage[] = [
      ...messages,
      {
        role: "user",
        content: `Your previous output failed validation: ${String(err).slice(
          0,
          400
        )}. Return ONLY a valid JSON object matching the schema exactly.`,
      },
    ];
    const cv = await run(repair);
    return { cv, usage: { in: totalIn, out: totalOut } };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Burst + durable daily cap (this spends OpenRouter budget).
    const burst = await enforceUserRateLimit(userId, "parse-cv", {
      limit: 6,
      windowMs: 60_000,
    });
    if (burst) return burst;
    const daily = await enforceUserRateLimit(userId, "parse-cv-daily", {
      limit: 20,
      windowMs: 24 * 60 * 60 * 1000,
      message: "Daily CV-parse limit reached. Try again tomorrow.",
    });
    if (daily) return daily;

    let locale: "en" | "ar" = "en";
    let content: ORMessage["content"];
    let instructions: string | undefined;

    const ctype = req.headers.get("content-type") || "";
    if (ctype.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form.getAll("file").filter((f): f is File => f instanceof File);
      const loc = form.get("locale");
      if (loc === "ar") locale = "ar";
      const instr = form.get("instructions");
      if (typeof instr === "string" && instr.trim()) {
        instructions = instr.slice(0, MAX_INSTRUCTIONS_CHARS);
      }
      const pastedField = form.get("text");
      const pasted = typeof pastedField === "string" ? pastedField.trim() : "";

      if (files.length === 0 && pasted.length < 20) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      if (files.length > MAX_FILES) {
        return NextResponse.json(
          { error: `Too many files (max ${MAX_FILES}).` },
          { status: 400 }
        );
      }
      let total = 0;
      for (const f of files) {
        if (f.size > MAX_FILE_BYTES) {
          return NextResponse.json({ error: "File too large (max 8 MB)." }, { status: 413 });
        }
        total += f.size;
      }
      if (total > MAX_TOTAL_BYTES) {
        return NextResponse.json(
          { error: "Files too large (max 20 MB total)." },
          { status: 413 }
        );
      }

      // Extract every file, then combine: one parse over all sources at once.
      const texts: string[] = [];
      const images: Img[] = [];
      for (const f of files) {
        let r: { text?: string; image?: Img };
        try {
          r = await extractFile(f);
        } catch (e) {
          return NextResponse.json(
            { error: e instanceof Error ? e.message : "Unsupported file." },
            { status: 400 }
          );
        }
        if (r.image) images.push(r.image);
        else if (r.text && r.text.length > 0) texts.push(`--- ${f.name} ---\n${r.text}`);
      }
      if (pasted) texts.push(pasted);
      const combinedText = texts.join("\n\n") || null;
      if (!combinedText && images.length === 0) {
        return NextResponse.json(
          { error: "Could not read any text from those files." },
          { status: 422 }
        );
      }
      content = userContent(combinedText, images.length ? images : undefined);
    } else {
      const raw = await req.text();
      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
      const parsed = TextBody.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? "Invalid input" },
          { status: 400 }
        );
      }
      locale = parsed.data.locale;
      content = userContent(parsed.data.text);
      instructions = parsed.data.instructions;
    }

    const { cv } = await extractCv(content, instructions);
    if (!cv.is_cv) {
      return NextResponse.json(
        { error: "That doesn't look like a CV. Try a different file or paste your details." },
        { status: 422 }
      );
    }

    // Create + patch as the signed-in user (Convex enforces ownership natively).
    const client = await convexClientForUser();
    const portfolioId = (await client.mutation(api.portfolios.create, {
      templateId: cv.templateId,
      locale,
      name: cv.basics.fullName ? `${cv.basics.fullName}'s Portfolio` : "My Portfolio",
      basics: toCreateBasics(cv) as any,
    })) as Id<"portfolios">;

    const patch = toUpdatePatch(cv);
    if (Object.keys(patch).length > 0) {
      await client.mutation(api.portfolios.update, {
        id: portfolioId,
        aiFilledAt: Date.now(),
        ...(patch as any),
      });
    }

    return NextResponse.json({ portfolioId, data: cv });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    console.error("[parse-cv] error:", error);
    if (msg.includes("OPENROUTER_API_KEY")) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to parse CV. Please try again." },
      { status: 500 }
    );
  }
}
