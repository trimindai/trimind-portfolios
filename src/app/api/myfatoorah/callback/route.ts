import { NextRequest, NextResponse } from "next/server";
import { convexClient } from "@/lib/convex";
import { api } from "@convex/_generated/api";

export async function GET(req: NextRequest) {
  try {
    const paymentId = req.nextUrl.searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.redirect(
        new URL("/en/dashboard?error=missing_payment", req.url)
      );
    }

    // Verify payment with MyFatoorah
    const response = await fetch(
      `${process.env.MYFATOORAH_BASE_URL}/v2/GetPaymentStatus`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Key: paymentId,
          KeyType: "PaymentId",
        }),
      }
    );

    const data = await response.json();

    if (data.IsSuccess && data.Data.InvoiceStatus === "Paid") {
      const invoiceId = String(data.Data.InvoiceId);
      const portfolioId = data.Data.UserDefinedField;

      // Mark payment completed in Convex
      const payment = await convexClient.query(api.payments.getByPortfolio, {
        portfolioId,
      });

      if (payment) {
        await convexClient.mutation(api.payments.markCompleted, {
          id: payment._id,
          myfatoorahInvoiceId: invoiceId,
        });
      }

      // Mark portfolio as paid
      await convexClient.mutation(api.portfolios.markPaid, {
        id: portfolioId,
        paymentId: invoiceId,
      });

      return NextResponse.redirect(
        new URL(`/en/dashboard/${portfolioId}/edit`, req.url)
      );
    }

    return NextResponse.redirect(
      new URL("/en/dashboard?error=payment_failed", req.url)
    );
  } catch (error) {
    console.error("MyFatoorah callback error:", error);
    return NextResponse.redirect(
      new URL("/en/dashboard?error=payment_error", req.url)
    );
  }
}
