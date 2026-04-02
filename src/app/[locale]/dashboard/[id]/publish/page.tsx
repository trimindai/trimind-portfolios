"use client";

import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { toPortfolioData } from "@/lib/portfolio-data";

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
  const params = useParams();
  const id = params.id as string;
  const locale = (params.locale as string) || "en";
  const t = useTranslations("publish");
  const tc = useTranslations("common");

  const portfolio = useQuery(api.portfolios.get, {
    id: id as Id<"portfolios">,
  });

  const [slug, setSlug] = useState("");
  const [slugInitialized, setSlugInitialized] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const publishMutation = useMutation(api.portfolios.publish);

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

  // Check if already published
  useEffect(() => {
    if (portfolio?.status === "published" && portfolio.slug) {
      setPublished(true);
      setSlug(portfolio.slug);
    }
  }, [portfolio]);

  // Slug availability check
  const existingPortfolio = useQuery(
    api.portfolios.getBySlug,
    slug.length >= 2 ? { slug } : "skip"
  );

  const slugAvailable = useMemo(() => {
    if (slug.length < 2) return null;
    if (existingPortfolio === undefined) return null; // loading
    if (existingPortfolio === null) return true; // available
    // It's available if it's the same portfolio
    return existingPortfolio._id === id;
  }, [existingPortfolio, id, slug]);

  const portfolioUrl = `https://portfolio-trimind.com/p/${slug}`;

  const handlePublish = useCallback(async () => {
    if (!portfolio || !slugAvailable) return;

    setPublishing(true);
    setError(null);

    try {
      // Generate HTML
      const portfolioData = toPortfolioData(portfolio, locale);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolioData),
      });

      if (!res.ok) throw new Error("Failed to generate portfolio HTML");
      const { html } = await res.json();

      // Publish via Convex mutation
      await publishMutation({
        id: id as Id<"portfolios">,
        slug,
        generatedHtml: html,
      });

      setPublished(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Publishing failed. Please try again."
      );
    } finally {
      setPublishing(false);
    }
  }, [portfolio, slugAvailable, locale, slug, id, publishMutation]);

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="text-sm text-slate-400">{tc("loading")}</span>
        </div>
      </div>
    );
  }

  // Not found
  if (portfolio === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">Portfolio not found.</p>
      </div>
    );
  }

  // Guard: must be paid or published
  if (portfolio.status === "draft") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-slate-300">
            You need to complete payment before publishing.
          </p>
          <Link
            href={`/dashboard/${id}/preview`}
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Back to Preview
          </Link>
        </div>
      </div>
    );
  }

  // Published success state
  if (published) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          {/* Animated checkmark */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600/20">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-in zoom-in duration-500" />
          </div>

          <h1 className="text-2xl font-bold text-white">{t("published")}</h1>

          {/* URL display */}
          <div className="mt-6 rounded-lg bg-slate-800 p-3">
            <p className="font-mono text-sm text-emerald-400 break-all">
              {portfolioUrl}
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            >
              <ExternalLink className="h-4 w-4" />
              {t("visitSite")}
            </a>
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : t("copyUrl")}
            </button>
          </div>

          {/* Back to dashboard */}
          <Link
            href="/dashboard"
            className="mt-6 inline-block text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Publish form
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-lg">
        {/* Back link */}
        <Link
          href={`/dashboard/${id}/preview`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Preview
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-400">{t("chooseSlug")}</p>

          {/* Slug input */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              {t("chooseSlug")}
            </label>
            <div className="flex items-center gap-0 rounded-lg border border-slate-700 bg-slate-800 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/50">
              <span className="whitespace-nowrap border-r border-slate-700 px-3 py-2.5 text-sm text-slate-500">
                {t("slugPrefix")}
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
                placeholder="your-name"
              />
              {/* Availability indicator */}
              <div className="px-3">
                {slug.length >= 2 && slugAvailable === null && (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                )}
                {slugAvailable === true && (
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-emerald-500" />
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
              <p className="mt-2 text-sm text-emerald-500">{t("available")}</p>
            )}
            {slugAvailable === false && (
              <p className="mt-2 text-sm text-red-500">{t("taken")}</p>
            )}

            {/* URL preview */}
            <div className="mt-4 rounded-lg bg-slate-800/50 p-3">
              <p className="font-mono text-sm text-slate-400 break-all">
                {portfolioUrl}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={publishing || !slugAvailable || slug.length < 2}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              t("payAndPublish")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
