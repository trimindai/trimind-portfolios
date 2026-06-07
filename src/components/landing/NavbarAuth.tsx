"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";

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
  const [signedIn, setSignedIn] = useState(false);
  const [initial, setInitial] = useState("U");
  const [menuOpen, setMenuOpen] = useState(false);
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

  if (!signedIn) {
    return (
      <>
        <Link
          href="/sign-in"
          className="hidden sm:inline text-sm text-[var(--land-body)] hover:text-[var(--land-bright)] transition-colors"
        >
          {isRTL ? "تسجيل الدخول" : "Sign in"}
        </Link>
        <Link
          href="/templates"
          className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
        >
          {isRTL ? "ابدأ الآن" : "Get Started"}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/dashboard"
        className="hidden sm:inline text-sm text-[var(--land-body)] hover:text-[var(--land-bright)] transition-colors"
      >
        {isRTL ? "ملفاتي" : "My Portfolios"}
      </Link>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--land-accent)] text-sm font-bold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
        >
          {initial}
        </button>
        {menuOpen && (
          <div className="absolute end-0 top-full mt-2 w-44 rounded-xl border border-[var(--land-border)] bg-white shadow-lg py-1 z-50">
            <Link
              href="/dashboard"
              className="block px-4 py-2.5 text-sm text-[var(--land-bright)] hover:bg-[var(--land-surface)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {isRTL ? "ملفاتي ←" : "My Portfolios →"}
            </Link>
            <div className="mx-3 my-1 h-px bg-[var(--land-border)]" />
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
}
