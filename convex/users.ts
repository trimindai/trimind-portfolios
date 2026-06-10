import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./auth";

/**
 * Idempotent self-upsert. Reads identity from the JWT — never accepts a
 * client-supplied clerkId. Safe to call from the dashboard layout on every
 * load to ensure the Convex user row exists.
 */
export const upsertFromClerk = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const clerkId = identity.subject;
    const email = identity.email ?? "";
    const name =
      (typeof identity.name === "string" && identity.name) || undefined;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existing) {
      // Patch only when the source-of-truth fields differ to avoid spurious writes.
      if (existing.email !== email || existing.name !== name) {
        await ctx.db.patch(existing._id, { email, name });
      }
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
 * Returns the current user's Convex row, or null if unauthenticated.
 * Replaces the unsafe `getByClerkId(clerkId)` query (clerkId from client
 * was untrusted input).
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Is the caller an admin? Boolean only — lets the UI gate admin links
 * without shipping the admin email allowlist in the client bundle.
 * Authorization itself is still enforced server-side on every admin
 * query/mutation; this is purely presentational.
 */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user?.email) return false;
    const allowlist = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return allowlist.includes(user.email.toLowerCase());
  },
});