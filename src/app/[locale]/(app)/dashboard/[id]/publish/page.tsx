"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  X,
  ExternalLink,
  Copy,
  Loader2,
  CheckCircle2,
  Download,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { HOSTING_ENABLED } from "@/lib/flags";
import { track, GA_CURRENCY, GA_VALUE } from "@/lib/ga";
import { useCurrency } from "@/lib/use-currency";
import { priceNumber, priceLabel, currencySymbol } from "@/lib/currency";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PublishPage() {
  // While hosting is disabled, this route is a PDF checkout — no slug, no
  // hosted URL. Flip HOSTING_ENABLED back on to restore the publish flow.
  if (!HOSTING_ENABLED) {
    return <PdfCheckout />;
  }
  return <HostingPublishPage />;
}

function HostingPublishPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = (params.locale as string) || "en";
  const isRTL = locale === "ar";
  const t = useTranslations("publish");
  const tc = useTranslations("common");

  const { user: clerkUser } = useUser();
  // Boolean-only server check — the admin allowlist no longer ships in the
  // client bundle. Treat "loading" (undefined) as not-admin.
  const isAdmin = useQuery(api.users.isAdmin) === true;

  const portfolio = useQuery(api.portfolios.get, {
    id: id as Id<"portfolios">,
  });

  const [slug, setSlug] = useState("");
  const [mobile, setMobile] = useState("");
  const [slugInitialized, setSlugInitialized] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Selected bundled tier (Free Preview = the watermarked draft, not bought here).
  const [tier, setTier] = useState<"essential" | "pro" | "pro_review">("pro");
  const L = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const cur = useCurrency();
  const loc = locale === "ar" ? "ar" : "en";
  // Display amount for the selected tier in the visitor's currency (KWD default,
  // SAR for Saudi). The actual charge stays KWD — see lib/currency.ts.
  const showPrice = (kwd: number) =>
    cur === "SAR" ? priceNumber(kwd, cur, loc) : kwd.toFixed(3);
  const TIERS = [
    {
      key: "essential" as const,
      price: "4.900",
      kwd: 4.9,
      name: L("CV Essential", "السيرة الأساسية"),
      sub: L("ATS PDF, watermark off — no live page", "PDF احترافي بدون علامة — بدون صفحة"),
    },
    {
      key: "pro" as const,
      price: "9.900",
      kwd: 9.9,
      name: L("Portfolio Pro", "بورتفوليو برو"),
      sub: L("PDF + live page + QR + 1 year hosting", "PDF + صفحة مباشرة + QR + استضافة لمدة سنة"),
      star: true,
    },
    {
      key: "pro_review" as const,
      price: "24.900",
      kwd: 24.9,
      name: L("Pro + Expert Review", "برو + مراجعة خبير"),
      sub: L("Pro + human CV review (48h)", "برو + مراجعة بشرية (٤٨ ساعة)"),
    },
  ];

  const reserveSlugMutation = useMutation(api.portfolios.reserveSlug);

  // Auto-generate slug from name
  useEffect(() => {
    if (portfolio && !slugInitialized) {
      if (portfolio.slug) {
        setSlug(portfolio.slug);
      } else {
        setSlug(slugify(portfolio.basics.fullName));
      }
      setSlugInitialized(true);
    }
  }, [portfolio, slugInitialized]);

  // Surface payment errors returned via query string from the callback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      const map: Record<string, string> = {
        payment_failed: "Payment was not completed. Please try again.",
        amount_mismatch: "Payment amount did not match. Please try again.",
        payment_cancelled: "Payment was cancelled.",
        verification_failed:
          "Could not verify payment. If you were charged, contact support.",
      };
      setError(map[err] || "Payment error. Please try again.");
    }
  }, []);

  // GA4: payment succeeded — the MyFatoorah callback returns here with
  // ?success=1. Fire once per portfolio (sessionStorage guard) so a refresh
  // doesn't double-count the conversion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("success") !== "1") return;
    const key = `ga_purchase_${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    track("purchase", { currency: GA_CURRENCY, value: GA_VALUE });
  }, [id]);

  // Check if already published
  useEffect(() => {
    if (portfolio?.status === "published" && portfolio.slug) {
      setPublished(true);
      setSlug(portfolio.slug);
    }
  }, [portfolio]);

  // Pre-fill the mobile field from the user's Clerk profile so returning users
  // don't retype it. Seeds once, and only if they haven't typed anything yet.
  const [mobilePrefilled, setMobilePrefilled] = useState(false);
  useEffect(() => {
    if (mobilePrefilled || !clerkUser) return;
    const fromProfile =
      (clerkUser.unsafeMetadata?.phone as string | undefined) ||
      clerkUser.primaryPhoneNumber?.phoneNumber ||
      clerkUser.phoneNumbers?.[0]?.phoneNumber ||
      "";
    if (fromProfile) {
      // Digits only; drop a leading Kuwait country code (965) so it isn't
      // duplicated next to the fixed "+965" prefix shown beside the input.
      let digits = fromProfile.replace(/\D/g, "");
      if (digits.startsWith("965") && digits.length > 8) digits = digits.slice(3);
      setMobile(digits.slice(0, 12));
    }
    setMobilePrefilled(true);
  }, [clerkUser, mobilePrefilled]);

  // Slug availability check — uses isSlugTaken which inspects ALL
  // portfolios (drafts + published). getBySlug is for public viewing only
  // and won't see unpublished portfolios.
  const slugTaken = useQuery(
    api.portfolios.isSlugTaken,
    slug.length >= 2 ? { slug } : "skip"
  );

  const slugAvailable = useMemo(() => {
    if (slug.length < 2) return null;
    if (slugTaken === undefined) return null; // loading
    if (slugTaken === null) return true; // available
    // It's available if it's the same portfolio (re-publishing).
    return slugTaken.ownerPortfolioId === id;
  }, [slugTaken, id, slug]);

  // When the chosen name is taken, fetch a few available alternatives to offer
  // as one-click chips. Skips the query while the name is free/loading.
  const suggestions = useQuery(
    api.portfolios.suggestSlugs,
    slugAvailable === false && slug.length >= 2 ? { base: slug } : "skip"
  );

  const portfolioUrl = `https://portfolio-trimind.com/p/${slug}`;

  // Essential = PDF only, so it never needs a public slug.
  const essentialDraft =
    portfolio?.status === "draft" && !isAdmin && tier === "essential";

  const handlePublish = useCallback(async () => {
    if (!portfolio) return;
    if (!essentialDraft && !slugAvailable) return;

    setPublishing(true);
    setError(null);

    try {
      // Lock the name FIRST, before any slow step (payment, HTML generation),
      // so no one else can grab it — and so the user never pays for a name they
      // then lose. Already-published re-publishes keep their existing name.
      if (portfolio.status !== "published" && !essentialDraft) {
        try {
          await reserveSlugMutation({ id: id as Id<"portfolios">, slug });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "";
          if (msg.includes("taken")) {
            setError(t("takenTryAnother"));
            setPublishing(false);
            return;
          }
          throw e;
        }
      }

      // Draft → need payment or free-access grant first (admins skip entirely).
      if (portfolio.status === "draft" && !isAdmin) {
        // Try free-access grant first — server checks FREE_ACCESS_EMAILS.
        const freeRes = await fetch("/api/free-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId: id }),
        });

        if (freeRes.ok) {
          // Free access granted — portfolio is now "paid" server-side.
          // Fall through to HTML generation + publish.
        } else if (freeRes.status === 403) {
          // Not eligible for free access — payment is due. MyFatoorah needs a
          // valid mobile to deliver the invoice (NotificationOption "ALL").
          const mobileDigits = mobile.replace(/\D/g, "");
          if (mobileDigits.length < 8) {
            setError(
              isRTL
                ? "أدخل رقم هاتف صحيح (٨ أرقام) للمتابعة إلى الدفع."
                : "Enter a valid mobile number (8 digits) to continue to payment."
            );
            setPublishing(false);
            return;
          }
          // Redirect to MyFatoorah payment.
          const payRes = await fetch("/api/myfatoorah/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              portfolioId: id,
              locale,
              tier,
              mobile: mobileDigits,
              mobileCountryCode: "+965",
            }),
          });

          const payData = await payRes.json();
          if (!payRes.ok) {
            throw new Error(payData.error || "Failed to start payment");
          }

          // Reconciled: a completed payment already existed and the portfolio
          // was just marked paid server-side — fall through to publish.
          if (!payData.alreadyPaid) {
            if (!payData.paymentUrl) {
              throw new Error("Failed to start payment");
            }
            // GA4: user is leaving for the payment gateway — top of the funnel.
            track("begin_checkout", { currency: GA_CURRENCY, value: GA_VALUE });
            window.location.href = payData.paymentUrl;
            return;
          }
        } else {
          throw new Error("Something went wrong. Please try again.");
        }
      }

      // Paid/free-access → server renders the HTML from stored data and
      // publishes (the browser never supplies markup).
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId: id, slug, locale }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "slug_taken") {
          setError(t("takenTryAnother"));
          setPublishing(false);
          return;
        }
        if (body.error === "payment_required") {
          throw new Error("Portfolio is not paid");
        }
        throw new Error("Failed to publish portfolio. Please try again.");
      }

      setPublished(true);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      // Strip Convex internal error prefixes — never expose mutation names.
      const cleaned = raw.replace(/\[CONVEX [A-Z]\([^\)]*\)\]\s*/g, "").trim();
      const userMessage =
        cleaned === "Portfolio is not paid"
          ? "Payment required. Please complete payment to publish."
          : cleaned === "Unauthenticated"
            ? "Your session expired. Please sign in again."
            : cleaned && !cleaned.toLowerCase().includes("server error")
              ? cleaned
              : "Something went wrong while publishing. Please try again.";
      setError(userMessage);
    } finally {
      setPublishing(false);
    }
  }, [portfolio, slugAvailable, locale, slug, mobile, isRTL, id, reserveSlugMutation, isAdmin, t, tier, essentialDraft]);

  // Essential buyers can upgrade to Pro (live page + QR) for the delta price.
  const upgradeToPro = useCallback(async () => {
    setPublishing(true);
    setError(null);
    try {
      const mobileDigits = mobile.replace(/\D/g, "");
      const payRes = await fetch("/api/myfatoorah/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioId: id,
          locale,
          tier: "pro",
          mobile: mobileDigits || undefined,
          mobileCountryCode: "+965",
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.message || payData.error || "Failed");
      if (payData.paymentUrl) {
        window.location.href = payData.paymentUrl;
        return;
      }
      if (payData.alreadyPaid) window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPublishing(false);
    }
  }, [id, locale, mobile]);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for clipboard API failure
    }
  }, [portfolioUrl]);

  // Loading state
  if (portfolio === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--land-accent)]" />
          <span className="text-sm text-[var(--land-body)]">{tc("loading")}</span>
        </div>
      </div>
    );
  }

  // Not found
  if (portfolio === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)]">
        <p className="text-[var(--land-body)]">Portfolio not found.</p>
      </div>
    );
  }

  // Essential = PDF only: after payment there's no public page to publish, so
  // show the download + an upgrade-to-Pro path instead of the publish form.
  const effTier =
    portfolio.tier ??
    (portfolio.status === "paid" || portfolio.status === "published"
      ? "pro"
      : null);
  if (
    portfolio.status === "paid" &&
    effTier === "essential" &&
    !isAdmin &&
    !published
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--land-accent-subtle)]">
            <CheckCircle2 className="h-12 w-12 text-[var(--land-accent)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--land-bright)]">
            {L("Your CV is ready", "سيرتك جاهزة")}
          </h1>
          <p className="mt-2 text-sm text-[var(--land-body)]">
            {L(
              "Paid ✓ — download your watermark-free PDF.",
              "تم الدفع ✓ — حمّل ملف PDF بدون علامة مائية."
            )}
          </p>
          <Link
            href={`/dashboard/${id}/preview?paid=1`}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--land-accent-hover)]"
          >
            <Download className="h-4 w-4" />
            {L("Download CV PDF", "حمّل ملف PDF")}
          </Link>
          <button
            onClick={() => upgradeToPro()}
            disabled={publishing}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface-raised)] px-6 py-3 text-sm font-medium text-[var(--land-bright)] transition-colors hover:bg-[var(--land-border)] disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {L(
              `Upgrade to Pro — ${priceLabel(5.0, cur, "en")} (live page + QR)`,
              `ترقية إلى برو — ${priceLabel(5.0, cur, "ar")} (صفحة مباشرة + QR)`
            )}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <Link
            href="/dashboard"
            className="mt-6 inline-block text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)]"
          >
            {L("Back to Dashboard", "العودة للوحة")}
          </Link>
        </div>
      </div>
    );
  }

  // Published success state
  if (published) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-8 text-center">
          {/* Animated checkmark */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--land-accent-subtle)]">
            <CheckCircle2 className="h-12 w-12 text-[var(--land-accent)] animate-in zoom-in duration-500" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--land-bright)]">{t("published")}</h1>

          {/* URL display */}
          <div className="mt-6 rounded-lg bg-[var(--land-surface-raised)] p-3">
            <p className="font-mono text-sm text-[var(--land-accent-hover)] break-all">
              {portfolioUrl}
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--land-accent-hover)]"
            >
              <ExternalLink className="h-4 w-4" />
              {t("visitSite")}
            </a>
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface-raised)] px-6 py-3 text-sm font-medium text-[var(--land-bright)] transition-colors hover:bg-[var(--land-border)] hover:text-[var(--land-bright)]"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[var(--land-accent)]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : t("copyUrl")}
            </button>
          </div>

          {/* Download PDF — paying also unlocks the print-ready PDF (carrying the
              QR that points back at this live page), so offer it right here. */}
          <Link
            href={`/dashboard/${id}/preview?paid=1`}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface-raised)] px-6 py-3 text-sm font-medium text-[var(--land-bright)] transition-colors hover:bg-[var(--land-border)]"
          >
            <Download className="h-4 w-4" />
            {t("downloadPdf")}
          </Link>

          {/* Back to dashboard */}
          <Link
            href="/dashboard"
            className="mt-6 inline-block text-sm text-[var(--land-muted)] transition-colors hover:text-[var(--land-bright)]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Publish form
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)] px-4">
      <div className="w-full max-w-lg">
        {/* Back link */}
        <Link
          href={`/dashboard/${id}/preview`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--land-body)] transition-colors hover:text-[var(--land-bright)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Preview
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-8">
          <h1 className="text-2xl font-bold text-[var(--land-bright)]">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--land-body)]">{t("chooseSlug")}</p>

          {/* Choose a plan — only drafts (non-admin) actually pay. */}
          {portfolio.status === "draft" && !isAdmin && (
            <div className="mt-6 space-y-2">
              <p className="text-xs uppercase tracking-wider text-[var(--land-muted)]">
                {L("Choose your plan", "اختر باقتك")}
              </p>
              {TIERS.map((tplan) => {
                const active = tier === tplan.key;
                return (
                  <button
                    key={tplan.key}
                    type="button"
                    onClick={() => setTier(tplan.key)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-start transition-colors ${
                      active
                        ? "border-[var(--land-accent)] bg-[var(--land-accent-subtle)]/40"
                        : "border-[var(--land-border)] bg-[var(--land-surface-raised)]/60 hover:border-[var(--land-accent)]/60"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--land-bright)]">
                          {tplan.name}
                        </span>
                        {"star" in tplan && tplan.star && (
                          <span className="rounded-full bg-[var(--land-accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                            {L("RECOMMENDED", "موصى به")}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--land-muted)]">
                        {tplan.sub}
                      </span>
                    </span>
                    <span className="shrink-0 text-end">
                      <span className="block text-lg font-bold text-[var(--land-bright)]">
                        {showPrice(tplan.kwd)}
                      </span>
                      <span className="block text-[10px] text-[var(--land-muted)]">
                        {`${currencySymbol(cur, loc)} · ${L("per year", "سنوياً")}`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Slug input — hidden for Essential (PDF only, no public page). */}
          <div className={`mt-6 ${essentialDraft ? "hidden" : ""}`}>
            <label className="mb-2 block text-sm font-medium text-[var(--land-bright)]">
              {t("chooseSlug")}
            </label>
            <div className="flex items-center gap-0 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface-raised)] focus-within:border-[var(--land-accent)] focus-within:ring-1 focus-within:ring-[var(--land-accent)]/50">
              <span className="whitespace-nowrap border-r border-[var(--land-border)] px-3 py-2.5 text-sm text-[var(--land-muted)]">
                {t("slugPrefix")}
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--land-bright)] placeholder-[var(--land-muted)] outline-none"
                placeholder="your-name"
              />
              {/* Availability indicator */}
              <div className="px-3">
                {slug.length >= 2 && slugAvailable === null && (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--land-muted)]" />
                )}
                {slugAvailable === true && (
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-[var(--land-accent)]" />
                  </div>
                )}
                {slugAvailable === false && (
                  <div className="flex items-center gap-1">
                    <X className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Availability message */}
            {slug.length >= 2 && slugAvailable === true && (
              <p className="mt-2 text-sm text-[var(--land-accent)]">{t("available")}</p>
            )}
            {slugAvailable === false && (
              <p className="mt-2 text-sm text-red-500">{t("taken")}</p>
            )}

            {/* One-click available alternatives when the chosen name is taken */}
            {slugAvailable === false && suggestions && suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-[var(--land-muted)]">
                  {t("suggestionsLabel")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlug(s)}
                      className="rounded-full border border-[var(--land-border)] bg-[var(--land-surface-raised)] px-3 py-1 font-mono text-xs text-[var(--land-accent-hover)] transition-colors hover:border-[var(--land-accent)] hover:text-[var(--land-bright)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* URL preview */}
            <div className="mt-4 rounded-lg bg-[var(--land-surface-raised)]/50 p-3">
              <p className="font-mono text-sm text-[var(--land-body)] break-all">
                {portfolioUrl}
              </p>
            </div>
          </div>

          {/* Mobile — only when a payment is actually due (draft, non-admin).
              MyFatoorah uses it to deliver the invoice/receipt by SMS + email. */}
          {portfolio.status === "draft" && !isAdmin && (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[var(--land-bright)]">
                {isRTL ? "رقم الهاتف" : "Mobile number"}
              </label>
              <div className="flex items-center gap-0 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface-raised)] focus-within:border-[var(--land-accent)] focus-within:ring-1 focus-within:ring-[var(--land-accent)]/50">
                <span className="whitespace-nowrap border-r border-[var(--land-border)] px-3 py-2.5 text-sm text-[var(--land-muted)]">
                  +965
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/[^\d]/g, "").slice(0, 12))
                  }
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--land-bright)] placeholder-[var(--land-muted)] outline-none"
                  placeholder="5XXXXXXX"
                  dir="ltr"
                />
              </div>
              <p className="mt-2 text-xs text-[var(--land-muted)]">
                {isRTL
                  ? "لإرسال الفاتورة والإيصال عبر الرسائل والبريد."
                  : "For your invoice and receipt via SMS/email."}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={
              publishing ||
              (!essentialDraft && (!slugAvailable || slug.length < 2))
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--land-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {portfolio.status === "draft" && !isAdmin
                  ? L("Redirecting to payment…", "جارٍ التحويل للدفع…")
                  : L("Publishing…", "جارٍ النشر…")}
              </>
            ) : portfolio.status === "draft" && !isAdmin ? (
              `${L("Pay", "ادفع")} ${priceLabel(
                TIERS.find((x) => x.key === tier)?.kwd ?? 0,
                cur,
                loc
              )}`
            ) : (
              tc("publish")
            )}
          </button>

          {/* When the button is disabled only because the name isn't ready, say
              so — a greyed-out button with no explanation reads as "broken". */}
          {portfolio.status === "draft" &&
            !isAdmin &&
            !essentialDraft &&
            !publishing &&
            (!slugAvailable || slug.length < 2) && (
              <p className="mt-2 text-center text-xs text-[var(--land-muted)]">
                {t("slugReadyHint")}
              </p>
            )}

          {/* Trust signals — only where a payment is actually due. */}
          {portfolio.status === "draft" && !isAdmin && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--land-body)]">
                <svg
                  className="h-4 w-4 shrink-0 text-[var(--land-accent)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                {t("trustSecure")}
              </div>
              <p className="text-center text-xs text-[var(--land-muted)]">
                {t("trustMethods")}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--land-body)]">
                <svg
                  className="h-4 w-4 shrink-0 text-[var(--land-accent)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {t("trustEdit")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * PDF checkout (shown while HOSTING_ENABLED is false). The 4.900 KD payment
 * unlocks the downloadable PDF instead of a hosted URL. No slug, no hosting.
 * After a successful payment the user is sent back to the preview page where
 * the now-unlocked "Download PDF" button saves the portfolio.
 */
function PdfCheckout() {
  const params = useParams();
  const id = params.id as string;
  const locale = (params.locale as string) || "en";
  const isRTL = locale === "ar";
  const tc = useTranslations("common");

  // Boolean-only server check — the admin allowlist no longer ships in the
  // client bundle. Treat "loading" (undefined) as not-admin.
  const isAdmin = useQuery(api.users.isAdmin) === true;

  const portfolio = useQuery(api.portfolios.get, {
    id: id as Id<"portfolios">,
  });

  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Absolute (locale-prefixed) so window.location redirects keep the locale.
  const previewHref = `/${locale}/dashboard/${id}/preview?paid=1`;

  // Surface payment errors / success returned via query string.
  const [paidViaCallback, setPaidViaCallback] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("success") === "1") setPaidViaCallback(true);
    const err = sp.get("error");
    if (err) {
      const map: Record<string, string> = {
        payment_failed: "Payment was not completed. Please try again.",
        amount_mismatch: "Payment amount did not match. Please try again.",
        payment_cancelled: "Payment was cancelled.",
        verification_failed:
          "Could not verify payment. If you were charged, contact support.",
      };
      setError(map[err] || "Payment error. Please try again.");
    }
  }, []);

  const unlocked =
    isAdmin ||
    portfolio?.status === "paid" ||
    portfolio?.status === "published";

  const handleGetPdf = useCallback(async () => {
    if (!portfolio) return;

    // Admins and already-paid users go straight to the download.
    if (
      isAdmin ||
      portfolio.status === "paid" ||
      portfolio.status === "published"
    ) {
      window.location.href = previewHref;
      return;
    }

    setWorking(true);
    setError(null);
    try {
      // Free-access allowlist first (server checks FREE_ACCESS_EMAILS).
      const freeRes = await fetch("/api/free-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId: id }),
      });

      if (freeRes.ok) {
        window.location.href = previewHref;
        return;
      }

      if (freeRes.status !== 403) {
        throw new Error("Something went wrong. Please try again.");
      }

      // Not eligible for free access → MyFatoorah payment.
      const payRes = await fetch("/api/myfatoorah/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioId: id, locale }),
      });
      const payData = await payRes.json();
      // Use the backend's friendly `message`; never surface the raw `error`
      // code or any provider error string to the user.
      if (!payRes.ok)
        throw new Error(
          payData.message || "Payment could not be started. Please try again."
        );

      if (payData.alreadyPaid) {
        window.location.href = previewHref;
        return;
      }
      if (!payData.paymentUrl) throw new Error("Failed to start payment");
      window.location.href = payData.paymentUrl;
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const cleaned = raw.replace(/\[CONVEX [A-Z]\([^\)]*\)\]\s*/g, "").trim();
      setError(cleaned || "Something went wrong. Please try again.");
      setWorking(false);
    }
  }, [portfolio, isAdmin, id, locale, previewHref]);

  // Loading / not found
  if (portfolio === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--land-accent)]" />
          <span className="text-sm text-[var(--land-body)]">{tc("loading")}</span>
        </div>
      </div>
    );
  }
  if (portfolio === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)]">
        <p className="text-[var(--land-body)]">Portfolio not found.</p>
      </div>
    );
  }

  // Already unlocked → confirmation + download CTA.
  if (unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--land-accent-subtle)]">
            <CheckCircle2 className="h-12 w-12 text-[var(--land-accent)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--land-bright)]">
            {isRTL ? "بورتفوليوك جاهز" : "Your portfolio is ready"}
          </h1>
          <p className="mt-3 text-sm text-[var(--land-body)]">
            {isRTL
              ? "اضغط الزر أدناه لمعاينة بورتفوليوك وحفظه كملف PDF."
              : "Open your portfolio below to preview it and save it as a PDF."}
          </p>
          <a
            href={previewHref}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--land-accent-hover)]"
          >
            <Download className="h-4 w-4" />
            {isRTL ? "افتح وحمّل PDF" : "Open & download PDF"}
          </a>
          <Link
            href="/dashboard"
            className="mt-6 block text-sm text-[var(--land-muted)] transition-colors hover:text-[var(--land-bright)]"
          >
            {isRTL ? "العودة للوحة التحكم" : "Back to Dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  // Checkout
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--land-bg)] px-4">
      <div className="w-full max-w-lg">
        <Link
          href={`/dashboard/${id}/preview`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--land-body)] transition-colors hover:text-[var(--land-bright)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {isRTL ? "العودة للمعاينة" : "Back to Preview"}
        </Link>

        <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-8">
          <h1 className="text-2xl font-bold text-[var(--land-bright)]">
            {isRTL ? "احصل على بورتفوليوك بصيغة PDF" : "Get your portfolio as a PDF"}
          </h1>
          <p className="mt-2 text-sm text-[var(--land-body)]">
            {isRTL
              ? "دفعة واحدة في السنة — وسيرة ذاتية احترافية جاهزة للطباعة والمشاركة."
              : "One payment a year — and a polished, print-ready PDF you can share anywhere."}
          </p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--land-bright)]">
              {isRTL ? "٤٫٩٠٠ د.ك" : "4.900 KD"}
            </span>
            <span className="text-sm text-[var(--land-muted)]">
              {isRTL ? "سنوياً" : "per year"}
            </span>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGetPdf}
            disabled={working}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--land-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {working ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isRTL ? "جارٍ التحويل للدفع..." : "Redirecting to payment..."}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {isRTL ? "ادفع وحمّل PDF" : "Pay & download PDF"}
              </>
            )}
          </button>

          {/* Trust signals */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-[var(--land-body)]">
              <svg className="h-4 w-4 text-[var(--land-accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {isRTL ? "دفع آمن عبر MyFatoorah" : "Secure payment via MyFatoorah"}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--land-body)]">
              <svg className="h-4 w-4 text-[var(--land-accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {isRTL ? "شاهد العرض المباشر قبل الدفع" : "Preview live demos before you pay"}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--land-body)]">
              <svg className="h-4 w-4 text-[var(--land-accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRTL ? "عدّل وحمّل مجددًا — دائمًا مجاني" : "Edit & re-download — always free"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
