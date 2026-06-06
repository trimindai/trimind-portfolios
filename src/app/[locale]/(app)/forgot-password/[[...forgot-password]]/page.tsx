"use client";

import { Suspense, useState } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

/**
 * In-app password reset flow (replaces the dead link to Clerk's hosted portal).
 *
 * Uses Clerk's `reset_password_email_code` strategy in a single two-step page:
 *   1. "request" — collect the email, send a reset code.
 *   2. "reset"   — collect the code + new password, complete the reset and
 *                  activate the new session, then redirect to the dashboard.
 */

function clerkError(err: unknown): string {
  const e = err as { errors?: Array<{ longMessage?: string; message?: string }> };
  return (
    e?.errors?.[0]?.longMessage ||
    e?.errors?.[0]?.message ||
    "Something went wrong. Please try again."
  );
}

function ForgotForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const locale = (useParams()?.locale as string) || "en";
  const isAr = locale === "ar";

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = isAr
    ? {
        title: "إعادة تعيين كلمة المرور",
        sub: "أدخل بريدك لإرسال رمز إعادة التعيين",
        email: "البريد الإلكتروني",
        send: "إرسال الرمز",
        sent: "تحقق من بريدك ثم أدخل الرمز وكلمة المرور الجديدة.",
        code: "رمز التحقق",
        newPass: "كلمة المرور الجديدة",
        confirm: "تأكيد كلمة المرور",
        reset: "تعيين كلمة المرور",
        working: "جارٍ المعالجة…",
        mismatch: "كلمتا المرور غير متطابقتين.",
        back: "العودة لتسجيل الدخول",
        done: "تم تحديث كلمة المرور بنجاح.",
      }
    : {
        title: "Reset your password",
        sub: "Enter your email and we'll send a reset code",
        email: "Email address",
        send: "Send reset code",
        sent: "Check your email, then enter the code and your new password.",
        code: "Verification code",
        newPass: "New password",
        confirm: "Confirm password",
        reset: "Set new password",
        working: "Working…",
        mismatch: "Passwords don't match.",
        back: "Back to sign in",
        done: "Password updated successfully.",
      };

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setError(null);
    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setInfo(t.sent);
      setStep("reset");
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setLoading(false);
    }
  }

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading) return;
    if (password !== confirm) {
      setError(t.mismatch);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        setInfo(t.done);
        // Full navigation so middleware runs and Convex picks up the session.
        setTimeout(() => window.location.assign(`/${locale}/dashboard`), 1500);
      } else {
        setError("Reset incomplete. Please retry.");
      }
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)] px-4 py-3 text-[var(--land-bright)] placeholder-[var(--land-muted)] outline-none transition-colors focus:border-[var(--land-accent)]";
  const primaryBtn =
    "w-full rounded-lg bg-[var(--land-accent)] px-4 py-3 font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen flex items-center justify-center bg-[var(--land-bg)] px-6 py-16"
    >
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-8">
          <h1 className="text-2xl font-bold text-[var(--land-bright)]">{t.title}</h1>
          <p className="mt-1 text-sm text-[var(--land-body)]">{t.sub}</p>

          {step === "request" ? (
            <form onSubmit={requestCode} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--land-body)]">
                  {t.email}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <button type="submit" disabled={!isLoaded || loading} className={primaryBtn}>
                {loading ? t.working : t.send}
              </button>
            </form>
          ) : (
            <form onSubmit={doReset} className="mt-6 space-y-4">
              {info && (
                <p className="text-sm text-[var(--land-muted)]">{info}</p>
              )}

              <div>
                <label htmlFor="code" className="mb-1.5 block text-sm text-[var(--land-body)]">
                  {t.code}
                </label>
                <input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`${inputClass} text-center text-lg tracking-[0.5em]`}
                  placeholder="••••••"
                />
              </div>

              <div>
                <label htmlFor="newPass" className="mb-1.5 block text-sm text-[var(--land-body)]">
                  {t.newPass}
                </label>
                <input
                  id="newPass"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm text-[var(--land-body)]">
                  {t.confirm}
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <button type="submit" disabled={!isLoaded || loading} className={primaryBtn}>
                {loading ? t.working : t.reset}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-[var(--land-accent)] hover:underline"
            >
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--land-bg)]" />}>
      <ForgotForm />
    </Suspense>
  );
}
