"use client";

import { Link } from "@/i18n/navigation";

function isSignedIn(): boolean {
  if (typeof document === "undefined") return false;
  const m = document.cookie.match(/(?:^|;\s*)__client_uat=([^;]*)/);
  if (!m) return false;
  const v = parseInt(decodeURIComponent(m[1]), 10);
  return Number.isFinite(v) && v > 0;
}

export function UseTemplateButton({
  template,
  locale,
  label,
  className,
}: {
  template: string;
  locale: string;
  label: string;
  className?: string;
}) {
  const target = isSignedIn() ? `/dashboard/new?template=${template}` : `/try/${template}`;

  return (
    <Link href={target} className={className}>
      {label}
    </Link>
  );
}
