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

  const { fullName, professionalTitle, location, totalYearsExperience, mostRecentRole, mostRecentCompany, topSkills, notableAchievement, highestEducation } = body;

  if (!fullName || !professionalTitle) {
    return NextResponse.json({ error: "fullName and professionalTitle are required" }, { status: 400 });
  }

  const prompt = `Write a professional CV summary for this person.
Return ONLY the summary text — no labels, no quotes, no explanation, no markdown.

Rules:
- 2-3 sentences maximum
- Start with job title and years of experience
- Mention 1-2 specific skills or achievements if available
- End with the value they bring to employers
- Professional tone, active voice
- Do NOT use: "results-driven", "passionate", "dynamic", "seasoned"
- Context: Gulf job market (Kuwait / Saudi Arabia / UAE)
- If name appears Arabic and title is in English, mention bilingual capability naturally

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
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
