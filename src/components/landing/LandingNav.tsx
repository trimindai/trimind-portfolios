"use client";

import { useState, useEffect } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { AdminLink } from "@/components/AdminLink";
import { NavbarAuth } from "@/components/landing/NavbarAuth";

// Scroll-aware landing navbar: transparent at top, blurs + borders on scroll.
// Mobile keeps only brand + the auth CTA; lang pill and sign-in hide below md.
export function LandingNav({ locale, appName }: { locale: string; appName: string }) {
  const isRTL = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // next-intl router keeps the current path, swaps only the locale segment.
  const switchLocale = (l: "ar" | "en") => router.replace(pathname, { locale: l });

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all ${
        scrolled
          ? "border-b border-ink-10 bg-white/80 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="font-bold text-[17px] text-ink tracking-tight">
          {isRTL ? (
            <>
              بورتفوليو <span className="text-green-mid">برو</span>
            </>
          ) : (
            appName
          )}
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <AdminLink />
          {/* language pill — hidden on mobile */}
          <div className="hidden md:flex bg-ink-10 rounded-lg p-0.5 gap-0.5">
            <button
              type="button"
              aria-label="العربية"
              className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                locale === "ar" ? "bg-white shadow-sm text-ink" : "text-ink-50"
              }`}
              onClick={() => switchLocale("ar")}
            >
              عربي
            </button>
            <button
              type="button"
              aria-label="English"
              className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                locale === "en" ? "bg-white shadow-sm text-ink" : "text-ink-50"
              }`}
              onClick={() => switchLocale("en")}
            >
              EN
            </button>
          </div>
          <NavbarAuth locale={locale} />
        </div>
      </div>
    </nav>
  );
}
