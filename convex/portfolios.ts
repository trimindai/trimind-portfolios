import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, requireOwner, verifyServerSecret } from "./auth";

const basicsValidator = v.object({
  fullName: v.string(),
  title: v.string(),
  subtitle: v.optional(v.string()),
  bio: v.optional(v.string()),
  valueProposition: v.optional(v.string()),
  location: v.optional(v.string()),
  nationality: v.optional(v.string()),
  visaStatus: v.optional(v.string()),
  email: v.string(),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  github: v.optional(v.string()),
  photoUrl: v.optional(v.string()),
});

const customizationValidator = v.optional(
  v.object({
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    bgColor: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    bodyFont: v.optional(v.string()),
    hiddenSections: v.optional(v.array(v.string())),
  })
);

export const create = mutation({
  args: {
    templateId: v.string(),
    locale: v.union(v.literal("en"), v.literal("ar")),
    name: v.string(),
    basics: basicsValidator,
  },
  handler: async (ctx, args) => {
    // Auth: derive userId from session, never trust client.
    const user = await requireUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("portfolios", {
      ...args,
      userId: user._id,
      status: "draft",
      lastEditedAt: now,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("portfolios"),
    basics: v.optional(basicsValidator),
    metrics: v.optional(
      v.array(v.object({ value: v.string(), label: v.string() }))
    ),
    experience: v.optional(
      v.array(
        v.object({
          title: v.string(),
          company: v.string(),
          startDate: v.string(),
          endDate: v.optional(v.string()),
          description: v.optional(v.string()),
          highlights: v.optional(v.array(v.string())),
        })
      )
    ),
    skills: v.optional(
      v.array(v.object({ category: v.string(), items: v.array(v.string()) }))
    ),
    projects: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.string(),
          technologies: v.optional(v.array(v.string())),
          metrics: v.optional(
            v.array(v.object({ value: v.string(), label: v.string() }))
          ),
          link: v.optional(v.string()),
          isFeatured: v.optional(v.boolean()),
        })
      )
    ),
    education: v.optional(
      v.array(
        v.object({
          degree: v.string(),
          institution: v.string(),
          year: v.string(),
          description: v.optional(v.string()),
        })
      )
    ),
    certifications: v.optional(
      v.array(
        v.object({
          name: v.string(),
          issuer: v.string(),
          year: v.optional(v.string()),
        })
      )
    ),
    languages: v.optional(
      v.array(v.object({ name: v.string(), level: v.string() }))
    ),
    endorsements: v.optional(
      v.array(
        v.object({
          quote: v.string(),
          name: v.string(),
          title: v.string(),
          company: v.string(),
        })
      )
    ),
    professionalAffiliations: v.optional(
      v.array(
        v.object({
          name: v.string(),
          role: v.optional(v.string()),
        })
      )
    ),
    continuousDevelopment: v.optional(
      v.array(
        v.object({
          name: v.string(),
          provider: v.optional(v.string()),
          year: v.optional(v.string()),
        })
      )
    ),
    customization: customizationValidator,
    contentAr: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    // Auth + ownership: caller must own this portfolio.
    await requireOwner(ctx, id);
    await ctx.db.patch(id, {
      ...fields,
      lastEditedAt: Date.now(),
    });
  },
});

/**
 * Server-only: marks a portfolio as paid after a verified MyFatoorah callback
 * OR after a verified free-access grant. NOT callable from the browser.
 *
 * Caller must pass INTERNAL_API_SECRET (matches process.env.INTERNAL_API_SECRET).
 */
export const markPaid = mutation({
  args: {
    id: v.id("portfolios"),
    paymentId: v.string(),
    serverSecret: v.string(),
  },
  handler: async (ctx, { id, paymentId, serverSecret }) => {
    verifyServerSecret(serverSecret);
    const portfolio = await ctx.db.get(id);
    if (!portfolio) throw new Error("Portfolio not found");
    // Idempotent: if already paid/published, do nothing.
    if (portfolio.status === "paid" || portfolio.status === "published") {
      return;
    }
    await ctx.db.patch(id, {
      status: "paid",
      paymentId,
      lastEditedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { id: v.id("portfolios") },
  handler: async (ctx, { id }) => {
    // Returns the portfolio only if the caller owns it.
    // Public viewing happens through `getBySlug` for published portfolios.
    await requireOwner(ctx, id);
    return await ctx.db.get(id);
  },
});

/**
 * Public: returns a published portfolio by slug. Used by /p/[slug].
 * Only returns portfolios that have been actually published — drafts and paid
 * (but unpublished) portfolios are invisible.
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!portfolio || portfolio.status !== "published") return null;
    return portfolio;
  },
});

/**
 * Authenticated: check if a slug is taken (by ANY portfolio, including drafts).
 * Used by the publish form to validate slug availability before payment.
 *
 * Returns the owning portfolio's `_id` if taken, or null if free. We never
 * return the full portfolio doc — only enough to let the caller detect
 * "this is mine" vs "someone else has it".
 */
export const isSlugTaken = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    await requireUser(ctx);
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    return portfolio ? { ownerPortfolioId: portfolio._id } : null;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    // Always returns ONLY the caller's portfolios — never accept a userId arg.
    const user = await requireUser(ctx);
    return await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const publish = mutation({
  args: {
    id: v.id("portfolios"),
    slug: v.string(),
    generatedHtml: v.string(),
  },
  handler: async (ctx, { id, slug, generatedHtml }) => {
    // Auth + ownership.
    const { portfolio } = await requireOwner(ctx, id);

    // Slug shape: lowercase letters, digits, hyphens, 3-40 chars.
    if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) {
      throw new Error(
        "Invalid slug. Use 3-40 lowercase letters, digits, or hyphens."
      );
    }
    // Reserved slugs that collide with app routes.
    const reserved = new Set([
      "admin",
      "api",
      "dashboard",
      "sign-in",
      "sign-up",
      "p",
      "privacy",
      "terms",
      "refund",
      "templates",
    ]);
    if (reserved.has(slug)) throw new Error("Slug is reserved");

    // Payment gate: only paid (or already-published re-publish) may publish.
    if (portfolio.status !== "paid" && portfolio.status !== "published") {
      throw new Error("Portfolio is not paid");
    }

    const existing = await ctx.db
      .query("portfolios")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing && existing._id !== id) {
      throw new Error("Slug already taken");
    }

    await ctx.db.patch(id, {
      slug,
      generatedHtml,
      status: "published",
      publishedAt: Date.now(),
      lastEditedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("portfolios") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx, id);
    await ctx.db.delete(id);
  },
});
