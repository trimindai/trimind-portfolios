"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";

interface CreativeProfileStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function CreativeProfileStep({ data, onChange }: CreativeProfileStepProps) {
  const t = useTranslations("builder.creative");
  const basics = data.basics || {};
  // Mobile: collapse optional fields; desktop (md+) always shows everything.
  const [showOptional, setShowOptional] = useState(false);

  const updateBasics = (field: string, value: string) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("profileHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          {t("profileIntro")}
        </p>
      </div>

      {/* REQUIRED — always visible */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label={t("fullName")} autoComplete="name"
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
            examples={t.raw("titleExamples") as string[]}
          />
        </div>
        <TextField
          label={t("email")}
          value={basics.email}
          onChange={(v) => updateBasics("email", v)}
          required
          type="email" autoComplete="email" inputMode="email" dir="ltr"
          placeholder={t("emailPlaceholder")}
        />
      </div>

      {/* OPTIONAL toggle — MOBILE ONLY. Desktop always shows the fields below. */}
      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="md:hidden w-full flex items-center justify-between min-h-[48px] px-4 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)]/40 text-sm font-medium text-[var(--land-bright)]"
        aria-expanded={showOptional}
      >
        <span>{showOptional ? "▼ " : "▶ "}{t("optionalDetails")}</span>
        <span className="text-xs text-[var(--land-muted)]">{showOptional ? t("optionalHide") : t("optionalSummary")}</span>
      </button>

      {/* OPTIONAL — collapsed on mobile (unless expanded), always shown on md+ */}
      <div className={`${showOptional ? "block" : "hidden"} md:block space-y-6`}>
      <TextField
        label={t("tagline")}
        value={basics.subtitle}
        onChange={(v) => updateBasics("subtitle", v)}
        placeholder={t("taglinePlaceholder")}
        hint={t("taglineHint")}
        examples={t.raw("taglineExamples") as string[]}
      />

      <TextField
        label={t("phone")} type="tel" autoComplete="tel" inputMode="tel" dir="ltr"
        value={basics.phone}
        onChange={(v) => updateBasics("phone", v)}
        placeholder={t("phonePlaceholder")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t("location")}
          value={basics.location}
          onChange={(v) => updateBasics("location", v)}
          placeholder={t("locationPlaceholder")}
        />
        <TextField
          label={t("nationality")}
          value={basics.nationality}
          onChange={(v) => updateBasics("nationality", v)}
          placeholder={t("nationalityPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField
          label={t("instagram")} type="url" inputMode="url" dir="ltr"
          value={basics.instagram}
          onChange={(v) => updateBasics("instagram", v)}
          placeholder={t("instagramPlaceholder")}
          hint={t("instagramHint")}
        />
        <TextField
          label={t("linkedin")} type="url" inputMode="url" dir="ltr"
          value={basics.linkedin}
          onChange={(v) => updateBasics("linkedin", v)}
          placeholder={t("linkedinPlaceholder")}
        />
        <TextField
          label={t("website")} type="url" inputMode="url" dir="ltr"
          value={basics.website}
          onChange={(v) => updateBasics("website", v)}
          placeholder={t("websitePlaceholder")}
          hint={t("websiteHint")}
        />
      </div>

      <TextField
        label={t("resumeUrl")}
        value={basics.resumeUrl}
        onChange={(v) => updateBasics("resumeUrl", v)}
        placeholder={t("resumeUrlPlaceholder")}
        hint={t("resumeUrlHint")}
      />

      <TextareaField
        label={t("bio")}
        value={basics.bio}
        onChange={(v) => updateBasics("bio", v)}
        placeholder={t("bioPlaceholder")}
        hint={t("bioHint")}
        rows={4}
        writingTips={t.raw("bioWritingTips") as string[]}
        templates={t.raw("bioTemplates") as { label: string; text: string }[]}
      />
      </div>
    </div>
  );
}
