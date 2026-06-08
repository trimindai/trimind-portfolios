/**
 * Request-body parsing with a hard size cap and optional Zod validation.
 *
 * Two failure modes the AI routes care about:
 *   - Oversized payloads → 413 (a 2 MB `userDraft` is pure Gemini cost).
 *   - Malformed / wrong-shape input → 400 (validated against a Zod schema;
 *     unknown keys are stripped, so free-text fields injected into LLM prompts
 *     can be length-capped at the schema level).
 *
 * Returns a discriminated result so callers stay flat:
 *
 *   const parsed = await parseJsonBody(req, { schema: MySchema });
 *   if (!parsed.ok) return parsed.response;
 *   const data = parsed.data; // typed
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

interface ParseOptions<T> {
  /** Hard cap on the raw request body in bytes. Default 32 KB. */
  maxBytes?: number;
  /** Optional Zod schema. Unknown keys are stripped. Omit to size-cap only. */
  schema?: ZodType<T>;
}

export async function parseJsonBody<T = unknown>(
  req: NextRequest,
  { maxBytes = 32 * 1024, schema }: ParseOptions<T> = {}
): Promise<ParseResult<T>> {
  // Cheap pre-check on the declared length before we buffer anything.
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > maxBytes) return tooLarge(maxBytes);

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return bad("Invalid body");
  }
  // Content-Length can be absent or lie; enforce the real byte size too.
  if (Buffer.byteLength(raw, "utf8") > maxBytes) return tooLarge(maxBytes);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return bad("Invalid JSON");
  }

  if (!schema) return { ok: true, data: json as T };

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return bad(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  return { ok: true, data: parsed.data };
}

function bad(error: string): { ok: false; response: NextResponse } {
  return { ok: false, response: NextResponse.json({ error }, { status: 400 }) };
}

function tooLarge(maxBytes: number): { ok: false; response: NextResponse } {
  return {
    ok: false,
    response: NextResponse.json(
      { error: `Request too large (max ${Math.floor(maxBytes / 1024)} KB).` },
      { status: 413 }
    ),
  };
}
