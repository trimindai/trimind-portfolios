"use client";

interface LanguageToggleProps {
  lang: "en" | "ar";
  onChange: (lang: "en" | "ar") => void;
}

export function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 mb-4">
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          lang === "en"
            ? "bg-emerald-600 text-white"
            : "text-slate-400 hover:text-white"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onChange("ar")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          lang === "ar"
            ? "bg-emerald-600 text-white"
            : "text-slate-400 hover:text-white"
        }`}
        dir="rtl"
      >
        عربي
      </button>
    </div>
  );
}
