"use client";

import { useState } from "react";

/**
 * One-field email capture for the landing "more templates coming soon" card.
 * Replaces the old mailto: link (AUDIT conversion rec) — posts to
 * /api/waitlist, which stores the email in the Convex `waitlist` table.
 */
export function WaitlistForm({
  locale,
  source,
}: {
  locale: string;
  source?: string;
}) {
  const isRTL = locale === "ar";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setError(isRTL ? "الرجاء إدخال بريدك الإلكتروني." : "Please enter your email.");
      return;
    }
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, locale: isRTL ? "ar" : "en", source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setError(
          res.status === 400
            ? isRTL
              ? "البريد الإلكتروني غير صالح."
              : "That email doesn't look right."
            : res.status === 429
              ? isRTL
                ? "محاولات كثيرة — حاول بعد دقيقة."
                : "Too many attempts — try again in a minute."
              : data?.error ||
                (isRTL ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.")
        );
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setError(isRTL ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <p
        role="status"
        className="mt-4 text-sm font-medium text-[var(--land-accent)]"
      >
        {isRTL
          ? "✓ تمت إضافتك — سنراسلك عند توفر القوالب الجديدة."
          : "✓ You're on the list — we'll email you when new templates land."}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 w-full max-w-xs" noValidate>
      <div className="flex gap-2">
        <label htmlFor="waitlist-email" className="sr-only">
          {isRTL ? "البريد الإلكتروني" : "Email address"}
        </label>
        <input
          id="waitlist-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          aria-invalid={!!error}
          placeholder={isRTL ? "بريدك الإلكتروني" : "you@email.com"}
          className="min-w-0 flex-1 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)] px-3 py-2 text-sm text-start text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {status === "loading"
            ? isRTL
              ? "..."
              : "..."
            : isRTL
              ? "انضم"
              : "Join"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
      <p className="mt-2 text-[11px] text-[var(--land-muted)]">
        {isRTL
          ? "نراسلك فقط عند إطلاق قوالب جديدة."
          : "We only email you when new templates launch."}
      </p>
    </form>
  );
}
