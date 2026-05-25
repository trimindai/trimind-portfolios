"use client";

import { useUser } from "@clerk/nextjs";
import { Link } from "@/i18n/navigation";
import { ADMIN_EMAILS } from "@/lib/admin";

export function AdminLink() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email || !ADMIN_EMAILS.includes(email)) return null;

  return (
    <Link
      href="/admin"
      className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-800 rounded px-2 py-1"
    >
      Admin
    </Link>
  );
}
