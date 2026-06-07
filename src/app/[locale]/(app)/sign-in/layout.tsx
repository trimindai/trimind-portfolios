import type { Metadata } from "next";

// The sign-in page itself is a client component (`useSignIn`), so it can't
// export metadata. This server-component layout carries the page title/desc
// instead. `noindex` keeps auth pages out of search results.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "تسجيل الدخول — بورتفوليو برو" : "Sign in — Portfolio Pro",
    description: isAr
      ? "سجّل الدخول إلى حسابك في بورتفوليو برو."
      : "Sign in to your Portfolio Pro account.",
    robots: { index: false, follow: false },
    alternates: { canonical: `https://portfolio-trimind.com/${locale}/sign-in` },
  };
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
