"use client";

import { useTranslations } from "next-intl";
import { COLOR_PRESETS, isPresetActive, type ColorPreset } from "@/lib/color-presets";

interface DeveloperCustomizeStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

const PRESETS = COLOR_PRESETS.developer;
const DEFAULTS = { primary: "#7c5cff", accent: "#38bdf8", bg: "#020617" };


export function DeveloperCustomizeStep({ data, onChange }: DeveloperCustomizeStepProps) {
  const t = useTranslations("builder.developer");
  const customization = data.customization || {};

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

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("customizeHeading")}</h2>

      {/* Colors */}
      <div>
        <h3 className="text-lg font-medium text-[var(--land-bright)] mb-2">{t("colorsHeading")}</h3>
        <p className="text-sm text-[var(--land-body)] mb-4">{t("colorsHint")}</p>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {PRESETS.map((preset) => {
            const active = isPresetActive(preset, customization, DEFAULTS);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                aria-pressed={active}
                className={`group rounded-lg border p-2 transition-colors text-center min-h-[44px] ${
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("primaryLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.primaryColor || "#7c5cff"} onChange={(e) => onChange({ customization: { ...customization, primaryColor: e.target.value } })} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.primaryColor || "#7c5cff"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("primaryHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("accentLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.accentColor || "#38bdf8"} onChange={(e) => onChange({ customization: { ...customization, accentColor: e.target.value } })} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.accentColor || "#38bdf8"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("accentHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("bgLabel")}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.bgColor || "#020617"} onChange={(e) => onChange({ customization: { ...customization, bgColor: e.target.value } })} className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent" />
              <span className="text-xs text-[var(--land-muted)] font-mono">{customization.bgColor || "#020617"}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">{t("bgHint")}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
