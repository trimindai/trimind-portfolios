# Creator Template — "Portfolio Quest" Game Demo

**Date:** 2026-06-03
**Status:** Approved (build authorized)
**Scope:** The live demo for the `creator` template — a self-contained, playable
browser game at `public/demo/creator/index.html`. Net-new (no demo exists yet).

---

## 1. Concept

The creator's portfolio is reframed as a **playable memory card-match game**. A
potential client / hiring team plays; each matched pair of cards reveals a real
piece of the creator's work (a project, a brand collab, a social stat, a skill).
Difficulty ramps **gently** as they dig deeper. The finale is a **"Contact the
Creator"** round — connecting the creator's channels — which fires the **win
screen**. Winning = reaching out for real.

The job of the demo: (1) hook a hiring manager in seconds, (2) actually
communicate who the creator is and what they've done, (3) drive contact.

## 2. Council rulings (binding)

**Council #1 — mechanic:** Memory card-match **wins** over Color/Simon. The
memory loop *is* the act of revealing the creator's work (mechanic = message); a
quitter still learns who the creator is; cards carry rich media; ships in ~a day,
data-driven, re-skinnable. Simon reveals nothing but a color order.

**Council #2 — concept:** "Portfolio as a game" is **net-positive, conditionally.**
Strong for brand/agency/creative buyers and social sharing; weak for traditional
scan-in-5-seconds recruiters. Therefore the build has **two binding amendments**:

1. **Permanent "Skip → see the work"** path, always visible, that drops the
   visitor into a clean **static portfolio view** of the same content (the
   recruiter front-door). Plus a permanent **"Contact now"** button. No hostage gate.
2. **One-glance framing** on landing: the visitor instantly knows it's an
   *optional* game ("Play to explore my work — or skip it").

Deferred (banked, not in v1): leaderboards, rate-card unlocks, rematch, real
analytics backend. v1 includes a wireable `track()` shim only (no fabricated backend).

## 3. Persona (fictional demo content)

**Remi Vance — Content Creator & Brand Storyteller.** Multi-platform (YouTube /
Instagram / TikTok). Energetic, cinematic. Mirrors the pattern of prior demos
(creative = Dalal Al-Kandari, developer = Maya Okafor). All stats/brands are
original/fictional to avoid trademark issues; brand names are invented wordmarks
(Lumen, Vélo, Aura Studios, Northwind, Kasa, Pulse).

Data object `CREATOR` (single source of truth, drives game + static view):
basics (name, title, tagline, location, monogram), stats[] (followers/views/
engagement/collabs), projects[] (title, result, platform, gradient), brands[]
(wordmark), skills[] (label), contact[] (channel, href, icon).

## 4. Game design — "Portfolio Quest"

Title screen → 3 ramping match levels → Contact round → win screen.

- **Title:** big animated gradient name, one-line "Play to explore Remi's work —
  or skip it", `▶ Play` + `Skip → see the work`. Persistent top bar (during play)
  shows progress to Contact, a `Skip → see the work` link, and `Contact now`.
- **Level 1 — The Work (Projects):** 3 pairs / 6 cards (3×2). **No timer.** Each
  match reveals a flagship project (gradient thumb + title + result stat) into a
  growing **"Discovered" log**.
- **Level 2 — The Reach (Brands & Stats):** 4 pairs / 8 cards (4×2). Lenient,
  generous timer introduced (delight, not anxiety). Matches reveal brand collabs
  + social stats with count-up.
- **Level 3 — The Craft (Skills & Tools):** 6 pairs / 12 cards (4×3). Slightly
  tighter but still generous. Matches reveal skills.
- **Final — Contact the Creator:** not a grid — match each contact channel
  (email / IG / YouTube / site) to "connect" it. All connected → **win screen**:
  confetti, "You've unlocked Remi — let's work together," real contact buttons.

Graceful partial value: the **Discovered log** means quitting anytime still
leaves the player knowing the creator's work. Skip → static view always available.

## 5. Static view ("see the work" / recruiter front-door)

A clean, scrollable one-page portfolio of the **same `CREATOR` data**: hero,
stats, projects grid, brand marquee, skills, contact. Toggled by the persistent
Skip button (and reachable directly). Satisfies Council's audience-bifurcation
ruling: game front-door for brands/socials, static front-door for recruiters.

## 6. Visual design

Creator manifest palette: amber `#f59e0b`, red `#ef4444`, violet `#8b5cf6` over
near-black `#0c0a09`; Plus Jakarta Sans (head) + Inter (body). Animated gradient
hero name, noise-texture overlay, glow, **3D spring-overshoot card flip**
(`rotateY`), count-up stats, brand marquee. Energetic creator-economy tone —
intentionally distinct from the platform's own "Quiet Atelier" brand (this is a
*creator's* portfolio, not Portfolio Pro's chrome).

## 7. Tech & constraints

- **Single self-contained** `public/demo/creator/index.html`: inline `<style>` +
  inline `<script>`, vanilla JS, no build step, no binary assets (pure CSS
  gradients + inline SVG icons). Only external: Google Fonts (matches other demos).
- **Mobile + desktop:** responsive CSS grid, tap + click + keyboard (tab/enter to
  flip). True-390px verified via `scripts/mobile-shot.mjs` pattern.
- **Accessibility:** `prefers-reduced-motion` disables flips/confetti timing; aria
  labels on cards; no anxiety timer in L1; Skip/Contact always keyboard-reachable.
- **Instrumentation:** a no-op `track(event, data)` shim at defined points
  (play-start, level-clear, skip, contact-click, win) — structured to wire to a
  real backend later, but **stubbed** (console only) in v1.

## 8. Integration

1. Create `public/demo/creator/index.html`.
2. `vercel.json`: add `{ "source": "/demo/creator", "destination": "/demo/creator/index.html" }`.
3. `src/lib/templates.ts`: add `creator: "/demo/creator"` to `DEMO_URLS`; add
   `m.id === "creator"` to the `available` clause.
4. Verify: `npm run build` passes; headless screenshots (desktop + true-390px) of
   title, a mid-level board, and the win screen; no leftover `{{`/console errors.

## 9. Non-goals (v1)

No Convex schema changes, no builder steps, no change to the data-driven
`creator/template.hbs` (real-user template) — this spec is **only** the live demo.
Builder/template parity for the game is a separate future spec if desired.
