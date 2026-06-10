import { NextRequest, NextResponse } from "next/server";
import { verifyAndProcessPayment } from "@/lib/myfatoorah";
import { secureCompare } from "@/lib/secure-compare";

/**
 * MyFatoorah server-to-server webhook. Fires regardless of the user's browser.
 *
 * Security:
 *  1. Shared secret in query param — reject requests without it.
 *  2. We never trust the webhook payload — we re-verify via getPaymentStatus()
 *     with our API key (same as the callback route).
 *
 * Configure in MyFatoorah dashboard → Settings → Webhook:
 *   URL: https://portfolio-trimind.com/api/myfatoorah/webhook?secret=<MYFATOORAH_WEBHOOK_SECRET>
 */
export async function POST(req: NextRequest) {
  // Secret accepted from a header (preferred — query strings land in proxy/CDN
  // logs) or the legacy ?secret= param (what the MyFatoorah dashboard URL
  // field supports). Comparison is constant-time.
  const secret =
    req.headers.get("x-webhook-secret") ||
    req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.MYFATOORAH_WEBHOOK_SECRET;

  if (!expectedSecret || !secureCompare(secret, expectedSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { Data?: { InvoiceId?: number; PaymentId?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const invoiceId = body?.Data?.InvoiceId;
  const paymentId = body?.Data?.PaymentId;
  const key = paymentId || (invoiceId ? String(invoiceId) : null);

  if (!key) {
    return NextResponse.json({ error: "missing_payment_id" }, { status: 400 });
  }

  try {
    const result = await verifyAndProcessPayment(key);
    console.log(`[webhook] payment=${key} result=${JSON.stringify(result)}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[webhook] error:", error);
    return NextResponse.json(
      { error: "verification_failed" },
      { status: 500 }
    );
  }
}
