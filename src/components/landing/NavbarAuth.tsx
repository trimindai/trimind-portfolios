"use client";

import { useState, useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { AdminLink } from "@/components/AdminLink";

function isSignedIn(): boolean {
  if (typeof document === "undefined") return false;
  const m = document.cookie.match(/(?:^|;\s*)__client_uat=([^;]*)/);
  if (!m) return false;
  const v = parseInt(decodeURIComponent(m[1]), 10);
  return Number.isFinite(v) && v > 0;
}

function getInitial(): string {
  if (typeof document === "undefined") return "U";
  const m = document.cookie.match(/(?:^|;\s*)__clerk_db_jwt=([^;]*)/);
  if (!m) return "U";
  try {
    const payload = JSON.parse(atob(m[1].split(".")[1]));
    const name = payload?.name || payload?.email || "";
    return name.charAt(0).toUpperCase() || "U";
  } catch {
    return "U";
  }
}

export function NavbarAuth({ locale }: { locale: string }) {
  const isRTL = locale === "ar";
  // Locale-aware pathname (no locale prefix) so the language toggle keeps the
  // visitor on the SAME page when switching between /en and /ar.
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  const [initial, setInitial] = useState("U");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSignedIn(isSignedIn());
    setInitial(getInitial());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Language pill — active locale gets the raised white chip, inactive stays muted.
  const pillBase = "text-xs font-bold px-3 py-1 rounded-md transition-colors";
  const langPill = (
    <div className="flex bg-ink-10 rounded-lg p-0.5 gap-0.5">
      <Link
        href={pathname}
        locale="ar"
        className={`${pillBase} ${locale === "ar" ? "bg-white shadow-sm text-ink" : "text-ink-50"}`}
      >
        عربي
      </Link>
      <Link
        href={pathname}
        locale="en"
        className={`${pillBase} ${locale === "en" ? "bg-white shadow-sm text-ink" : "text-ink-50"}`}
      >
        EN
      </Link>
    </div>
  );

  const controls = !signedIn ? (
    <>
      <Link
        href="/sign-in"
        className="text-sm font-semibold text-ink-50 border border-ink-10 bg-white px-4 py-1.5 rounded-lg hover:border-ink-30 hover:text-ink transition-all"
      >
        {isRTL ? "دخول" : "Sign in"}
      </Link>
      <Link
        href="/templates"
        className="text-sm font-bold text-white bg-green-mid px-4 py-1.5 rounded-lg hover:bg-green hover:-translate-y-px transition-all"
      >
        {isRTL ? "ابدأ مجاناً" : "Start free"}
      </Link>
    </>
  ) : (
    <>
      <Link
        href="/dashboard"
        className="hidden sm:inline text-sm font-semibold text-ink-50 hover:text-ink transition-colors"
      >
        {isRTL ? "ملفاتي" : "My Portfolios"}
      </Link>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-green-mid text-sm font-bold text-white hover:bg-green transition-colors"
        >
          {initial}
        </button>
        {menuOpen && (
          <div className="absolute end-0 top-full mt-2 w-44 rounded-xl border border-ink-10 bg-white shadow-lg py-1 z-50">
            <Link
              href="/dashboard"
              className="block px-4 py-2.5 text-sm text-ink hover:bg-ink-10 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {isRTL ? "ملفاتي ←" : "My Portfolios →"}
            </Link>
            <div className="mx-3 my-1 h-px bg-ink-10" />
            <a
              href={`/${locale}/sign-in`}
              onClick={(e) => {
                e.preventDefault();
                document.cookie = "__client_uat=0; path=/; max-age=0";
                window.location.href = "/";
              }}
              className="block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              {isRTL ? "خروج" : "Sign out"}
            </a>
          </div>
        )}
      </div>
    </>
  );

  return (
    <nav
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled
          ? "backdrop-blur-md bg-paper/85 border-b border-ink-10 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-ink hover:opacity-80 transition-opacity"
        >
          {isRTL ? (
            <>
              بورتفوليو <span className="text-green-mid">برو</span>
            </>
          ) : (
            <>
              Portfolio <span className="text-green-mid">Pro</span>
            </>
          )}
        </Link>
        <div className="flex items-center gap-3">
          {/* Self-gating: renders only for admins (api.users.isAdmin Convex query) */}
          <AdminLink />
          {langPill}
          {controls}
        </div>
      </div>
    </nav>
  );
}
