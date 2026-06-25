"use client";

import { Link } from "@/i18n/navigation";

// The CV Studio (/build) is the single builder. It's auth-gated, so signed-out
// visitors are sent to sign-in first (register-first flow), then land on /build.
// `template` is kept in the props for call-site compatibility but no longer
// drives the destination — the Studio builds from the uploaded CV.
export function UseTemplateButton({
  label,
  className,
}: {
  template: string;
  locale: string;
  label: string;
  className?: string;
}) {
  return (
    <Link href="/build" className={className}>
      {label}
    </Link>
  );
}
