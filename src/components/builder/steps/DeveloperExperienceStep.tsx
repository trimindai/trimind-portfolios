"use client";

import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface DeveloperExperienceStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

export function DeveloperExperienceStep({ data, onChange }: DeveloperExperienceStepProps) {
  const t = useTranslations("builder.developer");
  const experience = data.experience || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("experienceHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">{t("experienceIntro")}</p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-accent)]/30 rounded-lg p-4 text-sm text-[var(--land-body)]">
        {t("experiencePowerWords")}
      </div>

      <DynamicList
        items={experience}
        onChange={(items) => onChange({ experience: items })}
        createEmpty={() => ({
          title: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
          highlights: [] as string[],
        })}
        maxItems={10}
        addLabel={t("addExperience")}
        renderItem={(item, _, update) => (
          <div className="space-y-3 pr-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                label={t("expTitle")}
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder={t("expTitlePlaceholder")}
              />
              <TextField
                label={t("expCompany")}
                value={item.company}
                onChange={(v) => update({ company: v })}
                placeholder={t("expCompanyPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                label={t("expStartDate")}
                value={item.startDate}
                onChange={(v) => update({ startDate: v })}
                placeholder={t("expStartDatePlaceholder")}
              />
              <TextField
                label={t("expEndDate")}
                value={item.endDate || ""}
                onChange={(v) => update({ endDate: v })}
                placeholder={t("expEndDatePlaceholder")}
                hint={t("expEndDateHint")}
              />
            </div>
            <TextareaField
              label={t("expDescription")}
              value={item.description || ""}
              onChange={(v) => update({ description: v })}
              placeholder={t("expDescriptionPlaceholder")}
              rows={2}
            />
            <TextareaField
              label={t("expHighlights")}
              value={(item.highlights || []).join("\n")}
              onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })}
              placeholder={t("expHighlightsPlaceholder")}
              rows={4}
              hint={t("expHighlightsHint")}
            />
          </div>
        )}
      />
    </div>
  );
}
