"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";

interface CreatorProfileStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function CreatorProfileStep({ data, onChange }: CreatorProfileStepProps) {
  const t = useTranslations("builder.creator");
  const basics = data.basics || {};
  // Mobile: collapse optional fields; desktop (md+) always shows everything.
  const [showOptional, setShowOptional] = useState(false);
  const set = (field: string, value: string) =>
    onChange({ basics: { ...basics, [field]: value } });

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
            onChange={(v) => set("fullName", v)}
            required
            placeholder={t("fullNamePlaceholder")}
            hint={t("fullNameHint")}
          />
          <TextField
            label={t("title")}
            value={basics.title}
            onChange={(v) => set("title", v)}
            required
            placeholder={t("titlePlaceholder")}
            hint={t("titleHint")}
            examples={t.raw("titleExamples") as string[]}
          />
        </div>
        <TextField
          label={t("email")}
          value={basics.email}
          onChange={(v) => set("email", v)}
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
        onChange={(v) => set("subtitle", v)}
        placeholder={t("taglinePlaceholder")}
        hint={t("taglineHint")}
      />

      <TextareaField
        label={t("intro")}
        value={basics.valueProposition}
        onChange={(v) => set("valueProposition", v)}
        placeholder={t("introPlaceholder")}
        hint={t("introHint")}
        rows={3}
        writingTips={t.raw("introWritingTips") as string[]}
      />

      <TextField
        label={t("phone")} type="tel" autoComplete="tel" inputMode="tel" dir="ltr"
        value={basics.phone}
        onChange={(v) => set("phone", v)}
        placeholder={t("phonePlaceholder")}
      />

      <TextField
        label={t("location")}
        value={basics.location}
        onChange={(v) => set("location", v)}
        placeholder={t("locationPlaceholder")}
      />

      <div>
        <h3 className="text-sm font-semibold text-[var(--land-bright)] mb-1">{t("channelsHeading")}</h3>
        <p className="text-xs text-[var(--land-body)] mb-3">
          {t("channelsHint")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label={t("instagram")} type="url" inputMode="url" dir="ltr"
            value={basics.instagram}
            onChange={(v) => set("instagram", v)}
            placeholder={t("instagramPlaceholder")}
          />
          <TextField
            label={t("youtube")} type="url" inputMode="url" dir="ltr"
            value={basics.youtube}
            onChange={(v) => set("youtube", v)}
            placeholder={t("youtubePlaceholder")}
          />
          <TextField
            label={t("tiktok")} type="url" inputMode="url" dir="ltr"
            value={basics.tiktok}
            onChange={(v) => set("tiktok", v)}
            placeholder={t("tiktokPlaceholder")}
          />
          <TextField
            label={t("website")} type="url" inputMode="url" dir="ltr"
            value={basics.website}
            onChange={(v) => set("website", v)}
            placeholder={t("websitePlaceholder")}
          />
          <TextField
            label={t("linkedin")} type="url" inputMode="url" dir="ltr"
            value={basics.linkedin}
            onChange={(v) => set("linkedin", v)}
            placeholder={t("linkedinPlaceholder")}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
