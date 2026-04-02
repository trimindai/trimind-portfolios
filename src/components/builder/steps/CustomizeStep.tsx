"use client";

import { PhotoUpload } from "../fields/PhotoUpload";

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

const COLOR_PRESETS = [
  { name: "Corporate Navy", primary: "#0F172A", accent: "#A16207", bg: "#F8FAFC" },
  { name: "Ocean Blue", primary: "#1E3A5F", accent: "#0891B2", bg: "#F0F9FF" },
  { name: "Forest Green", primary: "#14532D", accent: "#CA8A04", bg: "#F0FDF4" },
  { name: "Royal Purple", primary: "#3B0764", accent: "#A855F7", bg: "#FAF5FF" },
  { name: "Warm Charcoal", primary: "#292524", accent: "#DC2626", bg: "#FAFAF9" },
  { name: "Midnight", primary: "#0C0A09", accent: "#F59E0B", bg: "#FFFFFF" },
];

const SECTIONS = [
  { id: "credentials", label: "Credentials Bar" },
  { id: "value-proposition", label: "Value Proposition" },
  { id: "experience", label: "Career Trajectory" },
  { id: "impact-stories", label: "Impact Stories" },
  { id: "competencies", label: "Competencies" },
  { id: "education", label: "Education" },
  { id: "professional-profile", label: "Professional Profile" },
  { id: "endorsements", label: "Endorsements" },
];

export function CustomizeStep({ data, onChange }: CustomizeStepProps) {
  const customization = data.customization || {};
  const hiddenSections = customization.hiddenSections || [];

  const updateCustomization = (field: string, value: any) => {
    onChange({ customization: { ...customization, [field]: value } });
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
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
      <h2 className="text-xl font-semibold text-white">Customize Your Portfolio</h2>

      <PhotoUpload
        value={data.basics?.photoUrl || ""}
        onChange={(url) => onChange({ basics: { ...data.basics, photoUrl: url } })}
      />

      {/* Colors */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Color Scheme</h3>
        <p className="text-sm text-slate-400 mb-4">Pick a preset or customize individual colors.</p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="group rounded-lg border border-slate-700 hover:border-emerald-500 p-2 transition-colors text-center"
            >
              <div className="flex gap-1 justify-center mb-1.5">
                <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: preset.accent }} />
                <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: preset.bg }} />
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Primary</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.primaryColor || "#0F172A"} onChange={(e) => updateCustomization("primaryColor", e.target.value)} className="w-12 h-12 rounded-lg border border-slate-700 cursor-pointer bg-transparent" />
              <span className="text-xs text-slate-500 font-mono">{customization.primaryColor || "#0F172A"}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Headlines, nav</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Accent</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.accentColor || "#A16207"} onChange={(e) => updateCustomization("accentColor", e.target.value)} className="w-12 h-12 rounded-lg border border-slate-700 cursor-pointer bg-transparent" />
              <span className="text-xs text-slate-500 font-mono">{customization.accentColor || "#A16207"}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Links, badges</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Background</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.bgColor || "#F8FAFC"} onChange={(e) => updateCustomization("bgColor", e.target.value)} className="w-12 h-12 rounded-lg border border-slate-700 cursor-pointer bg-transparent" />
              <span className="text-xs text-slate-500 font-mono">{customization.bgColor || "#F8FAFC"}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Page background</p>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Typography</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Heading Font</label>
            <select
              value={customization.fontFamily || "Inter"}
              onChange={(e) => updateCustomization("fontFamily", e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
            >
              {HEADING_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-600 mt-1">Name, section titles</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">Body Font</label>
            <select
              value={customization.bodyFont || "Inter"}
              onChange={(e) => updateCustomization("bodyFont", e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
            >
              {BODY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-600 mt-1">Paragraphs, descriptions</p>
          </div>
        </div>
        {/* Font preview */}
        <div className="mt-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-2">Preview</p>
          <p style={{ fontFamily: `'${customization.fontFamily || "Inter"}', sans-serif` }} className="text-lg text-white font-semibold">
            {data.basics?.fullName || "Your Name Here"}
          </p>
          <p style={{ fontFamily: `'${customization.bodyFont || "Inter"}', sans-serif` }} className="text-sm text-slate-400 mt-1">
            {data.basics?.title || "Your Professional Title"}
          </p>
        </div>
      </div>

      {/* Section Visibility */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Section Visibility</h3>
        <p className="text-sm text-slate-400 mb-4">Uncheck sections you want to hide.</p>
        <div className="grid grid-cols-2 gap-1">
          {SECTIONS.map((section) => (
            <label key={section.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={!hiddenSections.includes(section.id)}
                onChange={() => toggleSection(section.id)}
                className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
              />
              <span className="text-sm text-slate-300">{section.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
