import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
  "/:locale/admin(.*)",
]);

const isStaticRoute = (req: NextRequest) =>
  req.nextUrl.pathname.startsWith("/api") ||
  req.nextUrl.pathname.startsWith("/p/") ||
  req.nextUrl.pathname.startsWith("/demo");

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
