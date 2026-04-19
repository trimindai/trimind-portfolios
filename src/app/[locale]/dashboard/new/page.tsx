"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function NewPortfolioPage() {
  const { user, isLoaded } = useUser();
  // create() now derives userId from the session — no client-supplied userId.
  const createPortfolio = useMutation(api.portfolios.create);
  const [error, setError] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function initiate() {
      try {
        const userEmail = user?.primaryEmailAddress?.emailAddress || "";

        // Create draft portfolio (Convex enforces auth; no userId arg).
        const portfolioId = await createPortfolio({
          templateId: "corporate",
          locale: "en",
          name: "My Portfolio",
          basics: {
            fullName: user?.fullName || "",
            title: "",
            email: userEmail,
          },
        });

        // Try free-access first. The endpoint silently returns 403 if not
        // eligible — then we fall through to paid flow.
        const freeRes = await fetch("/api/free-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId }),
        });
        if (freeRes.ok) {
          window.location.href = `/en/dashboard/${portfolioId}/edit`;
          return;
        }

        // Initiate MyFatoorah payment. Server-side route now also creates
        // the pending payment record (frontend can no longer write payments).
        const res = await fetch("/api/myfatoorah/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId, locale: "en" }),
        });

        const data = await res.json();

        if (data.alreadyPaid) {
          window.location.href = `/en/dashboard/${portfolioId}/edit`;
          return;
        }
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
  }, [isLoaded, user]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        {details && (
          <p className="text-xs text-slate-500 mb-4 max-w-md text-center break-all">
            {details}
          </p>
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
