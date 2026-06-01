"use client";

import { useState } from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
  examples?: string[];
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  hint,
  examples,
}: TextFieldProps) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-[var(--land-bright)]">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {examples && examples.length > 0 && (
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-[var(--land-accent-hover)] hover:text-[var(--land-accent-hover)] transition-colors"
          >
            {showExamples ? "Hide examples" : "See examples"}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-[var(--land-muted)] mb-1.5">{hint}</p>}
      {showExamples && examples && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onChange(ex); setShowExamples(false); }}
              className="text-xs bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded px-2 py-1 text-[var(--land-body)] hover:text-[var(--land-accent-hover)] hover:border-[var(--land-accent)] transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={true}
        autoComplete="off"
        className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors shadow-sm"
      />
    </div>
  );
}
