"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Link } from "@/i18n/navigation";

export function AdminLink() {
  // Boolean-only admin check — keeps the admin email allowlist out of the
  // client bundle. Renders nothing while loading or for non-admins.
  const isAdmin = useQuery(api.users.isAdmin);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-800 rounded px-2 py-1"
    >
      Admin
    </Link>
  );
}
