"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
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

type Step = { name: string; component: React.ComponentType<{ data: any; onChange: (updates: any) => void }> };

const CORPORATE_STEPS: Step[] = [
  { name: "Basics", component: BasicsStep },
  { name: "Experience", component: ExperienceStep },
  { name: "Achievements", component: AchievementsStep },
  { name: "Skills", component: SkillsStep },
  { name: "Education", component: EducationStep },
  { name: "Endorsements", component: EndorsementsStep },
  { name: "Customize", component: CustomizeStep },
];

// greglagana.com-inspired: About → Projects → Background → Customize
const ENGINEER_STEPS: Step[] = [
  { name: "About", component: EngineerBasicsStep },
  { name: "Projects", component: EngineerProjectsStep },
  { name: "Background", component: EngineerBackgroundStep },
  { name: "Customize", component: EngineerCustomizeStep },
];

// Artist gallery flow: Profile → Gallery (cone) → About → Customize
const CREATIVE_STEPS: Step[] = [
  { name: "Profile", component: CreativeProfileStep },
  { name: "Gallery", component: CreativeGalleryStep },
  { name: "About", component: CreativeAboutStep },
  { name: "Customize", component: CreativeCustomizeStep },
];

const TEMPLATE_STEPS: Record<string, Step[]> = {
  corporate: CORPORATE_STEPS,
  engineer: ENGINEER_STEPS,
  creative: CREATIVE_STEPS,
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

  return (
    <div>
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
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
              <span className="hidden sm:inline">{step.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-[var(--land-surface)]/40 border border-[var(--land-border)]/50 rounded-2xl p-4 sm:p-8 mb-6 overflow-hidden">
        <div className="h-px -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 mb-6 sm:mb-8 bg-gradient-to-r from-transparent via-[var(--land-accent)]/30 to-transparent" />
        <StepComponent data={formData} onChange={handleChange} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="min-w-[120px] rounded-lg border border-[var(--land-border)] px-6 py-2.5 text-sm text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)] transition-colors active:scale-[0.98] disabled:opacity-30"
        >
          &larr; Previous
        </button>
        <span className={`text-xs text-[var(--land-muted)] flex items-center gap-1 ${saving ? "animate-pulse" : ""}`}>
          {saving ? "Saving..." : (
            <>
              <svg className="w-3 h-3 text-[var(--land-accent)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5" />
              </svg>
              Auto-saved
            </>
          )}
        </span>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={goNext}
            className="min-w-[120px] rounded-lg bg-[var(--land-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98]"
          >
            Next &rarr;
          </button>
        ) : (
          <button
            onClick={async () => { await save(); window.location.href = `/${locale}/dashboard/${portfolioId}/preview`; }}
            className="min-w-[120px] rounded-lg bg-[var(--land-accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98] text-center"
          >
            Preview &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
