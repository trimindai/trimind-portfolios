"use client";

import { motion } from "framer-motion";
import { LayoutGrid, PenTool, Globe, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HOSTING_ENABLED } from "@/lib/flags";

/**
 * Visual 3-step timeline. The connecting line draws in on scroll via
 * Framer Motion's pathLength animation (desktop only). Vertical stack on mobile.
 */
export function HowItWorks({ isRTL }: { isRTL: boolean }) {
  const steps = [
    {
      icon: LayoutGrid,
      n: "1",
      title: isRTL ? "اختر" : "Pick",
      desc: isRTL
        ? "اختر قالبًا يناسب مهنتك"
        : "Choose a template that fits your profession",
    },
    {
      icon: PenTool,
      n: "2",
      title: isRTL ? "أضف" : "Fill",
      desc: isRTL
        ? "أضف تفاصيلك بالعربي أو الإنجليزي أو كلاهما"
        : "Add your details in Arabic, English, or both",
    },
    HOSTING_ENABLED
      ? {
          icon: Globe,
          n: "3",
          title: isRTL ? "انشر" : "Publish",
          desc: isRTL
            ? "بنقرة واحدة يصبح بورتفوليوك حيًا برابط خاص"
            : "One click and your portfolio is live with its own URL",
        }
      : {
          icon: Download,
          n: "3",
          title: isRTL ? "حمّل" : "Download",
          desc: isRTL
            ? "حمّل بورتفوليوك كملف PDF احترافي جاهز للمشاركة"
            : "Download your portfolio as a polished, ready-to-share PDF",
        },
  ];

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-medium tracking-widest uppercase text-[var(--land-accent)]">
          {isRTL ? "كيف يعمل" : "How it works"}
        </p>
        <h2
          className="mt-3 font-extrabold tracking-tighter"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          {isRTL ? "ثلاث خطوات فقط" : "Three steps. That's it."}
        </h2>

        <div className="relative mt-16">
          {/* Connecting line — desktop only, draws on scroll */}
          <svg
            className="absolute left-0 right-0 top-9 hidden lg:block"
            height="2"
            width="100%"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* faint dashed track */}
            <line
              x1="12%"
              y1="1"
              x2="88%"
              y2="1"
              stroke="var(--land-border)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            {/* emerald progress that draws in */}
            <motion.line
              x1="12%"
              y1="1"
              x2="88%"
              y2="1"
              stroke="var(--land-accent)"
              strokeWidth="2"
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          </svg>

          <ol className="relative flex flex-col gap-12 lg:flex-row lg:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.n}
                  className="flex flex-1 items-start gap-5 text-start lg:flex-col lg:items-center lg:text-center"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="relative shrink-0">
                    <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-[var(--land-accent)]/40 bg-[var(--land-bg)] text-[var(--land-accent)]">
                      <Icon className="h-7 w-7" strokeWidth={1.75} />
                    </span>
                    <span className="absolute -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--land-accent)] text-xs font-bold text-white ltr:-right-1 rtl:-left-1">
                      {step.n}
                    </span>
                  </div>
                  <div className="lg:mt-5">
                    <h3 className="text-lg font-semibold text-[var(--land-bright)]">
                      {step.title}
                    </h3>
                    <p className="mt-1 max-w-xs text-sm text-[var(--land-body)]">
                      {step.desc}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* Section CTA */}
        <div className="mt-16 flex flex-col items-center">
          <Link
            href="/templates"
            className="inline-block rounded-lg bg-[var(--land-accent)] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)] active:scale-[0.98] shadow-sm"
          >
            {isRTL ? "ابدأ البناء — ٤.٩٠٠ دك" : "Start Building — 4.900 KD"}
          </Link>
          <p className="mt-3 text-xs text-[var(--land-muted)]">
            {isRTL
              ? "دفعة واحدة. بدون اشتراك. وصول فوري."
              : "One-time payment. No subscription. Instant access."}
          </p>
        </div>
      </div>
    </section>
  );
}
