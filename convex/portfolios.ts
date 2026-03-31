import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    templateId: v.string(),
    locale: v.union(v.literal("en"), v.literal("ar")),
    name: v.string(),
    basics: v.object({
      fullName: v.string(),
      title: v.string(),
      subtitle: v.optional(v.string()),
      bio: v.optional(v.string()),
      location: v.optional(v.string()),
      email: v.string(),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      github: v.optional(v.string()),
      photoUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("portfolios", {
      ...args,
      status: "draft",
      lastEditedAt: now,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("portfolios"),
    basics: v.optional(
      v.object({
        fullName: v.string(),
        title: v.string(),
        subtitle: v.optional(v.string()),
        bio: v.optional(v.string()),
        location: v.optional(v.string()),
        email: v.string(),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        github: v.optional(v.string()),
        photoUrl: v.optional(v.string()),
      })
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
      v.array(
        v.object({
          category: v.string(),
          items: v.array(v.string()),
        })
      )
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
    customization: v.optional(
      v.object({
        primaryColor: v.optional(v.string()),
        accentColor: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, {
      ...fields,
      lastEditedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { id: v.id("portfolios") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("portfolios")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
    await ctx.db.delete(id);
  },
});
