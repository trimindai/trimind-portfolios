/**
 * API rate limiting — READY TO ENABLE (currently inert).
 *
 * Decision (2026-06-08): ship the limiter but do NOT add the dependency or wire
 * it into routes yet. Serverless needs a SHARED store — an in-memory counter is
 * per-instance on Vercel and so doesn't actually limit anything. To turn it on:
 *
 *   1. npm i @upstash/ratelimit @upstash/redis
 *   2. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env
 *      (Upstash Redis is available on the Vercel Marketplace).
 *   3. Replace the INERT SHIM below with the ENABLE block beneath it.
 *   4. At the top of each sensitive route handler (e.g. myfatoorah/initiate,
 *      free-access) add:
 *          const limited = await enforceRateLimit(req, "myfatoorah-initiate");
 *          if (limited) return limited;
 *      It returns a 429 NextResponse to short-circuit, or null to proceed.
 *
 * Until then this shim keeps the call-sites valid and always allows the request.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ── INERT SHIM (delete when enabling) ────────────────────────────────────────
export async function enforceRateLimit(
  req: NextRequest,
  bucket: string
): Promise<NextResponse | null> {
  // Disabled: no shared store configured yet. Always allows the request.
  // (Params are kept to match the enabled signature below.)
  void req;
  void bucket;
  return null;
}

/* ── ENABLE: replace the shim above with this ─────────────────────────────────
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const limiters: Record<string, Ratelimit> = {};

function limiterFor(bucket: string): Ratelimit {
  if (!limiters[bucket]) {
    limiters[bucket] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 req / 10s per IP
      prefix: `rl:${bucket}`,
      analytics: true,
    });
  }
  return limiters[bucket];
}

export async function enforceRateLimit(
  req: NextRequest,
  bucket: string
): Promise<NextResponse | null> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  const { success, limit, remaining, reset } = await limiterFor(bucket).limit(ip);
  if (success) return null;
  return NextResponse.json(
    { error: "RATE_LIMITED", message: "Too many requests. Please slow down." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}
───────────────────────────────────────────────────────────────────────────── */
