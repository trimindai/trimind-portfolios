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
  const locale = (routeParams.locale as string) || "en";
  const portfolio = useQuery(api.portfolios.get, {
    id: id as Id<"portfolios">,
  });

  if (portfolio === undefined) {
    return (
      <div className="text-center text-[var(--land-body)] py-20">Loading...</div>
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
