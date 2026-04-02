"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useDashboard } from "@/contexts/DashboardContext";
import { useEffect, useState } from "react";

export default function NewPortfolioPage() {
  const { userId } = useDashboard();
  const createPortfolio = useMutation(api.portfolios.create);
  const createPayment = useMutation(api.payments.create);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    async function initiate() {
      try {
        // Create draft portfolio
        const portfolioId = await createPortfolio({
          userId,
          templateId: "corporate",
          locale: "en",
          name: "My Portfolio",
          basics: {
            fullName: "",
            title: "",
            email: "",
          },
        });

        // Create pending payment record
        await createPayment({
          portfolioId,
          userId,
          amount: 5,
          currency: "KWD",
        });

        // Initiate MyFatoorah payment
        const res = await fetch("/api/myfatoorah/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolioId,
            userEmail: "",
            userName: "",
          }),
        });

        const data = await res.json();

        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          setError(data.error || "Failed to initiate payment");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      }
    }

    initiate();
  }, [userId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
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
      <p className="text-slate-400">Preparing your payment...</p>
    </div>
  );
}
