import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { convexClientForUser } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { toPortfolioData } from "@/lib/portfolio-data";
import { renderCvPdf } from "@/lib/template-engine";
import { portfolioQrDataUrl } from "@/lib/qr";
import { enforceUserRateLimit } from "@/lib/ratelimit";

// Chromium (bundled by @sparticuz) needs the full Node runtime, not edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Cold chromium launch + render can take a while on the first hit.
export const maxDuration = 60;

const LIVE_ORIGIN = "https://portfolio-trimind.com";

function liveUrlFor(portfolio: any): string {
  const slug =
    typeof portfolio?.slug === "string" && portfolio.slug.trim()
      ? portfolio.slug.trim()
      : null;
  return slug ? `${LIVE_ORIGIN}/p/${slug}` : `${LIVE_ORIGIN}/p/preview`;
}

/**
 * Server-side CV PDF download. The client "Download PDF" used to open a blob in
 * a new window and call print() — popup-blocked on mobile Safari/Chrome, so
 * paying users got a spinner and no file. This renders the SAME ATS CV HTML the
 * preview/print uses into a real PDF and returns it as a file download.
 *
 * Auth mirrors the preview page's `canDownload`: Convex `get` enforces
 * owner-or-admin; we additionally require paid/published (or admin) → else 402.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const locale = req.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceUserRateLimit(userId, "pdf-download", {
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) return limited;

  // Fetch as the caller — Convex `get` enforces owner-or-admin (throws/null
  // otherwise). We then gate on payment, exactly like the preview CTA.
  const userClient = await convexClientForUser();
  let portfolio: any;
  try {
    portfolio = await userClient.query(api.portfolios.get, {
      id: id as Id<"portfolios">,
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!portfolio) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = await userClient.query(api.users.isAdmin, {});
  if (
    !isAdmin &&
    portfolio.status !== "paid" &&
    portfolio.status !== "published"
  ) {
    return NextResponse.json({ error: "payment_required" }, { status: 402 });
  }

  const liveUrl = liveUrlFor(portfolio);
  const qrDataUrl = await portfolioQrDataUrl(liveUrl);
  const data = toPortfolioData(portfolio, locale);
  const html = renderCvPdf(data, { qrDataUrl, liveUrl });

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath()),
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
    // Wait for webfonts (QR + photo are inline data URLs, already ready) so text
    // isn't rendered in the fallback face.
    await page.evaluateHandle("document.fonts.ready");
    // preferCSSPageSize honours the template's `@page { size: A4; margin: 14mm }`
    // so the PDF matches the browser-print output the CV was tuned for.
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
    });

    const name = (portfolio.basics?.fullName || "cv")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cv";

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF render error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
