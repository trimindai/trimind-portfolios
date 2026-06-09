"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Info, Pencil, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { resolveTemplateId } from "@/lib/templates";
import { useKeyboardScroll } from "@/hooks/useKeyboardScroll";
import { BasicsStep } from "./steps/BasicsStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { AchievementsStep } from "./steps/AchievementsStep";
import { SkillsStep } from "./steps/SkillsStep";
import { EducationStep } from "./steps/EducationStep";
import { EndorsementsStep } from "./steps/EndorsementsStep";
import { CustomizeStep } from "./steps/CustomizeStep";
import { EngineerBasicsStep } from "./steps/EngineerBasicsStep";
import { EngineerProjectsStep } from "./steps/EngineerProjectsStep";
import { EngineerBackgroundStep } from "./steps/EngineerBackgroundStep";
import { EngineerCustomizeStep } from "./steps/EngineerCustomizeStep";
import { CreativeProfileStep } from "./steps/CreativeProfileStep";
import { CreatorProfileStep } from "./steps/CreatorProfileStep";
import { CreatorBrandsStep } from "./steps/CreatorBrandsStep";
import { CreativeGalleryStep } from "./steps/CreativeGalleryStep";
import { CreativeAboutStep } from "./steps/CreativeAboutStep";
import { CreativeCustomizeStep } from "./steps/CreativeCustomizeStep";
import { CvFieldsStep } from "./steps/CvFieldsStep";
import { DeveloperAboutStep } from "./steps/DeveloperAboutStep";
import { DeveloperStackStep } from "./steps/DeveloperStackStep";
import { DeveloperExperienceStep } from "./steps/DeveloperExperienceStep";
import { DeveloperCredentialsStep } from "./steps/DeveloperCredentialsStep";
import { DeveloperCustomizeStep } from "./steps/DeveloperCustomizeStep";

type Step = {
  name: string;
  labelKey?: string;
  optional?: boolean;
  requiredFields?: string[];
  component: React.ComponentType<{ data: any; onChange: (updates: any) => void }>;
};

const GENERAL_STEPS: Step[] = [
  { name: "Basics", labelKey: "basics", requiredFields: ["basics.fullName", "basics.title", "basics.email"], component: BasicsStep },
  { name: "Experience", labelKey: "experience", requiredFields: ["experience"], component: ExperienceStep },
  { name: "Achievements", labelKey: "achievements", optional: true, component: AchievementsStep },
  { name: "Skills", labelKey: "skills", optional: true, component: SkillsStep },
  { name: "Education", labelKey: "education", optional: true, component: EducationStep },
  { name: "CV Details", labelKey: "cv", optional: true, component: CvFieldsStep },
  { name: "Endorsements", labelKey: "endorsements", optional: true, component: EndorsementsStep },
  { name: "Customize", labelKey: "customize", component: CustomizeStep },
];

const ENGINEER_STEPS: Step[] = [
  { name: "About", labelKey: "basics", requiredFields: ["basics.fullName", "basics.title", "basics.email"], component: EngineerBasicsStep },
  { name: "Projects", labelKey: "projects", requiredFields: ["projects"], component: EngineerProjectsStep },
  { name: "Background", labelKey: "background", optional: true, component: EngineerBackgroundStep },
  { name: "CV Details", labelKey: "cv", optional: true, component: CvFieldsStep },
  { name: "Customize", labelKey: "customize", component: EngineerCustomizeStep },
];

const CREATIVE_STEPS: Step[] = [
  { name: "Profile", labelKey: "basics", requiredFields: ["basics.fullName", "basics.title", "basics.email"], component: CreativeProfileStep },
  { name: "Gallery", labelKey: "gallery", requiredFields: ["projects"], component: CreativeGalleryStep },
  { name: "About", labelKey: "about", optional: true, component: CreativeAboutStep },
  { name: "CV Details", labelKey: "cv", optional: true, component: CvFieldsStep },
  { name: "Customize", labelKey: "customize", component: CreativeCustomizeStep },
];

const DEVELOPER_STEPS: Step[] = [
  { name: "About", labelKey: "basics", requiredFields: ["basics.fullName", "basics.title", "basics.email"], component: DeveloperAboutStep },
  { name: "Stack", labelKey: "stack", optional: true, component: DeveloperStackStep },
  { name: "Experience", labelKey: "experience", optional: true, component: DeveloperExperienceStep },
  { name: "Projects", labelKey: "projects", requiredFields: ["projects"], component: EngineerProjectsStep },
  { name: "Background", labelKey: "background", optional: true, component: DeveloperCredentialsStep },
  { name: "CV Details", labelKey: "cv", optional: true, component: CvFieldsStep },
  { name: "Customize", labelKey: "customize", component: DeveloperCustomizeStep },
];

// Creator: same data shape as Creative (basics / projects w/ cover image + category /
// metrics / skills / experience / certifications / endorsements), reusing those editors.
const CREATOR_STEPS: Step[] = [
  { name: "Profile", labelKey: "basics", requiredFields: ["basics.fullName", "basics.title", "basics.email"], component: CreatorProfileStep },
  { name: "Work", labelKey: "work", requiredFields: ["projects"], component: CreativeGalleryStep },
  { name: "Audience & Awards", labelKey: "audienceAwards", optional: true, component: CreativeAboutStep },
  { name: "Brands", labelKey: "brands", optional: true, component: CreatorBrandsStep },
  { name: "CV Details", labelKey: "cv", optional: true, component: CvFieldsStep },
  { name: "Customize", labelKey: "customize", component: CustomizeStep },
];

const TEMPLATE_STEPS: Record<string, Step[]> = {
  general: GENERAL_STEPS,
  engineer: ENGINEER_STEPS,
  creative: CREATIVE_STEPS,
  developer: DEVELOPER_STEPS,
  creator: CREATOR_STEPS,
};

function getStepsForTemplate(templateId: string): Step[] {
  return TEMPLATE_STEPS[resolveTemplateId(templateId)] || GENERAL_STEPS;
}

function getFieldValue(data: any, path: string): any {
  return path.split(".").reduce((obj, key) => obj?.[key], data);
}

function computeProgress(data: any, steps: Step[]): number {
  let filled = 0;
  let total = 0;

  const check = (val: any) => {
    total++;
    if (val && (typeof val === "string" ? val.trim().length > 0 : Array.isArray(val) ? val.length > 0 : true)) filled++;
  };

  check(data.basics?.fullName);
  check(data.basics?.title);
  check(data.basics?.email);
  check(data.basics?.bio);
  check(data.basics?.location);

  if (steps.some((s) => s.name === "Experience" || s.name === "Background")) {
    check(data.experience);
  }
  if (steps.some((s) => s.name === "Projects" || s.name === "Gallery")) {
    check(data.projects);
  }
  check(data.skills);
  check(data.education);
  check(data.customization?.primaryColor);

  return total > 0 ? Math.round((filled / total) * 100) : 0;
}

// localStorage key for the guest (unauthenticated) builder draft. Holds a richer
// blob than the landing-page "portfolio-draft" handoff (which is name/title only).
export const GUEST_STORAGE_KEY = "portfolio_preview_data";

// Keys that may exist on a portfolio document but must NOT be forwarded to the
// `update` mutation. Some are server-owned (set at create time or by the server:
// _id, _creationTime, userId, status, templateId, name, locale, slug,
// generatedHtml, generatedProjectPages, paymentId, publishedAt, createdAt,
// lastEditedAt); contentAr is a valid update arg but is stripped because the
// builder doesn't produce Arabic content yet. Single source of truth so the
// guest seeding path (dashboard/new) can't drift from save().
export const PORTFOLIO_UPDATE_STRIP_KEYS = [
  "_id",
  "_creationTime",
  "status",
  "slug",
  "generatedHtml",
  "generatedProjectPages",
  "paymentId",
  "publishedAt",
  "createdAt",
  "lastEditedAt",
  "userId",
  "templateId",
  "name",
  "locale",
  "contentAr",
] as const;

interface BuilderFormProps {
  // Required in the authenticated path; unused (and absent) in guest mode.
  portfolioId?: Id<"portfolios">;
  initialData: any;
  // When true: never touch Convex. State is seeded from / persisted to
  // localStorage["portfolio_preview_data"]; Publish/Download are routed by the
  // host page (see onPublish) to the sign-up flow. Authenticated path is wholly
  // unaffected when this is falsy/undefined.
  guest?: boolean;
  // Guest-only: called when the user reaches the final step / hits Publish.
  // Host page redirects to sign-up with a post-signup restore URL.
  onPublish?: () => void;
}

export function BuilderForm({ portfolioId, initialData, guest, onPublish }: BuilderFormProps) {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const isRTL = locale === "ar";
  const tSteps = useTranslations("builder.steps");
  const tNav = useTranslations("builder.nav");
  const tValidation = useTranslations("builder.validation");
  const [currentStep, setCurrentStep] = useState(0);
  // Set when Next is pressed on a step whose required fields are empty; the
  // second press proceeds anyway (gentle nudge, never a dead end).
  const [requiredNudge, setRequiredNudge] = useState(false);
  // Guest mode: seed from localStorage (parse safely), falling back to initialData.
  const [formData, setFormData] = useState<any>(() => {
    if (guest && typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(GUEST_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            // Always trust the route's templateId so the step-set matches the URL.
            return { ...initialData, ...parsed, templateId: initialData.templateId };
          }
        }
      } catch {
        // Corrupt/blocked storage — fall back to the empty/default shape.
      }
    }
    return initialData;
  });
  const [saving, setSaving] = useState(false);
  // Hook order must be stable: always call useMutation. It's simply never
  // invoked in guest mode (save() is guarded by !guest).
  const updatePortfolio = useMutation(api.portfolios.update);

  // Keep focused inputs visible above the mobile keyboard (no-op on desktop).
  useKeyboardScroll();

  const steps = useMemo(
    () => getStepsForTemplate(initialData.templateId || "general"),
    [initialData.templateId]
  );

  const progress = useMemo(() => computeProgress(formData, steps), [formData, steps]);
  const stepProgress = steps.length > 1 ? Math.round(((currentStep + 1) / steps.length) * 100) : 100;

  const [pricingCollapsed, setPricingCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.localStorage.getItem("pricing_banner_collapsed") === "1") return true;
    // Phones: default to the compact pill after step 1 — the full banner costs
    // ~140px of a small viewport. (Step 1 always shows the full banner.)
    return window.matchMedia("(max-width: 767px)").matches;
  });
  const dismissPricing = () => {
    setPricingCollapsed(true);
    try { window.localStorage.setItem("pricing_banner_collapsed", "1"); } catch {}
  };

  const handleChange = useCallback((updates: any) => {
    setFormData((prev: any) => {
      const next = { ...prev, ...updates };
      // Guest mode: persist every change to localStorage (no Convex).
      if (guest && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Storage full/blocked — keep editing in-memory; nothing else to do.
        }
      }
      return next;
    });
  }, [guest]);

  const save = async () => {
    // Guest mode never persists to Convex; localStorage is updated on each change.
    if (guest || !portfolioId) return;
    setSaving(true);
    try {
      const STRIP_KEYS = new Set<string>(PORTFOLIO_UPDATE_STRIP_KEYS);
      const fields = Object.fromEntries(Object.entries(formData).filter(([k]) => !STRIP_KEYS.has(k)));
      await updatePortfolio({ id: portfolioId, ...fields });
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  const stepHasMissingRequired = (step: Step) =>
    (step.requiredFields || []).some((path) => {
      const v = getFieldValue(formData, path);
      if (Array.isArray(v)) return v.length === 0;
      return !v || (typeof v === "string" && v.trim() === "");
    });

  const goNext = async () => {
    // Gentle required-field nudge: first press warns, second press proceeds.
    if (!requiredNudge && stepHasMissingRequired(steps[currentStep])) {
      setRequiredNudge(true);
      return;
    }
    setRequiredNudge(false);
    const nextStep = currentStep + 1;
    if (!guest && nextStep > (formData.lastCompletedStep ?? 0)) {
      setFormData((prev: any) => ({ ...prev, lastCompletedStep: nextStep }));
    }
    await save();
    if (currentStep < steps.length - 1) {
      setCurrentStep(nextStep);
    }
  };

  const goPrev = async () => {
    setRequiredNudge(false);
    if (currentStep > 0) {
      await save();
      setCurrentStep(currentStep - 1);
    }
  };

  const StepComponent = steps[currentStep].component;
  const stepLabel = (step: Step) => (step.labelKey ? tSteps(step.labelKey as any) : step.name);
  const currentStepDef = steps[currentStep];

  const hasBasicsAndExperience = !!(
    formData.basics?.fullName?.trim() &&
    formData.basics?.title?.trim() &&
    formData.basics?.email?.trim() &&
    (formData.experience?.length > 0 || formData.projects?.length > 0)
  );

  // In guest mode the draft pricing/progress chrome should always show (there's
  // no Convex "status" field); authenticated path keeps its status === "draft" gate.
  const showDraftChrome = guest || formData.status === "draft";
  const showPaidChrome = !guest && (formData.status === "paid" || formData.status === "published");

  return (
    <div>
      {/* Paid confirmation banner */}
      {showPaidChrome && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-600/20 bg-emerald-600/5 px-4 py-3">
          <Check className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden />
          <p className="text-sm text-[var(--land-bright)]">
            {isRTL
              ? "✓ دفعت بالفعل — عدّل بحرية وأعد التحميل في أي وقت."
              : "✓ You've already paid — edit freely and re-download anytime."}
          </p>
        </div>
      )}

      {/* Pricing context + progress bar */}
      {showDraftChrome && (
        currentStep > 0 && pricingCollapsed ? (
          <div className="mb-4 flex justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--land-accent)]/20 bg-[var(--land-accent)]/5 px-3 py-1.5 text-xs font-medium text-[var(--land-accent)]">
              {isRTL ? "4.9 د.ك عند الجهوزية ✓" : "4.9 KD when ready ✓"}
              <span className="text-[var(--land-muted)]">{stepProgress}%</span>
            </span>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--land-accent)]/20 bg-[var(--land-accent)]/5 px-4 py-3">
            <Pencil className="h-4 w-4 text-[var(--land-accent)] shrink-0" aria-hidden />
            <div className="flex-1">
              <p className="text-sm text-[var(--land-bright)]">
                {isRTL
                  ? "أنت تبني مسودة مجانية. ادفع 4.900 د.ك فقط عند تجهيز PDF الاحترافي."
                  : "You're building a free draft. Pay 4.900 KD only when your professional PDF is ready."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-20 sm:w-24 h-2 rounded-full bg-[var(--land-border)]/50 overflow-hidden">
                <div
                  className="h-full bg-[var(--land-accent)] rounded-full transition-all duration-500"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[var(--land-accent)]">{stepProgress}%</span>
            </div>
            {currentStep > 0 && (
              <button onClick={dismissPricing} className="text-[var(--land-muted)] hover:text-[var(--land-bright)] text-sm ms-1" aria-label="Collapse">
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        )
      )}

      {/* "Good enough" nudge — shown after basics + experience/projects filled */}
      {hasBasicsAndExperience && currentStep >= 2 && currentStep < steps.length - 1 && showDraftChrome && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--land-border)]/50 bg-[var(--land-surface)]/40 px-4 py-2.5">
          <Check className="h-3.5 w-3.5 text-[var(--land-accent)] shrink-0" aria-hidden />
          <p className="text-xs text-[var(--land-body)] flex-1">
            {isRTL
              ? "بورتفوليو جاهز لـ PDF أساسي. أكمل الباقي لجعله أقوى."
              : "Your portfolio is ready for a basic PDF. Keep going to make it stronger."}
          </p>
          <button
            onClick={async () => {
              if (guest) { onPublish?.(); return; }
              await save();
              window.location.href = `/${locale}/dashboard/${portfolioId}/preview`;
            }}
            className="text-xs text-[var(--land-accent)] hover:text-[var(--land-accent-hover)] font-medium shrink-0"
          >
            {isRTL ? "معاينة الآن" : "Preview now"}
            <ArrowRight className="ms-1 inline h-3 w-3 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      )}

      {/* Mobile: STICKY "Step N of M" + slim bar — stays at the top while scrolling */}
      <div className="md:hidden sticky top-0 z-40 -mx-4 mb-4 border-b border-[var(--land-border)] bg-[var(--land-bg)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--land-bright)]">
            {isRTL
              ? `${stepLabel(currentStepDef)} — ${currentStep + 1} من ${steps.length}`
              : `${stepLabel(currentStepDef)} — ${currentStep + 1} of ${steps.length}`}
          </span>
          {currentStepDef.optional && (
            <span className="text-[10px] text-[var(--land-muted)]">{isRTL ? "اختياري" : "optional"}</span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-[var(--land-border)]/50 overflow-hidden">
          <div
            className="h-full bg-[var(--land-accent)] rounded-full transition-all duration-500"
            style={{ width: `${steps.length > 1 ? ((currentStep + 1) / steps.length) * 100 : 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: full circle row (unchanged) */}
      <div className="mb-6">
        <div className="hidden md:block relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-[var(--land-border)]/50 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-[var(--land-accent)] rounded-full transition-all duration-500"
            style={{ width: `${steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0}%` }}
          />
          <div className="relative flex items-center justify-between">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={async () => { setRequiredNudge(false); await save(); setCurrentStep(i); }}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-sm transition-all duration-300 ${
                  i === currentStep
                    ? "bg-[var(--land-accent)] text-white"
                    : i < currentStep
                      ? "bg-[var(--land-accent)]/20 text-[var(--land-accent-hover)]"
                      : "bg-[var(--land-surface-raised)] text-[var(--land-muted)]"
                }`}
              >
                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0">
                  {i < currentStep ? (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  ) : i + 1}
                </span>
                <span>{stepLabel(step)}</span>
                {step.optional && i !== currentStep && (
                  <span className="text-[10px] opacity-60">{isRTL ? "(اختياري)" : "(optional)"}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional step hint banner */}
      {currentStepDef.optional && (
        <div className="mb-4 flex items-center gap-2 text-xs text-[var(--land-muted)]">
          <Info className="h-3.5 w-3.5 text-[var(--land-body)] shrink-0" aria-hidden />
          {isRTL
            ? "هذه الخطوة اختيارية — يمكنك تخطيها والعودة لاحقًا."
            : "This step is optional — you can skip it and come back later."}
          <button
            onClick={goNext}
            className="text-[var(--land-accent)] hover:text-[var(--land-accent-hover)] font-medium underline underline-offset-2"
          >
            {isRTL ? "تخطي" : "Skip"}
          </button>
        </div>
      )}

      {/* Step content */}
      <div className="bg-[var(--land-surface)]/40 border border-[var(--land-border)]/50 rounded-2xl p-4 sm:p-8 mb-6 overflow-hidden">
        <div className="h-px -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 mb-6 sm:mb-8 bg-gradient-to-r from-transparent via-[var(--land-accent)]/30 to-transparent" />
        <StepComponent data={formData} onChange={handleChange} />
      </div>

      {/* Required-fields nudge: first Next press on an incomplete required step */}
      {requiredNudge && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600" role="status">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            {tValidation("requiredMissing")} {tValidation("requiredMissingContinue")}
          </span>
        </div>
      )}

      {/* Auto-save status — above content, not competing with buttons */}
      <div className={`flex items-center justify-end gap-1 mb-2 text-xs text-[var(--land-muted)] ${saving ? "animate-pulse" : ""}`}>
        {saving ? tNav("saving") : (
          <>
            <svg className="w-3 h-3 text-[var(--land-accent)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
            {guest
              ? (isRTL ? "محفوظ على جهازك" : "Saved on this device")
              : tNav("autoSaved")}
          </>
        )}
      </div>

      {/* Navigation — clean layout, nothing truncated */}
      <div className="sticky bottom-0 z-10 -mx-4 sm:mx-0 flex items-center justify-between gap-2 border-t border-[var(--land-border)] bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--land-border)] px-3 py-2.5 text-sm text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)] transition-colors disabled:opacity-30"
            title={isRTL ? "السابق" : "Previous"}
            aria-label={isRTL ? "السابق" : "Previous"}
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
          <button
            onClick={async () => {
              if (guest) { window.location.href = `/${locale}`; return; }
              await save();
              window.location.href = `/${locale}/dashboard`;
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-[var(--land-border)] px-3 py-2.5 text-xs text-[var(--land-muted)] hover:text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)] transition-colors"
            title={guest ? (isRTL ? "خروج" : "Exit") : (isRTL ? "حفظ وخروج" : "Save & exit")}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            <span>
              {guest ? (isRTL ? "خروج" : "Exit") : (isRTL ? "حفظ" : "Exit")}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {currentStepDef.optional && currentStep < steps.length - 1 && (
            <button
              onClick={goNext}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--land-border)] px-4 py-2.5 text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)] transition-colors"
            >
              {isRTL ? "تخطي" : "Skip"}
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              onClick={goNext}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-[var(--land-accent)] px-5 sm:px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98]"
            >
              <span>{tNav("next")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>
          ) : guest ? (
            <button
              onClick={() => onPublish?.()}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-[var(--land-accent)] px-5 sm:px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98]"
            >
              <span>{isRTL ? "سجّل لنشر ملفك" : "Sign up to publish"}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>
          ) : (
            <button
              onClick={async () => { await save(); window.location.href = `/${locale}/dashboard/${portfolioId}/preview`; }}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-[var(--land-accent)] px-5 sm:px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98]"
            >
              <span>{tNav("preview")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
