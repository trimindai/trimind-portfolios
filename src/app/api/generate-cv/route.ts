import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { renderCvPdf } from "@/lib/template-engine";
import { portfolioQrDataUrl } from "@/lib/qr";
import { enforceUserRateLimit } from "@/lib/ratelimit";
import { parseJsonBody } from "@/lib/api-input";

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

    const limited = await enforceUserRateLimit(userId, "render-cv", {
      limit: 20,
      windowMs: 60_000,
    });
    if (limited) return limited;

    // Full portfolio payload → larger cap, size-only (renderer reads the whole
    // object). 2 MB comfortably fits an inline base64 profile photo on top of a
    // near-1 MiB Convex doc; the old 512 KB cap rejected any portfolio with a
    // real photo as 413 → "Generation failed" in the preview.
    const parsed = await parseJsonBody(req, { maxBytes: 2 * 1024 * 1024 });
    if (!parsed.ok) return parsed.response;
    const data = parsed.data as any;

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
