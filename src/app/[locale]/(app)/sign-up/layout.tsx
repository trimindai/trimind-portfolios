import type { Metadata } from "next";

// The sign-up page itself is a client component (`useSignUp`), so it can't
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
    title: isAr ? "إنشاء حساب — بورتفوليو برو" : "Create account — Portfolio Pro",
    description: isAr
      ? "أنشئ حسابًا مجانيًا في بورتفوليو برو وابدأ ببناء بورتفوليوك."
      : "Create a free Portfolio Pro account and start building your portfolio.",
    robots: { index: false, follow: false },
    alternates: { canonical: `https://portfolio-trimind.com/${locale}/sign-up` },
  };
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
