"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useDashboard } from "@/contexts/DashboardContext";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const FREE_ACCESS_EMAILS = ["fivemlord12@gmail.com"];

export default function NewPortfolioPage() {
  const { userId } = useDashboard();
  const { user } = useUser();
  const createPortfolio = useMutation(api.portfolios.create);
  const createPayment = useMutation(api.payments.create);
  const markPaid = useMutation(api.portfolios.markPaid);
  const [error, setError] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!userId) return;

    async function initiate() {
      try {
        const userEmail = user?.primaryEmailAddress?.emailAddress || "";
        const hasFreeAccess = FREE_ACCESS_EMAILS.includes(userEmail);

        // Create draft portfolio
        const portfolioId = await createPortfolio({
          userId: userId ?? undefined,
          templateId: "corporate",
          locale: "en",
          name: "My Portfolio",
          basics: {
            fullName: user?.fullName || "",
            title: "",
            email: userEmail,
          },
        });

        // Free access — skip payment, go straight to builder
        if (hasFreeAccess) {
          await markPaid({
            id: portfolioId,
            paymentId: "free-access",
          });
          window.location.href = `/en/dashboard/${portfolioId}/edit`;
          return;
        }

        // Create pending payment record
        await createPayment({
          portfolioId,
          userId: userId ?? undefined,
          amount: 1.5,
          currency: "KWD",
        });

        // Initiate MyFatoorah payment
        const res = await fetch("/api/myfatoorah/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolioId,
            userEmail,
            userName: user?.fullName || "Customer",
          }),
        });

        const data = await res.json();

        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          setError(data.error || "Failed to initiate payment");
          setDetails(JSON.stringify(data));
        }
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
          <p className="text-xs text-slate-500 mb-4 max-w-md text-center break-all">{details}</p>
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
      <p className="text-slate-400">Setting up your portfolio...</p>
    </div>
  );
}
