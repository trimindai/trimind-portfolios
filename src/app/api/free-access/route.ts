import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  convexClient,
  convexClientForUser,
  serverSecret,
} from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { enforceUserRateLimit } from "@/lib/ratelimit";
import { parseJsonBody } from "@/lib/api-input";
import { z } from "zod";

const FreeAccessSchema = z.object({
  portfolioId: z.string().min(1).max(64),
});

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

    // Cheap guard against grant spam / allowlist probing.
    const limited = await enforceUserRateLimit(userId, "free-access", {
      limit: 10,
      windowMs: 60_000,
    });
    if (limited) return limited;

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

    const parsed = await parseJsonBody(req, {
      schema: FreeAccessSchema,
      maxBytes: 2 * 1024,
    });
    if (!parsed.ok) return parsed.response;
    const { portfolioId } = parsed.data;

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
    // Full detail to server logs only — raw Convex/Clerk error messages can
    // name internal mutations and config, so the client gets a generic body.
    console.error("free-access error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
