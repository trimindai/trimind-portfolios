"use client";

import { use, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { BuilderForm } from "@/components/builder/BuilderForm";
import { resolveTemplateId, getTemplate } from "@/lib/templates";

/**
 * Guest builder / preview — PUBLIC route (no auth). Lets an unauthenticated
 * visitor build a portfolio that persists to localStorage["portfolio_preview_data"]
 * via <BuilderForm guest />. Auth is required only at Publish/Download, which
 * routes to sign-up with a post-signup restore URL; dashboard/new (fromGuest=1)
 * then seeds the Convex portfolio from the saved blob.
 *
 * This page deliberately lives under (app) but OUTSIDE dashboard/, because the
 * dashboard layout gates rendering on a Clerk session.
 */
export default function GuestBuilderPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId: rawTemplateId } = use(params);
  const routeParams = useParams();
  const router = useRouter();

  const localeParam = (routeParams.locale as string) || "en";
  const locale = (localeParam === "ar" ? "ar" : "en") as "en" | "ar";
  const isRTL = locale === "ar";

  const templateId = resolveTemplateId(rawTemplateId);
  const template = getTemplate(templateId);

  // Send guests to sign-up; after sign-up they land on dashboard/new?fromGuest=1
  // which restores the localStorage blob into a real Convex portfolio.
  const onPublish = useCallback(() => {
    const restore = `/${locale}/dashboard/new?fromGuest=1`;
    router.push(`/${locale}/sign-up?redirect_url=${encodeURIComponent(restore)}`);
  }, [locale, router]);

  // Seed name/title from the homepage quick-start form (TryItForm writes
  // localStorage["portfolio-draft"]). This is only a SEED: BuilderForm prefers
  // an existing "portfolio_preview_data" blob over initialData, so a returning
  // guest's real edits still win. We do NOT delete "portfolio-draft" here — the
  // authed dashboard/new flow still consumes it.
  const [draftSeed] = useState<{ fullName?: string; title?: string }>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem("portfolio-draft");
      if (!raw) return {};
      const parsed = JSON.parse(raw) as { fullName?: string; title?: string };
      return {
        fullName: typeof parsed.fullName === "string" ? parsed.fullName : undefined,
        title: typeof parsed.title === "string" ? parsed.title : undefined,
      };
    } catch {
      return {};
    }
  });

  // Minimal empty-but-valid shape. templateId drives the step-set; customization
  // seeds the accent so the live preview/colours look intentional from step 1.
  const initialData = {
    templateId,
    status: "draft" as const,
    basics: {
      fullName: draftSeed.fullName ?? "",
      title: draftSeed.title ?? "",
      email: "",
    },
    customization: {
      primaryColor: template?.colors?.primary,
      accentColor: template?.colors?.accent,
    },
  };

  return (
    <div className="min-h-screen bg-[var(--land-bg)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b border-[var(--land-border)] bg-[var(--land-bg)]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-[var(--land-bright)] tracking-tight hover:text-[var(--land-accent-hover)] transition-colors"
          >
            {isRTL ? "بورتفوليو برو" : "Portfolio Pro"}
          </Link>
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(`/${locale}/dashboard`)}`}
            className="text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)] transition-colors"
          >
            {isRTL ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </header>

      {/* Persistent "sign up free to publish" banner */}
      <div className="sticky top-0 z-50 border-b border-[var(--land-accent)]/20 bg-[var(--land-accent)]/10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2 px-6 py-2.5">
          <p className="text-sm text-[var(--land-bright)]">
            {isRTL
              ? "سجّل مجانًا لنشر ملفك"
              : "Sign up free to publish your portfolio"}
          </p>
          <button
            onClick={onPublish}
            className="inline-flex min-h-[36px] items-center justify-center rounded-lg bg-[var(--land-accent)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98]"
          >
            {isRTL ? "سجّل مجانًا" : "Sign up free"}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <BuilderForm guest initialData={initialData} onPublish={onPublish} />
      </main>
    </div>
  );
}
