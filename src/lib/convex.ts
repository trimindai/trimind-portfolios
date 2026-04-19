import { ConvexHttpClient } from "convex/browser";
import { auth } from "@clerk/nextjs/server";

function getConvexUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not configured");
  return url;
}

// Lazy singleton so module-load-time env-var absence (e.g. during
// `next build`'s page-data collection) doesn't throw before any request.
let _convexClient: ConvexHttpClient | null = null;
function lazyClient(): ConvexHttpClient {
  if (!_convexClient) _convexClient = new ConvexHttpClient(getConvexUrl());
  return _convexClient;
}

/**
 * Anonymous Convex client — used only for queries/mutations that explicitly
 * accept a `serverSecret` (server-to-server) or that are intentionally public.
 * Do NOT use this for owner-scoped reads/writes.
 *
 * Implemented as a Proxy so existing callers (`convexClient.query(...)`)
 * keep working unchanged but the underlying client is built only on first use.
 */
export const convexClient: ConvexHttpClient = new Proxy(
  {} as ConvexHttpClient,
  {
    get(_t, prop) {
      const c = lazyClient() as unknown as Record<string | symbol, unknown>;
      const v = c[prop];
      return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(c) : v;
    },
  }
);

/**
 * Convex client carrying the Clerk session JWT for the current request.
 * Use this for any route that should act as the signed-in user.
 *
 * Usage:
 *   const c = await convexClientForUser();
 *   await c.mutation(api.portfolios.update, { id, ... });
 */
export async function convexClientForUser(): Promise<ConvexHttpClient> {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  if (!token) throw new Error("Unauthenticated");
  const client = new ConvexHttpClient(getConvexUrl());
  client.setAuth(token);
  return client;
}

/**
 * Returns the shared server-to-server secret used to call Convex mutations
 * that have no end-user (payment callback, free-access grant). Throws if not set.
 */
export function serverSecret(): string {
  const s = process.env.INTERNAL_API_SECRET;
  if (!s) throw new Error("INTERNAL_API_SECRET not configured");
  return s;
}
