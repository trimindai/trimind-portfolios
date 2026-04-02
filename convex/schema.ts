import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  portfolios: defineTable({
    userId: v.optional(v.id("users")),
    templateId: v.string(),
    name: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("paid"),
      v.literal("published")
    ),
    locale: v.union(v.literal("en"), v.literal("ar")),
    slug: v.optional(v.string()),

    basics: v.object({
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
    }),

    metrics: v.optional(
      v.array(
        v.object({
          value: v.string(),
          label: v.string(),
        })
      )
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
            v.array(
              v.object({
                value: v.string(),
                label: v.string(),
              })
            )
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
      v.array(
        v.object({
          name: v.string(),
          level: v.string(),
        })
      )
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

    customization: v.optional(
      v.object({
        primaryColor: v.optional(v.string()),
        accentColor: v.optional(v.string()),
        bgColor: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
        hiddenSections: v.optional(v.array(v.string())),
      })
    ),

    generatedHtml: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    lastEditedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"])
    .index("by_user_status", ["userId", "status"]),

  payments: defineTable({
    portfolioId: v.id("portfolios"),
    userId: v.optional(v.id("users")),
    amount: v.number(),
    currency: v.string(),
    myfatoorahInvoiceId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_invoice", ["myfatoorahInvoiceId"]),
});
