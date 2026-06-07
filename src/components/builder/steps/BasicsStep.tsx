"use client";

import { useState, useEffect, useRef } from "react";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface BasicsStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

const PROGRESS_STEPS = [
  "Writing your summary",
  "Building your experience",
  "Adding your skills",
  "Creating achievements",
  "Finishing up",
];

const FULL_CV_LIMIT = 3;
const SUMMARY_LIMIT = 5;

export function BasicsStep({ data, onChange }: BasicsStepProps) {
  const basics = data.basics || {};
  const metrics = data.metrics || [];
  const [showOptional, setShowOptional] = useState(false);

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
      setCurrentStep((s) => (s < PROGRESS_STEPS.length - 1 ? s + 1 : s));
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
    setCurrentStep(PROGRESS_STEPS.length - 1);
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
      if (!res.ok) throw new Error(result.error || "Failed to generate");
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
      setFillError(e.message || "Something went wrong");
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
      if (!res.ok) throw new Error(result.error || "Failed to generate");
      setAiSuggestion(result.summary);
      setSummaryUses((n) => n + 1);
    } catch (e: any) {
      setAiError(e.message || "Something went wrong");
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
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">Basic Information</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">Fill in your core professional identity. The published portfolio will have an auto-translate button for Arabic.</p>
      </div>

      {/* REQUIRED — always visible (the 3 fields needed to proceed) */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Full Name" value={basics.fullName} onChange={(v) => updateBasics("fullName", v)} required placeholder="Sarah Al-Rashidi" hint="As it appears on your official documents" />
          <TextField label="Professional Title" value={basics.title} onChange={(v) => updateBasics("title", v)} required placeholder="Senior Financial Analyst" hint="Your current or target role" examples={["Senior Financial Analyst", "Software Engineer", "Marketing Director", "UX Designer", "Project Manager"]} />
        </div>
        <TextField label="Email" value={basics.email} onChange={(v) => updateBasics("email", v)} required type="email" placeholder="email@example.com" />
      </div>

      {/* AI Section — only visible when name + title are filled */}
      {canShowAi && (
        <div className="space-y-3">
          {/* Progress UI during generation */}
          {fillGenerating && (
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-5 space-y-4">
              <div className="space-y-2">
                {PROGRESS_STEPS.map((step, i) => (
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
              <p className="text-xs text-[var(--land-muted)] text-center">{progress}% complete</p>
            </div>
          )}

          {/* Success state with real counts */}
          {fillDone && !fillGenerating && fillResult && (
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-5 space-y-3">
              <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                <svg className="h-4 w-4" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>
                CV filled! Review each step and edit as needed.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {fillResult.experience?.length > 0 && (
                  <div className="text-center p-2 rounded-lg bg-[var(--land-surface)]/50">
                    <p className="text-lg font-semibold text-[var(--land-bright)]">{fillResult.experience.length}</p>
                    <p className="text-[10px] text-[var(--land-muted)] uppercase tracking-wider">Experience</p>
                  </div>
                )}
                {fillResult.skills?.length > 0 && (
                  <div className="text-center p-2 rounded-lg bg-[var(--land-surface)]/50">
                    <p className="text-lg font-semibold text-[var(--land-bright)]">{fillResult.skills.reduce((a: number, s: any) => a + (s.items?.length || 0), 0)}</p>
                    <p className="text-[10px] text-[var(--land-muted)] uppercase tracking-wider">Skills</p>
                  </div>
                )}
                {fillResult.education?.length > 0 && (
                  <div className="text-center p-2 rounded-lg bg-[var(--land-surface)]/50">
                    <p className="text-lg font-semibold text-[var(--land-bright)]">{fillResult.education.length}</p>
                    <p className="text-[10px] text-[var(--land-muted)] uppercase tracking-wider">Education</p>
                  </div>
                )}
                {fillResult.certifications?.length > 0 && (
                  <div className="text-center p-2 rounded-lg bg-[var(--land-surface)]/50">
                    <p className="text-lg font-semibold text-[var(--land-bright)]">{fillResult.certifications.length}</p>
                    <p className="text-[10px] text-[var(--land-muted)] uppercase tracking-wider">Certifications</p>
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
                  Regenerate everything ({fullCvUses}/{FULL_CV_LIMIT} used)
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
              {fullCvUses > 0 ? `Regenerate entire CV (${fullCvUses}/${FULL_CV_LIMIT})` : "Fill my entire CV with AI"}
            </button>
          )}

          {fillError && <p className="text-xs text-red-500">{fillError}</p>}

          {/* Separator */}
          {!fillGenerating && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--land-border)]" />
              <span className="text-xs text-[var(--land-muted)]">&mdash; or just the summary &mdash;</span>
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
                  Writing your summary...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
                  {summaryUses > 0 ? `Regenerate summary (${summaryUses}/${SUMMARY_LIMIT})` : "Generate my CV summary"}
                </>
              )}
            </button>
          )}

          {/* AI Suggestion card */}
          {aiSuggestion && (
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-4">
              <p className="text-xs font-medium text-emerald-600 mb-1 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M6 4h4M3 8l2 6 3-4 3 4 2-6" /></svg>
                AI Suggested
              </p>
              <p className="text-xs text-[var(--land-muted)] mb-2">Based on: {basics.fullName} &middot; {basics.title}</p>
              <p className="text-sm text-[var(--land-bright)] leading-relaxed mb-3">{aiSuggestion}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={acceptSuggestion}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  Use this &rarr;
                </button>
                {summaryUses < SUMMARY_LIMIT && (
                  <button
                    type="button"
                    onClick={generateSummary}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--land-border)] px-3 py-1.5 text-xs text-[var(--land-body)] hover:bg-[var(--land-surface-raised)] transition-colors disabled:opacity-40"
                  >
                    {aiGenerating ? "..." : "Try again"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAiSuggestion("")}
                  className="text-xs text-[var(--land-muted)] hover:text-[var(--land-bright)] ml-auto"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {aiError && <p className="text-xs text-red-500">{aiError}</p>}

          {basics.summary && !aiSuggestion && !fillGenerating && (
            <div className="rounded-lg border border-[var(--land-border)]/50 bg-[var(--land-surface)]/30 px-4 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-[var(--land-muted)] mb-1">Your CV Summary</p>
              <p className="text-xs text-[var(--land-body)] line-clamp-2">{basics.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* OPTIONAL toggle — MOBILE ONLY. Desktop always shows the fields below. */}
      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="md:hidden w-full flex items-center justify-between min-h-[48px] px-4 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)]/40 text-sm font-medium text-[var(--land-bright)]"
        aria-expanded={showOptional}
      >
        <span>{showOptional ? "▼ " : "▶ "}Optional details</span>
        <span className="text-xs text-[var(--land-muted)]">
          {showOptional ? "Hide" : "Phone, location, summary…"}
        </span>
      </button>

      {/* OPTIONAL fields — collapsed on mobile (unless expanded), always shown on md+ */}
      <div className={`${showOptional ? "block" : "hidden"} md:block space-y-6`}>
        <TextField label="Subtitle / Tagline" value={basics.subtitle} onChange={(v) => updateBasics("subtitle", v)} placeholder="Transforming data into strategic insights" hint="A one-liner that captures your professional brand" examples={["Transforming complex data into actionable insights", "Building scalable solutions for enterprise challenges", "Driving growth through strategic innovation"]} />

        <TextField label="Phone" value={basics.phone} onChange={(v) => updateBasics("phone", v)} placeholder="+965 1234 5678" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Location" value={basics.location} onChange={(v) => updateBasics("location", v)} placeholder="Kuwait City, Kuwait" />
          <TextField label="Nationality" value={basics.nationality} onChange={(v) => updateBasics("nationality", v)} placeholder="Kuwaiti National" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="LinkedIn URL" value={basics.linkedin} onChange={(v) => updateBasics("linkedin", v)} placeholder="linkedin.com/in/yourname" />
          <TextField label="Website" value={basics.website} onChange={(v) => updateBasics("website", v)} placeholder="yourwebsite.com" />
        </div>

        <TextareaField
          label="Professional Summary"
          value={basics.bio}
          onChange={(v) => updateBasics("bio", v)}
          placeholder="Write 2-3 sentences about your expertise and career highlights..."
          hint="Focus on achievements and impact, not just job duties."
          rows={3}
          writingTips={[
            "Start with your years of experience and core expertise",
            "Mention 2-3 specific achievements with numbers",
            "Use strong verbs: led, delivered, transformed, optimized",
          ]}
          templates={[
            { label: "Finance", text: "Results-driven financial analyst with [X]+ years of experience in corporate finance, investment analysis, and risk management. Proven track record of delivering data-driven insights that have influenced over $[X] in strategic decisions." },
            { label: "Tech", text: "Full-stack engineer with [X]+ years building scalable applications. Led teams of [X] and delivered solutions serving [X]+ users." },
            { label: "General", text: "Accomplished professional with [X]+ years of experience in [field]. Known for [key strength] and delivering measurable results including [achievement]." },
          ]}
        />

        <TextareaField
          label="Value Proposition"
          value={basics.valueProposition}
          onChange={(v) => updateBasics("valueProposition", v)}
          placeholder="What unique value do you bring to employers?"
          hint="Your elevator pitch — why should they hire YOU?"
          rows={4}
          writingTips={[
            "Answer: What problem do you solve better than anyone?",
            "Include your unique combination of skills",
            "Quantify your impact where possible",
          ]}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-[var(--land-bright)]">Key Metrics</h3>
            <span className="text-xs text-[var(--land-muted)]">Numbers that prove impact</span>
          </div>
          <DynamicList
            items={metrics}
            onChange={(items) => onChange({ metrics: items })}
            createEmpty={() => ({ value: "", label: "" })}
            maxItems={4}
            addLabel="Add Metric"
            renderItem={(item, _, update) => (
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Value" value={item.value} onChange={(v) => update({ value: v })} placeholder="10+" examples={["10+", "$2.4B", "35+", "6", "98%"]} />
                <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} placeholder="Years Experience" examples={["Years Experience", "Projects Delivered", "Clients Served", "Certifications"]} />
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
