/**
 * Route-level skeleton for /templates. The page is server-rendered (it reads
 * the Clerk session to mark templates as owned/available), so there is a brief
 * server wait on navigation. App Router streams this skeleton in its place —
 * animated placeholder cards that mirror the real 2-column template grid —
 * instead of a bare "Loading..." string.
 */
export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-[var(--land-bg)] text-[var(--land-bright)]">
      {/* Header strip */}
      <div className="border-b border-[var(--land-border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="h-6 w-32 rounded bg-[var(--land-surface-raised)] animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-[var(--land-surface-raised)] animate-pulse" />
        </div>
      </div>

      {/* Title block */}
      <div className="px-6 pt-12 text-center">
        <div className="mx-auto h-9 w-72 rounded bg-[var(--land-surface)] animate-pulse" />
        <div className="mx-auto mt-4 h-5 w-96 max-w-full rounded bg-[var(--land-surface)] animate-pulse" />
      </div>

      {/* Template card grid (matches sm:grid-cols-2 lg:grid-cols-2) */}
      <main className="px-6 pb-24 pt-12">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]"
            >
              <div className="aspect-[16/10] bg-[var(--land-surface-raised)] animate-pulse" />
              <div className="flex flex-col gap-3 p-5">
                <div className="h-5 w-1/3 rounded bg-[var(--land-surface-raised)] animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-[var(--land-surface-raised)] animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-[var(--land-surface-raised)] animate-pulse" />
                <div className="mt-2 flex gap-3">
                  <div className="h-10 flex-1 rounded-lg bg-[var(--land-surface-raised)] animate-pulse" />
                  <div className="h-10 w-24 rounded-lg bg-[var(--land-surface-raised)] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
