"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";

export default function NewPortfolioPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const params = useParams();
  const localeParam = (params.locale as string) || "en";
  const locale = (localeParam === "ar" ? "ar" : "en") as "en" | "ar";
  // create() now derives userId from the session — no client-supplied userId.
  const createPortfolio = useMutation(api.portfolios.create);
  const [error, setError] = useState("");
  const [details, setDetails] = useState("");
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || initiatedRef.current) return;
    initiatedRef.current = true;

    async function initiate() {
      try {
        const userEmail = user?.primaryEmailAddress?.emailAddress || "";

        // Create draft portfolio (Convex enforces auth; no userId arg).
        const templateId = searchParams.get("template") || "corporate";
        const portfolioId = await createPortfolio({
          templateId,
          locale,
          name: "My Portfolio",
          basics: {
            fullName: user?.fullName || "",
            title: "",
            email: userEmail,
          },
        });

        // Try free-access silently (for admin/allowlisted emails).
        fetch("/api/free-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId }),
        }).catch(() => {});

        // Go straight to the editor — payment happens at publish time.
        window.location.href = `/${locale}/dashboard/${portfolioId}/edit`;
      } catch (err: any) {
        setError("Something went wrong. Please try again.");
        setDetails(err?.message || String(err));
      }
    }

    initiate();
  }, [isLoaded, user, createPortfolio, searchParams, locale]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        {details && (
          <p className="text-xs text-[var(--land-muted)] mb-4 max-w-md text-center break-all">
            {details}
          </p>
        )}
        <a
          href={`/${locale}/dashboard`}
          className="text-[var(--land-accent-hover)] hover:text-[var(--land-accent-hover)]"
        >
          Back to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin h-8 w-8 border-2 border-[var(--land-accent)] border-t-transparent rounded-full mb-4" />
      <p className="text-[var(--land-body)]">Setting up your portfolio...</p>
    </div>
  );
}
