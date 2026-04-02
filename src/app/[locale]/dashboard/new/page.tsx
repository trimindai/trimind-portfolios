"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useDashboard } from "@/contexts/DashboardContext";
import { useEffect, useState } from "react";

export default function NewPortfolioPage() {
  const { userId } = useDashboard();
  const createPortfolio = useMutation(api.portfolios.create);
  const markPaid = useMutation(api.portfolios.markPaid);
  const [error, setError] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!userId) return;

    async function initiate() {
      try {
        // Create portfolio
        const portfolioId = await createPortfolio({
          userId: userId ?? undefined,
          templateId: "corporate",
          locale: "en",
          name: "My Portfolio",
          basics: {
            fullName: "",
            title: "",
            email: "",
          },
        });

        // Skip payment for MVP testing — mark as paid directly
        await markPaid({
          id: portfolioId,
          paymentId: "test-free",
        });

        // Redirect to builder
        window.location.href = `/en/dashboard/${portfolioId}/edit`;
      } catch (err: any) {
        setError("Something went wrong. Please try again.");
        setDetails(err?.message || String(err));
      }
    }

    initiate();
  }, [userId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        {details && (
          <p className="text-xs text-slate-500 mb-4 max-w-md text-center">{details}</p>
        )}
        <a
          href="/en/dashboard"
          className="text-emerald-400 hover:text-emerald-300"
        >
          Back to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mb-4" />
      <p className="text-slate-400">Creating your portfolio...</p>
    </div>
  );
}
