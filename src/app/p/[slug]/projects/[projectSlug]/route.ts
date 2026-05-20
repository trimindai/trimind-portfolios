import { NextRequest } from "next/server";
import { convexClient } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { renderEngineerProjectDetail } from "@/lib/template-engine";

function notFound(): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Project Not Found</title>
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
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>This project does not exist or its portfolio is not yet published.</p>
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; projectSlug: string }> }
) {
  const { slug, projectSlug } = await params;

  try {
    const portfolio = await convexClient.query(api.portfolios.getBySlug, {
      slug,
    });

    if (!portfolio || portfolio.status !== "published") {
      return notFound();
    }

    // Prefer pre-rendered HTML from publish time.
    const cached = portfolio.generatedProjectPages?.find(
      (p) => p.slug === projectSlug
    );
    if (cached) {
      return new Response(cached.html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Fallback: render on the fly (covers portfolios published before this
    // feature shipped, or any case where publish-time render was skipped).
    if (portfolio.templateId !== "engineer") {
      return notFound();
    }

    const html = renderEngineerProjectDetail(
      {
        ...portfolio,
        locale: portfolio.locale,
        isRTL: portfolio.locale === "ar",
        portfolioUrl: `/p/${slug}`,
        slug,
      } as any,
      projectSlug
    );

    if (!html) return notFound();

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching project detail:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
