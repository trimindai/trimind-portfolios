# Abdulrahman Alkandari — Owned Live Portfolio + CV-with-QR Implementation Plan

> **For agentic workers:** Executed inline this session (sequential provisioning with prod side-effects + verification gates). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Stand up Abdulrahman Alkandari's engineer-template portfolio live at
`portfolio-trimind.com/p/abdulrahman-alkandari`, owned by his own Clerk account so he can edit it,
and deliver a fixed PDF CV whose QR redirects to that live page — sent back via the Dalal bot.

**Architecture:** Reuse existing platform machinery (`renderEngineerTemplate`, `renderCvPdf`,
`portfolioQrDataUrl`, Convex portfolios, Clerk). Canonical data lives in one shared module imported
by both Convex and a Node render script (DRY). Hosting is opened for his slug only via an allowlist
(global "coming soon" posture unchanged). Backend (Convex) deploys before frontend (Vercel).

**Tech Stack:** Next.js 15, Convex (`prod:fortunate-ocelot-2`), Clerk (live), Handlebars renderers,
Playwright (Chromium PDF), Clerk Backend API, Dalal Telegram bot.

**Reversibility:** Clerk user (deletable), portfolio doc (deletable), one-slug allowlist (revert
flag), all idempotent. A failed Vercel build does not replace the live deployment.

---

## File structure

- **Create** `convex/seedData/abdulrahman.ts` — pure data object `ABDULRAHMAN_PORTFOLIO` (corrected
  to his real CV), plus `ABDULRAHMAN_SLUG`, `ABDULRAHMAN_EMAIL`, `ABDULRAHMAN_NAME`. No Convex/Node
  imports, so both runtimes can import it.
- **Rewrite** `convex/seeds.ts` — `provisionUser` (internal, upsert users row by clerkId),
  `seedAbdulrahman` (owner = his users row, data from shared module, status `paid`),
  `publishAbdulrahman` (internal, set `published` + `generatedHtml`).
- **Modify** `src/lib/flags.ts` — add `HOSTING_ALLOW_SLUGS` + `isHostingEnabledForSlug(slug)`.
- **Modify** `src/app/p/[slug]/route.ts` and `src/app/p/[slug]/projects/[projectSlug]/route.ts` —
  use `isHostingEnabledForSlug(slug)` instead of bare `HOSTING_ENABLED`.
- **Create** `scripts/provision-abdulrahman-clerk.mjs` — create/find Clerk user → print clerkId.
- **Create** `scripts/render-abdulrahman.mts` — render engineer HTML + write
  `/tmp/abd-publish.json`; render CV PDF HTML to `/tmp/abd-cv.html`.
- **Create** `scripts/abd-pdf.mjs` — Playwright print `/tmp/abd-cv.html` → final PDF.

Secrets come from `.env.prod.tmp` (gitignored) / `ALL-API-KEYS.md` at run time — never committed.

---

## Task 1: Canonical corrected data module

**Files:** Create `convex/seedData/abdulrahman.ts`

- [ ] **Step 1:** Write the module. Content (corrected to his real CV; high-school removed; dead
  links removed; project subject = Electrical Engineering):

```ts
// Canonical portfolio data for Abdulrahman Alkandari. Pure data — imported by
// both convex/seeds.ts (insert) and scripts/render-abdulrahman.mts (render).
export const ABDULRAHMAN_SLUG = "abdulrahman-alkandari";
export const ABDULRAHMAN_EMAIL = "aak22xq8@gmail.com";
export const ABDULRAHMAN_NAME = "Abdulrahman Alkandari";

export const ABDULRAHMAN_PORTFOLIO = {
  templateId: "engineer",
  name: "Abdulrahman Alkandari — Engineer Portfolio",
  locale: "en" as const,
  slug: ABDULRAHMAN_SLUG,
  basics: {
    fullName: "Abdulrahman Alkandari",
    title: "Electrical Engineering Graduate",
    bio: "Electrical Engineering graduate from the American University of the Middle East with hands-on experience in embedded systems, FPGA development, and microcontroller programming. I build practical engineering solutions where hardware meets intelligence — sensors, microcontrollers, and machine learning working together to solve real problems.",
    valueProposition:
      "I build practical engineering solutions where hardware meets intelligence — sensors, microcontrollers, and machine learning working together to solve real problems for Kuwait and the wider Gulf.",
    summary:
      "Electrical Engineering graduate with practical field-training experience and a strong foundation in electrical systems, programming, embedded technologies, FPGA development, and microcontroller programming. Seeking an entry-level engineering role to apply technical knowledge and contribute to real engineering work.",
    location: "Salam, Kuwait",
    nationality: "Kuwaiti",
    email: "aak22xq8@gmail.com",
    phone: "+965 55502344",
  },
  education: [
    {
      degree: "B.Sc. in Electrical Engineering",
      institution: "American University of the Middle East (AUM), Kuwait",
      year: "Expected 2026",
      description: "Senior Project: Smart Irrigation System.",
    },
  ],
  certifications: [
    {
      name: "Cybersecurity Course",
      issuer: "CODED — Kuwait Free Trade Zone",
      year: "2025",
    },
  ],
  skills: [
    {
      category: "Technical",
      items: [
        "Circuit Analysis",
        "Digital Logic Design",
        "FPGA Development",
        "Microcontroller Programming",
        "Technical Documentation",
        "Data Analysis",
      ],
    },
    {
      category: "Software & Tools",
      items: [
        "MATLAB & Simulink",
        "Intel Quartus Prime",
        "Arduino",
        "Python",
        "Google Colab",
        "Microsoft Office",
      ],
    },
    {
      category: "Professional",
      items: [
        "Communication",
        "Problem Solving",
        "Teamwork & Collaboration",
        "Time Management",
        "Adaptability",
        "Quick Learning",
      ],
    },
  ],
  languages: [
    { name: "Arabic", level: "Native" },
    { name: "English", level: "Intermediate" },
  ],
  projects: [
    {
      title: "Smart Irrigation System",
      description:
        "Vision-based irrigation controller that identifies plant species and waters at species-specific moisture thresholds. Built for Gulf agriculture where water scarcity is acute.",
      technologies: [
        "Raspberry Pi", "Arduino UNO", "Python", "TensorFlow Lite",
        "CNN", "Soil Moisture Sensor", "OpenCV",
      ],
      metrics: [
        { value: "≥90%", label: "Plant detection accuracy" },
        { value: "<3s", label: "Dry-to-pump response" },
        { value: "55 KWD", label: "Total prototype cost" },
        { value: "21%", label: "Below commercial controller" },
      ],
      isFeatured: true,
      slug: "smart-irrigation",
      tagline:
        "A camera, a soil sensor, and a CNN — plants get the right amount of water without human guesswork.",
      coverUrl: "/seed/smart-irrigation/cover.png",
      meta: {
        type: "academic" as const,
        year: "2025",
        institution: "Graduation Project — B.Sc. Electrical Engineering, AUM",
        role: "Hardware & Integration",
      },
      blocks: [/* keep the existing rich blocks from the prior seed verbatim */],
      // links removed — fabricated GitHub repo + non-existent report PDF dropped.
    },
  ],
} as const;
```

> Note for execution: copy the **exact `blocks` array** from the current `convex/seeds.ts`
> (paragraph/challenge/image/specs/imageGrid/standards) into this module unchanged — those images
> all exist under `public/seed/smart-irrigation/`. Only `meta` is corrected and `links` removed.

- [ ] **Step 2:** Verify it parses: `npx tsc --noEmit convex/seedData/abdulrahman.ts` (or rely on
  the convex deploy typecheck in Task 3). Expected: no errors.

---

## Task 2: Rewrite convex/seeds.ts (provision + own + publish)

**Files:** Modify `convex/seeds.ts`

- [ ] **Step 1:** Replace the inline data + admin-owner logic. New content:

```ts
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  ABDULRAHMAN_PORTFOLIO, ABDULRAHMAN_SLUG, ABDULRAHMAN_EMAIL,
} from "./seedData/abdulrahman";

/** CLI-only: upsert a users row so a pre-created Clerk account owns content. */
export const provisionUser = internalMutation({
  args: { clerkId: v.string(), email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, { clerkId, email, name }) => {
    const existing = await ctx.db
      .query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId)).first();
    if (existing) {
      await ctx.db.patch(existing._id, { email, name });
      return existing._id;
    }
    return await ctx.db.insert("users", { clerkId, email, name, createdAt: Date.now() });
  },
});

/** CLI-only: insert/update Abdulrahman's portfolio, owned by HIS user row. */
export const seedAbdulrahman = internalMutation({
  args: {},
  handler: async (ctx) => {
    const owner = await ctx.db
      .query("users").withIndex("by_email", (q) => q.eq("email", ABDULRAHMAN_EMAIL)).first();
    if (!owner) throw new Error(`No users row for ${ABDULRAHMAN_EMAIL}. Run provisionUser first.`);

    const data = {
      ...ABDULRAHMAN_PORTFOLIO,
      userId: owner._id,
      status: "paid" as const,
      lastEditedAt: Date.now(),
      createdAt: Date.now(),
    };
    const existing = await ctx.db
      .query("portfolios").withIndex("by_slug", (q) => q.eq("slug", ABDULRAHMAN_SLUG)).first();
    if (existing) {
      const { createdAt: _omit, ...patch } = data;
      await ctx.db.patch(existing._id, patch);
      return { portfolioId: existing._id, action: "updated" as const };
    }
    const portfolioId = await ctx.db.insert("portfolios", data);
    return { portfolioId, action: "inserted" as const };
  },
});

/** CLI-only: publish with pre-rendered HTML (render happens in Node). */
export const publishAbdulrahman = internalMutation({
  args: { generatedHtml: v.string() },
  handler: async (ctx, { generatedHtml }) => {
    const p = await ctx.db
      .query("portfolios").withIndex("by_slug", (q) => q.eq("slug", ABDULRAHMAN_SLUG)).first();
    if (!p) throw new Error("seedAbdulrahman must run before publishAbdulrahman");
    await ctx.db.patch(p._id, {
      status: "published", slug: ABDULRAHMAN_SLUG, generatedHtml,
      publishedAt: Date.now(), lastEditedAt: Date.now(),
    });
    return { portfolioId: p._id, url: `/p/${ABDULRAHMAN_SLUG}` };
  },
});
```

- [ ] **Step 2:** Confirm `portfolios` schema accepts the data shape (basics/skills/projects/
  education/certifications/languages already in `convex/schema.ts`). No schema change needed.

---

## Task 3: Deploy Convex backend first

- [ ] **Step 1:** Clean stray compiled files (known issue): `rm -f convex/*.js convex/*.js.map`
  (top-level only, never `_generated/`).
- [ ] **Step 2:** Deploy:
  `CONVEX_DEPLOY_KEY="<prod:fortunate-ocelot-2 key>" npx convex deploy --yes --typecheck=disable`
  Expected: "Deployed Convex functions to https://fortunate-ocelot-2.convex.cloud".

---

## Task 4: Create his Clerk account (live instance)

**Files:** Create `scripts/provision-abdulrahman-clerk.mjs`

- [ ] **Step 1:** Script (idempotent create-or-find):

```js
const SK = process.env.CLERK_SECRET_KEY; // sk_live_... (prod)
const email = "aak22xq8@gmail.com";
const base = "https://api.clerk.com/v1";
const h = { Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };

let res = await fetch(`${base}/users?email_address=${encodeURIComponent(email)}`, { headers: h });
let users = await res.json();
let user = Array.isArray(users) ? users[0] : (users.data?.[0]);
if (!user) {
  res = await fetch(`${base}/users`, { method: "POST", headers: h, body: JSON.stringify({
    email_address: [email], password: "start@2025",
    first_name: "Abdulrahman", last_name: "Alkandari", skip_password_checks: true,
  })});
  user = await res.json();
  if (!user.id) { console.error("CREATE FAILED", JSON.stringify(user)); process.exit(1); }
}
console.log(user.id); // clerkId
```

- [ ] **Step 2:** Run: `CLERK_SECRET_KEY="$(grep CLERK_SECRET_KEY .env.prod.tmp | cut -d'"' -f2)" node scripts/provision-abdulrahman-clerk.mjs`
  Expected: prints `user_…`. Capture as `CLERK_ID`.

---

## Task 5: Provision user row + seed portfolio (owned by him)

- [ ] **Step 1:** `CONVEX_DEPLOY_KEY="<key>" npx convex run seeds:provisionUser '{"clerkId":"<CLERK_ID>","email":"aak22xq8@gmail.com","name":"Abdulrahman Alkandari"}' --prod`
  Expected: returns a users id.
- [ ] **Step 2:** `CONVEX_DEPLOY_KEY="<key>" npx convex run seeds:seedAbdulrahman --prod`
  Expected: `{ portfolioId, action: "inserted"|"updated" }`.

---

## Task 6: Render engineer HTML + publish

**Files:** Create `scripts/render-abdulrahman.mts`

- [ ] **Step 1:** Script — build the portfolio data, render, write payload + CV HTML:

```ts
import { writeFileSync } from "node:fs";
import { renderEngineerTemplate, renderCvPdf } from "../src/lib/template-engine";
import { toPortfolioData } from "../src/lib/portfolio-data";
import { ABDULRAHMAN_PORTFOLIO, ABDULRAHMAN_SLUG } from "../convex/seedData/abdulrahman";
import QRCode from "qrcode";

const liveUrl = `https://portfolio-trimind.com/p/${ABDULRAHMAN_SLUG}`;
const portfolioDoc = { ...ABDULRAHMAN_PORTFOLIO, _id: "seed", status: "published" } as any;
const data = toPortfolioData(portfolioDoc);

const html = renderEngineerTemplate(data);
writeFileSync("/tmp/abd-publish.json", JSON.stringify({ generatedHtml: html }));

const qrDataUrl = await QRCode.toDataURL(liveUrl, { errorCorrectionLevel: "H", margin: 1, width: 320, color: { dark: "#0f172a", light: "#ffffff" } });
const cvHtml = renderCvPdf({ ...data, slug: ABDULRAHMAN_SLUG, portfolioUrl: liveUrl }, { qrDataUrl, liveUrl });
writeFileSync("/tmp/abd-cv.html", cvHtml);
console.log("rendered: portfolio + CV");
```

- [ ] **Step 2:** Run: `npx tsx scripts/render-abdulrahman.mts`. Expected: "rendered: portfolio + CV";
  `/tmp/abd-publish.json` and `/tmp/abd-cv.html` exist and are non-trivial size.
- [ ] **Step 3:** Publish: `CONVEX_DEPLOY_KEY="<key>" npx convex run seeds:publishAbdulrahman "$(cat /tmp/abd-publish.json)" --prod`
  Expected: `{ url: "/p/abdulrahman-alkandari" }`. (If the arg is too large for the shell, pipe via
  a small ConvexHttpClient + serverSecret call instead.)

---

## Task 7: Open hosting for his slug + deploy frontend

**Files:** Modify `src/lib/flags.ts`, `src/app/p/[slug]/route.ts`, `src/app/p/[slug]/projects/[projectSlug]/route.ts`

- [ ] **Step 1:** In `flags.ts`, after `HOSTING_ENABLED`:

```ts
/** Slugs allowed to serve live while global hosting is paused (QR targets). */
export const HOSTING_ALLOW_SLUGS: string[] = ["abdulrahman-alkandari"];
export function isHostingEnabledForSlug(slug: string): boolean {
  return HOSTING_ENABLED || HOSTING_ALLOW_SLUGS.includes(slug);
}
```

- [ ] **Step 2:** In `src/app/p/[slug]/route.ts`: import `isHostingEnabledForSlug`; change
  `if (!HOSTING_ENABLED)` → `if (!isHostingEnabledForSlug(slug))`.
- [ ] **Step 3:** In `.../projects/[projectSlug]/route.ts`: same swap, using that route's `slug`.
- [ ] **Step 4:** Stage ONLY this task's files + Tasks 1/2/6 files (never the foreign MyFatoorah
  files):
  `git add src/lib/flags.ts src/app/p/[slug]/route.ts "src/app/p/[slug]/projects/[projectSlug]/route.ts" convex/seeds.ts convex/seedData/abdulrahman.ts scripts/provision-abdulrahman-clerk.mjs scripts/render-abdulrahman.mts scripts/abd-pdf.mjs docs/superpowers/plans/2026-06-05-abdulrahman-portfolio-provisioning.md`
- [ ] **Step 5:** Commit + push (Vercel builds from committed git, not the dirty tree):
  `git commit -m "feat: provision Abdulrahman owned live portfolio + slug hosting allowlist" && git push`
- [ ] **Step 6:** Wait for the Vercel production deploy to finish (`vercel ls trimind-portfolios` or
  dashboard). A failed build leaves the current live deploy intact.

---

## Task 8: Verify live (HARD GATE before delivering PDF)

- [ ] **Step 1:** `curl -s -o /dev/null -w '%{http_code}\n' https://portfolio-trimind.com/p/abdulrahman-alkandari`
  Expected: `200`.
- [ ] **Step 2:** `curl -s https://portfolio-trimind.com/p/abdulrahman-alkandari | grep -c "Abdulrahman Alkandari"`
  Expected: ≥1. Also spot-check the project page `/p/abdulrahman-alkandari/projects/smart-irrigation` → 200.
- [ ] **Step 3:** If not 200/with his name, STOP and fix before generating the PDF (no QR to a dead page).

---

## Task 9: Generate the fixed PDF

**Files:** Create `scripts/abd-pdf.mjs`

- [ ] **Step 1:** Script:

```js
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const html = readFileSync("/tmp/abd-cv.html", "utf8");
const out = "/home/trimind/dalal-inbox/2026-06-05/Abdulrahman_Alkandari_CV_QR.pdf";
const b = await chromium.launch();
const pg = await b.newPage();
await pg.setContent(html, { waitUntil: "networkidle" });
await pg.pdf({ path: out, format: "A4", printBackground: true, margin: { top: "0", bottom: "0", left: "0", right: "0" } });
await b.close();
console.log("PDF:", out);
```

- [ ] **Step 2:** Run `node scripts/abd-pdf.mjs` (use the repo's Playwright; if no browser,
  `npx playwright install chromium` first). Expected: prints the output path; file exists.
- [ ] **Step 3:** Sanity: PDF is 1 page, shows his name/sections, **no high-school section**, and a
  QR in the corner. (Visually confirm by reading the PDF.)

---

## Task 10: Deliver via Dalal bot + verify account

- [ ] **Step 1:** Send the PDF to the owner through the Dalal bot's send-document path (reuse the
  bot's Telegram `sendDocument` with the saved chat id). Confirm Telegram returns ok.
- [ ] **Step 2:** Report to the user: live URL, login (`aak22xq8@gmail.com` / `start@2025`, change
  on first login), and that the QR resolves to the live page.
- [ ] **Step 3:** Cleanup: `rm -f .env.prod.tmp /tmp/abd-publish.json /tmp/abd-cv.html` (no secrets
  left on disk). Update memory/vault log.

---

## Self-review notes

- **Spec coverage:** account (T4–5), owned portfolio (T2,T5), corrected data incl. no-high-school
  (T1), publish/live (T6–8), hosting allowlist (T7), QR→live PDF (T9), Dalal delivery (T10), private
  accounts + public published page (T7 allowlist + Clerk-gated dashboard). ✅
- **Dirty-tree safety:** explicit narrow `git add`; push-built deploy; Convex deploy touches only
  `convex/`. ✅
- **Hard gate:** PDF only generated after T8 live check. ✅
- **Idempotency:** Clerk find-or-create; provisionUser/seed/publish all upsert. ✅
