import { NextResponse } from "next/server";

// Lightweight availability probe for the builder's AI assistant.
// Reveals nothing but a boolean: the AI endpoints themselves stay auth-gated.
export async function GET() {
  const available = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json(
    { available },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
