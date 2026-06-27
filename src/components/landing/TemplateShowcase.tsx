"use client";

import { useState } from "react";
import Image from "next/image";
import { UseTemplateButton } from "@/components/landing/UseTemplateButton";

// Live interactive demo of the 5 templates — tab switcher + active preview.
// Tabs (not autoplay carousel) so it's mobile/RTL friendly and a11y-keyboard safe.
type Tpl = {
  id: string;
  useId: string;
  demo: string;
  mockup: string;
  en: string;
  ar: string;
  enDesc: string;
  arDesc: string;
};

const TEMPLATES: Tpl[] = [
  {
    id: "general",
    useId: "corporate",
    demo: "/demo/corporate/index.html",
    mockup: "/landing/mockup-corporate-2026b.webp",
    en: "Corporate",
    ar: "مؤسسي",
    enDesc: "Navy & gold institutional design — achievement metrics, career timeline, credentials, print-ready PDF.",
    arDesc: "تصميم مؤسسي كحلي وذهبي — مؤشرات الإنجاز، الخط الزمني، الشهادات، وPDF جاهز للطباعة.",
  },
  {
    id: "engineer",
    useId: "engineer",
    demo: "/demo/engineer/index.html",
    mockup: "/landing/mockup-engineer-2026b.webp",
    en: "Engineer",
    ar: "هندسي",
    enDesc: "Minimal, project-forward — project cards with their own detail pages, grouped skills, certifications.",
    arDesc: "بسيط يركّز على المشاريع — بطاقات مشاريع بصفحات تفصيلية، مهارات مجمّعة، شهادات.",
  },
  {
    id: "creative",
    useId: "creative",
    demo: "/demo/creative/index.html",
    mockup: "/landing/mockup-creative-2026b.webp",
    en: "Creative",
    ar: "إبداعي",
    enDesc: "Bold, work-forward — galleries, process storytelling, and tool-proficiency grids.",
    arDesc: "جريء يركّز على العمل المرئي — معارض، سرد العملية، وشبكات إتقان الأدوات.",
  },
  {
    id: "creator",
    useId: "creator",
    demo: "/demo/creator/index.html",
    mockup: "/landing/mockup-creator-2026b.webp",
    en: "Creator",
    ar: "صانع محتوى",
    enDesc: "A portfolio you can play — an optional match-card game reveals your work, audience stats, and brand marquee.",
    arDesc: "بورتفوليو يُلعب — لعبة بطاقات اختيارية تكشف أعمالك، إحصائيات الجمهور، وشريط العلامات.",
  },
  {
    id: "developer",
    useId: "developer",
    demo: "/demo/developer/index.html",
    mockup: "/landing/mockup-developer-2026b.webp",
    en: "Developer",
    ar: "مطوّر",
    enDesc: "Interactive 3D keyboard of your stack — every tool lights up a real key. Projects, experience, GitHub links.",
    arDesc: "لوحة مفاتيح ثلاثية الأبعاد لأدواتك — كل تقنية تضيء زرًا حقيقيًا. مشاريع، خبرات، وروابط GitHub.",
  },
];

export function TemplateShowcase({ locale }: { locale: string }) {
  const isRTL = locale === "ar";
  const [active, setActive] = useState(0);
  const t = TEMPLATES[active];

  return (
    <div className="w-full">
      {/* Tab switcher */}
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={isRTL ? "القوالب" : "Templates"}>
        {TEMPLATES.map((tpl, i) => (
          <button
            key={tpl.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
              i === active
                ? "bg-green-mid font-bold text-white"
                : "bg-gray-100 font-medium text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isRTL ? tpl.ar : tpl.en}
          </button>
        ))}
      </div>

      {/* Active preview */}
      <a
        href={t.demo}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-xl border border-[var(--land-border)] shadow-sm transition-shadow hover:shadow-md"
      >
        <Image
          key={t.id}
          src={t.mockup}
          alt={isRTL ? t.ar : t.en}
          width={1200}
          height={800}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="w-full h-auto"
          quality={85}
        />
        <span className="absolute top-3 end-3 z-10 flex items-center gap-1.5 rounded-full border border-[var(--land-accent)]/30 bg-[var(--land-bg)]/85 px-2.5 py-1 text-[10px] font-medium text-[var(--land-accent)] backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--land-accent)]" />
          {isRTL ? "عرض مباشر" : "Live demo"}
        </span>
      </a>

      <p className="mt-3 text-sm leading-relaxed text-[var(--land-body)]">{isRTL ? t.arDesc : t.enDesc}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href={t.demo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[var(--land-accent)] hover:underline"
        >
          {isRTL ? "افتح العرض المباشر ←" : "Open live demo →"}
        </a>
        <UseTemplateButton
          template={t.useId}
          locale={locale}
          label={isRTL ? "استخدم هذا القالب" : "Use this template"}
          className="rounded-lg border border-[var(--land-accent)]/50 px-4 py-1.5 text-sm font-medium text-[var(--land-accent)] transition-colors hover:bg-[var(--land-accent)]/10"
        />
      </div>
    </div>
  );
}
