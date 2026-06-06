"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import { Monitor, Tablet, Smartphone, ArrowLeft, Download, CheckCircle2, FileText, Globe, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
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

  const portfolioData = useMemo(() => {
    if (!portfolio) return null;
    return toPortfolioData(portfolio, locale);
  }, [portfolio, locale]);

  if (portfolio === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--land-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--land-accent)] border-t-transparent" />
          <span className="text-sm text-[var(--land-body)]">{tc("loading")}</span>
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
    { mode: "cv", icon: FileText, label: t("cvView") },
    { mode: "live", icon: Globe, label: t("liveView") },
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

  const pillClass =
    "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[var(--land-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-[var(--land-accent-hover)] hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5";

  return (
    <div className="flex h-screen flex-col bg-[var(--land-bg)]">
      {/* Top toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--land-border)] bg-[var(--land-surface)] px-4 py-3">
        <Link
          href={`/dashboard/${id}/edit`}
          className="flex items-center gap-2 text-sm text-[var(--land-body)] transition-colors hover:text-[var(--land-bright)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToEdit")}
        </Link>

        <div className="flex items-center gap-2">
          {/* CV ⇄ Live portfolio toggle */}
          <div
            className="flex items-center gap-1 rounded-lg bg-[var(--land-surface-raised)]/50 p-1"
            role="group"
            aria-label={t("viewToggleLabel")}
          >
            {views.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                aria-pressed={view === mode}
                className={`flex min-h-[44px] items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors sm:min-h-0 ${
                  view === mode
                    ? "bg-[var(--land-accent)] text-white"
                    : "text-[var(--land-body)] hover:bg-[var(--land-border)] hover:text-[var(--land-bright)]"
                }`}
                title={label}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Device frames — Live portfolio only */}
          {view === "live" && (
            <div className="flex items-center gap-1 rounded-lg bg-[var(--land-surface-raised)]/50 p-1">
              {devices.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setDeviceMode(mode)}
                  aria-pressed={deviceMode === mode}
                  // Desktop/Tablet frames overflow a real phone screen, so on
                  // <md only the Phone option is offered.
                  className={`${segBtn(deviceMode === mode)}${mode !== "mobile" ? " max-md:hidden" : ""}`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Zoom / fit — CV (document) only */}
          {view === "cv" && (
            <div className="flex items-center gap-1 rounded-lg bg-[var(--land-surface-raised)]/50 p-1">
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
          )}
        </div>

        {HOSTING_ENABLED ? (
          <Link
            href={`/dashboard/${id}/publish`}
            className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--land-accent-hover)]"
          >
            {tc("publish")}
          </Link>
        ) : canDownload ? (
          <button
            onClick={printCv}
            className="flex items-center gap-2 rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--land-accent-hover)]"
          >
            <Download className="h-4 w-4" />
            {downloadLabel}
          </button>
        ) : (
          <Link
            href={`/dashboard/${id}/publish`}
            className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--land-accent-hover)]"
          >
            {getPdfLabel}
          </Link>
        )}
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

      {/* Preview area */}
      <div className="flex-1 overflow-hidden relative">
        {portfolioData && (
          <PreviewFrame
            ref={previewRef}
            portfolioData={portfolioData}
            deviceMode={view === "cv" ? "desktop" : deviceMode}
            view={view}
            cvZoom={cvZoom}
            liveUrlLabel={liveUrlLabel}
          />
        )}

        {/* Floating download button */}
        {HOSTING_ENABLED ? (
          <button onClick={printCv} className={pillClass}>
            <Download className="h-4 w-4" />
            Save PDF / Print
          </button>
        ) : canDownload ? (
          <button onClick={printCv} className={pillClass}>
            <Download className="h-4 w-4" />
            {downloadLabel}
          </button>
        ) : (
          <Link href={`/dashboard/${id}/publish`} className={pillClass}>
            <Download className="h-4 w-4" />
            {getPdfLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
