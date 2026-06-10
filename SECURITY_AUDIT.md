# Security Audit Report — Portfolio Pro

Date: 2026-06-10
Auditor: Claude Code (4 parallel specialist passes: Convex auth/IDOR, API routes, Handlebars XSS/SSTI, secrets/env) + manual verification.
Scope: full codebase (`convex/`, `src/app/api/`, `src/app/p/`, `src/templates/`, `src/lib/`, config), npm dependency tree, git history, Vercel + Convex environment, live production probes.

Overall posture before this session was already good — ownership enforced via real helpers (`requireOwner`/`requireAdminOrOwner` derive identity from the Clerk JWT, never client args), explicit `v.*` validators everywhere (zero `v.any()`), constant-time server-secret comparison in Convex, price as a server constant, payment status always re-verified against MyFatoorah. The findings below are what was actually wrong.

## Critical (fixed)

1. **Stored XSS in published portfolios — `{{{basics.bio}}}` ×2 and `{{{basics.valueProposition}}}` unescaped** (`src/templates/general/template.hbs:1216,1220,1234`). User- or Gemini-generated free text rendered raw into pages served as `text/html` on portfolio-trimind.com, with a CSP that allows `unsafe-inline` — a working stored XSS on the apex origin shared with the authenticated dashboard. **Fix (`21d892d`):** new `nl2br` helper (escape first, then `\n`→`<br>`); these were the only raw free-text sinks (all other `{{{ }}}` route through `safeScriptJson`/controlled helpers — each one enumerated and verified).

## High (fixed)

2. **`publish` mutation accepted finished HTML from the browser** (`convex/portfolios.ts`). A paid user could bypass `/api/generate` and publish arbitrary markup (inline script) hosted on our origin. **Fix (`aa62e28`):** new `/api/publish` renders server-side from the *stored* portfolio data (+ pre-renders project pages); `publish` now requires the server secret, so the browser can never supply HTML.
3. **DOM XSS in the creative template's mobile cube** (`creative/template.hbs:618`): faces built via `innerHTML` string-concat from `getAttribute('src')` (attribute-decoded), so a `coverUrl` like `https://x/" ><img onerror=…>` broke out. **Fix (`21d892d`):** DOM APIs (`createElement`/`setAttribute`).
4. **npm: 1 critical + 4 high CVEs** (@clerk/nextjs ≤7.2.3 critical; @clerk/backend, @clerk/react, next, fast-uri high). **Fix (`52690cc`):** upgraded (@clerk/nextjs 7.5.1, next 15.5.19). Remaining: 2 moderate transitive postcss pins inside next 15 — clearing them requires the Next 16 major (deferred, tracked below).
5. **Production env was missing `MYFATOORAH_WEBHOOK_SECRET`, `CRON_SECRET`, `ADMIN_EMAILS`** — so the webhook endpoint 401-rejected *every* MyFatoorah webhook, `/api/admin/reconcile` always returned Forbidden in prod, and the cron secret compared against `Bearer undefined`. **Fix:** all three added to Vercel production (webhook + cron secrets freshly generated). ⚠️ **User action:** register the webhook URL in the MyFatoorah vendor dashboard (Settings → Webhook): `https://portfolio-trimind.com/api/myfatoorah/webhook?secret=<MYFATOORAH_WEBHOOK_SECRET>` (value in Vercel env / `.env.local`). Until then the callback redirect + 6-hourly cron carry recovery.

## Medium (fixed)

6. **`getBySlug` over-fetch / PII leak**: the public Convex query returned the *entire* portfolio doc — email, phone, `userId`, `paymentId`, `contentAr` — to anyone calling the public Convex deployment URL with a published slug. **Fix (`6f92e1d`):** anonymous callers get a trimmed render-only projection; our route handlers pass the server secret for the full doc (backward-compatible, no deploy-window breakage).
7. **Cron reconciler never worked**: called admin-gated `getAllPayments` with the anonymous client (always threw) — and nothing scheduled it (`vercel.json` had no `crons`). **Fix (`aa62e28`):** secret-gated `payments.listPending`, cron scheduled every 6h, plus new admin `GET /api/admin/payment-health`.
8. **Reconcilers sent InvoiceId as `KeyType: "PaymentId"`** — MyFatoorah errored on every row, and the cron summary counted errors in no bucket, so an all-errors run looked healthy. **Fix (`2c9d889`):** explicit `keyType` param; summaries now surface error counts + samples.
9. **Spoofable rate-limit key**: waitlist keyed on the leftmost `x-forwarded-for` (client-controlled). **Fix:** trusted `clientIp()` (x-real-ip / rightmost XFF) — also applied to the new per-IP limit on the public MyFatoorah callback (outbound GetPaymentStatus amplification).
10. **Error-message leakage**: `free-access` echoed raw `error.message` (Convex internals, config wording) to clients. **Fix:** generic client bodies, detail to server logs only.
11. **Unvalidated bodies**: waitlist / free-access / initiate / admin-reconcile parsed `req.json()` raw with no size cap. **Fix:** `parseJsonBody` (byte caps + zod schemas) everywhere.
12. **Admin email allowlist shipped in the client JS bundle** (`src/lib/admin.ts` hardcode, imported by 4 client components). **Fix:** lib is now env-derived and server-only; client UIs use the new boolean `users.isAdmin` query; `getAllUsers` returns a per-row `isAdmin` flag for the dashboard badge. Verified absent from `.next/static`.

## Low (fixed)

13. Timing-unsafe secret comparison in webhook/cron route handlers (`!==`) → `secureCompare` (`crypto.timingSafeEqual`); webhook secret also accepted via `X-Webhook-Secret` header (query-string secrets land in proxy logs; MyFatoorah's dashboard URL field keeps the query form working).
14. `javascript:`/`vbscript:` URLs stored in linkedin/github/website/resumeUrl rendered into `href` — now wrapped in `safeUrl` across all templates. `safeUrl` extended to permit raster `data:image/*` (photos are stored as base64 data URLs; blanket blocking would have broken every photo) but not `data:image/svg+xml`.
15. `storage.getUrl` resolved any storage id with no content-type check → now validates against a raster-image allowlist (blocks SVG uploads, which can carry script when served inline).
16. `json` Handlebars helper emitted `JSON.stringify` without `<`-escaping (latent `</script>` breakout; currently unused in templates) → routed through `safeScriptJson`.
17. `listPublishedSlugs` full-table scan → `by_status` index.
18. CSP `img-src` was missing `https://*.convex.cloud` (functional: Convex-hosted images would have been blocked) → added.

## Accepted / informational (documented, not changed)

- **`incrementViews`** is public and unthrottled — inflates a vanity counter only.
- **Rate limiter fails open** on Convex outage — deliberate (Convex is the primary datastore; an outage already degrades everything).
- **`markPaidByUser` fallback** can unlock the payer's most recent draft if the paid portfolio was deleted — server-secret-gated, payer-scoped; edge-case kept for support ergonomics.
- **Admin authz depends on Clerk-verified emails** — ensure Clerk keeps requiring email verification before primary-email changes.
- **serverSecret-gated mutations are public functions** (protected by secret knowledge, not `internalMutation`) — sound today; migrating to `internalMutation`+actions is a larger refactor. CI-check that `INTERNAL_API_SECRET` never gains a `NEXT_PUBLIC_` prefix.
- **CSP still allows `unsafe-inline`/`unsafe-eval`** (Clerk/Next require it today). The sinks are fixed; nonce-based CSP for `/p/*` is the long-term hardening path, ideally with published pages on an isolated subdomain.
- **2 moderate npm advisories** — transitive postcss pinned by next 15; clears with the Next 16 upgrade.
- **`.env.local`** is untracked & gitignored; git history scanned — no secrets ever committed. Sensitive Vercel values pull as empty strings (expected). Hostinger-VPS copy of real secrets exists in Convex/Vercel envs only.

## Verified safe (no action needed)

- Payment flow: price is a server constant; `verifyAndProcessPayment` re-fetches status from MyFatoorah with our API key, takes `portfolioId` from MyFatoorah's `UserDefinedField` (not the request), enforces an amount floor, is idempotent, and marks the portfolio paid *before* completing the payment row (crash-safe ordering). Forged `paymentId`s cannot unlock anything. Covered by `tests/payment-verification.test.ts`.
- IDOR: every portfolio/payment query/mutation traced — ownership enforced server-side from the JWT; `listByUser` ignores client args; admin queries double-gated.
- No SSTI: templates compiled once from static sources; user data is only ever render context. No `eval`, no dynamic compilation.
- Redirects in callback/error are fixed templates with whitelisted locale — no open redirect.
- AI endpoints: Clerk-gated, zod-validated, length-capped inputs, per-minute + durable daily rate limits.
- Security headers: HSTS (2y, preload), nosniff, XFO SAMEORIGIN + frame-ancestors, Referrer-Policy, Permissions-Policy, no x-powered-by.
- Seeds are `internalMutation` (unreachable from clients); no secrets in `public/`; no secrets in console logs.

## Test coverage added this session

`vitest` harness (`.hbs` raw-source plugin) — 34 tests: all 5 templates rendered with hostile payloads (raw-payload, attribute-breakout, `javascript:`/`data:` URLs, multi-line escaping, photo data-URL allowlist), `secureCompare`, and the payment-verification core (KeyType regression, idempotency, amount floor, ordering, missing-record recovery). Run: `npm test`.
