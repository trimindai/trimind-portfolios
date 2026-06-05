// Seed / provisioning mutations for Abdulrahman Alkandari's real portfolio.
//
// Run order (from CLI, with CONVEX_DEPLOY_KEY set):
//   1. npx convex run seeds:provisionUser '{"clerkId":"user_...","email":"aak22xq8@gmail.com","name":"Abdulrahman Alkandari"}'
//   2. npx convex run seeds:seedAbdulrahman
//   3. npx convex run seeds:publishAbdulrahman '<rendered payload json>'
//
// All three are internalMutation = NOT reachable from clients (CLI/dashboard
// only). The portfolio is owned by Abdulrahman's own users row (resolved by
// email) so he can edit it after signing in with the same Clerk account.

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  ABDULRAHMAN_PORTFOLIO,
  ABDULRAHMAN_SLUG,
  ABDULRAHMAN_EMAIL,
} from "./seedData/abdulrahman";

/**
 * Upsert a `users` row for a pre-created Clerk account. Mirrors
 * users.upsertFromClerk but takes explicit args (no JWT in a CLI context).
 * Matching by clerkId guarantees that when the user later signs in,
 * upsertFromClerk finds THIS row and they see their seeded portfolio.
 */
export const provisionUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, email, name }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { email, name });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      createdAt: Date.now(),
    });
  },
});

/**
 * Insert (or idempotently update) Abdulrahman's engineer portfolio, owned by
 * HIS users row (resolved by email). Leaves status "paid"; publish happens in
 * publishAbdulrahman once the HTML is rendered in Node.
 */
export const seedAbdulrahman = internalMutation({
  args: {},
  handler: async (ctx) => {
    const owner = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", ABDULRAHMAN_EMAIL))
      .first();
    if (!owner) {
      throw new Error(
        `No users row for ${ABDULRAHMAN_EMAIL}. Run seeds:provisionUser first.`
      );
    }

    const data = {
      ...ABDULRAHMAN_PORTFOLIO,
      // deep mutable copies (the source object is declared `as const`)
      basics: { ...ABDULRAHMAN_PORTFOLIO.basics },
      education: ABDULRAHMAN_PORTFOLIO.education.map((e) => ({ ...e })),
      certifications: ABDULRAHMAN_PORTFOLIO.certifications.map((c) => ({ ...c })),
      skills: ABDULRAHMAN_PORTFOLIO.skills.map((s) => ({
        category: s.category,
        items: [...s.items],
      })),
      languages: ABDULRAHMAN_PORTFOLIO.languages.map((l) => ({ ...l })),
      projects: ABDULRAHMAN_PORTFOLIO.projects.map((p) =>
        JSON.parse(JSON.stringify(p))
      ),
      userId: owner._id,
      status: "paid" as const,
      lastEditedAt: Date.now(),
      createdAt: Date.now(),
    };

    const existing = await ctx.db
      .query("portfolios")
      .withIndex("by_slug", (q) => q.eq("slug", ABDULRAHMAN_SLUG))
      .first();

    if (existing) {
      const { createdAt: _ignored, ...patch } = data;
      await ctx.db.patch(existing._id, patch);
      return { portfolioId: existing._id, action: "updated" as const };
    }

    const portfolioId = await ctx.db.insert("portfolios", data);
    return { portfolioId, action: "inserted" as const };
  },
});

/**
 * Publish with HTML rendered in Node (renderers live in src/lib, not the
 * Convex runtime). Stores the main page + any project detail pages and flips
 * status to "published". After this, /p/abdulrahman-alkandari serves live
 * (its slug is allow-listed in HOSTING_ALLOW_SLUGS).
 */
export const publishAbdulrahman = internalMutation({
  args: {
    generatedHtml: v.string(),
    generatedProjectPages: v.optional(
      v.array(v.object({ slug: v.string(), html: v.string() }))
    ),
  },
  handler: async (ctx, { generatedHtml, generatedProjectPages }) => {
    const p = await ctx.db
      .query("portfolios")
      .withIndex("by_slug", (q) => q.eq("slug", ABDULRAHMAN_SLUG))
      .first();
    if (!p) {
      throw new Error(
        "seeds:seedAbdulrahman must run before publishAbdulrahman"
      );
    }
    await ctx.db.patch(p._id, {
      status: "published",
      slug: ABDULRAHMAN_SLUG,
      generatedHtml,
      generatedProjectPages: generatedProjectPages ?? [],
      publishedAt: Date.now(),
      lastEditedAt: Date.now(),
    });
    return { portfolioId: p._id, url: `/p/${ABDULRAHMAN_SLUG}` };
  },
});
