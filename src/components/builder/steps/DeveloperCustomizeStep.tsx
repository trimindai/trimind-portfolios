"use client";

import { useTranslations } from "next-intl";

interface DeveloperCustomizeStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

const COLOR_PRESETS = [
  { name: "Spacebar", primary: "#7c5cff", accent: "#38bdf8", bg: "#020617" },
  { name: "Aurora", primary: "#34d399", accent: "#22d3ee", bg: "#04140f" },
  { name: "Magma", primary: "#fb7185", accent: "#fbbf24", bg: "#0a0608" },
  { name: "Cobalt", primary: "#3b82f6", accent: "#06b6d4", bg: "#020817" },
  { name: "Violet Night", primary: "#a78bfa", accent: "#f472b6", bg: "#0b0614" },
  { name: "Mono", primary: "#e2e8f0", accent: "#94a3b8", bg: "#0a0a0a" },
];

// Chassis colour of the 3D skills keyboard (maps to customization.keyboardBody)
const KBD_BODIES = [
  { value: "black", label: "kbdBodyBlack", swatch: "linear-gradient(180deg,#202a45,#0a1120)" },
  { value: "white", label: "kbdBodyWhite", swatch: "linear-gradient(180deg,#f2f4f8,#c5cbd8)" },
  { value: "gray", label: "kbdBodyGray", swatch: "linear-gradient(180deg,#3b4150,#1e222b)" },
];

export function DeveloperCustomizeStep({ data, onChange }: DeveloperCustomizeStepProps) {
  const t = useTranslations("builder.developer");
  const customization = data.customization || {};

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

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("customizeHeading")}</h2>

      {/* Colors */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-2">{t("colorsHeading")}</h3>
        <p className="text-sm text-[var(--land-body)] mb-4">{t("colorsHint")}</p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="group rounded-lg border border-[var(--land-border)] hover:border-[var(--land-accent-hover)] p-2 transition-colors text-center min-h-[44px]"
            >
              <div className="flex gap-1 justify-center mb-1.5">
                <div className="w-4 h-4 rounded-full border border-[var(--land-border)]" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full border border-[var(--land-border)]" style={{ backgroundColor: preset.accent }} />
                <div className="w-4 h-4 rounded-full border border-[var(--land-border)]" style={{ backgroundColor: preset.bg }} />
              </div>
              <span className="text-[10px] text-[var(--land-muted)] group-hover:text-[var(--land-bright)]">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("primaryLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.primaryColor || "#7c5cff"} onChange={(e) => updateCustomization("primaryColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.primaryColor || "#7c5cff"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("primaryHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("accentLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.accentColor || "#38bdf8"} onChange={(e) => updateCustomization("accentColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.accentColor || "#38bdf8"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("accentHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("bgLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.bgColor || "#020617"} onChange={(e) => updateCustomization("bgColor", e.target.value)} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.bgColor || "#020617"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("bgHint")}</p>
          </div>
        </div>
      </div>

      {/* Keyboard body colour */}
      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-border)] rounded-lg p-4">
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-2">{t("kbdBodyHeading")}</h3>
        <p className="text-sm text-[var(--land-body)] mb-4">{t("kbdBodyHint")}</p>
        <div className="flex flex-wrap gap-2">
          {KBD_BODIES.map((body) => {
            const active = (customization.keyboardBody || "black") === body.value;
            return (
              <button
                key={body.value}
                type="button"
                onClick={() => updateCustomization("keyboardBody", body.value)}
                aria-pressed={active}
                className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 min-h-[44px] transition-colors ${
                  active
                    ? "border-[var(--land-accent-hover)] bg-[var(--land-surface-raised)]/60"
                    : "border-[var(--land-border)] hover:border-[var(--land-accent-hover)]"
                }`}
              >
                <span className="w-5 h-5 rounded-md border border-[var(--land-border)]" style={{ background: body.swatch }} />
                <span className="text-sm text-[var(--land-bright)]">{t(body.label)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
