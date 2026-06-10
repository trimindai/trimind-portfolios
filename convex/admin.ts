import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

export const getAllUsers = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").order("desc").collect();
    // Per-row admin flag for the dashboard badge — computed here so the
    // client never needs the allowlist itself.
    const allowlist = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return users.map((u) => ({
      ...u,
      isAdmin: !!u.email && allowlist.includes(u.email.toLowerCase()),
    }));
  },
});

export const getAllPortfolios = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("portfolios").order("desc").collect();
  },
});

export const getAllPayments = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("payments").order("desc").collect();
  },
});

export const getStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    const portfolios = await ctx.db.query("portfolios").collect();
    const payments = await ctx.db.query("payments").collect();

    const completedPayments = payments.filter((p) => p.status === "completed");
    const failedPayments = payments.filter((p) => p.status === "failed");
    const pendingPayments = payments.filter((p) => p.status === "pending");

    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    const publishedPortfolios = portfolios.filter((p) => p.status === "published");
    const paidPortfolios = portfolios.filter((p) => p.status === "paid");
    const draftPortfolios = portfolios.filter((p) => p.status === "draft");

    // Revenue by day (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentPayments = completedPayments.filter((p) => p.createdAt > thirtyDaysAgo);
    const revenueByDay: Record<string, number> = {};
    recentPayments.forEach((p) => {
      const day = new Date(p.createdAt).toISOString().split("T")[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + p.amount;
    });

    // Signups by day (last 30 days)
    const recentUsers = users.filter((u) => u.createdAt > thirtyDaysAgo);
    const signupsByDay: Record<string, number> = {};
    recentUsers.forEach((u) => {
      const day = new Date(u.createdAt).toISOString().split("T")[0];
      signupsByDay[day] = (signupsByDay[day] || 0) + 1;
    });

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    const newUsersThisWeek = users.filter((u) => u.createdAt > sevenDaysAgo).length;
    const abandonedPortfolios = draftPortfolios.filter(
      (p) => p.lastEditedAt < fortyEightHoursAgo
    ).length;
    const pendingRevenue = pendingPayments.length * 4.9;
    const avgPortfoliosPerUser = users.length > 0
      ? +(portfolios.length / users.length).toFixed(1)
      : 0;

    const funnelSteps: Record<number, number> = {};
    for (const p of portfolios) {
      const step = (p as any).lastCompletedStep ?? 0;
      funnelSteps[step] = (funnelSteps[step] || 0) + 1;
    }
    const paidReachedPreview = paidPortfolios.length + publishedPortfolios.length;

    return {
      totalUsers: users.length,
      totalPortfolios: portfolios.length,
      publishedCount: publishedPortfolios.length,
      paidCount: paidPortfolios.length,
      draftCount: draftPortfolios.length,
      totalRevenue,
      completedPayments: completedPayments.length,
      failedPayments: failedPayments.length,
      pendingPayments: pendingPayments.length,
      conversionRate: users.length > 0 ? Math.round((completedPayments.length / users.length) * 100) : 0,
      revenueByDay,
      signupsByDay,
      newUsersThisWeek,
      abandonedPortfolios,
      pendingRevenue,
      avgPortfoliosPerUser,
      funnelSteps,
      paidReachedPreview,
    };
  },
});

export const markPortfolioPaid = mutation({
  args: { id: v.id("portfolios") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const portfolio = await ctx.db.get(id);
    if (!portfolio) throw new Error("Portfolio not found");
    if (portfolio.status === "paid" || portfolio.status === "published") return;
    await ctx.db.patch(id, {
      status: "paid",
      paymentId: "admin-grant",
      lastEditedAt: Date.now(),
    });
  },
});

export const deletePortfolio = mutation({
  args: { id: v.id("portfolios") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const portfolio = await ctx.db.get(id);
    if (!portfolio) throw new Error("Portfolio not found");
    // Also delete related payments
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", id))
      .collect();
    for (const p of payments) {
      await ctx.db.delete(p._id);
    }
    await ctx.db.delete(id);
  },
});

export const updatePortfolioStatus = mutation({
  args: {
    id: v.id("portfolios"),
    status: v.union(v.literal("draft"), v.literal("paid"), v.literal("published")),
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    const portfolio = await ctx.db.get(id);
    if (!portfolio) throw new Error("Portfolio not found");
    await ctx.db.patch(id, { status, lastEditedAt: Date.now() });
  },
});
