import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set");
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fullName, professionalTitle, location, userNotes } = body;

  if (!fullName || !professionalTitle) {
    return NextResponse.json(
      { error: "fullName and professionalTitle are required" },
      { status: 400 }
    );
  }

  const userNotesSection = userNotes?.trim()
    ? `\nAdditional context from the user (use as primary source of truth):\n${userNotes.trim()}\n`
    : "";

  const prompt = `You are a professional CV writer for the Gulf job market (Kuwait, Saudi Arabia, UAE).
Generate a COMPLETE structured CV for this person as JSON.

CRITICAL RULES:
- Return ONLY valid JSON — no markdown, no backticks, no explanation
- All text in English unless the name suggests Arabic (then note bilingual)
- Use realistic, professional content appropriate for the Gulf market
- If the user's notes mention a specific profession, use that EXACT profession
- Do NOT use cliches: "results-driven", "passionate", "dynamic", "seasoned"
- Generate 2-3 experience entries, 3-4 skill categories, 1-2 education entries
- All dates as years (e.g. "2019", "2022")
- Keep summary to 2-3 complete sentences
${userNotesSection}
Person:
Name: ${fullName}
Title: ${professionalTitle}
Location: ${location ?? "Kuwait"}

Return this EXACT JSON structure:
{
  "basics": {
    "fullName": "${fullName}",
    "title": "${professionalTitle}",
    "subtitle": "one-line tagline",
    "bio": "2-3 sentence professional summary",
    "summary": "same as bio (copy it)",
    "location": "${location ?? "Kuwait"}",
    "email": "professional@email.com"
  },
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "startDate": "2020",
      "endDate": "Present",
      "description": "brief role description",
      "highlights": ["achievement 1 with numbers", "achievement 2 with numbers"]
    }
  ],
  "skills": [
    { "category": "Technical Skills", "items": ["skill1", "skill2", "skill3"] },
    { "category": "Soft Skills", "items": ["skill1", "skill2"] }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "university name",
      "year": "2016",
      "description": ""
    }
  ],
  "certifications": [
    { "name": "cert name", "issuer": "issuer", "year": "2022" }
  ],
  "languages": [
    { "name": "Arabic", "level": "Native" },
    { "name": "English", "level": "Fluent" }
  ],
  "metrics": [
    { "value": "8+", "label": "Years Experience" },
    { "value": "20+", "label": "Projects Delivered" }
  ]
}`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
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
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      console.error("Empty Gemini response:", JSON.stringify(data));
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    let cv: any;
    try {
      cv = JSON.parse(text);
    } catch {
      console.error("Gemini returned invalid JSON:", text.slice(0, 500));
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

    if (!cv.basics?.fullName || !cv.basics?.title) {
      return NextResponse.json({ error: "AI returned incomplete data" }, { status: 500 });
    }

    return NextResponse.json({ cv });
  } catch (e: any) {
    console.error("Gemini fetch error:", e.message);
    return NextResponse.json({ error: "Connection error" }, { status: 500 });
  }
}
