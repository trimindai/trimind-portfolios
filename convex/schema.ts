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
    // When a draft reserved its slug (ms). Lets an unpaid hold expire so an
    // abandoned checkout never squats a name forever. See SLUG_RESERVATION_TTL_MS.
    slugReservedAt: v.optional(v.number()),

    basics: v.object({
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
    }),

    brands: v.optional(
      v.array(v.object({ name: v.string(), logoUrl: v.optional(v.string()) }))
    ),

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
          // Existing fields (used by Corporate's inline "Impact Stories")
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

          // Detail-page fields: set `slug` to enable /p/<portfolio>/projects/<slug>.
          // Greglagana.com pattern — narrative blocks, not fixed sections.
          slug: v.optional(v.string()),
          tagline: v.optional(v.string()),
          coverUrl: v.optional(v.string()),

          meta: v.optional(
            v.object({
              // Free-form: engineer uses academic/industrial/personal/research;
              // creative uses the medium/discipline (Painting, UI/UX, Photography…).
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
                  v.array(
                    v.object({
                      url: v.string(),
                      caption: v.optional(v.string()),
                    })
                  )
                ),
                items: v.optional(
                  v.array(
                    v.object({
                      label: v.string(),
                      value: v.string(),
                    })
                  )
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

    customization: v.optional(
      v.object({
        primaryColor: v.optional(v.string()),
        accentColor: v.optional(v.string()),
        bgColor: v.optional(v.string()),
        fontFamily: v.optional(v.string()),
        bodyFont: v.optional(v.string()),
        hiddenSections: v.optional(v.array(v.string())),
      })
    ),

    contentAr: v.optional(v.string()),
    generatedHtml: v.optional(v.string()),
    // Map of project slug → pre-rendered HTML. Populated at publish time
    // for any project with a slug; served by /p/<slug>/projects/<projectSlug>.
    generatedProjectPages: v.optional(
      v.array(
        v.object({
          slug: v.string(),
          html: v.string(),
        })
      )
    ),
    viewCount: v.optional(v.number()),
    lastCompletedStep: v.optional(v.number()),
    aiFilledAt: v.optional(v.number()),
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
    .index("by_invoice", ["myfatoorahInvoiceId"])
    .index("by_user", ["userId"]),

  // Durable, multi-instance API rate limiting (fixed-window counters).
  // One row per active key (e.g. "ai-summary:user_2abc"). Replaces the
  // per-instance in-memory counters that reset on every Vercel cold start.
  // Rows for idle keys are purged by the daily cron in convex/crons.ts.
  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_window", ["windowStart"]),
});
