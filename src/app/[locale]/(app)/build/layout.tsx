"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useParams } from "next/navigation";

/**
 * Client-side auth gate for /build (and /build/[id]).
 *
 * Why not middleware: server middleware checks Clerk's short-lived __session
 * cookie, which isn't reliably attached to the FIRST top-level navigation right
 * after sign-in — especially on Safari/iOS (ITP) — so auth.protect() saw "no
 * session" and 307'd the user back to sign-in (intermittent bounce, confirmed
 * in prod logs). Here we gate on clerk-js, which restores the session from the
 * long-lived first-party __client cookie that ITP keeps, so a just-signed-in
 * user is recognised immediately. parse-cv still enforces auth server-side, so
 * this is a UX gate, not the security boundary.
 */
export default function BuildAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      const returnTo = window.location.pathname + window.location.search;
      window.location.assign(
        `/${locale}/sign-in?redirect_url=${encodeURIComponent(returnTo)}`,
      );
    }
  }, [isLoaded, isSignedIn, locale]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[var(--land-bg)] flex items-center justify-center">
        <div className="text-[var(--land-body)] text-sm">
          {locale === "ar" ? "جاري التحميل…" : "Loading…"}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
