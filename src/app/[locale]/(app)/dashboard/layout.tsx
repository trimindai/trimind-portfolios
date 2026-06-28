"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect, useState } from "react";
import { DashboardContext } from "@/contexts/DashboardContext";
import { Id } from "@convex/_generated/dataModel";
import { AdminLink } from "@/components/AdminLink";
import { Link } from "@/i18n/navigation";
import { useParams, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const isRTL = locale === "ar";
  // The preview route is a self-contained, full-screen tool with its own
  // toolbar; on phones it should render edge-to-edge (no shell padding/max-w).
  const pathname = usePathname();
  const isPreview = !!pathname?.endsWith("/preview");
  const upsertUser = useMutation(api.users.upsertFromClerk);
  const currentUser = useQuery(api.users.getCurrent);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Identity is now derived from the Clerk JWT inside the mutation —
    // no need (and not allowed) to send clerkId from the client.
    if (isLoaded && user) {
      upsertUser({}).then((id) => {
        setConvexUserId(id);
        setSynced(true);
      });
    }
  }, [isLoaded, user, upsertUser]);

  // Fall back to currentUser query result if upsert hasn't completed yet.
  const userId = convexUserId ?? currentUser?._id ?? null;

  if (!isLoaded || !synced) {
    return (
      <div className="min-h-screen bg-[var(--land-bg)] flex items-center justify-center">
        <div dir={isRTL ? "rtl" : "ltr"} className="text-[var(--land-body)] text-sm">
          {isRTL ? "جاري التحميل…" : "Loading…"}
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ userId }}>
      <div className="min-h-screen bg-[var(--land-bg)]">
        <header className="border-b border-[var(--land-border)] bg-[var(--land-bg)]/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold text-[var(--land-bright)] tracking-tight hover:text-[var(--land-accent-hover)] transition-colors">
              {isRTL ? "بورتفوليو برو" : "Portfolio Pro"}
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <AdminLink />
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === `/${locale}/dashboard`
                    ? "text-[var(--land-accent)]"
                    : "text-[var(--land-body)] hover:text-[var(--land-bright)]"
                }`}
              >
                {isRTL ? "ملفاتي" : "My Portfolios"}
              </Link>
              <span className="hidden sm:inline text-sm text-[var(--land-body)]">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </span>
              <button
                onClick={() => signOut({ redirectUrl: `/${locale}` })}
                className="inline-flex items-center min-h-[44px] px-2 -mr-2 text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)] transition-colors"
              >
                {isRTL ? "خروج" : "Sign out"}
              </button>
            </div>
          </div>
        </header>
        <main
          className={
            isPreview
              ? "w-full md:mx-auto md:max-w-7xl md:px-6 md:py-8"
              : "mx-auto max-w-7xl px-6 py-8"
          }
        >
          {children}
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
