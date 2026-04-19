import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/myfatoorah";
import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { PRICE_KWD, PRICE_TOLERANCE } from "@/lib/pricing";

/**
 * MyFatoorah redirect callback. The user has no Clerk session here — this is
 * a server-to-server trust path:
 *  1. We re-fetch the payment status from MyFatoorah using OUR API key
 *     (so the paymentId in the URL alone proves nothing — it's verified).
 *  2. We pass the shared INTERNAL_API_SECRET to Convex mutations so they
 *     accept the call without a user JWT.
 */
export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("paymentId");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const secret = serverSecret();

  if (!paymentId) {
    return NextResponse.redirect(
      new URL("/en/dashboard?error=missing_payment", baseUrl)
    );
  }

  try {
    const status = await getPaymentStatus(paymentId);

    // Parse UserDefinedField we set at initiate: "portfolioId:locale"
    const [portfolioId, localeRaw] = (
      status.Data?.UserDefinedField || ""
    ).split(":");
    const locale = localeRaw === "ar" ? "ar" : "en";

    if (!status.IsSuccess || status.Data.InvoiceStatus !== "Paid") {
      const dest = portfolioId
        ? `/${locale}/dashboard/${portfolioId}/preview?error=payment_failed`
        : `/${locale}/dashboard?error=payment_failed`;
      return NextResponse.redirect(new URL(dest, baseUrl));
    }

    if (!portfolioId) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard?error=invalid_payment_data`, baseUrl)
      );
    }

    const invoiceId = String(status.Data.InvoiceId);

    // Idempotent lookup by invoice id (server-secret query).
    const existing = await convexClient.query(api.payments.getByInvoice, {
      myfatoorahInvoiceId: invoiceId,
      serverSecret: secret,
    });

    if (existing?.status === "completed") {
      return NextResponse.redirect(
        new URL(
          `/${locale}/dashboard/${portfolioId}/publish?success=1`,
          baseUrl
        )
      );
    }

    // Verify amount matches (allow small tolerance for FX rounding).
    if (status.Data.InvoiceValue < PRICE_KWD * PRICE_TOLERANCE) {
      return NextResponse.redirect(
        new URL(
          `/${locale}/dashboard/${portfolioId}/preview?error=amount_mismatch`,
          baseUrl
        )
      );
    }

    if (existing) {
      await convexClient.mutation(api.payments.markCompleted, {
        id: existing._id,
        myfatoorahInvoiceId: invoiceId,
        serverSecret: secret,
      });
    }

    await convexClient.mutation(api.portfolios.markPaid, {
      id: portfolioId as Id<"portfolios">,
      paymentId: invoiceId,
      serverSecret: secret,
    });

    return NextResponse.redirect(
      new URL(`/${locale}/dashboard/${portfolioId}/publish?success=1`, baseUrl)
    );
  } catch (error) {
    console.error("MyFatoorah callback error:", error);
    return NextResponse.redirect(
      new URL("/en/dashboard?error=verification_failed", baseUrl)
    );
  }
}
