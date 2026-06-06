import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { convexClient, convexClientForUser, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { getPaymentStatus, verifyAndProcessPayment } from "@/lib/myfatoorah";
import { Id } from "@convex/_generated/dataModel";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "trimindai@trimindai.com,90dalal@gmail.com,test@trimindai.com,w.baazm@gmail.com,trimindartificial@gmail.com").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

async function requireAdminAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await currentUser();
  const email = (user?.primaryEmailAddress?.emailAddress || "").toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) throw new Error("Forbidden");
}

/**
 * POST /api/admin/reconcile
 * Re-checks all pending payments against MyFatoorah and updates status.
 *
 * POST /api/admin/reconcile { paymentDocId: "..." }
 * Re-checks a single payment.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdminAuth();
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "Forbidden" ? 403 : 401 });
  }

  const body = await req.json().catch(() => ({}));
  const singlePaymentDocId = body?.paymentDocId as string | undefined;

  try {
    const secret = serverSecret();

    const userClient = await convexClientForUser();
    const allPayments: any[] = await userClient.query(api.admin.getAllPayments);

    let pendingPayments = allPayments.filter((p: any) => p.status === "pending");

    if (singlePaymentDocId) {
      pendingPayments = pendingPayments.filter((p: any) => p._id === singlePaymentDocId);
      if (pendingPayments.length === 0) {
        return NextResponse.json({ error: "Payment not found or not pending" }, { status: 404 });
      }
    }

    const results: Array<{
      paymentId: string;
      invoiceId: string | null;
      portfolioId: string;
      action: "recovered" | "failed" | "still_pending" | "error";
      detail: string;
    }> = [];

    for (const payment of pendingPayments) {
      const invoiceId = payment.myfatoorahInvoiceId;
      if (!invoiceId) {
        results.push({
          paymentId: payment._id,
          invoiceId: null,
          portfolioId: payment.portfolioId,
          action: "error",
          detail: "no_invoice_id",
        });
        continue;
      }

      try {
        const status = await getPaymentStatus(invoiceId);

        if (status.IsSuccess && status.Data.InvoiceStatus === "Paid") {
          const result = await verifyAndProcessPayment(invoiceId);
          results.push({
            paymentId: payment._id,
            invoiceId,
            portfolioId: payment.portfolioId,
            action: "recovered",
            detail: result.ok
              ? result.alreadyProcessed ? "already_completed" : "newly_recovered"
              : `verify_failed: ${result.reason}`,
          });
        } else if (
          status.Data?.InvoiceStatus === "Failed" ||
          status.Data?.InvoiceStatus === "Expired"
        ) {
          await convexClient.mutation(api.payments.markFailed, {
            id: payment._id as Id<"payments">,
            serverSecret: secret,
          });
          results.push({
            paymentId: payment._id,
            invoiceId,
            portfolioId: payment.portfolioId,
            action: "failed",
            detail: `myfatoorah_status=${status.Data.InvoiceStatus}`,
          });
        } else {
          results.push({
            paymentId: payment._id,
            invoiceId,
            portfolioId: payment.portfolioId,
            action: "still_pending",
            detail: `myfatoorah_status=${status.Data?.InvoiceStatus || "unknown"}`,
          });
        }
      } catch (err: any) {
        results.push({
          paymentId: payment._id,
          invoiceId,
          portfolioId: payment.portfolioId,
          action: "error",
          detail: err.message || String(err),
        });
      }
    }

    const summary = {
      total: results.length,
      recovered: results.filter((r) => r.action === "recovered").length,
      failed: results.filter((r) => r.action === "failed").length,
      stillPending: results.filter((r) => r.action === "still_pending").length,
      errors: results.filter((r) => r.action === "error").length,
    };

    console.log(`[reconcile] summary=${JSON.stringify(summary)}`);

    return NextResponse.json({ summary, results });
  } catch (error: any) {
    console.error("[reconcile] error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
