import { redirect } from "next/navigation";

// The guest step-builder is gone — the CV Studio is the only builder.
// Old "try a template" entry point now redirects to /[locale]/build
// (auth-gated, so guests are sent to sign-in, then build from their CV).
export default async function GuestBuilderPage({
  params,
}: {
  params: Promise<{ locale: string; templateId: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale === "ar" ? "ar" : "en"}/build`);
}
