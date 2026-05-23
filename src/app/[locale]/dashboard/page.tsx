"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useDashboard } from "@/contexts/DashboardContext";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";

export default function DashboardPage() {
  const { userId } = useDashboard();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const portfolios = useQuery(api.portfolios.listByUser, {});
  const removePortfolio = useMutation(api.portfolios.remove);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleNewPortfolio = () => {
    router.push(`/${locale}/dashboard/new`);
  };

  if (!userId || portfolios === undefined) {
    return (
      <div className="text-center text-[var(--land-body)] py-20">Loading...</div>
    );
  }

  // Show all portfolios — not just paid ones.
  const hasPortfolios = portfolios.length > 0;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await removePortfolio({ id: id as Id<"portfolios"> });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">My Portfolios</h1>
        <button
          onClick={handleNewPortfolio}
          className="rounded-lg bg-[var(--land-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
        >
          + New Portfolio
        </button>
      </div>

      {!hasPortfolios ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-[var(--land-body)] mb-6 text-center max-w-md">
            Create a stunning professional portfolio in minutes. One-time
            payment, lifetime access.
          </p>
          <div className="rounded-2xl border border-[var(--land-accent)]/30 bg-[var(--land-surface)]/80 p-8 max-w-sm w-full text-center">
            <div className="text-5xl font-bold text-[var(--land-accent-hover)]">
              1.500 KD
            </div>
            <div className="mt-1 text-[var(--land-body)]">
              One-time payment (~$5 USD)
            </div>
            <ul className="mt-6 space-y-2 text-start text-sm text-[var(--land-bright)]">
              <li className="flex items-center gap-2">
                <span className="text-[var(--land-accent)]">&#10003;</span>{" "}
                Professional corporate template
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--land-accent)]">&#10003;</span>{" "}
                Custom colors & fonts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--land-accent)]">&#10003;</span> PDF
                with QR code
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--land-accent)]">&#10003;</span>{" "}
                Hosted on portfolio-trimind.com
              </li>
            </ul>
            <button
              onClick={handleNewPortfolio}
              className="mt-6 w-full rounded-lg bg-[var(--land-accent)] py-3 font-semibold text-white hover:bg-[var(--land-accent-hover)] transition-colors"
            >
              Get Started — 1.500 KD
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio._id}
              className="rounded-xl border border-[var(--land-border)] bg-[var(--land-surface)]/50 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white truncate">
                  {portfolio.basics.fullName || portfolio.name}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                    portfolio.status === "published"
                      ? "bg-[var(--land-accent)]/20 text-[var(--land-accent-hover)]"
                      : portfolio.status === "paid"
                        ? "bg-amber-600/20 text-amber-400"
                        : "bg-[var(--land-border)]/50 text-[var(--land-body)]"
                  }`}
                >
                  {portfolio.status}
                </span>
              </div>
              <p className="text-sm text-[var(--land-body)] mb-2">
                {portfolio.basics.title || "Untitled"}
              </p>
              {portfolio.slug && (
                <p className="text-xs text-[var(--land-muted)] font-mono mb-2">
                  /p/{portfolio.slug}
                </p>
              )}
              <div className="text-xs text-[var(--land-muted)] mb-4">
                Last edited:{" "}
                {new Date(portfolio.lastEditedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* Edit — available for all statuses */}
                <Link
                  href={`/dashboard/${portfolio._id}/edit`}
                  className="flex-1 text-center rounded-lg border border-[var(--land-border)] px-3 py-1.5 text-sm text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)] transition-colors"
                >
                  Edit
                </Link>
                {/* Preview — available for all statuses */}
                <Link
                  href={`/dashboard/${portfolio._id}/preview`}
                  className="flex-1 text-center rounded-lg border border-[var(--land-border)] px-3 py-1.5 text-sm text-[var(--land-bright)] hover:bg-[var(--land-surface-raised)] transition-colors"
                >
                  Preview
                </Link>
                {/* Publish — for draft and paid portfolios */}
                {portfolio.status !== "published" && (
                  <Link
                    href={`/dashboard/${portfolio._id}/publish`}
                    className="flex-1 text-center rounded-lg bg-[var(--land-accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--land-accent-hover)] transition-colors"
                  >
                    Publish
                  </Link>
                )}
                {/* View live — for published portfolios */}
                {portfolio.status === "published" && portfolio.slug && (
                  <a
                    href={`/p/${portfolio.slug}`}
                    target="_blank"
                    rel="noopener"
                    className="flex-1 text-center rounded-lg bg-[var(--land-accent)]/20 px-3 py-1.5 text-sm text-[var(--land-accent-hover)] hover:bg-[var(--land-accent)]/30 transition-colors"
                  >
                    View
                  </a>
                )}
                {/* Delete */}
                {confirmDeleteId === portfolio._id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(portfolio._id)}
                      disabled={deletingId === portfolio._id}
                      className="rounded-lg bg-red-600/20 px-3 py-1.5 text-sm text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-50"
                    >
                      {deletingId === portfolio._id ? "..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg border border-[var(--land-border)] px-3 py-1.5 text-sm text-[var(--land-muted)] hover:text-[var(--land-bright)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(portfolio._id)}
                    className="rounded-lg border border-[var(--land-border)] px-2 py-1.5 text-sm text-[var(--land-muted)] hover:text-red-400 hover:border-red-400/30 transition-colors"
                    title="Delete"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
