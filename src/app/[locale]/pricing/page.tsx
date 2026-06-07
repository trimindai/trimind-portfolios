import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { HOSTING_ENABLED } from "@/lib/flags";

const SITE_URL = "https://portfolio-trimind.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "الأسعار — بورتفوليو برو" : "Pricing — Portfolio Pro",
    description: isAr
      ? "مجاني للبناء والمعاينة. ادفع ٤.٩٠٠ دك لمرة واحدة فقط عند النشر — بدون اشتراك، بدون تجديد."
      : "Free to build and preview. Pay a one-time 4.900 KD only when you publish — no subscription, no renewals.",
    alternates: {
      canonical: `${SITE_URL}/${locale}/pricing`,
      languages: {
        en: `${SITE_URL}/en/pricing`,
        ar: `${SITE_URL}/ar/pricing`,
      },
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("common");
  const isRTL = locale === "ar";

  const includes = isRTL
    ? [
        HOSTING_ENABLED ? "رابط بورتفوليو مستضاف" : null,
        "عربي + إنجليزي",
        "تصدير PDF جاهز للطباعة",
        HOSTING_ENABLED ? "سيرة ذاتية PDF مع باركود QR" : "تحميل PDF احترافي",
        "ثيمات ألوان مخصصة",
        "رفع صورة شخصية",
        "تحديثات فورية مجانية للأبد",
        "وصول لمرة واحدة — بدون اشتراك",
      ]
    : [
        HOSTING_ENABLED ? "Hosted portfolio URL" : null,
        "Arabic + English bilingual",
        "Print-optimized PDF export",
        HOSTING_ENABLED ? "CV PDF with a QR code" : "Professional PDF download",
        "Custom color themes",
        "Photo upload",
        "Free updates, forever",
        "One-time access — no subscription",
      ];

  const steps = isRTL
    ? [
        { n: "١", t: "ابنِ مجانًا", d: "اختر قالبًا، أضف بياناتك، وعاين بورتفوليوك بالكامل — دون أي دفع." },
        { n: "٢", t: "ادفع عند النشر", d: "ادفع ٤.٩٠٠ دك لمرة واحدة فقط عندما تكون جاهزًا للنشر أو تحميل ملف PDF." },
        { n: "٣", t: "امتلكها للأبد", d: "عدّل وحدّث وأعد التحميل متى شئت — بدون رسوم متكررة." },
      ]
    : [
        { n: "1", t: "Build for free", d: "Pick a template, add your info, and fully preview your portfolio — no payment needed." },
        { n: "2", t: "Pay when you publish", d: "Pay a one-time 4.900 KD only when you're ready to publish or download your PDF." },
        { n: "3", t: "Own it forever", d: "Edit, update, and re-download anytime — no recurring fees." },
      ];

  return (
    <div className="min-h-screen bg-[var(--land-bg)] text-[var(--land-bright)]">
      {/* Nav */}
      <nav className="border-b border-[var(--land-border)]/50 bg-[var(--land-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight hover:text-[var(--land-accent)] transition-colors">
            {tc("appName")}
          </Link>
          <Link
            href="/templates"
            className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
          >
            {tc("getStarted")}
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--land-accent)]">
          {isRTL ? "الأسعار" : "Pricing"}
        </p>
        <h1
          className="mt-3 font-extrabold tracking-tighter"
          style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          {isRTL ? "سعر واحد. بدون مفاجآت." : "One price. No surprises."}
        </h1>

        {/* The model in one line — resolves the "free" vs "4.900 KD" question */}
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--land-body)]">
          {isRTL
            ? "ابنِ بورتفوليوك وعاينه مجانًا. ادفع ٤.٩٠٠ دك لمرة واحدة فقط عند النشر — بدون اشتراك، بدون تجديد، بدون رسوم خفية."
            : "Build and preview your portfolio for free. Pay a one-time 4.900 KD only when you publish — no subscription, no renewals, no hidden fees."}
        </p>

        {/* Price card */}
        <div className="mt-10 rounded-2xl border border-[var(--land-border)] bg-[var(--land-surface)] p-8">
          <div className="flex items-baseline gap-3">
            <span className="font-extrabold tracking-tighter text-[var(--land-accent)]" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)" }}>
              {isRTL ? "٤.٩٠٠" : "4.900"}
            </span>
            <span className="text-xl font-medium text-[var(--land-muted)]">{isRTL ? "د.ك" : "KD"}</span>
            <span className="text-sm text-[var(--land-muted)]">(~$16 USD)</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[var(--land-accent)]">
            {isRTL ? "دفعة واحدة فقط · للأبد" : "one-time · forever"}
          </p>

          <ul className="mt-7 grid grid-cols-1 gap-y-3 text-sm text-[var(--land-body)] sm:grid-cols-2 sm:gap-x-6">
            {includes
              .filter((item): item is string => Boolean(item))
              .map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-[var(--land-accent)]" />
                  {item}
                </li>
              ))}
          </ul>

          <Link
            href="/templates"
            className="mt-8 inline-block rounded-lg bg-[var(--land-accent)] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--land-accent-hover)]"
          >
            {isRTL ? "ابدأ مجانًا" : "Start free"}
          </Link>
        </div>

        {/* How payment works */}
        <h2 className="mt-16 text-2xl font-bold tracking-tight">
          {isRTL ? "كيف يعمل الدفع؟" : "How payment works"}
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--land-accent-subtle)] text-sm font-bold text-[var(--land-accent)]">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--land-body)]">{s.d}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[var(--land-muted)]">
          {isRTL ? (
            <>
              ادفع عبر K-NET، Visa، Mastercard، أو Apple Pay عبر{" "}
              <span className="text-[var(--land-accent)]">MyFatoorah</span>. جميع المبالغ بالدينار الكويتي.
            </>
          ) : (
            <>
              Pay with K-NET, Visa, Mastercard, or Apple Pay via{" "}
              <span className="text-[var(--land-accent)]">MyFatoorah</span>. All amounts in Kuwaiti Dinar.
            </>
          )}
        </p>
      </main>
    </div>
  );
}
