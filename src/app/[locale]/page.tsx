import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { Testimonials } from "@/components/landing/Testimonials";
import { Palette, Languages, FileDown, Globe, Plus, Eye } from "lucide-react";
import Image from "next/image";
import { HOSTING_ENABLED } from "@/lib/flags";
import { TryItForm } from "@/components/landing/TryItForm";
import { UseTemplateButton } from "@/components/landing/UseTemplateButton";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { NavbarAuth } from "@/components/landing/NavbarAuth";
import { CvPreviewCard } from "@/components/landing/CvPreviewCard";
import AiDemoStrip from "@/components/landing/AiDemoStrip";
import StickyFooterCTA from "@/components/landing/StickyFooterCTA";

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
          q: "هل أقدر أسترجع المبلغ؟",
          a: "جميع عمليات الدفع نهائية. تحصل على وصول فوري لبناء ونشر ملفك، لذلك لا نوفر استرجاع. تقدر تشوف كل القوالب والعروض المباشرة كاملة قبل الدفع — ادفع فقط لما تكون جاهز.",
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
          q: "Can I get a refund?",
          a: "All sales are final. You get instant access to build and publish your portfolio, so we don't offer refunds. You can fully preview every template and live demo before paying — pay only when you're ready.",
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

  type TemplateCard = {
    img: string;
    alt: string;
    badgeAr: string;
    badgeEn: string;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    demoHref: string;
    template: string;
    popular?: "green" | "gold";
  };

  const templateCards: TemplateCard[] = [
    {
      img: "/landing/mockup-corporate-2026b.webp",
      alt: "Corporate portfolio template",
      badgeAr: "عام",
      badgeEn: "General",
      titleAr: "بورتفوليو مؤسسي",
      titleEn: "Corporate Portfolio",
      descAr:
        "تصميم مؤسسي بألوان كحلي وذهبي. مؤشرات الإنجاز، الخط الزمني، الشهادات، التوصيات، وPDF جاهز للطباعة.",
      descEn:
        "Navy and gold institutional design. Achievement metrics, career timeline, credentials, endorsements, and print-ready PDF.",
      demoHref: "/demo/general",
      template: "corporate",
      popular: "green",
    },
    {
      img: "/landing/mockup-engineer-2026b.webp",
      alt: "Engineer portfolio template",
      badgeAr: "هندسي",
      badgeEn: "Engineering",
      titleAr: "بورتفوليو هندسي",
      titleEn: "Engineer Portfolio",
      descAr:
        "تصميم بسيط يركز على المشاريع. بطاقات مشاريع، مهارات تقنية، شهادات، وصفحات تفصيلية.",
      descEn:
        "Minimal, project-forward design. Project cards, grouped technical skills, certifications, and detail pages.",
      demoHref: "/demo/engineer",
      template: "engineer",
      popular: "gold",
    },
    {
      img: "/landing/mockup-creative-2026b.webp",
      alt: "Creative portfolio template",
      badgeAr: "إبداعي",
      badgeEn: "Creative",
      titleAr: "بورتفوليو إبداعي",
      titleEn: "Creative Portfolio",
      descAr:
        "تصميم جريء يركز على العمل المرئي. معارض ماسونري، سرد العملية، وشبكات إتقان الأدوات.",
      descEn:
        "Bold, work-forward design. Masonry galleries, process storytelling, and tool-proficiency grids.",
      demoHref: "/demo/creative",
      template: "creative",
    },
    {
      img: "/landing/mockup-creator-2026b.webp",
      alt: "Creator portfolio template",
      badgeAr: "صانع محتوى",
      badgeEn: "Creator",
      titleAr: "بورتفوليو صانع المحتوى",
      titleEn: "Creator Portfolio",
      descAr:
        "بورتفوليو يُلعب. لعبة بطاقات اختيارية تكشف أعمالك، إحصائيات الجمهور، وشريط العلامات التجارية — أو الانتقال مباشرة إلى الأعمال.",
      descEn:
        "A portfolio you can play. An optional match-card game reveals your work, audience stats, and brand marquee — or skip straight to the work.",
      demoHref: "/demo/creator",
      template: "creator",
    },
    {
      img: "/landing/mockup-developer-2026b.webp",
      alt: "Developer portfolio template",
      badgeAr: "مطوّر",
      badgeEn: "Developer",
      titleAr: "بورتفوليو مطوّر",
      titleEn: "Developer Portfolio",
      descAr:
        "تصميم تفاعلي مع لوحة مفاتيح ثلاثية الأبعاد لأدواتك — كل تقنية تضيء زرًا حقيقيًا. مشاريع، خط زمني للخبرات، وروابط GitHub.",
      descEn:
        "Interactive design with a 3D keyboard of your stack — every tool lights up a real key. Projects, experience timeline, and GitHub links.",
      demoHref: "/demo/developer",
      template: "developer",
    },
  ];


  return (
    <div className="min-h-screen bg-[var(--land-bg)] text-[var(--land-bright)] land-grain">
      {/* Schema.org: Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Portfolio Pro",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "4.900",
              priceCurrency: "KWD",
              availability: "https://schema.org/InStock",
            },
            description: "Create a professional CV + portfolio in minutes. Pick a template, fill your info, get your PDF.",
            url: "https://portfolio-trimind.com",
            provider: { "@type": "Organization", name: "TriMind", url: "https://trimind.ai" },
          }),
        }}
      />
      {/* Schema.org: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
      {/* ── Navbar (full bar lives in NavbarAuth: brand, lang pill, admin, auth) ── */}
      <NavbarAuth locale={locale} />

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        {/* Soft gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at ${isRTL ? "25%" : "75%"} 35%, rgba(34,160,99,0.08), transparent 70%), radial-gradient(circle at ${isRTL ? "85%" : "15%"} 85%, rgba(34,160,99,0.05), transparent 50%), linear-gradient(180deg, #F4F6F9 0%, #FAFBFC 100%)`,
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-16 lg:pt-0">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.2fr] items-center gap-12 lg:gap-20">
            <div className="land-stagger">
              <h1
                className="font-extrabold leading-[1.05] tracking-tighter"
                style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
              >
                {isRTL
                  ? "سيرتك الذاتية الاحترافية، جاهزة في دقائق"
                  : "Your Professional CV, Ready in Minutes"}
              </h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isRTL ? "✨ بمساعدة الذكاء الاصطناعي · سريع واحترافي" : "✨ AI-assisted · Fast & professional"}
              </p>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--land-body)]">
                {isRTL
                  ? "تميّز أمام مسؤولي التوظيف بسيرة ذاتية مصقولة وبورتفوليو حيّ. يستخدمه أكثر من ١٣٠ محترفًا في الكويت والخليج."
                  : "Stand out to recruiters with a polished CV and live portfolio. Used by 130+ professionals across Kuwait and the Gulf."}
              </p>
              <p className="mt-4 text-xs text-gray-400 text-center sm:text-start">
                {isRTL ? "١٣٠+ سيرة ذاتية · 🇰🇼 الكويت والخليج · عربي مدعوم" : "130+ CVs built · 🇰🇼 Kuwait & Gulf · Arabic supported"}
              </p>
              {/* Hero stats bar */}
              <div className="flex bg-white border border-ink-10 rounded-2xl shadow-sm overflow-hidden mb-7 mt-6 max-w-md mx-auto">
                <div className="flex-1 text-center py-3">
                  <span className="block text-xl font-bold text-ink leading-none mb-1">{isRTL ? "+١٣٠" : "130+"}</span>
                  <span className="block text-[11px] text-ink-30 font-medium">{isRTL ? "سيرة ذاتية" : "CVs built"}</span>
                </div>
                <div className="flex-1 text-center py-3 border-s border-ink-10">
                  <span className="block text-xl font-bold text-ink leading-none mb-1">{isRTL ? "٤.٩٠٠" : "4.900"}</span>
                  <span className="block text-[11px] text-ink-30 font-medium">{isRTL ? "د.ك فقط" : "KD only"}</span>
                </div>
                <div className="flex-1 text-center py-3 border-s border-ink-10">
                  <span className="block text-xl font-bold text-ink leading-none mb-1">{isRTL ? "~١٠" : "~10"}</span>
                  <span className="block text-[11px] text-ink-30 font-medium">{isRTL ? "ثوانٍ" : "seconds"}</span>
                </div>
              </div>
              {/* Try-it form — no signup needed */}
              <TryItForm locale={locale} />
              {/* AI demo strip — shows AI building CVs live */}
              <AiDemoStrip locale={locale} />
              {/* Animated CV preview — mobile only (desktop shows mockup images) */}
              <div className="lg:hidden">
                <p className="text-xs text-emerald-600 font-medium mb-2 text-center">&#10024; Watch AI build a CV live</p>
                <CvPreviewCard locale={locale} />
              </div>
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
                    src="/landing/mockup-engineer-2026b.webp"
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
                    src="/landing/mockup-corporate-2026b.webp"
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
                  src="/landing/mockup-corporate-2026b.webp"
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

      {/* ── Sarah demo preview — strongest proof of quality ── */}
      <section className="py-12 sm:py-16 px-6 bg-[var(--land-surface-raised)]/30">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--land-accent)] mb-3">
            {isRTL ? "نتيجة حقيقية" : "Real result"}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--land-bright)] mb-6">
            {isRTL ? "هذا ما يحصل عليه عملاؤنا" : "This is what our users get"}
          </h2>
          <a
            href="/demo/corporate"
            target="_blank"
            rel="noopener"
            className="group block rounded-xl border border-[var(--land-border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <Image
              src="/landing/mockup-corporate-2026b.webp"
              alt={isRTL ? "سيرة ذاتية احترافية — عرض مباشر" : "Professional CV — live demo"}
              width={1200}
              height={800}
              sizes="(min-width: 768px) 896px, 100vw"
              className="w-full h-auto"
              quality={90}
            />
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-[var(--land-border)]">
              <span className="text-sm text-[var(--land-body)]">
                {isRTL ? "سارة الرشيدي — محللة مالية" : "Sarah Al-Rashidi — Financial Analyst"}
              </span>
              <span className="text-xs font-medium text-[var(--land-accent)] group-hover:underline">
                {isRTL ? "شاهد العرض المباشر ←" : "View live demo →"}
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ── How it works ──────────────────── */}
      <section className="py-16 px-6 border-b border-[var(--land-border)]/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center text-[var(--land-bright)] mb-10">
            {isRTL ? "كيف يعمل؟" : "How it works"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", time: isRTL ? "٣٠ ثانية" : "30 seconds", en: "Fill your name and job title", ar: "أدخل اسمك ومسماك الوظيفي" },
              { step: "2", time: isRTL ? "فوري" : "Instant", en: "AI drafts your CV instantly", ar: "الذكاء الاصطناعي يكتب مسودة سيرتك فورًا" },
              { step: "3", time: isRTL ? "دقائق" : "Minutes", en: "Review, customize, and download", ar: "راجع، خصّص، وحمّل" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--land-accent)] text-sm font-bold text-white">
                  {s.step}
                </div>
                <p className="text-sm font-medium text-[var(--land-bright)]">{isRTL ? s.ar : s.en}</p>
                <p className="mt-1 text-xs text-[var(--land-muted)]">{s.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Template showcase ──────────────────── */}
      <section id="templates" className="scroll-mt-20 pt-16 sm:pt-32 pb-16 sm:pb-24 px-6">
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
          <div className="flex overflow-x-auto gap-3 pb-3 -mx-5 px-5 scrollbar-hide">
            {templateCards.map((t, i) => (
              <ScrollReveal key={t.template} delay={i * 100} className="flex-shrink-0 w-40">
                <div className="group h-full flex-shrink-0 w-40 rounded-2xl border-[1.5px] border-ink-10 bg-white overflow-hidden transition-all hover:-translate-y-1 hover:border-green-mid hover:shadow-lg">
                  <div className="relative overflow-hidden">
                    <Image
                      src={t.img}
                      alt={t.alt}
                      width={1200}
                      height={800}
                      sizes="160px"
                      className="w-full h-auto"
                      quality={80}
                    />
                    <span className="absolute top-2 start-2 z-10 rounded-full border border-ink-10 bg-paper/80 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ink-30 backdrop-blur">
                      {isRTL ? t.badgeAr : t.badgeEn}
                    </span>
                    {t.popular === "green" && (
                      <span className="absolute top-2 end-2 z-10 rounded-full bg-green-glow px-2 py-0.5 text-[9px] font-bold text-green">
                        {isRTL ? "الأكثر شيوعاً" : "Most popular"}
                      </span>
                    )}
                    {t.popular === "gold" && (
                      <span className="absolute top-2 end-2 z-10 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[9px] font-bold text-gold">
                        {isRTL ? "جديد" : "New"}
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Eye className="h-3.5 w-3.5" />
                        {isRTL ? "عرض مباشر" : "View live demo"}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-ink">
                      {isRTL ? t.titleAr : t.titleEn}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-50 line-clamp-3">
                      {isRTL ? t.descAr : t.descEn}
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      <a
                        href={t.demoHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-green transition-colors hover:text-green-mid"
                      >
                        {isRTL ? "عرض مباشر ←" : "View live demo →"}
                      </a>
                      <UseTemplateButton
                        template={t.template}
                        locale={locale}
                        label={isRTL ? "استخدم هذا القالب" : "Use this template"}
                        className="rounded-lg border border-green-mid/50 px-3 py-1.5 text-center text-xs font-medium text-green transition-colors hover:bg-green-glow"
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}

            {/* More templates coming soon */}
            <ScrollReveal delay={templateCards.length * 100} className="flex-shrink-0 w-40">
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-ink-10 bg-paper p-4 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-10 text-ink-30">
                  <Plus className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[11px] text-ink-50">
                  {isRTL
                    ? "قوالب جديدة قريبًا — طبي، قانوني، تعليمي، والمزيد."
                    : "More templates coming soon — Medical, Legal, Education, and more."}
                </p>
                <p className="mt-3 text-xs font-medium text-ink">
                  {isRTL ? "انضم لقائمة الانتظار" : "Join the waitlist"}
                </p>
                <WaitlistForm locale={locale} source="templates" />
              </div>
            </ScrollReveal>
          </div>

          {/* Strip CTA — start & pick a template */}
          <ScrollReveal className="mx-auto mt-8 block max-w-md">
            <Link
              href="/templates"
              className="block w-full rounded-2xl bg-gradient-to-br from-green to-green-mid py-4 text-center font-bold text-white shadow-green transition-all hover:-translate-y-0.5"
            >
              {isRTL ? "ابدأ واختر قالبك ←" : "Start & pick your template →"}
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── (How-it-works component removed — kept inline AI version above) ── */}

      {/* ── Features (2x2 grid) ────────────────── */}
      <section className="py-16 sm:py-28 px-6">
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
                      <div className="h-2 w-16 rounded-full bg-[var(--land-border)]" />
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
                      <div className="ms-0 h-2 w-16 rounded-full bg-[var(--land-border)]" />
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
                      ? "سيرة ذاتية PDF مع باركود QR"
                      : "CV PDF with a QR code"
                    : isRTL
                      ? "سيرة ذاتية PDF احترافية"
                      : "Professional PDF download"}
                </h3>
                <p className="mt-3 text-sm text-[var(--land-body)] leading-relaxed">
                  {HOSTING_ENABLED
                    ? isRTL
                      ? "سيرة ذاتية احترافية جاهزة لأنظمة التوظيف (ATS) بصيغة PDF، تحمل باركود QR يفتح بورتفوليوك الحيّ عند مسحه — تطبعها وتشاركها في أي مقابلة."
                      : "An ATS-ready professional CV as a PDF, carrying a QR code that opens your live portfolio when scanned — print it, attach it, share it in any interview."
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

      {/* ── Pricing ────────────────────────────── */}
      <ScrollReveal>
        <section className="relative py-16 sm:py-24 px-6 bg-ink text-white">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--land-accent)] to-transparent opacity-40" />
          <div className="mx-auto max-w-3xl lg:grid lg:grid-cols-[1fr_auto] gap-16 items-start">
            <div>
              <h2
                className="font-bold tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                {isRTL ? "سعر واحد. بدون مفاجآت." : "One price. No surprises."}
              </h2>
              <p className="mt-4 text-white/70 leading-relaxed max-w-md">
                {isRTL ? (
                  <>
                    كل شيء مشمول مقابل{" "}
                    <span className="font-semibold text-white">
                      ٤.٩٠٠ دك
                    </span>{" "}
                    للبورتفوليو الواحد (~١٦ دولار). دفعة واحدة. بدون اشتراكات.
                    بدون تجديد.
                  </>
                ) : (
                  <>
                    Everything included for{" "}
                    <span className="font-semibold text-white">
                      4.900 KD
                    </span>{" "}
                    per portfolio (~$16 USD). One-time payment. No subscriptions.
                    No renewals.
                  </>
                )}
              </p>
              <div className="mt-8 grid grid-cols-1 gap-y-3 text-sm text-white/80 sm:grid-cols-2 sm:gap-x-6">
                {(isRTL
                  ? [
                      HOSTING_ENABLED ? "رابط بورتفوليو مستضاف" : null,
                      "عربي + إنجليزي",
                      "تصدير PDF جاهز للطباعة",
                      HOSTING_ENABLED
                        ? "سيرة ذاتية PDF مع باركود QR"
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
                        ? "CV PDF with a QR code"
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
                    <span className="shrink-0 text-green-bright">✓</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Why one-time? */}
              <div className="mt-8 rounded-xl border border-green-mid/30 bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-green-bright">
                  {isRTL ? "لماذا دفعة واحدة؟" : "Why One-Time?"}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                  {isRTL
                    ? "نؤمن أن قصة مسيرتك لا يجب أن تحمل رسومًا شهرية. ادفع مرة واحدة، وامتلكها للأبد."
                    : "We believe your career story shouldn't have a monthly fee. Pay once, own forever."}
                </p>
              </div>
              <div className="mt-10">
                <Link
                  href="/templates"
                  className="inline-block rounded-2xl bg-gradient-to-br from-green to-green-mid px-8 py-3.5 text-base font-semibold text-white shadow-green transition-all hover:-translate-y-0.5"
                >
                  {isRTL ? "ابدأ الآن" : "Start Now — It's Free"}
                </Link>
                <p className="mt-3 text-xs text-white/50">
                  {isRTL
                    ? "ابنِ وعاين مجانًا — ادفع ٤.٩٠٠ دك فقط عند النشر. دفعة واحدة، بدون تجديد."
                    : "Build & preview for free — pay 4.900 KD only when you publish. One-time, no renewals."}
                </p>
                {/* Payment trust icons */}
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <p className="text-[10px] text-white/50 tracking-wide uppercase">
                    {isRTL ? "ادفع عبر" : "Pay with"}
                  </p>
                  <div className="flex items-center gap-3">
                    {/* K-Net */}
                    <span className="text-xs font-bold text-white/80 tracking-tight">K-NET</span>
                    {/* Visa */}
                    <svg className="h-4 text-white/80" viewBox="0 0 48 16" fill="currentColor"><path d="M19.6 1.2l-3.5 13.6h-2.8l3.5-13.6h2.8zm14.3 8.8l1.5-4 .8 4h-2.3zm3.1 4.8h2.6l-2.3-13.6h-2.4c-.5 0-1 .3-1.2.8l-4.2 12.8h2.9l.6-1.6h3.6l.4 1.6zm-7.5-4.4c0-3.6-5-3.8-5-5.4 0-.5.5-1 1.5-1.1.5 0 1.9-.1 3.4.6l.6-2.8c-.8-.3-1.9-.6-3.2-.6-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.3.7 1.8 1.1 1.8 1.7 0 .9-1.1 1.3-2 1.3-1.7 0-2.7-.5-3.5-.8l-.6 2.9c.8.4 2.3.7 3.8.7 3.6 0 6-1.8 6-4.5zm-14.2-9.2l-5.6 13.6h-3l-2.7-10.9c-.2-.6-.3-.8-.8-1.1-.9-.4-2.3-.8-3.5-1.1l.1-.5h4.7c.6 0 1.1.4 1.3 1.1l1.2 6.1 2.8-7.2h2.9z" /></svg>
                    {/* Mastercard */}
                    <svg className="h-4" viewBox="0 0 32 20" fill="none"><circle cx="12" cy="10" r="8" fill="oklch(0.55 0.02 20)" /><circle cx="20" cy="10" r="8" fill="oklch(0.6 0.08 65)" /><path d="M16 4.7a7.96 7.96 0 010 10.6 7.96 7.96 0 000-10.6z" fill="oklch(0.58 0.06 40)" /></svg>
                    {/* Apple Pay */}
                    <span className="text-xs font-medium text-white/80">Apple Pay</span>
                  </div>
                  <div className="h-3 w-px bg-white/15" />
                  <p className="text-[10px] text-green-bright font-medium">
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
                <span className="text-green-bright">4.900</span>{" "}
                <span className="text-2xl font-medium text-white/50">
                  KD
                </span>
              </div>
              <p className="text-sm text-white/50 mt-2">~$16 USD</p>
              <p className="text-xs text-green-bright mt-1 font-medium">
                {isRTL ? "دفعة واحدة فقط" : "one-time, forever"}
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Testimonials ──────────────────── */}
      <Testimonials isRTL={isRTL} />

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
        <section className="border-t border-[var(--land-border)] bg-[var(--land-surface-raised)] px-6 py-14 sm:py-20 text-center">
          <div className="mx-auto max-w-md">
            <h2
              className="font-extrabold tracking-tighter"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              {isRTL ? "جاهز تبدأ؟" : "Ready to start?"}
            </h2>
            <p className="mt-4 text-ink-50">
              {isRTL
                ? "سيرتك الذاتية الاحترافية بانتظارك — مجاناً."
                : "Your professional CV is waiting — free."}
            </p>
            <div className="mt-8">
              <Link
                href="/templates"
                className="block w-full rounded-2xl bg-gradient-to-br from-green to-green-mid py-4 text-lg font-semibold text-white shadow-green transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {isRTL ? "ابدأ الآن — مجاناً ←" : "Start now — free →"}
              </Link>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink-30">
                {(isRTL
                  ? ["🔒 دفع آمن", "⚡ ١٠ ثوانٍ", "✨ بلا اشتراك", "🇰🇼 K-NET"]
                  : ["🔒 Secure pay", "⚡ 10 sec", "✨ No subscription", "🇰🇼 K-NET"]
                ).map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
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
                  href="/pricing"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "الأسعار" : "Pricing"}
                </Link>
              </li>
              <li>
                <a
                  href="/demo/general"
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
              <li>
                <a
                  href="https://wa.me/96550439150"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/trimindartificiall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[var(--land-bright)] transition-colors"
                >
                  {isRTL ? "لوحة التحكم" : "Dashboard"}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="relative border-t border-[var(--land-border)] py-6 text-center text-xs text-[var(--land-muted)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--land-accent)] to-transparent opacity-20" />
          &copy; {new Date().getFullYear()} {isRTL ? "بورتفوليو برو" : "Portfolio Pro"} by TriMind
        </div>
      </footer>

      {/* Sticky mobile/scroll CTA — appears after scrolling */}
      <StickyFooterCTA locale={locale} />
    </div>
  );
}

