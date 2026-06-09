"use client";

import { useTranslations } from "next-intl";
import { PhotoUpload } from "../fields/PhotoUpload";
import { COLOR_PRESETS, isPresetActive, type ColorPreset } from "@/lib/color-presets";
import { resolveTemplateId } from "@/lib/templates";

interface CustomizeStepProps {
  data: any;
  onChange: (updates: any) => void;
}

const HEADING_FONTS = [
  { value: "Inter", label: "Inter (Clean Modern)" },
  { value: "Playfair Display", label: "Playfair Display (Classic Serif)" },
  { value: "DM Sans", label: "DM Sans (Geometric Sans)" },
  { value: "Raleway", label: "Raleway (Elegant Sans)" },
  { value: "Merriweather", label: "Merriweather (Readable Serif)" },
  { value: "Lora", label: "Lora (Contemporary Serif)" },
  { value: "Source Sans 3", label: "Source Sans 3 (Professional)" },
  { value: "Space Grotesk", label: "Space Grotesk (Tech)" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond (Luxury)" },
];

const BODY_FONTS = [
  { value: "Inter", label: "Inter (Default)" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Source Sans 3", label: "Source Sans 3" },
  { value: "Raleway", label: "Raleway" },
  { value: "Lora", label: "Lora" },
];

const PRESETS = COLOR_PRESETS.general;
const DEFAULTS = { primary: "#0F172A", accent: "#A16207", bg: "#F8FAFC" };

// Ids must match the isHidden gates in the matching template.hbs.
const GENERAL_SECTIONS = [
  { id: "credentials", labelKey: "sectionCredentials" },
  { id: "value-proposition", labelKey: "sectionValueProposition" },
  { id: "career", labelKey: "sectionExperience" },
  { id: "impact", labelKey: "sectionImpactStories" },
  { id: "competencies", labelKey: "sectionCompetencies" },
  { id: "education", labelKey: "sectionEducation" },
  { id: "professional-profile", labelKey: "sectionProfessionalProfile" },
  { id: "endorsements", labelKey: "sectionEndorsements" },
];

// The creator template shares this step but gates its own section ids
// (see src/templates/creator/template.hbs).
const CREATOR_SECTIONS = [
  { id: "content-showcase", labelKey: "sectionContentShowcase" },
  { id: "social-stats", labelKey: "sectionSocialStats" },
  { id: "experience", labelKey: "sectionExperience" },
  { id: "skills", labelKey: "sectionSkills" },
  { id: "education", labelKey: "sectionEducation" },
  { id: "certifications", labelKey: "sectionCertifications" },
  { id: "endorsements", labelKey: "sectionEndorsements" },
  { id: "languages", labelKey: "sectionLanguages" },
];

export function CustomizeStep({ data, onChange }: CustomizeStepProps) {
  const t = useTranslations("builder.general");
  const customization = data.customization || {};
  const hiddenSections = customization.hiddenSections || [];
  const SECTIONS = resolveTemplateId(data.templateId || "general") === "creator" ? CREATOR_SECTIONS : GENERAL_SECTIONS;

  const updateCustomization = (field: string, value: any) => {
    onChange({ customization: { ...customization, [field]: value } });
  };

  const applyPreset = (preset: ColorPreset) => {
    onChange({
      customization: {
        ...customization,
        primaryColor: preset.primary,
        accentColor: preset.accent,
        bgColor: preset.bg,
      },
    });
  };

  const toggleSection = (sectionId: string) => {
    const hidden = hiddenSections.includes(sectionId)
      ? hiddenSections.filter((s: string) => s !== sectionId)
      : [...hiddenSections, sectionId];
    updateCustomization("hiddenSections", hidden);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("custHeading")}</h2>

      <PhotoUpload
        value={data.basics?.photoUrl || ""}
        onChange={(url) => onChange({ basics: { ...data.basics, photoUrl: url } })}
        name={data.basics?.fullName}
        accentColor={data.customization?.accentColor}
      />

      {/* Colors */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-3">{t("colorSchemeHeading")}</h3>
        <p className="text-sm text-[var(--land-body)] mb-4">{t("colorSchemeIntro")}</p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {PRESETS.map((preset) => {
            const active = isPresetActive(preset, customization, DEFAULTS);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                aria-pressed={active}
                className={`group rounded-lg border p-2 transition-colors text-center ${
                  active
                    ? "border-[var(--land-accent)] ring-1 ring-[var(--land-accent)] bg-[var(--land-surface-raised)]/50"
                    : "border-[var(--land-border)] hover:border-[var(--land-accent-hover)]"
                }`}
              >
                <div className="flex gap-1 justify-center mb-1.5">
                  <div className="w-4 h-4 rounded-full border border-[var(--land-border)]" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full border border-[var(--land-border)]" style={{ backgroundColor: preset.accent }} />
                  <div className="w-4 h-4 rounded-full border border-[var(--land-border)]" style={{ backgroundColor: preset.bg }} />
                </div>
                <span className={`text-[10px] ${active ? "text-[var(--land-accent)] font-medium" : "text-[var(--land-muted)] group-hover:text-[var(--land-bright)]"}`}>{preset.name}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("primaryLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.primaryColor || "#0F172A"} onChange={(e) => updateCustomization("primaryColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.primaryColor || "#0F172A"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("primaryHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("accentLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.accentColor || "#A16207"} onChange={(e) => updateCustomization("accentColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.accentColor || "#A16207"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("accentHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("backgroundLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.bgColor || "#F8FAFC"} onChange={(e) => updateCustomization("bgColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.bgColor || "#F8FAFC"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("backgroundHint")}</p>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-3">{t("typographyHeading")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("headingFontLabel")}</label>
            <select
              value={customization.fontFamily || "Inter"}
              onChange={(e) => updateCustomization("fontFamily", e.target.value)}
              className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
            >
              {HEADING_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("headingFontHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("bodyFontLabel")}</label>
            <select
              value={customization.bodyFont || "Inter"}
              onChange={(e) => updateCustomization("bodyFont", e.target.value)}
              className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
            >
              {BODY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("bodyFontHint")}</p>
          </div>
        </div>
        {/* Live preview: fonts + chosen colors together */}
        <div
          className="mt-4 border border-[var(--land-border)] rounded-lg p-4 transition-colors"
          style={{ backgroundColor: customization.bgColor || DEFAULTS.bg }}
        >
          <p className="text-xs text-[var(--land-muted)] mb-2">{t("previewLabel")}</p>
          <p
            style={{
              fontFamily: `'${customization.fontFamily || "Inter"}', sans-serif`,
              color: customization.primaryColor || DEFAULTS.primary,
            }}
            className="text-lg font-semibold"
          >
            {data.basics?.fullName || t("previewName")}
          </p>
          <p
            style={{
              fontFamily: `'${customization.bodyFont || "Inter"}', sans-serif`,
              color: customization.accentColor || DEFAULTS.accent,
            }}
            className="text-sm mt-1"
          >
            {data.basics?.title || t("previewTitle")}
          </p>
        </div>
      </div>

      {/* Section Visibility */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-3">{t("sectionVisibilityHeading")}</h3>
        <p className="text-sm text-[var(--land-body)] mb-4">{t("sectionVisibilityHint")}</p>
        <div className="grid grid-cols-2 gap-1">
          {SECTIONS.map((section) => (
            <label key={section.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--land-surface-raised)]/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={!hiddenSections.includes(section.id)}
                onChange={() => toggleSection(section.id)}
                className="w-4 h-4 rounded border-[var(--land-border)] text-[var(--land-accent)] focus:ring-[var(--land-accent)] bg-[var(--land-surface-raised)]"
              />
              <span className="text-sm text-[var(--land-bright)]">{t(section.labelKey)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
