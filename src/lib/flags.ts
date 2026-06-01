/**
 * Feature flags.
 *
 * HOSTING_ENABLED — temporary kill-switch for public portfolio hosting.
 *
 * While `false`:
 *   - The public `/p/<slug>` portfolio pages are turned off (show a
 *     "coming soon" notice instead of the live portfolio).
 *   - The product deliverable is the downloadable PDF only — the 4.900 KD
 *     payment now unlocks the PDF download instead of a hosted URL.
 *   - All "published portfolio / hosted URL / your own domain" marketing
 *     is hidden from the landing page and dashboard.
 *
 * Flip back to `true` to fully restore hosting once the templates are
 * finished and tested — no other code needs to change.
 */
export const HOSTING_ENABLED = false;
