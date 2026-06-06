import "./globals.css";

/**
 * Root layout is a pass-through. The real <html>/<body> live in
 * `app/[locale]/layout.tsx` so `lang`/`dir` are rendered server-side per locale
 * (Arabic ships as `lang="ar" dir="rtl"` in the initial HTML — important for
 * crawlers and no-JS clients). Non-localized routes (`/p`, `/demo`, `/api`) are
 * route handlers that emit their own HTML and don't use this layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
