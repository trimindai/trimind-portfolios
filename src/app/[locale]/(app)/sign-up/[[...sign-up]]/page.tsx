"use client";

import { Suspense, useState } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useParams, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

/**
 * Custom sign-up flow (replaces the prebuilt <SignUp/>).
 *
 * Why custom: this Clerk instance has Smart Turnstile bot-sign-up protection
 * enabled. The prebuilt component rendered its CAPTCHA target collapsed
 * (max-height:0), so when Turnstile needed an interactive challenge it had
 * nowhere to show — legitimate users were silently blocked with a
 * `captcha_missing_token` 400 and the form just reset. Rendering our own
 * sized `#clerk-captcha` element makes Clerk show the *visible* widget so any
 * user can complete the challenge, and we surface every error instead of
 * swallowing it.
 */

function clerkError(err: unknown): string {
  const e = err as { errors?: Array<{ longMessage?: string; message?: string }> };
  return (
    e?.errors?.[0]?.longMessage ||
    e?.errors?.[0]?.message ||
    "Something went wrong. Please try again."
  );
}

// Only allow same-origin relative paths to prevent open-redirects.
// New accounts go straight to the AI builder (/build) instead of the empty
// dashboard. /build itself opens an existing CV for returning users (one CV
// per user), so direct sign-ups land on upload and returning users on their CV.
function safeRedirect(raw: string | null, locale: string): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return `/${locale}/build`;
}

function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const search = useSearchParams();
  const redirectUrl = safeRedirect(search.get("redirect_url"), locale);

  const [step, setStep] = useState<"start" | "verify">("start");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = isAr
    ? {
        title: "أنشئ حسابك",
        subtitle: "ابدأ بناء بورتفوليوك الاحترافي",
        fullName: "الاسم الكامل",
        fullNamePh: "الاسم الكامل",
        nameTooShort: "يرجى إدخال اسمك الكامل.",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        continue: "متابعة",
        google: "المتابعة باستخدام Google",
        or: "أو",
        haveAccount: "لديك حساب بالفعل؟",
        signIn: "تسجيل الدخول",
        verifyTitle: "تأكيد بريدك الإلكتروني",
        verifySubtitle: "أدخل الرمز المكوّن من ٦ أرقام المُرسَل إلى بريدك",
        code: "رمز التحقق",
        verify: "تأكيد",
        resend: "إعادة إرسال الرمز",
        working: "جارٍ المعالجة…",
        showPassword: "إظهار كلمة المرور",
        hidePassword: "إخفاء كلمة المرور",
      }
    : {
        title: "Create your account",
        subtitle: "Start building your professional portfolio",
        fullName: "Full name",
        fullNamePh: "Your full name",
        nameTooShort: "Please enter your full name.",
        email: "Email address",
        password: "Password",
        continue: "Continue",
        google: "Continue with Google",
        or: "or",
        haveAccount: "Already have an account?",
        signIn: "Sign in",
        verifyTitle: "Verify your email",
        verifySubtitle: "Enter the 6-digit code we sent to your inbox",
        code: "Verification code",
        verify: "Verify",
        resend: "Resend code",
        working: "Working…",
        showPassword: "Show password",
        hidePassword: "Hide password",
      };

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading) return;
    if (name.trim().length < 2) {
      setError(t.nameTooShort);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { fullName: name.trim() },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        // Full navigation so middleware runs and Convex picks up the session.
        window.location.assign(redirectUrl);
      } else {
        setError("Verification incomplete. Please check the code and retry.");
      }
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!isLoaded || loading) return;
    setError(null);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `/${locale}/sso-callback`,
        redirectUrlComplete: redirectUrl,
      });
    } catch (err) {
      setError(clerkError(err));
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
          {step === "start" ? (
            <>
              <h1 className="text-2xl font-bold text-[var(--land-bright)]">
                {t.title}
              </h1>
              <p className="mt-1 text-sm text-[var(--land-body)]">{t.subtitle}</p>

              <button
                type="button"
                onClick={handleGoogle}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)] px-4 py-3 text-sm font-medium text-[var(--land-bright)] transition-colors hover:bg-[var(--land-surface-raised)]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
                </svg>
                {t.google}
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-[var(--land-border)]" />
                <span className="text-xs uppercase tracking-wider text-[var(--land-muted)]">
                  {t.or}
                </span>
                <div className="h-px flex-1 bg-[var(--land-border)]" />
              </div>

              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm text-[var(--land-body)]">
                    {t.fullName}
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder={t.fullNamePh}
                  />
                </div>
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
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm text-[var(--land-body)]">
                    {t.password}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pe-11`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 end-3 flex items-center text-[var(--land-muted)] transition-colors hover:text-[var(--land-bright)]"
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    {error}
                  </p>
                )}

                {/* Clerk renders the Turnstile bot-protection widget here. Must be
                    present (and not collapsed) before signUp.create so a visible,
                    completable challenge can show when required. */}
                <div id="clerk-captcha" data-cl-size="flexible" className="min-h-[1px]" />

                <button type="submit" disabled={!isLoaded || loading} className={primaryBtn}>
                  {loading ? t.working : t.continue}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--land-body)]">
                {t.haveAccount}{" "}
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
                  className="font-semibold text-[var(--land-accent)] hover:underline"
                >
                  {t.signIn}
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[var(--land-bright)]">
                {t.verifyTitle}
              </h1>
              <p className="mt-1 text-sm text-[var(--land-body)]">{t.verifySubtitle}</p>

              <form onSubmit={handleVerify} className="mt-6 space-y-4">
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

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    {error}
                  </p>
                )}

                <button type="submit" disabled={!isLoaded || loading} className={primaryBtn}>
                  {loading ? t.working : t.verify}
                </button>
              </form>

              <button
                type="button"
                onClick={() =>
                  signUp?.prepareEmailAddressVerification({ strategy: "email_code" })
                }
                className="mt-4 w-full text-center text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)]"
              >
                {t.resend}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--land-bg)]" />}>
      <SignUpForm />
    </Suspense>
  );
}
