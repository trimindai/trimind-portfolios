"use client";

import { useAuth, useSession, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
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
 *
 * GRACE WINDOW (fix/otp-signin): even after setActive() succeeds, clerk-js can
 * report isLoaded=true with the just-set session still settling for a beat on
 * the fresh post-sign-in load (Safari ITP cookie read is async). Bouncing on
 * that first frame killed a valid login → the +965 reset. We now wait a short
 * grace before redirecting; if the session resolves in that window the deps
 * change and the pending redirect is cancelled. This only DELAYS the bounce —
 * a genuinely signed-out user is still sent to sign-in after the grace.
 */

// ⚠️ TEMPORARY DEBUG — master switch. Even when true, the on-screen diagnostics
// bar ONLY renders when the URL carries ?debug=1, so normal prod users never see
// it; the owner enables it by adding ?debug=1 to the /build URL. Flip to false
// (or delete the AuthDebugBadge block + this const) to remove entirely.
const SHOW_AUTH_DEBUG = true;

// How long to wait for a settling session before giving up and bouncing.
const REDIRECT_GRACE_MS = 1800;

export default function BuildAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session: hookSession } = useSession();
  const clerk = useClerk();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";

  // The session clerk-js actually holds, even when useAuth() says signed-out
  // (pending sessions surface here, not via isSignedIn).
  const session = hookSession ?? (clerk.loaded ? clerk.session : null);
  const pending = !isSignedIn && !!session;

  // True while we're counting down the grace window before a bounce (debug only).
  const [bouncing, setBouncing] = useState(false);

  // Diagnostics bar renders only with ?debug=1 in the URL (owner-only). Read in
  // an effect (client-only) so SSR/first paint match — no hydration mismatch.
  const [showDebug, setShowDebug] = useState(false);
  useEffect(() => {
    setShowDebug(
      SHOW_AUTH_DEBUG &&
        new URLSearchParams(window.location.search).get("debug") === "1",
    );
  }, []);

  useEffect(() => {
    // Only consider bouncing when there is truly no session right now.
    if (!(isLoaded && !isSignedIn && !session)) {
      setBouncing(false);
      return;
    }
    // Grace: wait for a just-set session to settle before redirecting. If it
    // resolves, this effect re-runs (deps changed) and clears the timeout, so
    // we never bounce a valid login. If it stays empty, bounce after the grace.
    setBouncing(true);
    const t = setTimeout(() => {
      const returnTo = window.location.pathname + window.location.search;
      window.location.assign(
        `/${locale}/sign-in?redirect_url=${encodeURIComponent(returnTo)}`,
      );
    }, REDIRECT_GRACE_MS);
    return () => clearTimeout(t);
  }, [isLoaded, isSignedIn, session, locale]);

  let content: React.ReactNode;
  if (!isLoaded) {
    content = <GateScreen text={isAr ? "جاري التحميل…" : "Loading…"} />;
  } else if (isSignedIn) {
    content = <>{children}</>;
  } else if (pending) {
    // Signed-out but a session exists = pending Clerk task / restriction. Show
    // the reason instead of bouncing. The status line is the diagnostic.
    const status = (session as { status?: string })?.status ?? "unknown";
    const task = (session as { currentTask?: { key?: string } })?.currentTask;
    content = (
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
  } else {
    // isLoaded && !isSignedIn && no session → inside the grace window, about to
    // redirect (effect above). Show loading, not a bounce, so a settling
    // session has a chance to appear.
    content = <GateScreen text={isAr ? "جاري التحميل…" : "Loading…"} />;
  }

  return (
    <>
      {showDebug && (
        <AuthDebugBadge
          clerkLoaded={clerk.loaded}
          authLoaded={!!isLoaded}
          isSignedIn={!!isSignedIn}
          status={(session as { status?: string })?.status ?? null}
          userId={userId ?? null}
          bouncing={bouncing}
        />
      )}
      {content}
    </>
  );
}

function GateScreen({ text }: { text: string }) {
  return (
    <div className="min-h-screen bg-[var(--land-bg)] flex items-center justify-center">
      <div className="text-[var(--land-body)] text-sm">{text}</div>
    </div>
  );
}

/**
 * ⚠️ TEMPORARY — remove with SHOW_AUTH_DEBUG. On-screen auth diagnostics so the
 * owner's real-phone OTP repro reveals the exact failure: whether clerk-js
 * loaded, whether it sees a session, and whether the session cookies survived
 * the post-sign-in navigation (the Safari ITP suspect).
 */
function AuthDebugBadge({
  clerkLoaded,
  authLoaded,
  isSignedIn,
  status,
  userId,
  bouncing,
}: {
  clerkLoaded: boolean;
  authLoaded: boolean;
  isSignedIn: boolean;
  status: string | null;
  userId: string | null;
  bouncing: boolean;
}) {
  const [cookies, setCookies] = useState("…");
  useEffect(() => {
    const has = (name: string) =>
      document.cookie.split("; ").some((c) => c.startsWith(name + "="));
    setCookies(
      `__client:${has("__client") ? "Y" : "n"} __session:${has("__session") ? "Y" : "n"} __client_uat:${has("__client_uat") ? "Y" : "n"}`,
    );
  }, [clerkLoaded, isSignedIn, status]);
  return (
    <div
      dir="ltr"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#7CFC9E",
        font: "11px/1.5 ui-monospace, monospace",
        padding: "6px 10px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {`DEBUG /build gate — clerkLoaded:${clerkLoaded} authLoaded:${authLoaded} isSignedIn:${isSignedIn} session:${status ?? "null"} userId:${userId ? userId.slice(0, 10) + "…" : "null"} ${bouncing ? "⏳bouncing-in-grace" : ""}\ncookies ${cookies}`}
    </div>
  );
}
