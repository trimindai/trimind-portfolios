"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect, useState } from "react";
import { DashboardContext } from "@/contexts/DashboardContext";
import { Id } from "@convex/_generated/dataModel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertFromClerk);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      upsertUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || undefined,
      }).then((id) => {
        setConvexUserId(id);
        setSynced(true);
      });
    }
  }, [isLoaded, user]);

  if (!isLoaded || !synced) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ userId: convexUserId }}>
      <div className="min-h-screen bg-slate-950">
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <span className="text-xl font-bold text-white tracking-tight">
              Portfolio Pro
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </span>
              <SignOutButton>
                <button className="text-sm text-slate-500 hover:text-white transition-colors">
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
