"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

// Job-title quick-pick chips. StudioClient seeds its paste box from the
// `portfolio-draft` localStorage key ({fullName, title}); this form writes it
// then routes to /build, so the user's details carry over.
const CHIPS_AR = [
  "مهندس برمجيات", "محلل مالي", "مدير مشاريع", "محاسب قانوني", "طبيب", "مصمم UX",
  "مهندس مدني", "مستشار إداري", "محامي", "معلم", "مهندس كيميائي", "ممرض",
];
const CHIPS_EN = [
  "Software Engineer", "Financial Analyst", "Project Manager", "Accountant", "Doctor", "UX Designer",
  "Civil Engineer", "Consultant", "Lawyer", "Teacher", "Chemical Engineer", "Nurse",
];

const inputCls =
  "w-full rounded-xl border border-ink-10 bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-30 outline-none focus:border-green-mid focus:ring-2 focus:ring-green-glow transition-all";

export function HeroForm({ locale }: { locale: string }) {
  const isRTL = locale === "ar";
  const router = useRouter();
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [chipsVisible, setChipsVisible] = useState(true);
  const chips = isRTL ? CHIPS_AR : CHIPS_EN;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = name.trim();
    const title = jobTitle.trim();
    try {
      if (fullName || title) {
        localStorage.setItem(
          "portfolio-draft",
          JSON.stringify({ fullName, title })
        );
      }
    } catch {
      /* localStorage unavailable — proceed to /build anyway */
    }
    router.push("/build");
  };

  return (
    <div className="relative bg-white rounded-3xl border border-ink-10 shadow-xl overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l from-green-bright to-green" />
      <div className="p-6 pt-8">
        <form onSubmit={submit}>
          <label htmlFor="hero-name" className="sr-only">
            {isRTL ? "الاسم الكامل" : "Full name"}
          </label>
          <input
            id="hero-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
            placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
            autoComplete="name"
            className={`${inputCls} mb-3`}
          />
          <label htmlFor="hero-title" className="sr-only">
            {isRTL ? "المسمى الوظيفي" : "Job title"}
          </label>
          <input
            id="hero-title"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              setChipsVisible(false);
            }}
            onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
            placeholder={isRTL ? "مسماك الوظيفي" : "Your job title"}
            autoComplete="organization-title"
            className={inputCls}
          />
          {chipsVisible && !jobTitle && (
            <div className="flex gap-2 overflow-x-auto pb-1 mt-2 scrollbar-hide">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setJobTitle(chip);
                    setChipsVisible(false);
                  }}
                  className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-ink-10 text-ink-50 hover:bg-green-glow hover:text-green-mid border border-transparent hover:border-green-mid/30 transition-all whitespace-nowrap"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-green-mid py-3.5 text-center text-base font-bold text-white hover:bg-green hover:-translate-y-px hover:shadow-green transition-all"
          >
            {isRTL ? "ابنِ سيرتي مجانًا" : "Build my CV — free"}
          </button>
          <p className="mt-3 text-center text-[11px] text-ink-30">
            {isRTL
              ? "ابنِ وعاين مجانًا · ادفع فقط عند التصدير"
              : "Build & preview free · pay only to export"}
          </p>
        </form>
      </div>
    </div>
  );
}
