import { redirect } from "next/navigation";

// The classic step builder is gone — the CV Studio is the only builder.
// Old "create" entry point now redirects to /[locale]/build (never 404s).
export default async function NewPortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale === "ar" ? "ar" : "en"}/build`);
}
