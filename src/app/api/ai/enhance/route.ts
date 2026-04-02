import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const { text, context, field } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const isShort = field === "short";

    const prompt = `You are a professional resume and portfolio writing expert specializing in creating compelling content that sells candidates to hiring managers.

TASK: Enhance the following text for a professional portfolio.
CONTEXT: This is for the "${context}" section.
ORIGINAL TEXT: "${text}"

RULES:
- ${isShort ? "Keep it concise (max 10 words)" : "Keep it clear and impactful (2-4 sentences max)"}
- Fix any spelling or grammar errors
- Use strong, active language
- Make it results-oriented and quantified where possible
- Sound professional but not robotic
- Keep the same general meaning — enhance, don't fabricate
- Do NOT add quotes or markdown formatting
- Return ONLY the enhanced text, nothing else`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: isShort ? 50 : 300,
        },
      }),
    });

    const data = await response.json();
    const enhanced =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!enhanced) {
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error("AI enhance error:", error);
    return NextResponse.json(
      { error: "Enhancement failed" },
      { status: 500 }
    );
  }
}
