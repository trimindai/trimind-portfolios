import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
]);

const isApiRoute = (req: NextRequest) =>
  req.nextUrl.pathname.startsWith("/api") ||
  req.nextUrl.pathname.startsWith("/p/");

export default clerkMiddleware(async (auth, req) => {
  // Skip intl middleware for API routes and public portfolio routes
  if (isApiRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!_next|_vercel|favicon.ico|.*\\..*).*)" ],
};
