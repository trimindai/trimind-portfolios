/**
 * SSR-safe wrapper around the GA4 `gtag()` that @next/third-parties injects in
 * `app/[locale]/layout.tsx` (gated on NEXT_PUBLIC_GA_ID). No-ops when GA isn't
 * loaded, so every call is safe in dev/preview where the measurement ID is
 * unset — `window.gtag` simply doesn't exist there.
 */
type GtagParams = Record<string, unknown>;

export const GA_CURRENCY = "KWD";
export const GA_VALUE = 4.9; // PRICE_KWD — the one-time portfolio price.

export function track(event: string, params?: GtagParams): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (typeof gtag !== "function") return;
  gtag("event", event, params ?? {});
}
