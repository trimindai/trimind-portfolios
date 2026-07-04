// Meta Conversions API (server-side) — fires funnel events from API routes so
// tracking survives iOS ITP / ad-blockers (audience is ~94% iOS). Fire-and-forget:
// every path is wrapped so a Meta outage can NEVER break a product route.
//
// Client twin: the pixel base snippet in src/app/[locale]/layout.tsx (PageView).
// Events sent here: StartCV, CVGenerated, DownloadCV (+ TestEvent for smoke tests).

import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { after } from "next/server";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1335242112121971";
const GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type MetaCapiOptions = {
  /** Plaintext email — hashed (SHA-256) before sending, never sent raw. */
  email?: string | null;
  /** Stable user id (e.g. Clerk userId) — hashed before sending. */
  externalId?: string | null;
  /** Meta Events Manager test code (smoke tests only). */
  testEventCode?: string;
  /** Custom event properties. */
  customData?: Record<string, unknown>;
};

/**
 * Send one CAPI event. Never throws, never blocks the response:
 * the POST is scheduled via `after()` (runs once the response is sent), with a
 * plain fire-and-forget fallback if we're outside a request scope.
 */
export function sendMetaEvent(
  eventName: string,
  req: NextRequest,
  opts: MetaCapiOptions = {}
): void {
  try {
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    if (!accessToken) return; // not configured (preview/local) — silently skip

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;
    // fbp/fbc cookies (set by the client pixel) sharply improve match quality.
    const fbp = req.cookies.get("_fbp")?.value;
    const fbc = req.cookies.get("_fbc")?.value;

    const userData: Record<string, unknown> = {};
    if (ip) userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;
    if (opts.email) userData.em = [sha256(opts.email)];
    if (opts.externalId) userData.external_id = [sha256(opts.externalId)];

    const body: Record<string, unknown> = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: req.headers.get("referer") || req.nextUrl.href,
          user_data: userData,
          ...(opts.customData ? { custom_data: opts.customData } : {}),
        },
      ],
      ...(opts.testEventCode ? { test_event_code: opts.testEventCode } : {}),
    };

    const post = () =>
      fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
          accessToken
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(5000),
        }
      )
        .then(async (res) => {
          if (!res.ok) {
            console.warn(
              `[meta-capi] ${eventName} → ${res.status}:`,
              (await res.text()).slice(0, 300)
            );
          }
        })
        .catch((err) => {
          console.warn(`[meta-capi] ${eventName} failed:`, err?.message || err);
        });

    try {
      // Keeps the lambda alive until the POST finishes, WITHOUT delaying the response.
      after(post);
    } catch {
      // Outside a request scope — plain fire-and-forget.
      void post();
    }
  } catch (err) {
    // Absolute guarantee: tracking can never 500 a product route.
    console.warn("[meta-capi] skipped:", err instanceof Error ? err.message : err);
  }
}
