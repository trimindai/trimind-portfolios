"use client";

interface LanguageToggleProps {
  lang: "en" | "ar";
  onChange: (lang: "en" | "ar") => void;
}

export function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-[var(--land-surface-raised)] rounded-lg p-1 mb-4">
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          lang === "en"
            ? "bg-[var(--land-accent)] text-white"
            : "text-[var(--land-body)] hover:text-white"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onChange("ar")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          lang === "ar"
            ? "bg-[var(--land-accent)] text-white"
            : "text-[var(--land-body)] hover:text-white"
        }`}
        dir="rtl"
      >
        عربي
      </button>
    </div>
  );
}
