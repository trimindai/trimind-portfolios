import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { Testimonials } from "@/components/landing/Testimonials";
import { Fragment } from "react";
import {
  Palette,
  Languages,
  FileDown,
  Globe,
  Sparkles,
  Download,
  MessageCircle,
  Mail,
  AtSign,
} from "lucide-react";
import { HOSTING_ENABLED } from "@/lib/flags";
import { LandingNav } from "@/components/landing/LandingNav";
import SocialProofStrip from "@/components/landing/SocialProofStrip";
import { LandingFloating } from "@/components/landing/LandingFloating";
import { TemplateShowcase } from "@/components/landing/TemplateShowcase";
import { TIER_PRICE } from "@/lib/pricing";

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

  const faqs = isRTL
    ? [
        {
          q: "هل يحتاج البورتفوليو إلى تجديد سنوي؟",
          a: "نعم. إنها خطة سنوية بسيطة: دفعة واحدة في السنة (تبدأ من ٤.٩٠٠ دك) تُبقي صفحتك حيّة مع الاستضافة. بدون رسوم شهرية، وملف PDF الذي تنزّله يبقى لك دائمًا.",
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
          a: "Yes. It's a simple annual plan: one payment a year (from 4.900 KD) keeps your page live with hosting included. No monthly fees, and any PDF you download is yours to keep.",
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
              "@type": "AggregateOffer",
              lowPrice: TIER_PRICE.essential.toFixed(3),
              highPrice: TIER_PRICE.pro_review.toFixed(3),
              priceCurrency: "KWD",
              offerCount: 3,
              availability: "https://schema.org/InStock",
            },
            description: "Create a professional CV + portfolio in minutes. Drop your CV, write notes in plain language, AI builds it, customize, and get your editable pro CV PDF.",
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
      {/* ── Navbar ─────────────────────────────── */}
      <LandingNav locale={locale} appName={tc("appName")} />

      {/* ── Hero ───────────────────────────────── */}
      <section id="hero" className="relative min-h-[100dvh] flex items-center overflow-hidden">
        {/* Soft gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at ${isRTL ? "25%" : "75%"} 35%, rgba(5,150,105,0.06), transparent 70%), radial-gradient(circle at ${isRTL ? "85%" : "15%"} 85%, rgba(5,150,105,0.04), transparent 50%), linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)`,
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
        {/* On desktop this becomes a 2-column hero (copy/CTA on one side, the
            reel on the other); on mobile it stays the single centered column. */}
        <div className="relative z-10 mx-auto grid w-full max-w-md grid-cols-1 px-5 pt-28 pb-16 lg:max-w-6xl lg:grid-cols-2 lg:items-center lg:gap-x-12 lg:gap-y-6 xl:gap-x-20 lg:px-8 lg:pt-32 lg:pb-24">
          {/* ── top/intro text block ──────────────── */}
          <div className="flex flex-col items-center text-center lg:col-start-1 lg:row-start-1">
          {/* headline — profession word in green */}
          <h1 className="text-balance text-4xl sm:text-[2.75rem] lg:text-5xl xl:text-[3.5rem] font-bold leading-snug tracking-tight text-ink mb-4">
            {isRTL ? (
              <>
                سيرتك الذاتية
                <br />
                <span className="text-green-mid">الاحترافية</span>،
                <br />
                جاهزة في دقائق
              </>
            ) : (
              <>
                Your{" "}
                <span className="whitespace-nowrap">
                  <span className="text-green-mid">professional</span> CV,
                </span>
                <br />
                ready in minutes
              </>
            )}
          </h1>

          {/* subtext */}
          <p className="text-sm lg:text-base text-ink-50 leading-relaxed mb-5 max-w-sm lg:max-w-md">
            {isRTL
              ? "الذكاء الاصطناعي يكتب سيرتك. أنت تختار القالب. وخلّصنا."
              : "AI writes your CV. You pick the template. Done."}
          </p>

          {/* live activity ticker — directly below the headline, before the stats row */}
          <div className="mb-7 w-full">
            <SocialProofStrip locale={locale} />
          </div>

          </div>

          {/* guide reel — locale-aware portrait phone frame, the hero centerpiece.
              Muted autoplay loop shows the product instantly (no client JS needed).
              On desktop it sits in the second column, vertically centred. */}
          <div className="relative mx-auto mb-7 w-full max-w-[260px] animate-fadeInUp lg:col-start-2 lg:row-span-2 lg:mb-0 lg:max-w-[300px] lg:self-center">
            <div
              className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-green-glow opacity-70 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.75rem] border border-ink-10 bg-ink-10 shadow-green ring-1 ring-black/5">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                className="h-full w-full object-cover"
                src={isRTL ? "/how-it-works-ar.mp4" : "/how-it-works-en.mp4"}
                poster={isRTL ? "/landing/reel-poster-ar.jpg" : "/landing/reel-poster-en.jpg"}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
          </div>

          {/* ── action + proof block (CTA, stats, trust) ──── */}
          <div className="flex flex-col items-center text-center lg:col-start-1 lg:row-start-2">
          {/* trust signal — sits directly above the single primary CTA */}
          <p className="mb-3 text-xs text-gray-500">
            {isRTL
              ? "⭐ موثوق من +١٣٠ محترف في الكويت والخليج"
              : "⭐ Trusted by 130+ professionals in Kuwait & the Gulf"}
          </p>
          {/* primary CTA — the action focal point */}
          <Link
            href="/build"
            className="w-full max-w-[300px] rounded-2xl bg-green-mid py-4 text-center text-lg font-bold text-white shadow-green transition-all hover:-translate-y-px hover:bg-green hover:shadow-green-lg active:scale-[0.99]"
          >
            {isRTL ? "ابنِ سيرتي — مجانًا" : "Build my CV — free"}
          </Link>
          {/* pay message — quiet, directly below the CTA */}
          <span className="mt-3 text-xs text-gray-400">
            {isRTL ? "ادفع ٤.٩ د.ك فقط عند التصدير" : "Pay just 4.9 KD only on export"}
          </span>
          <Link
            href="/templates"
            className="mt-3 text-sm text-gray-400 underline"
          >
            {isRTL ? "تصفّح القوالب" : "Browse templates"}
          </Link>

          {/* stats bar */}
          <div className="mt-8 flex w-full bg-white border border-ink-10 rounded-2xl shadow-sm overflow-hidden">
            {(isRTL
              ? [
                  { num: "+١٣٠", label: "سيرة ذاتية" },
                  { num: "٤.٩", label: "د.ك فقط" },
                  { num: "~١٠", label: "ثوانٍ" },
                ]
              : [
                  { num: "130+", label: "CVs built" },
                  { num: "4.9", label: "KD only" },
                  { num: "~10", label: "seconds" },
                ]
            ).map((s, i) => (
              <div
                key={i}
                className={`flex-1 text-center py-3 ${i > 0 ? "border-r border-ink-10" : ""}`}
              >
                <span className="block text-xl font-bold text-ink leading-none mb-1">{s.num}</span>
                <span className="block text-[11px] text-ink-50 font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {/* trust row */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink-30">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-green-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {isRTL ? "دفع آمن" : "Secure payment"}
            </span>
            <span className="font-semibold text-ink-50 tracking-tight">K-NET</span>
            <span className="text-ink-50">MyFatoorah</span>
            <span className="h-3 w-px bg-ink-10" />
            <a
              href="https://wa.me/96550439150"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green-mid hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {isRTL ? "دعم واتساب" : "WhatsApp support"}
            </a>
          </div>
          </div>
        </div>
      </section>

      {/* ── How it works — 3 simple steps ──────────── */}
      <section id="how" className="scroll-mt-20 border-b border-[var(--land-border)]/50 px-6 py-16 sm:py-24">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-[var(--land-accent)]">
              {isRTL ? "كيف يعمل" : "How it works"}
            </p>
            <h2
              className="mt-3 font-extrabold tracking-tighter"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              {isRTL ? "ثلاث خطوات بسيطة" : "Three simple steps"}
            </h2>
            <p className="mt-4 text-[var(--land-body)]">
              {isRTL
                ? "من سيرتك القديمة إلى سيرة احترافية — بدون خبرة تصميم."
                : "From your old CV to a professional one — no design skills needed."}
            </p>
          </div>
        </ScrollReveal>
        <div className="mx-auto mt-12 flex max-w-5xl flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-2">
          {[
            { Icon: Sparkles, en: "Build with AI", ar: "ابنِ بالذكاء الاصطناعي", enSub: "Register, drop your CV, and write what you want in plain language — AI builds your portfolio instantly.", arSub: "سجّل، أسقط سيرتك، واكتب ما تريد بلغتك — والذكاء الاصطناعي يبني بورتفوليوك فورًا." },
            { Icon: MessageCircle, en: "Preview & edit by chat", ar: "عاين وعدّل بالمحادثة", enSub: "See it live and refine anything — just chat with the AI to change text, colours, or layout.", arSub: "شاهده مباشرة وعدّل أي شيء — حادث الذكاء الاصطناعي لتغيير النص أو الألوان أو التنسيق." },
            { Icon: Download, en: "Get your editable pro CV", ar: "احصل على سيرتك الاحترافية", enSub: "Pay once a year and get your editable pro CV (PDF + QR) and live page — ready in your dashboard.", arSub: "ادفع مرة واحدة في السنة واحصل على سيرتك الاحترافية القابلة للتعديل (PDF + QR) وصفحة حيّة في لوحة التحكم." },
          ].map((s, i) => (
            <Fragment key={i}>
              <div className="flex-1 rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--land-accent-subtle)] text-[var(--land-accent)]">
                  <s.Icon className="h-6 w-6" />
                </span>
                <p className="mt-4 text-xs font-bold text-[var(--land-accent)]">
                  {isRTL ? "الخطوة " + "١٢٣"[i] : "STEP " + (i + 1)}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight">{isRTL ? s.ar : s.en}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--land-body)]">{isRTL ? s.arSub : s.enSub}</p>
              </div>
              {i < 2 && (
                <span className="mx-auto text-[var(--land-muted)] md:mx-1" aria-hidden="true">
                  <svg
                    className={`h-6 w-6 rotate-90 md:rotate-0 ${isRTL ? "md:-scale-x-100" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </Fragment>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/build"
            className="inline-block rounded-lg bg-[var(--land-accent)] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)]"
          >
            {isRTL ? "ابنِ سيرتي — مجانًا" : "Build my CV — free"}
          </Link>
        </div>
      </section>

      {/* ── Why build your CV with us — benefits + live template demo ── */}
      <section id="templates" className="scroll-mt-20 py-16 sm:py-28 px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium tracking-widest uppercase text-[var(--land-accent)]">
              {isRTL ? "لماذا نحن" : "Why us"}
            </p>
            <h2
              className="mt-3 font-extrabold tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              {isRTL ? "لماذا تبني سيرتك معنا" : "Why build your CV with us"}
            </h2>
            <p className="mt-4 max-w-lg text-lg text-[var(--land-body)]">
              {isRTL
                ? "ليست مجرد سيرة ذاتية — بل قوالب مصمّمة، عربي أصيل، وعرض مباشر تجرّبه قبل أن تدفع."
                : "Not just a CV — designed templates, native Arabic, and a live demo you can try before you pay."}
            </p>
          </div>
        </ScrollReveal>
        <div className="mx-auto mt-12 grid max-w-7xl items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: benefits */}
          <div className="space-y-5">
            {[
              { Icon: Palette, en: "Designed, not generated", ar: "مصمّمة، ليست مولّدة", enD: "Each template is hand-crafted for a real profession — not AI-slop clones with swapped colours.", arD: "كل قالب مصمّم يدويًا لمهنة حقيقية — وليس نسخًا مكررة بألوان مختلفة." },
              { Icon: Languages, en: "Native Arabic + English", ar: "عربي وإنجليزي أصيل", enD: "Proper RTL Arabic designed from scratch — typography, spacing, and reading direction, not a mirrored page.", arD: "تصميم عربي RTL من الصفر — خطوط ومسافات واتجاه قراءة، وليس صفحة معكوسة." },
              { Icon: FileDown, en: "ATS-ready PDF with a QR code", ar: "PDF متوافق مع ATS وبه QR", enD: "An editable, recruiter-friendly CV PDF carrying a QR that opens your live portfolio.", arD: "سيرة PDF قابلة للتعديل وجاهزة لأنظمة التوظيف، تحمل QR يفتح بورتفوليوك الحي." },
              ...(HOSTING_ENABLED
                ? [{ Icon: Globe, en: "Live hosted page (1 year)", ar: "صفحة حيّة مستضافة (سنة)", enD: "Your portfolio gets its own URL with 1 year of hosting — update anytime, changes go live instantly.", arD: "بورتفوليوك يحصل على رابط خاص باستضافة لمدة سنة — حدّثه في أي وقت، والتغييرات فورية." }]
                : []),
            ].map((b, i) => (
              <div key={i} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--land-accent-subtle)] text-[var(--land-accent)]">
                  <b.Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold tracking-tight">{isRTL ? b.ar : b.en}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--land-body)]">{isRTL ? b.arD : b.enD}</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-[var(--land-accent)]/20 bg-[var(--land-accent-subtle)] p-4">
              <p className="text-sm leading-relaxed text-[var(--land-body)]">
                <span className="font-semibold text-[var(--land-accent)]">{isRTL ? "خطة سنوية." : "Annual plan."}</span>{" "}
                {isRTL
                  ? "دفعة واحدة في السنة، بدون رسوم شهرية."
                  : "One payment a year, no monthly fees."}{" "}
                {HOSTING_ENABLED ? (isRTL ? "استضافة لمدة سنة." : "1 year hosting included.") : ""}
              </p>
            </div>
          </div>
          {/* Right: live interactive 5-template demo */}
          <div className="lg:sticky lg:top-24">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--land-muted)]">
              {isRTL ? "جرّب القوالب الخمسة مباشرة" : "Try the 5 templates live"}
            </p>
            <TemplateShowcase locale={locale} />
          </div>
        </div>
      </section>

      {/* ── Pricing — bundled tiers ─────────────── */}
      {/* ponytail: display prices mirror src/lib/pricing TIER_PRICE; real charges are server-validated in myfatoorah.ts */}
      <ScrollReveal>
        <section id="pricing" className="relative scroll-mt-20 py-16 sm:py-24 px-6 bg-[var(--land-surface-raised)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--land-accent)] to-transparent opacity-40" />
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2
                className="font-bold tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                {isRTL ? "أسعار بسيطة. ادفع مرة واحدة سنوياً." : "Simple pricing. Pay once annually."}
              </h2>
              <p className="mt-3 text-[var(--land-body)]">
                {isRTL
                  ? "ابنِ وعاين مجانًا — ادفع فقط عند التصدير أو النشر. دفعة واحدة في السنة، بدون رسوم شهرية."
                  : "Build & preview free — pay only to export or publish. One payment a year, no monthly fees."}
              </p>
            </div>
            <div className="mt-12 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { key: "free", en: "Free Preview", ar: "معاينة مجانية", price: "0", arPrice: "٠", once: false,
                  feats: isRTL ? ["رفع ومعاينة", "سيرة PDF بعلامة مائية", "قالب واحد، حتى ٣ تعديلات"] : ["Upload & preview", "Watermarked PDF", "1 template, up to 3 edits"],
                  highlight: false, cta: isRTL ? "ابدأ مجانًا" : "Start free" },
                { key: "essential", en: "CV Essential", ar: "السيرة الأساسية", price: "4.900", arPrice: "٤.٩٠٠", once: true,
                  feats: isRTL ? ["سيرة PDF نهائية (بدون علامة)", "٥ قوالب + ألوان وخطوط", "عربي/إنجليزي، تعديلات غير محدودة"] : ["Final ATS PDF (no watermark)", "5 templates + colours & fonts", "EN/AR, unlimited edits"],
                  highlight: true, cta: isRTL ? "اختر الأساسية" : "Choose Essential" },
                { key: "pro", en: "Portfolio Pro", ar: "بورتفوليو برو", price: "9.900", arPrice: "٩.٩٠٠", once: true,
                  feats: isRTL ? ["كل مزايا الأساسية", "صفحة حيّة /p/اسمك + QR", "استضافة لمدة سنة"] : ["Everything in Essential", "Live /p/<name> page + QR", "1 year hosting"],
                  highlight: false, cta: isRTL ? "اختر برو" : "Choose Pro" },
                { key: "pro_review", en: "Pro + Expert Review", ar: "برو + مراجعة خبير", price: "24.900", arPrice: "٢٤.٩٠٠", once: true,
                  feats: isRTL ? ["كل مزايا برو", "مراجعة بشرية + ملاحظات ATS", "مراجعة واحدة خلال ٤٨ ساعة"] : ["Everything in Pro", "Human review + ATS notes", "1 revision within 48h"],
                  highlight: false, cta: isRTL ? "اختر برو + مراجعة" : "Choose Pro + Review" },
              ].map((t) => (
                <div
                  key={t.key}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-transform ${
                    t.highlight
                      ? "order-first z-10 border-[var(--land-accent)] bg-[var(--land-surface)] shadow-lg ring-1 ring-[var(--land-accent)]/40 sm:order-none lg:scale-[1.04]"
                      : "border-[var(--land-border)] bg-[var(--land-surface)]"
                  }`}
                >
                  {t.highlight && (
                    <span
                      className={`absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-bold text-white shadow-sm ${
                        isRTL ? "" : "uppercase tracking-wide"
                      }`}
                    >
                      {isRTL ? "الأكثر شيوعاً" : "Most Popular"}
                    </span>
                  )}
                  <h3 className="text-base font-bold tracking-tight">{isRTL ? t.ar : t.en}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tighter text-[var(--land-accent)]">{isRTL ? t.arPrice : t.price}</span>
                    <span className="text-sm font-medium text-[var(--land-muted)]">{isRTL ? "دك" : "KD"}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--land-muted)]">
                    {t.once ? (isRTL ? "سنوياً" : "per year") : (isRTL ? "بدون دفع" : "no payment")}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--land-body)]">
                    {t.feats.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-[var(--land-accent)]">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/build"
                    className={`mt-6 inline-block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                      t.highlight
                        ? "bg-[var(--land-accent)] text-white hover:bg-[var(--land-accent-hover)]"
                        : "border border-[var(--land-accent)]/50 text-[var(--land-accent)] hover:bg-[var(--land-accent)]/10"
                    }`}
                  >
                    {t.cta}
                  </Link>
                </div>
              ))}
            </div>
            {/* Payment trust row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <p className="text-[10px] uppercase tracking-wide text-[var(--land-muted)]">{isRTL ? "ادفع عبر" : "Pay with"}</p>
              <span className="text-xs font-bold tracking-tight text-[var(--land-body)]">K-NET</span>
              <span className="text-xs font-medium text-[var(--land-body)]">Visa</span>
              <span className="text-xs font-medium text-[var(--land-body)]">Mastercard</span>
              <span className="text-xs font-medium text-[var(--land-body)]">Apple Pay</span>
              <span className="h-3 w-px bg-[var(--land-border)]" />
              <p className="text-[10px] font-medium text-[var(--land-accent)]">{isRTL ? "عبر MyFatoorah" : "via MyFatoorah"}</p>
            </div>
            <p className="mt-4 text-center text-xs text-[var(--land-muted)]">
              {isRTL
                ? "ترقية لاحقًا؟ تدفع الفرق فقط — من الأساسية إلى برو بـ ٥.٠٠٠ دك."
                : "Upgrade later? Pay only the difference — Essential → Pro for 5.000 KD."}
            </p>
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

      {/* ── Contact us ──────────────────────────── */}
      <ScrollReveal>
        <section id="contact" className="scroll-mt-20 border-t border-[var(--land-border)] bg-[var(--land-surface-raised)] px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2
              className="font-extrabold tracking-tighter"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              {isRTL ? "جاهز تبني سيرتك؟" : "Ready to build your CV?"}
            </h2>
            <p className="mt-4 text-[var(--land-body)]">
              {isRTL
                ? "ابدأ الآن، أو راسلنا بأي سؤال — نرد بسرعة على واتساب."
                : "Start now, or message us with any question — we reply fast on WhatsApp."}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href="/build"
                className="inline-block rounded-lg bg-[var(--land-accent)] px-10 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-[var(--land-accent-hover)] active:scale-[0.98]"
              >
                {isRTL ? "ابنِ سيرتي — مجانًا" : "Build my CV — free"}
              </Link>
              <p className="text-xs text-[var(--land-muted)]">
                {isRTL ? "ابنِ مجانًا · ادفع فقط عند التصدير" : "Build free · pay only to export"}
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              <a
                href="https://wa.me/96550439150"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)] p-5 transition-colors hover:border-[var(--land-accent)]/40"
              >
                <MessageCircle className="h-6 w-6 text-[var(--land-accent)]" />
                <span className="text-sm font-semibold text-[var(--land-bright)]">WhatsApp</span>
                <span className="text-xs text-[var(--land-muted)]" dir="ltr">+965 5043 9150</span>
              </a>
              <a
                href="mailto:support@portfolio-trimind.com"
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)] p-5 transition-colors hover:border-[var(--land-accent)]/40"
              >
                <Mail className="h-6 w-6 text-[var(--land-accent)]" />
                <span className="text-sm font-semibold text-[var(--land-bright)]">{isRTL ? "البريد" : "Email"}</span>
                <span className="text-xs text-[var(--land-muted)]" dir="ltr">support@portfolio-trimind.com</span>
              </a>
              <a
                href="https://instagram.com/trimindartificial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)] p-5 transition-colors hover:border-[var(--land-accent)]/40"
              >
                <AtSign className="h-6 w-6 text-[var(--land-accent)]" />
                <span className="text-sm font-semibold text-[var(--land-bright)]">Instagram</span>
                <span className="text-xs text-[var(--land-muted)]">@trimindartificial</span>
              </a>
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
                ? "بورتفوليو احترافي بخطة سنوية بسيطة."
                : "Professional portfolios on a simple annual plan."}
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
                  href="https://instagram.com/trimindartificial"
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

      {/* Sticky CTA bar + floating WhatsApp + scroll-to-top */}
      <LandingFloating locale={locale} />
    </div>
  );
}

