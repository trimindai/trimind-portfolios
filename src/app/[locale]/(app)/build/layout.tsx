"use client";

import { useAuth, useSession, useClerk } from "@clerk/nextjs";
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
 *
 * IMPORTANT: a "pending" session (an unresolved Clerk task or sign-up
 * restriction) is reported by useAuth() as signed-OUT. The old gate bounced
 * that straight back to sign-in → an infinite loop (the reported bug). We now
 * only redirect when there is GENUINELY no session, and otherwise show WHY,
 * including the session status — so a repro surfaces the cause on screen.
 */
export default function BuildAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { session: hookSession } = useSession();
  const clerk = useClerk();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  // The session clerk-js actually holds, even when useAuth() says signed-out
  // (pending sessions surface here, not via isSignedIn).
  const session = hookSession ?? (clerk.loaded ? clerk.session : null);
  const pending = !isSignedIn && !!session;

  useEffect(() => {
    // Only bounce to sign-in when there is truly no session. NEVER loop a
    // pending session back to sign-in — that was the infinite bounce.
    if (isLoaded && !isSignedIn && !session) {
      const returnTo = window.location.pathname + window.location.search;
      window.location.assign(
        `/${locale}/sign-in?redirect_url=${encodeURIComponent(returnTo)}`,
      );
    }
  }, [isLoaded, isSignedIn, session, locale]);

  if (!isLoaded) return <GateScreen text={isAr ? "جاري التحميل…" : "Loading…"} />;
  if (isSignedIn) return <>{children}</>;

  // Signed-out but a session exists = pending Clerk task / restriction. Show the
  // reason instead of bouncing. The status line is the diagnostic we need.
  if (pending) {
    const status = (session as { status?: string })?.status ?? "unknown";
    const task = (session as { currentTask?: { key?: string } })?.currentTask;
    return (
      <div className="min-h-screen bg-[var(--land-bg)] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-[var(--land-bright)] font-semibold">
            {isAr
              ? "حسابك يحتاج خطوة إضافية قبل المتابعة."
              : "Your account needs one more step before continuing."}
          </p>
          <p className="mt-2 text-xs text-[var(--land-muted)]">
            session: {status}
            {task ? ` · task: ${task.key ?? "yes"}` : ""}
          </p>
          <a
            href={`/${locale}/sign-in`}
            className="mt-4 inline-block text-sm text-[var(--land-accent)] hover:underline"
          >
            {isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}
          </a>
        </div>
      </div>
    );
  }

  // isLoaded && !isSignedIn && no session → about to redirect (effect above).
  return <GateScreen text={isAr ? "جاري التحميل…" : "Loading…"} />;
}

function GateScreen({ text }: { text: string }) {
  return (
    <div className="min-h-screen bg-[var(--land-bg)] flex items-center justify-center">
      <div className="text-[var(--land-body)] text-sm">{text}</div>
    </div>
  );
}
