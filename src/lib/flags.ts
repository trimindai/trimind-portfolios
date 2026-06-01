/**
 * Feature flags.
 *
 * HOSTING_ENABLED — public portfolio hosting switch for the hybrid model.
 *
 * The product now ships TWO outputs from one dataset:
 *   1. A clean, ATS-ready **PDF CV** (all job-application sections) carrying
 *      an embedded **QR code**.
 *   2. A **mobile-perfect live web portfolio** served at `/p/<slug>`.
 *
 * The QR on the printed CV points at the live portfolio, so a hiring team
 * that scans it lands on the candidate's hosted page. Hosting therefore
 * MUST stay enabled — it is the QR's live target.
 *
 * While `true`:
 *   - The public `/p/<slug>` portfolio pages serve the live portfolio.
 *   - The QR embedded in the PDF CV resolves to a working page.
 *   - Landing/dashboard copy may surface the live portfolio URL.
 *
 * Set to `false` only to temporarily pause public hosting (the QR target
 * goes dark and `/p/<slug>` shows a "coming soon" notice instead) — no
 * other code needs to change.
 */
export const HOSTING_ENABLED = true;
