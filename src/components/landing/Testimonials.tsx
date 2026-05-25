"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

/**
 * TODO: Replace with real testimonials from beta users before enabling.
 * Gated OFF intentionally — we do not publish fabricated social proof on a
 * page that takes payment. Flip SHOW_TESTIMONIALS to true once the `items`
 * below are real, verifiable quotes.
 */
const SHOW_TESTIMONIALS = false;

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

export function Testimonials({ isRTL }: { isRTL: boolean }) {
  const [active, setActive] = useState(0);

  if (!SHOW_TESTIMONIALS) return null;

  // TODO: Replace with real testimonials from beta users.
  const items: Testimonial[] = isRTL
    ? [
        {
          quote:
            "بنيت بورتفوليو الهندسي خلال ٢٠ دقيقة. تصميم العربية متقن — ليس مجرد ترجمة، بل مصمم فعلًا للعربية.",
          name: "أحمد الراشد",
          role: "مهندس بترول، الكويت",
          initials: "أ.ر",
        },
        {
          quote:
            "كمديرة تنفيذية، احتجت شيئًا أنيقًا بسرعة. فاق التوقعات. تصدير PDF مع الباركود رائع لفعاليات التواصل.",
          name: "فاطمة الزهراء",
          role: "مديرة عمليات، الإمارات",
          initials: "ف.ز",
        },
        {
          quote:
            "أخيرًا أداة بورتفوليو تفهم سوق الخليج. دفعة واحدة، بلا تعقيد. كان بورتفوليوي جاهزًا قبل أن تبرد قهوتي.",
          name: "خالد العتيبي",
          role: "مدير مشاريع، السعودية",
          initials: "خ.ع",
        },
      ]
    : [
        {
          quote:
            "Built my engineering portfolio in 20 minutes. The Arabic layout is flawless — not just translated, actually designed for Arabic.",
          name: "Ahmed Al-Rashid",
          role: "Petroleum Engineer, Kuwait",
          initials: "AR",
        },
        {
          quote:
            "As a corporate director, I needed something polished fast. This exceeded expectations. The PDF export with barcode is brilliant for networking events.",
          name: "Fatima Al-Zahra",
          role: "Operations Director, UAE",
          initials: "FZ",
        },
        {
          quote:
            "Finally a portfolio tool that understands the Gulf market. One payment, no nonsense. My portfolio was live before my coffee got cold.",
          name: "Khalid Al-Otaibi",
          role: "Project Manager, Saudi Arabia",
          initials: "KO",
        },
      ];

  const rotations = ["-rotate-1", "rotate-0", "rotate-1"];

  const Card = ({ t, className = "" }: { t: Testimonial; className?: string }) => (
    <figure
      className={`rounded-2xl border border-white/10 bg-[var(--land-surface)] p-6 ${className}`}
    >
      <div className="flex gap-0.5 text-[var(--land-accent)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 text-sm leading-relaxed text-[var(--land-bright)]">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--land-accent-subtle)] text-sm font-semibold text-[var(--land-accent)]">
          {t.initials}
        </span>
        <span>
          <span className="block text-sm font-semibold text-[var(--land-bright)]">
            {t.name}
          </span>
          <span className="block text-xs text-[var(--land-muted)]">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );

  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          className="text-center font-extrabold tracking-tighter"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          {isRTL ? "موثوق من محترفي الخليج" : "Trusted by GCC Professionals"}
        </h2>

        {/* Desktop: 3-col grid */}
        <div className="mt-12 hidden gap-6 md:grid md:grid-cols-3">
          {items.map((t, i) => (
            <Card key={t.name} t={t} className={rotations[i]} />
          ))}
        </div>

        {/* Mobile: auto-rotating carousel */}
        <div className="mt-12 md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card t={items[active]} />
            </motion.div>
          </AnimatePresence>
          <div className="mt-5 flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-[var(--land-accent)]" : "w-2 bg-[var(--land-border)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
