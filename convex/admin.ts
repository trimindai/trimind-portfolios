import { query } from "./_generated/server";

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").collect();
  },
});

export const getAllPortfolios = query({
  handler: async (ctx) => {
    return await ctx.db.query("portfolios").order("desc").collect();
  },
});

export const getAllPayments = query({
  handler: async (ctx) => {
    return await ctx.db.query("payments").order("desc").collect();
  },
});

export const getStats = query({
  handler: async (ctx) => {
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
    };
  },
});
