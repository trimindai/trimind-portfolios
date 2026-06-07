import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Geist, Noto_Kufi_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "../providers";
import { GoogleAnalytics } from "@next/third-parties/google";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

const SITE_URL = "https://portfolio-trimind.com";

// Pre-generate every locale at build time so pages under [locale] can be
// statically rendered instead of dynamically server-rendered per request.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Per-locale metadata so each statically-rendered locale ships the correct
// canonical (self-referential to the locale root), hreflang alternates, and
// og:locale. Sub-pages (e.g. /templates) override `canonical` themselves.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    metadataBase: new URL(SITE_URL),
    title: isAr
      ? "بورتفوليو برو — سيرة ذاتية وبورتفوليو احترافي"
      : "Portfolio Pro — Professional CV & Portfolio",
    description: isAr
      ? "ابنِ سيرتك الذاتية وبورتفوليوك الاحترافي مجانًا. ادفع ٤.٩ دك فقط عندما يعجبك. عربي وإنجليزي. الكويت والخليج."
      : "Build your professional CV and portfolio free. Pay 4.9 KD only when you love it. Arabic & English. Kuwait & Gulf.",
    openGraph: {
      title: isAr
        ? "بورتفوليو برو — سيرة ذاتية وبورتفوليو احترافي"
        : "Portfolio Pro — Professional CV & Portfolio",
      description: isAr
        ? "ابنِ سيرتك الذاتية وبورتفوليوك الاحترافي مجانًا. ادفع ٤.٩ دك فقط عندما يعجبك. عربي وإنجليزي. الكويت والخليج."
        : "Build your professional CV and portfolio free. Pay 4.9 KD only when you love it. Arabic & English. Kuwait & Gulf.",
      url: `${SITE_URL}/${locale}`,
      siteName: "Portfolio Pro",
      type: "website",
      locale: isAr ? "ar_KW" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_KW",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Portfolio Pro" }],
    },
    twitter: {
      card: "summary_large_image",
      title: isAr
        ? "بورتفوليو برو — سيرة وبورتفوليو احترافي في دقائق"
        : "Portfolio Pro — Professional CV + Portfolio in Minutes",
      description: isAr
        ? "اختر قالبًا، أضف بياناتك، واحصل على PDF احترافي. العربية والإنجليزية."
        : "Pick a template, fill your info, get a professional PDF. Arabic & English.",
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        ar: `${SITE_URL}/ar`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Pin the locale for next-intl's server APIs. Without this, getMessages()
  // reads request headers and forces dynamic (per-request) rendering.
  setRequestLocale(locale);

  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className="antialiased">
        <Providers locale={locale}>
          <NextIntlClientProvider messages={messages}>
            {/* Failsafe: if JS is disabled, scroll-reveal content must stay visible. */}
            <noscript>
              <style>{`.reveal-up{opacity:1!important;transform:none!important}`}</style>
            </noscript>
            <div
              className={cn(
                geist.variable,
                notoKufi.variable,
                isRTL ? "font-arabic" : "font-sans"
              )}
            >
              {children}
            </div>
          </NextIntlClientProvider>
        </Providers>
        {/* GA4 — loads on every locale route (/en and /ar). Renders only when
            NEXT_PUBLIC_GA_ID is set, so non-prod/preview builds stay clean. */}
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
