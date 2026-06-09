"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";

interface EngineerBasicsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function EngineerBasicsStep({ data, onChange }: EngineerBasicsStepProps) {
  const t = useTranslations("builder.engineer");
  const basics = data.basics || {};
  // Mobile: collapse optional fields so the step opens with just the 3 required
  // fields. Desktop (md+) always shows everything.
  const [showOptional, setShowOptional] = useState(false);

  const updateBasics = (field: string, value: string) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("basicsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          {t("basicsIntro")}
        </p>
      </div>

      {/* REQUIRED — always visible */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label={t("basicsFullNameLabel")} autoComplete="name"
            value={basics.fullName}
            onChange={(v) => updateBasics("fullName", v)}
            required
            placeholder={t("basicsFullNamePlaceholder")}
            hint={t("basicsFullNameHint")}
          />
          <TextField
            label={t("basicsDisciplineLabel")}
            value={basics.title}
            onChange={(v) => updateBasics("title", v)}
            required
            placeholder={t("basicsDisciplinePlaceholder")}
            hint={t("basicsDisciplineHint")}
            examples={t.raw("basicsDisciplineExamples") as string[]}
          />
        </div>
        <TextField
          label={t("basicsEmailLabel")}
          value={basics.email}
          onChange={(v) => updateBasics("email", v)}
          required
          type="email" autoComplete="email" inputMode="email" dir="ltr"
          placeholder={t("basicsEmailPlaceholder")}
        />
      </div>

      {/* OPTIONAL toggle — MOBILE ONLY. Desktop always shows the fields below. */}
      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="md:hidden w-full flex items-center justify-between min-h-[48px] px-4 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)]/40 text-sm font-medium text-[var(--land-bright)]"
        aria-expanded={showOptional}
      >
        <span>{showOptional ? "▼ " : "▶ "}{t("basicsOptionalToggle")}</span>
        <span className="text-xs text-[var(--land-muted)]">{showOptional ? t("basicsOptionalHide") : t("basicsOptionalSummary")}</span>
      </button>

      {/* OPTIONAL — collapsed on mobile (unless expanded), always shown on md+ */}
      <div className={`${showOptional ? "block" : "hidden"} md:block space-y-6`}>
      <TextField
        label={t("basicsSubtitleLabel")}
        value={basics.subtitle}
        onChange={(v) => updateBasics("subtitle", v)}
        placeholder={t("basicsSubtitlePlaceholder")}
        hint={t("basicsSubtitleHint")}
        examples={t.raw("basicsSubtitleExamples") as string[]}
      />

      <TextField
        label={t("basicsPhoneLabel")} type="tel" autoComplete="tel" inputMode="tel" dir="ltr"
        value={basics.phone}
        onChange={(v) => updateBasics("phone", v)}
        placeholder={t("basicsPhonePlaceholder")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t("basicsLocationLabel")}
          value={basics.location}
          onChange={(v) => updateBasics("location", v)}
          placeholder={t("basicsLocationPlaceholder")}
        />
        <TextField
          label={t("basicsNationalityLabel")}
          value={basics.nationality}
          onChange={(v) => updateBasics("nationality", v)}
          placeholder={t("basicsNationalityPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t("basicsLinkedinLabel")} type="url" inputMode="url" dir="ltr"
          value={basics.linkedin}
          onChange={(v) => updateBasics("linkedin", v)}
          placeholder={t("basicsLinkedinPlaceholder")}
        />
        <TextField
          label={t("basicsGithubLabel")} type="url" inputMode="url" dir="ltr"
          value={basics.github}
          onChange={(v) => updateBasics("github", v)}
          placeholder={t("basicsGithubPlaceholder")}
          hint={t("basicsGithubHint")}
        />
      </div>

      <TextField
        label={t("basicsWebsiteLabel")} type="url" inputMode="url" dir="ltr"
        value={basics.website}
        onChange={(v) => updateBasics("website", v)}
        placeholder={t("basicsWebsitePlaceholder")}
      />

      {/* Resume — greglagana.com-style prominent download button */}
      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-accent)]/30 rounded-lg p-4">
        <TextField
          label={t("basicsResumeUrlLabel")}
          value={basics.resumeUrl}
          onChange={(v) => updateBasics("resumeUrl", v)}
          placeholder={t("basicsResumeUrlPlaceholder")}
          hint={t("basicsResumeUrlHint")}
        />
      </div>

      <TextareaField
        label={t("basicsBioLabel")}
        value={basics.bio}
        onChange={(v) => updateBasics("bio", v)}
        placeholder={t("basicsBioPlaceholder")}
        hint={t("basicsBioHint")}
        rows={4}
        writingTips={t.raw("basicsBioWritingTips") as string[]}
        templates={t.raw("basicsBioTemplates") as Array<{ label: string; text: string }>}
      />

      <TextareaField
        label={t("basicsObjectiveLabel")}
        value={basics.valueProposition}
        onChange={(v) => updateBasics("valueProposition", v)}
        placeholder={t("basicsObjectivePlaceholder")}
        hint={t("basicsObjectiveHint")}
        rows={3}
        writingTips={t.raw("basicsObjectiveWritingTips") as string[]}
      />
      </div>
    </div>
  );
}
