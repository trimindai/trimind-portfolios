"use client";

import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface DeveloperStackStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

type SkillGroup = { category: string; items: string[] };

const SEED_GROUPS: SkillGroup[] = [
  { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind"] },
  { category: "Backend", items: ["Node.js", "Python", "PostgreSQL"] },
  { category: "Cloud / Ops", items: ["AWS", "Docker", "Kubernetes"] },
  { category: "Tools", items: ["Git", "Figma"] },
];

export function DeveloperStackStep({ data, onChange }: DeveloperStackStepProps) {
  const t = useTranslations("builder.developer");

  // Seed the four software categories the first time this step is opened with no skills.
  const skills: SkillGroup[] =
    data.skills && data.skills.length > 0 ? data.skills : SEED_GROUPS;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("stackHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">{t("stackIntro")}</p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-accent)]/30 rounded-lg p-4 text-sm text-[var(--land-body)]">
        {t("stackKeyboardHint")}
      </div>

      <DynamicList
        items={skills}
        onChange={(items) => onChange({ skills: items })}
        createEmpty={() => ({ category: "", items: [] as string[] })}
        maxItems={6}
        addLabel={t("addCategory")}
        renderItem={(item, _, update) => (
          <div className="space-y-3 pr-16">
            <TextField
              label={t("stackCategory")}
              value={item.category}
              onChange={(v) => update({ category: v })}
              placeholder={t("stackCategoryPlaceholder")}
              examples={["Frontend", "Backend", "Cloud / Ops", "Tools", "Mobile", "Data / ML"]}
            />
            <div>
              <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                {t("stackItems")}
              </label>
              <p className="text-xs text-[var(--land-muted)] mb-1.5">{t("stackItemsHint")}</p>
              <input
                value={(item.items || []).join(", ")}
                onChange={(e) =>
                  update({
                    items: e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={t("stackItemsPlaceholder")}
                className="w-full min-h-[44px] bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}
