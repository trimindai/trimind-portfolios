# Developer demo — Socket Journey + Naresh-faithful scroll (Spec C)

> **REVISION 2 (2026-06-08, after visual review) — the orb is CUT.** User rejected the orb+socket mechanic and the centered keyboard (it covered the hero name). New direction, SUPERSEDING the orb sections below:
> - **Remove the orb + all `.orb-socket`s entirely** (delete `orb.js`, `#orb-stage`, `#orb-fallback`, the orb injection, `.orb-socket` divs + CSS, `__orbLand`). Keep the mute button + audio-unlock (now controls the keyboard's keycap sounds via `__demoSound`).
> - **Keep the ported fixed-background interactive keyboard (`keyboard.js`/`#kbd-stage`)** — clickable keycaps, NO external tool name/description label (already stripped in the port), wheel scrolls past it (no trap).
> - **The keyboard is now the connective thread that repositions per section (scroll-driven):** hero → floated RIGHT (name stays left, no overlap); skills → centered/prominent (its home); experience & projects → centered BEHIND the content cards (the opaque cards occlude it = ambient backdrop); contact → floated RIGHT. RTL mirrors the horizontal sides (hero/contact → LEFT). This re-introduces per-section keyboard movement that Revision 1 had removed.
> - **Keep Phase 1** (5 sections incl. education removed, Lenis retune, pointer-events overlay, opacity/scale breathing reveal, sticky centered headings, Naresh font/layout, Soft Daylight palette) and the keyboard fixed-bg + fallback + non-trapping scroll (Phase 2). Only Phase 3 (orb/sockets) is removed and the keyboard gains per-section positioning.
> Rest of this doc is historical (the orb design); follow this revision.


**Date:** 2026-06-08
**Target (DEMO ONLY):** `public/demo/developer/index.html` (EN) + `index-ar.html` (AR/RTL) + the orb (`orb.js`) + the keyboard scene (currently `stack/index.html`). **NOT** `src/templates/developer/template.hbs`, the builder, or the standalone `tech-keyboard/`. Palette stays "Soft Daylight" (unchanged).
**Reference:** github.com/Naresh-Khatri/3d-portfolio (branch `main`) + nareshkhatri.site. Replicate his **sections (exactly 5), font, layout, and section-to-section scroll experience**; keep only OUR differences: the orb+socket mechanic, our Soft Daylight colors, our keyboard, our sound.
**Supersedes:** the Phase-3 keyboard-dock handoff (the orb no longer docks into the trackball), the large-hero-orb sizing, and the whole multi-keyframe orb "journey/orbit". Builds on the Phase-6 fallback system.

## Goals (what "done" means)
1. **Scrolling is smooth AND easy to navigate** — no more getting trapped at the keyboard; Naresh's buttery-but-free feel.
2. **Exactly Naresh's 5 sections** (Hero, Tech Stack, Experience, Projects, Contact) — the **education/"extras" section is removed**.
3. **The orb is small (trackball-sized) and falls into a fixed Davy `#4b5056` socket in EVERY section** — detached from the keyboard, arranged so the drop zig-zags down the page (fun to scroll). No travel/dock "orbit" — the rule is simply: the trackball falls into the current section's socket. Gravity-fall + bounce-settle + roll-spin + a **click** on each landing. **Sound on, with a mute toggle.**
4. **Sections are arranged + animated like Naresh's** (his font, layout proportions, sticky centered headings, oversized sections, the universal opacity+scale reveal) — keeping only our Soft Daylight colors.
5. **The keyboard stays OURS** (same scene, visuals, keycap sounds) presented as a **fixed background** that never traps the wheel — and the user **keeps drag-to-rotate** (it does NOT auto-move per section).

---

## Root cause of today's bad scroll (fix both)
1. **The keyboard `<iframe>` traps the wheel.** Wheel/touch over an iframe scrolls the iframe (fixed height → nothing) and never reaches the parent page → stuck at Skills. Iframes isolate scroll by design.
2. **Smoothing config:** Lenis `lerp:0.09` (heavy floaty lerp) + `html{scroll-behavior:smooth}` fighting it.

**Naresh avoids #1 entirely:** his keyboard is a `position:fixed` full-screen Spline canvas behind a `pointer-events:none` content layer (interactive children re-enabled), so the page always scrolls freely past it and clicks still reach the canvas. We adopt the same architecture.

---

## Architecture — the layered stage (matches Naresh)

Three fixed background layers + one scrolling content overlay:

```
z-index  layer
  -3     #stars / gradient field (existing)
  -2     #kbd-stage   ← keyboard canvas (NEW: ported out of the iframe), fixed, user-rotatable (drag); wheel passes through
  -1     #orb-stage   ← orb canvas (existing), fixed; the ball falls socket→socket
   0     .orb-socket  ← per-section Davy cradles (DOM, inside each section; occlude ball base)
   1+    page content ← .wrap/cards/text; the content layer is pointer-events:none,
                         interactive children (a,button,input,headings,p,.key,…) re-enabled to auto
```

**Pointer-events overlay (the key trick):** a wrapper around the scrolling content gets `pointer-events:none` so wheel/touch fall through to the fixed canvases (page scrolls; keycaps clickable). Re-enable `pointer-events:auto` on `a, button, input, textarea, select, label, .key, [role], nav, .proj, summary` etc. (Naresh's `canvas-overlay-mode` pattern). This is what lets the keyboard be clickable WITHOUT trapping the wheel.

### Keyboard: iframe → parent fixed canvas (port, not rewrite) — KEEP rotate
- Port the Three.js scene from `stack/index.html` into a parent-page classic script **`keyboard.js`** rendering into a fixed `<canvas id="kbd-stage">` (mirrors how `orb.js` works). Same geometry, materials, keycaps, **synth keycap sounds** — OUR keyboard, unchanged visually.
- **KEEP drag-to-rotate** (user: "I want to rotate it as I want — it's good"). Why this no longer traps scroll: in a parent canvas, pointer-DRAG rotates the keyboard, but the **wheel is never captured** (we don't `preventDefault` wheel), so the page scrolls freely past it. The iframe trapped the wheel because iframes isolate scroll; a parent canvas does not. Keep the gentle idle Y-spin too.
- **No per-section auto-movement** (user: "remove the orbit concept"): the keyboard does NOT scrub/fly between per-section states. It's a **persistent, user-rotatable backdrop** positioned like Naresh's hero placement (floated to one side). All per-section motion belongs to the ORB, not the keyboard.
- **Keep keycap interaction:** click/tap a keycap → press sound + skill label (existing), via events on the fixed canvas (reachable through the pointer-events overlay).
- The inline `<iframe>` (`stack/index.html`) is removed; the keyboard is now the fixed bg canvas. The Skills section's DOM content = its sticky heading (+ optional "drag to rotate / press a key" hint), Naresh-style.
- **Touch nuance:** a touch starting on the keyboard rotates it; a touch on content scrolls (pointer-events overlay handles this). Keep it forgiving so mobile scroll is never trapped.

### Orb: smaller + simple fall-into-socket (detached from keyboard)
- Ball shrinks to a consistent **trackball size** (~0.5 scale; down from hero 1.30). Blue glass, palette unchanged.
- **Remove the entire Phase-3 dock-to-trackball logic AND the multi-keyframe travel "orbit"** — the rule is now dead simple: **in each section the trackball falls into that section's Davy socket.** No docking, no choreographed journey.
- **Targets come from the DOM sockets** (read each `.orb-socket`'s `getBoundingClientRect` → on-screen target), exactly the technique the old dock used for the trackball. The ball always lands precisely in its section's socket, responsive by construction.
- **Motion = fall + settle + roll:** vertical approach accelerates (gravity ease) as the ball nears a socket, then a damped **bounce-settle**; horizontal eased; **rotation tied to horizontal displacement** so it visibly rolls.
- **Landing detector:** when the ball arrives within a small threshold of a socket with low velocity, fire ONCE per section entry → **click sound** + a brief squash/contact-shadow pulse.

### Davy sockets (DOM, one per section)
- `<div class="orb-socket" aria-hidden="true">` inside each of the **5** sections (hero, skills, experience, projects, contact).
- Style: Davy `#4b5056` **cradle/cup** — concave top, soft contact shadow; the orb (z-index −1, behind content) is **occluded at its base** by the socket → reads as "seated in the cradle." On the dark Contact background, add a lighter rim/inner-shadow so the socket still reads.
- **Zig-zag arrangement (the "fun fall")** — alternating sides so the ball drops left↔right down the page (RTL mirrors X). Bias away from the keyboard backdrop's side so they never overlap:

  | Section | Socket X (of half-viewport) | Note |
  |---|---|---|
  | Hero | +0.45 (right) | ball enters/blooms, drops into hero socket |
  | Skills | −0.45 (left) | opposite side from the keyboard backdrop |
  | Experience | +0.55 (right) | beside the timeline |
  | Projects | −0.10 (center-left) | in a visible gutter, not behind cards |
  | Contact | 0.0 (center) | final settle on the dark panel |

  (Exact placements tuned in the harness so a socket never overlaps text or the keyboard.)

---

## Sections, scroll + reveal (replicate Naresh)
- **Exactly 5 sections, education removed:** delete the `#extras` (education/certifications) section from `index.html` + `index-ar.html` (markup, its nav link, scrollspy entry, and any reveal hooks). Final order = Hero → Skills (Tech Stack) → Experience → Projects → Contact, matching Naresh.
- **Font + layout fidelity:** match Naresh's type + layout proportions — display = **Archivo Black** (already ours), body = **Inter**, mono = JetBrains Mono; hero = left-column text + the keyboard floating on the empty right; experience = vertical timeline of cards; projects = 3-col card grid → modal; contact = translucent form card on the left. Keep our copy and **Soft Daylight colors** (the only deviation from Naresh).
- **Lenis:** replace `lerp:0.09` with Naresh's config — `new Lenis({ duration: 1.2 })` (his is `2`; we start a touch snappier and tune — the slowness only felt bad because of the trap, now fixed). Keep `body{scroll-behavior:smooth}` for hash-anchor glides; drop the competing `html{scroll-behavior:smooth}` while Lenis is active. Single clean raf loop (existing pattern).
- **Universal section reveal (the signature feel):** each section maps its scroll progress to **opacity `[0→1→1→0]` + scale `[0.8→1→1→0.8]`** (enter and leave). Implement with a small IntersectionObserver/scroll-progress helper (no GSAP dependency needed; vanilla, reduced-motion-safe). Replaces the current one-shot `.box-reveal`.
- **Sticky centered headings + oversized sections:** section headings become `position:sticky; top:~70px`, centered, with generous bottom margin so the title hangs while content scrolls under it; section min-heights bumped toward 120–150vh for scroll runway. Keep our copy + Soft Daylight styling.
- **No scroll-snap** (Naresh has none); nav anchors + scrollspy + progress bar stay (minus the removed education link).

---

## Sound (orb landings + keyboard) — on, with mute
- One shared Web-Audio context (reuse/extend the keyboard's synth approach). **Orb landing = a short marble-click** distinct from keycap switch sounds.
- **AudioContext unlock** on first user gesture (pointer/touch/key/scroll) — browsers block audio before activation; a silent 1-sample buffer unlocks (the keyboard already does this on iOS).
- **Mute button** (small, fixed corner, like the creator game's), default **un-muted**; state in `localStorage`. Mutes both orb clicks and keycap sounds.
- Reduced-motion/low-end: no live motion → no orb clicks (keycap sounds still on click if the static keyboard is interactive; see fallback).

---

## Perf / reduced-motion / fallback (extend Phase 6)
- **Orb:** keep Phase-6 behavior — `#orb-fallback` static CSS sphere shows for reduced-motion / low-end / no-WebGL / pre-load; `.orb-live` hides it once the live orb paints. In fallback mode the **sockets still render** (inert Davy cradles); the static ball rests in the hero socket. No sound, no falling.
- **Keyboard:** add an equivalent static fallback for reduced-motion / low-end / WebGL-fail (a static image or the existing photoreal `.hero-kbd` treatment / a CSS placeholder) so the bg layer degrades instead of going blank. Tier-gate its lazy injection like the orb (skip the heavy 3D on `reduce`/low-end).
- **Pause** both canvases on `visibilitychange`; guard WebGL creation (try/catch); `webglcontextlost` → graceful static.
- Targets: no layout shift, no scroll jank, mid-range phone > 50fps, sockets never overflow (phone overflowPx 0).

---

## RTL (Arabic, `index-ar.html`)
- Mirror socket X (already negated in `orb.js` for `dir=rtl`), keyboard hero side, and the zig-zag. Sticky headings + reveals identical. Verify RTL has no overflow and the fall mirrors cleanly.

---

## Verification (headless: playwright-core + swiftshader, serve `public/`, EN+AR × phone+desktop)
Extend `scripts/orb-phase6-check.mjs` (or a new `scripts/socket-journey-check.mjs`):
1. **Scroll is free:** programmatic scroll top→bottom reaches the contact section (no point where scrollY stalls); the keyboard layer does not block `window.scrollY` advancing while the cursor is over it.
2. **One orb, lands in each socket:** at each section anchor, the orb's screen position is within tolerance of that section's `.orb-socket` centre; exactly one orb canvas.
3. **Sockets present + sized** in all 5 sections, EN + AR (mirrored X); the education/`#extras` section is gone (404 of the anchor, no section in DOM).
4. **Reveal:** sections reach full opacity when centered and reduce when leaving.
5. **Keyboard:** `#kbd-stage` WebGL context healthy; a synthetic keycap click still fires (sound path reachable) without preventing a subsequent page scroll.
6. **Reduced-motion / low-end:** fallback orb visible, sockets inert, no `.orb-live`, 3D not injected; zero console errors; no phone overflow.
7. Zero console errors everywhere; screenshots saved.

---

## Out of scope
- The data-driven `src/templates/developer/template.hbs`, builder steps, and standalone `tech-keyboard/` — DEMO only.
- Palette changes (Soft Daylight stays).
- Naresh's exact tech (Next/Spline/GSAP/Framer) — we replicate the *feel* in vanilla static HTML/JS.

## Suggested phasing (writing-plans will detail)
- **P1 — Sections + scroll + arrangement:** remove the education section; Lenis retune; pointer-events overlay scaffold; sticky centered headings + oversized sections; universal opacity+scale reveal; Naresh font/layout pass. (No keyboard/orb change yet.)
- **P2 — Keyboard to fixed bg (keep rotate):** port `stack/` scene → `keyboard.js` + `#kbd-stage`; KEEP drag-to-rotate + idle spin; wheel passes through (no trap); keep click+sound; remove the inline iframe; persistent backdrop (no per-section movement); add keyboard fallback.
- **P3 — Orb fall-into-socket:** smaller orb, remove dock + travel "orbit", DOM Davy sockets (zig-zag, 5 sections), fall+bounce+roll, landing click, mute button, sound unlock.
- **P4 — RTL + fallback + perf hardening + full verify harness.**
