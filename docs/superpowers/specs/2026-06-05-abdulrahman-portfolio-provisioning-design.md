# Provision Abdulrahman Alkandari — Owned Live Portfolio + Fixed CV-with-QR

**Date:** 2026-06-05
**Status:** Approved design → implementation plan next
**Owner request (verbatim intent):** Add Abdulrahman's CV to the engineer template, generate a
fixed PDF CV whose scan-QR redirects to his live portfolio, and create an account in his name so
he can manage/edit his CV and portfolio himself.

## Context

The platform (`trimind-portfolios`, Next.js 15 + Convex + Clerk) already implements the exact
"hybrid" output this task needs:

- **CV PDF + QR:** `POST /api/generate-cv` → `renderCvPdf(data, { qrDataUrl, liveUrl })` with
  `portfolioQrDataUrl()` (high-EC QR, `errorCorrectionLevel: "H"`). QR target is
  `https://portfolio-trimind.com/p/<slug>`.
- **Live portfolio:** `GET /p/<slug>` (`src/app/p/[slug]/route.ts`) serves the **stored**
  `generatedHtml` of a portfolio whose `status === "published"`. It re-renders nothing at request
  time — publishing must compute and store the HTML.
- **Engineer template:** `renderEngineerTemplate(toPortfolioData(portfolio))` (same renderer the
  publish flow at `/api/generate` uses).
- **Accounts:** Clerk (production instance for `portfolio-trimind.com`). A Convex `users` row is
  created/linked by `clerkId` via `users.upsertFromClerk` on first authenticated load. Portfolios
  reference the owner by `userId`.
- **Existing scaffold:** `convex/seeds.ts` → `seedAbdulrahman` (internal mutation) already drafts an
  **engineer** portfolio, slug `abdulrahman-alkandari`, with a richly written *Smart Irrigation*
  project. All 13 referenced images exist under `public/seed/smart-irrigation/`.

### The four gaps between the scaffold and the requirement

1. **Ownership.** `seedAbdulrahman` assigns the portfolio to the **admin** (resolved from
   `ADMIN_EMAILS`). Abdulrahman cannot edit it. He needs his own Clerk login + Convex user row, and
   the portfolio's `userId` must point at *his* user.
2. **Incorrect facts.** The seed states *Computer Engineering / course CE477*, a fabricated GitHub
   repo, a non-existent final-report PDF link, and generic skills/education. His real CV is
   **Electrical Engineering @ AUM (American University of the Middle East)**, with FPGA / MATLAB &
   Simulink / Quartus Prime / Arduino / Python skills and a **CODED cybersecurity course (Aug
   2025)**.
3. **Not published.** The seed leaves `status: "paid"`. The live page needs `status: "published"`
   **and** a stored `generatedHtml`.
4. **Hosting is globally OFF.** `HOSTING_ENABLED = false` in `src/lib/flags.ts` makes **every**
   `/p/<slug>` return a "Coming soon" 503 — which would make the CV's QR target dead.

## Decisions (locked with owner)

- **Account:** create his Clerk login now — username `aak22xq8@gmail.com`, temp password
  `start@2025` (he changes it after first login).
- **Slug / live URL:** `https://portfolio-trimind.com/p/abdulrahman-alkandari` (also the QR target).
- **Content fidelity:** light polish — keep his real facts, improve phrasing; retain the strong,
  already-polished Smart Irrigation write-up.
- **Education:** **only** AUM B.Sc. Electrical Engineering (Expected 2026). **Remove the high-school
  diploma** (Salah Al Din School) entirely — do not add it.
- **Hosting model:** accounts/dashboards stay **private** (already Clerk-gated). Only the
  **published** portfolio is **public**. Achieve this surgically with a **published-slug
  allowlist** so the platform-wide "coming soon" posture is unchanged for everything else.
- **Delivery:** save the fixed PDF to disk **and** send it back through the Dalal Telegram bot.

## Architecture / approach

Five units, each independently verifiable:

### 1. Hosting allowlist (`src/lib/flags.ts` + the two `/p` route guards)

Introduce `HOSTING_ALLOW_SLUGS: string[]` (seeded with `["abdulrahman-alkandari"]`) and a helper
`isHostingEnabledForSlug(slug)` = `HOSTING_ENABLED || HOSTING_ALLOW_SLUGS.includes(slug)`.

- `src/app/p/[slug]/route.ts` and `src/app/p/[slug]/projects/[projectSlug]/route.ts` swap their
  `if (!HOSTING_ENABLED)` guard for `if (!isHostingEnabledForSlug(slug))`.
- Global `HOSTING_ENABLED` stays `false`; landing/FAQ/dashboard copy (which keys off
  `HOSTING_ENABLED`) is untouched. Only allow-listed published slugs serve live.

**Why not flip the global flag:** owner explicitly wants the rest of the product to keep its current
"coming soon" posture; only his published portfolio should be public.

### 2. Clerk account provisioning (one-off script)

`scripts/provision-abdulrahman-clerk.mjs` — uses the production Clerk Backend API
(`sk_live_…portfolio-trimind`) to **create-or-find** a user with email `aak22xq8@gmail.com`,
password `start@2025`, name "Abdulrahman Alkandari". Idempotent: if the user already exists, fetch
their `id`. Output: the Clerk `userId` (subject/`clerkId`).

Secrets are read from the environment / `ALL-API-KEYS.md` at run time — **never committed**.

### 3. Convex user row + ownership (`convex/seeds.ts`)

- Add `provisionUser` (internal mutation, args `{ clerkId, email, name }`) that upserts a `users`
  row by `clerkId` (mirrors `upsertFromClerk` but takes explicit args, since there is no JWT in a
  CLI/script context). This guarantees that when Abdulrahman later signs in, `upsertFromClerk`
  matches the **same** row by `clerkId` and he sees his portfolio.
- Rework `seedAbdulrahman` to resolve the owner as **Abdulrahman's** user row (by email
  `aak22xq8@gmail.com`), not `ADMIN_EMAILS`. Fail loudly if that row is absent (i.e. run
  `provisionUser` first).

### 4. Corrected portfolio data (`convex/seeds.ts` data block)

Fix the seed payload to his real CV (light polish):

- `basics.title`: "Electrical Engineering Graduate" (AUM, expected 2026); keep `location` Kuwait,
  `nationality` Kuwaiti, real `email`/`phone`.
- `education`: single entry — AUM, B.Sc. Electrical Engineering, "Expected 2026". No high school.
- `certifications`: add **Cybersecurity (CODED, Kuwait Free Trade Zone, 2025)**.
- `skills`: his real groups — Technical (Circuit Analysis, Digital Logic Design, FPGA Development,
  Microcontroller Programming, Technical Documentation, Data Analysis), Software & Tools (MATLAB &
  Simulink, Intel Quartus Prime, Arduino, Python, Google Colab, MS Office), Professional
  (Communication, Problem Solving, Teamwork, Time Management, Adaptability, Quick Learning,
  Attention to Detail).
- `languages`: Arabic — Native; English — Intermediate.
- **Smart Irrigation project:** keep the polished narrative/specs/images; correct the project `meta`
  subject from *Computer Engineering* to *Electrical Engineering* (and drop the invented `courseCode`
  or keep generic); **remove dead links** (fabricated GitHub repo + non-existent report PDF) so the
  live page has no broken links — Abdulrahman can re-add real links from his dashboard.

Run order: `provisionUser` → `seedAbdulrahman` (now owner = Abdulrahman, `status: "paid"`).

### 5. Publish + PDF + deliver

- **Publish:** render the engineer HTML exactly as the app does
  (`renderEngineerTemplate(toPortfolioData(portfolio))`) in a Node script, then set the portfolio to
  `status: "published"` with `slug` + `generatedHtml`. Because the in-app `publish` mutation requires
  a Clerk JWT (owner/admin), expose an **internal** `publishProvisioned({ slug, generatedHtml })`
  mutation (CLI-only, not client-reachable) to write those fields. Verify `GET /p/abdulrahman-alkandari`
  returns 200 with his content.
- **Fixed PDF CV:** build the QR for `https://portfolio-trimind.com/p/abdulrahman-alkandari`
  (`portfolioQrDataUrl`), render `renderCvPdf(data, { qrDataUrl, liveUrl })`, and print to PDF with
  the already-available headless Chromium (Playwright). Save to
  `/home/trimind/dalal-inbox/2026-06-05/Abdulrahman_Alkandari_CV_QR.pdf`.
- **Deliver:** send that PDF back through the Dalal bot to the owner.

## Data flow

```
CV (Abdulrahman_Alkandari_ATS_CV.pdf)
        │  (manual mapping → corrected seed data)
        ▼
Clerk create user ──clerkId──▶ provisionUser (Convex users row)
                                      │ userId
                                      ▼
                          seedAbdulrahman (engineer portfolio, owner=Abdulrahman, paid)
                                      │
            renderEngineerTemplate(toPortfolioData(portfolio)) → generatedHtml
                                      │
                       publishProvisioned(slug, generatedHtml) → status: published
                                      │
           HOSTING_ALLOW_SLUGS includes slug ──▶ GET /p/abdulrahman-alkandari = 200 (public)
                                      ▲
                                      │ QR target
        renderCvPdf(data, {qr→/p/slug}) → Chromium print → CV_QR.pdf ──▶ Dalal bot
```

## Error handling & idempotency

- Clerk create: treat "email already exists" as success (fetch existing id). Never print the secret
  key to logs.
- `provisionUser` / `seedAbdulrahman` / `publishProvisioned`: all idempotent (upsert by
  `clerkId` / by `slug`). Re-running updates, never duplicates.
- Publish guard: `publishProvisioned` only writes when a portfolio with that slug exists and has
  non-empty `generatedHtml`; otherwise throws.
- Live verification is a hard gate: if `/p/abdulrahman-alkandari` is not 200 with his name in the
  HTML, do **not** generate/deliver the PDF (a QR to a dead page is worse than no QR).

## Testing / verification

1. `provision-abdulrahman-clerk.mjs` prints a Clerk `userId`; re-run is a no-op (same id).
2. After seed: Convex shows one `abdulrahman-alkandari` portfolio, `userId` = Abdulrahman's row,
   facts corrected (EE, AUM, CODED cert, no high school, no dead links).
3. After publish: `curl -s -o /dev/null -w '%{http_code}' https://portfolio-trimind.com/p/abdulrahman-alkandari` → `200`;
   page HTML contains "Abdulrahman Alkandari" and the Smart Irrigation project; all `/seed/...`
   images load.
4. PDF: opens, is single clean CV layout, **QR scans** (phone) and resolves to the live page; high-
   school section absent; no dead links.
5. Login check: signing in at `portfolio-trimind.com` with `aak22xq8@gmail.com` / `start@2025` shows
   **his** portfolio in the dashboard and the editor loads his data.

## Out of scope / non-goals

- No global `HOSTING_ENABLED` flip; no landing/FAQ copy changes.
- No new builder-step set for the engineer template (separate backlog item).
- No modification of the unrelated in-flight MyFatoorah changes in the shared working tree — stage
  only files owned by this task.

## Shared-working-tree caution

Multiple sessions share one tree. Foreign uncommitted MyFatoorah work exists
(`admin/page.tsx`, `myfatoorah/callback/route.ts`, `webhook/`). Commit **only** the files this task
touches (`flags.ts`, the two `/p` route guards, `convex/seeds.ts`, new `scripts/*`, this spec).
