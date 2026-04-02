"use client";

import { PhotoUpload } from "../fields/PhotoUpload";

interface CustomizeStepProps {
  data: any;
  onChange: (updates: any) => void;
}

const FONT_OPTIONS = [
  { value: "Playfair Display", label: "Playfair Display (Classic Serif)" },
  { value: "DM Sans", label: "DM Sans (Modern Sans)" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond (Elegant)" },
  { value: "Space Grotesk", label: "Space Grotesk (Geometric)" },
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

  const toggleSection = (sectionId: string) => {
    const hidden = hiddenSections.includes(sectionId)
      ? hiddenSections.filter((s: string) => s !== sectionId)
      : [...hiddenSections, sectionId];
    updateCustomization("hiddenSections", hidden);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-white">Customize</h2>

      <PhotoUpload
        value={data.basics?.photoUrl || ""}
        onChange={(url) =>
          onChange({ basics: { ...data.basics, photoUrl: url } })
        }
      />

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Colors</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.primaryColor || "#0F172A"}
                onChange={(e) =>
                  updateCustomization("primaryColor", e.target.value)
                }
                className="w-12 h-12 rounded-lg border border-slate-700 cursor-pointer"
              />
              <span className="text-sm text-slate-400">
                {customization.primaryColor || "#0F172A"}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.accentColor || "#A16207"}
                onChange={(e) =>
                  updateCustomization("accentColor", e.target.value)
                }
                className="w-12 h-12 rounded-lg border border-slate-700 cursor-pointer"
              />
              <span className="text-sm text-slate-400">
                {customization.accentColor || "#A16207"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">Font Family</h3>
        <select
          value={customization.fontFamily || "Playfair Display"}
          onChange={(e) => updateCustomization("fontFamily", e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">
          Section Visibility
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Uncheck sections you want to hide.
        </p>
        <div className="space-y-2">
          {SECTIONS.map((section) => (
            <label
              key={section.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
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
