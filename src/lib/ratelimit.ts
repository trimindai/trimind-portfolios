/**
 * Durable, multi-instance API rate limiting backed by Convex.
 *
 * Replaces the old per-instance in-memory counters (which reset on every Vercel
 * cold start and were therefore not real limits). The counter lives in Convex
 * (see `convex/rateLimit.ts`), so the window is shared across every serverless
 * instance and survives cold starts.
 *
 * Usage — at the top of a route handler, after Clerk auth:
 *
 *   const limited = await enforceUserRateLimit(userId, "ai-summary", {
 *     limit: 10,
 *     windowMs: 60_000,
 *   });
 *   if (limited) return limited; // 429 short-circuit, else null → proceed
 */
import { NextResponse } from "next/server";
import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** 429 body message. Default suits short burst windows; override for daily caps. */
  message?: string;
}

/**
 * Counts one request for `userId` in `bucket`. Returns a ready-to-return 429
 * `NextResponse` when the user is over the limit, or `null` to proceed.
 *
 * Fails OPEN: if the Convex backend is unreachable we log and allow the request
 * rather than 500 the user. Convex is this app's primary datastore, so an
 * outage already degrades everything else — better to not also block AI calls.
 */
export async function enforceUserRateLimit(
  userId: string,
  bucket: string,
  { limit, windowMs, message }: RateLimitOptions
): Promise<NextResponse | null> {
  try {
    const result = await convexClient.mutation(api.rateLimit.consume, {
      key: `${bucket}:${userId}`,
      limit,
      windowMs,
      serverSecret: serverSecret(),
    });
    if (result.ok) return null;

    const retryAfterSec = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
    return NextResponse.json(
      { error: message ?? "Rate limit exceeded. Try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(result.remaining),
        },
      }
    );
  } catch (err) {
    console.error(
      `[ratelimit] backend error for bucket "${bucket}"; failing open:`,
      err
    );
    return null;
  }
}
