# Portfolio Pro — UX/QA Audit & Fix Sprint

Started: 2026-06-09. Auditor: Claude Code (impeccable + taste + design-motion-principles lenses).
Tested: Next.js dev (localhost:3789), Playwright — mobile 375x812 + desktop 1440x900, EN + AR.

Severity: CRITICAL / HIGH / MEDIUM / LOW. Status: `fixed` / `recommended` / `pending`.

> Local-testing note: Clerk console errors on localhost ("Production Keys are only allowed for domain portfolio-trimind.com") are an artifact of running production keys locally — not production findings.

## Phase 1 — Template Builder Forms

| # | Item | Severity | Status |
|---|------|----------|--------|
| 1.1 | **Builder step content is hardcoded English** — on `/ar/try/*` the chrome (nav, step label, buttons) is Arabic but every label, hint, placeholder, heading and example inside all ~20 step components renders in English, right-aligned by RTL (flipped asterisks/periods). Only `DeveloperCustomizeStep` uses i18n keys. For the GCC/Arabic audience this breaks the entire Arabic builder. | CRITICAL | pending |
| 1.2 | **Developer Stack tool icons blocked by CSP in production** — `DeveloperStackStep.tsx:81` loaded devicon SVGs from `cdn.jsdelivr.net`; `next.config.mjs:31` `img-src` does not allow it. All 29 tool icons failed (letter fallback). Fixed: SVGs self-hosted under `public/builder/devicon/`, component points at local path. | CRITICAL | fixed |
| 1.3 | **Color presets: no single config, no selected state, no live color preview** — presets were 4 separate inline arrays. Fixed: central `src/lib/color-presets.ts` (one file to extend with the Dalal-bot palettes), selected ring + `aria-pressed` on all preset grids, and the Customize preview now applies bg/primary/accent colors live (verified in browser). | HIGH | fixed |
| 1.4 | **PhotoUpload: no drag-and-drop, `alert()` validation errors, no upload progress, no explicit Replace.** Fixed: drag-and-drop with highlight state, inline friendly error messages (`role=alert`), indeterminate progress bar while uploading, keyboard-activatable drop zone; "Change photo"/"Remove" kept. | HIGH | fixed |
| 1.5 | **DynamicList: destructive Remove with no confirmation and no add/remove transition.** Fixed: two-tap confirm ("Remove" → "Tap to confirm", 3.5s window) for filled items, instant delete for empty ones, enter animation (transform/opacity only, `prefers-reduced-motion` respected), lucide Trash2/Plus icons, RTL-safe `end-2` positioning. Verified in browser. | HIGH | fixed |
| 1.6 | **Parity: engineer demo shows "Endorsements" section but engineer builder has no endorsements input and `engineer/template.hbs` never renders endorsements.** Users cannot reproduce what the demo sells. | HIGH | pending |
| 1.7 | **Creator section-visibility toggles are dead controls** — creator uses the general `CustomizeStep`, whose 8 toggles are general-template sections (Credentials Bar, Impact Stories…), and `creator/template.hbs` never calls `isHidden`. Toggling does nothing. | HIGH | pending |
| 1.8 | Phone fields used `type="text"` (no `tel`/`inputMode`), URL fields not `type="url"`, `autoComplete="off"` everywhere. Fixed: tel/url/email types + `inputMode` + autofill hints + `dir="ltr"` on phone/email/URL values (correct inside the RTL builder) across all 5 profile steps. | MEDIUM | fixed |
| 1.9 | Icon inconsistency: raw text glyphs (✎ ▶ × ← →) mixed with SVG icons across builder chrome; lucide-react is already a dependency. | MEDIUM | pending |
| 1.10 | Required steps (Experience, Projects) don't validate on Next — user can pass an empty required step silently and only discover gaps at preview. Non-blocking nudge needed (product principle: no dead ends, so don't hard-block). | MEDIUM | pending |
| 1.11 | Junk directory `src/app/demo/\[templateId\]/` (shell-escaped name, empty) committed by accident. | LOW | pending |
| 1.12 | Draft-pricing banner takes ~140px of a 812px phone viewport on first load (collapsible, persisted) — consider collapsed-by-default on phone. | LOW | recommended |

### Phase 1 verified-good (no action)
- Step navigation: sticky mobile progress bar + desktop step pills, autosave on navigation, "Saved on this device" indicator works (guest localStorage + Convex when authed).
- Inputs are controlled but stable — no focus loss or lag while typing (verified char-by-char).
- Tap targets: section-visibility rows are 56px clickable labels; examples/tips buttons have 44px mobile variants.
- Writing aids: char counters on textareas, power-word tips, per-field examples, template snippets.
- Photo upload validates type+size; blob URLs revoked correctly (no leaks).
- requiredFields marked with red asterisk; optional steps labeled + skippable.
