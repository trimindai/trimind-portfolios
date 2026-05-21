import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminLink } from "@/components/AdminLink";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

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
          q: "هل يوجد ضمان استرداد؟",
          a: "نعم. ٧ أيام، كامل المبلغ، بدون أسئلة. اقرأ سياسة الاسترداد.",
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
          q: "Is there a refund guarantee?",
          a: "Yes. 7 days, full refund, no questions asked. See our Refund Policy.",
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
    <div className="min-h-screen bg-[var(--land-bg)] text-[var(--land-bright)]">
      {/* ── Navbar ─────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--land-border)]/50 bg-[var(--land-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">
            {tc("appName")}
          </span>
          <div className="flex items-center gap-4">
            <AdminLink />
            <a
              href={`/${otherLocale}`}
              className="text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)] transition-colors"
            >
              {otherLabel}
            </a>
            <Link
              href="/sign-in"
              className="hidden sm:inline text-sm text-[var(--land-body)] hover:text-[var(--land-bright)] transition-colors"
            >
              {tc("signIn")}
            </Link>
            <Link
              href="/dashboard/new"
              className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
            >
              {tc("getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${isRTL ? "30%" : "70%"} 40%, oklch(0.22 0.08 160 / 0.4), transparent 70%)`,
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-16 lg:pt-0">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.2fr] items-center gap-12 lg:gap-20">
            <div className="land-stagger">
              <h1
                className="font-bold leading-[1.05] tracking-tight"
                style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)" }}
              >
                {isRTL
                  ? "البورتفوليو الذي تستحقه مسيرتك"
                  : "The portfolio your career has earned"}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--land-body)]">
                {isRTL
                  ? "بورتفوليوهات احترافية لمهندسي النفط والغاز والقيادات والمتخصصين في الكويت. ثنائية اللغة. جاهزة للطباعة. جاهزة في دقائق."
                  : "Professional portfolios for Kuwait's oil and gas engineers, corporate leaders, and technical specialists. Bilingual. Print-ready. Live in minutes."}
              </p>
              <div className="mt-10">
                <Link
                  href="/dashboard/new"
                  className="inline-block rounded-lg bg-[var(--land-accent)] px-8 py-3.5 text-base font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
                >
                  {isRTL ? "ابنِ بورتفوليوك" : "Build yours"}
                </Link>
              </div>
              <p className="mt-4 text-sm text-[var(--land-muted)]">
                {isRTL
                  ? "بدون اشتراك. ضمان استرداد ٧ أيام."
                  : "No subscription. 7-day money-back guarantee."}
              </p>
            </div>

            <div className="land-visual w-full max-w-xl">
              <div className="hidden lg:block" style={{ perspective: "1200px" }}>
                <div
                  style={{
                    transform: isRTL
                      ? "rotateY(4deg) rotateX(2deg)"
                      : "rotateY(-4deg) rotateX(2deg)",
                  }}
                >
                  <TemplateBrowser url="portfolio-trimind.com/ahmad-al-rashidi">
                    <CorporateMockup />
                  </TemplateBrowser>
                </div>
              </div>
              <div className="lg:hidden">
                <TemplateBrowser url="portfolio-trimind.com/ahmad">
                  <CorporateMockup />
                </TemplateBrowser>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ─────────────────── */}
      <ScrollReveal>
        <div className="bg-[var(--land-surface)] border-y border-[var(--land-border)]/50 py-6 px-6">
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <p className="text-sm text-[var(--land-muted)]">
              {isRTL
                ? "موثوق من متخصصين في"
                : "Trusted by professionals in"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(isRTL
                ? ["الكويت", "الإمارات", "السعودية"]
                : ["Kuwait", "UAE", "Saudi Arabia"]
              ).map((region) => (
                <span
                  key={region}
                  className="text-xs font-medium text-[var(--land-body)] bg-[var(--land-bg)] px-3 py-1.5 rounded"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Template showcase ──────────────────── */}
      <section className="pt-32 pb-24 px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-7xl">
            <h2
              className="font-bold tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
            >
              {isRTL ? "شاهد ما ستبنيه" : "See what you'll build"}
            </h2>
            <p className="mt-4 max-w-lg text-[var(--land-body)]">
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
                <TemplateBrowser url="portfolio-trimind.com/ahmad">
                  <CorporateMockup />
                </TemplateBrowser>
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
                      href="https://corporate-three-pink.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--land-accent)] hover:text-[var(--land-accent-hover)] transition-colors"
                    >
                      {isRTL ? "عرض مباشر ←" : "View live demo \u2192"}
                    </a>
                    <Link
                      href="/dashboard/new"
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
                <TemplateBrowser url="portfolio-trimind.com/sara">
                  <EngineerMockup />
                </TemplateBrowser>
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
                      href="/templates/engineer/index.html"
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
              {["Creative", "Designer", "Developer", "Medical", "Educator"].map(
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
              className="text-center font-bold tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
            >
              {isRTL ? "ثلاث خطوات فقط" : "Three steps. That's it."}
            </h2>
            <div className="mt-16 relative">
              <div className="hidden lg:block absolute top-5 start-[16%] end-[16%] h-px bg-[var(--land-border)]" />
              <div className="lg:hidden absolute top-5 bottom-5 start-5 w-px bg-[var(--land-border)]" />

              <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8">
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
                ].map((step) => (
                  <div
                    key={step.n}
                    className="flex items-start lg:flex-col lg:items-center lg:text-center gap-4 relative z-10 lg:flex-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--land-surface)] border border-[var(--land-border)] flex items-center justify-center text-[var(--land-accent)] font-semibold text-sm shrink-0">
                      {step.n}
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
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
                    ? "سبعة قوالب. كل واحد مصمم، ليس مولّد."
                    : "Seven templates. Each one designed, not generated."}
                </h3>
                <p className="mt-4 text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "من مجالس الشركات إلى تقارير المشاريع الهندسية. كل قالب مصنوع يدويًا لمهنة محددة، ليس نسخًا متكررة بألوان مختلفة."
                    : "From corporate boardrooms to engineering field reports. Each template is hand-crafted for a specific profession, not clones with different colors."}
                </p>
              </div>
              <div className="mt-8 lg:mt-0 flex gap-3 items-end">
                <div className="flex-1 aspect-[3/4] rounded-lg overflow-hidden bg-[oklch(0.2_0.04_250)] border border-[oklch(0.3_0.03_250)]">
                  <div className="h-1 bg-[oklch(0.72_0.08_65)]" />
                  <div className="p-3 space-y-2 mt-3">
                    <div className="h-1.5 w-3/4 rounded-full bg-[oklch(0.72_0.08_65)]/30" />
                    <div className="h-1 w-1/2 rounded-full bg-[oklch(0.35_0.02_250)]" />
                  </div>
                </div>
                <div className="flex-1 aspect-[3/5] rounded-lg overflow-hidden bg-white border border-[oklch(0.9_0_0)]">
                  <div className="h-1 bg-[oklch(0.59_0.17_160)]" />
                  <div className="p-3 space-y-2 mt-3">
                    <div className="h-1.5 w-3/4 rounded-full bg-[oklch(0.15_0.01_160)]" />
                    <div className="h-1 w-1/2 rounded-full bg-[oklch(0.7_0.01_160)]" />
                  </div>
                </div>
                <div className="flex-1 aspect-[3/4] rounded-lg overflow-hidden bg-[oklch(0.15_0.015_200)] border border-[oklch(0.25_0.01_200)] opacity-50">
                  <div className="h-1 bg-[oklch(0.6_0.15_200)]" />
                  <div className="p-3 space-y-2 mt-3">
                    <div className="h-1.5 w-2/3 rounded-full bg-[oklch(0.3_0.01_200)]" />
                    <div className="h-1 w-1/2 rounded-full bg-[oklch(0.25_0.01_200)]" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Feature 2: Bilingual (reversed) */}
          <ScrollReveal>
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 mt-8 lg:mt-0 flex gap-3">
                <div className="flex-1 rounded-lg bg-[var(--land-surface)] p-4 border border-[var(--land-border)]">
                  <p className="text-[10px] text-[var(--land-muted)] mb-3">
                    English
                  </p>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-[var(--land-border)]" />
                    <div className="h-1.5 w-4/5 rounded-full bg-[var(--land-border)]" />
                    <div className="h-1.5 w-3/5 rounded-full bg-[var(--land-border)]" />
                  </div>
                </div>
                <div
                  className="flex-1 rounded-lg bg-[var(--land-surface)] p-4 border border-[var(--land-border)]"
                  dir="rtl"
                >
                  <p className="text-[10px] text-[var(--land-muted)] mb-3">
                    عربي
                  </p>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-[var(--land-border)]" />
                    <div className="h-1.5 w-4/5 rounded-full bg-[var(--land-border)]" />
                    <div className="h-1.5 w-3/5 rounded-full bg-[var(--land-border)]" />
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
                    ? "PDF جاهز للطباعة مع رمز QR"
                    : "Print-ready PDF with QR code"}
                </h3>
                <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed">
                  {isRTL
                    ? "حمّل بورتفوليوك كملف PDF منسّق مع رمز QR يربط مباشرة بصفحتك الحية."
                    : "Download your portfolio as a formatted PDF with a QR code linking directly to your live page."}
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
        <section className="py-24 px-6 bg-[var(--land-surface)]">
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
                      ١.٥٠٠ دك
                    </span>{" "}
                    للبورتفوليو الواحد (~٥ دولار). دفعة واحدة. بدون اشتراكات.
                    بدون تجديد.
                  </>
                ) : (
                  <>
                    Everything included for{" "}
                    <span className="font-semibold text-[var(--land-bright)]">
                      1.500 KD
                    </span>{" "}
                    per portfolio (~$5 USD). One-time payment. No subscriptions.
                    No renewals.
                  </>
                )}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-[var(--land-body)]">
                {(isRTL
                  ? [
                      "رابط مستضاف",
                      "PDF + رمز QR",
                      "عربي + إنجليزي",
                      "ألوان مخصصة",
                      "جاهز للطباعة",
                      "صورة شخصية",
                    ]
                  : [
                      "Hosted URL",
                      "PDF + QR code",
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
                  href="/dashboard/new"
                  className="inline-block rounded-lg bg-[var(--land-accent)] px-8 py-3.5 text-base font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
                >
                  {isRTL ? "ابنِ بورتفوليوك" : "Build yours"}
                </Link>
                <p className="mt-3 text-xs text-[var(--land-muted)]">
                  {isRTL
                    ? "ضمان استرداد ٧ أيام. بدون أسئلة."
                    : "7-day money-back guarantee. No questions asked."}
                </p>
              </div>
            </div>
            <div className="hidden lg:block text-end pt-2">
              <div className="text-4xl font-bold text-[var(--land-bright)]">
                1.500{" "}
                <span className="text-lg font-medium text-[var(--land-muted)]">
                  KD
                </span>
              </div>
              <p className="text-sm text-[var(--land-muted)] mt-1">~$5 USD</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── FAQ ─────────────────────────────────── */}
      <ScrollReveal>
        <section className="py-20 px-6">
          <div className="mx-auto max-w-2xl">
            <h2
              className="font-bold tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
            >
              {isRTL ? "أسئلة شائعة" : "Common questions"}
            </h2>
            <div className="mt-12">
              {faqs.map((item, i) => (
                <details
                  key={i}
                  className="group border-b border-[var(--land-border)] py-5 first:border-t"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-base font-medium">
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
                  href="/dashboard/new"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "ابدأ" : "Get started"}
                </Link>
              </li>
              <li>
                <a
                  href="https://corporate-three-pink.vercel.app/"
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
        <div className="border-t border-[var(--land-border)] py-6 text-center text-xs text-[var(--land-muted)]">
          &copy; {new Date().getFullYear()} Portfolio Pro by TriMind
        </div>
      </footer>
    </div>
  );
}

/* ── Helper components ─────────────────────────── */

function TemplateBrowser({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--land-border)] transition-transform duration-300 group-hover:translate-y-[-2px]">
      <div className="bg-[oklch(0.17_0.008_160)] px-4 py-2 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[oklch(0.3_0.006_160)]" />
          <div className="w-2 h-2 rounded-full bg-[oklch(0.3_0.006_160)]" />
          <div className="w-2 h-2 rounded-full bg-[oklch(0.3_0.006_160)]" />
        </div>
        <div className="flex-1 h-5 rounded bg-[oklch(0.12_0.008_160)] mx-4 flex items-center px-3">
          <span className="text-[10px] text-[var(--land-muted)] truncate">
            {url}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

function CorporateMockup() {
  return (
    <div className="aspect-[16/10] bg-[oklch(0.97_0.003_200)] flex flex-col">
      <div className="bg-[oklch(0.18_0.04_250)] px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[oklch(0.3_0.03_250)]" />
        <div>
          <div className="h-2 w-24 rounded-full bg-[oklch(0.72_0.08_65)]" />
          <div className="h-1.5 w-16 rounded-full bg-[oklch(0.45_0.02_250)] mt-1" />
        </div>
      </div>
      <div className="flex-1 p-5">
        <div className="flex gap-3 mb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 rounded bg-[oklch(0.94_0.005_200)] p-2.5"
            >
              <div className="h-4 w-8 rounded bg-[oklch(0.22_0.03_250)]" />
              <div className="h-1 w-12 rounded-full bg-[oklch(0.82_0.005_200)] mt-1.5" />
            </div>
          ))}
        </div>
        <div className="space-y-2.5">
          {[75, 55, 65].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.08_65)]" />
              <div
                className="h-1.5 rounded-full bg-[oklch(0.88_0.005_200)]"
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="h-0.5 bg-[oklch(0.72_0.08_65)]" />
    </div>
  );
}

function EngineerMockup() {
  return (
    <div className="aspect-[16/10] bg-white flex flex-col">
      <div className="px-5 py-3 border-b border-[oklch(0.92_0_0)]">
        <div className="h-2 w-20 rounded-full bg-[oklch(0.15_0.01_160)]" />
        <div className="h-1.5 w-14 rounded-full bg-[oklch(0.55_0.01_160)] mt-1" />
      </div>
      <div className="flex-1 p-4 grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded bg-[oklch(0.96_0.003_160)] p-2">
            <div className="aspect-[3/2] rounded bg-[oklch(0.91_0.008_160)]" />
            <div className="h-1.5 w-3/4 rounded-full bg-[oklch(0.25_0.005_160)] mt-2" />
            <div className="h-1 w-1/2 rounded-full bg-[oklch(0.65_0.005_160)] mt-1" />
          </div>
        ))}
      </div>
      <div className="h-0.5 bg-[oklch(0.59_0.17_160)]" />
    </div>
  );
}
