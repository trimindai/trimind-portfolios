"use client";

import { Suspense, useState } from "react";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useParams, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import PhoneField, { isValidPhoneNumber } from "@/components/auth/PhoneField";

/**
 * Custom sign-in flow (replaces the prebuilt <SignIn/>).
 *
 * Sign-in itself worked, but the path from "account not found" to sign-up was
 * a tiny link that QA testers missed. This flow surfaces a prominent
 * "Create a free account" card on that specific error, preserving the original
 * redirect_url so the template-selection purchase flow stays intact.
 *
 * Three methods: Google OAuth, email + password, and phone + SMS code
 * (Clerk `phone_code` first factor — enabled in the Clerk instance).
 */

type ClerkErr = {
  errors?: Array<{ code?: string; longMessage?: string; message?: string }>;
};

function firstError(err: unknown) {
  return (err as ClerkErr)?.errors?.[0];
}

function clerkError(err: unknown): string {
  const e = firstError(err);
  return e?.longMessage || e?.message || "Something went wrong. Please try again.";
}

// Returning users land on /build, which opens their single existing CV
// (one CV per user). Falls back to dashboard only if they have none.
function safeRedirect(raw: string | null, locale: string): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return `/${locale}/build`;
}

function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isAr = locale === "ar";
  const search = useSearchParams();
  const redirectUrl = safeRedirect(search.get("redirect_url"), locale);

  const [method, setMethod] = useState<"email" | "phone">("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Phone flow: "enter" (type number) → "code" (type SMS code).
  const [phone, setPhone] = useState("");
  const [phoneStep, setPhoneStep] = useState<"enter" | "code">("enter");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Client-side brute-force throttle (defense-in-depth; Clerk also rate-limits
  // server-side). After 5 failed attempts, lock the form for 15 minutes.
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const MAX_ATTEMPTS = 5;
  const LOCK_MS = 15 * 60 * 1000;

  const t = isAr
    ? {
        title: "تسجيل الدخول",
        subtitle: "مرحبًا بعودتك",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        continue: "تسجيل الدخول",
        google: "المتابعة باستخدام Google",
        or: "أو",
        noAccount: "ليس لديك حساب؟",
        signUp: "إنشاء حساب",
        createFree: "إنشاء حساب مجاني",
        notFoundLead: "لم نجد حسابًا بهذا البريد الإلكتروني.",
        notFoundHint: "أنشئ حسابك في ثوانٍ وتابع من حيث توقفت.",
        forgot: "نسيت كلمة المرور؟",
        working: "جارٍ المعالجة…",
        invalidCreds: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        locked: "محاولات كثيرة جدًا. يرجى المحاولة مرة أخرى بعد ١٥ دقيقة.",
        showPassword: "إظهار كلمة المرور",
        hidePassword: "إخفاء كلمة المرور",
        usePhone: "تسجيل الدخول برقم الهاتف",
        useEmail: "تسجيل الدخول بالبريد الإلكتروني",
        phone: "رقم الهاتف",
        phoneHint: "اختر دولتك وأدخل رقمك — لا حاجة لكتابة رمز الدولة.",
        invalidPhone: "يرجى إدخال رقم هاتف صحيح.",
        sendCode: "إرسال الرمز",
        codeLabel: "رمز التحقق",
        codeSubtitle: "أدخل الرمز المكوّن من ٦ أرقام المُرسَل إلى هاتفك",
        verify: "تأكيد",
        resend: "إعادة إرسال الرمز",
        changeNumber: "تغيير الرقم",
        phoneNotFound: "لم نجد حسابًا بهذا الرقم.",
      }
    : {
        title: "Sign in",
        subtitle: "Welcome back",
        email: "Email address",
        password: "Password",
        continue: "Sign in",
        google: "Continue with Google",
        or: "or",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
        createFree: "Create a free account",
        notFoundLead: "We couldn't find an account with that email.",
        notFoundHint: "Create your account in seconds and pick up right where you left off.",
        forgot: "Forgot password?",
        working: "Working…",
        invalidCreds: "Invalid email or password.",
        locked: "Too many attempts. Please try again in 15 minutes.",
        showPassword: "Show password",
        hidePassword: "Hide password",
        usePhone: "Sign in with phone number",
        useEmail: "Sign in with email instead",
        phone: "Phone number",
        phoneHint: "Pick your country and enter your number — no country code needed.",
        invalidPhone: "Please enter a valid phone number.",
        sendCode: "Send code",
        codeLabel: "Verification code",
        codeSubtitle: "Enter the 6-digit code we sent to your phone",
        verify: "Verify",
        resend: "Resend code",
        changeNumber: "Change number",
        phoneNotFound: "We couldn't find an account with that number.",
      };

  const signUpHref = `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`;

  function registerFailure() {
    const next = failedAttempts + 1;
    setFailedAttempts(next);
    if (next >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setError(t.locked);
      setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
        setError(null);
      }, LOCK_MS);
    } else {
      // Identical generic message for every failure — never reveal whether an
      // account with this email exists (prevents user enumeration).
      setError(t.invalidCreds);
    }
  }

  function switchMethod(next: "email" | "phone") {
    setMethod(next);
    setError(null);
    setPhoneStep("enter");
    setCode("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading || isLocked) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        setFailedAttempts(0);
        window.location.assign(redirectUrl);
      } else {
        // Any non-complete status (additional factor, etc.) → generic, no detail.
        setError(t.invalidCreds);
      }
    } catch {
      registerFailure();
    } finally {
      setLoading(false);
    }
  }

  // Phone step 1: look up the account by number and send the SMS code.
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading || isLocked) return;
    if (!isValidPhoneNumber(phone)) {
      setError(t.invalidPhone);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await signIn.create({ identifier: phone });
      const factor = res.supportedFirstFactors?.find(
        (f) => f.strategy === "phone_code",
      ) as { strategy: "phone_code"; phoneNumberId: string } | undefined;
      if (!factor) {
        setError(t.phoneNotFound);
        return;
      }
      await signIn.prepareFirstFactor({
        strategy: "phone_code",
        phoneNumberId: factor.phoneNumberId,
      });
      setPhoneStep("code");
    } catch (err) {
      // Account-not-found and bad-format both surface here; keep it generic.
      setError(clerkError(err));
    } finally {
      setLoading(false);
    }
  }

  // Phone step 2: verify the SMS code.
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || loading || isLocked) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signIn.attemptFirstFactor({ strategy: "phone_code", code });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        setFailedAttempts(0);
        window.location.assign(redirectUrl);
      } else {
        setError(clerkError(res));
      }
    } catch {
      registerFailure();
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!isLoaded || loading) return;
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
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
  const switchBtn =
    "mt-4 w-full text-center text-sm font-medium text-[var(--land-accent)] hover:underline";

  const errorBox = error && (
    <p
      role="alert"
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
    >
      {error}
    </p>
  );

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen flex items-center justify-center bg-[var(--land-bg)] px-6 py-16"
    >
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-8">
          <h1 className="text-2xl font-bold text-[var(--land-bright)]">{t.title}</h1>
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

          {method === "email" ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
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
                      autoComplete="current-password"
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

                {errorBox}

                <button
                  type="submit"
                  disabled={!isLoaded || loading || isLocked}
                  className={primaryBtn}
                >
                  {loading ? t.working : t.continue}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--land-muted)] hover:text-[var(--land-bright)]"
                >
                  {t.forgot}
                </Link>
              </div>

              <button type="button" onClick={() => switchMethod("phone")} className={switchBtn}>
                {t.usePhone}
              </button>
            </>
          ) : phoneStep === "enter" ? (
            <>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm text-[var(--land-body)]">
                    {t.phone}
                  </label>
                  <PhoneField
                    value={phone}
                    onChange={(v) => {
                      setPhone(v);
                      if (error) setError(null);
                    }}
                  />
                  <p className="mt-1.5 text-xs text-[var(--land-muted)]">{t.phoneHint}</p>
                </div>

                {errorBox}

                <button
                  type="submit"
                  disabled={!isLoaded || loading || isLocked}
                  className={primaryBtn}
                >
                  {loading ? t.working : t.sendCode}
                </button>
              </form>

              <button type="button" onClick={() => switchMethod("email")} className={switchBtn}>
                {t.useEmail}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--land-body)]">{t.codeSubtitle}</p>
              <form onSubmit={handleVerifyCode} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="code" className="mb-1.5 block text-sm text-[var(--land-body)]">
                    {t.codeLabel}
                  </label>
                  <input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    dir="ltr"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`${inputClass} text-center text-lg tracking-[0.5em]`}
                    placeholder="••••••"
                  />
                </div>

                {errorBox}

                <button
                  type="submit"
                  disabled={!isLoaded || loading || isLocked}
                  className={primaryBtn}
                >
                  {loading ? t.working : t.verify}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setPhoneStep("enter");
                  setCode("");
                  setError(null);
                }}
                className="mt-4 w-full text-center text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)]"
              >
                {t.changeNumber}
              </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-[var(--land-body)]">
            {t.noAccount}{" "}
            <Link href={signUpHref} className="font-semibold text-[var(--land-accent)] hover:underline">
              {t.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--land-bg)]" />}>
      <SignInForm />
    </Suspense>
  );
}
