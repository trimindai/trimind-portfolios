"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BuilderForm } from "@/components/builder/BuilderForm";
import { use } from "react";

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const portfolio = useQuery(api.portfolios.get, {
    id: id as Id<"portfolios">,
  });

  if (portfolio === undefined) {
    return (
      <div className="text-center text-slate-400 py-20">Loading...</div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center text-red-400 py-20">
        Portfolio not found
      </div>
    );
  }

  if (portfolio.status === "draft") {
    return (
      <div className="text-center text-slate-400 py-20">
        Payment required to access the builder.
        <a href="/en/dashboard" className="text-emerald-400 ml-2">
          Go to Dashboard
        </a>
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
