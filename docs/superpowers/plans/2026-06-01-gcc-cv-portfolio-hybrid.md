# GCC CV + Portfolio Hybrid — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn trimind-portfolios into a GCC-friendly hybrid that produces, for the 4 disciplines (corporate, engineer, creative, developer), (a) a clean ATS-ready **PDF CV** with every job-application section and an embedded **QR code**, and (b) a **mobile-perfect live web portfolio** at `portfolio-trimind.com/p/<slug>` that the QR opens when a hiring team scans it.

**Architecture:** Two outputs per user from one dataset. The flashy Handlebars web templates remain the *live portfolio* served at `/p/<slug>`. A NEW shared, A4, print-optimized **CV template** (`src/templates/_cv/cv.hbs`) renders the *PDF CV* — ATS-friendly, all hiring sections, discipline accent + section ordering, with a QR code (generated server-side as a data-URL) pointing at the user's live portfolio. The builder collects the union of fields both outputs need, simplified and mobile-first for GCC clients (EN + AR RTL). Hosting is re-enabled so the QR has a live target.

**Tech Stack:** Next.js 15 / React 19, Convex, Handlebars (`src/lib/template-engine.ts`), Tailwind, next-intl (en/ar), `qrcode` (new dep), browser-print PDF (`PreviewFrame` iframe). Design skills: `impeccable`, `taste-skill`, `frontend-design`, `ui-design:mobile-*`, `video-remotion` (optional promo).

**Verification method (project convention — NOT unit-test TDD; Handlebars visual work):**
- Standalone render assertions: compile a template with fixture data via a node script, assert `0` leftover `{{`, balanced tags, required sections present.
- True-mobile screenshots at **390px** via `playwright-core` + `channel:'chrome'`, `newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})` — NOT bare `chrome --headless --screenshot` (500px floor).
- `npm run build` must pass (exit 0).

---

## File Structure

- `src/lib/flags.ts` — set `HOSTING_ENABLED = true` (QR needs a live target).
- `src/app/p/[slug]/route.ts` — already serves live portfolio when hosting on (no change beyond flag).
- `package.json` — add `qrcode` + `@types/qrcode`.
- `src/lib/qr.ts` — **new**: `portfolioQrDataUrl(url)` → PNG data-URL (server-side).
- `src/templates/_cv/cv.hbs` — **new**: shared ATS A4 CV template, all hiring sections, QR slot.
- `src/templates/_cv/cv.css` (inlined into cv.hbs `<style>`) — **new**: print/A4 rules (`@page`, `@media print`).
- `src/lib/template-engine.ts` — add `renderCvPdf(data)` + register CV helpers (reuse existing helpers; add `cvSectionOrder`).
- `src/app/api/generate-cv/route.ts` — **new**: POST renders the CV PDF HTML (mirrors `/api/generate`), injects QR.
- `src/components/preview/PreviewFrame.tsx` — print the CV-PDF html (A4), not the web template.
- `src/app/[locale]/(app)/dashboard/[id]/preview/page.tsx` — preview shows CV PDF; toggle "Live portfolio preview" vs "CV PDF".
- `src/components/builder/steps/CvFieldsStep.tsx` — **new**: collects CV-only fields (summary, languages, nationality, references, certifications) shared by all templates.
- `src/components/builder/BuilderForm.tsx` — register `developer` steps; insert `CvFieldsStep` into all 4 step lists; mobile-first step shell.
- `convex/schema.ts` + `convex/portfolios.ts` + `PortfolioData` type — add CV fields: `basics.summary`, `basics.nationality`, `basics.languages[]`, `references[]` (deploy Convex BEFORE frontend).
- `messages/en.json` + `messages/ar.json` — CV/QR/builder strings, AR RTL.
- `scripts/render-cv-check.mjs` — **new**: standalone CV render assertions.
- `scripts/mobile-shot.mjs` — **new/reuse**: 390px playwright-core screenshotter.

---

## Task 1: QR foundation + re-enable live target

**Files:** `src/lib/flags.ts`, `package.json`, `src/lib/qr.ts` (create), `scripts/render-cv-check.mjs` (later)

- [ ] **Step 1: Add QR dependency**
  Run: `npm i qrcode && npm i -D @types/qrcode`
  Expected: added to `package.json`, lockfile updated.

- [ ] **Step 2: Create `src/lib/qr.ts`**
```ts
import QRCode from "qrcode";

/** PNG data-URL QR for a live portfolio URL. High EC so it scans off a printed CV. */
export async function portfolioQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 320,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}
```

- [ ] **Step 3: Re-enable hosting so the QR has a live target**
  In `src/lib/flags.ts` set `export const HOSTING_ENABLED = true;` and update the comment block to describe the new hybrid (PDF CV + live portfolio reached via QR).

- [ ] **Step 4: Verify the live route serves again**
  Run: `npm run build` (expect exit 0). Then assert `/p/[slug]/route.ts` early-returns the live portfolio (not the paused page) when `HOSTING_ENABLED` is true — confirm by reading the gate at top of the GET handler.

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json src/lib/qr.ts src/lib/flags.ts
git commit -m "feat: add qrcode dep + re-enable live portfolio as QR target"
```

---

## Task 2: Convex schema — CV fields

**Files:** `convex/schema.ts`, `convex/portfolios.ts`, `PortfolioData` type (in `src/lib/template-engine.ts` or its types file)

> NOTE: Convex MUST deploy before any frontend that writes these fields. Use `CONVEX_DEPLOY_KEY=<key> npx convex deploy` against prod `fortunate-ocelot-2` per memory.

- [ ] **Step 1: Extend basics + add references in `convex/schema.ts`**
  Add to the portfolio `basics` object validator: `summary: v.optional(v.string())`, `nationality: v.optional(v.string())`, `languages: v.optional(v.array(v.object({ name: v.string(), level: v.optional(v.string()) })))`. Add a top-level optional `references: v.optional(v.array(v.object({ name: v.string(), title: v.optional(v.string()), contact: v.optional(v.string()) })))`.

- [ ] **Step 2: Mirror the same validators in `convex/portfolios.ts`** (the save/update mutation arg validators) so writes don't get rejected.

- [ ] **Step 3: Extend the `PortfolioData` TS type** with the same fields (`summary`, `nationality`, `languages[]`, `references[]`) so templates type-check.

- [ ] **Step 4: Deploy Convex + build**
  Run: `CONVEX_DEPLOY_KEY=<key> npx convex deploy` (expect success), then `npm run build` (exit 0).

- [ ] **Step 5: Commit**
```bash
git add convex/schema.ts convex/portfolios.ts src/lib/template-engine.ts
git commit -m "feat: add CV fields (summary, languages, nationality, references) to schema"
```

---

## Task 3: PDF CV template (ATS, all hiring sections, QR)

**Files:** `src/templates/_cv/cv.hbs` (create), `src/lib/template-engine.ts` (add `renderCvPdf`), `scripts/render-cv-check.mjs` (create)

Sections required (ATS job-application standard, in order; hide if empty via `isHidden`/`#if`):
1. Header — name, headline/title, **QR code** top-right, contact row (email, phone, location, links), optional nationality.
2. Professional Summary (`basics.summary`).
3. Work Experience (`experience[]` — role, org, dates, location, bullet achievements).
4. Education (`education[]`).
5. Skills (`skills[]` grouped) — plain chips/columns, ATS-readable text.
6. Projects (`projects[]` — title, one-line, tech, link).
7. Certifications & Awards (`certifications[]`).
8. Languages (`basics.languages[]`).
9. References (`references[]` or "Available on request").

Design rules: single-column primary (ATS-safe), optional thin accent sidebar for contact/skills on creative/developer; A4 (`@page { size: A4; margin: 14mm }`); system + one web font; discipline accent from `customization.accentColor`; QR labeled "Scan for live portfolio" with the live URL beneath. Use `impeccable` + `taste-skill` for hierarchy/spacing; keep it quiet and professional (GCC hiring).

- [ ] **Step 1: Build `cv.hbs`** with an inlined `<style>` containing the `@page`/`@media print` rules above and the 9 sections using existing helpers (`isHidden`, `ifEq`, `or`, `gt`, `initials`, `flattenSkills`, `safeColor`, `safeUrl`). Add a `{{qrDataUrl}}` `<img>` in the header.

- [ ] **Step 2: Add `renderCvPdf(data, { qrDataUrl, liveUrl })` to `template-engine.ts`** — compiles `_cv/cv.hbs`, passes through `PortfolioData` + `qrDataUrl` + `liveUrl`. Add a `cvSectionOrder` helper only if discipline-specific ordering is needed.

- [ ] **Step 3: Write `scripts/render-cv-check.mjs`** — compile `cv.hbs` with a full fixture (all 9 sections populated) + a sparse fixture (only required), assert: `0` occurrences of `{{`, every required section heading present in full render, empty sections absent in sparse render, QR `<img>` present.

- [ ] **Step 4: Run the check**
  Run: `node scripts/render-cv-check.mjs`
  Expected: all assertions pass.

- [ ] **Step 5: Mobile/print screenshot**
  Render full fixture to a file, screenshot at A4 width with `scripts/mobile-shot.mjs` (and a 390px pass to confirm on-screen preview readability). Eyeball: one clean page, QR scannable, no clipped sections.

- [ ] **Step 6: Commit**
```bash
git add src/templates/_cv src/lib/template-engine.ts scripts/render-cv-check.mjs
git commit -m "feat: ATS PDF CV template with all hiring sections + QR code"
```

---

## Task 4: CV render API + wire preview/print to the CV

**Files:** `src/app/api/generate-cv/route.ts` (create), `src/components/preview/PreviewFrame.tsx`, `src/app/[locale]/(app)/dashboard/[id]/preview/page.tsx`

- [ ] **Step 1: Create `POST /api/generate-cv`** — body = portfolio id or `PortfolioData`; compute `liveUrl = https://portfolio-trimind.com/p/<slug>`; `qrDataUrl = await portfolioQrDataUrl(liveUrl)`; return `renderCvPdf(data, { qrDataUrl, liveUrl })` as `text/html`. Mirror auth/shape of existing `/api/generate`.

- [ ] **Step 2: Preview page fetches CV html for the "CV" view** and keeps the existing web-template html for a "Live portfolio" view. Add a small segmented toggle (CV ⇄ Live portfolio). `previewRef.current.print()` prints whichever is the CV iframe (A4). Keep the existing `canDownload`/`?paid=1` gating.

- [ ] **Step 3: `PreviewFrame`** — ensure the printed iframe is the CV html so the printed PDF is the ATS CV, not the web page. No change to the imperative `print()` handle.

- [ ] **Step 4: Verify**
  Run: `npm run build` (exit 0). Manually (or via playwright) load preview, toggle to CV, trigger print-to-PDF, confirm output = ATS CV with working QR (decode the QR from the rendered PNG to confirm it equals the live URL).

- [ ] **Step 5: Commit**
```bash
git add src/app/api/generate-cv src/components/preview/PreviewFrame.tsx "src/app/[locale]/(app)/dashboard/[id]/preview/page.tsx"
git commit -m "feat: render ATS CV PDF in preview/print with QR to live portfolio"
```

---

## Task 5: Builder — simpler, GCC-friendly, CV fields, developer steps

**Files:** `src/components/builder/steps/CvFieldsStep.tsx` (create), `src/components/builder/BuilderForm.tsx`, `src/components/builder/steps/` (developer steps), `messages/en.json`, `messages/ar.json`

GCC-friendliness: minimal cognitive load (impeccable/taste), clear progress, AR RTL correct, sensible GCC defaults (phone country, optional nationality, languages incl. Arabic/English), no jargon. Don't add features — simplify.

- [ ] **Step 1: Create `CvFieldsStep.tsx`** — Summary (textarea, short helper), Languages (DynamicList name+level), Nationality (optional), References (DynamicList name/title/contact OR "available on request" toggle). Mobile-first: `grid-cols-1 sm:grid-cols-2`, `p-4 sm:p-8`.

- [ ] **Step 2: Register developer steps + insert CvFieldsStep** in `BuilderForm.tsx`: add `DEVELOPER_STEPS` (reuse engineer/creative pattern so developer stops falling back to corporate), and insert `CvFieldsStep` into all of corporate/engineer/creative/developer step arrays (after the experience/education step).

- [ ] **Step 3: Mobile shell pass** — ensure the step container, nav buttons, and progress bar are flawless at 390px (no overflow, tappable targets ≥44px, sticky next/back). Apply `ui-design:mobile-*` guidance.

- [ ] **Step 4: i18n** — add all new builder/CV/QR strings to `en.json` + `ar.json` (RTL-correct), no hardcoded English in the step.

- [ ] **Step 5: Verify**
  Run: `npm run build` (exit 0). 390px screenshots of each new/edited step (EN + AR). Assert no horizontal overflow, fields stack, AR mirrors.

- [ ] **Step 6: Commit**
```bash
git add src/components/builder messages/en.json messages/ar.json
git commit -m "feat: GCC-friendly builder — CV fields step, developer steps, mobile-first"
```

---

## Task 6: Mobile-perfect live portfolios (the QR destination)

**Files:** `src/templates/{corporate,engineer,creative,developer}/template.hbs`, `public/demo/*` as needed

The QR lands hiring teams on a phone. Each of the 4 live templates must be flawless at 390px: no horizontal overflow, readable hero, working nav, tap targets, fast. Creative cone + developer Spline already have mobile handling per history — verify, don't regress.

- [ ] **Step 1: 390px audit** each template via `scripts/mobile-shot.mjs` (render template.hbs with fixture → screenshot 390px). Record overflowPx, hero legibility, nav usability per template.

- [ ] **Step 2: Fix regressions** found (overflow, clipped headings, broken nav) using `impeccable` + `ui-design:mobile-*`. Keep changes surgical.

- [ ] **Step 3: Re-verify** at true 390px (playwright-core chrome channel). overflowPx must be 0 on all 4.

- [ ] **Step 4: Commit**
```bash
git add src/templates public/demo
git commit -m "fix: mobile-perfect live portfolios for QR-scan hiring view"
```

---

## Task 7: Landing/dashboard copy = hybrid positioning

**Files:** `src/app/[locale]/page.tsx`, dashboard copy, `messages/en.json`, `messages/ar.json`

- [ ] **Step 1: Reword** landing + dashboard from "PDF-only / coming soon" to the hybrid: "Build a professional CV PDF with a QR code to your live portfolio." Restore tasteful mention of the live portfolio URL now that hosting is on. Keep GCC tone, EN + AR.

- [ ] **Step 2: Verify** `npm run build` (exit 0); 390px landing screenshots EN + AR; grep that no stale "coming soon"/"PDF only" copy remains.

- [ ] **Step 3: Commit**
```bash
git add "src/app/[locale]/page.tsx" messages/en.json messages/ar.json
git commit -m "feat: hybrid CV+portfolio positioning across landing and dashboard"
```

---

## Task 8 (optional): Remotion promo video

**Files:** a `remotion/` mini-project or reuse existing video assets.

- [ ] **Step 1:** Using `video-remotion`, produce a short vertical promo showing: build → CV PDF → scan QR → live portfolio opens on a phone. Only if user wants the marketing asset; not required for the product to work.

---

## Self-Review

- **Spec coverage:** GCC-friendly builder → Task 5/7. Hybrid CV+portfolio for 4 templates → Tasks 3,5,6. Complete job-app PDF CV → Task 3. QR → live portfolio on trimind domain → Tasks 1,3,4. Mobile-perfect → Tasks 5,6 (verified at 390px). Design-skill appeal → Tasks 3,5,6 (impeccable/taste/frontend/mobile); remotion → Task 8.
- **Placeholders:** none — every code step shows code or an exact command; verification is the project's render-assertion + 390px-screenshot convention rather than fake unit TDD on Handlebars.
- **Type consistency:** CV fields (`summary`, `nationality`, `languages[]`, `references[]`) defined once in Task 2 (schema + portfolios + PortfolioData) and consumed identically in Tasks 3/5. `renderCvPdf(data,{qrDataUrl,liveUrl})` signature consistent across Tasks 3/4. `portfolioQrDataUrl(url)` consistent Tasks 1/4.
- **Deploy order:** Convex (Task 2) before any frontend write of new fields. Flag flip (Task 1) before QR target is used.
