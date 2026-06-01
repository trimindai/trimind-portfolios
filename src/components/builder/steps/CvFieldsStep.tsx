"use client";

import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface CvFieldsStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

const LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"] as const;
const LEVEL_KEYS: Record<string, string> = {
  Native: "levelNative",
  Fluent: "levelFluent",
  Advanced: "levelAdvanced",
  Intermediate: "levelIntermediate",
  Basic: "levelBasic",
};

export function CvFieldsStep({ data, onChange }: CvFieldsStepProps) {
  const t = useTranslations("builder.cvFields");
  const basics = data.basics || {};

  // GCC defaults: pre-fill Arabic + English the first time this step is opened
  // and no languages exist yet. Stored on the top-level `languages` field — the
  // single source of truth read by BOTH the CV (cv.hbs) and the web templates
  // (corporate/engineer). This is the ONLY place languages are collected.
  const languages: Array<{ name: string; level?: string }> =
    data.languages && data.languages.length > 0
      ? data.languages
      : [
          { name: "Arabic", level: "Native" },
          { name: "English", level: "Fluent" },
        ];

  const references: Array<{ name: string; title?: string; contact?: string }> =
    data.references || [];

  const updateBasics = (field: string, value: any) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">{t("heading")}</h2>
        <p className="text-sm text-[var(--land-body)]">{t("intro")}</p>
      </div>

      {/* Professional Summary */}
      <TextareaField
        label={t("summaryLabel")}
        value={basics.summary || ""}
        onChange={(v) => updateBasics("summary", v)}
        placeholder={t("summaryPlaceholder")}
        hint={t("summaryHint")}
        rows={4}
      />

      {/* Languages */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-1">{t("languagesHeading")}</h3>
        <p className="text-xs text-[var(--land-muted)] mb-3">{t("languagesHint")}</p>
        <DynamicList
          items={languages}
          onChange={(items) => onChange({ languages: items })}
          createEmpty={() => ({ name: "", level: "Fluent" })}
          maxItems={6}
          addLabel={t("addLanguage")}
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-16">
              <TextField
                label={t("languageName")}
                value={item.name}
                onChange={(v) => update({ name: v })}
                placeholder={t("languageNamePlaceholder")}
              />
              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                  {t("languageLevel")}
                </label>
                <select
                  value={item.level || "Fluent"}
                  onChange={(e) => update({ level: e.target.value })}
                  className="w-full min-h-[44px] bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {t(LEVEL_KEYS[lvl])}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        />
      </div>

      {/* Nationality (optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label={t("nationalityLabel")}
          value={basics.nationality || ""}
          onChange={(v) => updateBasics("nationality", v)}
          placeholder={t("nationalityPlaceholder")}
          hint={t("nationalityHint")}
        />
      </div>

      {/* References (or "available on request") */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-1">{t("referencesHeading")}</h3>
        <p className="text-xs text-[var(--land-muted)] mb-3">{t("referencesHint")}</p>
        {references.length === 0 && (
          <p className="mb-3 rounded-lg border border-dashed border-[var(--land-border)] bg-[var(--land-surface-raised)]/40 px-4 py-3 text-xs text-[var(--land-muted)]">
            {t("referencesEmptyNote")}
          </p>
        )}
        <DynamicList
          items={references}
          onChange={(items) => onChange({ references: items })}
          createEmpty={() => ({ name: "", title: "", contact: "" })}
          maxItems={4}
          addLabel={t("addReference")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label={t("referenceName")}
                  value={item.name}
                  onChange={(v) => update({ name: v })}
                  placeholder={t("referenceNamePlaceholder")}
                />
                <TextField
                  label={t("referenceTitle")}
                  value={item.title || ""}
                  onChange={(v) => update({ title: v })}
                  placeholder={t("referenceTitlePlaceholder")}
                />
              </div>
              <TextField
                label={t("referenceContact")}
                value={item.contact || ""}
                onChange={(v) => update({ contact: v })}
                placeholder={t("referenceContactPlaceholder")}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
