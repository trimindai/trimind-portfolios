"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface BasicsStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

const FULL_CV_LIMIT = 3;
const SUMMARY_LIMIT = 5;

export function BasicsStep({ data, onChange }: BasicsStepProps) {
  const t = useTranslations("builder.general");
  const progressSteps = t.raw("progressSteps") as string[];
  const basics = data.basics || {};
  const metrics = data.metrics || [];
  const [showOptional, setShowOptional] = useState(false);

  // The AI endpoints are sign-in-gated (they spend Gemini budget). Guests on the
  // public /try builder see a sign-in CTA instead of the AI tools.
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();

  // Server-side AI availability (e.g. GEMINI_API_KEY unset/empty in the deploy).
  // null = unknown (assume available so the UI never flashes a false warning).
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/ai-status")
      .then((r) => r.json())
      .then((d) => { if (alive) setAiAvailable(Boolean(d.available)); })
      .catch(() => { /* probe failure: keep null, don't block the tools */ });
    return () => { alive = false; };
  }, []);

  // Summary AI state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiError, setAiError] = useState("");
  const [summaryUses, setSummaryUses] = useState(0);

  // Full CV AI state
  const [fillGenerating, setFillGenerating] = useState(false);
  const [fillError, setFillError] = useState("");
  const [fillDone, setFillDone] = useState(false);
  const [fillResult, setFillResult] = useState<any>(null);
  const [fullCvUses, setFullCvUses] = useState(0);

  // Progress animation state
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (stepInterval.current) clearInterval(stepInterval.current);
    };
  }, []);

  function startProgress() {
    setProgress(0);
    setCurrentStep(0);
    progressInterval.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 1 : p));
    }, 100);
    stepInterval.current = setInterval(() => {
      setCurrentStep((s) => (s < progressSteps.length - 1 ? s + 1 : s));
    }, 1500);
  }

  function stopProgress() {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (stepInterval.current) {
      clearInterval(stepInterval.current);
      stepInterval.current = null;
    }
    setProgress(100);
    setCurrentStep(progressSteps.length - 1);
  }

  async function generateFullCv() {
    setFillGenerating(true);
    setFillError("");
    setFillDone(false);
    setFillResult(null);
    startProgress();
    try {
      const res = await fetch("/api/generate-full-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: basics.fullName ?? "",
          professionalTitle: basics.title ?? "",
          location: basics.location ?? "Kuwait",
          userNotes: basics.bio ?? "",
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(res.status === 429 ? t("aiLimitReached") : t("failedToGenerate"));
      const cv = result.cv;
      stopProgress();
      onChange({
        basics: { ...basics, ...cv.basics, fullName: basics.fullName, title: basics.title, email: basics.email || cv.basics?.email },
        experience: cv.experience,
        skills: cv.skills,
        projects: cv.projects,
        education: cv.education,
        certifications: cv.certifications,
        languages: cv.languages,
        continuousDevelopment: cv.continuousDevelopment,
        professionalAffiliations: cv.professionalAffiliations,
        metrics: cv.metrics,
      });
      setFillResult(cv);
      setFillDone(true);
      setFullCvUses((n) => n + 1);
    } catch (e: any) {
      stopProgress();
      setFillError(e.message || t("somethingWentWrong"));
    } finally {
      setFillGenerating(false);
    }
  }

  async function generateSummary() {
    setAiGenerating(true);
    setAiError("");
    setAiSuggestion("");
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: basics.fullName ?? "",
          professionalTitle: basics.title ?? "",
          location: basics.location ?? "Kuwait",
          totalYearsExperience: "not provided",
          mostRecentRole: basics.title ?? "",
          mostRecentCompany: "",
          topSkills: "",
          notableAchievement: "",
          highestEducation: "",
          userDraft: basics.summary ?? basics.bio ?? "",
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(res.status === 429 ? t("aiLimitReached") : t("failedToGenerate"));
      setAiSuggestion(result.summary);
      setSummaryUses((n) => n + 1);
    } catch (e: any) {
      setAiError(e.message || t("somethingWentWrong"));
    } finally {
      setAiGenerating(false);
    }
  }

  function acceptSuggestion() {
    onChange({ basics: { ...basics, summary: aiSuggestion, bio: aiSuggestion } });
    setAiSuggestion("");
  }

  const updateBasics = (field: string, value: string) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  const canShowAi = (basics.fullName?.length > 2 && basics.title?.length > 2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("basicsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">{t("basicsIntro")}</p>
      </div>

      {/* REQUIRED — always visible (the 3 fields needed to proceed) */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label={t("fullNameLabel")} autoComplete="name" value={basics.fullName} onChange={(v) => updateBasics("fullName", v)} required placeholder={t("fullNamePlaceholder")} hint={t("fullNameHint")} />
          <TextField label={t("titleLabel")} value={basics.title} onChange={(v) => updateBasics("title", v)} required placeholder={t("titlePlaceholder")} hint={t("titleHint")} examples={t.raw("titleExamples") as string[]} />
        </div>
        <TextField label={t("emailLabel")} value={basics.email} onChange={(v) => updateBasics("email", v)} required type="email" autoComplete="email" inputMode="email" dir="ltr" placeholder={t("emailPlaceholder")} />
      </div>

      {/* AI assistant. Three states so the feature is always discoverable:
          1) name/title empty  -> locked hint
          2) guest             -> sign-up CTA (below)
          3) signed in         -> the tools
          Deliberately not gated on Clerk's isLoaded: if clerk-js stalls or
          fails, the guest CTA still renders instead of nothing. */}
      {aiAvailable === false ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--land-border)] bg-[var(--land-surface)]/40 px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-[var(--land-muted)]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
          <p className="text-xs text-[var(--land-muted)]">{t("aiUnavailableHint")}</p>
        </div>
      ) : !canShowAi ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-600/30 bg-emerald-600/5 px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-emerald-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
          <p className="text-xs text-[var(--land-body)]">{t("aiLockedHint")}</p>
        </div>
      ) : null}
      {aiAvailable !== false && canShowAi && isSignedIn && (
        <div className="space-y-3">
          {/* Progress UI during generation */}
          {fillGenerating && (
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-5 space-y-4">
              <div className="space-y-2">
                {progressSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2.5">
                    {i < currentStep ? (
                      <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>
                    ) : i === currentStep ? (
                      <span className="h-4 w-4 shrink-0 flex items-center justify-center">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      </span>
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-[var(--land-border)]" />
                    )}
                    <span className={`text-sm ${i <= currentStep ? "text-[var(--land-bright)]" : "text-[var(--land-muted)]"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full h-1.5 bg-[var(--land-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--land-muted)] text-center">{t("percentComplete", { progress })}</p>
            </div>
          )}

          {/* Success state with real counts */}
          {fillDone && !fillGenerating && fillResult && (
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-5 space-y-3">
              <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                <svg className="h-4 w-4" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>
                {t("cvFilledSuccess")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {fillResult.experience?.length > 0 && (
                  <div className="text-center p-2 rounded-lg bg-[var(--land-surface)]/50">
                    <p className="text-lg font-semibold text-[var(--land-bright)]">{fillResult.experience.length}</p>
                    <p className="text-[10px] text-[var(--land-muted)] uppercase tracking-wider">{t("statExperience")}</p>
                  </div>
                )}
                {fillResult.skills?.length > 0 && (
                  <div className="text-center p-2 rounded-lg bg-[var(--land-surface)]/50">
                    <p className="text-lg font-semibold text-[var(--land-bright)]">{fillResult.skills.reduce((a: number, s: any) => a + (s.items?.length || 0), 0)}</p>
                    <p className="text-[10px] text-[var(--land-muted)] uppercase tracking-wider">{t("statSkills")}</p>
                  </div>
                )}
                {fillResult.education?.length > 0 && (
                  <div className="text-center p-2 rounded-lg bg-[var(--land-surface)]/50">
                    <p className="text-lg font-semibold text-[var(--land-bright)]">{fillResult.education.length}</p>
                    <p className="text-[10px] text-[var(--land-muted)] uppercase tracking-wider">{t("statEducation")}</p>
                  </div>
                )}
                {fillResult.certifications?.length > 0 && (
                  <div className="text-center p-2 rounded-lg bg-[var(--land-surface)]/50">
                    <p className="text-lg font-semibold text-[var(--land-bright)]">{fillResult.certifications.length}</p>
                    <p className="text-[10px] text-[var(--land-muted)] uppercase tracking-wider">{t("statCertifications")}</p>
                  </div>
                )}
              </div>
              {fullCvUses < FULL_CV_LIMIT && (
                <button
                  type="button"
                  onClick={() => { setFillDone(false); generateFullCv(); }}
                  disabled={fillGenerating}
                  className="text-xs text-emerald-600/70 hover:text-emerald-600 underline underline-offset-2"
                >
                  {t("regenerateEverything", { used: fullCvUses, limit: FULL_CV_LIMIT })}
                </button>
              )}
            </div>
          )}

          {/* Primary button: Fill entire CV */}
          {!fillDone && !fillGenerating && fullCvUses < FULL_CV_LIMIT && (
            <button
              type="button"
              onClick={generateFullCv}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full rounded-xl py-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
              {fullCvUses > 0 ? t("regenerateCv", { used: fullCvUses, limit: FULL_CV_LIMIT }) : t("fillCvButton")}
            </button>
          )}

          {fillError && <p className="text-xs text-red-500">{fillError}</p>}

          {/* Separator */}
          {!fillGenerating && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--land-border)]" />
              <span className="text-xs text-[var(--land-muted)]">{t("orJustSummary")}</span>
              <div className="flex-1 h-px bg-[var(--land-border)]" />
            </div>
          )}

          {/* Secondary button: Summary only */}
          {!aiSuggestion && !fillGenerating && summaryUses < SUMMARY_LIMIT && (
            <button
              type="button"
              onClick={generateSummary}
              disabled={aiGenerating}
              className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 w-full rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {aiGenerating ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  {t("writingSummary")}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
                  {summaryUses > 0 ? t("regenerateSummary", { used: summaryUses, limit: SUMMARY_LIMIT }) : t("generateSummaryButton")}
                </>
              )}
            </button>
          )}

          {/* AI Suggestion card */}
          {aiSuggestion && (
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-4">
              <p className="text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
                {t("aiSuggested")}
              </p>
              <p className="text-xs text-[var(--land-muted)] mb-2">{t("basedOn", { name: basics.fullName, title: basics.title })}</p>
              <p className="text-sm text-[var(--land-bright)] leading-relaxed mb-3">{aiSuggestion}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={acceptSuggestion}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  {t("useThis")}
                </button>
                {summaryUses < SUMMARY_LIMIT && (
                  <button
                    type="button"
                    onClick={generateSummary}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--land-border)] px-3 py-1.5 text-xs text-[var(--land-body)] hover:bg-[var(--land-surface-raised)] transition-colors disabled:opacity-40"
                  >
                    {aiGenerating ? "..." : t("tryAgain")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAiSuggestion("")}
                  className="text-xs text-[var(--land-muted)] hover:text-[var(--land-bright)] ml-auto"
                >
                  {t("dismiss")}
                </button>
              </div>
            </div>
          )}

          {aiError && <p className="text-xs text-red-500">{aiError}</p>}

          {basics.summary && !aiSuggestion && !fillGenerating && (
            <div className="rounded-lg border border-[var(--land-border)]/50 bg-[var(--land-surface)]/30 px-4 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-[var(--land-muted)] mb-1">{t("yourCvSummary")}</p>
              <p className="text-xs text-[var(--land-body)] line-clamp-2">{basics.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Guest equivalent: AI is sign-in-gated, so show a sign-in CTA in place
          of the AI tools rather than a button that would 401. redirect_url
          returns them here (their draft lives in localStorage) with AI unlocked. */}
      {aiAvailable !== false && canShowAi && !isSignedIn && (
        <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-5 text-center space-y-2">
          <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--land-bright)]">
            <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
            {t("aiCtaHeading")}
          </p>
          <p className="text-xs text-[var(--land-muted)]">
            {t("aiCtaBody")}
          </p>
          <Link
            href={`/sign-up?redirect_url=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            {t("aiCtaButton")}
          </Link>
        </div>
      )}

      {/* OPTIONAL toggle — MOBILE ONLY. Desktop always shows the fields below. */}
      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="md:hidden w-full flex items-center justify-between min-h-[48px] px-4 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)]/40 text-sm font-medium text-[var(--land-bright)]"
        aria-expanded={showOptional}
      >
        <span>{showOptional ? "▼ " : "▶ "}{t("optionalDetails")}</span>
        <span className="text-xs text-[var(--land-muted)]">
          {showOptional ? t("optionalHide") : t("optionalSummaryShort")}
        </span>
      </button>

      {/* OPTIONAL fields — collapsed on mobile (unless expanded), always shown on md+ */}
      <div className={`${showOptional ? "block" : "hidden"} md:block space-y-6`}>
        <TextField label={t("subtitleLabel")} value={basics.subtitle} onChange={(v) => updateBasics("subtitle", v)} placeholder={t("subtitlePlaceholder")} hint={t("subtitleHint")} examples={t.raw("subtitleExamples") as string[]} />

        <TextField label={t("phoneLabel")} type="tel" autoComplete="tel" inputMode="tel" dir="ltr" value={basics.phone} onChange={(v) => updateBasics("phone", v)} placeholder={t("phonePlaceholder")} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label={t("locationLabel")} value={basics.location} onChange={(v) => updateBasics("location", v)} placeholder={t("locationPlaceholder")} />
          <TextField label={t("nationalityLabel")} value={basics.nationality} onChange={(v) => updateBasics("nationality", v)} placeholder={t("nationalityPlaceholder")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label={t("linkedinLabel")} type="url" inputMode="url" dir="ltr" value={basics.linkedin} onChange={(v) => updateBasics("linkedin", v)} placeholder={t("linkedinPlaceholder")} />
          <TextField label={t("websiteLabel")} type="url" inputMode="url" dir="ltr" value={basics.website} onChange={(v) => updateBasics("website", v)} placeholder={t("websitePlaceholder")} />
        </div>

        <TextareaField
          label={t("summaryLabel")}
          value={basics.bio}
          onChange={(v) => updateBasics("bio", v)}
          placeholder={t("summaryPlaceholder")}
          hint={t("summaryHint")}
          rows={3}
          writingTips={t.raw("summaryTips") as string[]}
          templates={t.raw("summaryTemplates") as Array<{ label: string; text: string }>}
        />

        <TextareaField
          label={t("valuePropLabel")}
          value={basics.valueProposition}
          onChange={(v) => updateBasics("valueProposition", v)}
          placeholder={t("valuePropPlaceholder")}
          hint={t("valuePropHint")}
          rows={4}
          writingTips={t.raw("valuePropTips") as string[]}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-[var(--land-bright)]">{t("keyMetricsHeading")}</h3>
            <span className="text-xs text-[var(--land-muted)]">{t("keyMetricsHint")}</span>
          </div>
          <DynamicList
            items={metrics}
            onChange={(items) => onChange({ metrics: items })}
            createEmpty={() => ({ value: "", label: "" })}
            maxItems={4}
            addLabel={t("addMetric")}
            renderItem={(item, _, update) => (
              <div className="grid grid-cols-2 gap-3">
                <TextField label={t("metricValueLabel")} value={item.value} onChange={(v) => update({ value: v })} placeholder={t("metricValuePlaceholder")} examples={t.raw("metricValueExamples") as string[]} />
                <TextField label={t("metricLabelLabel")} value={item.label} onChange={(v) => update({ label: v })} placeholder={t("metricLabelPlaceholder")} examples={t.raw("metricLabelExamples") as string[]} />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
