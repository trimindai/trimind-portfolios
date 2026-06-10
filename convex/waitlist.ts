// Template waitlist — captures emails from the landing page "coming soon"
// card (previously a mailto: link, which converted poorly).
//
// Writes go through /api/waitlist (IP rate limit + validation) and reach
// `join` with the server secret; the browser never calls this directly.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, verifyServerSecret } from "./auth";

/** Server-only: add an email to the waitlist. Idempotent on email. */
export const join = mutation({
  args: {
    email: v.string(),
    locale: v.union(v.literal("en"), v.literal("ar")),
    source: v.optional(v.string()),
    serverSecret: v.string(),
  },
  handler: async (ctx, { email, locale, source, serverSecret }) => {
    verifyServerSecret(serverSecret);

    const normalized = email.trim().toLowerCase();
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (existing) {
      return { ok: true, already: true };
    }

    await ctx.db.insert("waitlist", {
      email: normalized,
      locale,
      source,
      createdAt: Date.now(),
    });
    return { ok: true, already: false };
  },
});

/** Admin: full waitlist, newest first (admin panel Overview). */
export const listAll = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("waitlist").order("desc").collect();
  },
});
