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
