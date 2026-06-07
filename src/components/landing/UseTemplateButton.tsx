"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Reads Clerk's JS-readable `__client_uat` cookie to tell whether the visitor
 * is signed in — WITHOUT a Clerk hook. This matters because the landing page is
 * statically prerendered and `Providers` omits `<ClerkProvider>` in env-less
 * builds, so `useAuth()` here would throw at prerender. The cookie is a unix
 * timestamp: > 0 ⇒ signed in, "0"/absent ⇒ signed out.
 *
 * Either way the behavior degrades gracefully: a wrong guess just lands on the
 * route's existing middleware redirect (which already preserves redirect_url).
 */
function isSignedIn(): boolean {
  if (typeof document === "undefined") return false;
  const m = document.cookie.match(/(?:^|;\s*)__client_uat=([^;]*)/);
  if (!m) return false;
  const v = parseInt(decodeURIComponent(m[1]), 10);
  return Number.isFinite(v) && v > 0;
}

/**
 * "Use this template" CTA. Signed in → straight to the builder. Signed out →
 * a brief interstitial ("Sign in to use this template") then sign-in with a
 * `redirect_url` back to the same template, so the flow resumes after auth.
 */
export function UseTemplateButton({
  template,
  locale,
  label,
  className,
}: {
  template: string;
  locale: string;
  label: string;
  className?: string;
}) {
  const [redirecting, setRedirecting] = useState(false);

  const target = `/dashboard/new?template=${template}`;

  const handleClick = (e: React.MouseEvent) => {
    if (isSignedIn()) return; // normal nav to the builder
    e.preventDefault();
    setRedirecting(true);
    const signInUrl = `/${locale}/sign-in?redirect_url=${encodeURIComponent(
      `/${locale}${target}`
    )}`;
    window.setTimeout(() => {
      window.location.href = signInUrl;
    }, 1100);
  };

  return (
    <>
      <Link href={target} className={className} onClick={handleClick}>
        {label}
      </Link>

      {redirecting && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-6 z-[100] mx-auto flex w-fit max-w-[90vw] items-center gap-3 rounded-full border border-[var(--land-border)] bg-[var(--land-surface)] px-5 py-3 text-sm text-[var(--land-bright)] shadow-lg"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--land-accent)]" />
          {locale === "ar"
            ? "سجّل الدخول لاستخدام هذا القالب… جارٍ التحويل"
            : "Sign in to use this template… redirecting"}
        </div>
      )}
    </>
  );
}
