import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendPayment } from "@/lib/myfatoorah";
import { convexClient } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

const PRICE_KWD = 1.5;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portfolioId, locale: rawLocale } = await req.json();
    if (!portfolioId) {
      return NextResponse.json(
        { error: "Missing portfolioId" },
        { status: 400 }
      );
    }

    const locale = rawLocale === "ar" ? "ar" : "en";

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || "";
    const name =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      email ||
      "Customer";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    const result = await sendPayment({
      invoiceValue: PRICE_KWD,
      customerName: name,
      customerEmail: email,
      callBackUrl: `${baseUrl}/api/myfatoorah/callback`,
      errorUrl: `${baseUrl}/api/myfatoorah/error?portfolioId=${portfolioId}&locale=${locale}`,
      userDefinedField: `${portfolioId}:${locale}`,
      language: locale === "ar" ? "AR" : "EN",
    });

    if (!result.IsSuccess) {
      return NextResponse.json(
        { error: result.Message || "Payment initiation failed" },
        { status: 400 }
      );
    }

    // Persist pending payment with the MyFatoorah invoice id for later lookup
    await convexClient.mutation(api.payments.create, {
      portfolioId: portfolioId as Id<"portfolios">,
      amount: PRICE_KWD,
      currency: "KWD",
      myfatoorahInvoiceId: String(result.Data.InvoiceId),
    });

    return NextResponse.json({ paymentUrl: result.Data.InvoiceURL });
  } catch (error) {
    console.error("MyFatoorah initiate error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
