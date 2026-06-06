import { NextRequest, NextResponse } from "next/server";
import { verifyAndProcessPayment } from "@/lib/myfatoorah";

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("paymentId");
  const locale =
    req.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!paymentId) {
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard?error=missing_payment`, baseUrl)
    );
  }

  try {
    const result = await verifyAndProcessPayment(paymentId);

    if (!result.ok) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard?error=payment_failed`, baseUrl)
      );
    }

    return NextResponse.redirect(
      new URL(
        `/${result.locale}/dashboard/${result.portfolioId}/publish?success=1`,
        baseUrl
      )
    );
  } catch (error) {
    console.error("MyFatoorah callback error:", error);
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard?error=verification_failed`, baseUrl)
    );
  }
}
