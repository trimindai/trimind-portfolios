import type { Metadata } from "next";

// The forgot-password page itself is a client component (`useSignIn`), so it
// can't export metadata. This server-component layout carries the page
// title/desc instead. `noindex` keeps auth pages out of search results.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "إعادة تعيين كلمة المرور — بورتفوليو برو"
      : "Reset password — Portfolio Pro",
    description: isAr
      ? "أعد تعيين كلمة مرور حسابك في بورتفوليو برو."
      : "Reset your Portfolio Pro account password.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `https://portfolio-trimind.com/${locale}/forgot-password`,
    },
  };
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
