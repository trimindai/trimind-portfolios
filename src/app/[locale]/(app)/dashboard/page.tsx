"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useDashboard } from "@/contexts/DashboardContext";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { HOSTING_ENABLED } from "@/lib/flags";
import { pickPrimaryPortfolio } from "@/lib/single-cv";
import { useTranslations } from "next-intl";
import { Check, LayoutGrid, PenLine, Rocket, X } from "lucide-react";

const TEMPLATE_COLORS: Record<string, { primary: string; accent: string }> = {
  general: { primary: "#0F172A", accent: "#A16207" },
  engineer: { primary: "#0F172A", accent: "#059669" },
  creative: { primary: "#1a1a2e", accent: "#e94560" },
  creator: { primary: "#1C1917", accent: "#F59E0B" },
  developer: { primary: "#0d1117", accent: "#58a6ff" },
};

const STATUS_CONFIG = {
  draft: {
    label: { en: "Draft", ar: "مسودة" },
    hint: { en: "Fill your info, then publish", ar: "أكمل بياناتك ثم انشر" },
    class: "bg-[var(--land-border)]/50 text-[var(--land-body)]",
  },
  paid: {
    label: { en: "Paid", ar: "مدفوع" },
    hint: { en: "Ready to publish — choose your URL", ar: "جاهز للنشر — اختر رابطك" },
    class: "bg-amber-600/20 text-amber-400",
  },
  published: {
    label: { en: "Live", ar: "منشور" },
    hint: { en: "Your portfolio is live", ar: "بورتفوليو منشور" },
    class: "bg-[var(--land-accent)]/20 text-[var(--land-accent-hover)]",
  },
} as const;

export default function DashboardPage() {
  const { userId } = useDashboard();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const isRTL = locale === "ar";
  // AR UI keeps Western digits everywhere (counts, prices) — pin nu-latn so dates match.
  const dateLocale = isRTL ? "ar-u-nu-latn" : "en";
  const t = useTranslations();
  const portfolios = useQuery(api.portfolios.listByUser, {});
  const removePortfolio = useMutation(api.portfolios.remove);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!userId || portfolios === undefined) {
    // Skeleton cards matching the loaded grid — no spinner, no layout shift.
    return (
      <div aria-busy="true" aria-label={t("common.loading")}>
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-44 rounded-lg bg-[var(--land-surface-raised)]/60 motion-safe:animate-pulse" />
          <div className="h-9 w-36 rounded-lg bg-[var(--land-surface-raised)]/60 motion-safe:animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/50 overflow-hidden">
              <div className="h-12 w-full bg-[var(--land-surface-raised)]/80 motion-safe:animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-2/3 rounded bg-[var(--land-surface-raised)]/60 motion-safe:animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-[var(--land-surface-raised)]/50 motion-safe:animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-[var(--land-surface-raised)]/50 motion-safe:animate-pulse" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 flex-1 rounded-lg bg-[var(--land-surface-raised)]/60 motion-safe:animate-pulse" />
                  <div className="h-8 flex-1 rounded-lg bg-[var(--land-surface-raised)]/60 motion-safe:animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // One CV per user: surface only the user's primary CV (a paid/published one
  // wins, else the newest). Any older extras stay in the DB but are hidden here.
  const primary = pickPrimaryPortfolio(portfolios);
  const visiblePortfolios = primary ? [primary] : [];
  const hasPortfolios = visiblePortfolios.length > 0;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await removePortfolio({ id: id as Id<"portfolios"> });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[var(--land-bright)]">{t("dashboard.title")}</h1>
        <Link
          href="/build"
          className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
        >
          ✨ {isRTL ? "ابنِ بالذكاء الاصطناعي" : "Build with AI"}
        </Link>
      </div>

      {!hasPortfolios ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-[var(--land-body)] mb-6 text-center max-w-md">
            {t("dashboard.empty")}
          </p>

          {/* How it works — 3 steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-10">
            {[
              { step: "1", en: "Pick a template", ar: "اختر قالبًا", Icon: LayoutGrid },
              { step: "2", en: "Fill your info", ar: "أدخل بياناتك", Icon: PenLine },
              { step: "3", en: HOSTING_ENABLED ? "Get your CV PDF + QR" : "Download PDF", ar: HOSTING_ENABLED ? "احصل على سيرتك + باركود" : "حمّل PDF", Icon: Rocket },
            ].map((s) => (
              <div key={s.step} className="text-center p-4 rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/30">
                <s.Icon className="mx-auto mb-2 h-6 w-6 text-[var(--land-accent)]" aria-hidden />
                <div className="text-xs text-[var(--land-accent)] font-bold mb-1">
                  {isRTL ? `خطوة ${s.step}` : `Step ${s.step}`}
                </div>
                <div className="text-sm text-[var(--land-bright)]">
                  {isRTL ? s.ar : s.en}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--land-accent)]/30 bg-[var(--land-surface)]/80 p-8 max-w-sm w-full text-center">
            <div className="text-5xl font-bold text-[var(--land-accent-hover)]">
              4.900 KD
            </div>
            <div className="mt-1 text-[var(--land-body)]">
              {isRTL ? "دفعة واحدة (~$16 USD)" : "One-time payment (~$16 USD)"}
            </div>
            <ul className="mt-6 space-y-2 text-start text-sm text-[var(--land-bright)]">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--land-accent)]" aria-hidden />
                {isRTL ? "قوالب احترافية" : "Professional templates"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--land-accent)]" aria-hidden />
                {isRTL ? "ألوان وخطوط مخصصة" : "Custom colors & fonts"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--land-accent)]" aria-hidden />
                {isRTL ? "عربي وإنجليزي" : "Arabic & English"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--land-accent)]" aria-hidden />
                {HOSTING_ENABLED
                  ? (isRTL ? "سيرة ذاتية PDF + بورتفوليو حيّ بباركود QR" : "CV PDF + live portfolio via QR")
                  : (isRTL ? "تحميل PDF احترافي" : "Professional PDF download")}
              </li>
            </ul>
            <Link
              href="/build"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-[var(--land-accent)] py-3 font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
            >
              ✨ {isRTL ? "ابنِ بالذكاء الاصطناعي" : "Build with AI"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePortfolios.map((portfolio) => {
            const statusCfg = STATUS_CONFIG[portfolio.status as keyof typeof STATUS_CONFIG];
            return (
              <div
                key={portfolio._id}
                className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/50 overflow-hidden"
              >
                {/* Template color bar */}
                {(() => {
                  const colors = TEMPLATE_COLORS[portfolio.templateId as string] || TEMPLATE_COLORS.general;
                  return (
                    <div
                      className="h-12 w-full"
                      style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)` }}
                    />
                  );
                })()}
                <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-[var(--land-bright)] truncate">
                    {portfolio.basics.fullName || portfolio.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${isRTL ? "mr-2" : "ml-2"} ${statusCfg.class}`}>
                    {isRTL ? statusCfg.label.ar : statusCfg.label.en}
                  </span>
                </div>

                {/* Status hint — tells user what to do next */}
                <p className="text-xs text-[var(--land-muted)] mb-2">
                  {isRTL ? statusCfg.hint.ar : statusCfg.hint.en}
                </p>

                <p className="text-sm text-[var(--land-body)] mb-2">
                  {portfolio.basics.title || "Untitled"}
                </p>

                {portfolio.slug && (
                  <p className="text-xs text-[var(--land-muted)] font-mono mb-1">
                    /p/{portfolio.slug}
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--land-muted)] mb-4">
                  <span>
                    {isRTL ? "آخر تعديل" : "Last edited"}:{" "}
                    {new Date(portfolio.lastEditedAt).toLocaleDateString(dateLocale)}
                  </span>
                  {portfolio.createdAt && (
                    <span>
                      {isRTL ? "أنشئ" : "Created"}:{" "}
                      {new Date(portfolio.createdAt).toLocaleDateString(dateLocale)}
                    </span>
                  )}
                  {portfolio.status === "published" && (portfolio as any).viewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {(portfolio as any).viewCount} {isRTL ? "مشاهدة" : "views"}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* Drafts: continuing to edit is the primary action, not Publish */}
                  <Link
                    href={`/build/${portfolio._id}`}
                    className={`flex-1 text-center rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      portfolio.status === "draft"
                        ? "bg-[var(--land-accent)] font-medium text-white hover:bg-[var(--land-accent-hover)]"
                        : "border border-[var(--land-border)] text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)]"
                    }`}
                  >
                    {portfolio.status === "draft" ? (isRTL ? "متابعة التحرير" : "Continue editing") : t("common.edit")}
                  </Link>
                  <Link
                    href={`/dashboard/${portfolio._id}/preview`}
                    className="flex-1 text-center rounded-lg border border-[var(--land-border)] px-3 py-1.5 text-sm text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)] transition-colors"
                  >
                    {t("common.preview")}
                  </Link>
                  {(portfolio.status === "paid" || portfolio.status === "published") && (
                    <Link
                      href={`/dashboard/${portfolio._id}/preview`}
                      className="flex-1 text-center rounded-lg bg-[var(--land-accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
                    >
                      {isRTL ? "حمّل PDF" : "Download PDF"}
                    </Link>
                  )}
                  {portfolio.status !== "published" && (
                    <Link
                      href={`/dashboard/${portfolio._id}/publish`}
                      className={`flex-1 text-center rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        portfolio.status === "draft"
                          ? "border border-[var(--land-accent)]/50 text-[var(--land-accent)] hover:bg-[var(--land-accent)]/10"
                          : "bg-[var(--land-accent)] font-medium text-white hover:bg-[var(--land-accent-hover)]"
                      }`}
                    >
                      {t("common.publish")}
                    </Link>
                  )}
                  {portfolio.status === "published" && portfolio.slug && (
                    <a
                      href={`/p/${portfolio.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="flex-1 text-center rounded-lg bg-[var(--land-accent)]/20 px-3 py-1.5 text-sm text-[var(--land-accent-hover)] hover:bg-[var(--land-accent)]/30 transition-colors"
                    >
                      {isRTL ? "عرض" : "View"}
                    </a>
                  )}
                  {confirmDeleteId === portfolio._id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(portfolio._id)}
                        disabled={deletingId === portfolio._id}
                        className="rounded-lg bg-red-600/20 px-3 py-1.5 text-sm text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-50"
                      >
                        {deletingId === portfolio._id ? "..." : (isRTL ? "تأكيد" : "Confirm")}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-[var(--land-border)] px-3 py-1.5 text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)] transition-colors"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(portfolio._id)}
                      className="rounded-lg border border-[var(--land-border)] px-2 py-1.5 text-sm text-[var(--land-muted)] hover:text-red-400 hover:border-red-400/30 transition-colors"
                      title={t("common.delete")}
                      aria-label={t("common.delete")}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
