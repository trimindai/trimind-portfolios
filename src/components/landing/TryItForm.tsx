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
      <div className="relative bg-white rounded-3xl border border-ink-10 shadow-xl overflow-hidden">
        {/* Green gradient accent rail along the top edge */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l from-green-bright to-green" />
        <div className="p-6 pt-8">
          {/* Label row */}
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-ink">
              {isRTL ? "جرّب الحين" : "Try it now"}
            </p>
            <span className="text-[10px] font-bold text-green-mid bg-green-glow border border-green-mid/20 px-2 py-0.5 rounded-full">
              {isRTL ? "مجاناً" : "Free"}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-30">
            {isRTL
              ? "أدخل اسمك ومسماك — الذكاء الاصطناعي يكمل الباقي"
              : "Enter your name & title — AI does the rest"}
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
                aria-invalid={!!error && !name.trim()}
                placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
                className="w-full px-4 py-3.5 border-[1.5px] border-ink-10 rounded-xl text-sm font-medium text-ink bg-paper placeholder:text-ink-30 placeholder:text-xs focus:outline-none focus:border-green-mid focus:bg-white focus:ring-4 focus:ring-green-glow transition-all"
              />
              <p className="text-[11px] text-ink-30 mt-1">
                {isRTL ? "يظهر هكذا في سيرتك الذاتية" : "This is how it appears on your CV"}
              </p>
            </div>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (error) setError(""); }}
                aria-invalid={!!error && !title.trim()}
                placeholder={
                  isRTL
                    ? "مسماك الوظيفي — مثال: مهندس برمجيات، محلل مالي..."
                    : "Your job title — e.g. Software Engineer, Financial Analyst..."
                }
                className="w-full px-4 py-3.5 border-[1.5px] border-ink-10 rounded-xl text-sm font-medium text-ink bg-paper placeholder:text-ink-30 placeholder:text-xs focus:outline-none focus:border-green-mid focus:bg-white focus:ring-4 focus:ring-green-glow transition-all"
              />
            </div>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <button
              onClick={handleStart}
              className="w-full mt-4 py-4 px-5 bg-gradient-to-br from-green to-green-mid text-white text-base font-bold rounded-2xl shadow-green hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              {isRTL ? "احصل على سيرتي الاحترافية" : "Get my professional CV"}
              <span>{isRTL ? "←" : "→"}</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[11px] text-ink-30">
              {isRTL
                ? "مجاني للبناء · ادفع ٤.٩٠٠ د.ك لما تعجبك"
                : "Free to build · pay 4.900 KD when you love it"}
            </span>
            <Link
              href="/sign-in"
              className="text-xs font-semibold text-green-mid hover:text-green transition-colors"
            >
              {isRTL ? "عندك بورتفوليو؟ →" : "Have a portfolio? →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
