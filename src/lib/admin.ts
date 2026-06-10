/**
 * SERVER-ONLY admin allowlist, read from the ADMIN_EMAILS env var (set in
 * Vercel + Convex). Never import this from a client component — the list
 * used to be hardcoded here and shipped the admin emails in the JS bundle.
 * Client UIs gate on the `api.users.isAdmin` Convex query instead (boolean
 * only); real authorization is enforced server-side in Convex/route handlers.
 */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
