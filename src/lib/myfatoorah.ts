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
  /** Digits only, no country code (e.g. "51234567"). Enables SMS/email delivery. */
  customerMobile?: string;
  /** e.g. "+965" (Kuwait). Required by MyFatoorah whenever CustomerMobile is set. */
  mobileCountryCode?: string;
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
      // We now collect a customer mobile at checkout, so we use "ALL" — the
      // invoice is delivered by SMS + email AND we still redirect the browser to
      // Data.InvoiceURL. "ALL" makes CustomerMobile + MobileCountryCode
      // mandatory, so we only send it when a mobile is present; otherwise we
      // fall back to "LNK" (link only) to avoid the historic
      // "CustomerMobile is mandatory" failure.
      NotificationOption: params.customerMobile ? "ALL" : "LNK",
      InvoiceValue: params.invoiceValue,
      DisplayCurrencyIso: "KWD",
      CustomerName: params.customerName,
      CustomerEmail: params.customerEmail,
      ...(params.customerMobile
        ? {
            CustomerMobile: params.customerMobile,
            MobileCountryCode: params.mobileCountryCode || "+965",
          }
        : {}),
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

export type MyFatoorahKeyType = "PaymentId" | "InvoiceId";

export async function getPaymentStatus(
  key: string,
  keyType: MyFatoorahKeyType = "PaymentId"
): Promise<PaymentStatusResponse> {
  const response = await fetch(`${MYFATOORAH_BASE_URL}/v2/GetPaymentStatus`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MYFATOORAH_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Key: key,
      // Callbacks/webhooks carry a PaymentId; reconciliation only has our
      // stored InvoiceId. Sending an InvoiceId as KeyType=PaymentId makes
      // MyFatoorah error on every row (which silently broke reconciliation).
      KeyType: keyType,
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
  paymentId: string,
  keyType: MyFatoorahKeyType = "PaymentId"
): Promise<VerifyResult> {
  const secret = serverSecret();
  const status = await getPaymentStatus(paymentId, keyType);

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

  // Mark portfolio paid FIRST — if this fails, the payment stays pending and
  // the next callback/webhook retry will re-attempt. Marking the payment
  // completed first would leave a "completed" payment with no unlocked portfolio.
  let resolvedPortfolioId = portfolioId;
  try {
    await convexClient.mutation(api.portfolios.markPaid, {
      id: portfolioId as Id<"portfolios">,
      paymentId: invoiceId,
      serverSecret: secret,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("not found") && existing?.userId) {
      // Portfolio was deleted/recreated — fall back to the user's current draft.
      const fallbackId = await convexClient.mutation(api.portfolios.markPaidByUser, {
        userId: existing.userId,
        paymentId: invoiceId,
        serverSecret: secret,
      });
      resolvedPortfolioId = fallbackId;
      console.log(`[payment] portfolio ${portfolioId} gone, fell back to ${fallbackId} for user ${existing.userId}`);
    } else {
      throw e;
    }
  }

  if (existing) {
    await convexClient.mutation(api.payments.markCompleted, {
      id: existing._id,
      myfatoorahInvoiceId: invoiceId,
      serverSecret: secret,
    });
  } else {
    // No payment record (initiate's payments.create may have failed).
    // Create one now so the payment is auditable.
    await convexClient.mutation(api.payments.create, {
      portfolioId: resolvedPortfolioId as Id<"portfolios">,
      amount: status.Data.InvoiceValue,
      currency: "KWD",
      myfatoorahInvoiceId: invoiceId,
      serverSecret: secret,
    });
    console.log(`[payment] created missing payment record for invoice ${invoiceId}`);
  }

  return { ok: true, invoiceId, portfolioId: resolvedPortfolioId as string, locale, alreadyProcessed: false };
}
