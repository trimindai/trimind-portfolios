import { NextRequest, NextResponse } from "next/server";
import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { getPaymentStatus, verifyAndProcessPayment } from "@/lib/myfatoorah";
import { Id } from "@convex/_generated/dataModel";
import { secureCompare } from "@/lib/secure-compare";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || !secureCompare(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const secret = serverSecret();
  // listPending is server-secret-gated. (Previously this called the
  // admin-gated getAllPayments with the anonymous client, which always threw
  // Unauthenticated — the cron reconciler never actually worked.)
  const pendingAll = await convexClient.query(api.payments.listPending, {
    serverSecret: secret,
  });
  const pending = pendingAll.filter((p: any) => p.myfatoorahInvoiceId);

  const results: Array<{ id: string; action: string }> = [];
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

  for (const payment of pending) {
    try {
      const invoiceId = payment.myfatoorahInvoiceId!;
      const status = await getPaymentStatus(invoiceId);

      if (status.IsSuccess && status.Data.InvoiceStatus === "Paid") {
        await verifyAndProcessPayment(invoiceId);
        results.push({ id: payment._id, action: "recovered" });
      } else if (
        status.Data?.InvoiceStatus === "Failed" ||
        status.Data?.InvoiceStatus === "Expired" ||
        Date.now() - payment.createdAt > FORTY_EIGHT_HOURS
      ) {
        await convexClient.mutation(api.payments.markFailed, {
          id: payment._id as Id<"payments">,
          serverSecret: secret,
        });
        results.push({ id: payment._id, action: "expired" });
      } else {
        results.push({ id: payment._id, action: "still_pending" });
      }
    } catch (e: any) {
      results.push({ id: payment._id, action: `error: ${e.message}` });
    }
  }

  const summary = {
    total: pending.length,
    recovered: results.filter((r) => r.action === "recovered").length,
    expired: results.filter((r) => r.action === "expired").length,
    stillPending: results.filter((r) => r.action === "still_pending").length,
    timestamp: new Date().toISOString(),
  };

  console.log(`[cron/reconcile] ${JSON.stringify(summary)}`);
  return NextResponse.json(summary);
}
