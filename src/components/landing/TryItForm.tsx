"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TryItForm({ locale }: { locale: string }) {
  const isRTL = locale === "ar";
  const router = useRouter();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");

  const handleStart = () => {
    if (name.trim() || title.trim()) {
      localStorage.setItem("portfolio-draft", JSON.stringify({ fullName: name.trim(), title: title.trim() }));
    }
    router.push(`/${locale}/dashboard/new?template=corporate`);
  };

  return (
    <div className="mt-10 w-full max-w-md" dir={isRTL ? "rtl" : "ltr"}>
      <div className="rounded-xl border border-[var(--land-border)] bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-[var(--land-bright)] mb-3">
          {isRTL ? "جرّب الحين — مجانًا" : "Try it now — free"}
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
            className="w-full rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)] px-4 py-2.5 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isRTL ? "مسماك الوظيفي" : "Your job title"}
            className="w-full rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)] px-4 py-2.5 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none"
          />
          <button
            onClick={handleStart}
            className="w-full rounded-lg bg-[var(--land-accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors active:scale-[0.98]"
          >
            {isRTL ? "ابدأ البناء →" : "Start Building →"}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--land-muted)] text-center">
          {isRTL ? "بدون بطاقة. ادفع فقط لما تكون جاهز." : "No card needed. Pay only when ready."}
        </p>
      </div>
    </div>
  );
}
