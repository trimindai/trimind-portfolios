"use client";

import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface AchievementsStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

export function AchievementsStep({ data, onChange }: AchievementsStepProps) {
  const t = useTranslations("builder.general");
  const projects = data.projects || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("achHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          {t("achIntro")}
        </p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-amber-900/30 rounded-lg p-4 text-sm text-amber-300/80">
        <strong>{t("achStarLabel")}</strong> {t("achStarText")}
      </div>

      <DynamicList
        items={projects}
        onChange={(items) => onChange({ projects: items })}
        createEmpty={() => ({
          title: "",
          description: "",
          technologies: [] as string[],
          metrics: [] as Array<{ value: string; label: string }>,
          isFeatured: false,
        })}
        maxItems={5}
        addLabel={t("addAchievement")}
        renderItem={(item, index, update) => (
          <div className="space-y-3 pr-16">
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isFeatured || false}
                  onChange={(e) => update({ isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--land-border)] text-[var(--land-accent)] focus:ring-[var(--land-accent)] bg-[var(--land-surface-raised)]"
                />
                <span className="text-sm text-amber-400 font-medium">{t("achFeaturedLabel")}</span>
              </label>
            </div>

            <TextField
              label={t("achTitleLabel")}
              value={item.title}
              onChange={(v) => update({ title: v })}
              placeholder={t("achTitlePlaceholder")}
              hint={t("achTitleHint")}
            />

            <TextareaField
              label={t("achSituationLabel")}
              value={item.description}
              onChange={(v) => update({ description: v })}
              placeholder={t("achSituationPlaceholder")}
              rows={3}
              hint={t("achSituationHint")}
              writingTips={t.raw("achSituationTips") as string[]}
            />

            <div>
              <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                {t("achKpisLabel")}
              </label>
              <p className="text-xs text-[var(--land-muted)] mb-2">{t("achKpisHint")}</p>
              <DynamicList
                items={item.metrics || []}
                onChange={(m) => update({ metrics: m })}
                createEmpty={() => ({ value: "", label: "" })}
                maxItems={4}
                addLabel={t("addKpi")}
                renderItem={(kpi, _, updateKpi) => (
                  <div className="grid grid-cols-2 gap-3">
                    <TextField label={t("kpiValueLabel")} value={kpi.value} onChange={(v) => updateKpi({ value: v })} placeholder={t("kpiValuePlaceholder")} examples={t.raw("kpiValueExamples") as string[]} />
                    <TextField label={t("kpiLabelLabel")} value={kpi.label} onChange={(v) => updateKpi({ label: v })} placeholder={t("kpiLabelPlaceholder")} examples={t.raw("kpiLabelExamples") as string[]} />
                  </div>
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                {t("achToolsLabel")}
              </label>
              <input
                value={(item.technologies || []).join(", ")}
                onChange={(e) => update({ technologies: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                placeholder={t("achToolsPlaceholder")}
                className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
              />
              <p className="text-xs text-[var(--land-muted)] mt-1">{t("commaSeparated")}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
