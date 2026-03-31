import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except /api, /p (published portfolios), /_next, /favicon.ico, etc.
    "/((?!api|p|_next|_vercel|favicon.ico|.*\\..*).*)",
  ],
};
