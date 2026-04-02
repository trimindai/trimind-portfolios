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
        <label className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {examples && examples.length > 0 && (
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {showExamples ? "Hide examples" : "See examples"}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
      {showExamples && examples && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onChange(ex); setShowExamples(false); }}
              className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-400 hover:text-emerald-400 hover:border-emerald-600 transition-colors"
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
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
      />
    </div>
  );
}
