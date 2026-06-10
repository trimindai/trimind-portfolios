import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time string equality for shared-secret checks in route handlers
 * (webhook, cron). Plain `!==` short-circuits on the first differing byte,
 * which leaks prefix-match timing. Mirrors `constantTimeEqual` in
 * convex/auth.ts (Convex runtime has no node:crypto, hence two impls).
 */
export function secureCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
