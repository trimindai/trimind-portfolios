"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
  writingTips?: string[];
  templates?: Array<{ label: string; text: string }>;
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
  writingTips,
  templates,
}: TextareaFieldProps) {
  const t = useTranslations("builder.fields");
  const [showTips, setShowTips] = useState(false);
  const charCount = (value || "").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-[var(--land-bright)]">{label}</label>
        <div className="flex items-center gap-3">
          {writingTips && (
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              // Mobile: 44px tappable chip. Desktop (md+): original underline link.
              className="inline-flex items-center min-h-[44px] px-3 rounded-lg bg-amber-50 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors md:min-h-0 md:px-0 md:rounded-none md:bg-transparent md:underline md:underline-offset-2 md:decoration-amber-300"
            >
              {showTips ? t("hideTips") : t("writingTips")}
            </button>
          )}
          <span className="text-xs text-[var(--land-muted)]">{charCount}</span>
        </div>
      </div>
      {hint && <p className="text-xs text-[var(--land-muted)] mb-1.5">{hint}</p>}
      {showTips && writingTips && (
        <div className="mb-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
          {writingTips.map((tip, i) => (
            <p key={i}>• {tip}</p>
          ))}
        </div>
      )}
      {templates && templates.length > 0 && !value && (
        <div className="mb-2">
          <p className="text-xs text-[var(--land-muted)] mb-1.5">{t("quickStart")}</p>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(t.text)}
                className="text-xs bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded px-2 py-1 text-[var(--land-body)] hover:text-[var(--land-accent-hover)] hover:border-[var(--land-accent)] transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        spellCheck={true}
        className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors resize-none shadow-sm"
      />
    </div>
  );
}
