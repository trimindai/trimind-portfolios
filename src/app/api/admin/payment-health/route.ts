import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { ADMIN_EMAILS } from "@/lib/admin";

/**
 * GET /api/admin/payment-health — payment status counts + how long the oldest
 * pending payment has been stuck. Admin-only. Also usable as a quick health
 * probe after deploys (a growing `pending` count means webhooks/callbacks are
 * failing again).
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await currentUser();
  const email = (user?.primaryEmailAddress?.emailAddress || "").toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const counts = await convexClient.query(api.payments.statusCounts, {
      serverSecret: serverSecret(),
    });
    const oldestPendingAgeHours =
      counts.oldestPendingAt === null
        ? null
        : Math.round((Date.now() - counts.oldestPendingAt) / 36e5);
    return NextResponse.json({
      pending: counts.pending,
      completed: counts.completed,
      failed: counts.failed,
      other: counts.other,
      total: counts.total,
      oldestPendingAgeHours,
      healthy: counts.pending === 0 || (oldestPendingAgeHours ?? 0) < 2,
    });
  } catch (error) {
    console.error("[payment-health] error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
