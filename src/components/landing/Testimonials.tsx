"use client";

import { Check } from "lucide-react";

/**
 * Feature-proof band — replaces testimonials until real ones are collected.
 *
 * TODO: Replace with real testimonials component when user quotes are available.
 * The previous testimonial component (3 cards, mobile carousel) can be restored
 * by reverting this file. Keep the same props interface.
 */
export function Testimonials({ isRTL }: { isRTL: boolean }) {
  const features = isRTL
    ? [
        "ثنائي اللغة بالتصميم",
        "PDF جاهز للـ ATS",
        "باركود QR مدمج",
        "دفعة واحدة — للأبد",
        "قوالب احترافية",
        "عربي + إنجليزي",
      ]
    : [
        "Bilingual by design",
        "ATS-ready PDF",
        "Embedded QR code",
        "One-time payment — forever",
        "Professional templates",
        "Arabic + English",
      ];

  return (
    <section className="py-16 px-6 border-y border-[var(--land-border)]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {features.map((f) => (
            <span
              key={f}
              className="flex items-center gap-2 text-sm font-medium text-[var(--land-body)]"
            >
              <Check className="h-4 w-4 text-[var(--land-accent)]" />
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
