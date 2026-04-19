import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  convexClient,
  convexClientForUser,
  serverSecret,
} from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

/**
 * Server-side free-access grant. Replaces the previous frontend code path
 * that called `markPaid` directly (which, combined with the Convex IDOR,
 * let any user mark any portfolio paid for free).
 *
 * Allowlist comes from FREE_ACCESS_EMAILS (comma-separated) in the Vercel env.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const email = (
      user?.primaryEmailAddress?.emailAddress || ""
    ).toLowerCase();

    const allowed = (process.env.FREE_ACCESS_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!email || !allowed.includes(email)) {
      return NextResponse.json({ error: "Not eligible" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const portfolioId = body?.portfolioId as string | undefined;
    if (!portfolioId) {
      return NextResponse.json(
        { error: "Missing portfolioId" },
        { status: 400 }
      );
    }

    // Ownership check: re-fetch as user — throws if they don't own it.
    const userClient = await convexClientForUser();
    try {
      await userClient.query(api.portfolios.get, {
        id: portfolioId as Id<"portfolios">,
      });
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark paid via server secret.
    await convexClient.mutation(api.portfolios.markPaid, {
      id: portfolioId as Id<"portfolios">,
      paymentId: "free-access",
      serverSecret: serverSecret(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("free-access error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
