"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface CvFieldsStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

const LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"] as const;
const LEVEL_KEYS: Record<string, string> = {
  Native: "levelNative",
  Fluent: "levelFluent",
  Advanced: "levelAdvanced",
  Intermediate: "levelIntermediate",
  Basic: "levelBasic",
};

function calculateTotalYears(experience: any[]): string {
  if (!experience?.length) return "not provided";
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  let totalMonths = 0;

  for (const e of experience) {
    if (!e.startDate) continue;
    const startYear = parseInt(e.startDate);
    if (!startYear || isNaN(startYear)) continue;
    const startMonth = e.startDate.includes("-") ? parseInt(e.startDate.split("-")[1]) || 1 : 1;

    let endYear: number;
    let endMonth: number;
    if (!e.endDate || e.endDate.toLowerCase() === "present" || e.endDate.toLowerCase() === "current") {
      endYear = nowYear;
      endMonth = nowMonth;
    } else {
      endYear = parseInt(e.endDate);
      if (!endYear || isNaN(endYear)) continue;
      endMonth = e.endDate.includes("-") ? parseInt(e.endDate.split("-")[1]) || 12 : 12;
    }

    const months = (endYear - startYear) * 12 + (endMonth - startMonth);
    if (months > 0) totalMonths += months;
  }

  if (totalMonths <= 0) return "not provided";
  const years = Math.round(totalMonths / 12);
  return years <= 1 ? "1 year" : `${years} years`;
}

export function CvFieldsStep({ data, onChange }: CvFieldsStepProps) {
  const t = useTranslations("builder.cvFields");
  const tCv = useTranslations("builder.cv");
  // AI is sign-in-gated (spends Gemini budget); guests get a sign-in CTA.
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const basics = data.basics || {};
  const [generating, setGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiError, setAiError] = useState("");

  // Server-side AI availability (e.g. GEMINI_API_KEY unset/empty in the deploy).
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/ai-status")
      .then((r) => r.json())
      .then((d) => { if (alive) setAiAvailable(Boolean(d.available)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  async function generateSummary() {
    setGenerating(true);
    setAiError("");
    setAiSuggestion("");
    try {
      const context = {
        fullName: basics.fullName ?? "",
        professionalTitle: basics.title ?? "",
        location: basics.location ?? "Kuwait",
        totalYearsExperience: calculateTotalYears(data.experience),
        mostRecentRole: data.experience?.[0]?.title ?? "",
        mostRecentCompany: data.experience?.[0]?.company ?? "",
        topSkills: data.skills?.flatMap((cat: any) => cat.items ?? []).slice(0, 5).join(", ") ?? "",
        notableAchievement: data.experience?.[0]?.highlights?.[0] ?? "",
        highestEducation: data.education?.[0]?.degree
          ? `${data.education[0].degree} at ${data.education[0].institution}`
          : "",
        userDraft: basics.summary ?? "",
      };
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(res.status === 429 ? tCv("aiLimitReached") : result.error || tCv("failedToGenerate"));
      setAiSuggestion(result.summary);
    } catch (e: any) {
      setAiError(e.message || tCv("somethingWentWrong"));
    } finally {
      setGenerating(false);
    }
  }

  function acceptSuggestion() {
    onChange({ basics: { ...basics, summary: aiSuggestion } });
    setAiSuggestion("");
  }

  // GCC defaults: pre-fill Arabic + English the first time this step is opened
  // and no languages exist yet. Stored on the top-level `languages` field — the
  // single source of truth read by BOTH the CV (cv.hbs) and the web templates
  // (corporate/engineer). This is the ONLY place languages are collected.
  const languages: Array<{ name: string; level?: string }> =
    data.languages && data.languages.length > 0
      ? data.languages
      : [
          { name: "Arabic", level: "Native" },
          { name: "English", level: "Fluent" },
        ];

  const references: Array<{ name: string; title?: string; contact?: string }> =
    data.references || [];

  const updateBasics = (field: string, value: any) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">{t("heading")}</h2>
        <p className="text-sm text-[var(--land-body)]">{t("intro")}</p>
      </div>

      {/* Professional Summary */}
      <div>
        <TextareaField
          label={t("summaryLabel")}
          value={basics.summary || ""}
          onChange={(v) => updateBasics("summary", v)}
          placeholder={t("summaryPlaceholder")}
          hint={t("summaryHint")}
          rows={4}
        />
        {aiAvailable === false && !aiSuggestion && (
          <p className="mt-3 rounded-xl border border-dashed border-[var(--land-border)] bg-[var(--land-surface)]/40 px-4 py-3 text-xs text-[var(--land-muted)]">
            {tCv("aiUnavailable")}
          </p>
        )}
        {aiAvailable !== false && !aiSuggestion && isSignedIn && (
          <button
            type="button"
            onClick={generateSummary}
            disabled={generating || !basics.fullName || !basics.title}
            className="mt-3 w-full flex items-center justify-between rounded-xl border border-[var(--land-accent)]/20 bg-[var(--land-accent)]/5 px-4 py-3 text-start transition-colors hover:bg-[var(--land-accent)]/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div>
              <span className="text-sm font-medium text-[var(--land-accent)] flex items-center gap-1.5">
                {generating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--land-accent)] border-t-transparent" />
                    {tCv("writing")}
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
                    {tCv("writeWithAi")}
                  </>
                )}
              </span>
              <span className="text-xs text-[var(--land-muted)] mt-0.5 block">{tCv("usesYourData")}</span>
            </div>
            {!basics.fullName && <span className="text-[10px] text-[var(--land-muted)]">{tCv("fillBasicsFirst")}</span>}
          </button>
        )}

        {/* Guests: AI is sign-in-gated, so offer sign-in instead of a 401 button. */}
        {aiAvailable !== false && !aiSuggestion && !isSignedIn && (
          <Link
            href={`/sign-up?redirect_url=${encodeURIComponent(pathname)}`}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-[var(--land-accent)]/20 bg-[var(--land-accent)]/5 px-4 py-3 text-start transition-colors hover:bg-[var(--land-accent)]/10"
          >
            <span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--land-accent)]">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
                {tCv("writeWithAi")}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--land-muted)]">{tCv("signInToUnlock")}</span>
            </span>
            <span className="text-sm text-[var(--land-accent)]">&rarr;</span>
          </Link>
        )}

        {aiSuggestion && (
          <div className="mt-3 rounded-xl border border-[var(--land-accent)]/30 bg-[var(--land-accent)]/5 p-4">
            <p className="text-xs font-medium text-[var(--land-accent)] mb-2 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
              {tCv("aiSuggested")}
            </p>
            <p className="text-sm text-[var(--land-bright)] leading-relaxed mb-3">{aiSuggestion}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={acceptSuggestion}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--land-accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
              >
                {tCv("useThis")}
              </button>
              <button
                type="button"
                onClick={generateSummary}
                disabled={generating}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--land-border)] px-3 py-1.5 text-xs text-[var(--land-body)] hover:bg-[var(--land-surface-raised)] transition-colors disabled:opacity-40"
              >
                {generating ? "..." : tCv("tryAgain")}
              </button>
              <button
                type="button"
                onClick={() => setAiSuggestion("")}
                className="text-xs text-[var(--land-muted)] hover:text-[var(--land-bright)] ml-auto"
              >
                {tCv("dismiss")}
              </button>
            </div>
          </div>
        )}

        {aiError && <p className="mt-2 text-xs text-red-500">{aiError}</p>}
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-1">{t("languagesHeading")}</h3>
        <p className="text-xs text-[var(--land-muted)] mb-3">{t("languagesHint")}</p>
        <DynamicList
          items={languages}
          onChange={(items) => onChange({ languages: items })}
          createEmpty={() => ({ name: "", level: "Fluent" })}
          maxItems={6}
          addLabel={t("addLanguage")}
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-16">
              <TextField
                label={t("languageName")}
                value={item.name}
                onChange={(v) => update({ name: v })}
                placeholder={t("languageNamePlaceholder")}
              />
              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                  {t("languageLevel")}
                </label>
                <select
                  value={item.level || "Fluent"}
                  onChange={(e) => update({ level: e.target.value })}
                  className="w-full min-h-[44px] bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {t(LEVEL_KEYS[lvl])}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        />
      </div>

      {/* Nationality (optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t("nationalityLabel")}
          value={basics.nationality || ""}
          onChange={(v) => updateBasics("nationality", v)}
          placeholder={t("nationalityPlaceholder")}
          hint={t("nationalityHint")}
        />
      </div>

      {/* References (or "available on request") */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-1">{t("referencesHeading")}</h3>
        <p className="text-xs text-[var(--land-muted)] mb-3">{t("referencesHint")}</p>
        {references.length === 0 && (
          <p className="mb-3 rounded-lg border border-dashed border-[var(--land-border)] bg-[var(--land-surface-raised)]/40 px-4 py-3 text-xs text-[var(--land-muted)]">
            {t("referencesEmptyNote")}
          </p>
        )}
        <DynamicList
          items={references}
          onChange={(items) => onChange({ references: items })}
          createEmpty={() => ({ name: "", title: "", contact: "" })}
          maxItems={4}
          addLabel={t("addReference")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label={t("referenceName")}
                  value={item.name}
                  onChange={(v) => update({ name: v })}
                  placeholder={t("referenceNamePlaceholder")}
                />
                <TextField
                  label={t("referenceTitle")}
                  value={item.title || ""}
                  onChange={(v) => update({ title: v })}
                  placeholder={t("referenceTitlePlaceholder")}
                />
              </div>
              <TextField
                label={t("referenceContact")}
                value={item.contact || ""}
                onChange={(v) => update({ contact: v })}
                placeholder={t("referenceContactPlaceholder")}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
