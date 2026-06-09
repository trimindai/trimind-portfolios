"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface EducationStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function EducationStep({ data, onChange }: EducationStepProps) {
  const t = useTranslations("builder.general");
  const education = data.education || [];
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current && education.length === 0) {
      seeded.current = true;
      onChange({ education: [{ degree: "", institution: "", year: "", description: "" }] });
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-2">{t("eduHeading")}</h2>
        <DynamicList
          items={education}
          onChange={(items) => onChange({ education: items })}
          createEmpty={() => ({ degree: "", institution: "", year: "", description: "" })}
          maxItems={5}
          addLabel={t("addEducation")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <div className="grid grid-cols-2 gap-3">
                <TextField label={t("degreeLabel")} value={item.degree} onChange={(v) => update({ degree: v })} placeholder={t("degreePlaceholder")} />
                <TextField label={t("institutionLabel")} value={item.institution} onChange={(v) => update({ institution: v })} placeholder={t("institutionPlaceholder")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label={t("eduYearLabel")} value={item.year} onChange={(v) => update({ year: v })} placeholder={t("eduYearPlaceholder")} />
                <TextField label={t("eduDescLabel")} value={item.description || ""} onChange={(v) => update({ description: v })} placeholder={t("eduDescPlaceholder")} />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
