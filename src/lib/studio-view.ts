// Render gate for the CV Studio's two-pane view.
//
// `portfolio` is the result of useQuery(api.portfolios.get):
//   undefined → query still loading OR skipped (Convex browser auth not ready)
//   null      → loaded but not found / not owner
//   object    → the loaded portfolio doc
//
// The studio (and its preview) may only show once the doc is ACTUALLY loaded.
// The old gate used `portfolio !== null`, which is true while the query is still
// `undefined` — so right after a successful parse (id set, doc not loaded yet)
// the upload screen, its loading spinner, AND the preview were all suppressed:
// a blank screen. Worst for a brand-new user whose Convex auth lags, where the
// `get` query stays skipped → blank forever ("uploaded, says ok, nothing shows").
export const portfolioReady = (
  portfolioId: string | null,
  portfolio: unknown,
): boolean => !!portfolioId && portfolio != null;
