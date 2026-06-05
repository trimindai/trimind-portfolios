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
  // NOTE: this layout deliberately styles its rich-text children with explicit
  // utilities instead of the Tailwind Typography `prose` plugin — that plugin is
  // NOT installed (tailwind.config plugins: []). With `prose` doing nothing and
  // the page background being white (--land-bg: #fff), the old `text-white` made
  // every paragraph render white-on-white (blank page). These `[&_…]` rules give
  // the raw <h2>/<p>/<ul>/<li>/<a> tags visible, dark text on white, RTL-safe.
  return (
    <div className="min-h-screen bg-[var(--land-bg)] text-[var(--land-bright)]">
      <nav className="border-b border-[var(--land-border)] bg-[var(--land-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-[var(--land-bright)]">
            Portfolio Pro
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--land-body)] hover:text-[var(--land-bright)] transition-colors"
          >
            {isAr ? "العودة للرئيسية" : "Back to home"}
          </Link>
        </div>
      </nav>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--land-bright)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--land-muted)]">
          {isAr ? "آخر تحديث:" : "Last updated:"} {updated}
        </p>
        <div
          className="mt-10 max-w-none text-[var(--land-body)] leading-relaxed
            [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[var(--land-bright)]
            [&_p]:my-4 [&_p]:leading-relaxed [&_p]:text-[var(--land-body)]
            [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:space-y-1.5
            [&_li]:text-[var(--land-body)]
            [&_strong]:font-semibold [&_strong]:text-[var(--land-bright)]
            [&_a]:font-medium [&_a]:text-[var(--land-accent)] [&_a]:underline hover:[&_a]:text-[var(--land-accent-hover)]"
        >
          {children}
        </div>
      </article>
    </div>
  );
}
