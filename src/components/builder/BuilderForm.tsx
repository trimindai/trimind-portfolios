"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
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
import { CreativeGalleryStep } from "./steps/CreativeGalleryStep";
import { CreativeAboutStep } from "./steps/CreativeAboutStep";
import { CreativeCustomizeStep } from "./steps/CreativeCustomizeStep";
import { CvFieldsStep } from "./steps/CvFieldsStep";

// `name` is the English fallback label; `labelKey` (when present) is looked up in
// the `builder.steps` i18n namespace so the step indicator is bilingual.
type Step = {
  name: string;
  labelKey?: string;
  component: React.ComponentType<{ data: any; onChange: (updates: any) => void }>;
};

const CORPORATE_STEPS: Step[] = [
  { name: "Basics", labelKey: "basics", component: BasicsStep },
  { name: "Experience", labelKey: "experience", component: ExperienceStep },
  { name: "Achievements", component: AchievementsStep },
  { name: "Skills", labelKey: "skills", component: SkillsStep },
  { name: "Education", labelKey: "education", component: EducationStep },
  { name: "CV Details", labelKey: "cv", component: CvFieldsStep },
  { name: "Endorsements", component: EndorsementsStep },
  { name: "Customize", labelKey: "customize", component: CustomizeStep },
];

// greglagana.com-inspired: About → Projects → Background → CV → Customize
const ENGINEER_STEPS: Step[] = [
  { name: "About", labelKey: "basics", component: EngineerBasicsStep },
  { name: "Projects", labelKey: "projects", component: EngineerProjectsStep },
  { name: "Background", labelKey: "education", component: EngineerBackgroundStep },
  { name: "CV Details", labelKey: "cv", component: CvFieldsStep },
  { name: "Customize", labelKey: "customize", component: EngineerCustomizeStep },
];

// Artist gallery flow: Profile → Gallery (cone) → About → CV → Customize
const CREATIVE_STEPS: Step[] = [
  { name: "Profile", labelKey: "basics", component: CreativeProfileStep },
  { name: "Gallery", component: CreativeGalleryStep },
  { name: "About", component: CreativeAboutStep },
  { name: "CV Details", labelKey: "cv", component: CvFieldsStep },
  { name: "Customize", labelKey: "customize", component: CreativeCustomizeStep },
];

// Developer mirrors the engineer flow (code-first profile) so it stops falling
// back to the corporate step list. About → Projects → Background → CV → Customize.
const DEVELOPER_STEPS: Step[] = [
  { name: "About", labelKey: "basics", component: EngineerBasicsStep },
  { name: "Projects", labelKey: "projects", component: EngineerProjectsStep },
  { name: "Background", labelKey: "education", component: EngineerBackgroundStep },
  { name: "CV Details", labelKey: "cv", component: CvFieldsStep },
  { name: "Customize", labelKey: "customize", component: EngineerCustomizeStep },
];

const TEMPLATE_STEPS: Record<string, Step[]> = {
  corporate: CORPORATE_STEPS,
  engineer: ENGINEER_STEPS,
  creative: CREATIVE_STEPS,
  developer: DEVELOPER_STEPS,
};

function getStepsForTemplate(templateId: string): Step[] {
  return TEMPLATE_STEPS[templateId] || CORPORATE_STEPS;
}

interface BuilderFormProps {
  portfolioId: Id<"portfolios">;
  initialData: any;
}

export function BuilderForm({ portfolioId, initialData }: BuilderFormProps) {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const tSteps = useTranslations("builder.steps");
  const tNav = useTranslations("builder.nav");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const updatePortfolio = useMutation(api.portfolios.update);

  const steps = useMemo(
    () => getStepsForTemplate(initialData.templateId || "corporate"),
    [initialData.templateId]
  );

  const handleChange = useCallback((updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      // Strip Convex metadata and read-only fields before sending to update mutation
      const STRIP_KEYS = new Set(["_id", "_creationTime", "status", "slug", "generatedHtml", "generatedProjectPages", "paymentId", "publishedAt", "createdAt", "lastEditedAt", "userId", "templateId", "name", "locale", "contentAr"]);
      const fields = Object.fromEntries(Object.entries(formData).filter(([k]) => !STRIP_KEYS.has(k)));
      await updatePortfolio({ id: portfolioId, ...fields });
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  const goNext = async () => {
    await save();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = async () => {
    if (currentStep > 0) {
      await save();
      setCurrentStep(currentStep - 1);
    }
  };

  const StepComponent = steps[currentStep].component;
  const stepLabel = (step: Step) => (step.labelKey ? tSteps(step.labelKey as any) : step.name);

  const isRTL = locale === "ar";

  return (
    <div>
      {/* Pricing context — sets expectations early */}
      {formData.status === "draft" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--land-accent)]/20 bg-[var(--land-accent)]/5 px-4 py-3">
          <span className="text-[var(--land-accent)] text-lg">&#9998;</span>
          <p className="text-sm text-[var(--land-bright)]">
            {isRTL
              ? "أنت تبني مسودة مجانية. ادفع 4.900 د.ك فقط عند تجهيز PDF الاحترافي."
              : "You’re building a free draft. Pay 4.900 KD only when your professional PDF is ready."}
          </p>
        </div>
      )}

      {/* Step indicator */}
      <div className="relative mb-8">
        {/* Progress bar track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-[var(--land-border)]/50 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-[var(--land-accent)] rounded-full transition-all duration-500"
          style={{ width: `${steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0}%` }}
        />
        <div className="relative flex items-center justify-between">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={async () => { await save(); setCurrentStep(i); }}
              className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg text-sm transition-all duration-300 ${
                i === currentStep
                  ? "bg-[var(--land-accent)] text-white ring-1 ring-[var(--land-accent)]/20"
                  : i < currentStep
                    ? "bg-[var(--land-accent)]/20 text-[var(--land-accent-hover)]"
                    : "bg-[var(--land-surface-raised)] text-[var(--land-muted)]"
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
                {i < currentStep ? (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                ) : i + 1}
              </span>
              <span className="hidden sm:inline">{stepLabel(step)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-[var(--land-surface)]/40 border border-[var(--land-border)]/50 rounded-2xl p-4 sm:p-8 mb-6 overflow-hidden">
        <div className="h-px -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 mb-6 sm:mb-8 bg-gradient-to-r from-transparent via-[var(--land-accent)]/30 to-transparent" />
        <StepComponent data={formData} onChange={handleChange} />
      </div>

      {/* Navigation — sticky on mobile so next/back are always reachable */}
      <div className="sticky bottom-0 z-10 -mx-4 sm:mx-0 flex items-center justify-between gap-3 border-t border-[var(--land-border)]/50 bg-[var(--land-bg)]/90 px-4 py-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-[var(--land-border)] px-4 sm:px-6 py-2.5 text-sm text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)] transition-colors active:scale-[0.98] disabled:opacity-30"
        >
          <span aria-hidden className="rtl:rotate-180">&larr;</span>
          <span className="hidden sm:inline">{tNav("previous")}</span>
        </button>
        <span className={`text-xs text-[var(--land-muted)] flex items-center gap-1 ${saving ? "animate-pulse" : ""}`}>
          {saving ? tNav("saving") : (
            <>
              <svg className="w-3 h-3 text-[var(--land-accent)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5" />
              </svg>
              <span className="hidden sm:inline">{tNav("autoSaved")}</span>
            </>
          )}
        </span>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={goNext}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg bg-[var(--land-accent)] px-4 sm:px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98]"
          >
            <span>{tNav("next")}</span>
            <span aria-hidden className="rtl:rotate-180">&rarr;</span>
          </button>
        ) : (
          <button
            onClick={async () => { await save(); window.location.href = `/${locale}/dashboard/${portfolioId}/preview`; }}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg bg-[var(--land-accent)] px-4 sm:px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98] text-center"
          >
            <span>{tNav("preview")}</span>
            <span aria-hidden className="rtl:rotate-180">&rarr;</span>
          </button>
        )}
      </div>
    </div>
  );
}
