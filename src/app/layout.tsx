import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Portfolio Pro — Build Your Professional Portfolio",
  description:
    "Create a stunning professional portfolio in minutes. Pick a template, fill your info, and publish. Pick a template, fill your info, get your PDF. Arabic & English.",
  metadataBase: new URL("https://portfolio-trimind.com"),
  openGraph: {
    title: "Portfolio Pro — Build Your Professional Portfolio",
    description: "Create a stunning professional portfolio in minutes. Pick a template, fill your info, get your PDF. Arabic & English. One-time payment.",
    url: "https://portfolio-trimind.com",
    siteName: "Portfolio Pro",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_KW",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Pro — Build Your Professional Portfolio",
    description: "Create a stunning professional portfolio in minutes. Pick a template, fill your info, get your PDF.",
  },
  alternates: {
    canonical: "https://portfolio-trimind.com",
    languages: {
      en: "https://portfolio-trimind.com/en",
      ar: "https://portfolio-trimind.com/ar",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
