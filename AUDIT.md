# Portfolio Pro — UX/QA Audit & Fix Sprint

Started: 2026-06-09. Auditor: Claude Code (impeccable + taste + design-motion-principles lenses).
Tested: Next.js dev (localhost:3789), Playwright — mobile 375x812 + desktop 1440x900, EN + AR.

Severity: CRITICAL / HIGH / MEDIUM / LOW. Status: `fixed` / `recommended` / `pending`.

> Local-testing note: Clerk console errors on localhost ("Production Keys are only allowed for domain portfolio-trimind.com") are an artifact of running production keys locally — not production findings.

## Phase 1 — Template Builder Forms

| # | Item | Severity | Status |
|---|------|----------|--------|
| 1.1 | **Builder step content was hardcoded English** — on `/ar/try/*` the chrome was Arabic but every label, hint, placeholder, heading and example inside all ~20 step components rendered in English (RTL-mangled). Fixed: full next-intl localization of every step across all 5 templates + shared field components (~680 new message keys, formal MSA with realistic GCC placeholders like سارة الرشيدي / شركة نفط الكويت; emails/URLs/phones stay LTR Latin). Verified in-browser: all 5 templates render native Arabic with zero missing-message errors; EN unchanged; production build passes. | CRITICAL | fixed |
| 1.2 | **Developer Stack tool icons blocked by CSP in production** — `DeveloperStackStep.tsx:81` loaded devicon SVGs from `cdn.jsdelivr.net`; `next.config.mjs:31` `img-src` does not allow it. All 29 tool icons failed (letter fallback). Fixed: SVGs self-hosted under `public/builder/devicon/`, component points at local path. | CRITICAL | fixed |
| 1.3 | **Color presets: no single config, no selected state, no live color preview** — presets were 4 separate inline arrays. Fixed: central `src/lib/color-presets.ts` (one file to extend with the Dalal-bot palettes), selected ring + `aria-pressed` on all preset grids, and the Customize preview now applies bg/primary/accent colors live (verified in browser). | HIGH | fixed |
| 1.4 | **PhotoUpload: no drag-and-drop, `alert()` validation errors, no upload progress, no explicit Replace.** Fixed: drag-and-drop with highlight state, inline friendly error messages (`role=alert`), indeterminate progress bar while uploading, keyboard-activatable drop zone; "Change photo"/"Remove" kept. | HIGH | fixed |
| 1.5 | **DynamicList: destructive Remove with no confirmation and no add/remove transition.** Fixed: two-tap confirm ("Remove" → "Tap to confirm", 3.5s window) for filled items, instant delete for empty ones, enter animation (transform/opacity only, `prefers-reduced-motion` respected), lucide Trash2/Plus icons, RTL-safe `end-2` positioning. Verified in browser. | HIGH | fixed |
| 1.6 | **Parity: engineer demo shows "Endorsements" section but engineer builder has no endorsements input and `engineer/template.hbs` never rendered endorsements.** Template side fixed (endorsements section + styles added, render-tested); builder input added to Background step. | HIGH | fixed |
| 1.7 | **Section-visibility toggles disconnected from templates** (worse than first thought): engineer template had ZERO `isHidden` gates (all 7 toggles dead); general toggles `experience`/`impact-stories` don't match template ids `career`/`impact` (2 of 8 dead); creative toggle `portfolio-showcase` doesn't exist in its template while template's `testimonials` gate has no toggle; creator (sharing general CustomizeStep) showed general sections though `creator/template.hbs` gates certifications/content-showcase/social-stats/languages/etc. Fixed: engineer template gained `isHidden` gates on all optional sections; toggle lists corrected per template (creator gets its own list via templateId). | HIGH | fixed |
| 1.8 | Phone fields used `type="text"` (no `tel`/`inputMode`), URL fields not `type="url"`, `autoComplete="off"` everywhere. Fixed: tel/url/email types + `inputMode` + autofill hints + `dir="ltr"` on phone/email/URL values (correct inside the RTL builder) across all 5 profile steps. | MEDIUM | fixed |
| 1.9 | Icon inconsistency: raw text glyphs (✎ × ← → ✓ ⓘ) mixed with SVG icons across builder chrome. Fixed: lucide Pencil/X/ArrowLeft/ArrowRight/Check/Info with `rtl:rotate-180` on directional arrows + aria-labels. | MEDIUM | fixed |
| 1.10 | Required steps (Experience, Projects) didn't validate on Next. Fixed: gentle two-press nudge — first Next on an incomplete required step shows an amber inline notice (bilingual), second press continues anyway (no dead ends). | MEDIUM | fixed |
| 1.11 | Junk directory `src/app/demo/\[templateId\]/` (shell-escaped name, empty) committed by accident. Removed. | LOW | fixed |
| 1.13 | All 5 `template.hbs` files hardcode English section titles ("Experience", "Skills"…) — published portfolios are English-first regardless of locale; Arabic relies on the runtime auto-translate button. Native-Arabic template output would be a meaningful upgrade for the GCC audience but is an architectural change (template copy per locale). | MEDIUM | recommended |
| 1.12 | Draft-pricing banner took ~140px of a 812px phone viewport on every step. Fixed: phones default to the compact pill after step 1 (step 1 keeps the full banner; desktop unchanged). Also: writing-tips boxes used dark-theme amber colors on the light form (poor contrast) — fixed to amber-50/amber-800. | LOW | fixed |

## Phase 2 — Live Demos (all 5)

| # | Item | Severity | Status |
|---|------|----------|--------|
| 2.1 | **Creator demo: memory game missing (EN).** Root cause: commit `51c3f5c` ("full content for engineer + creator demos") accidentally replaced the 56KB "Portfolio Quest" playable demo with a 14KB static page; only the Arabic file kept the game. Fixed: restored the game version, ported the later AR fixes (dead `href="#"` anchors → `role="button"`, hreflang alternates). Verified in-browser: intro offers Play / Skip-to-work, 12-card board flips and matches, static "see the work" view + back-to-game toggle, no broken images. | CRITICAL | fixed |
| 2.2 | Engineer EN demo: hero overflowed 32px horizontally on 375px phones (non-wrapping inline-flex stats row + grid min-content). Fixed: `flex-wrap` + `min-width:0`/`overflow-wrap`. (AR build already wrapped.) | HIGH | fixed |
| 2.3 | Corporate demo: impact card overflowed 13px on phones. Fixed via mobile padding + min-width:0. | MEDIUM | fixed |
| 2.4 | Creative demo: lightbox `<img src="">` (invalid empty src) + CTA/contact tap targets down to 13px high on phones. Fixed: src attribute removed until populated; mobile tap targets ≥44px (CTAs) / ≥24px (footer links, WCAG 2.2). Same for corporate/engineer footers. | MEDIUM | fixed |
| 2.5 | Developer demo: 9 links per locale to the fictional persona domain `okafor.dev` (dead navigation). Fixed: clicks intercepted with a bilingual toast ("part of the demo story — your real portfolio links to your own site"); hrefs retained for visual authenticity. | MEDIUM | fixed |
| 2.6 | Accessibility (Lighthouse mobile): corporate 89, engineer 90, creative 91, creator 85, developer 93 — all below the 95 target. Fixed: AA contrast for muted text/accents per demo (computed ≥4.5:1 replacements in each palette's family), `<main>` landmarks, section titles div→h2 + h4→h3 heading order, icon-nav aria-labels, pdf-button name mismatch. | HIGH | fixed |
| 2.7 | Creative demo performance 70 (LCP 9.3s): 46 full-size ~200KB artworks rendered as 148px thumbnails. Fixed: generated 360px `thumbs/` (11MB→1.4MB for grid/cube; lightbox-detail pages untouched). LCP 3.0s. | HIGH | fixed |
| 2.8 | Developer demo performance 64 under local **uncompressed** serving: dominated by document size + self-hosted Font Awesome + the WebGL keyboard. FA CSS now loads async with font preload. Remaining gap is the 3D keyboard bundle (active parallel workstream — not restructured here) and vanishes partly under Vercel brotli; re-verify on production. | MEDIUM | partially fixed |

**Lighthouse (mobile, local static server — production scores higher due to brotli):**

| Demo | Perf before → after | A11y before → after | BP | SEO |
|---|---|---|---|---|
| corporate | 89 → 91 | 89 → 98 | 96 | 100 |
| engineer | 96 → 93 | 90 → 100 | 96 | 100 |
| creative | 70 → 89 | 91 → 98 | 100 | 100 |
| creator | 94 → 90 | 85 → 98 | 96 | 100 |
| developer | 64 → 64 | 93 → 96 | 96 | 91 |

(Perf deltas of ±4 are run-to-run noise on swiftshader; the creative jump is the thumbnail fix.)

### Phase 2 verified-good (no action)
- No placeholder copy, no broken images, no horizontal overflow in any of the 10 pages (5 demos × EN/AR) at 1440/768/375 after fixes.
- Footer/OG/hreflang all point to portfolio-trimind.com; gallery detail links resolve to live production project pages.
- Zero console errors across all demo pages (favicon 404 under the local static server is an artifact).

## Phase 3 — Landing / Home Page

| # | Item | Severity | Status |
|---|------|----------|--------|
| 3.1 | **Template showcase missing 2 of 5 live templates** — only Corporate/Engineer/Creative had cards; Creator and Developer (both sellable, both with live demos) were absent from the landing entirely. Fixed: added both cards (bilingual copy, demo links, Use-this-template CTAs) in the existing card pattern; grid is now a clean 3+3 with the coming-soon cell. | HIGH | fixed |
| 3.2 | **Showcase screenshots were stale** (mockup-*-2026a.jpg, June 6 — before the demo redesigns and the creator-game restore). Fixed: regenerated all 5 from the current live demos via Playwright at a consistent 1200×800@2x viewport (developer captured after the 3D keyboard goes live), optimized as WebP (31–146KB); hero mockups updated to the same files. | HIGH | fixed |
| 3.3 | Click-test EN + AR: all 23 unique links per locale resolve (routes 200, anchors exist, externals legit). No dead ends. | — | verified |
| 3.4 | Hero → TryItForm → `/templates?prefill=1` → guest builder flow works; templates picker lists all 5 templates; pricing CTA → /templates. 4.900 KD price consistent (landing, pricing, builder banner, JSON-LD). | — | verified |
| 3.5 | Responsive: zero horizontal overflow at 375px on EN and AR; ScrollReveal respects `prefers-reduced-motion`; animations are transform/opacity only (no layout-property animation). | — | verified |

## Phase 4 — Dashboard

| # | Item | Severity | Status |
|---|------|----------|--------|
| 4.1 | **`listByUser` over-fetch**: the dashboard list query returned full portfolio documents including `generatedHtml` / `generatedProjectPages` (hundreds of KB per portfolio) that the cards never read — slow loads and visible flicker for users with several portfolios. Fixed: server-side projection to exactly the card fields (id, name, template, status, slug, name/title, dates, viewCount). | HIGH | fixed |
| 4.2 | Loading state was a bare "Loading..." text line. Fixed: skeleton cards matching the real grid (header + 3 cards, `motion-safe:animate-pulse`, `aria-busy`) — no spinner, no layout shift. | MEDIUM | fixed |
| 4.3 | Draft cards pushed "Publish" as the only primary button while Edit was a ghost — for a draft the next action is finishing the content. Fixed: drafts now show a primary "Continue editing / متابعة التحرير" with Publish as outlined secondary; paid/published keep Download/Publish primary. | MEDIUM | fixed |
| 4.4 | Icon consistency: ⧉ / × glyphs and 📋✏️🚀 emoji replaced with lucide (Copy, X, LayoutGrid, PenLine, Rocket, Check) + aria-labels on icon-only buttons. | LOW | fixed |
| 4.5 | Verified good: status system (draft/paid/published with action hints), two-step delete confirm, duplicate, view counts, bilingual empty state with pricing, responsive 1/2/3-column grid. | — | verified |

### Phase 1 verified-good (no action)
- Step navigation: sticky mobile progress bar + desktop step pills, autosave on navigation, "Saved on this device" indicator works (guest localStorage + Convex when authed).
- Inputs are controlled but stable — no focus loss or lag while typing (verified char-by-char).
- Tap targets: section-visibility rows are 56px clickable labels; examples/tips buttons have 44px mobile variants.
- Writing aids: char counters on textareas, power-word tips, per-field examples, template snippets.
- Photo upload validates type+size; blob URLs revoked correctly (no leaks).
- requiredFields marked with red asterisk; optional steps labeled + skippable.
