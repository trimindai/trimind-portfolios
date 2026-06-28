// Free-tier lifetime AI budget.
//
// The per-user DAILY rate limits (convex/rateLimit.ts) keep a PAID user's AI
// cost to a tiny fraction of what they paid. This file handles the other case:
// a logged-in user who has NEVER paid for a portfolio. Without a cap they could
// spend Gemini/OpenRouter budget every single day forever at a net loss.
//
// Each AI route "charges" a free user some credits (heavier model calls cost
// more — see src/lib/freeTier.ts AI_COST). Once the lifetime pool is gone, AI
// actions return 402 until they buy a tier. The pool is sized for ~two full CV
// builds — enough to try the product, not enough to farm it. Paid users (any
// portfolio in status paid/published) are exempt entirely.

import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { verifyServerSecret } from "./auth";

// Single knob. One comfortable build (~1 parse + 1 full-CV + a few summaries +
// a dozen chats) costs roughly 35-40 credits at the route weights, so 80 gives
// about two builds' worth of trial. Raise/lower to taste.
export const FREE_AI_CREDIT_BUDGET = 80;

/** Pure budget decision (no DB) so the money math is unit-testable. A charge is
 *  allowed only if it keeps total spend within the pool. */
export function withinBudget(used: number, cost: number, budget: number): boolean {
  return used + cost <= budget;
}

/**
 * Server-only (INTERNAL_API_SECRET gated). Charges `cost` credits against the
 * free-tier pool for the Clerk user `clerkId`.
 *
 * Returns `{ ok, exempt, used, budget }`:
 *  - paid user        → { ok: true,  exempt: true }  (nothing charged)
 *  - within budget    → { ok: true,  exempt: false } (charged, freeAiCredits++)
 *  - over budget      → { ok: false, exempt: false } (NOT charged; caller 402s)
 *
 * Convex mutations are serializable, so the read-check-write is race-safe even
 * under concurrent requests from the same user.
 */
export const consumeFreeCredits = mutation({
  args: {
    clerkId: v.string(),
    cost: v.number(),
    serverSecret: v.string(),
  },
  handler: async (ctx, { clerkId, cost, serverSecret }) => {
    verifyServerSecret(serverSecret);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    // No user row yet (first action before provisioning lands). Nothing to farm
    // yet and the daily cap still applies — don't block.
    if (!user) {
      return { ok: true, exempt: true, used: 0, budget: FREE_AI_CREDIT_BUDGET };
    }

    // Paid users are exempt: they bought a tier and the daily caps protect us.
    const paid =
      (await ctx.db
        .query("portfolios")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", "paid")
        )
        .first()) ??
      (await ctx.db
        .query("portfolios")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", "published")
        )
        .first());
    const used = user.freeAiCredits ?? 0;
    if (paid) {
      return { ok: true, exempt: true, used, budget: FREE_AI_CREDIT_BUDGET };
    }

    if (!withinBudget(used, cost, FREE_AI_CREDIT_BUDGET)) {
      return { ok: false, exempt: false, used, budget: FREE_AI_CREDIT_BUDGET };
    }
    await ctx.db.patch(user._id, { freeAiCredits: used + cost });
    return {
      ok: true,
      exempt: false,
      used: used + cost,
      budget: FREE_AI_CREDIT_BUDGET,
    };
  },
});
