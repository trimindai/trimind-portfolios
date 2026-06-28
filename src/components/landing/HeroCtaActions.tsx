"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

// Hero primary CTA + "see a sample CV" — both open mobile bottom-sheets.
//   • Primary CTA → a quick "which describes you?" role sheet → /build with a
//     pre-selected template (§6).
//   • Secondary → a drawer showing a real generated sample CV (§4).
// Server page keeps the trust line, pay note and stats around this block.
export function HeroCtaActions({ locale }: { locale: string }) {
  const isRTL = locale === "ar";
  const [roleOpen, setRoleOpen] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);

  const roles = [
    { id: "graduate", template: "general", en: "🎓 Fresh Graduate", ar: "🎓 خريج جديد" },
    { id: "professional", template: "engineer", en: "💼 Experienced Professional", ar: "💼 محترف ذو خبرة" },
    { id: "creative", template: "creative", en: "🎨 Creative / Freelancer", ar: "🎨 مبدع / مستقل" },
  ];

  return (
    <>
      {/* primary CTA — opens the role sheet instead of navigating directly */}
      <button
        type="button"
        onClick={() => setRoleOpen(true)}
        dir="auto"
        className="w-full max-w-[300px] rounded-2xl bg-green-mid py-4 px-4 text-center text-lg font-bold text-white shadow-green transition-all hover:-translate-y-px hover:bg-green hover:shadow-green-lg active:scale-[0.99]"
      >
        {isRTL ? "ابنِ سيرتي — مجانًا" : "Build my CV — free"}
      </button>

      {/* secondary — see a sample first */}
      <button
        type="button"
        onClick={() => setSampleOpen(true)}
        dir="auto"
        className="mt-3 w-full max-w-[300px] rounded-xl border border-gray-200 py-3 px-4 text-sm text-gray-600 transition-colors hover:border-green-mid hover:text-green-mid"
      >
        {isRTL ? "👁 شوف نموذج سيرة أولًا" : "👁 See a sample CV first"}
      </button>

      {/* ── role bottom-sheet (§6) ───────────────────────────── */}
      {roleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setRoleOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl bg-white px-4 pt-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden />
            <h3 className="text-lg font-bold text-ink" dir="auto">
              {isRTL ? "سؤال سريع" : "Quick question"}
            </h3>
            <p className="mt-1 text-sm text-gray-500" dir="auto">
              {isRTL ? "أيها يصفك أكثر؟" : "Which best describes you?"}
            </p>
            <div className="mt-4 space-y-2.5">
              {roles.map((r) => (
                <Link
                  key={r.id}
                  href={`/build?role=${r.id}&template=${r.template}`}
                  dir="auto"
                  className="block rounded-xl border border-gray-200 px-4 py-3 text-base font-medium text-ink transition-colors hover:border-green-mid hover:bg-green-mid/5"
                >
                  {isRTL ? r.ar : r.en}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── sample CV drawer (§4) ────────────────────────────── */}
      {sampleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setSampleOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white px-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 -mx-4 bg-white px-4 pt-3 pb-2">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden />
              <h3 className="text-center text-lg font-bold text-ink" dir="auto">
                {isRTL ? "نموذج سيرة — أُنشئ في ١٢ ثانية" : "Sample CV — Generated in 12 seconds"}
              </h3>
            </div>
            <Image
              src="/sample-cv.png"
              alt={isRTL ? "نموذج سيرة ذاتية" : "Sample CV"}
              width={794}
              height={838}
              className="w-full rounded-xl border border-gray-100 shadow-sm"
            />
            <Link
              href="/build"
              dir="auto"
              className="mt-4 block w-full rounded-xl bg-green-mid py-3 px-4 text-center font-semibold text-white transition-colors hover:bg-green"
            >
              {isRTL ? "ابنِ سيرتي — مجانًا" : "Build mine — free"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
