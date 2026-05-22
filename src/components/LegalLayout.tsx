import { Link } from "@/i18n/navigation";
import { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
  isAr = false,
}: {
  title: string;
  updated: string;
  children: ReactNode;
  isAr?: boolean;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--land-bg)] via-[var(--land-surface)] to-[var(--land-bg)] text-white">
      <nav className="border-b border-white/5 bg-[var(--land-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Portfolio Pro
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--land-body)] hover:text-white transition-colors"
          >
            {isAr ? "العودة للرئيسية" : "Back to home"}
          </Link>
        </div>
      </nav>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-[var(--land-muted)]">
          {isAr ? "آخر تحديث:" : "Last updated:"} {updated}
        </p>
        <div className="prose prose-invert mt-10 max-w-none prose-headings:mt-10 prose-headings:font-semibold prose-h2:text-2xl prose-h2:tracking-tight prose-p:text-[var(--land-bright)] prose-p:leading-relaxed prose-li:text-[var(--land-bright)] prose-strong:text-white prose-a:text-[var(--land-accent-hover)]">
          {children}
        </div>
      </article>
    </div>
  );
}
