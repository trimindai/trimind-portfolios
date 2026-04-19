import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendPayment } from "@/lib/myfatoorah";
import {
  convexClient,
  convexClientForUser,
  serverSecret,
} from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { PRICE_KWD } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const portfolioId = body?.portfolioId as string | undefined;
    const rawLocale = body?.locale as string | undefined;
    if (!portfolioId) {
      return NextResponse.json(
        { error: "Missing portfolioId" },
        { status: 400 }
      );
    }
    const locale = rawLocale === "ar" ? "ar" : "en";

    // Ownership: re-fetch portfolio AS the authenticated user. Convex
    // `portfolios.get` enforces ownership and throws otherwise — so a user
    // cannot initiate payment for another user's portfolio.
    const userClient = await convexClientForUser();
    let portfolio;
    try {
      portfolio = await userClient.query(api.portfolios.get, {
        id: portfolioId as Id<"portfolios">,
      });
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    // Already-paid short-circuit (idempotent if user double-clicks).
    if (portfolio.status === "paid" || portfolio.status === "published") {
      return NextResponse.json({
        alreadyPaid: true,
        paymentId: portfolio.paymentId,
      });
    }

    // Double-pay guard: reconcile if a completed payment exists but the
    // portfolio wasn't marked paid (e.g. markPaid failed after callback).
    const existingPayment = await userClient.query(
      api.payments.getByPortfolio,
      { portfolioId: portfolioId as Id<"portfolios"> }
    );
    if (
      existingPayment?.status === "completed" &&
      existingPayment.myfatoorahInvoiceId
    ) {
      await convexClient.mutation(api.portfolios.markPaid, {
        id: portfolioId as Id<"portfolios">,
        paymentId: existingPayment.myfatoorahInvoiceId,
        serverSecret: serverSecret(),
      });
      return NextResponse.json({
        alreadyPaid: true,
        paymentId: existingPayment.myfatoorahInvoiceId,
      });
    }

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

    // Persist the pending payment server-side (frontend can no longer write
    // payment rows directly).
    await convexClient.mutation(api.payments.create, {
      portfolioId: portfolioId as Id<"portfolios">,
      userId: portfolio.userId ?? undefined,
      amount: PRICE_KWD,
      currency: "KWD",
      myfatoorahInvoiceId: String(result.Data.InvoiceId),
      serverSecret: serverSecret(),
    });

    return NextResponse.json({ paymentUrl: result.Data.InvoiceURL });
  } catch (error) {
    console.error("MyFatoorah initiate error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
