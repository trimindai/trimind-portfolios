import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const portfolioId = req.nextUrl.searchParams.get("portfolioId");
  const locale =
    req.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  const dest = portfolioId
    ? `/${locale}/dashboard/${portfolioId}/preview?error=payment_cancelled`
    : `/${locale}/dashboard?error=payment_cancelled`;

  return NextResponse.redirect(new URL(dest, baseUrl));
}
