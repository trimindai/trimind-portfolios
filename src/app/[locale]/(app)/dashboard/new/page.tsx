"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { GUEST_STORAGE_KEY } from "@/components/builder/BuilderForm";

// Keys that live on a Convex portfolio document but must NOT be forwarded to the
// `update` mutation (they're owned by the server / set at create time, or are not
// part of update's args). Used when seeding from a guest localStorage blob.
const GUEST_UPDATE_STRIP_KEYS = new Set([
  "_id",
  "_creationTime",
  "status",
  "slug",
  "generatedHtml",
  "generatedProjectPages",
  "paymentId",
  "publishedAt",
  "createdAt",
  "lastEditedAt",
  "userId",
  "templateId",
  "name",
  "locale",
  "contentAr",
  // basics is sent via create() instead, so don't double-send it through update.
  "basics",
]);

export default function NewPortfolioPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const params = useParams();
  const localeParam = (params.locale as string) || "en";
  const locale = (localeParam === "ar" ? "ar" : "en") as "en" | "ar";
  // create() now derives userId from the session — no client-supplied userId.
  const createPortfolio = useMutation(api.portfolios.create);
  // Used to patch the richer guest blob (experience/projects/skills/...) after
  // create(), since create() only accepts basics.
  const updatePortfolio = useMutation(api.portfolios.update);
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
        const templateId = searchParams.get("template") || "general";

        // Restore draft from landing page try-it form
        const clerkName =
          (user?.unsafeMetadata?.fullName as string) || user?.fullName || "";
        let draftName = clerkName;
        let draftTitle = "";
        try {
          const saved = localStorage.getItem("portfolio-draft");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.fullName) draftName = parsed.fullName;
            if (parsed.title) draftTitle = parsed.title;
            localStorage.removeItem("portfolio-draft");
          }
        } catch {}

        // Restore the richer GUEST builder blob (Task 2.1). When the visitor
        // built a preview unauthenticated then signed up, ?fromGuest=1 tells us
        // to seed this new portfolio from localStorage["portfolio_preview_data"].
        // If both this and "portfolio-draft" exist, the guest blob wins.
        let guestBlob: any = null;
        const fromGuest = searchParams.get("fromGuest") === "1";
        if (fromGuest) {
          try {
            const raw = localStorage.getItem(GUEST_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === "object") guestBlob = parsed;
            }
          } catch {}
        }

        // Merge guest basics over the landing-form draft / Clerk name. Keep any
        // extra optional basics fields the guest filled (bio, location, links...),
        // but never let the three required fields end up empty.
        const guestBasics =
          guestBlob?.basics && typeof guestBlob.basics === "object"
            ? guestBlob.basics
            : {};
        const basics = {
          ...guestBasics,
          fullName: guestBasics.fullName?.trim() || draftName,
          title: guestBasics.title?.trim() || draftTitle,
          email: guestBasics.email?.trim() || userEmail,
        };

        const portfolioId = await createPortfolio({
          templateId,
          locale,
          name: "My Portfolio",
          basics,
        });

        // Patch the rest of the guest content (experience, projects, skills, etc.)
        // through update(), which create() doesn't accept. Strip server-owned keys.
        if (guestBlob) {
          const patch = Object.fromEntries(
            Object.entries(guestBlob).filter(
              ([k, val]) =>
                !GUEST_UPDATE_STRIP_KEYS.has(k) && val !== undefined
            )
          );
          if (Object.keys(patch).length > 0) {
            try {
              await updatePortfolio({ id: portfolioId, ...patch });
            } catch (e) {
              // Non-fatal: portfolio exists with basics; user can re-enter the rest.
              console.error("Guest blob patch failed:", e);
            }
          }
          try {
            localStorage.removeItem(GUEST_STORAGE_KEY);
          } catch {}
        }

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
