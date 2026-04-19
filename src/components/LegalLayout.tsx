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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Portfolio Pro
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isAr ? "العودة للرئيسية" : "Back to home"}
          </Link>
        </div>
      </nav>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {isAr ? "آخر تحديث:" : "Last updated:"} {updated}
        </p>
        <div className="prose prose-invert mt-10 max-w-none prose-headings:mt-10 prose-headings:font-semibold prose-h2:text-2xl prose-h2:tracking-tight prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-white prose-a:text-emerald-400">
          {children}
        </div>
      </article>
    </div>
  );
}
