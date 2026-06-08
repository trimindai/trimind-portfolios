// Durable, server-to-server rate limiting backed by Convex.
//
// Why this exists: the AI/render API routes previously used in-memory Map
// counters. On Vercel Fluid Compute those are PER-INSTANCE and reset on cold
// start, so they never actually limited anything across instances — a real
// cost/abuse hole on the Gemini routes. Convex mutations are serializable
// transactions, so the read-modify-write below is race-safe even when the same
// user fires many concurrent requests against different serverless instances.

import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { verifyServerSecret } from "./auth";

/**
 * Server-only: count one request against `key` using a fixed window of
 * `windowMs`, allowing at most `limit` requests per window.
 *
 * Returns `{ ok, remaining, retryAfterMs }`. `ok` is false when the caller is
 * over the limit; `retryAfterMs` is how long until the current window resets.
 *
 * Gated by INTERNAL_API_SECRET so only our own server routes can write counters
 * (the browser must never reach this directly).
 */
export const consume = mutation({
  args: {
    key: v.string(),
    limit: v.number(),
    windowMs: v.number(),
    serverSecret: v.string(),
  },
  handler: async (ctx, { key, limit, windowMs, serverSecret }) => {
    verifyServerSecret(serverSecret);
    const now = Date.now();

    const row = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    // First hit, or the previous window has fully elapsed → start fresh.
    if (!row || now - row.windowStart >= windowMs) {
      if (row) {
        await ctx.db.patch(row._id, { windowStart: now, count: 1 });
      } else {
        await ctx.db.insert("rateLimits", { key, windowStart: now, count: 1 });
      }
      return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
    }

    // Inside the current window but already at the cap → reject.
    if (row.count >= limit) {
      return {
        ok: false,
        remaining: 0,
        retryAfterMs: row.windowStart + windowMs - now,
      };
    }

    // Inside the window and under the cap → count this request and allow.
    await ctx.db.patch(row._id, { count: row.count + 1 });
    return { ok: true, remaining: limit - (row.count + 1), retryAfterMs: 0 };
  },
});

/**
 * Cron-only: delete counter rows whose window started over 24h ago. Active keys
 * are rewritten every request so they never get purged; only abandoned keys
 * (one-off users) are reclaimed. Keeps the table at ~the active-user count.
 */
export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const stale = await ctx.db
      .query("rateLimits")
      .withIndex("by_window", (q) => q.lt("windowStart", cutoff))
      .take(1000); // bound work per run; the daily cadence catches the rest
    for (const row of stale) {
      await ctx.db.delete(row._id);
    }
    return { deleted: stale.length };
  },
});
