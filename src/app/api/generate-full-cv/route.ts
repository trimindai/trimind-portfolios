import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { enforceUserRateLimit } from "@/lib/ratelimit";
import { parseJsonBody } from "@/lib/api-input";

// fullName/professionalTitle/location/userNotes are interpolated into the
// Gemini prompt; email is echoed back into the mapped basics. Free-text fields
// are length-capped to bound prompt cost and injection surface.
const FullCvSchema = z.object({
  fullName: z.string().trim().min(1, "fullName is required").max(200),
  professionalTitle: z.string().trim().min(1, "professionalTitle is required").max(200),
  location: z.string().max(200).optional(),
  userNotes: z.string().max(8000).optional(),
  email: z.string().max(320).optional(),
});

export async function POST(req: NextRequest) {
  // Auth: this endpoint spends Gemini budget, so it must never be public.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceUserRateLimit(userId, "ai-full-cv", {
    limit: 6,
    windowMs: 60_000,
  });
  if (limited) return limited;

  // Product cap (AUDIT rec #5): the builder UI allows 3 full-CV generations per
  // session but that counter is client state and resets on reload. This durable
  // daily cap (3x the session allowance) is what actually bounds Gemini spend.
  const daily = await enforceUserRateLimit(userId, "ai-full-cv-daily", {
    limit: 9,
    windowMs: 24 * 60 * 60 * 1000,
    message: "Daily AI limit reached. Try again tomorrow.",
  });
  if (daily) return daily;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set");
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  const parsed = await parseJsonBody(req, { schema: FullCvSchema });
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  const { fullName, professionalTitle, location, userNotes } = body;

  const prompt = `CRITICAL — READ THIS FIRST:
The user's job title is: "${professionalTitle}"
Use this EXACT profession everywhere. Do NOT substitute or change it.
If it contains extra words, extract the core profession.

You are a professional CV writer for the Gulf job market (Kuwait, Saudi Arabia, UAE).
Generate a complete, realistic CV profile. Return ONLY valid JSON.

Rules:
- Use ONLY information inferable from name and title
- Do NOT invent specific company names — use [Company Name] placeholders
- Use [X] placeholders for specific numbers the user will replace
- Gulf market context — Kuwait companies, Gulf work culture
- If name appears Arabic, assume bilingual Arabic/English
- Professional tone, complete sentences throughout
- Experience: 2-3 entries, bullet points with action verbs and [X] placeholders
- Skills: realistic and specific to the exact job title
- Always write complete sentences — never cut off mid-sentence

Person:
Name: ${fullName}
Title: ${professionalTitle}
Location: ${location ?? "Kuwait"}
${userNotes ? "Additional context: " + userNotes : ""}

Return this EXACT JSON structure:
{
  "professionalSummary": "2-3 sentence professional summary",
  "experience": [
    {
      "jobTitle": "exact job title",
      "company": "[Company Name]",
      "location": "City, Country",
      "startYear": "2019",
      "endYear": "2023",
      "isCurrent": false,
      "description": "• Action verb + accomplishment with [X] placeholder\\n• Another bullet point"
    }
  ],
  "achievements": [
    {
      "title": "achievement title",
      "situation": "context",
      "result": "measurable outcome",
      "isFeatured": true
    }
  ],
  "skills": [
    { "category": "Technical Skills", "skills": ["skill1", "skill2"] },
    { "category": "Soft Skills", "skills": ["skill1", "skill2"] }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "university",
      "endYear": "2018",
      "achievements": ""
    }
  ],
  "certifications": [
    { "name": "cert name", "issuer": "issuer", "year": "2022" }
  ],
  "languages": [
    { "language": "Arabic", "level": "Native" },
    { "language": "English", "level": "Fluent" }
  ],
  "courses": [
    { "name": "course name", "provider": "provider", "year": "2023" }
  ],
  "endorsements": [],
  "affiliations": [
    { "name": "organization", "role": "Member" }
  ]
}`;

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
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Gemini API error:", res.status, errBody);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await res.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      console.error("Empty Gemini response:", JSON.stringify(data));
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    // Strip markdown fences as safety net
    text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

    let cv: any;
    try {
      cv = JSON.parse(text);
    } catch {
      console.error("Gemini returned invalid JSON:", text.slice(0, 500));
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

    // MAP Gemini fields to Convex schema fields
    const existingBasics = {
      fullName,
      title: professionalTitle,
      email: body.email || "professional@email.com",
    };

    const mapped = {
      basics: {
        ...existingBasics,
        bio: cv.professionalSummary,
        summary: cv.professionalSummary,
        subtitle: `${professionalTitle} in ${location ?? "Kuwait"}`,
      },
      experience: (cv.experience || []).map((e: any) => ({
        title: e.jobTitle,
        company: e.company,
        startDate: e.startYear,
        endDate: e.isCurrent ? "Present" : (e.endYear || ""),
        description: e.description,
        highlights: e.description?.split("\n").filter((l: string) => l.startsWith("•")).map((l: string) => l.replace(/^•\s*/, "")) || [],
      })),
      skills: (cv.skills || []).map((s: any) => ({ category: s.category, items: s.skills || s.items || [] })),
      projects: (cv.achievements || []).map((a: any) => ({
        title: a.title,
        description: a.situation || a.description || "",
        technologies: [],
        metrics: a.result ? [{ value: a.result, label: "Result" }] : [],
        isFeatured: a.isFeatured ?? false,
      })),
      education: (cv.education || []).map((e: any) => ({
        degree: e.degree,
        institution: e.institution,
        year: e.endYear || e.year || "",
        description: e.achievements || "",
      })),
      certifications: (cv.certifications || []).map((c: any) => ({
        name: c.name,
        issuer: c.issuer,
        year: c.year || "",
      })),
      languages: (cv.languages || []).map((l: any) => ({
        name: l.language || l.name,
        level: l.level,
      })),
      continuousDevelopment: (cv.courses || []).map((c: any) => ({
        name: c.name,
        provider: c.provider || "",
        year: c.year || "",
      })),
      professionalAffiliations: (cv.affiliations || []).map((a: any) => ({
        name: a.name || a.organization || "",
        role: a.role || "",
      })),
      metrics: [
        { value: String(cv.experience?.length || 0) + "+", label: "Years Experience" },
        { value: String((cv.skills || []).flatMap((s: any) => s.skills || []).length), label: "Skills" },
      ],
    };

    return NextResponse.json({ cv: mapped });
  } catch (e: any) {
    console.error("Gemini fetch error:", e.message);
    return NextResponse.json({ error: "Connection error" }, { status: 500 });
  }
}
