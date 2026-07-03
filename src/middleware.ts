import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

// Only dashboard + admin require auth. The guest builder at /:locale/try(.*) is
// intentionally PUBLIC (unauthenticated visitors build a localStorage-backed
// preview; auth is enforced only at Publish/Download). It is NOT in this matcher
// and NOT in isStaticRoute below, so intl middleware runs for it as normal.
const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/admin(.*)",
  // NOTE: /build is deliberately NOT protected here. Server middleware races
  // Clerk's short-lived __session cookie on the first post-login navigation and
  // 307s back to sign-in (intermittent, worst on Safari/iOS ITP). /build is
  // gated CLIENT-side instead (build/layout.tsx), where clerk-js restores the
  // session from the long-lived first-party __client cookie. parse-cv still
  // 401s for signed-out callers, so that remains the real security boundary.
]);

const isStaticRoute = (req: NextRequest) =>
  req.nextUrl.pathname.startsWith("/api") ||
  req.nextUrl.pathname.startsWith("/p/") ||
  req.nextUrl.pathname.startsWith("/demo") ||
  // Locale-prefixed demo routes (e.g. /ar/demo/engineer) are served by static
  // vercel.json rewrites; skip the intl middleware so it doesn't intercept them.
  /^\/(en|ar)\/demo(\/|$)/.test(req.nextUrl.pathname);

export default clerkMiddleware(async (auth, req) => {
  // Skip intl middleware for API routes and public portfolio routes
  if (isStaticRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    const locale = req.nextUrl.pathname.split("/")[1] || "en";
    const returnTo = req.nextUrl.pathname + req.nextUrl.search;
    await auth.protect({
      unauthenticatedUrl: `${req.nextUrl.origin}/${locale}/sign-in?redirect_url=${encodeURIComponent(returnTo)}`,
    });
  }

  // Display-currency hint for price localization: Saudi visitors see SAR, all
  // others KWD. Non-httpOnly so client components can read it; the actual charge
  // stays KWD (see lib/currency.ts). Country from Vercel's geo header.
  const res = intlMiddleware(req);
  const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  res.cookies.set("cur", country === "SA" ? "SAR" : "KWD", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
});

export const config = {
  matcher: ["/((?!_next|_vercel|favicon.ico|.*\\..*).*)" ],
};
