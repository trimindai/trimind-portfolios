"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import { Monitor, Tablet, Smartphone, ArrowLeft, Download, CheckCircle2, FileText, Globe, ZoomIn, ZoomOut, Maximize2, Maximize, Minimize } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import PreviewFrame from "@/components/preview/PreviewFrame";
import type { PreviewFrameHandle } from "@/components/preview/PreviewFrame";
import { toPortfolioData } from "@/lib/portfolio-data";
import { HOSTING_ENABLED } from "@/lib/flags";
import { ADMIN_EMAILS } from "@/lib/admin";

type DeviceMode = "desktop" | "tablet" | "mobile";
type PreviewView = "cv" | "live";

export default function PreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = (params.locale as string) || "en";
  const t = useTranslations("preview");
  const tc = useTranslations("common");
  const previewRef = useRef<PreviewFrameHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { user: clerkUser } = useUser();

  const portfolio = useQuery(api.portfolios.get, {
    id: id as Id<"portfolios">,
  });

  // Live view defaults to phone — the QR on the printed CV sends people to the
  // mobile portfolio, so that's the view that matters most.
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("mobile");
  // CV view zoom: "fit" scales the A4 page to the panel; numbers are 0.5–2.0.
  const [cvZoom, setCvZoom] = useState<"fit" | number>("fit");
  // Which artifact to preview. The printed PDF is always the ATS CV, so any
  // print action switches to the CV view first (see printCv below).
  const [view, setView] = useState<PreviewView>("cv");

  // On phone-width screens the wide Desktop/Tablet frames overflow, so the
  // live view always falls back to the full-bleed Phone variant there.
  useEffect(() => {
    const sync = () => {
      if (window.innerWidth < 768) setDeviceMode("mobile");
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // Fullscreen the whole preview shell (toolbar stays visible so the user can
  // exit). Progressive enhancement — silently no-ops where unsupported (iOS).
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      rootRef.current?.requestFullscreen?.().catch(() => {});
    }
  };

  // Always print the ATS CV (carries the QR), regardless of the current view.
  const printCv = () => {
    if (view !== "cv") {
      setView("cv");
      // Let the CV iframe load before invoking the native print dialog.
      window.setTimeout(() => previewRef.current?.print(), 600);
    } else {
      previewRef.current?.print();
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `portfolio_success_shown_${id}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, "1");
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const portfolioData = useMemo(() => {
    if (!portfolio) return null;
    return toPortfolioData(portfolio, locale);
  }, [portfolio, locale]);

  if (portfolio === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--land-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--land-accent)] border-t-transparent" />
          <span className="text-sm text-[var(--land-body)]">
            {locale === "ar" ? "جارٍ بناء بورتفوليوك…" : "Building your portfolio…"}
          </span>
        </div>
      </div>
    );
  }

  if (portfolio === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--land-bg)]">
        <p className="text-[var(--land-body)]">Portfolio not found.</p>
      </div>
    );
  }

  const devices: { mode: DeviceMode; icon: typeof Monitor; label: string }[] = [
    { mode: "desktop", icon: Monitor, label: t("desktop") },
    { mode: "tablet", icon: Tablet, label: t("tablet") },
    { mode: "mobile", icon: Smartphone, label: t("mobile") },
  ];

  const views: { mode: PreviewView; icon: typeof FileText; label: string }[] = [
    { mode: "cv", icon: FileText, label: t("cvPreview") },
    { mode: "live", icon: Globe, label: t("webPreview") },
  ];

  // URL shown in the live device frames (QR target). Falls back to a slug of
  // the name while the portfolio is unpublished.
  const nameSlug =
    (portfolio.basics?.fullName || "your-name")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "your-name";
  const liveUrlLabel = `portfolio-trimind.com/p/${portfolio.slug || nameSlug}`;

  // Shared button styling for the toolbar pill groups.
  const segBtn = (active: boolean) =>
    `flex min-h-[44px] items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
      active
        ? "bg-[var(--land-accent)] text-white"
        : "text-[var(--land-body)] hover:bg-[var(--land-border)] hover:text-[var(--land-bright)]"
    }`;

  const adjustZoom = (delta: number) =>
    setCvZoom((z) => {
      const base = typeof z === "number" ? z : 1;
      return Math.min(2, Math.max(0.5, +(base + delta).toFixed(2)));
    });

  // PDF gating (only relevant while hosting is disabled). Admins and anyone
  // who has paid (or, in the hosting era, published) can download the PDF.
  const isAdmin = ADMIN_EMAILS.includes(
    clerkUser?.primaryEmailAddress?.emailAddress || ""
  );
  const canDownload =
    isAdmin ||
    portfolio.status === "paid" ||
    portfolio.status === "published";
  const justPaid = searchParams.get("paid") === "1";
  const getPdfLabel = locale === "ar" ? "احصل على PDF — ٤.٩٠٠ د.ك" : "Get PDF — 4.900 KD";
  const downloadLabel = locale === "ar" ? "حمّل PDF" : "Download PDF";

  // Mobile-only CTA: a thumb-reachable bottom pill. Hidden on md+, where the
  // CTA lives at the far-right of the toolbar instead (never both at once).
  // Overrides renderCta's default rounding/padding into a full-width bottom bar.
  const pillClass =
    "!fixed bottom-6 left-4 right-4 z-50 md:hidden !rounded-full !px-5 !py-3.5 shadow-lg shadow-emerald-600/25";

  // Get PDF CTA — same action/label logic, rendered twice: in the toolbar on
  // md+ and as the bottom pill on mobile. `extra` carries the variant classes.
  const renderCta = (extra: string) =>
    HOSTING_ENABLED ? (
      <Link
        href={`/dashboard/${id}/publish`}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)] ${extra}`}
      >
        {tc("publish")}
      </Link>
    ) : canDownload ? (
      <button
        onClick={printCv}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)] ${extra}`}
      >
        <Download className="h-4 w-4" />
        {downloadLabel}
      </button>
    ) : (
      <Link
        href={`/dashboard/${id}/publish`}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)] ${extra}`}
      >
        <Download className="h-4 w-4" />
        {getPdfLabel}
      </Link>
    );

  const divider = (cls = "") => (
    <span
      aria-hidden
      className={`h-6 w-px shrink-0 bg-[var(--land-border)] ${cls}`}
    />
  );

  return (
    <div ref={rootRef} className="flex h-screen flex-col bg-[var(--land-bg)]">
      {/* Top toolbar — grouped: [Back] | [CV/Web] | [Zoom] | [Fullscreen] → [CTA] */}
      <div className="flex items-center gap-1.5 border-b border-[var(--land-border)] bg-[var(--land-surface)] px-3 py-2.5 sm:px-4">
        {/* Back to Edit — outlined button */}
        <Link
          href={`/dashboard/${id}/edit`}
          title={t("backToEdit")}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface-raised)]/40 px-3 text-sm font-medium text-[var(--land-bright)] transition-colors hover:border-[var(--land-accent)]/40 hover:bg-[var(--land-surface-raised)] sm:min-h-[40px]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" />
          <span className="hidden sm:inline">{t("backToEdit")}</span>
        </Link>

        {divider("hidden sm:block")}

        {/* Middle controls — scroll horizontally on very narrow screens */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {/* CV ⇄ Web toggle (labels always visible) */}
          <div
            className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--land-surface-raised)]/50 p-1"
            role="group"
            aria-label={t("viewToggleLabel")}
          >
            {views.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                aria-pressed={view === mode}
                className={segBtn(view === mode)}
                title={label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>

          {/* Device frames — Live only, md+ only (mobile is always the phone) */}
          {view === "live" && (
            <>
              {divider("hidden md:block")}
              <div className="hidden shrink-0 items-center gap-1 rounded-lg bg-[var(--land-surface-raised)]/50 p-1 md:flex">
                {devices.map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setDeviceMode(mode)}
                    aria-pressed={deviceMode === mode}
                    className={segBtn(deviceMode === mode)}
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Zoom / fit — CV (document) only; md+ only (mobile previews fit-width) */}
          {view === "cv" && (
            <>
              {divider("hidden md:block")}
              <div className="hidden shrink-0 items-center gap-1 rounded-lg bg-[var(--land-surface-raised)]/50 p-1 md:flex">
                <button
                  onClick={() => setCvZoom("fit")}
                  aria-pressed={cvZoom === "fit"}
                  className={segBtn(cvZoom === "fit")}
                  title={locale === "ar" ? "ملاءمة العرض" : "Fit width"}
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{locale === "ar" ? "ملاءمة" : "Fit"}</span>
                </button>
                <button
                  onClick={() => adjustZoom(-0.25)}
                  className={segBtn(false)}
                  title={locale === "ar" ? "تصغير" : "Zoom out"}
                  aria-label={locale === "ar" ? "تصغير" : "Zoom out"}
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-[3rem] px-1 text-center text-xs tabular-nums text-[var(--land-body)]">
                  {cvZoom === "fit"
                    ? locale === "ar"
                      ? "ملاءمة"
                      : "Fit"
                    : `${Math.round(cvZoom * 100)}%`}
                </span>
                <button
                  onClick={() => adjustZoom(0.25)}
                  className={segBtn(false)}
                  title={locale === "ar" ? "تكبير" : "Zoom in"}
                  aria-label={locale === "ar" ? "تكبير" : "Zoom in"}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCvZoom(1)}
                  aria-pressed={cvZoom === 1}
                  className={segBtn(cvZoom === 1)}
                  title="100%"
                >
                  <span className="text-xs">100%</span>
                </button>
              </div>
            </>
          )}

          {/* Fullscreen — md+ only (element fullscreen is unsupported on iOS;
              phones are already near-fullscreen) */}
          {divider("hidden md:block")}
          <button
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            className={`${segBtn(isFullscreen)} hidden shrink-0 md:flex`}
            title={isFullscreen ? t("exitFullscreen") : t("fullscreen")}
          >
            {isFullscreen ? <Minimize className="h-4 w-4 shrink-0" /> : <Maximize className="h-4 w-4 shrink-0" />}
            <span className="whitespace-nowrap">
              {isFullscreen ? t("exitFullscreen") : t("fullscreen")}
            </span>
          </button>
        </div>

        {/* Get PDF CTA — desktop only; mobile uses the bottom pill */}
        <div className="hidden shrink-0 md:block">{renderCta("")}</div>
      </div>

      {/* Post-payment confirmation banner */}
      {!HOSTING_ENABLED && justPaid && canDownload && (
        <div className="flex items-center justify-center gap-2 border-b border-[var(--land-border)] bg-[var(--land-accent-subtle)] px-4 py-2.5 text-sm text-[var(--land-accent)]">
          <CheckCircle2 className="h-4 w-4" />
          {locale === "ar"
            ? "تم الدفع بنجاح — اضغط “حمّل PDF” لحفظ بورتفوليوك."
            : "Payment complete — click “Download PDF” to save your portfolio."}
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="absolute top-16 left-4 right-4 z-50 mx-auto max-w-md animate-[fadeIn_300ms_ease-out] rounded-xl border border-[var(--land-accent)]/30 bg-[var(--land-accent)]/10 px-4 py-3 text-center text-sm text-[var(--land-bright)] backdrop-blur-sm">
          {locale === "ar"
            ? "بورتفوليوك جاهز! حمّل PDF لمشاركته."
            : "Your portfolio is ready! Download the PDF to share it."}
          <button onClick={() => setShowSuccess(false)} className="ml-3 text-[var(--land-muted)] hover:text-[var(--land-bright)]">&times;</button>
        </div>
      )}

      {/* Preview area */}
      <div className="flex-1 overflow-hidden relative pb-20 md:pb-0">
        {portfolioData && (
          <div className={!canDownload ? "blur-sm pointer-events-none select-none" : ""}>
            <PreviewFrame
              ref={previewRef}
              portfolioData={portfolioData}
              deviceMode={view === "cv" ? "desktop" : deviceMode}
              view={view}
              cvZoom={cvZoom}
              liveUrlLabel={liveUrlLabel}
            />
          </div>
        )}

        {/* Pay-to-view overlay for unpaid users */}
        {!canDownload && portfolioData && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[var(--land-bg)]/60 backdrop-blur-[2px]">
            <div className="text-center px-6 max-w-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--land-accent)]/10">
                <Download className="h-6 w-6 text-[var(--land-accent)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--land-bright)]">
                {locale === "ar" ? "ادفع لترى سيرتك الذاتية" : "Pay to see your CV"}
              </h3>
              <p className="mt-2 text-sm text-[var(--land-body)]">
                {locale === "ar"
                  ? "ادفع 4.900 د.ك لمرة واحدة لتحميل وعرض PDF الاحترافي"
                  : "One-time payment of 4.900 KD to view and download your professional PDF"}
              </p>
              <Link
                href={`/dashboard/${id}/publish`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--land-accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
              >
                <Download className="h-4 w-4" />
                {getPdfLabel}
              </Link>
              <p className="mt-3 text-xs text-[var(--land-muted)]">
                {locale === "ar" ? "K-NET · Apple Pay · Visa" : "K-NET · Apple Pay · Visa"}
              </p>
            </div>
          </div>
        )}

        {/* Mobile-only CTA pill (md+ uses the toolbar CTA) */}
        {renderCta(pillClass)}
      </div>
    </div>
  );
}
