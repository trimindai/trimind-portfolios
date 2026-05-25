import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Geist, Noto_Kufi_Arabic } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

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

  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHead locale={locale} isRTL={isRTL} />
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
