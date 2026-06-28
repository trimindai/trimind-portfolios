/**
 * Free-tier lifetime AI budget guard (route side).
 *
 * Companion to enforceUserRateLimit: that bounds per-day cost; this bounds the
 * LIFETIME cost of a user who never pays. Call it after the daily caps. Returns
 * a ready-to-return 402 NextResponse when a non-paying user is out of trial
 * credits, or null to proceed. Paid users always proceed (charged nothing).
 *
 * Fails OPEN on backend error — consistent with enforceUserRateLimit; a Convex
 * outage already degrades everything, better to not also block AI calls.
 */
import { NextResponse } from "next/server";
import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";

/** Credit cost per AI action. Output-heavy calls (full parse/CV generation)
 *  cost more than a single short chat/summary turn. Budget lives in Convex
 *  (convex/freeTier.ts FREE_AI_CREDIT_BUDGET, default 80). */
export const AI_COST = {
  parseCv: 10,
  fullCv: 10,
  summary: 1,
  chat: 1,
} as const;

export async function enforceFreeTier(
  clerkId: string,
  cost: number,
  message = "You've used your free AI trial. Upgrade to keep building.",
): Promise<NextResponse | null> {
  try {
    const r = await convexClient.mutation(api.freeTier.consumeFreeCredits, {
      clerkId,
      cost,
      serverSecret: serverSecret(),
    });
    if (r.ok) return null;
    return NextResponse.json(
      { error: message, upgrade: true, used: r.used, budget: r.budget },
      { status: 402 },
    );
  } catch (err) {
    console.error("[freeTier] backend error; failing open:", err);
    return null;
  }
}
