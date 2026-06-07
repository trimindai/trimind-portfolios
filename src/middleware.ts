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

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!_next|_vercel|favicon.ico|.*\\..*).*)" ],
};
