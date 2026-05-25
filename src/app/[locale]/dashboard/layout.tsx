"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect, useState } from "react";
import { DashboardContext } from "@/contexts/DashboardContext";
import { Id } from "@convex/_generated/dataModel";
import { AdminLink } from "@/components/AdminLink";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
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
        <div className="text-[var(--land-body)] text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ userId }}>
      <div className="min-h-screen bg-[var(--land-bg)]">
        <header className="border-b border-[var(--land-border)] bg-[var(--land-bg)]/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <span className="text-xl font-bold text-white tracking-tight">
              Portfolio Pro
            </span>
            <div className="flex items-center gap-4">
              <AdminLink />
              <span className="text-sm text-[var(--land-body)]">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </span>
              <SignOutButton>
                <button className="text-sm text-[var(--land-muted)] hover:text-white transition-colors">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </div>
    </DashboardContext.Provider>
  );
}
