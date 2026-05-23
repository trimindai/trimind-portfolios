import { Link } from "@/i18n/navigation";
import { TEMPLATES } from "@/lib/templates";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata = {
  title: "Portfolio Templates — Portfolio Pro",
  description:
    "Profession-specific portfolio templates: Corporate, Engineer, Creative, Creator, Developer, Medical, Educator.",
};

export default async function TemplatesPage({ params }: PageProps) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const t = {
    title: isAr ? "اختر القالب المناسب لك" : "Pick the right template",
    subtitle: isAr
      ? "قوالب مصممة لكل مهنة — اختر واحدًا وابدأ خلال دقائق."
      : "Profession-specific templates — pick one and launch in minutes.",
    available: isAr ? "متاح الآن" : "Available now",
    soon: isAr ? "قريبًا" : "Coming soon",
    preview: isAr ? "معاينة مباشرة" : "Live preview",
    use: isAr ? "ابدأ الآن" : "Use this template",
    targets: isAr ? "مناسب لـ" : "For",
    backHome: isAr ? "العودة للرئيسية" : "Back to home",
  };

  return (
    <div className="min-h-screen bg-[var(--land-bg)] text-[var(--land-bright)]">
      <nav className="border-b border-[var(--land-border)]/50 bg-[var(--land-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Portfolio Pro
          </Link>
          <Link
            href="/dashboard/new"
            className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium hover:bg-[var(--land-accent-hover)] transition-colors"
          >
            {t.use}
          </Link>
        </div>
      </nav>

      <header className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg text-[var(--land-body)] max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </header>

      <main className="px-6 pb-24">
        {/* Featured: available templates */}
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_1fr]">
          {TEMPLATES.filter((tpl) => tpl.available).map((tpl) => (
            <article
              key={tpl.id}
              className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)] overflow-hidden flex flex-col"
            >
              {/* Color-swatch preview */}
              <div
                className="aspect-[16/10] relative"
                style={{
                  background: `linear-gradient(135deg, ${
                    tpl.colors.bg ?? "#0f172a"
                  }, ${tpl.colors.bgDeep ?? tpl.colors.bg ?? "#020617"})`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="text-3xl font-bold tracking-tight"
                    style={{
                      color: tpl.colors.primary ?? "#fff",
                      textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                    }}
                  >
                    {tpl.name}
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {[
                    tpl.colors.primary,
                    tpl.colors.secondary,
                    tpl.colors.accent,
                  ]
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((c, i) => (
                      <span
                        key={i}
                        className="h-3 w-3 rounded-full ring-1 ring-black/20"
                        style={{ background: c }}
                      />
                    ))}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-1 bg-[var(--land-accent-subtle)] text-[var(--land-accent)]">
                    {t.available}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col grow">
                <h2 className="text-xl font-semibold">{tpl.name}</h2>
                <p className="mt-2 text-sm text-[var(--land-body)] line-clamp-3">
                  {tpl.description}
                </p>
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--land-muted)]">
                    {t.targets}
                  </p>
                  <p className="mt-1 text-xs text-[var(--land-bright)]">
                    {tpl.targetProfessions.slice(0, 3).join(" · ")}
                    {tpl.targetProfessions.length > 3 ? " …" : ""}
                  </p>
                </div>
                <div className="mt-6 flex gap-2 mt-auto pt-4">
                  {tpl.demoUrl ? (
                    <a
                      href={tpl.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-lg border border-[var(--land-border)] px-3 py-2 text-sm hover:bg-[var(--land-surface-raised)] transition-colors"
                    >
                      {t.preview}
                    </a>
                  ) : (
                    <span className="flex-1 text-center rounded-lg border border-[var(--land-border)] px-3 py-2 text-sm text-[var(--land-muted)] cursor-not-allowed">
                      {t.preview}
                    </span>
                  )}
                  <Link
                    href={`/dashboard/new?template=${tpl.id}`}
                    className="flex-1 text-center rounded-lg bg-[var(--land-accent)] px-3 py-2 text-sm font-medium hover:bg-[var(--land-accent-hover)] transition-colors"
                  >
                    {t.use}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Coming soon templates */}
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {TEMPLATES.filter((tpl) => !tpl.available).map((tpl) => (
            <article
              key={tpl.id}
              className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)] overflow-hidden flex flex-col"
            >
              {/* Color-swatch preview */}
              <div
                className="aspect-[16/10] relative"
                style={{
                  background: `linear-gradient(135deg, ${
                    tpl.colors.bg ?? "#0f172a"
                  }, ${tpl.colors.bgDeep ?? tpl.colors.bg ?? "#020617"})`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="text-3xl font-bold tracking-tight"
                    style={{
                      color: tpl.colors.primary ?? "#fff",
                      textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                    }}
                  >
                    {tpl.name}
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {[
                    tpl.colors.primary,
                    tpl.colors.secondary,
                    tpl.colors.accent,
                  ]
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((c, i) => (
                      <span
                        key={i}
                        className="h-3 w-3 rounded-full ring-1 ring-black/20"
                        style={{ background: c }}
                      />
                    ))}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-1 bg-[var(--land-surface-raised)] text-[var(--land-muted)]">
                    {t.soon}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col grow">
                <h2 className="text-xl font-semibold">{tpl.name}</h2>
                <p className="mt-2 text-sm text-[var(--land-body)] line-clamp-3">
                  {tpl.description}
                </p>
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--land-muted)]">
                    {t.targets}
                  </p>
                  <p className="mt-1 text-xs text-[var(--land-bright)]">
                    {tpl.targetProfessions.slice(0, 3).join(" · ")}
                    {tpl.targetProfessions.length > 3 ? " …" : ""}
                  </p>
                </div>
                <div className="mt-6 flex gap-2 mt-auto pt-4">
                  <span className="flex-1 text-center rounded-lg border border-[var(--land-border)] px-3 py-2 text-sm text-[var(--land-muted)] cursor-not-allowed">
                    {t.preview}
                  </span>
                  <span className="flex-1 text-center rounded-lg bg-[var(--land-surface-raised)] px-3 py-2 text-sm text-[var(--land-muted)] cursor-not-allowed">
                    {t.use}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)] transition-colors"
          >
            ← {t.backHome}
          </Link>
        </div>
      </main>
    </div>
  );
}
