import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Palette, Languages, FileDown, Globe, Plus, Eye } from "lucide-react";
import Image from "next/image";
import { HOSTING_ENABLED } from "@/lib/flags";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Resolve locale from the route segment and pin it for next-intl so this
  // page is rendered statically at build time instead of dynamic SSR per request.
  const { locale } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("common");
  const isRTL = locale === "ar";
  const otherLocale = isRTL ? "en" : "ar";
  const otherLabel = isRTL ? "English" : "عربي";

  const faqs = isRTL
    ? [
        {
          q: "هل يحتاج البورتفوليو إلى تجديد سنوي؟",
          a: "لا. الدفعة لمرة واحدة فقط (٤.٩٠٠ دك). بدون اشتراكات، بدون تجديد، بدون رسوم خفية.",
        },
        {
          q: "هل يمكنني التعديل بعد النشر؟",
          a: "نعم. يتحدّث بورتفوليوك فورًا عند أي تعديل تجريه من لوحة التحكم.",
        },
        {
          q: "ما طرق الدفع المتاحة؟",
          a: "K-Net، Visa، Mastercard، Apple Pay، وكل الطرق المدعومة عبر MyFatoorah.",
        },
        {
          q: "هل بياناتي آمنة؟",
          a: "بالتأكيد. نستخدم تشفيرًا بمعايير الصناعة ولا نشارك معلوماتك أبدًا.",
        },
        {
          q: "هل يدعم اللغة العربية؟",
          a: "كل قالب يأتي بتصميم RTL عربي مصمم من الصفر — ليس ترجمة ولا انعكاسًا. الخطوط والمسافات واتجاه القراءة كلها محسّنة للعربية.",
        },
        {
          q: "كيف أبدأ؟",
          a: HOSTING_ENABLED
            ? "اختر قالبًا، أضف تفاصيلك بالعربي أو الإنجليزي، واضغط نشر. يصبح بورتفوليوك حيًا فورًا برابط خاص."
            : "اختر قالبًا، أضف تفاصيلك بالعربي أو الإنجليزي، ثم حمّل بورتفوليوك كملف PDF احترافي.",
        },
        {
          q: "ماذا لو لم يعجبني بورتفوليوي؟",
          a: "يمكنك التعديل في أي وقت من لوحة التحكم حتى يصبح كما تريده تمامًا.",
        },
        {
          q: "هل يمكنني تغيير القالب لاحقًا؟",
          a: "نعم. تنتقل بياناتك بين القوالب، فتستطيع تغيير التصميم دون إعادة إدخال المعلومات.",
        },
        {
          q: "هل أحتاج مهارات تقنية؟",
          a: "إطلاقًا. إذا كنت تستطيع ملء نموذج، تستطيع بناء بورتفوليو.",
        },
      ]
    : [
        {
          q: "Do I need to renew yearly?",
          a: "No. Portfolio Pro is a one-time payment of 4.900 KD. No subscriptions, no renewals, no hidden fees.",
        },
        {
          q: HOSTING_ENABLED ? "Can I edit after publishing?" : "Can I edit my portfolio?",
          a: HOSTING_ENABLED
            ? "Yes. Your portfolio updates instantly whenever you make changes from your dashboard."
            : "Yes. Update your details anytime from your dashboard, then download a fresh PDF.",
        },
        {
          q: "Which payment methods are accepted?",
          a: "K-NET, Visa, Mastercard, Apple Pay, and all MyFatoorah-supported methods.",
        },
        {
          q: "Is my data secure?",
          a: "Absolutely. We use industry-standard encryption and never share your information.",
        },
        {
          q: "Does it support Arabic?",
          a: "Every template has a proper RTL Arabic layout designed from scratch — not translated, not mirrored. Typography, spacing, and reading direction are all optimized for Arabic.",
        },
        {
          q: "How do I get started?",
          a: HOSTING_ENABLED
            ? "Pick a template, fill in your details in Arabic or English, and click publish. Your portfolio goes live instantly with its own URL."
            : "Pick a template, fill in your details in Arabic or English, and download your portfolio as a professional PDF.",
        },
        {
          q: "What if I don't like my portfolio?",
          a: "You can edit it anytime from your dashboard until it's exactly the way you want it.",
        },
        {
          q: "Can I switch templates later?",
          a: "Yes. Your data transfers between templates, so you can switch designs without re-entering information.",
        },
        {
          q: "Do I need technical skills?",
          a: "None at all. If you can fill out a form, you can build a portfolio.",
        },
      ];

  const regions = [
    { flag: "🇰🇼", en: "Kuwait", ar: "الكويت" },
    { flag: "🇦🇪", en: "UAE", ar: "الإمارات" },
    { flag: "🇸🇦", en: "Saudi Arabia", ar: "السعودية" },
  ];

  return (
    <div className="min-h-screen bg-[var(--land-bg)] text-[var(--land-bright)] land-grain">
      {/* ── Navbar ─────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--land-border)]/50 bg-[var(--land-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight hover:text-[var(--land-accent)] transition-colors">
            {tc("appName")}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              locale={otherLocale}
              className="text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)] transition-colors"
            >
              {otherLabel}
            </Link>
            <Link
              href="/sign-in"
              className="hidden sm:inline text-sm text-[var(--land-body)] hover:text-[var(--land-bright)] transition-colors"
            >
              {tc("signIn")}
            </Link>
            <Link
              href="/templates"
              className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
            >
              {tc("getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        {/* Hero background image */}
        <Image
          src="/landing/hero-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-40 pointer-events-none"
          priority
          quality={60}
        />
        {/* Background glows — vivid and dramatic */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at ${isRTL ? "25%" : "75%"} 35%, oklch(0.25 0.12 160 / 0.7), transparent 70%), radial-gradient(circle at ${isRTL ? "85%" : "15%"} 85%, oklch(0.2 0.08 160 / 0.4), transparent 50%), radial-gradient(circle at 50% 0%, oklch(0.15 0.05 160 / 0.3), transparent 60%)`,
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--land-border) 1px, transparent 1px), linear-gradient(90deg, var(--land-border) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-16 lg:pt-0">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.2fr] items-center gap-12 lg:gap-20">
            <div className="land-stagger">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-emerald-400">
                {isRTL
                  ? "منشئ بورتفوليو لمحترفي الخليج"
                  : "Portfolio builder for GCC professionals"}
              </p>
              <h1
                className="mt-4 font-extrabold leading-[1] tracking-tighter"
                style={{ fontSize: "clamp(3rem, 6.5vw, 5.5rem)" }}
              >
                {isRTL
                  ? "البورتفوليو الذي تستحقه مسيرتك"
                  : "The portfolio your career has earned"}
              </h1>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-[var(--land-body)]">
                {isRTL
                  ? "بورتفوليوهات احترافية لمهندسي النفط والغاز والقيادات والمتخصصين في الكويت. ثنائية اللغة. جاهزة للطباعة. جاهزة في دقائق."
                  : "Professional portfolios for Kuwait's oil and gas engineers, corporate leaders, and technical specialists. Bilingual. Print-ready. Live in minutes."}
              </p>
              <div className="mt-10 flex flex-col items-start gap-4">
                <Link
                  href="/templates"
                  className="land-cta-glow inline-block rounded-xl bg-[var(--land-accent)] px-10 py-4 text-lg font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
                >
                  {isRTL ? "ابنِ بورتفوليوك" : "Build yours"}
                </Link>
                <a
                  href="#templates"
                  className="text-sm text-[var(--land-body)] hover:text-[var(--land-accent)] transition-colors"
                >
                  {isRTL ? "شاهد العروض المباشرة ←" : "View live demos →"}
                </a>
              </div>
              <p className="mt-5 text-sm text-[var(--land-muted)]">
                {isRTL ? (
                  <>
                    دفعة واحدة{" "}
                    <span className="font-semibold text-[var(--land-accent)]">
                      ٤.٩٠٠ دك
                    </span>{" "}
                    (~١٦ دولار). بدون اشتراك. بدون تجديد.
                  </>
                ) : (
                  <>
                    One-time payment of{" "}
                    <span className="font-semibold text-[var(--land-accent)]">
                      4.900 KD
                    </span>{" "}
                    (~$16 USD). No subscription. No renewals.
                  </>
                )}
              </p>
              {/* Trust signals */}
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--land-body)]">
                {(isRTL
                  ? ["بدون اشتراك", "دفع آمن (K-NET، Apple Pay)"]
                  : ["No subscription", "Secure payment (K-NET, Apple Pay)"]
                ).map((b) => (
                  <li key={b} className="flex items-center gap-1.5">
                    <span className="text-[var(--land-accent)]">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="land-visual w-full max-w-xl">
              {/* Desktop: stacked cards effect */}
              <div className="hidden lg:block relative land-mockup-float" style={{ perspective: "1200px" }}>
                {/* Ambient glow behind stack */}
                <div
                  className="absolute -inset-16 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 70% at center, oklch(0.35 0.12 163 / 0.25), transparent 70%)`,
                  }}
                />
                {/* Back card: Engineer (rotated, scaled) */}
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden border border-[var(--land-border)] opacity-40"
                  style={{
                    transform: isRTL
                      ? "translate(24px, 20px) rotate(3deg) scale(0.93)"
                      : "translate(-24px, 20px) rotate(-3deg) scale(0.93)",
                    zIndex: 1,
                  }}
                >
                  <Image
                    src="/landing/mockup-engineer.jpg"
                    alt=""
                    width={1200}
                    height={800}
                    sizes="(min-width: 1024px) 576px, 1px"
                    className="w-full h-auto"
                    quality={75}
                  />
                </div>
                {/* Front card: Corporate (straight, prominent) */}
                <div
                  className="relative rounded-xl overflow-hidden border border-[var(--land-border)]"
                  style={{
                    transform: isRTL
                      ? "rotateY(3deg) rotateX(1deg)"
                      : "rotateY(-3deg) rotateX(1deg)",
                    zIndex: 2,
                  }}
                >
                  <Image
                    src="/landing/mockup-corporate.jpg"
                    alt="Corporate portfolio template preview"
                    width={1200}
                    height={800}
                    sizes="(min-width: 1024px) 576px, 1px"
                    className="w-full h-auto"
                    priority
                    quality={90}
                  />
                  <span className="absolute top-3 end-3 z-10 flex items-center gap-1.5 rounded-full border border-[var(--land-accent)]/30 bg-[var(--land-bg)]/80 px-2.5 py-1 text-[10px] font-medium text-[var(--land-accent)] backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--land-accent)]" />
                    {isRTL ? "معاينة مباشرة" : "Live Preview"}
                  </span>
                </div>
              </div>
              {/* Mobile: single image */}
              <div className="lg:hidden rounded-xl overflow-hidden border border-[var(--land-border)]">
                <Image
                  src="/landing/mockup-corporate.jpg"
                  alt="Corporate portfolio template preview"
                  width={1200}
                  height={800}
                  sizes="(min-width: 1024px) 1px, 100vw"
                  className="w-full h-auto"
                  priority
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ───────────────────── */}
      <div className="border-y border-[var(--land-border)]/50 bg-[#0f1612] py-6 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Desktop: static centered */}
          <div className="hidden flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:flex">
            <p className="text-sm text-[var(--land-muted)]">
              {isRTL ? "موثوق من محترفين في" : "Trusted by professionals in"}
            </p>
            {regions.map((r) => (
              <span
                key={r.en}
                className="flex items-center gap-2 text-sm font-medium text-[var(--land-body)]"
              >
                <span className="text-base">{r.flag}</span>
                {isRTL ? r.ar : r.en}
              </span>
            ))}
          </div>
          {/* Mobile: marquee */}
          <div className="overflow-hidden sm:hidden">
            <p className="mb-3 text-center text-sm text-[var(--land-muted)]">
              {isRTL ? "موثوق من محترفين في" : "Trusted by professionals in"}
            </p>
            <div className="land-marquee flex w-max gap-8">
              {[...regions, ...regions, ...regions, ...regions].map((r, i) => (
                <span
                  key={i}
                  className="flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--land-body)]"
                >
                  <span className="text-base">{r.flag}</span>
                  {isRTL ? r.ar : r.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Template showcase ──────────────────── */}
      <section id="templates" className="scroll-mt-20 pt-32 pb-24 px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium tracking-widest uppercase text-[var(--land-accent)]">
              {isRTL ? "القوالب" : "Templates"}
            </p>
            <h2
              className="mt-3 font-extrabold tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              {isRTL ? "شاهد ما ستبنيه" : "See what you'll build"}
            </h2>
            <p className="mt-4 max-w-lg text-lg text-[var(--land-body)]">
              {isRTL
                ? "قوالب مصممة بعناية لمختلف المهن. كل قالب مختلف تمامًا عن الآخر."
                : "Hand-crafted templates for different professions. Each one is a completely different design."}
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto max-w-7xl mt-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            <ScrollReveal>
              <div className="group">
                <div className="relative rounded-xl overflow-hidden border border-[var(--land-border)] transition-all duration-500 group-hover:translate-y-[-2px] group-hover:border-[var(--land-accent)]/30">
                  <Image
                    src="/landing/mockup-corporate.jpg"
                    alt="Corporate portfolio template"
                    width={1200}
                    height={800}
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-auto"
                    quality={90}
                  />
                  <span className="absolute top-3 start-3 z-10 rounded-full border border-[var(--land-accent)]/30 bg-[var(--land-bg)]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--land-accent)] backdrop-blur">
                    {isRTL ? "مؤسسي" : "Corporate"}
                  </span>
                  <div className="absolute inset-0 bg-[oklch(0.08_0.02_260_/_0)] group-hover:bg-[oklch(0.08_0.02_260_/_0.6)] transition-all duration-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {isRTL ? "عرض مباشر" : "View live demo"}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold">
                    {isRTL ? "بورتفوليو مؤسسي" : "Corporate Portfolio"}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--land-body)] max-w-md">
                    {isRTL
                      ? "تصميم مؤسسي بألوان كحلي وذهبي. مؤشرات الإنجاز، الخط الزمني، الشهادات، التوصيات، وPDF جاهز للطباعة."
                      : "Navy and gold institutional design. Achievement metrics, career timeline, credentials, endorsements, and print-ready PDF."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <a
                      href="/demo/corporate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--land-accent)] hover:text-[var(--land-accent-hover)] transition-colors"
                    >
                      {isRTL ? "عرض مباشر ←" : "View live demo \u2192"}
                    </a>
                    <Link
                      href="/dashboard/new?template=corporate"
                      className="rounded-lg border border-[var(--land-accent)]/50 px-4 py-2 text-sm font-medium text-[var(--land-accent)] transition-colors hover:bg-[var(--land-accent)]/10"
                    >
                      {isRTL ? "استخدم هذا القالب" : "Use this template"}
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="group h-full">
                <div className="relative rounded-xl overflow-hidden border border-[var(--land-border)] transition-all duration-500 group-hover:translate-y-[-2px] group-hover:border-[var(--land-accent)]/30">
                  <Image
                    src="/landing/mockup-engineer.jpg"
                    alt="Engineer portfolio template"
                    width={1200}
                    height={800}
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-auto"
                    quality={90}
                  />
                  <span className="absolute top-3 start-3 z-10 rounded-full border border-[var(--land-accent)]/30 bg-[var(--land-bg)]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--land-accent)] backdrop-blur">
                    {isRTL ? "هندسي" : "Engineering"}
                  </span>
                  <div className="absolute inset-0 bg-[oklch(0.08_0.02_260_/_0)] group-hover:bg-[oklch(0.08_0.02_260_/_0.6)] transition-all duration-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {isRTL ? "عرض مباشر" : "View live demo"}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold">
                    {isRTL ? "بورتفوليو هندسي" : "Engineer Portfolio"}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--land-body)] max-w-md">
                    {isRTL
                      ? "تصميم بسيط يركز على المشاريع. بطاقات مشاريع، مهارات تقنية، شهادات، وصفحات تفصيلية."
                      : "Minimal, project-forward design. Project cards, grouped technical skills, certifications, and detail pages."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <a
                      href="/demo/engineer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--land-accent)] hover:text-[var(--land-accent-hover)] transition-colors"
                    >
                      {isRTL ? "عرض مباشر ←" : "View live demo \u2192"}
                    </a>
                    <Link
                      href="/dashboard/new?template=engineer"
                      className="rounded-lg border border-[var(--land-accent)]/50 px-4 py-2 text-sm font-medium text-[var(--land-accent)] transition-colors hover:bg-[var(--land-accent)]/10"
                    >
                      {isRTL ? "استخدم هذا القالب" : "Use this template"}
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Creative template */}
            <ScrollReveal delay={300}>
              <div className="group h-full">
                <div className="relative rounded-xl overflow-hidden border border-[var(--land-border)] transition-all duration-500 group-hover:translate-y-[-2px] group-hover:border-[var(--land-accent)]/30">
                  <div
                    className="flex aspect-[16/10] items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #0a0a0a, #050505)" }}
                  >
                    <span
                      className="text-2xl font-bold tracking-tight"
                      style={{ color: "#ec4899", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
                    >
                      {isRTL ? "إبداعي" : "Creative"}
                    </span>
                  </div>
                  <span className="absolute top-3 start-3 z-10 rounded-full border border-[var(--land-accent)]/30 bg-[var(--land-bg)]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--land-accent)] backdrop-blur">
                    {isRTL ? "إبداعي" : "Creative"}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                    <span className="flex items-center gap-2 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Eye className="h-4 w-4" />
                      {isRTL ? "معاينة" : "Preview"}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold">
                    {isRTL ? "بورتفوليو إبداعي" : "Creative Portfolio"}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--land-body)] max-w-md">
                    {isRTL
                      ? "تصميم جريء يركز على العمل المرئي. معارض ماسونري، سرد العملية، وشبكات إتقان الأدوات."
                      : "Bold, work-forward design. Masonry galleries, process storytelling, and tool-proficiency grids."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a
                      href="/demo/creative"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--land-accent)] hover:text-[var(--land-accent-hover)] transition-colors"
                    >
                      {isRTL ? "عرض مباشر ←" : "View live demo →"}
                    </a>
                    <Link
                      href="/dashboard/new?template=creative"
                      className="rounded-lg border border-[var(--land-accent)]/50 px-4 py-2 text-sm font-medium text-[var(--land-accent)] transition-colors hover:bg-[var(--land-accent)]/10"
                    >
                      {isRTL ? "استخدم هذا القالب" : "Use this template"}
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Request a template */}
            <ScrollReveal delay={400}>
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--land-border)] bg-[var(--land-surface)]/40 p-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--land-border)] text-[var(--land-muted)]">
                  <Plus className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">
                  {isRTL ? "تحتاج مهنة أخرى؟" : "Need a different profession?"}
                </h3>
                <p className="mt-2 text-sm text-[var(--land-body)]">
                  {isRTL
                    ? "أخبرنا بما تحتاجه — نضيف قوالب متخصصة بناءً على الطلب."
                    : "Tell us what you need — we add profession-specific templates based on demand."}
                </p>
                <a
                  href="mailto:support@portfolio-trimind.com?subject=Template%20request"
                  className="mt-4 text-sm font-medium text-[var(--land-accent)] hover:underline"
                >
                  {isRTL ? "اطلب قالبًا ←" : "Request a template →"}
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────── */}
      <HowItWorks isRTL={isRTL} />

      {/* ── Features (2x2 grid) ────────────────── */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--land-accent-subtle)] text-[var(--land-accent)]">
                  <Palette className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">
                  {isRTL
                    ? "كل قالب مصمم يدويًا، ليس مولّد."
                    : "Every template designed, not generated."}
                </h3>
                <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "من مجالس الشركات إلى تقارير المشاريع الهندسية. كل قالب مصنوع يدويًا لمهنة محددة، ليس نسخًا متكررة بألوان مختلفة."
                    : "From corporate boardrooms to engineering field reports. Each template is hand-crafted for a specific profession, not clones with different colors."}
                </p>
              </div>

              {/* Feature 2 — bilingual, with split-screen proof */}
              <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--land-accent-subtle)] text-[var(--land-accent)]">
                  <Languages className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">
                  {isRTL
                    ? "عربي وإنجليزي. أصلي، ليس ترجمة."
                    : "Arabic and English. Native, not translated."}
                </h3>
                <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "كل قالب بتصميم عربي RTL أصيل — ليس مجرد صفحة إنجليزية معكوسة. الخطوط والمسافات واتجاه القراءة كلها مصممة للعربي."
                    : "Every template has a proper RTL Arabic layout, not a mirrored English page. Typography, spacing, and reading direction are all designed for Arabic."}
                </p>
                <div className="mt-5 flex gap-3">
                  {/* English LTR */}
                  <div className="flex-1 overflow-hidden rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)]">
                    <div className="border-b border-[var(--land-border)] px-2.5 py-1 text-[9px] text-[var(--land-muted)]">
                      English (LTR)
                    </div>
                    <div className="space-y-1.5 p-2.5">
                      <div className="h-2 w-16 rounded-full bg-[oklch(0.8_0.01_250)]" />
                      <div className="h-1.5 w-full rounded-full bg-[var(--land-border)]" />
                      <div className="h-1.5 w-4/5 rounded-full bg-[var(--land-border)]" />
                    </div>
                  </div>
                  {/* Arabic RTL */}
                  <div className="flex-1 overflow-hidden rounded-lg border border-[var(--land-border)] bg-[var(--land-bg)]" dir="rtl">
                    <div className="border-b border-[var(--land-border)] px-2.5 py-1 text-[9px] text-[var(--land-muted)]">
                      العربية (RTL)
                    </div>
                    <div className="space-y-1.5 p-2.5">
                      <div className="ms-0 h-2 w-16 rounded-full bg-[oklch(0.8_0.01_250)]" />
                      <div className="h-1.5 w-full rounded-full bg-[var(--land-border)]" />
                      <div className="h-1.5 w-4/5 rounded-full bg-[var(--land-border)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--land-accent-subtle)] text-[var(--land-accent)]">
                  <FileDown className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">
                  {HOSTING_ENABLED
                    ? isRTL
                      ? "سيرة ذاتية PDF مع باركود"
                      : "CV page with scannable barcode"
                    : isRTL
                      ? "سيرة ذاتية PDF احترافية"
                      : "Professional PDF download"}
                </h3>
                <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed">
                  {HOSTING_ENABLED
                    ? isRTL
                      ? "حمّل صفحة سيرة ذاتية احترافية كملف PDF مع باركود يوجّه مباشرة إلى بورتفوليوك الحي."
                      : "Download a professional CV page as PDF with a scannable barcode that links directly to your live portfolio."
                    : isRTL
                      ? "حمّل بورتفوليوك كصفحة سيرة ذاتية احترافية بصيغة PDF جاهزة للطباعة والمشاركة."
                      : "Download your portfolio as a polished, print-ready PDF you can share anywhere."}
                </p>
              </div>

              {/* Feature 4 — hosted URL (only while hosting is enabled) */}
              {HOSTING_ENABLED && (
              <div className="rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--land-accent-subtle)] text-[var(--land-accent)]">
                  <Globe className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">
                  {isRTL ? "صفحة حيّة محدّثة دائمًا" : "A live page that's always current"}
                </h3>
                <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "بورتفوليوك يحصل على رابط خاص مستضاف. حدّثه متى شئت من لوحة التحكم — التغييرات تظهر فورًا."
                    : "Your portfolio gets its own hosted URL. Update anytime from your dashboard; changes appear instantly."}
                </p>
              </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Testimonials (built, hidden until real) ── */}
      <Testimonials isRTL={isRTL} />

      {/* ── Pricing ────────────────────────────── */}
      <ScrollReveal>
        <section className="relative py-24 px-6 bg-[var(--land-surface-raised)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--land-accent)] to-transparent opacity-40" />
          <div className="mx-auto max-w-3xl lg:grid lg:grid-cols-[1fr_auto] gap-16 items-start">
            <div>
              <h2
                className="font-bold tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                {isRTL ? "سعر واحد. بدون مفاجآت." : "One price. No surprises."}
              </h2>
              <p className="mt-4 text-[var(--land-body)] leading-relaxed max-w-md">
                {isRTL ? (
                  <>
                    كل شيء مشمول مقابل{" "}
                    <span className="font-semibold text-[var(--land-bright)]">
                      ٤.٩٠٠ دك
                    </span>{" "}
                    للبورتفوليو الواحد (~١٦ دولار). دفعة واحدة. بدون اشتراكات.
                    بدون تجديد.
                  </>
                ) : (
                  <>
                    Everything included for{" "}
                    <span className="font-semibold text-[var(--land-bright)]">
                      4.900 KD
                    </span>{" "}
                    per portfolio (~$16 USD). One-time payment. No subscriptions.
                    No renewals.
                  </>
                )}
              </p>
              <div className="mt-8 grid grid-cols-1 gap-y-3 text-sm text-[var(--land-body)] sm:grid-cols-2 sm:gap-x-6">
                {(isRTL
                  ? [
                      HOSTING_ENABLED ? "رابط بورتفوليو مستضاف" : null,
                      "عربي + إنجليزي",
                      "تصدير PDF جاهز للطباعة",
                      HOSTING_ENABLED
                        ? "صفحة سيرة ذاتية مع باركود"
                        : "تحميل PDF احترافي",
                      "ثيمات ألوان مخصصة",
                      "رفع صورة شخصية",
                      "تحديثات فورية",
                      "وصول لمرة واحدة",
                    ]
                  : [
                      HOSTING_ENABLED ? "Hosted portfolio URL" : null,
                      "Arabic + English bilingual",
                      "Print-optimized PDF export",
                      HOSTING_ENABLED
                        ? "CV page with scannable barcode"
                        : "Professional PDF download",
                      "Custom color themes",
                      "Photo upload",
                      "Instant updates",
                      "One-time access",
                    ]
                )
                  .filter((item): item is string => Boolean(item))
                  .map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="shrink-0 text-[var(--land-accent)]">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Why one-time? */}
              <div className="mt-8 rounded-xl border border-[var(--land-accent)]/20 bg-[var(--land-accent-subtle)] p-5">
                <h3 className="text-sm font-semibold text-[var(--land-accent)]">
                  {isRTL ? "لماذا دفعة واحدة؟" : "Why One-Time?"}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--land-body)]">
                  {isRTL
                    ? "نؤمن أن قصة مسيرتك لا يجب أن تحمل رسومًا شهرية. ادفع مرة واحدة، وامتلكها للأبد."
                    : "We believe your career story shouldn't have a monthly fee. Pay once, own forever."}
                </p>
              </div>
              <div className="mt-10">
                <Link
                  href="/templates"
                  className="inline-block rounded-lg bg-[var(--land-accent)] px-8 py-3.5 text-base font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
                >
                  {isRTL ? "ابنِ بورتفوليوك" : "Build yours"}
                </Link>
                <p className="mt-3 text-xs text-[var(--land-muted)]">
                  {isRTL
                    ? "دفعة واحدة · ٤.٩٠٠ دك · بدون تجديد."
                    : "One-time payment · 4.900 KD · No renewals."}
                </p>
                {/* Payment trust icons */}
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <p className="text-[10px] text-[var(--land-muted)] tracking-wide uppercase">
                    {isRTL ? "ادفع عبر" : "Pay with"}
                  </p>
                  <div className="flex items-center gap-3">
                    {/* K-Net */}
                    <span className="text-xs font-bold text-[var(--land-body)] tracking-tight">K-NET</span>
                    {/* Visa */}
                    <svg className="h-4 text-[var(--land-body)]" viewBox="0 0 48 16" fill="currentColor"><path d="M19.6 1.2l-3.5 13.6h-2.8l3.5-13.6h2.8zm14.3 8.8l1.5-4 .8 4h-2.3zm3.1 4.8h2.6l-2.3-13.6h-2.4c-.5 0-1 .3-1.2.8l-4.2 12.8h2.9l.6-1.6h3.6l.4 1.6zm-7.5-4.4c0-3.6-5-3.8-5-5.4 0-.5.5-1 1.5-1.1.5 0 1.9-.1 3.4.6l.6-2.8c-.8-.3-1.9-.6-3.2-.6-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.3.7 1.8 1.1 1.8 1.7 0 .9-1.1 1.3-2 1.3-1.7 0-2.7-.5-3.5-.8l-.6 2.9c.8.4 2.3.7 3.8.7 3.6 0 6-1.8 6-4.5zm-14.2-9.2l-5.6 13.6h-3l-2.7-10.9c-.2-.6-.3-.8-.8-1.1-.9-.4-2.3-.8-3.5-1.1l.1-.5h4.7c.6 0 1.1.4 1.3 1.1l1.2 6.1 2.8-7.2h2.9z" /></svg>
                    {/* Mastercard */}
                    <svg className="h-4" viewBox="0 0 32 20" fill="none"><circle cx="12" cy="10" r="8" fill="oklch(0.55 0.02 20)" /><circle cx="20" cy="10" r="8" fill="oklch(0.6 0.08 65)" /><path d="M16 4.7a7.96 7.96 0 010 10.6 7.96 7.96 0 000-10.6z" fill="oklch(0.58 0.06 40)" /></svg>
                    {/* Apple Pay */}
                    <span className="text-xs font-medium text-[var(--land-body)]">Apple Pay</span>
                  </div>
                  <div className="h-3 w-px bg-[var(--land-border)]" />
                  <p className="text-[10px] text-[var(--land-accent)] font-medium">
                    {isRTL ? "عبر MyFatoorah" : "via MyFatoorah"}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block text-end pt-2">
              <div
                className="font-extrabold tracking-tighter"
                style={{ fontSize: "clamp(3rem, 5vw, 4.5rem)" }}
              >
                <span className="text-[var(--land-accent)]">4.900</span>{" "}
                <span className="text-2xl font-medium text-[var(--land-muted)]">
                  KD
                </span>
              </div>
              <p className="text-sm text-[var(--land-muted)] mt-2">~$16 USD</p>
              <p className="text-xs text-[var(--land-accent)] mt-1 font-medium">
                {isRTL ? "دفعة واحدة فقط" : "one-time, forever"}
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── FAQ ─────────────────────────────────── */}
      <ScrollReveal>
        <section className="py-20 px-6">
          <div className="mx-auto max-w-2xl">
            <h2
              className="font-extrabold tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              {isRTL ? "أسئلة شائعة" : "Common questions"}
            </h2>
            <div className="mt-12">
              {faqs.map((item, i) => (
                <details
                  key={i}
                  className="group border-b border-[var(--land-border)] py-5 first:border-t"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-base font-medium hover:text-[var(--land-accent)] transition-colors">
                    <span>{item.q}</span>
                    <svg
                      className="w-4 h-4 text-[var(--land-muted)] transition-transform duration-200 group-open:rotate-180 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed max-w-xl">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Pre-footer CTA ─────────────────────── */}
      <ScrollReveal>
        <section className="border-t border-[var(--land-border)] bg-[var(--land-surface-raised)] px-6 py-20 text-center">
          <div className="mx-auto max-w-2xl">
            <h2
              className="font-extrabold tracking-tighter"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              {isRTL
                ? "البورتفوليو الذي تستحقه مسيرتك"
                : "The portfolio your career has earned"}
            </h2>
            <p className="mt-4 text-[var(--land-body)]">
              {HOSTING_ENABLED
                ? isRTL
                  ? "اختر قالبًا وانشر بورتفوليوك خلال دقائق."
                  : "Pick a template and publish your portfolio in minutes."
                : isRTL
                  ? "اختر قالبًا وحمّل بورتفوليوك كملف PDF خلال دقائق."
                  : "Pick a template and download your portfolio as a PDF in minutes."}
            </p>
            <div className="mt-8 flex flex-col items-center">
              <Link
                href="/templates"
                className="land-cta-glow inline-block rounded-xl bg-[var(--land-accent)] px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)]"
              >
                {isRTL ? "ابدأ البناء — ٤.٩٠٠ دك" : "Start Building — 4.900 KD"}
              </Link>
              <p className="mt-3 text-xs text-[var(--land-muted)]">
                {isRTL ? "دفعة واحدة · بدون اشتراك" : "One-time payment · No subscription"}
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t border-[var(--land-border)] bg-[var(--land-surface)]">
        <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-base font-bold">{tc("appName")}</div>
            <p className="mt-2 text-sm text-[var(--land-muted)]">
              {isRTL
                ? "بورتفوليو احترافي بدفعة واحدة."
                : "Professional portfolios for a one-time fee."}
            </p>
          </div>
          <nav aria-label={isRTL ? "المنتج" : "Product"}>
            <h3 className="text-sm font-semibold text-[var(--land-body)]">
              {isRTL ? "المنتج" : "Product"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--land-muted)]">
              <li>
                <Link
                  href="/templates"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "القوالب" : "Templates"}
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "ابدأ" : "Get started"}
                </Link>
              </li>
              <li>
                <a
                  href="/demo/corporate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "عرض مباشر" : "Live demo"}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label={isRTL ? "قانوني" : "Legal"}>
            <h3 className="text-sm font-semibold text-[var(--land-body)]">
              {isRTL ? "قانوني" : "Legal"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--land-muted)]">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "الخصوصية" : "Privacy"}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "الشروط" : "Terms"}
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "الاسترداد" : "Refund Policy"}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={isRTL ? "تواصل" : "Contact"}>
            <h3 className="text-sm font-semibold text-[var(--land-body)]">
              {isRTL ? "تواصل" : "Contact"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--land-muted)]">
              <li>
                <a
                  href="mailto:support@portfolio-trimind.com"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  support@portfolio-trimind.com
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="relative border-t border-[var(--land-border)] py-6 text-center text-xs text-[var(--land-muted)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--land-accent)] to-transparent opacity-20" />
          &copy; {new Date().getFullYear()} Portfolio Pro by TriMind
        </div>
      </footer>
    </div>
  );
}

