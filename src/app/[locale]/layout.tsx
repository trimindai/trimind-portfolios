import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Geist, Noto_Kufi_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

// Pre-generate every locale at build time so pages under [locale] can be
// statically rendered instead of dynamically server-rendered per request.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
    <NextIntlClientProvider messages={messages}>
      <LocaleHead locale={locale} isRTL={isRTL} />
      {/* Failsafe: if JS is disabled, scroll-reveal content must stay visible. */}
      <noscript>
        <style>{`.reveal-up{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          geist.variable,
          notoKufi.variable,
          isRTL ? "font-arabic" : "font-sans"
        )}
      >
        {children}
      </div>
    </NextIntlClientProvider>
  );
}

function LocaleHead({ locale, isRTL }: { locale: string; isRTL: boolean }) {
  // Set html lang/dir at runtime since root layout can't access [locale] param.
  // locale is validated above — only "en" or "ar".
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(locale)};${isRTL ? 'document.documentElement.dir="rtl"' : 'document.documentElement.removeAttribute("dir")'}`,
      }}
    />
  );
}
