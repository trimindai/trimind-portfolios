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

const TEMPLATE_STEPS: Record<string, Step[]> = {
  corporate: CORPORATE_STEPS,
  engineer: ENGINEER_STEPS,
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

  const goPrev = () => {
    if (currentStep > 0) {
      save();
      setCurrentStep(currentStep - 1);
    }
  };

  const StepComponent = steps[currentStep].component;

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => { save(); setCurrentStep(i); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                i === currentStep
                  ? "bg-emerald-600 text-white"
                  : i < currentStep
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "bg-slate-800 text-slate-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
                {i < currentStep ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{step.name}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px mx-1 ${i < currentStep ? "bg-emerald-600" : "bg-slate-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
        <StepComponent data={formData} onChange={handleChange} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-30"
        >
          Previous
        </button>
        <span className="text-xs text-slate-500">
          {saving ? "Saving..." : "Auto-saved"}
        </span>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={goNext}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Next
          </button>
        ) : (
          <a
            href={`/${locale}/dashboard/${portfolioId}/preview`}
            onClick={() => save()}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Preview →
          </a>
        )}
      </div>
    </div>
  );
}
