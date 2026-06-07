"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BuilderForm } from "@/components/builder/BuilderForm";
import { use } from "react";
import { useParams } from "next/navigation";

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const routeParams = useParams();
  const portfolio = useQuery(api.portfolios.get, {
    id: id as Id<"portfolios">,
  });

  if (portfolio === undefined) {
    return (
      <div className="py-8 space-y-6 animate-pulse">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--land-border)]/30 bg-[var(--land-surface)]/30 px-4 py-3">
          <div className="h-4 w-4 rounded-full bg-[var(--land-border)]/40" />
          <div className="flex-1 h-4 rounded bg-[var(--land-border)]/30" />
          <div className="w-24 h-2 rounded-full bg-[var(--land-border)]/30" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 shrink-0 rounded-lg bg-[var(--land-border)]/20" />
          ))}
        </div>
        <div className="rounded-2xl border border-[var(--land-border)]/30 bg-[var(--land-surface)]/20 p-6 space-y-4">
          <div className="h-6 w-40 rounded bg-[var(--land-border)]/30" />
          <div className="space-y-3">
            <div className="h-10 rounded-lg bg-[var(--land-border)]/20" />
            <div className="h-10 rounded-lg bg-[var(--land-border)]/20" />
          </div>
        </div>
        <div className="flex justify-between pt-2">
          <div className="h-11 w-11 rounded-lg bg-[var(--land-border)]/20" />
          <div className="h-11 w-28 rounded-lg bg-[var(--land-border)]/30" />
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center text-red-400 py-20">
        Portfolio not found
      </div>
    );
  }

  return (
    <BuilderForm
      portfolioId={portfolio._id}
      initialData={portfolio}
    />
  );
}
