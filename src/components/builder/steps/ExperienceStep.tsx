"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface ExperienceStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

export function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const t = useTranslations("builder.general");
  const experience = data.experience || [];
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current && experience.length === 0) {
      seeded.current = true;
      onChange({ experience: [{ title: "", company: "", startDate: "", endDate: "", description: "", highlights: [] }] });
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("expHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">{t.rich("expIntro", { strong: (chunks) => <strong className="text-[var(--land-bright)]">{chunks}</strong> })}</p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-amber-900/30 rounded-lg p-4 text-sm text-amber-300/80">
        <strong>{t("expPowerWordsLabel")}</strong> {t("expPowerWordsList")}
      </div>

      <DynamicList
        items={experience}
        onChange={(items) => onChange({ experience: items })}
        createEmpty={() => ({ title: "", company: "", startDate: "", endDate: "", description: "", highlights: [] as string[] })}
        maxItems={10}
        addLabel={t("addPosition")}
        renderItem={(item, _, update) => (
          <div className="space-y-3 pr-16">
            <div className="grid grid-cols-2 gap-3">
              <TextField label={t("jobTitleLabel")} value={item.title} onChange={(v) => update({ title: v })} placeholder={t("jobTitlePlaceholder")} />
              <TextField label={t("companyLabel")} value={item.company} onChange={(v) => update({ company: v })} placeholder={t("companyPlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label={t("startDateLabel")} value={item.startDate} onChange={(v) => update({ startDate: v })} placeholder={t("startDatePlaceholder")} hint={t("startDateHint")} />
              <TextField label={t("endDateLabel")} value={item.endDate || ""} onChange={(v) => update({ endDate: v })} placeholder={t("endDatePlaceholder")} hint={t("endDateHint")} />
            </div>
            <TextareaField label={t("roleDescLabel")} value={item.description || ""} onChange={(v) => update({ description: v })} placeholder={t("roleDescPlaceholder")} rows={2} writingTips={t.raw("roleDescTips") as string[]} />
            <TextareaField
              label={t("highlightsLabel")}
              value={(item.highlights || []).join("\n")}
              onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })}
              placeholder={t("highlightsPlaceholder")}
              rows={4}
              hint={t("highlightsHint")}
              writingTips={t.raw("highlightsTips") as string[]}
            />
          </div>
        )}
      />
    </div>
  );
}
