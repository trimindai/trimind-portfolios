// Server-secret bridge for the cv-bot (and future WhatsApp) thin client.
// Every mutation here is server-to-server only: it verifies INTERNAL_API_SECRET
// and re-checks ownership itself, skipping Clerk (the bot has no JWT). Owners
// are keyed by `external_user_id` (e.g. "tg:<telegram_id>") stored in
// users.clerkId — collision-proof vs real Clerk "user_..." ids.
//
// NOT deployed — lives on branch feat/cv-bot-bridge awaiting owner review.

import { v } from "convex/values";
import { mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { verifyServerSecret } from "./auth";

// ── basics validator (mirrors portfolios.ts / schema.ts) ────────────────────
const basicsValidator = v.object({
  fullName: v.string(),
  title: v.string(),
  subtitle: v.optional(v.string()),
  bio: v.optional(v.string()),
  summary: v.optional(v.string()),
  valueProposition: v.optional(v.string()),
  location: v.optional(v.string()),
  nationality: v.optional(v.string()),
  visaStatus: v.optional(v.string()),
  email: v.string(),
  phone: v.optional(v.string()),
  website: v.optional(v.string()),
  linkedin: v.optional(v.string()),
  github: v.optional(v.string()),
  instagram: v.optional(v.string()),
  youtube: v.optional(v.string()),
  tiktok: v.optional(v.string()),
  photoUrl: v.optional(v.string()),
  resumeUrl: v.optional(v.string()),
  languages: v.optional(
    v.array(v.object({ name: v.string(), level: v.optional(v.string()) }))
  ),
});

// ── slug rules (mirror portfolios.ts; kept private there) ───────────────────
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
const RESERVED_SLUGS = new Set([
  "admin", "api", "dashboard", "sign-in", "sign-up", "p",
  "privacy", "terms", "refund", "templates",
]);
const SLUG_RESERVATION_TTL_MS = 30 * 60 * 1000;

function assertValidSlug(slug: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new Error("Invalid slug. Use 3-40 lowercase letters, digits, or hyphens.");
  }
  if (RESERVED_SLUGS.has(slug)) throw new Error("Slug is reserved");
}

async function slugHolder(
  ctx: QueryCtx | MutationCtx,
  slug: string,
  exceptId?: Id<"portfolios">
): Promise<Doc<"portfolios"> | null> {
  const rows = await ctx.db
    .query("portfolios")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .collect();
  const now = Date.now();
  for (const doc of rows) {
    if (exceptId && doc._id === exceptId) continue;
    if (doc.status === "paid" || doc.status === "published") return doc;
    if (now - (doc.slugReservedAt ?? 0) < SLUG_RESERVATION_TTL_MS) return doc;
  }
  return null;
}

/** Assert the bot-owned portfolio belongs to `userId`. Returns the doc. */
async function ownedBy(
  ctx: MutationCtx,
  portfolioId: Id<"portfolios">,
  userId: Id<"users">
): Promise<Doc<"portfolios">> {
  const portfolio = await ctx.db.get(portfolioId);
  if (!portfolio) throw new Error("Portfolio not found");
  if (portfolio.userId !== userId) throw new Error("Forbidden: not portfolio owner");
  return portfolio;
}

// Fields a bot client must never set directly via updateForBot.
const PROTECTED_KEYS = new Set([
  "userId", "status", "slug", "slugReservedAt", "paymentId",
  "generatedHtml", "generatedProjectPages", "publishedAt", "createdAt", "_id", "_creationTime",
]);

// ── mutations ───────────────────────────────────────────────────────────────

export const getOrCreateBotOwner = mutation({
  args: {
    serverSecret: v.string(),
    externalUserId: v.string(), // e.g. "tg:12345"
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { serverSecret, externalUserId, email, name }) => {
    verifyServerSecret(serverSecret);
    // Enforce the channel-prefixed shape so an external id can NEVER collide
    // with a real Clerk "user_..." subject (account-takeover guard).
    if (!/^(tg|wa):[A-Za-z0-9_-]{1,64}$/.test(externalUserId)) {
      throw new Error("Invalid externalUserId");
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", externalUserId))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("users", {
      clerkId: externalUserId,
      email: email || `${externalUserId.replace(/[^a-z0-9]/gi, "-")}@cv-bot.local`,
      name,
      createdAt: Date.now(),
    });
  },
});

export const createForBot = mutation({
  args: {
    serverSecret: v.string(),
    userId: v.id("users"),
    templateId: v.string(),
    locale: v.union(v.literal("en"), v.literal("ar")),
    name: v.string(),
    basics: basicsValidator,
  },
  handler: async (ctx, { serverSecret, userId, ...args }) => {
    verifyServerSecret(serverSecret);
    if (!(await ctx.db.get(userId))) throw new Error("Owner not found");
    const now = Date.now();
    return await ctx.db.insert("portfolios", {
      ...args,
      userId,
      status: "draft",
      lastEditedAt: now,
      createdAt: now,
    });
  },
});

export const updateForBot = mutation({
  args: {
    serverSecret: v.string(),
    userId: v.id("users"),
    portfolioId: v.id("portfolios"),
    // ponytail: v.any() patch + key-strip instead of re-declaring the 200-line
    // update validator. The table schema validates every field's shape on write;
    // PROTECTED_KEYS guards the sensitive ones. Less code, same trust boundary.
    patch: v.any(),
  },
  handler: async (ctx, { serverSecret, userId, portfolioId, patch }) => {
    verifyServerSecret(serverSecret);
    await ownedBy(ctx, portfolioId, userId);
    const clean: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(patch || {})) {
      if (!PROTECTED_KEYS.has(k) && val !== undefined) clean[k] = val;
    }
    // Sanitize project slugs (mirrors portfolios.update).
    if (Array.isArray((clean as any).projects)) {
      const slugPattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
      for (const p of (clean as any).projects) {
        if (p?.slug && !slugPattern.test(p.slug)) {
          throw new Error(`Invalid project slug: "${p.slug}".`);
        }
      }
    }
    await ctx.db.patch(portfolioId, { ...clean, lastEditedAt: Date.now() });
  },
});

export const reserveSlugForBot = mutation({
  args: {
    serverSecret: v.string(),
    userId: v.id("users"),
    portfolioId: v.id("portfolios"),
    slug: v.string(),
  },
  handler: async (ctx, { serverSecret, userId, portfolioId, slug }) => {
    verifyServerSecret(serverSecret);
    await ownedBy(ctx, portfolioId, userId);
    assertValidSlug(slug);
    if (await slugHolder(ctx, slug, portfolioId)) throw new Error("Slug already taken");
    await ctx.db.patch(portfolioId, { slug, slugReservedAt: Date.now() });
  },
});

export const publishForBot = mutation({
  args: {
    serverSecret: v.string(),
    userId: v.id("users"),
    portfolioId: v.id("portfolios"),
    slug: v.string(),
    generatedHtml: v.string(),
    generatedProjectPages: v.optional(
      v.array(v.object({ slug: v.string(), html: v.string() }))
    ),
  },
  handler: async (ctx, { serverSecret, userId, portfolioId, slug, generatedHtml, generatedProjectPages }) => {
    verifyServerSecret(serverSecret);
    const portfolio = await ownedBy(ctx, portfolioId, userId);
    assertValidSlug(slug);
    // Payment gate — same as portfolios.publish (no admin bypass for the bot).
    if (portfolio.status !== "paid" && portfolio.status !== "published") {
      throw new Error("Portfolio is not paid");
    }
    if (await slugHolder(ctx, slug, portfolioId)) throw new Error("Slug already taken");
    await ctx.db.patch(portfolioId, {
      slug,
      generatedHtml,
      ...(generatedProjectPages ? { generatedProjectPages } : {}),
      status: "published",
      publishedAt: Date.now(),
      lastEditedAt: Date.now(),
    });
  },
});

/** Full doc for the re-edit round-trip (server-secret only). */
export const getForBot = mutation({
  args: { serverSecret: v.string(), userId: v.id("users"), portfolioId: v.id("portfolios") },
  handler: async (ctx, { serverSecret, userId, portfolioId }) => {
    verifyServerSecret(serverSecret);
    // Ownership check (IDOR fix): never return a portfolio the caller doesn't own.
    return await ownedBy(ctx, portfolioId, userId);
  },
});
