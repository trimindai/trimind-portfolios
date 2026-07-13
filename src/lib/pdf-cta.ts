// The PDF "download vs publish" CTA decision, as one tested pure function.
//
// REGRESSION GUARD (real customer incident 2026-07-13): a paid/admin/published
// user's PRIMARY action is downloading their PDF, and printCv → /api/pdf is the
// ONLY working download trigger. `canDownload` MUST take precedence over
// HOSTING_ENABLED. When it didn't, the preview CTA linked to /publish, whose own
// "Download" button linked back to /preview → an infinite preview⇄publish loop,
// and a paying customer could never get her file.

export type PdfCtaMode = "download" | "publish";

/**
 * @param canDownload  isAdmin || status==="paid" || status==="published"
 * Returns "download" whenever the user is entitled — regardless of hosting mode.
 */
export function pdfCtaMode(canDownload: boolean): PdfCtaMode {
  return canDownload ? "download" : "publish";
}

// ── self-check (run: npx tsx src/lib/pdf-cta.ts) ─────────────────────────────
function demo() {
  const assert = (c: boolean, m: string) => {
    if (!c) throw new Error("FAIL: " + m);
  };
  // The invariant that broke: an entitled user ALWAYS gets the download CTA.
  assert(pdfCtaMode(true) === "download", "entitled → download (never /publish loop)");
  assert(pdfCtaMode(false) === "publish", "not entitled → publish/paywall");
  console.log("pdf-cta self-check: OK");
}
if (typeof require !== "undefined" && require.main === module) demo();
