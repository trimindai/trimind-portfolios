// Server-secret bridge endpoint for the cv-bot thin client (Telegram now,
// WhatsApp later). Auth = `x-internal-secret: INTERNAL_API_SECRET` header; the
// Convex mutations re-verify the same secret. No Clerk session involved.
//
// Body: { action, externalUserId?, ... }. Owners are keyed on
// externalUserId = "tg:<telegram_id>" so a second channel slots in unchanged.
//
// NOT deployed — branch feat/cv-bot-bridge, awaiting owner review.

import { NextRequest, NextResponse } from "next/server";
import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { renderPortfolio } from "@/lib/render-portfolio";

// ponytail: bot.* mutations aren't in the committed generated api types yet
// (codegen runs on the owner's deploy). anyApi resolves the path at runtime.
const bot = (api as any).bot;

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-internal-secret") !== serverSecret()) return unauthorized();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const { action } = body || {};
  const secret = serverSecret();

  try {
    switch (action) {
      case "ensureOwner": {
        const userId = await convexClient.mutation(bot.getOrCreateBotOwner, {
          serverSecret: secret,
          externalUserId: body.externalUserId,
          email: body.email,
          name: body.name,
        });
        return NextResponse.json({ ok: true, userId });
      }

      case "create": {
        const portfolioId = await convexClient.mutation(bot.createForBot, {
          serverSecret: secret,
          userId: body.userId as Id<"users">,
          templateId: body.templateId,
          locale: body.locale ?? "en",
          name: body.name,
          basics: body.basics,
        });
        return NextResponse.json({ ok: true, portfolioId });
      }

      case "update":
      case "customize": {
        // Same mutation; `customize` is just an update carrying `customization`.
        await convexClient.mutation(bot.updateForBot, {
          serverSecret: secret,
          userId: body.userId as Id<"users">,
          portfolioId: body.portfolioId as Id<"portfolios">,
          patch: body.patch ?? {},
        });
        return NextResponse.json({ ok: true });
      }

      case "reserveSlug": {
        await convexClient.mutation(bot.reserveSlugForBot, {
          serverSecret: secret,
          userId: body.userId as Id<"users">,
          portfolioId: body.portfolioId as Id<"portfolios">,
          slug: body.slug,
        });
        return NextResponse.json({ ok: true, slug: body.slug });
      }

      case "markPaid": {
        // Defense-in-depth (IDOR fix): assert the caller owns this portfolio
        // before the id-scoped markPaid, mirroring the other actions.
        await convexClient.mutation(bot.getForBot, {
          serverSecret: secret,
          userId: body.userId as Id<"users">,
          portfolioId: body.portfolioId as Id<"portfolios">,
        });
        // MVP: real MyFatoorah flow is Clerk-gated and the bot can't drive it.
        // This confirms payment server-side via the existing id-scoped mutation.
        // NEVER markPaidByUser (it flips the wrong "latest draft" on replay).
        await convexClient.mutation(api.portfolios.markPaid, {
          id: body.portfolioId as Id<"portfolios">,
          paymentId: body.paymentId || `bot:${Date.now()}`,
          serverSecret: secret,
        });
        return NextResponse.json({ ok: true });
      }

      case "publish": {
        // Render HTML server-side from the STORED doc, then publish. The bot
        // never supplies markup — only the Next side renders it.
        const portfolio = await convexClient.mutation(bot.getForBot, {
          serverSecret: secret,
          userId: body.userId as Id<"users">,
          portfolioId: body.portfolioId as Id<"portfolios">,
        });
        if (!portfolio) return NextResponse.json({ error: "not_found" }, { status: 404 });
        const slug = body.slug as string;
        const locale = (portfolio.locale ?? "en") as "en" | "ar";
        const { generatedHtml, generatedProjectPages } = renderPortfolio(portfolio, slug, locale);
        await convexClient.mutation(bot.publishForBot, {
          serverSecret: secret,
          userId: body.userId as Id<"users">,
          portfolioId: body.portfolioId as Id<"portfolios">,
          slug,
          generatedHtml,
          generatedProjectPages,
        });
        return NextResponse.json({ ok: true, slug, url: `https://portfolio-trimind.com/p/${slug}` });
      }

      case "get": {
        const portfolio = await convexClient.mutation(bot.getForBot, {
          serverSecret: secret,
          userId: body.userId as Id<"users">,
          portfolioId: body.portfolioId as Id<"portfolios">,
        });
        return NextResponse.json({ ok: true, portfolio });
      }

      default:
        return NextResponse.json({ error: "unknown_action" }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    console.error("[bot/portfolio]", action, msg);
    // Map the user-actionable ones; everything else stays generic.
    if (msg.includes("Slug already taken")) return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    if (msg.includes("Invalid slug") || msg.includes("reserved")) return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
    if (msg.includes("not paid")) return NextResponse.json({ error: "payment_required" }, { status: 402 });
    if (msg.includes("Forbidden")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    return NextResponse.json({ error: "bridge_failed" }, { status: 500 });
  }
}
