import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Geist, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "../providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
// Arabic UI font. ponytail: --font-sans stays Geist so English never renders in
// the Arabic face; the [locale] wrapper picks font-arabic vs font-sans per dir.
const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
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
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(geist.variable, arabicFont.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers locale={locale}>
          <NextIntlClientProvider messages={messages}>
            {/* Failsafe: if JS is disabled, scroll-reveal content must stay visible. */}
            <noscript>
              <style>{`.reveal-up{opacity:1!important;transform:none!important}`}</style>
            </noscript>
            <div className={isRTL ? "font-arabic" : "font-sans"}>
              {children}
            </div>
          </NextIntlClientProvider>
        </Providers>
        {/* GA4 — loads on every locale route (/en and /ar). Renders only when
            NEXT_PUBLIC_GA_ID is set, so non-prod/preview builds stay clean. */}
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
        {/* Vercel Web Analytics — visitor + page-view counts in the Vercel dashboard. */}
        <Analytics />
        {/* Meta Pixel — base snippet (init + PageView). Client twin of the
            server-side CAPI events in src/lib/metaCapi.ts; also sets the _fbp
            cookie CAPI uses for match quality. Renders only when
            NEXT_PUBLIC_META_PIXEL_ID is set, so preview builds stay clean. */}
        {META_PIXEL_ID ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        ) : null}
      </body>
    </html>
  );
}
