"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { MessageCircle, ArrowUp } from "lucide-react";

// All fixed-position landing chrome in one client component: the sticky bottom
// CTA bar (IntersectionObserver: shows past the hero, hides over pricing), the
// floating WhatsApp button (bottom-left), and the scroll-to-top button
// (bottom-right, after 400px). Grouped so the WhatsApp/scroll buttons can offset
// themselves above the bar and never overlap it.
export function LandingFloating({ locale }: { locale: string }) {
  const isRTL = locale === "ar";
  const [barShown, setBarShown] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const pricing = document.getElementById("pricing");
    let heroOut = false;
    let pricingIn = false;
    const update = () => setBarShown(heroOut && !pricingIn);

    const ho = new IntersectionObserver(
      ([e]) => {
        heroOut = !e.isIntersecting;
        update();
      },
      { threshold: 0 },
    );
    const po = new IntersectionObserver(
      ([e]) => {
        pricingIn = e.isIntersecting;
        update();
      },
      { threshold: 0 },
    );
    if (hero) ho.observe(hero);
    if (pricing) po.observe(pricing);

    // ponytail: bar re-shows below pricing too; harmless, contact section has its own CTA.
    return () => {
      ho.disconnect();
      po.disconnect();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lift the corner buttons above the sticky bar when it's visible.
  const lift = barShown ? "5.25rem" : "1.5rem";

  return (
    <>
      {/* Sticky bottom CTA bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-10 bg-white/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 ${
          barShown ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-md">
          <Link
            href="/build"
            className="block w-full rounded-xl bg-[#22c55e] py-3.5 text-center text-base font-bold text-white shadow-md transition-all hover:-translate-y-px hover:bg-[#16a34a] active:scale-[0.99]"
          >
            {isRTL ? "ابن سيرتي مجانًا" : "Build my CV — free"}
          </Link>
        </div>
      </div>

      {/* Floating WhatsApp — bottom LEFT (physical, both locales) */}
      <a
        href="https://wa.me/96550439150"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isRTL ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
        style={{ bottom: lift }}
        className="fixed left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-lg transition-all hover:scale-105 hover:bg-[#16a34a]"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* Scroll-to-top — bottom RIGHT, after 400px */}
      <button
        type="button"
        aria-label={isRTL ? "العودة للأعلى" : "Back to top"}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ bottom: lift }}
        className={`fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink-10 bg-white text-ink shadow-lg transition-all hover:bg-ink-10 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  );
}
