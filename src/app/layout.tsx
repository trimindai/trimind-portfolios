import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Portfolio Pro — Build Your Professional Portfolio",
  description:
    "Create a professional CV + portfolio in minutes. Pick a template, fill your info, get your PDF. Arabic & English supported.",
  metadataBase: new URL("https://portfolio-trimind.com"),
  openGraph: {
    title: "Portfolio Pro — Professional CV + Portfolio in Minutes",
    description: "Pick a template, fill your info, get a professional PDF portfolio. Arabic & English. One-time payment.",
    url: "https://portfolio-trimind.com",
    siteName: "Portfolio Pro",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_KW",
    /* TODO: Drop /public/og-image.png (1200x630) for social sharing */
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Portfolio Pro" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Pro — Professional CV + Portfolio in Minutes",
    description: "Pick a template, fill your info, get a professional PDF. Arabic & English.",
    /* TODO: Same /public/og-image.png */
    images: ["/og-image.png"],
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
