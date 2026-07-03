import { Link } from "@/i18n/navigation";
import { TEMPLATES, isTemplateAvailableFor } from "@/lib/templates";
import { PRICE_KWD } from "@/lib/pricing";
import { priceLabel as fmtPrice } from "@/lib/currency";
import { getCurrency } from "@/lib/currency-server";
import { ADMIN_EMAILS } from "@/lib/admin";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

const AR_TEMPLATE: Record<
  string,
  { name: string; description: string; targets: string[] }
> = {
  general: {
    name: "عام",
    description:
      "ملف شخصي نظيف واحترافي يناسب أي مجال — الخيار المتعدد الاستخدامات. يعمل في مجالات الأعمال والماليات والعمليات والقانون والموارد البشرية وغيرها.",
    targets: ["محلل مالي", "محاسب", "مدقق حسابات"],
  },
  engineer: {
    name: "مهندس",
    description:
      "ملف شخصي يبرز المشاريع للمهندسين — كهربائي، ميكانيكي، مدني، صناعي، كيميائي، وبترولي.",
    targets: ["مهندس كهربائي", "مهندس ميكانيكي", "مهندس مدني"],
  },
  creative: {
    name: "إبداعي",
    description:
      "ملف شخصي للفنانين والمحترفين الإبداعيين — أعمالك في معرض تفاعلي ثلاثي الأبعاد.",
    targets: ["مصور", "مصور فيديو", "مصمم واجهات وتجربة مستخدم"],
  },
  creator: {
    name: "صانع محتوى",
    description:
      "ملف شخصي عالي الطاقة لصناع المحتوى والفنانين ورواة القصص الرقمية — إحصائيات، وعرض محتوى، وتعاونات مع العلامات التجارية.",
    targets: ["صانع محتوى", "يوتيوبر", "مدوّن"],
  },
  developer: {
    name: "مطوّر",
    description:
      "ملف شخصي مظلم للمطوّرين مع لوحة مفاتيح ثلاثية الأبعاد تفاعلية تعرض مهاراتك ومشاريعك.",
    targets: ["مهندس برمجيات", "مطوّر متكامل", "مطوّر واجهات أمامية"],
  },
};

// Per-visitor currency (SA → SAR) from the 'cur' cookie → render per-request.
export const dynamic = "force-dynamic";

const MOCKUP_IMAGES: Record<string, string> = {
  general: "/landing/mockup-corporate-2026a.jpg",
  engineer: "/landing/mockup-engineer-2026a.jpg",
  creative: "/landing/mockup-creative-2026a.jpg",
};

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ prefill?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return {
    title: "Portfolio Templates — Portfolio Pro — Professional CV & Portfolio",
    description:
      "Build your professional CV and portfolio free. Pay 4.9 KD only when you publish. Choose from General, Engineer, Creative, Creator, Developer templates. Arabic & English. Kuwait & Gulf.",
    alternates: {
      canonical: `https://portfolio-trimind.com/${locale}/templates`,
      languages: {
        en: "https://portfolio-trimind.com/en/templates",
        ar: "https://portfolio-trimind.com/ar/templates",
      },
    },
  };
}

export default async function TemplatesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const prefill = sp?.prefill === "1";
  const isAr = locale === "ar";

  // Admin-only preview: work-in-progress templates are live for admins (so they
  // can finish & test them) but show as "coming soon" to everyone else.
  let isAdmin = false;
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    isAdmin = !!email && ADMIN_EMAILS.includes(email);
  } catch {
    isAdmin = false;
  }

  const cur = await getCurrency();
  const priceLabel = fmtPrice(PRICE_KWD, cur, isAr ? "ar" : "en");

  const t = {
    title: isAr ? "اختر القالب المناسب لك" : "Pick the right template",
    subtitle: isAr
      ? "قوالب مصممة لكل مهنة — اختر واحدًا وابدأ خلال دقائق."
      : "Profession-specific templates — pick one and launch in minutes.",
    priceLine: isAr
      ? `مجاني للبناء والمعاينة. ادفع ${priceLabel} فقط عند النشر.`
      : `Free to build and preview. Pay ${priceLabel} only when you publish.`,
    noSub: isAr ? "بدون رسوم شهرية" : "No monthly fees",
    securePay: isAr ? "دفع آمن (K-NET، Apple Pay)" : "Secure payment (K-NET, Apple Pay)",
    usd: "~$16 USD",
    stickyOneTime: isAr ? "سنوي" : "Annual",
    available: isAr ? "متاح الآن" : "Available now",
    adminPreview: isAr ? "معاينة المشرف" : "Admin preview",
    adminPreviewHint: isAr
      ? "مرئي لك وحدك حتى يكتمل — قيد الإنجاز."
      : "Visible to you only until it's finished — work in progress.",
    soon: isAr ? "قريبًا" : "Coming soon",
    preview: isAr ? "معاينة مباشرة" : "Live preview",
    use: isAr ? "ابدأ الآن" : "Use this template",
    useNav: isAr ? "ابدأ الآن" : "Get started",
    targets: isAr ? "مناسب لـ" : "For",
    backHome: isAr ? "العودة للرئيسية" : "Back to home",
    howTitle: isAr ? "كيف يعمل؟" : "How it works",
    step1: isAr ? "اختر القالب" : "Pick a template",
    step2: isAr ? "أضف بياناتك" : "Fill in your details",
    step3: isAr ? "انشر بضغطة" : "Publish with one click",
    oneTime: isAr
      ? `دفعة سنوية · ${priceLabel} · بدون رسوم شهرية`
      : `Annual plan · ${priceLabel} · No monthly fees`,
    prefillBanner: isAr
      ? "تم حفظ بياناتك — اختر قالبًا للمتابعة."
      : "Your details are saved — pick a template to continue.",
    comingSoonTitle: isAr ? "قوالب قادمة قريبًا" : "More templates coming soon",
    notifyHint: isAr
      ? "نعمل على هذه القوالب — تابعنا للتحديثات."
      : "We're working on these — follow us for updates.",
  };

  return (
    <div className="min-h-screen bg-[var(--land-bg)] text-[var(--land-bright)]">
      <nav className="border-b border-[var(--land-border)]/50 bg-[var(--land-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {isAr ? "بورتفوليو برو" : "Portfolio Pro"}
          </Link>
          <Link
            href="/build"
            className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
          >
            {t.useNav}
          </Link>
        </div>
      </nav>

      <header className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t.title}</h1>
        <p className="mt-4 text-lg text-[var(--land-body)] max-w-2xl mx-auto">
          {t.subtitle}{" "}
          <span className="text-[var(--land-bright)]">{t.priceLine}</span>
        </p>
        {/* Trust signals */}
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--land-body)]">
          {[t.noSub, t.securePay].map((badge) => (
            <li key={badge} className="flex items-center gap-1.5">
              <span className="text-[var(--land-accent)]">✓</span>
              {badge}
            </li>
          ))}
        </ul>
      </header>

      {/* ── How it works (compact) ────────────── */}
      <div className="px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)] px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--land-accent)] text-xs font-bold">1</span>
                  <span className="text-[var(--land-body)]">{t.step1}</span>
                </div>
                <span className="text-[var(--land-border)] hidden sm:inline">→</span>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--land-accent)] text-xs font-bold">2</span>
                  <span className="text-[var(--land-body)]">{t.step2}</span>
                </div>
                <span className="text-[var(--land-border)] hidden sm:inline">→</span>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--land-accent)] text-xs font-bold">3</span>
                  <span className="text-[var(--land-body)]">{t.step3}</span>
                </div>
              </div>
              <span className="text-xs text-[var(--land-accent)] font-medium whitespace-nowrap">
                {t.oneTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="px-6 pb-24">
        {prefill && (
          <div className="mx-auto mb-8 max-w-7xl">
            <div
              className="flex items-center gap-2 rounded-xl border border-[var(--land-accent)]/30 bg-[var(--land-accent)]/10 px-5 py-3 text-sm text-[var(--land-bright)]"
              role="status"
            >
              <span className="text-[var(--land-accent)]">✓</span>
              {t.prefillBanner}
            </div>
          </div>
        )}

        {/* Featured: available templates */}
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {TEMPLATES.filter((tpl) => isTemplateAvailableFor(tpl, { isAdmin })).map((tpl) => {
            const isAdminPreview = tpl.adminPreview && !tpl.available;
            const mockup = MOCKUP_IMAGES[tpl.id];
            const ar = isAr ? AR_TEMPLATE[tpl.id] : undefined;
            const tplName = ar?.name ?? tpl.name;
            const tplDesc = ar?.description ?? tpl.description;
            const tplTargets = ar?.targets ?? tpl.targetProfessions;
            return (
            <article
              key={tpl.id}
              className="group rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)] overflow-hidden flex flex-col"
            >
              {/* Template preview */}
              <div className="relative">
                {mockup ? (
                  <Image
                    src={mockup}
                    alt={`${tplName} template preview`}
                    width={1280}
                    height={900}
                    sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-auto"
                    quality={85}
                  />
                ) : (
                  <div
                    className="aspect-[16/10]"
                    style={{
                      background: `linear-gradient(135deg, ${
                        tpl.colors.bg ?? "#0f172a"
                      }, ${tpl.colors.bgDeep ?? tpl.colors.bg ?? "#020617"})`,
                    }}
                  />
                )}
                <div className="absolute top-3 start-3 flex gap-1.5">
                  {[tpl.colors.primary, tpl.colors.secondary, tpl.colors.accent]
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((c, i) => (
                      <span
                        key={i}
                        className="h-3 w-3 rounded-full ring-1 ring-white/30"
                        style={{ background: c }}
                      />
                    ))}
                </div>
                <div className="absolute top-3 end-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-1 backdrop-blur-sm ${
                      isAdminPreview
                        ? "bg-[var(--land-bg)]/80 text-[var(--land-bright)] ring-1 ring-[var(--land-accent)]"
                        : "bg-[var(--land-bg)]/80 text-[var(--land-accent)]"
                    }`}
                  >
                    {isAdminPreview ? t.adminPreview : t.available}
                  </span>
                </div>
                {tpl.demoUrl && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {t.preview}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col grow">
                <h2 className="text-lg font-semibold">{tplName}</h2>
                <p className="mt-1.5 text-sm text-[var(--land-body)] line-clamp-2">
                  {tplDesc}
                </p>
                {isAdminPreview && (
                  <p className="mt-2 text-xs text-[var(--land-accent)]">
                    {t.adminPreviewHint}
                  </p>
                )}
                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--land-muted)]">
                    {t.targets}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--land-bright)]">
                    {tplTargets.slice(0, 3).join(" · ")}
                    {tplTargets.length > 3 ? " …" : ""}
                  </p>
                </div>
                <div className="mt-auto pt-4 flex gap-2">
                  <Link
                    href="/build"
                    className="flex-1 text-center rounded-lg bg-[var(--land-accent)] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
                  >
                    {t.use}
                  </Link>
                  {tpl.demoUrl ? (
                    <a
                      href={tpl.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-lg px-3 py-2.5 text-sm text-[var(--land-body)] hover:text-[var(--land-bright)] transition-colors"
                    >
                      {t.preview} &rarr;
                    </a>
                  ) : (
                    <span className="flex-1 text-center rounded-lg px-3 py-2.5 text-sm text-[var(--land-muted)] cursor-not-allowed">
                      {t.preview}
                    </span>
                  )}
                </div>
              </div>
            </article>
            );
          })}
        </div>

        {/* Coming soon templates — visually dimmed */}
        <div className="mx-auto max-w-7xl mt-16">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--land-muted)]">
              {t.comingSoonTitle}
            </h2>
            <p className="mt-1 text-sm text-[var(--land-muted)]/70">
              {t.notifyHint}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.filter((tpl) => !isTemplateAvailableFor(tpl, { isAdmin })).map((tpl) => {
              const ar = isAr ? AR_TEMPLATE[tpl.id] : undefined;
              const tplName = ar?.name ?? tpl.name;
              const tplDesc = ar?.description ?? tpl.description;
              const tplTargets = ar?.targets ?? tpl.targetProfessions;
              return (
              <article
                key={tpl.id}
                className="rounded-xl border border-[var(--land-border)]/50 bg-[var(--land-surface)] overflow-hidden flex flex-col opacity-60"
              >
                <div
                  className="aspect-[16/10] relative"
                  style={{
                    background: `linear-gradient(135deg, ${
                      tpl.colors.bg ?? "#0f172a"
                    }, ${tpl.colors.bgDeep ?? tpl.colors.bg ?? "#020617"})`,
                  }}
                >
                  <div className="absolute top-3 start-3 flex gap-1.5">
                    {[tpl.colors.primary, tpl.colors.secondary, tpl.colors.accent]
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((c, i) => (
                        <span
                          key={i}
                          className="h-3 w-3 rounded-full ring-1 ring-white/20"
                          style={{ background: c }}
                        />
                      ))}
                  </div>
                  <div className="absolute top-3 end-3">
                    <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-1 bg-[var(--land-surface-raised)] text-[var(--land-muted)]">
                      {t.soon}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col grow">
                  <h3 className="text-base font-semibold">{tplName}</h3>
                  <p className="mt-1 text-xs text-[var(--land-body)] line-clamp-2">
                    {tplDesc}
                  </p>
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--land-muted)]">
                      {t.targets}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--land-body)]">
                      {tplTargets.slice(0, 2).join(" · ")}
                      {tplTargets.length > 2 ? " …" : ""}
                    </p>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
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

      {/* Sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--land-border)] bg-[var(--land-bg)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[var(--land-accent)]">
              {priceLabel}
            </span>
            <span className="text-sm text-[var(--land-muted)]">{t.usd}</span>
            <span className="hidden text-xs text-[var(--land-muted)] sm:inline">
              · {t.stickyOneTime}
            </span>
          </div>
          <Link
            href="/build"
            className="rounded-lg bg-[var(--land-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)]"
          >
            {t.useNav}
          </Link>
        </div>
      </div>
    </div>
  );
}
