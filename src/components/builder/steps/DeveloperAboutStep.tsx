"use client";

import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface DeveloperAboutStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

export function DeveloperAboutStep({ data, onChange }: DeveloperAboutStepProps) {
  const t = useTranslations("builder.developer");
  const basics = data.basics || {};
  const metrics: Array<{ value: string; label: string }> = data.metrics || [];

  const updateBasics = (field: string, value: string) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{t("aboutHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">{t("aboutIntro")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t("fullName")}
          value={basics.fullName}
          onChange={(v) => updateBasics("fullName", v)}
          required
          placeholder={t("fullNamePlaceholder")}
          hint={t("fullNameHint")}
        />
        <TextField
          label={t("title")}
          value={basics.title}
          onChange={(v) => updateBasics("title", v)}
          required
          placeholder={t("titlePlaceholder")}
          hint={t("titleHint")}
          examples={[
            "Full-Stack Engineer",
            "Frontend Engineer",
            "Backend Engineer",
            "Software Engineer",
            "Mobile Developer",
            "DevOps Engineer",
            "Machine Learning Engineer",
            "Creative Technologist",
          ]}
        />
      </div>

      <TextField
        label={t("subtitle")}
        value={basics.subtitle}
        onChange={(v) => updateBasics("subtitle", v)}
        placeholder={t("subtitlePlaceholder")}
        hint={t("subtitleHint")}
        examples={[
          "Creative Technologist",
          "Open-source maintainer",
          "Performance & 3D on the web",
          "Realtime systems & APIs",
        ]}
      />

      <TextareaField
        label={t("valueProposition")}
        value={basics.valueProposition}
        onChange={(v) => updateBasics("valueProposition", v)}
        placeholder={t("valuePropositionPlaceholder")}
        hint={t("valuePropositionHint")}
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t("email")}
          value={basics.email}
          onChange={(v) => updateBasics("email", v)}
          required
          type="email"
          placeholder="maya@okafor.dev"
        />
        <TextField
          label={t("phone")}
          value={basics.phone}
          onChange={(v) => updateBasics("phone", v)}
          placeholder="+965 1234 5678"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t("location")}
          value={basics.location}
          onChange={(v) => updateBasics("location", v)}
          placeholder={t("locationPlaceholder")}
        />
        <TextField
          label={t("website")}
          value={basics.website}
          onChange={(v) => updateBasics("website", v)}
          placeholder={t("websitePlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField
          label={t("github")}
          value={basics.github}
          onChange={(v) => updateBasics("github", v)}
          placeholder={t("githubPlaceholder")}
          hint={t("githubHint")}
        />
        <TextField
          label={t("linkedin")}
          value={basics.linkedin}
          onChange={(v) => updateBasics("linkedin", v)}
          placeholder={t("linkedinPlaceholder")}
        />
        <TextField
          label={t("instagram")}
          value={basics.instagram}
          onChange={(v) => updateBasics("instagram", v)}
          placeholder={t("instagramPlaceholder")}
        />
      </div>

      {/* Resume — prominent button on the published hero */}
      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-accent)]/30 rounded-lg p-4">
        <TextField
          label={t("resumeUrl")}
          value={basics.resumeUrl}
          onChange={(v) => updateBasics("resumeUrl", v)}
          placeholder={t("resumeUrlPlaceholder")}
          hint={t("resumeUrlHint")}
        />
      </div>

      {/* Hero stat counters → top-level `metrics` */}
      <div>
        <h3 className="text-lg font-medium text-white mb-1">{t("metricsHeading")}</h3>
        <p className="text-xs text-[var(--land-muted)] mb-3">{t("metricsHint")}</p>
        <DynamicList
          items={metrics}
          onChange={(items) => onChange({ metrics: items })}
          createEmpty={() => ({ value: "", label: "" })}
          maxItems={4}
          addLabel={t("addMetric")}
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-16">
              <TextField
                label={t("metricValue")}
                value={item.value}
                onChange={(v) => update({ value: v })}
                placeholder={t("metricValuePlaceholder")}
                examples={["6+", "40+", "1.2M", "99.9%"]}
              />
              <TextField
                label={t("metricLabel")}
                value={item.label}
                onChange={(v) => update({ label: v })}
                placeholder={t("metricLabelPlaceholder")}
                examples={["Years shipping", "Projects delivered", "Users reached", "Open-source stars"]}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
