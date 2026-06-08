# Developer demo — the Orb Journey (Spec B)

**Date:** 2026-06-08
**Target (confirmed):** the LIVE static demo `public/demo/developer/index.html` — **vanilla Three.js** (r128, vendored), NOT a React/R3F app. The user's spec was written for Next.js 14 + R3F, but no such repo exists; we adapt the design to the static demo. Keyboard dock = **synced visual handoff** (keep the iframe keyboard as-is).

## What already exists (do NOT rebuild)
- **Lenis smooth scroll** (`vendor/lenis.min.js`, instantiated in the main script, gated by `reduce`).
- **Hero entrance stagger** — `.blur-in` + `data-delay` on Hi-I'm → Maya Okafor → role → blurb → CTAs → stats (6+/40+/1.2M).
- **Reduced-motion** flag `reduce`; section `box-reveal`; scrollspy nav; `#progress` bar; starfield `#stars`; elastic cursor; project modals.
- Keyboard = `stack/index.html` (vanilla Three.js, in an iframe) — its trackball is the dock target. KEEP AS-IS.

## New work = the persistent ORB system
One conserved 3D object in a single fixed full-screen canvas behind the DOM, traveling through sections on scroll. Solid 99% of the time; particalizes only at hero-bloom + keyboard-dock.

### File structure
- `public/demo/developer/orb.js` — the orb system (classic script; uses global `THREE` from vendored r128). Lazy-injected after load (mirrors the Lenis injection pattern), gated by `reduce`/tier.
- `public/demo/developer/vendor/three.min.js` — vendored r128 (copied from stack/vendor; self-hosted for CSP).
- `index.html` — add `<canvas id="orb-stage">`, the background-transparency refactor, and the lazy script injection.

### Background layering (so a fixed canvas shows behind content)
- `html { background:#ccd1da }` (base light field, behind the canvas).
- `body { background:transparent }` (was `var(--bg)`).
- `#orb-stage { position:fixed; inset:0; z-index:-1; pointer-events:none }` — `alpha:true` clear, so the subtle gradient/starfield (z-2/-3) show through its empty areas and the orb renders in front of them, behind content.
- Opaque `.tl-card` / `.proj` / `#contact` naturally occlude the orb = the intended "ambient depth behind content". Contact visibility tuned in its phase (semi-transparent panel or orb settles in a visible band).

### Section anchoring (runtime, never hardcoded px)
- Measure each section `offsetTop`/`offsetHeight` via ResizeObserver + resize/load. Anchor = scroll value where the section is centered: `anchorY = top + height/2 - innerHeight/2`.
- Each frame: read `window.scrollY` (Lenis updates native scroll, so this is the smoothed value), find the two section anchors it's between, lerp `t`, interpolate the orb keyframe. SPRING on position (slight overshoot), eased color/scale.

### Keyframes (screen-fraction x/y of half-viewport at z=0 plane; tune for feel; stay in blue palette)
| Section | x | y | scale | color | note |
|---|---|---|---|---|---|
| Hero | +0.42 | 0.0 | 1.0 | `#6d99ce` | centered-right; bloom on load; breathe + cursor parallax |
| Tech Stack | ~0.0 | screen-pos of trackball | 0.55 | `#6d99ce` | DOCK: handoff to iframe trackball |
| Experience | −0.62 | 0.0 | 0.40 | `#6d99ce` | side margin, low opacity, accompanies timeline |
| Projects | 0.0 | 0.0 (z back) | 0.70 | `#6d99ce` | ambient depth behind cards; calm, no particles |
| Contact | 0.0 | 0.0 | 0.85 | shift toward `#4b7bbf`/lighter rim | settle on dark bg, final idle rotation |
(extras/Education sits between projects+contact — orb glides through.)

### Rendering — hybrid
- **Solid** (default): sphere with a fresnel/iridescent blue glassy material (custom shader or MeshPhysical + fresnel rim). NOT a textured image; remove the static `hero-orb.png` + its hard glow ring (Phase 2).
- **Particles** (hero bloom + dock ONLY): point cloud sampled from the sphere, curl-noise disperse → attractor re-form. Disposed/paused outside the two windows. Crossfade/morph, not a hard swap.

### Dock handoff (keep iframe keyboard)
The orb (background canvas) flies to the trackball's on-screen position (computed from the iframe rect + the trackball's known position within it), particalizes, and crossfades as the iframe's real trackball reads as the settle. Brief z-index lift of the orb canvas over the iframe at the dock frame if needed for visibility.

### Perf (mandatory)
- Tier detect (hardwareConcurrency / deviceMemory / UA / width): desktop ~20k particles dpr≤2 · mobile ~5k dpr≤1.5 · low-end particles disabled. 
- `prefers-reduced-motion` OR low-end → NO continuous sim: orb becomes a static CSS/gradient sphere that snaps to one resting spot per section (or just the existing static look). Page fully usable.
- Pause RAF when canvas offscreen (IntersectionObserver) / tab hidden (visibilitychange). Lazy-load the 3D after first paint.
- No layout shift, no scroll jank; mobile > 50fps mid-range.

## Phases (build incrementally, runnable + verified each)
1. Canvas + bg refactor + scroll/section plumbing + **solid orb travels + springs** through all targets (no particles). Verify smoothness.
2. Remove static hero orb img/glow; orb = live mesh; hero bloom-less settle + breathing + cursor parallax. (Hero text stagger already exists.)
3. Keyboard **dock** handoff (orb → trackball).
4. **Particle** mode for hero bloom + dock window only.
5. Experience/Projects reveals polish + project card hover-tilt + real preview content.
6. Perf tiers + reduced-motion fallback + offscreen pause + lazy-load hardening.

Verify after each phase via headless (playwright-core + swiftshader): scroll top→bottom, confirm ONE continuous orb, dock reads as a settle, no jank; AA/console clean.

---

## Status — ALL PHASES SHIPPED ✅ (2026-06-08)
P1 (traveling solid orb), P3 (keyboard dock), P4 (particle bloom), P5 (contact glow-through + card polish), and the Arabic RTL mirror shipped earlier today (`eec9066`→`6af66ae`).

**Phase 6 (final — this session):** progressive-enhancement hardening so the orb degrades gracefully instead of vanishing.
- **Static CSS fallback orb** (`#orb-fallback`, a radial-gradient glass sphere in the hero) is now the default. `orb.js` adds `<html>.orb-live` only after the first real WebGL frame paints, which hides the fallback. So reduced-motion, low-end, WebGL-unavailable, GL-context-loss, and the pre-load window all show a tasteful static orb — never an empty hero. RTL mirrors it to the left.
- **WebGL creation guarded** (try/catch → fallback stays). **`webglcontextlost`** removes `.orb-live` (reverts to the static orb) instead of a black canvas.
- **Loop hardening:** `running`/`firstFrame` flags; `resume()` can't stack RAF loops; tab-hidden pause kept. (Note: the canvas is `position:fixed` full-viewport, so it is never scrolled offscreen — an IntersectionObserver would always intersect; tab-visibility is the real signal. Documented in code.)
- **Lazy-load tier-gate:** the 3D injector now skips on `reduce` **or** low-end (`deviceMemory<=2` / `hardwareConcurrency<=2`), so weak phones don't download the ~600KB Three.js bundle just to bail.
- **Verify harness:** `scripts/orb-phase6-check.mjs` (playwright-core + swiftshader) — 3 device states × EN/AR: normal→live orb engages + `.orb-live` set + fallback hidden + GL healthy + `orb.js` injected; reduce & low-end→`.orb-live` absent + fallback visible/circular/sized + `orb.js` NOT injected; everywhere→zero console errors, no phone overflow. **30/30 PASS.** (The keyboard `/stack/` iframe loads its own Three.js and is out of scope — "KEEP AS-IS"; the harness keys on `orb.js`, not `three.min.js`, to avoid that false signal.)
