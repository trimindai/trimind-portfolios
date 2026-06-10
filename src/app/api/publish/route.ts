import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { convexClientForUser, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { toPortfolioData } from "@/lib/portfolio-data";
import { resolveTemplateId } from "@/lib/templates";
import {
  renderGeneralTemplate,
  renderEngineerTemplate,
  renderCreativeTemplate,
  renderCreatorTemplate,
  renderDeveloperTemplate,
  renderAllProjectDetailPages,
} from "@/lib/template-engine";
import { enforceUserRateLimit } from "@/lib/ratelimit";
import { parseJsonBody } from "@/lib/api-input";

const PublishSchema = z.object({
  portfolioId: z.string().min(1).max(64),
  slug: z.string().min(1).max(100),
  locale: z.enum(["en", "ar"]).default("en"),
});

/**
 * Server-side publish: renders the portfolio HTML here, from the portfolio as
 * stored in Convex, and stores it via the server-secret-gated `publish`
 * mutation. The browser never supplies HTML — previously it did, which let a
 * paid user publish arbitrary markup served on portfolio-trimind.com (stored
 * XSS / hosted-content abuse).
 *
 * Ownership + payment gate + slug checks all stay inside the Convex mutation
 * (called with the user's JWT, so requireAdminOrOwner sees the real caller).
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await enforceUserRateLimit(userId, "publish", {
      limit: 10,
      windowMs: 60_000,
    });
    if (limited) return limited;

    const parsed = await parseJsonBody(req, {
      schema: PublishSchema,
      maxBytes: 4 * 1024,
    });
    if (!parsed.ok) return parsed.response;
    const { portfolioId, slug, locale } = parsed.data;

    // Fetch as the caller — Convex `get` enforces owner-or-admin.
    const userClient = await convexClientForUser();
    const portfolio = await userClient.query(api.portfolios.get, {
      id: portfolioId as Id<"portfolios">,
    });
    if (!portfolio) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Render from STORED data (with the slug being published), never from the
    // request body.
    const data = toPortfolioData({ ...portfolio, slug }, locale);
    const templateId = resolveTemplateId(data.templateId);
    const renderers: Record<string, (d: any) => string> = {
      general: renderGeneralTemplate,
      engineer: renderEngineerTemplate,
      creative: renderCreativeTemplate,
      creator: renderCreatorTemplate,
      developer: renderDeveloperTemplate,
    };
    const render = renderers[templateId] || renderGeneralTemplate;
    const generatedHtml = render(data);
    const generatedProjectPages = renderAllProjectDetailPages({
      ...data,
      slug,
    });

    await userClient.mutation(api.portfolios.publish, {
      id: portfolioId as Id<"portfolios">,
      slug,
      generatedHtml,
      generatedProjectPages,
      serverSecret: serverSecret(),
    });

    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";
    console.error("[publish] error:", error);
    // Map the known user-actionable Convex errors to clean client messages;
    // everything else stays generic (no internals leak).
    if (raw.includes("Slug already taken")) {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }
    if (raw.includes("not paid")) {
      return NextResponse.json({ error: "payment_required" }, { status: 402 });
    }
    if (raw.includes("Unauthorized") || raw.includes("Unauthenticated")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ error: "publish_failed" }, { status: 500 });
  }
}
