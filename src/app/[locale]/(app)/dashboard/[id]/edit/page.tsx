import { redirect } from "next/navigation";

// The classic step builder is gone — editing happens in the CV Studio.
// Old "edit" entry point now redirects to /[locale]/build/[id] (never 404s).
export default async function EditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale === "ar" ? "ar" : "en"}/build/${id}`);
}
