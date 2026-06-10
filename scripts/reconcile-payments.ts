/**
 * Reconcile stuck `pending` payments against MyFatoorah.
 *
 *   npx tsx scripts/reconcile-payments.ts --dry-run   # report only
 *   npx tsx scripts/reconcile-payments.ts             # apply changes
 *
 * Env (reads .env.local, overridable via real env):
 *   NEXT_PUBLIC_CONVEX_URL  – Convex deployment
 *   INTERNAL_API_SECRET     – server secret (Convex env holds the canonical
 *                             value: `npx convex env get INTERNAL_API_SECRET`)
 *   MYFATOORAH_BASE_URL / MYFATOORAH_API_KEY – optional; without them the
 *     script only expires stale no-invoice rows and reports the rest.
 *
 * Behavior per pending payment:
 *   - has invoiceId + MyFatoorah says Paid      → markCompleted + markPaid (via verify flow)
 *   - has invoiceId + Failed/Expired            → markFailed
 *   - no invoiceId  + older than 48h            → markFailed (abandoned checkout —
 *     no invoice was ever created, so it can never complete)
 *   - anything else                             → left pending, reported
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");
const STALE_MS = 48 * 60 * 60 * 1000;

function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
      const i = line.indexOf("=");
      if (i > 0) out[line.slice(0, i)] = line.slice(i + 1).replace(/^"|"$/g, "");
    }
  } catch {}
  for (const k of Object.keys(process.env)) out[k] = process.env[k]!;
  return out;
}

const env = loadEnv();
const CONVEX_URL = env.NEXT_PUBLIC_CONVEX_URL;
const SECRET = env.INTERNAL_API_SECRET;
const MF_BASE = env.MYFATOORAH_BASE_URL;
const MF_KEY = env.MYFATOORAH_API_KEY;

if (!CONVEX_URL || !SECRET) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL or INTERNAL_API_SECRET.");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

async function mfStatus(invoiceId: string) {
  const res = await fetch(`${MF_BASE}/v2/GetPaymentStatus`, {
    method: "POST",
    headers: { Authorization: `Bearer ${MF_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ Key: invoiceId, KeyType: "InvoiceId" }),
  });
  if (!res.ok) throw new Error(`GetPaymentStatus HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const pending: any[] = await convex.query("payments:listPending" as any, {
    serverSecret: SECRET,
  });
  console.log(`${pending.length} pending payment(s). dry-run=${DRY_RUN}\n`);

  const summary = { recovered: 0, failed: 0, stalePurged: 0, stillPending: 0, errors: 0 };

  for (const p of pending) {
    const age = Date.now() - p.createdAt;
    const label = `${p._id} invoice=${p.myfatoorahInvoiceId ?? "—"} amount=${p.amount} age=${Math.round(age / 36e5)}h`;

    try {
      if (!p.myfatoorahInvoiceId) {
        if (age > STALE_MS) {
          console.log(`STALE   ${label} → markFailed (no invoice was ever created)`);
          if (!DRY_RUN) {
            await convex.mutation("payments:markFailed" as any, { id: p._id, serverSecret: SECRET });
          }
          summary.stalePurged++;
        } else {
          console.log(`WAIT    ${label} (no invoice yet, <48h)`);
          summary.stillPending++;
        }
        continue;
      }

      if (!MF_KEY || !MF_BASE) {
        console.log(`SKIP    ${label} (no MYFATOORAH_API_KEY locally — run /api/cron/reconcile in prod)`);
        summary.stillPending++;
        continue;
      }

      const status = await mfStatus(p.myfatoorahInvoiceId);
      const invoiceStatus = status?.Data?.InvoiceStatus ?? "unknown";

      if (status?.IsSuccess && invoiceStatus === "Paid") {
        console.log(`PAID    ${label} → recover (markPaid + markCompleted)`);
        if (!DRY_RUN) {
          await convex.mutation("portfolios:markPaid" as any, {
            id: p.portfolioId, paymentId: String(p.myfatoorahInvoiceId), serverSecret: SECRET,
          });
          await convex.mutation("payments:markCompleted" as any, {
            id: p._id, myfatoorahInvoiceId: String(p.myfatoorahInvoiceId), serverSecret: SECRET,
          });
        }
        summary.recovered++;
      } else if (invoiceStatus === "Failed" || invoiceStatus === "Expired" || age > STALE_MS) {
        console.log(`FAILED  ${label} myfatoorah=${invoiceStatus} → markFailed`);
        if (!DRY_RUN) {
          await convex.mutation("payments:markFailed" as any, { id: p._id, serverSecret: SECRET });
        }
        summary.failed++;
      } else {
        console.log(`PENDING ${label} myfatoorah=${invoiceStatus}`);
        summary.stillPending++;
      }
    } catch (e: any) {
      console.log(`ERROR   ${label}: ${e.message}`);
      summary.errors++;
    }
  }

  console.log(`\nSummary ${DRY_RUN ? "(dry-run — nothing changed)" : "(applied)"}:`, summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
