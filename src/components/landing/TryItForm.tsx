"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

export function TryItForm({ locale }: { locale: string }) {
  const isRTL = locale === "ar";
  const router = useRouter();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!name.trim() || !title.trim()) {
      setError(
        isRTL
          ? "الرجاء إدخال اسمك الكامل ومسماك الوظيفي."
          : "Please enter both your name and job title."
      );
      return;
    }
    setError("");
    localStorage.setItem(
      "portfolio-draft",
      JSON.stringify({ fullName: name.trim(), title: title.trim() })
    );
    router.push(`/${locale}/templates?prefill=1`);
  };

  return (
    <div className="mt-5 w-full max-w-md" dir={isRTL ? "rtl" : "ltr"}>
      <div className="rounded-xl border border-[var(--land-border)] bg-white px-4 py-4 shadow-sm">
        <p className="text-[11px] font-bold tracking-wider uppercase text-[var(--land-bright)] mb-2.5">
          {isRTL ? "جرّب الحين — مجانًا" : "TRY IT NOW — FREE"}
        </p>
        <div className="space-y-2.5">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
              aria-invalid={!!error && !name.trim()}
              placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
              className="w-full rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)] px-4 py-2.5 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none"
            />
            <p className="mt-0.5 text-[10px] text-[var(--land-muted)]">{isRTL ? "يظهر في سيرتك الذاتية" : "Goes on your CV"}</p>
          </div>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (error) setError(""); }}
              aria-invalid={!!error && !title.trim()}
              placeholder={isRTL ? "مثال: مهندس برمجيات، محلل مالي..." : "e.g. Software Engineer, Financial Analyst..."}
              className="w-full rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)] px-4 py-2.5 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none"
            />
          </div>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <button
            onClick={handleStart}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors active:scale-[0.98] shadow-sm shadow-emerald-600/20"
          >
            {isRTL ? "✨ ابنِ سيرتي بالذكاء الاصطناعي ←" : "✨ Build My CV with AI →"}
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--land-muted)] text-center">
          {isRTL ? "بدون بطاقة · ادفع 4.9 د.ك فقط لما ملف PDF جاهز" : "No card needed · Pay 4.9 KD only when your PDF is ready"}
        </p>
        <p className="mt-2 text-xs text-center">
          <Link href="/sign-in" className="text-[var(--land-body)] hover:text-[var(--land-accent)] transition-colors">
            {isRTL ? "عندك بورتفوليو؟ سجّل دخول ←" : "Already have a portfolio? Sign in →"}
          </Link>
        </p>
      </div>
    </div>
  );
}
