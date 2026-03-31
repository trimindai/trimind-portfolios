import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    portfolioId: v.id("portfolios"),
    userId: v.optional(v.id("users")),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const markCompleted = mutation({
  args: {
    id: v.id("payments"),
    myfatoorahInvoiceId: v.string(),
  },
  handler: async (ctx, { id, myfatoorahInvoiceId }) => {
    await ctx.db.patch(id, {
      status: "completed",
      myfatoorahInvoiceId,
    });
  },
});

export const markFailed = mutation({
  args: { id: v.id("payments") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "failed" });
  },
});

export const getByPortfolio = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, { portfolioId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", portfolioId))
      .order("desc")
      .first();
  },
});

export const getByInvoice = query({
  args: { myfatoorahInvoiceId: v.string() },
  handler: async (ctx, { myfatoorahInvoiceId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_invoice", (q) =>
        q.eq("myfatoorahInvoiceId", myfatoorahInvoiceId)
      )
      .first();
  },
});
