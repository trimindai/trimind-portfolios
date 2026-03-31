import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LandingPage() {
  const t = useTranslations("landing");
  const tc = useTranslations("common");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            {tc("appName")}
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              {tc("signIn")}
            </Link>
            <Link
              href="/dashboard/new"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 transition-colors"
            >
              {tc("getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center pt-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg text-slate-400 sm:text-xl max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/new"
              className="rounded-lg bg-emerald-600 px-8 py-3 text-lg font-semibold hover:bg-emerald-500 transition-colors"
            >
              {t("hero.cta")}
            </Link>
            <a
              href="#templates"
              className="rounded-lg border border-slate-700 px-8 py-3 text-lg font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {t("hero.browse")}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            {t("features.title")}
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {(
              ["templates", "bilingual", "pdf", "hosted"] as const
            ).map((key) => (
              <div
                key={key}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-500">
                  <FeatureIcon feature={key} />
                </div>
                <h3 className="text-lg font-semibold">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {t(`features.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-24 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t("templates.title")}
          </h2>
          <p className="mt-4 text-slate-400">{t("templates.subtitle")}</p>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 transition-all hover:border-emerald-600/50"
              >
                <div className="aspect-[4/3] bg-slate-800 flex items-center justify-center text-slate-600">
                  <span className="text-4xl">{tmpl.emoji}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{tmpl.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {tmpl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-4 text-slate-400">{t("pricing.subtitle")}</p>
          <div className="mt-12 rounded-2xl border border-emerald-600/30 bg-slate-900/80 p-8">
            <div className="text-5xl font-bold text-emerald-500">
              {t("pricing.price")}
            </div>
            <div className="mt-1 text-slate-400">{t("pricing.perPortfolio")}</div>
            <ul className="mt-8 space-y-3 text-start text-sm">
              {(t.raw("pricing.includes") as string[]).map(
                (item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-500">&#10003;</span>
                    {item}
                  </li>
                )
              )}
            </ul>
            <Link
              href="/dashboard/new"
              className="mt-8 block rounded-lg bg-emerald-600 py-3 text-center font-semibold hover:bg-emerald-500 transition-colors"
            >
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Portfolio Pro by TriMind
      </footer>
    </div>
  );
}

function FeatureIcon({ feature }: { feature: string }) {
  const icons: Record<string, string> = {
    templates: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    bilingual:
      "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
    pdf: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    hosted:
      "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  };
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[feature]} />
    </svg>
  );
}

const TEMPLATES = [
  {
    id: "corporate",
    name: "Corporate",
    emoji: "\uD83C\uDFE2",
    description: "Accounting, Finance, Business Management, HR",
  },
  {
    id: "executive",
    name: "Executive",
    emoji: "\uD83D\uDC54",
    description: "C-Suite, Directors, Consultants",
  },
  {
    id: "developer",
    name: "Developer",
    emoji: "\uD83D\uDCBB",
    description: "Software Engineers, IT, DevOps",
  },
  {
    id: "designer",
    name: "Designer",
    emoji: "\uD83C\uDFA8",
    description: "UI/UX, Graphic Design, Architecture",
  },
  {
    id: "medical",
    name: "Medical",
    emoji: "\u2695\uFE0F",
    description: "Doctors, Pharmacists, Healthcare",
  },
  {
    id: "educator",
    name: "Educator",
    emoji: "\uD83D\uDCDA",
    description: "Teachers, Professors, Trainers",
  },
  {
    id: "creative",
    name: "Creative",
    emoji: "\uD83D\uDCF7",
    description: "Photographers, Content Creators, Artists",
  },
];
