"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BasicsStep } from "./steps/BasicsStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { SkillsStep } from "./steps/SkillsStep";
import { EducationStep } from "./steps/EducationStep";
import { EndorsementsStep } from "./steps/EndorsementsStep";
import { CustomizeStep } from "./steps/CustomizeStep";

const STEPS = [
  { name: "Basics", component: BasicsStep },
  { name: "Experience", component: ExperienceStep },
  { name: "Skills", component: SkillsStep },
  { name: "Education", component: EducationStep },
  { name: "Endorsements", component: EndorsementsStep },
  { name: "Customize", component: CustomizeStep },
];

interface BuilderFormProps {
  portfolioId: Id<"portfolios">;
  initialData: any;
}

export function BuilderForm({ portfolioId, initialData }: BuilderFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const updatePortfolio = useMutation(api.portfolios.update);

  const handleChange = useCallback((updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { _id, _creationTime, status, slug, generatedHtml, paymentId, publishedAt, createdAt, lastEditedAt, userId, templateId, name, locale, ...fields } = formData;
      await updatePortfolio({ id: portfolioId, ...fields });
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  const goNext = async () => {
    await save();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      save();
      setCurrentStep(currentStep - 1);
    }
  };

  const StepComponent = STEPS[currentStep].component;

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, i) => (
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
            {i < STEPS.length - 1 && (
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
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={goNext}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Next
          </button>
        ) : (
          <a
            href={`/en/dashboard/${portfolioId}/preview`}
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
