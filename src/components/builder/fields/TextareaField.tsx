"use client";

import { useState } from "react";

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
  aiEnhance?: boolean;
  aiContext?: string;
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
  aiEnhance,
  aiContext,
}: TextareaFieldProps) {
  const [enhancing, setEnhancing] = useState(false);

  const handleAIEnhance = async () => {
    if (!value.trim()) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, context: aiContext || label, field: "long" }),
      });
      const data = await res.json();
      if (data.enhanced) onChange(data.enhanced);
    } catch {}
    setEnhancing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        {aiEnhance && value && (
          <button
            type="button"
            onClick={handleAIEnhance}
            disabled={enhancing}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
          >
            {enhancing ? "Enhancing..." : "✦ AI Enhance"}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500 mb-1.5">{hint}</p>}
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
