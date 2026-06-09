"use client";

import { useTranslations } from "next-intl";
import { PhotoUpload } from "../fields/PhotoUpload";
import { COLOR_PRESETS, isPresetActive, type ColorPreset } from "@/lib/color-presets";

interface EngineerCustomizeStepProps {
  data: any;
  onChange: (updates: any) => void;
}

const HEADING_FONTS = [
  { value: "Space Grotesk", label: "Space Grotesk (Technical)" },
  { value: "Inter", label: "Inter (Clean Modern)" },
  { value: "DM Sans", label: "DM Sans (Geometric)" },
  { value: "Raleway", label: "Raleway (Elegant)" },
  { value: "Source Sans 3", label: "Source Sans 3 (Professional)" },
  { value: "IBM Plex Sans", label: "IBM Plex Sans (Engineering)" },
];

const BODY_FONTS = [
  { value: "Inter", label: "Inter (Default)" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Source Sans 3", label: "Source Sans 3" },
  { value: "IBM Plex Sans", label: "IBM Plex Sans" },
];

const PRESETS = COLOR_PRESETS.engineer;
const DEFAULTS = { primary: "#18181b", accent: "#1e3a5f", bg: "#ffffff" };

export function EngineerCustomizeStep({ data, onChange }: EngineerCustomizeStepProps) {
  const t = useTranslations("builder.engineer");
  const customization = data.customization || {};
  const hiddenSections = customization.hiddenSections || [];

  // Ids must match the isHidden gates in src/templates/engineer/template.hbs.
  // (The hero/about section always shows, so it has no toggle.)
  const SECTIONS = [
    { id: "projects", label: t("custSectionProjects") },
    { id: "experience", label: t("custSectionExperience") },
    { id: "skills", label: t("custSectionSkills") },
    { id: "education", label: t("custSectionEducation") },
    { id: "certifications", label: t("custSectionCertifications") },
    { id: "languages", label: t("custSectionLanguages") },
    { id: "endorsements", label: t("custSectionEndorsements") },
  ];

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
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-3">{t("custColorsHeading")}</h3>
        <p className="text-sm text-[var(--land-body)] mb-4">{t("custColorsIntro")}</p>

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
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("custPrimaryLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.primaryColor || "#18181b"} onChange={(e) => updateCustomization("primaryColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.primaryColor || "#18181b"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("custPrimaryHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("custAccentLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.accentColor || "#1e3a5f"} onChange={(e) => updateCustomization("accentColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.accentColor || "#1e3a5f"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("custAccentHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("custBackgroundLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.bgColor || "#ffffff"} onChange={(e) => updateCustomization("bgColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.bgColor || "#ffffff"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("custBackgroundHint")}</p>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-3">{t("custTypographyHeading")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("custHeadingFontLabel")}</label>
            <select
              value={customization.fontFamily || "Space Grotesk"}
              onChange={(e) => updateCustomization("fontFamily", e.target.value)}
              className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
            >
              {HEADING_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("custHeadingFontHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("custBodyFontLabel")}</label>
            <select
              value={customization.bodyFont || "Inter"}
              onChange={(e) => updateCustomization("bodyFont", e.target.value)}
              className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
            >
              {BODY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("custBodyFontHint")}</p>
          </div>
        </div>
        {/* Font preview */}
        <div className="mt-4 bg-[var(--land-surface-raised)]/50 border border-[var(--land-border)] rounded-lg p-4">
          <p className="text-xs text-[var(--land-muted)] mb-2">{t("custPreviewLabel")}</p>
          <p style={{ fontFamily: `'${customization.fontFamily || "Space Grotesk"}', sans-serif` }} className="text-lg text-[var(--land-bright)] font-semibold">
            {data.basics?.fullName || t("custPreviewName")}
          </p>
          <p style={{ fontFamily: `'${customization.bodyFont || "Inter"}', sans-serif` }} className="text-sm text-[var(--land-body)] mt-1">
            {data.basics?.title || t("custPreviewTitle")}
          </p>
        </div>
      </div>

      {/* Section Visibility */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-3">{t("custSectionsHeading")}</h3>
        <p className="text-sm text-[var(--land-body)] mb-4">{t("custSectionsIntro")}</p>
        <div className="grid grid-cols-2 gap-1">
          {SECTIONS.map((section) => (
            <label key={section.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--land-surface-raised)]/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={!hiddenSections.includes(section.id)}
                onChange={() => toggleSection(section.id)}
                className="w-4 h-4 rounded border-[var(--land-border)] text-[var(--land-accent)] focus:ring-[var(--land-accent)] bg-[var(--land-surface-raised)]"
              />
              <span className="text-sm text-[var(--land-bright)]">{section.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
