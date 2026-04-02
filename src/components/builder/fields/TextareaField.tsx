"use client";

import { useState } from "react";

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
  const [showTips, setShowTips] = useState(false);
  const charCount = (value || "").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-3">
          {writingTips && (
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              {showTips ? "Hide tips" : "Writing tips"}
            </button>
          )}
          <span className="text-xs text-slate-600">{charCount}</span>
        </div>
      </div>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
      {showTips && writingTips && (
        <div className="mb-2 bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-xs text-amber-300/80 space-y-1">
          {writingTips.map((tip, i) => (
            <p key={i}>• {tip}</p>
          ))}
        </div>
      )}
      {templates && templates.length > 0 && !value && (
        <div className="mb-2">
          <p className="text-xs text-slate-500 mb-1.5">Quick start with a template:</p>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(t.text)}
                className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-400 hover:text-emerald-400 hover:border-emerald-600 transition-colors"
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
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors resize-none"
      />
    </div>
  );
}
