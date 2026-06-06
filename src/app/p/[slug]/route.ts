import { NextRequest } from "next/server";
import { convexClient } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { isHostingEnabledForSlug } from "@/lib/flags";

const SITE_URL = "https://portfolio-trimind.com";

function hostingPausedResponse() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a; color: #e2e8f0;
    }
    .container { text-align: center; padding: 2rem; max-width: 32rem; }
    h1 { font-size: 2.5rem; font-weight: 700; color: #10b981; }
    p { margin-top: 1rem; font-size: 1.05rem; color: #94a3b8; line-height: 1.6; }
    a {
      display: inline-block; margin-top: 2rem; padding: 0.75rem 1.5rem;
      background: #10b981; color: white; border-radius: 0.5rem;
      text-decoration: none; font-weight: 500; transition: background 0.2s;
    }
    a:hover { background: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Coming soon</h1>
    <p>Live portfolio hosting is temporarily paused while we put the finishing touches on our templates. You can still build your portfolio and download it as a PDF.</p>
    <a href="/">Build your portfolio</a>
  </div>
</body>
</html>`,
    {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "86400",
        "Cache-Control": "no-store",
      },
    }
  );
}

function notFoundResponse() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portfolio Not Found</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a; color: #e2e8f0;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 4rem; font-weight: 700; color: #10b981; }
    p { margin-top: 1rem; font-size: 1.125rem; color: #94a3b8; }
    a {
      display: inline-block; margin-top: 2rem; padding: 0.75rem 1.5rem;
      background: #10b981; color: white; border-radius: 0.5rem;
      text-decoration: none; font-weight: 500; transition: background 0.2s;
    }
    a:hover { background: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>This portfolio does not exist or has not been published yet.</p>
    <a href="/">Create Your Portfolio</a>
  </div>
</body>
</html>`,
    {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

function injectOgTags(html: string, portfolio: { basics: { fullName: string; title: string; bio?: string }; slug: string }) {
  const title = `${portfolio.basics.fullName} — ${portfolio.basics.title}`;
  const description = portfolio.basics.bio?.slice(0, 160) || `${portfolio.basics.fullName}'s professional portfolio`;
  const url = `${SITE_URL}/p/${portfolio.slug}`;

  const ogTags = `
    <meta property="og:title" content="${title.replace(/"/g, "&quot;")}" />
    <meta property="og:description" content="${description.replace(/"/g, "&quot;")}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="Portfolio Pro" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title.replace(/"/g, "&quot;")}" />
    <meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}" />
    <meta name="description" content="${description.replace(/"/g, "&quot;")}" />
    <link rel="canonical" href="${url}" />`;

  // The generated template already emits a <meta name="description">; strip it
  // so we don't ship two competing description tags (we inject the bio-based one
  // above as the single source of truth).
  const cleaned = html.replace(
    /\s*<meta\s+name=["']description["'][^>]*>/gi,
    ""
  );

  return cleaned.replace("</head>", `${ogTags}\n</head>`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const portfolio = await convexClient.query(api.portfolios.getBySlug, { slug });

    // Nonexistent / unpublished slug → real 404, regardless of the hosting flag.
    // Previously the !HOSTING_ENABLED gate short-circuited to the 503 "coming
    // soon" page for ANY slug, so missing portfolios wrongly returned 503.
    if (!portfolio || portfolio.status !== "published" || !portfolio.generatedHtml) {
      return notFoundResponse();
    }

    // A real published portfolio exists, but live hosting is temporarily paused.
    // Allow-listed slugs (real candidates' QR targets) serve live regardless.
    if (!isHostingEnabledForSlug(slug)) {
      return hostingPausedResponse();
    }

    // Increment view count (fire-and-forget)
    convexClient.mutation(api.portfolios.incrementViews, { slug }).catch(() => {});

    const html = injectOgTags(portfolio.generatedHtml, {
      basics: portfolio.basics,
      slug: portfolio.slug!,
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
