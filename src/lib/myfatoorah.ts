import { convexClient, serverSecret } from "@/lib/convex";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { PRICE_KWD, PRICE_TOLERANCE } from "@/lib/pricing";

const MYFATOORAH_BASE_URL = process.env.MYFATOORAH_BASE_URL!;
const MYFATOORAH_API_KEY = process.env.MYFATOORAH_API_KEY!;

interface SendPaymentParams {
  invoiceValue: number;
  customerName: string;
  customerEmail: string;
  callBackUrl: string;
  errorUrl: string;
  userDefinedField: string;
  language?: "EN" | "AR";
}

interface SendPaymentResponse {
  IsSuccess: boolean;
  Message: string;
  Data: {
    InvoiceId: number;
    InvoiceURL: string;
  };
}

interface PaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  Data: {
    InvoiceId: number;
    InvoiceStatus: string;
    InvoiceValue: number;
    CustomerName: string;
    CustomerEmail: string;
    UserDefinedField: string;
    InvoiceTransactions: Array<{
      TransactionStatus: string;
      PaymentId: string;
      TransactionId: string;
    }>;
  };
}

export async function sendPayment(
  params: SendPaymentParams
): Promise<SendPaymentResponse> {
  const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/SendPayment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MYFATOORAH_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // "LNK" = return an invoice link only. We redirect the browser to
      // Data.InvoiceURL, so MyFatoorah does NOT need to SMS/email the invoice.
      // "ALL" (SMS+email) makes CustomerMobile mandatory — and we never send a
      // mobile, so every SendPayment failed with "CustomerMobile is mandatory".
      NotificationOption: "LNK",
      InvoiceValue: params.invoiceValue,
      DisplayCurrencyIso: "KWD",
      CustomerName: params.customerName,
      CustomerEmail: params.customerEmail,
      CallBackUrl: params.callBackUrl,
      ErrorUrl: params.errorUrl,
      Language: params.language || "EN",
      UserDefinedField: params.userDefinedField,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MyFatoorah SendPayment failed: ${text}`);
  }

  return response.json();
}

export async function getPaymentStatus(
  paymentId: string
): Promise<PaymentStatusResponse> {
  const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/GetPaymentStatus`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MYFATOORAH_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Key: paymentId,
      KeyType: "PaymentId",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MyFatoorah GetPaymentStatus failed: ${text}`);
  }

  return response.json();
}

export type VerifyResult =
  | { ok: true; invoiceId: string; portfolioId: string; locale: string; alreadyProcessed: boolean }
  | { ok: false; reason: string };

/**
 * Shared server-side payment verification + idempotent DB update.
 * Used by: callback route, webhook route, and reconciliation.
 */
export async function verifyAndProcessPayment(
  paymentId: string
): Promise<VerifyResult> {
  const secret = serverSecret();
  const status = await getPaymentStatus(paymentId);

  const [portfolioId, localeRaw] = (
    status.Data?.UserDefinedField || ""
  ).split(":");
  const locale = localeRaw === "ar" ? "ar" : "en";

  if (!status.IsSuccess || status.Data.InvoiceStatus !== "Paid") {
    return { ok: false, reason: `status=${status.Data?.InvoiceStatus || "unknown"}` };
  }

  if (!portfolioId) {
    return { ok: false, reason: "missing_portfolio_id" };
  }

  const invoiceId = String(status.Data.InvoiceId);

  const existing = await convexClient.query(api.payments.getByInvoice, {
    myfatoorahInvoiceId: invoiceId,
    serverSecret: secret,
  });

  if (existing?.status === "completed") {
    return { ok: true, invoiceId, portfolioId, locale, alreadyProcessed: true };
  }

  if (status.Data.InvoiceValue < PRICE_KWD * PRICE_TOLERANCE) {
    return { ok: false, reason: "amount_mismatch" };
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

  return { ok: true, invoiceId, portfolioId, locale, alreadyProcessed: false };
}
