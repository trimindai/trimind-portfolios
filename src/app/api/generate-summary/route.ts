import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { enforceUserRateLimit } from "@/lib/ratelimit";
import { parseJsonBody } from "@/lib/api-input";

// Every field below is interpolated into the Gemini prompt, so each free-text
// field is length-capped here to bound prompt size (cost) and injection blast
// radius. Unknown keys are stripped by `parseJsonBody`.
const SummarySchema = z.object({
  fullName: z.string().trim().min(1, "fullName is required").max(200),
  professionalTitle: z.string().trim().min(1, "professionalTitle is required").max(200),
  location: z.string().max(200).optional(),
  totalYearsExperience: z.union([z.string().max(50), z.number()]).optional(),
  mostRecentRole: z.string().max(200).optional(),
  mostRecentCompany: z.string().max(200).optional(),
  topSkills: z
    .union([z.string().max(1000), z.array(z.string().max(100)).max(50)])
    .optional(),
  notableAchievement: z.string().max(1000).optional(),
  highestEducation: z.string().max(300).optional(),
  userDraft: z.string().max(8000).optional(),
});

export async function POST(req: NextRequest) {
  // Auth: this endpoint spends Gemini budget, so it must never be public.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceUserRateLimit(userId, "ai-summary", {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set");
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  const parsed = await parseJsonBody(req, { schema: SummarySchema });
  if (!parsed.ok) return parsed.response;
  const {
    fullName,
    professionalTitle,
    location,
    totalYearsExperience,
    mostRecentRole,
    mostRecentCompany,
    topSkills,
    notableAchievement,
    highestEducation,
    userDraft,
  } = parsed.data;

  const userDraftSection = userDraft?.trim()
    ? `\nUser's raw notes (use this as the primary source of truth for their profession and experience):\n${userDraft.trim()}\n`
    : "";

  const prompt = `CRITICAL — READ THIS FIRST:
The user's job title is: "${professionalTitle}"
Use this EXACT profession everywhere. Do NOT substitute or change it.
If it contains extra words, extract the core profession.

Write a professional CV summary for this person.
Return ONLY the summary text — no labels, no quotes, no explanation, no markdown.

Rules:
- 2-3 sentences maximum
- Start with job title and years of experience
- Mention 1-2 specific skills or achievements if available
- End with the value they bring to employers
- Professional tone, active voice
- Always write complete sentences — never cut off mid-sentence
- Maximum 3 sentences. If you reach the token limit, finish the current sentence first.
- If the user's raw notes mention a profession, use that exact profession — do not substitute a similar one (e.g. if they say 'computer engineer' do not write 'civil engineer')
- Do NOT use: "results-driven", "passionate", "dynamic", "seasoned"
- Context: Gulf job market (Kuwait / Saudi Arabia / UAE)
- If name appears Arabic and title is in English, mention bilingual capability naturally
${userDraftSection}
Person data:
Name: ${fullName}
Title: ${professionalTitle}
Location: ${location ?? "Kuwait"}
Years of experience: ${totalYearsExperience ?? "not provided"}
Most recent role: ${mostRecentRole ?? "not provided"} at ${mostRecentCompany ?? "not provided"}
Key skills: ${topSkills ?? "not provided"}
Notable achievement: ${notableAchievement ?? "not provided"}
Education: ${highestEducation ?? "not provided"}`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Gemini API error:", res.status, errBody);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      console.error("Empty Gemini response:", JSON.stringify(data));
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    return NextResponse.json({ summary: text });
  } catch (e: any) {
    console.error("Gemini fetch error:", e.message);
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  }
}
