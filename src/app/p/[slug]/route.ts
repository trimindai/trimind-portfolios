import { NextRequest } from "next/server";
import { convexClient } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { HOSTING_ENABLED } from "@/lib/flags";

/**
 * Branded "hosting paused" page. Shown for every /p/<slug> request while
 * HOSTING_ENABLED is false, so no live portfolio is publicly served during
 * the template-finishing phase.
 */
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Hosting kill-switch: never serve live portfolios while disabled.
  if (!HOSTING_ENABLED) {
    return hostingPausedResponse();
  }

  try {
    const portfolio = await convexClient.query(api.portfolios.getBySlug, {
      slug,
    });

    if (!portfolio || portfolio.status !== "published" || !portfolio.generatedHtml) {
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
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #e2e8f0;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 4rem; font-weight: 700; color: #10b981; }
    p { margin-top: 1rem; font-size: 1.125rem; color: #94a3b8; }
    a {
      display: inline-block;
      margin-top: 2rem;
      padding: 0.75rem 1.5rem;
      background: #10b981;
      color: white;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;
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
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }

    return new Response(portfolio.generatedHtml, {
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
