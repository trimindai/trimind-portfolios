import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminLink } from "@/components/AdminLink";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import Image from "next/image";

export default function LandingPage() {
  const tc = useTranslations("common");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const otherLocale = isRTL ? "en" : "ar";
  const otherLabel = isRTL ? "English" : "عربي";

  const faqs = isRTL
    ? [
        {
          q: "هل يحتاج البورتفوليو إلى تجديد سنوي؟",
          a: "لا. الدفعة لمرة واحدة فقط. يبقى البورتفوليو منشورًا طالما الخدمة نشطة، بدون أي رسوم متكررة.",
        },
        {
          q: "هل يمكنني التعديل بعد النشر؟",
          a: "نعم. عدّل المحتوى متى شئت من لوحة التحكم — التحديثات تظهر فورًا على الرابط العام.",
        },
        {
          q: "ما طرق الدفع المتاحة؟",
          a: "كل بطاقات K-Net، Visa، Mastercard، وApple Pay عبر MyFatoorah — البوابة المعتمدة في الكويت.",
        },
        {
          q: "هل بياناتي آمنة؟",
          a: "نعم. المصادقة عبر Clerk، التشفير في النقل والتخزين، والوصول محصور بمالك الحساب فقط.",
        },
        {
          q: "هل يدعم اللغة العربية؟",
          a: "نعم — اللغة العربية مدعومة بالكامل مع تصميم RTL أصيل في كل قالب.",
        },
      ]
    : [
        {
          q: "Do I need to renew yearly?",
          a: "No. The payment is one-time. Your portfolio stays live for as long as the service is active, no recurring fees.",
        },
        {
          q: "Can I edit after publishing?",
          a: "Yes. Edit your content anytime from the dashboard. Changes appear instantly on your public URL.",
        },
        {
          q: "Which payment methods are accepted?",
          a: "All K-Net cards, Visa, Mastercard, and Apple Pay via MyFatoorah, Kuwait's licensed payment gateway.",
        },
        {
          q: "Is my data secure?",
          a: "Yes. Authentication via Clerk, encryption in transit and at rest, and strict per-owner access control on every record.",
        },
        {
          q: "Does it support Arabic?",
          a: "Fully. Every template ships with proper RTL Arabic layouts, not a translation overlay.",
        },
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
            <AdminLink />
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
          className="object-cover object-center opacity-40 pointer-events-none"
          priority
          quality={85}
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
              <p className="text-sm font-medium tracking-widest uppercase text-[var(--land-accent)]">
                {isRTL ? "بورتفوليو برو" : "Portfolio Pro"}
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
              <div className="mt-10 flex items-center gap-4">
                <Link
                  href="/templates"
                  className="land-btn-shimmer inline-block rounded-xl bg-[var(--land-accent)] px-10 py-4 text-lg font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
                >
                  {isRTL ? "ابنِ بورتفوليوك" : "Build yours"}
                </Link>
              </div>
              <p className="mt-5 text-sm text-[var(--land-muted)]">
                {isRTL
                  ? "بدون اشتراك. دفعة واحدة فقط."
                  : "No subscription. One-time payment."}
              </p>
            </div>

            <div className="land-visual w-full max-w-xl">
              {/* Desktop: stacked cards effect */}
              <div className="hidden lg:block relative land-float" style={{ perspective: "1200px" }}>
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
                    className="w-full h-auto"
                    priority
                    quality={90}
                  />
                </div>
              </div>
              {/* Mobile: single image */}
              <div className="lg:hidden rounded-xl overflow-hidden border border-[var(--land-border)]">
                <Image
                  src="/landing/mockup-corporate.jpg"
                  alt="Corporate portfolio template preview"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ─────────────────── */}
      <ScrollReveal>
        <div className="bg-[var(--land-surface)] border-y border-[var(--land-border)]/50 py-8 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 bg-[var(--land-surface-raised)] rounded-xl px-8 py-5 border border-[var(--land-border)]">
              <p className="text-sm text-[var(--land-muted)]">
                {isRTL
                  ? "موثوق من متخصصين في"
                  : "Trusted by professionals in"}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {(isRTL
                  ? ["الكويت", "الإمارات", "السعودية"]
                  : ["Kuwait", "UAE", "Saudi Arabia"]
                ).map((region, i) => (
                  <span
                    key={region}
                    className="text-xs font-medium tracking-wide text-[var(--land-body)]"
                  >
                    {region}
                    {i < 2 && (
                      <span className="ml-3 text-[var(--land-border)]">/</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Template showcase ──────────────────── */}
      <section className="pt-32 pb-24 px-6">
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
          <div className="flex flex-col lg:grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-10 items-start">
            <ScrollReveal>
              <div className="group">
                <div className="relative rounded-xl overflow-hidden border border-[var(--land-border)] transition-all duration-500 group-hover:translate-y-[-2px] group-hover:border-[var(--land-accent)]/30">
                  <Image
                    src="/landing/mockup-corporate.jpg"
                    alt="Corporate portfolio template"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    quality={90}
                  />
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
                      href="/templates"
                      className="text-sm text-[var(--land-body)] hover:text-[var(--land-bright)] transition-colors"
                    >
                      {isRTL ? "استخدم هذا القالب" : "Use this template"}
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150} className="lg:mt-20">
              <div className="group">
                <div className="relative rounded-xl overflow-hidden border border-[var(--land-border)] transition-all duration-500 group-hover:translate-y-[-2px] group-hover:border-[var(--land-accent)]/30">
                  <Image
                    src="/landing/mockup-engineer.jpg"
                    alt="Engineer portfolio template"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    quality={90}
                  />
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
                      className="text-sm text-[var(--land-body)] hover:text-[var(--land-bright)] transition-colors"
                    >
                      {isRTL ? "استخدم هذا القالب" : "Use this template"}
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal className="mt-16">
            <p className="text-sm text-[var(--land-muted)]">
              {isRTL ? "قوالب إضافية قريبًا" : "More templates coming soon"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Creative", "Creator", "Developer", "Medical", "Educator"].map(
                (name) => (
                  <span
                    key={name}
                    className="text-xs text-[var(--land-muted)] border border-[var(--land-border)] px-3 py-1.5 rounded"
                  >
                    {name}
                  </span>
                ),
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── How it works ───────────────────────── */}
      <ScrollReveal>
        <section className="py-20 px-6">
          <div className="mx-auto max-w-3xl">
            <h2
              className="font-extrabold tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              {isRTL ? "ثلاث خطوات فقط" : "Three steps. That's it."}
            </h2>
            <div className="mt-16">
              <div className="flex flex-col gap-10">
                {[
                  {
                    n: "1",
                    title: isRTL ? "اختر" : "Pick",
                    desc: isRTL
                      ? "اختر قالبًا يناسب مهنتك"
                      : "Choose a template that fits your profession",
                  },
                  {
                    n: "2",
                    title: isRTL ? "أضف" : "Fill",
                    desc: isRTL
                      ? "أضف تفاصيلك بالعربي أو الإنجليزي أو كلاهما"
                      : "Add your details in Arabic, English, or both",
                  },
                  {
                    n: "3",
                    title: isRTL ? "انشر" : "Publish",
                    desc: isRTL
                      ? "بنقرة واحدة يصبح بورتفوليوك حيًا برابط خاص"
                      : "One click and your portfolio is live with its own URL",
                  },
                ].map((step, i) => (
                  <div
                    key={step.n}
                    className="flex items-start gap-6 relative"
                    style={{ [isRTL ? "paddingRight" : "paddingLeft"]: `${i * 2}rem` }}
                  >
                    {i < 2 && (
                      <div
                        className="absolute top-10 w-px h-full bg-[var(--land-border)]/50"
                        style={{ [isRTL ? "right" : "left"]: `calc(${i * 2}rem + 0.875rem)` }}
                      />
                    )}
                    <span className="text-2xl font-bold text-[var(--land-accent)] shrink-0 w-7">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="mt-1 text-sm text-[var(--land-body)] max-w-xs">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Features (alternating) ─────────────── */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-5xl space-y-24">
          {/* Feature 1: Templates */}
          <ScrollReveal>
            <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm font-medium text-[var(--land-accent)]">
                  {isRTL ? "القوالب" : "Templates"}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  {isRTL
                    ? "كل قالب مصمم يدويًا، ليس مولّد."
                    : "Every template designed, not generated."}
                </h3>
                <p className="mt-4 text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "من مجالس الشركات إلى تقارير المشاريع الهندسية. كل قالب مصنوع يدويًا لمهنة محددة، ليس نسخًا متكررة بألوان مختلفة."
                    : "From corporate boardrooms to engineering field reports. Each template is hand-crafted for a specific profession, not clones with different colors."}
                </p>
              </div>
              <div className="mt-8 lg:mt-0 rounded-xl overflow-hidden border border-[var(--land-border)]">
                <Image
                  src="/landing/feature-templates.jpg"
                  alt="Multiple portfolio templates"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  quality={85}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 2: Bilingual (reversed) */}
          <ScrollReveal>
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 mt-8 lg:mt-0 flex gap-3">
                {/* English LTR mockup */}
                <div className="flex-1 rounded-lg bg-[var(--land-surface)] border border-[var(--land-border)] overflow-hidden">
                  <div className="bg-[oklch(0.17_0.008_260)] px-3 py-1.5 flex items-center gap-2 border-b border-[var(--land-border)]">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.35_0.01_0)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.35_0.01_55)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.35_0.01_150)]" />
                    </div>
                    <p className="text-[9px] text-[var(--land-muted)]">English</p>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.25_0.03_250)]" />
                      <div>
                        <div className="h-1.5 w-16 rounded-full bg-[oklch(0.7_0.01_250)]" />
                        <div className="h-1 w-10 rounded-full bg-[var(--land-border)] mt-1" />
                      </div>
                    </div>
                    <div className="h-px bg-[var(--land-border)]" />
                    <div className="space-y-1.5">
                      <div className="h-2 w-20 rounded-full bg-[oklch(0.8_0.01_250)]" />
                      <div className="h-1.5 w-full rounded-full bg-[var(--land-border)]" />
                      <div className="h-1.5 w-4/5 rounded-full bg-[var(--land-border)]" />
                      <div className="h-1.5 w-3/5 rounded-full bg-[var(--land-border)]" />
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-4 w-12 rounded bg-[var(--land-accent)] opacity-60" />
                      <div className="h-4 w-12 rounded bg-[var(--land-border)]" />
                    </div>
                  </div>
                </div>
                {/* Arabic RTL mockup */}
                <div className="flex-1 rounded-lg bg-[var(--land-surface)] border border-[var(--land-border)] overflow-hidden" dir="rtl">
                  <div className="bg-[oklch(0.17_0.008_260)] px-3 py-1.5 flex items-center gap-2 border-b border-[var(--land-border)]" dir="ltr">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.35_0.01_0)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.35_0.01_55)]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.35_0.01_150)]" />
                    </div>
                    <p className="text-[9px] text-[var(--land-muted)]">عربي</p>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[oklch(0.25_0.03_250)]" />
                      <div>
                        <div className="h-1.5 w-16 rounded-full bg-[oklch(0.7_0.01_250)]" />
                        <div className="h-1 w-10 rounded-full bg-[var(--land-border)] mt-1" />
                      </div>
                    </div>
                    <div className="h-px bg-[var(--land-border)]" />
                    <div className="space-y-1.5">
                      <div className="h-2 w-20 rounded-full bg-[oklch(0.8_0.01_250)]" />
                      <div className="h-1.5 w-full rounded-full bg-[var(--land-border)]" />
                      <div className="h-1.5 w-4/5 rounded-full bg-[var(--land-border)]" />
                      <div className="h-1.5 w-3/5 rounded-full bg-[var(--land-border)]" />
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-4 w-12 rounded bg-[var(--land-accent)] opacity-60" />
                      <div className="h-4 w-12 rounded bg-[var(--land-border)]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-sm font-medium text-[var(--land-accent)]">
                  {isRTL ? "ثنائي اللغة" : "Bilingual"}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  {isRTL
                    ? "عربي وإنجليزي. أصلي، ليس ترجمة."
                    : "Arabic and English. Native, not translated."}
                </h3>
                <p className="mt-4 text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "كل قالب بتصميم عربي RTL أصيل — ليس مجرد صفحة إنجليزية معكوسة. الخطوط والمسافات واتجاه القراءة كلها مصممة للعربي."
                    : "Every template has a proper RTL Arabic layout, not a mirrored English page. Typography, spacing, and reading direction are all designed for Arabic."}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Features 3+4: compact side-by-side */}
          <ScrollReveal>
            <div className="lg:grid lg:grid-cols-2 gap-16">
              <div>
                <p className="text-sm font-medium text-[var(--land-accent)]">
                  {isRTL ? "تصدير PDF" : "PDF Export"}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight">
                  {isRTL
                    ? "سيرة ذاتية PDF مع باركود"
                    : "CV page with scannable barcode"}
                </h3>
                <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "حمّل صفحة سيرة ذاتية احترافية كملف PDF مع باركود يوجّه مباشرة إلى بورتفوليوك الحي."
                    : "Download a professional CV page as PDF with a scannable barcode that links directly to your live portfolio."}
                </p>
              </div>
              <div className="mt-12 lg:mt-0">
                <p className="text-sm font-medium text-[var(--land-accent)]">
                  {isRTL ? "رابط خاص" : "Your Own URL"}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight">
                  {isRTL
                    ? "صفحة حيّة محدّثة دائمًا"
                    : "A live page that's always current"}
                </h3>
                <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "بورتفوليوك يحصل على رابط خاص مستضاف. حدّثه متى شئت من لوحة التحكم — التغييرات تظهر فورًا."
                    : "Your portfolio gets its own hosted URL. Update anytime from your dashboard; changes appear instantly."}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

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
                      ٤.٩٩٠ دك
                    </span>{" "}
                    للبورتفوليو الواحد (~١٦ دولار). دفعة واحدة. بدون اشتراكات.
                    بدون تجديد.
                  </>
                ) : (
                  <>
                    Everything included for{" "}
                    <span className="font-semibold text-[var(--land-bright)]">
                      4.990 KD
                    </span>{" "}
                    per portfolio (~$16 USD). One-time payment. No subscriptions.
                    No renewals.
                  </>
                )}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-[var(--land-body)]">
                {(isRTL
                  ? [
                      "رابط مستضاف",
                      "سيرة ذاتية + باركود",
                      "عربي + إنجليزي",
                      "ألوان مخصصة",
                      "جاهز للطباعة",
                      "صورة شخصية",
                    ]
                  : [
                      "Hosted URL",
                      "CV page + barcode",
                      "Arabic + English",
                      "Custom colors",
                      "Print-optimized",
                      "Photo upload",
                    ]
                ).map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[var(--land-accent)] shrink-0" />
                    {item}
                  </div>
                ))}
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
                    ? "دفعة واحدة. بدون تجديد."
                    : "One-time payment. No renewals."}
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
                <span className="text-[var(--land-accent)]">4.990</span>{" "}
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

