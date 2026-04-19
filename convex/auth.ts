// Server-side auth helpers used by every mutation/query that touches user data.
// Never trust client-supplied identifiers — always derive from ctx.auth.

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Returns the current authenticated user (Convex `users` row) or null.
 * Resolves the Convex user by Clerk subject from the JWT.
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
}

/**
 * Requires an authenticated user and returns the Convex `users` row.
 * Throws on missing auth or missing user record.
 */
export async function requireUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Unauthenticated");
  return user;
}

/**
 * Requires the authenticated user to be the owner of the given portfolio.
 * Returns both the user and the portfolio for downstream use.
 */
export async function requireOwner(
  ctx: QueryCtx | MutationCtx,
  portfolioId: Id<"portfolios">
): Promise<{ user: Doc<"users">; portfolio: Doc<"portfolios"> }> {
  const user = await requireUser(ctx);
  const portfolio = await ctx.db.get(portfolioId);
  if (!portfolio) throw new Error("Portfolio not found");
  if (portfolio.userId !== user._id) {
    throw new Error("Forbidden: not portfolio owner");
  }
  return { user, portfolio };
}

/**
 * Requires the authenticated user to be on the admin allowlist.
 * Allowlist comes from the Convex env var ADMIN_EMAILS (comma-separated).
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) {
    throw new Error(
      "Admin access denied: ADMIN_EMAILS env var not configured in Convex"
    );
  }
  if (!allowed.includes(user.email.toLowerCase())) {
    throw new Error("Forbidden: not an admin");
  }
  return user;
}

/**
 * Verifies a server-to-server call by checking a shared secret.
 * Used by payment callback / free-access routes that have no user session.
 *
 * Set INTERNAL_API_SECRET to the SAME value in:
 *   - Convex dashboard → Environment Variables
 *   - Vercel → Environment Variables
 */
export function verifyServerSecret(secret: string | undefined): void {
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) {
    throw new Error("INTERNAL_API_SECRET not configured in Convex");
  }
  if (!secret || secret !== expected) {
    throw new Error("Forbidden: invalid server secret");
  }
}
