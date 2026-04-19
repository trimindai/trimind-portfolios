import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminLink } from "@/components/AdminLink";

export default function LandingPage() {
  const t = useTranslations("landing");
  const tc = useTranslations("common");
  const locale = useLocale();
  const otherLocale = locale === "en" ? "ar" : "en";
  const otherLabel = locale === "en" ? "عربي" : "English";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            {tc("appName")}
          </span>
          <div className="flex items-center gap-4">
            <AdminLink />
            <a
              href={`/${otherLocale}`}
              className="text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 rounded px-2.5 py-1"
            >
              {otherLabel}
            </a>
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
            <Link
              href="/templates"
              className="rounded-lg border border-slate-700 px-8 py-3 text-lg font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {t("hero.browse")}
            </Link>
            <a
              href="https://corporate-three-pink.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-4"
            >
              {locale === "ar" ? "شاهد عرضًا مباشرًا ←" : "See a live demo →"}
            </a>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            {locale === "ar"
              ? "بدون اشتراك. ضمان استرداد ٧ أيام."
              : "No subscription. 7-day money-back guarantee."}
          </p>
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

      {/* Template Preview — featured corporate + grid of all */}
      <section id="templates" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {locale === "ar"
                ? "قوالب لكل مهنة"
                : "Templates for every profession"}
            </h2>
            <p className="mt-4 text-slate-400">
              {locale === "ar"
                ? "سبعة قوالب مصممة بعناية — اختر ما يناسب مجالك."
                : "Seven hand-crafted templates — pick the one that fits your field."}
            </p>
          </div>

          {/* Featured corporate preview */}
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden max-w-4xl mx-auto">
            <div className="aspect-[16/9] bg-slate-800 flex items-center justify-center">
              <iframe
                src="https://corporate-three-pink.vercel.app/"
                className="w-full h-full border-0 pointer-events-none"
                title="Corporate Template Preview"
              />
            </div>
            <div className="p-6 text-start">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold">Corporate Portfolio</h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-1">
                  {locale === "ar" ? "متاح الآن" : "Available now"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {locale === "ar"
                  ? "تصميم مؤسسي بلون كحلي وذهبي. هيرو بمؤشرات، الجدول الزمني، قصص الأثر، الاعتمادات، التوصيات، وPDF جاهز للطباعة."
                  : "Navy & gold institutional design. Hero with metrics, career timeline, impact stories, credentials, endorsements, and print-optimized PDF with QR code."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  locale === "ar" ? "ألوان مخصصة" : "Custom Colors",
                  "PDF Export",
                  locale === "ar" ? "عربي + إنجليزي" : "Arabic + English",
                  "Print Ready",
                  "QR Code",
                  locale === "ar" ? "متجاوب" : "Mobile Responsive",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-emerald-600/10 text-emerald-400 rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://corporate-three-pink.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition-colors"
                >
                  {locale === "ar" ? "افتح المعاينة" : "Open live preview"}
                </a>
                <Link
                  href="/dashboard/new"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 transition-colors"
                >
                  {locale === "ar" ? "استخدم هذا القالب" : "Use this template"}
                </Link>
              </div>
            </div>
          </div>

          {/* Other templates teaser */}
          <div className="mt-12 text-center">
            <p className="text-sm uppercase tracking-wider text-slate-500">
              {locale === "ar" ? "وقريبًا" : "Coming soon"}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                "Executive",
                "Creative",
                "Designer",
                "Developer",
                "Medical",
                "Educator",
              ].map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-slate-700 bg-slate-900/40 px-4 py-1.5 text-sm text-slate-300"
                >
                  {name}
                </span>
              ))}
            </div>
            <Link
              href="/templates"
              className="mt-8 inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {locale === "ar"
                ? "تصفح كل القوالب ←"
                : "Browse all templates →"}
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Simple Pricing
          </h2>
          <p className="mt-4 text-slate-400">One-time payment. No subscriptions.</p>
          <div className="mt-12 rounded-2xl border border-emerald-600/30 bg-slate-900/80 p-8">
            <div className="text-5xl font-bold text-emerald-500">
              1.500 KD
            </div>
            <div className="mt-1 text-slate-400">per portfolio (~$5 USD)</div>
            <ul className="mt-8 space-y-3 text-start text-sm">
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Hosted portfolio URL</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> PDF download with QR code</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Arabic &amp; English support</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Custom colors &amp; fonts</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Print-optimized layout</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Profile photo upload</li>
            </ul>
            <Link
              href="/dashboard/new"
              className="mt-8 block rounded-lg bg-emerald-600 py-3 text-center font-semibold hover:bg-emerald-500 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            {locale === "ar" ? "أسئلة شائعة" : "Frequently asked questions"}
          </h2>
          <div className="mt-12 space-y-4">
            {(locale === "ar"
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
                    a: "No. The payment is one-time. Your portfolio stays live for as long as the service is active — no recurring fees.",
                  },
                  {
                    q: "Can I edit after publishing?",
                    a: "Yes. Edit your content anytime from the dashboard — changes appear instantly on your public URL.",
                  },
                  {
                    q: "Which payment methods are accepted?",
                    a: "All K-Net cards, Visa, Mastercard, and Apple Pay via MyFatoorah — Kuwait's licensed payment gateway.",
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
                    a: "Fully — every template ships with proper RTL Arabic layouts, not a translation overlay.",
                  },
                ]
            ).map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 open:bg-slate-900/80 transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-medium">
                  <span>{item.q}</span>
                  <span className="text-emerald-500 transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-lg font-bold">{tc("appName")}</div>
            <p className="mt-2 text-sm text-slate-500">
              {locale === "ar"
                ? "بورتفوليو احترافي بدفعة واحدة."
                : "Professional portfolios for a one-time fee."}
            </p>
          </div>
          <nav aria-label={locale === "ar" ? "المنتج" : "Product"}>
            <h3 className="text-sm font-semibold text-slate-300">
              {locale === "ar" ? "المنتج" : "Product"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>
                <Link
                  href="/templates"
                  className="hover:text-white transition-colors"
                >
                  {locale === "ar" ? "القوالب" : "Templates"}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/new"
                  className="hover:text-white transition-colors"
                >
                  {locale === "ar" ? "ابدأ" : "Get started"}
                </Link>
              </li>
              <li>
                <a
                  href="https://corporate-three-pink.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {locale === "ar" ? "عرض مباشر" : "Live demo"}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label={locale === "ar" ? "قانوني" : "Legal"}>
            <h3 className="text-sm font-semibold text-slate-300">
              {locale === "ar" ? "قانوني" : "Legal"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  {locale === "ar" ? "الخصوصية" : "Privacy"}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  {locale === "ar" ? "الشروط" : "Terms"}
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="hover:text-white transition-colors"
                >
                  {locale === "ar" ? "الاسترداد" : "Refund Policy"}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={locale === "ar" ? "تواصل" : "Contact"}>
            <h3 className="text-sm font-semibold text-slate-300">
              {locale === "ar" ? "تواصل" : "Contact"}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>
                <a
                  href="mailto:support@portfolio-trimind.com"
                  className="hover:text-white transition-colors"
                >
                  support@portfolio-trimind.com
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Portfolio Pro by TriMind
        </div>
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

