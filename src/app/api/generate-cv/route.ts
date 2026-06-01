import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { renderCvPdf } from "@/lib/template-engine";
import { portfolioQrDataUrl } from "@/lib/qr";

// In-memory rate limit. Single-instance only (Vercel cold starts reset it).
// Mirrors /api/generate; for multi-instance, back this with Convex/Redis.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20; // 20 CV renders per minute per user
const hits = new Map<string, number[]>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(key, arr);
  return arr.length <= MAX_PER_WINDOW;
}

/** The live portfolio is hosted under this origin; the QR resolves here. */
const LIVE_ORIGIN = "https://portfolio-trimind.com";

/**
 * Derive the candidate's live portfolio URL from the request body.
 * Prefers an explicit `slug`, then the precomputed `portfolioUrl`
 * (set by `toPortfolioData`), and finally falls back to a preview path.
 */
function liveUrlFor(data: any): string {
  const slug =
    typeof data?.slug === "string" && data.slug.trim() ? data.slug.trim() : null;
  if (slug) return `${LIVE_ORIGIN}/p/${slug}`;
  if (typeof data?.portfolioUrl === "string" && data.portfolioUrl.trim()) {
    return data.portfolioUrl.trim();
  }
  return `${LIVE_ORIGIN}/p/preview`;
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
    const liveUrl = liveUrlFor(data);
    const qrDataUrl = await portfolioQrDataUrl(liveUrl);
    const html = renderCvPdf(data, { qrDataUrl, liveUrl });
    return NextResponse.json({ html });
  } catch (error) {
    console.error("CV generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CV" },
      { status: 500 }
    );
  }
}
