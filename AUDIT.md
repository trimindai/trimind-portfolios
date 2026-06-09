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

### Phase 1 verified-good (no action)
- Step navigation: sticky mobile progress bar + desktop step pills, autosave on navigation, "Saved on this device" indicator works (guest localStorage + Convex when authed).
- Inputs are controlled but stable — no focus loss or lag while typing (verified char-by-char).
- Tap targets: section-visibility rows are 56px clickable labels; examples/tips buttons have 44px mobile variants.
- Writing aids: char counters on textareas, power-word tips, per-field examples, template snippets.
- Photo upload validates type+size; blob URLs revoked correctly (no leaks).
- requiredFields marked with red asterisk; optional steps labeled + skippable.
