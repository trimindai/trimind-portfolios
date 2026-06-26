"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";

export default function StickyFooterCTA({ locale = "en" }: { locale?: string }) {
  const isRTL = locale === "ar";
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`fixed bottom-0 inset-x-0 z-50 border-t border-ink-10 bg-paper/90 backdrop-blur-md px-5 py-3 flex items-center justify-between gap-3 transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div>
        <p className="text-sm font-bold text-ink leading-none">
          {isRTL ? "سيرة ذاتية احترافية" : "A professional CV"}
        </p>
        <p className="text-[11px] text-ink-30 mt-0.5">
          {isRTL ? "مجاناً · ادفع فقط لما تعجبك" : "Free · pay only when you love it"}
        </p>
      </div>
      <Link
        href="/build"
        className="flex-shrink-0 bg-green-mid text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green transition-colors whitespace-nowrap"
      >
        {isRTL ? "ابدأ الآن ←" : "Start now →"}
      </Link>
    </div>
  );
}
