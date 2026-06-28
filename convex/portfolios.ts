import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { requireUser, requireAdminOrOwner, verifyServerSecret, getCurrentUser, getOrCreateUser } from "./auth";

// ── Slug rules & reservation ───────────────────────────────────────────────
// Public CVs live at portfolio-trimind.com/p/<slug>, so slugs are a single
// global namespace and must be unique across all live portfolios.
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/; // 3-40 chars, no leading/trailing hyphen
const RESERVED_SLUGS = new Set([
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
// How long a draft may hold a slug before paying. After this, the name frees
// up again so an abandoned checkout never blocks the name permanently.
const SLUG_RESERVATION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** Normalize arbitrary text into a candidate slug (mirrors the publish UI). */
function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Throw a user-facing error if a slug is malformed or reserved. */
function assertValidSlug(slug: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new Error(
      "Invalid slug. Use 3-40 lowercase letters, digits, or hyphens."
    );
  }
  if (RESERVED_SLUGS.has(slug)) throw new Error("Slug is reserved");
}

/**
 * Returns the portfolio currently HOLDING `slug` (blocking others), or null if
 * the name is free. A name is held when a portfolio is paid/published, or when
 * a draft reserved it within the TTL window. Expired draft holds count as free.
 * `exceptId` lets a portfolio ignore its own hold (re-publish / re-reserve).
 *
 * Collects all rows for the slug (not `.first()`) so a stale expired draft can
 * never mask a real paid/published holder of the same name.
 */
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
    // Draft: held only while its reservation is still fresh.
    if (now - (doc.slugReservedAt ?? 0) < SLUG_RESERVATION_TTL_MS) return doc;
  }
  return null;
}

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
    v.array(
      v.object({
        name: v.string(),
        level: v.optional(v.string()),
      })
    )
  ),
});

const customizationValidator = v.optional(
  v.object({
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    bgColor: v.optional(v.string()),
    trackballLabel: v.optional(v.string()),
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
    // Auth: derive userId from session, never trust client. get-or-create so a
    // brand-new user's first CV doesn't 401 if client-side provisioning (the
    // /build upsertFromClerk) hasn't landed yet.
    const user = await getOrCreateUser(ctx);
    // One CV per user: if they already have one, return it instead of creating a
    // second. This is the real cap — the UI redirect is just a convenience.
    // ponytail: paid/published wins, else newest; hidden extras are never deleted.
    const existing = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    if (existing.length > 0) {
      const primary =
        existing.find(
          (p) => p.status === "paid" || p.status === "published"
        ) ?? existing[0];
      return primary._id;
    }
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

export const duplicate = mutation({
  args: { id: v.id("portfolios") },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const original = await ctx.db.get(id);
    if (!original) throw new Error("Portfolio not found");
    if (original.userId !== user._id) throw new Error("Not your portfolio");

    const now = Date.now();
    const { _id, _creationTime, status, slug, slugReservedAt, generatedHtml, generatedProjectPages, paymentId, publishedAt, viewCount, createdAt, lastEditedAt, ...data } = original;
    return await ctx.db.insert("portfolios", {
      ...data,
      name: `${original.name} (copy)`,
      status: "draft",
      slug: undefined,
      lastEditedAt: now,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("portfolios"),
    // Allow switching the template from the Studio chat (switchTemplate tool).
    // Validated against the known ids in the handler below.
    templateId: v.optional(v.string()),
    basics: v.optional(basicsValidator),
    brands: v.optional(
      v.array(v.object({ name: v.string(), logoUrl: v.optional(v.string()) }))
    ),
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
          slug: v.optional(v.string()),
          tagline: v.optional(v.string()),
          coverUrl: v.optional(v.string()),
          meta: v.optional(
            v.object({
              type: v.optional(v.string()),
              year: v.optional(v.string()),
              courseCode: v.optional(v.string()),
              institution: v.optional(v.string()),
              teamSize: v.optional(v.number()),
              role: v.optional(v.string()),
              duration: v.optional(v.string()),
            })
          ),
          blocks: v.optional(
            v.array(
              v.object({
                kind: v.union(
                  v.literal("paragraph"),
                  v.literal("image"),
                  v.literal("imageGrid"),
                  v.literal("video"),
                  v.literal("specs"),
                  v.literal("standards"),
                  v.literal("challenge")
                ),
                body: v.optional(v.string()),
                caption: v.optional(v.string()),
                url: v.optional(v.string()),
                fullBleed: v.optional(v.boolean()),
                images: v.optional(
                  v.array(v.object({ url: v.string(), caption: v.optional(v.string()) }))
                ),
                items: v.optional(
                  v.array(v.object({ label: v.string(), value: v.string() }))
                ),
                problem: v.optional(v.string()),
                solution: v.optional(v.string()),
              })
            )
          ),
          links: v.optional(
            v.array(
              v.object({
                kind: v.union(
                  v.literal("report"),
                  v.literal("repo"),
                  v.literal("demo"),
                  v.literal("paper"),
                  v.literal("video"),
                  v.literal("external")
                ),
                label: v.string(),
                url: v.string(),
              })
            )
          ),
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
    references: v.optional(
      v.array(
        v.object({
          name: v.string(),
          title: v.optional(v.string()),
          contact: v.optional(v.string()),
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
    lastCompletedStep: v.optional(v.number()),
    aiFilledAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    // Auth + ownership: caller must own this portfolio (admins can edit any).
    await requireAdminOrOwner(ctx, id);
    // Guard the optional template switch against arbitrary strings.
    if (
      fields.templateId !== undefined &&
      !["general", "engineer", "creative", "developer", "creator"].includes(
        fields.templateId
      )
    ) {
      throw new Error(`Invalid templateId: "${fields.templateId}".`);
    }
    // Sanitize project slugs to prevent path-traversal-style strings
    if (fields.projects) {
      const slugPattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
      for (const project of fields.projects) {
        if (project.slug && !slugPattern.test(project.slug)) {
          throw new Error(`Invalid project slug: "${project.slug}". Use lowercase letters, digits, or hyphens.`);
        }
      }
    }
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
const TIER_RANK = { essential: 1, pro: 2, pro_review: 3 } as const;
type TierLit = keyof typeof TIER_RANK;
const tierArg = v.optional(
  v.union(v.literal("essential"), v.literal("pro"), v.literal("pro_review"))
);

export const markPaid = mutation({
  args: {
    id: v.id("portfolios"),
    paymentId: v.string(),
    tier: tierArg,
    serverSecret: v.string(),
  },
  handler: async (ctx, { id, paymentId, tier, serverSecret }) => {
    verifyServerSecret(serverSecret);
    const portfolio = await ctx.db.get(id);
    if (!portfolio) throw new Error("Portfolio not found");
    const alreadyPaid =
      portfolio.status === "paid" || portfolio.status === "published";
    const curRank = portfolio.tier ? TIER_RANK[portfolio.tier as TierLit] : 0;
    const newRank = tier ? TIER_RANK[tier] : 0;
    // No-op on a repeat callback or a same/lower tier; allow tier UPGRADES.
    if (alreadyPaid && newRank <= curRank) return;
    await ctx.db.patch(id, {
      status: "paid",
      paymentId,
      ...(tier ? { tier } : {}),
      ...(tier === "pro_review" ? { reviewStatus: "pending" as const } : {}),
      lastEditedAt: Date.now(),
    });
  },
});

export const markPaidByUser = mutation({
  args: {
    userId: v.id("users"),
    paymentId: v.string(),
    tier: tierArg,
    serverSecret: v.string(),
  },
  handler: async (ctx, { userId, paymentId, tier, serverSecret }) => {
    verifyServerSecret(serverSecret);
    const drafts = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    const target = drafts.find((p) => p.status === "draft");
    if (!target) throw new Error("No draft portfolio found for user");
    await ctx.db.patch(target._id, {
      status: "paid",
      paymentId,
      ...(tier ? { tier } : {}),
      ...(tier === "pro_review" ? { reviewStatus: "pending" as const } : {}),
      lastEditedAt: Date.now(),
    });
    return target._id;
  },
});

export const get = query({
  args: { id: v.id("portfolios") },
  handler: async (ctx, { id }) => {
    // Returns the portfolio only if the caller owns it (or is admin).
    // Public viewing happens through `getBySlug` for published portfolios.
    await requireAdminOrOwner(ctx, id);
    return await ctx.db.get(id);
  },
});

/**
 * Server-only: returns a published portfolio by slug. Used by the /p/[slug]
 * route handlers, which need the full doc (generatedHtml, project pages,
 * fallback-render content). Requires the server secret — the full document
 * carries PII (email/phone) and internal ids, so it must not be fetchable by
 * an anonymous browser calling the public Convex deployment URL directly.
 * Only returns portfolios that have been actually published — drafts and paid
 * (but unpublished) portfolios are invisible.
 */
export const getBySlug = query({
  args: { slug: v.string(), serverSecret: v.optional(v.string()) },
  handler: async (ctx, { slug, serverSecret }) => {
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!portfolio || portfolio.status !== "published") return null;

    // Full document only for our server (route handlers pass the secret).
    if (serverSecret) {
      verifyServerSecret(serverSecret);
      return portfolio;
    }

    // Anonymous callers (anyone can hit the Convex deployment URL directly)
    // get only what a public page render needs — no email/phone/userId/
    // paymentId/source content.
    return {
      _id: portfolio._id,
      slug: portfolio.slug,
      status: portfolio.status,
      templateId: portfolio.templateId,
      locale: portfolio.locale,
      generatedHtml: portfolio.generatedHtml,
      generatedProjectPages: portfolio.generatedProjectPages,
      publishedAt: portfolio.publishedAt,
      basics: {
        fullName: portfolio.basics?.fullName,
        title: portfolio.basics?.title,
        bio: portfolio.basics?.bio,
      },
    };
  },
});

export const listPublishedSlugs = query({
  handler: async (ctx) => {
    const published = await ctx.db
      .query("portfolios")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return published
      .filter((p) => p.slug)
      .map((p) => ({ slug: p.slug!, publishedAt: p.publishedAt ?? p.lastEditedAt }));
  },
});

export const incrementViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!portfolio || portfolio.status !== "published") return;
    await ctx.db.patch(portfolio._id, {
      viewCount: (portfolio.viewCount ?? 0) + 1,
    });
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
    // Expiry-aware: an expired draft reservation no longer counts as taken.
    const holder = await slugHolder(ctx, slug);
    return holder ? { ownerPortfolioId: holder._id } : null;
  },
});

/**
 * Authenticated: atomically claim a slug for the caller's portfolio BEFORE the
 * slow steps (payment, HTML generation). This is the duplicate guard — Convex
 * mutations are serializable, so the holder check + write happen as one unit.
 * Called right before redirecting to payment so a user never pays for a name
 * they then lose to someone else.
 */
export const reserveSlug = mutation({
  args: { id: v.id("portfolios"), slug: v.string() },
  handler: async (ctx, { id, slug }) => {
    await requireAdminOrOwner(ctx, id);
    assertValidSlug(slug);
    const holder = await slugHolder(ctx, slug, id);
    if (holder) throw new Error("Slug already taken");
    await ctx.db.patch(id, { slug, slugReservedAt: Date.now() });
  },
});

/**
 * Authenticated: given a desired name, return up to 3 available alternatives.
 * Used to offer one-click suggestions when the chosen name is taken.
 */
export const suggestSlugs = query({
  args: { base: v.string() },
  handler: async (ctx, { base }) => {
    await requireUser(ctx);
    const root = normalizeSlug(base) || "portfolio";
    const candidates = [
      ...[2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${root}-${n}`),
      ...["cv", "pro", "official", "portfolio"].map((s) => `${root}-${s}`),
    ];
    const out: string[] = [];
    for (const c of candidates) {
      if (!SLUG_RE.test(c) || RESERVED_SLUGS.has(c)) continue;
      if (!(await slugHolder(ctx, c))) out.push(c);
      if (out.length >= 3) break;
    }
    return out;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    // Always returns ONLY the caller's portfolios — never accept a userId arg.
    // A just-signed-up user has no Convex row yet (provisioned lazily on first
    // authed page); no row ⇒ no portfolios. Return [] instead of throwing — a
    // thrown query crashes the /build page's React tree. ponytail: read-only.
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const docs = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    // Project to the card fields only. Full docs carry generatedHtml /
    // generatedProjectPages (hundreds of KB each) that the list page never reads.
    return docs.map((p) => ({
      _id: p._id,
      _creationTime: p._creationTime,
      name: p.name,
      templateId: p.templateId,
      status: p.status,
      slug: p.slug,
      basics: { fullName: p.basics?.fullName, title: p.basics?.title },
      lastEditedAt: p.lastEditedAt,
      createdAt: p.createdAt,
      viewCount: p.viewCount,
    }));
  },
});

export const publish = mutation({
  args: {
    id: v.id("portfolios"),
    slug: v.string(),
    generatedHtml: v.string(),
    generatedProjectPages: v.optional(
      v.array(v.object({ slug: v.string(), html: v.string() }))
    ),
    serverSecret: v.string(),
  },
  handler: async (
    ctx,
    { id, slug, generatedHtml, generatedProjectPages, serverSecret }
  ) => {
    // The HTML is trusted ONLY because /api/publish rendered it server-side
    // from stored data — the secret proves this call came from our server,
    // not a browser hand-crafting markup to be served on our origin.
    verifyServerSecret(serverSecret);
    // Auth + ownership (admins can publish any portfolio).
    const { portfolio, isAdmin } = await requireAdminOrOwner(ctx, id);

    assertValidSlug(slug);

    // Payment gate: only paid (or already-published re-publish) may publish.
    // Admins can bypass the payment gate.
    if (!isAdmin && portfolio.status !== "paid" && portfolio.status !== "published") {
      throw new Error("Portfolio is not paid");
    }
    // Live page is a Pro feature (legacy flat-4.9 paid = full access).
    const liveTier =
      portfolio.tier ??
      (portfolio.status === "paid" || portfolio.status === "published"
        ? "pro"
        : null);
    if (!isAdmin && liveTier !== "pro" && liveTier !== "pro_review") {
      throw new Error("Live portfolio requires Portfolio Pro");
    }

    // Final duplicate guard (expiry-aware, ignores this portfolio's own hold).
    if (await slugHolder(ctx, slug, id)) {
      throw new Error("Slug already taken");
    }

    await ctx.db.patch(id, {
      slug,
      generatedHtml,
      ...(generatedProjectPages ? { generatedProjectPages } : {}),
      status: "published",
      publishedAt: Date.now(),
      lastEditedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("portfolios") },
  handler: async (ctx, { id }) => {
    await requireAdminOrOwner(ctx, id);
    await ctx.db.delete(id);
  },
});
