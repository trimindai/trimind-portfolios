import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwner, verifyServerSecret } from "./auth";

/**
 * Server-only: create a pending payment record. Called by the MyFatoorah
 * `initiate` route after verifying portfolio ownership.
 */
export const create = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    userId: v.optional(v.id("users")),
    amount: v.number(),
    tier: v.optional(
      v.union(v.literal("essential"), v.literal("pro"), v.literal("pro_review"))
    ),
    currency: v.string(),
    myfatoorahInvoiceId: v.optional(v.string()),
    serverSecret: v.string(),
  },
  handler: async (ctx, { serverSecret, ...args }) => {
    verifyServerSecret(serverSecret);
    // Cross-check userId against portfolio owner
    if (args.userId) {
      const portfolio = await ctx.db.get(args.portfolioId);
      if (portfolio?.userId && portfolio.userId !== args.userId) {
        throw new Error("userId does not match portfolio owner");
      }
    }
    return await ctx.db.insert("payments", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/** Server-only: mark a payment completed after MyFatoorah callback verification. */
export const markCompleted = mutation({
  args: {
    id: v.id("payments"),
    myfatoorahInvoiceId: v.string(),
    serverSecret: v.string(),
  },
  handler: async (ctx, { id, myfatoorahInvoiceId, serverSecret }) => {
    verifyServerSecret(serverSecret);
    const payment = await ctx.db.get(id);
    if (!payment) throw new Error("Payment not found");
    if (payment.myfatoorahInvoiceId && payment.myfatoorahInvoiceId !== myfatoorahInvoiceId) {
      throw new Error("Invoice ID mismatch");
    }
    await ctx.db.patch(id, {
      status: "completed",
      myfatoorahInvoiceId,
    });
  },
});

/** Server-only: mark a payment failed after MyFatoorah callback verification. */
export const markFailed = mutation({
  args: { id: v.id("payments"), serverSecret: v.string() },
  handler: async (ctx, { id, serverSecret }) => {
    verifyServerSecret(serverSecret);
    await ctx.db.patch(id, { status: "failed" });
  },
});

/**
 * Owner-scoped: returns the most recent payment for a portfolio the caller owns.
 */
export const getByPortfolio = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, { portfolioId }) => {
    await requireOwner(ctx, portfolioId);
    return await ctx.db
      .query("payments")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .order("desc")
      .first();
  },
});

/**
 * Server-only: lookup a payment by MyFatoorah invoice id, used by the
 * callback route for idempotency. Requires the server secret.
 */
export const getByInvoice = query({
  args: { myfatoorahInvoiceId: v.string(), serverSecret: v.string() },
  handler: async (ctx, { myfatoorahInvoiceId, serverSecret }) => {
    verifyServerSecret(serverSecret);
    return await ctx.db
      .query("payments")
      .withIndex("by_invoice", (q) =>
        q.eq("myfatoorahInvoiceId", myfatoorahInvoiceId)
      )
      .first();
  },
});

/**
 * Server-only: all payments still in `pending`. Used by the cron and admin
 * reconcilers. (The cron previously called the admin-gated getAllPayments
 * with an anonymous client and always threw Unauthenticated.)
 */
export const listPending = query({
  args: { serverSecret: v.string() },
  handler: async (ctx, { serverSecret }) => {
    verifyServerSecret(serverSecret);
    const all = await ctx.db.query("payments").collect();
    return all.filter((p) => p.status === "pending");
  },
});

/**
 * Server-only: status counts for /api/admin/payment-health.
 */
export const statusCounts = query({
  args: { serverSecret: v.string() },
  handler: async (ctx, { serverSecret }) => {
    verifyServerSecret(serverSecret);
    const all = await ctx.db.query("payments").collect();
    const counts = { pending: 0, completed: 0, failed: 0, other: 0 };
    let oldestPendingAt: number | null = null;
    for (const p of all) {
      if (p.status === "pending") {
        counts.pending++;
        if (oldestPendingAt === null || p.createdAt < oldestPendingAt) {
          oldestPendingAt = p.createdAt;
        }
      } else if (p.status === "completed") counts.completed++;
      else if (p.status === "failed") counts.failed++;
      else counts.other++;
    }
    return { ...counts, total: all.length, oldestPendingAt };
  },
});
