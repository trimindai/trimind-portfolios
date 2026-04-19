import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { renderCorporateTemplate } from "@/lib/template-engine";

// In-memory rate limit. Single-instance only (Vercel cold starts reset it).
// For multi-instance / production-grade, replace with Convex- or Redis-backed.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20; // 20 generations per minute per user
const hits = new Map<string, number[]>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(key, arr);
  return arr.length <= MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!rateLimit(userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const data = await req.json();
    const html = renderCorporateTemplate(data);
    return NextResponse.json({ html });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
