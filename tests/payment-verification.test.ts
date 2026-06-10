/**
 * Unit tests for the payment verification core (verifyAndProcessPayment):
 * idempotency, amount floor, status gating, and the KeyType regression.
 * MyFatoorah HTTP + Convex are mocked; no network.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.MYFATOORAH_BASE_URL = "https://mf.test";
process.env.MYFATOORAH_API_KEY = "test-key";

const queryMock = vi.fn();
const mutationMock = vi.fn();

vi.mock("@/lib/convex", () => ({
  convexClient: {
    query: (...a: any[]) => queryMock(...a),
    mutation: (...a: any[]) => mutationMock(...a),
  },
  serverSecret: () => "test-secret",
}));

const { verifyAndProcessPayment, getPaymentStatus } = await import(
  "@/lib/myfatoorah"
);

const fetchMock = vi.fn();
global.fetch = fetchMock as any;

function mfResponse(data: Partial<Record<string, unknown>>, ok = true) {
  return {
    ok,
    json: async () => ({
      IsSuccess: true,
      Message: "",
      Data: {
        InvoiceId: 12345,
        InvoiceStatus: "Paid",
        InvoiceValue: 4.9,
        UserDefinedField: "pf123:en",
        InvoiceTransactions: [],
        ...data,
      },
    }),
    text: async () => "err",
  };
}

beforeEach(() => {
  fetchMock.mockReset();
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue(undefined);
});

describe("getPaymentStatus KeyType", () => {
  it("defaults to PaymentId and honors InvoiceId (reconciliation regression)", async () => {
    fetchMock.mockResolvedValue(mfResponse({}));
    await getPaymentStatus("abc");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).KeyType).toBe("PaymentId");
    await getPaymentStatus("12345", "InvoiceId");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).KeyType).toBe("InvoiceId");
  });
});

describe("verifyAndProcessPayment", () => {
  it("rejects unpaid invoices without touching the DB", async () => {
    fetchMock.mockResolvedValue(mfResponse({ InvoiceStatus: "Pending" }));
    const r = await verifyAndProcessPayment("p1");
    expect(r.ok).toBe(false);
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it("rejects amounts below the tolerance floor (no unlock for 0.100 KD)", async () => {
    fetchMock.mockResolvedValue(mfResponse({ InvoiceValue: 0.1 }));
    queryMock.mockResolvedValue(null);
    const r = await verifyAndProcessPayment("p1");
    expect(r.ok).toBe(false);
    expect((r as any).reason).toBe("amount_mismatch");
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it("is idempotent: already-completed payment short-circuits", async () => {
    fetchMock.mockResolvedValue(mfResponse({}));
    queryMock.mockResolvedValue({ _id: "pay1", status: "completed" });
    const r = await verifyAndProcessPayment("p1");
    expect(r.ok).toBe(true);
    expect((r as any).alreadyProcessed).toBe(true);
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it("marks portfolio paid FIRST, then completes the payment record", async () => {
    fetchMock.mockResolvedValue(mfResponse({}));
    queryMock.mockResolvedValue({ _id: "pay1", status: "pending" });
    const r = await verifyAndProcessPayment("p1");
    expect(r.ok).toBe(true);
    expect(mutationMock).toHaveBeenCalledTimes(2);
    // Order matters: portfolios.markPaid before payments.markCompleted —
    // a crash in between self-heals on retry; the reverse strands a
    // "completed" payment with a locked portfolio.
    const calls = mutationMock.mock.calls.map((c) => c[1]);
    expect(calls[0]).toMatchObject({ paymentId: "12345" });
    expect(calls[1]).toMatchObject({ myfatoorahInvoiceId: "12345" });
  });

  it("rejects when UserDefinedField has no portfolio id", async () => {
    fetchMock.mockResolvedValue(mfResponse({ UserDefinedField: "" }));
    queryMock.mockResolvedValue(null);
    const r = await verifyAndProcessPayment("p1");
    expect(r.ok).toBe(false);
    expect((r as any).reason).toBe("missing_portfolio_id");
  });

  it("creates a missing payment record when initiate's insert failed", async () => {
    fetchMock.mockResolvedValue(mfResponse({}));
    queryMock.mockResolvedValue(null); // no payment row exists
    const r = await verifyAndProcessPayment("p1");
    expect(r.ok).toBe(true);
    // markPaid + payments.create
    expect(mutationMock).toHaveBeenCalledTimes(2);
    expect(mutationMock.mock.calls[1][1]).toMatchObject({
      myfatoorahInvoiceId: "12345",
      amount: 4.9,
      currency: "KWD",
    });
  });
});
