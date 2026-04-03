import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portfolioId, userEmail, userName } = await req.json();

    const response = await fetch(
      `${process.env.MYFATOORAH_BASE_URL}/v2/ExecutePayment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PaymentMethodId: 2,
          InvoiceValue: 1.5,
          CurrencyIso: "KWD",
          CallBackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/myfatoorah/callback`,
          ErrorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/myfatoorah/callback`,
          CustomerName: userName || "Customer",
          CustomerEmail: userEmail || "",
          Language: "en",
          UserDefinedField: portfolioId,
        }),
      }
    );

    const data = await response.json();

    if (!data.IsSuccess) {
      return NextResponse.json(
        { error: data.Message || "Payment initiation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ paymentUrl: data.Data.PaymentURL });
  } catch (error) {
    console.error("MyFatoorah initiate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
