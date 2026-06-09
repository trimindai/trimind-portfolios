"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface SkillsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function SkillsStep({ data, onChange }: SkillsStepProps) {
  const t = useTranslations("builder.general");
  const skills = data.skills || [];
  const certifications = data.certifications || [];
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current && skills.length === 0 && certifications.length === 0) {
      seeded.current = true;
      onChange({
        skills: [{ category: "", items: [] }],
        certifications: [{ name: "", issuer: "", year: "" }],
      });
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-2">{t("skillsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">{t("skillsIntro")}</p>

        <DynamicList
          items={skills}
          onChange={(items) => onChange({ skills: items })}
          createEmpty={() => ({ category: "", items: [] as string[] })}
          maxItems={6}
          addLabel={t("addSkillCategory")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextField label={t("skillCategoryLabel")} value={item.category} onChange={(v) => update({ category: v })} placeholder={t("skillCategoryPlaceholder")} />
              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("skillsItemsLabel")}</label>
                <input
                  value={item.items.join(", ")}
                  onChange={(e) => update({ items: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                  placeholder={t("skillsItemsPlaceholder")}
                  className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                />
              </div>
            </div>
          )}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-2">{t("certsHeading")}</h2>
        <DynamicList
          items={certifications}
          onChange={(items) => onChange({ certifications: items })}
          createEmpty={() => ({ name: "", issuer: "", year: "" })}
          maxItems={10}
          addLabel={t("addCertification")}
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-10 sm:pr-16">
              <TextField label={t("certNameLabel")} value={item.name} onChange={(v) => update({ name: v })} placeholder={t("certNamePlaceholder")} />
              <TextField label={t("certIssuerLabel")} value={item.issuer} onChange={(v) => update({ issuer: v })} placeholder={t("certIssuerPlaceholder")} />
              <TextField label={t("certYearLabel")} value={item.year || ""} onChange={(v) => update({ year: v })} placeholder={t("certYearPlaceholder")} />
            </div>
          )}
        />
      </div>
    </div>
  );
}
