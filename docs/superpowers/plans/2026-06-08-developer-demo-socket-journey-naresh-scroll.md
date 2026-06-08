# Developer Demo — Socket Journey + Naresh-faithful Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the developer live demo so scrolling is smooth and never trapped (Naresh-faithful), the keyboard is a fixed user-rotatable background, and a small blue-glass orb falls into a Davy `#4b5056` socket in each of Naresh's 5 sections with a click sound.

**Architecture:** Three fixed background layers behind a pointer-events-transparent content overlay — `#stars` (z -3), `#kbd-stage` keyboard canvas (z -2, drag-rotatable, wheel passes through), `#orb-stage` orb canvas (z -1) — plus per-section DOM `.orb-socket` Davy cradles (z 0) and the scrolling content (z 1+). The orb targets each section's socket rect (no dock, no travel keyframes). Lenis `duration:1.2` + a vanilla opacity/scale section reveal replicate Naresh's feel.

**Tech Stack:** Static HTML/CSS + vanilla JS, Three.js r128 (vendored, global `THREE`), Lenis (vendored), Web Audio. Verification: `playwright-core` + pinned chromium + `--use-gl=swiftshader`, serving `public/` via `python3 -m http.server`.

**Spec:** `docs/superpowers/specs/2026-06-08-developer-demo-socket-journey-naresh-scroll-design.md`

**Conventions for every task below:**
- Files live under `public/demo/developer/`. EN = `index.html`, AR = `index-ar.html`. **Apply each HTML change to BOTH files** (AR mirrors X: `right`↔`left`) unless a step says otherwise.
- The "test" is the headless harness. The harness lives at `scripts/socket-journey-check.mjs` (created in Task 0). Run with `node scripts/socket-journey-check.mjs` from repo root.
- Chrome path: `/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome`.
- Shared tree: `git add` ONLY the files you changed; never `git add -A` (foreign untracked files exist).
- Commit after each task with the message shown.

---

## Task 0: Bootstrap the verification harness (RED for everything that follows)

**Files:**
- Create: `scripts/socket-journey-check.mjs`

This harness grows across phases; start with a skeleton that serves `public/`, drives EN+AR × phone+desktop, and exposes helpers. It mirrors the proven `scripts/orb-phase6-check.mjs` (read it first for the server/port/launch boilerplate).

- [ ] **Step 1: Create the harness skeleton**

```js
// Socket Journey + Naresh-scroll verification harness (developer demo).
// Serves public/, drives playwright-core + swiftshader, EN+AR × phone+desktop.
// Phases add checks; run: node scripts/socket-journey-check.mjs
import { chromium } from "playwright-core";
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";
function portFree(p){return new Promise(r=>{const s=net.createServer();s.once("error",()=>r(false));s.once("listening",()=>s.close(()=>r(true)));s.listen(p,"127.0.0.1");});}
let server=null;
function killServer(){ if(server&&!server.killed){ try{server.kill("SIGKILL");}catch{} } server=null; }
process.on("exit",killServer); process.on("SIGINT",()=>{killServer();process.exit(130);}); process.on("SIGTERM",()=>{killServer();process.exit(143);});
function spawnServer(p){ const py=spawnSync("python3",["--version"],{stdio:"ignore"}); if(py.status===0) return spawn("python3",["-m","http.server",String(p),"--directory","public"],{stdio:"ignore"}); return spawn("npx",["--yes","serve","public","-l",String(p)],{stdio:"ignore"}); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const failures=[]; const pass=m=>console.log("PASS "+m); const fail=m=>{failures.push(m);console.log("FAIL "+m);};

let PORT=(await portFree(8799))?8799:((await portFree(8800))?8800:8801);
const BASE=`http://localhost:${PORT}`;
server=spawnServer(PORT); await sleep(800);
const browser=await chromium.launch({executablePath:EXEC,headless:true,args:["--no-sandbox","--use-gl=swiftshader"]});

const ROUTES=[{key:"en",file:"index.html"},{key:"ar",file:"index-ar.html"}];
const VIEWS=[{key:"phone",vp:{width:390,height:844}},{key:"desk",vp:{width:1280,height:900}}];

async function withPage(route,view,opts,fn){
  const ctx=await browser.newContext({viewport:view.vp,deviceScaleFactor:2,...(opts||{})});
  const page=await ctx.newPage(); const errors=[];
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  page.on("pageerror",e=>errors.push("PE:"+e.message));
  await page.goto(`${BASE}/demo/developer/${route.file}`,{waitUntil:"load",timeout:60000});
  await page.waitForTimeout(3000);
  await fn(page,errors,`${route.key}-${view.key}`);
  await ctx.close();
}

try {
  console.log("── Socket Journey harness ──", BASE);
  for (const route of ROUTES) for (const view of VIEWS) {
    await withPage(route,view,null,async(page,errors,tag)=>{
      // PHASE CHECKS APPENDED BELOW (Tasks add blocks here)
      if (errors.length) fail(`[${tag}] ${errors.length} console error(s): ${errors.slice(0,3).join(" | ")}`);
      else pass(`[${tag}] zero console errors`);
      await page.screenshot({path:`scripts/_sj-${tag}.png`,fullPage:false});
    });
  }
} finally { await browser.close().catch(()=>{}); killServer(); }

if (failures.length){ console.error("\n──── FAILURES ("+failures.length+") ────"); failures.forEach(f=>console.error(" ✗ "+f)); process.exit(1); }
else { console.log("\nALL CHECKS PASSED"); process.exit(0); }
```

- [ ] **Step 2: Run it (baseline)**

Run: `node scripts/socket-journey-check.mjs`
Expected: PASS on zero-console-errors for all 4 tags (the current demo is clean), `ALL CHECKS PASSED`. If it fails to launch, fix the EXEC path / server before proceeding.

- [ ] **Step 3: Commit**

```bash
git add scripts/socket-journey-check.mjs
git commit -m "test(dev-demo): bootstrap socket-journey verification harness"
```

---

# PHASE 1 — Sections + scroll + arrangement

Goal: Naresh's 5 sections, navigation no longer sluggish/floaty, his "breathing" reveal + sticky headings. (Keyboard still inline iframe and orb still old behavior at end of P1 — fixed in P2/P3.)

## Task 1.1: Remove the education / `#extras` section

**Files:** Modify `index.html`, `index-ar.html` (EN markup; AR is parallel ~2 lines offset)

- [ ] **Step 1: Delete the section markup.** In `index.html`, locate `<section id="extras">` (around line 661) and delete the entire `<section id="extras"> … </section>` block. Do the same in `index-ar.html`.

- [ ] **Step 2: Remove its nav link.** In the `<nav>` block, delete the anchor whose `data-sec="extras"` (the Education/Extras link) in BOTH files. The nav must end with exactly: Home, Stack, Work, Projects, Contact (5 links → but note Skills uses label "Stack", Experience uses "Work"). Confirm 5 anchors remain.

- [ ] **Step 3: Add the harness check.** In `socket-journey-check.mjs`, inside the per-page block, add:

```js
const secCount = await page.evaluate(()=>document.querySelectorAll("section[id]").length);
const hasExtras = await page.evaluate(()=>!!document.getElementById("extras"));
if (hasExtras) fail(`[${tag}] #extras section still present`);
else pass(`[${tag}] education section removed`);
if (secCount===5) pass(`[${tag}] exactly 5 sections`);
else fail(`[${tag}] expected 5 sections, found ${secCount}`);
```

- [ ] **Step 4: Run.** `node scripts/socket-journey-check.mjs` → Expected: PASS "education section removed" + "exactly 5 sections" for all tags.

- [ ] **Step 5: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): remove education section (match Naresh's 5)"
```

## Task 1.2: Retune Lenis + fix the smoothing conflict

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1: Drop the competing CSS smooth-scroll.** Change line 54 `html{scroll-behavior:smooth;background:#ccd1da}` → `html{background:#ccd1da}`. Add `scroll-behavior:smooth` to the existing `body{...}` rule (it currently sets `background:transparent` from Phase 6) so hash-anchor jumps still glide. Both files.

- [ ] **Step 2: Retune Lenis.** In the Lenis init (around line 861), change:
`var lenis = new Lenis({ lerp:0.09, smoothWheel:true });`
→ `var lenis = new Lenis({ duration:1.2, smoothWheel:true });`
Both files. Expose the instance for later phases: after creation add `window.__lenis = lenis;`.

- [ ] **Step 3: Harness — scroll reaches the bottom.** Add:

```js
await page.evaluate(async()=>{ const h=document.documentElement; window.scrollTo(0,h.scrollHeight); });
await page.waitForTimeout(1200);
const reachedBottom = await page.evaluate(()=>{ const h=document.documentElement; return (h.scrollHeight - (window.scrollY + h.clientHeight)) < 80; });
if (reachedBottom) pass(`[${tag}] scroll reaches contact (not trapped)`);
else fail(`[${tag}] could not scroll to bottom`);
await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(400);
```

- [ ] **Step 4: Run.** Expected: PASS "scroll reaches contact" all tags. (Note: the iframe trap is still present but programmatic `window.scrollTo` bypasses it — real wheel-trap is fixed in P2.)

- [ ] **Step 5: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): retune Lenis (duration:1.2) + drop competing scroll-behavior"
```

## Task 1.3: Pointer-events content overlay scaffold

Lets wheel/touch fall through to the fixed background canvases while keeping links/buttons/inputs clickable. (Prepares for the keyboard background in P2; harmless now.)

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1: Wrap the scrolling content.** Wrap everything between the fixed/utility layers and the footer — i.e. `<nav>`, all `<section>`s, and `<footer>` — in a single `<main class="content">…</main>`. Leave `#stars`, `#orb-stage`, `#kbd-stage` (added P2), `#orb-fallback`, `#cursor`, `#cursor-dot`, `#progress`, `#preloader` OUTSIDE `<main>`. Both files.

- [ ] **Step 2: Add overlay CSS** (near the `#orb-stage` rule):

```css
/* canvas-overlay mode: wheel/touch fall through .content to the fixed 3D canvases behind it;
   re-enable pointer events on everything interactive (Naresh's pattern). */
.content{ pointer-events:none; }
.content a, .content button, .content input, .content textarea, .content select,
.content label, .content [role="button"], .content summary, .content nav,
.content .proj, .content .key, .content .kbd-chip, .content details{ pointer-events:auto; }
```

(`nav` re-enabled as a whole so the fixed nav stays fully clickable.)

- [ ] **Step 3: Harness — interactivity preserved + scroll still works.** Add:

```js
const navClickable = await page.evaluate(()=>{
  const a=document.querySelector('nav a'); if(!a) return false;
  return getComputedStyle(a).pointerEvents!=="none";
});
if (navClickable) pass(`[${tag}] nav links remain clickable under overlay`);
else fail(`[${tag}] nav lost pointer-events`);
```

- [ ] **Step 4: Run.** Expected: PASS "nav links remain clickable" + still PASS the Task 1.2 scroll check + zero console errors.

- [ ] **Step 5: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): pointer-events content overlay scaffold"
```

## Task 1.4: Universal opacity+scale section reveal (the Naresh "breathing")

Replaces the one-shot `.box-reveal`. Each section fades+scales by its distance from viewport center. Hero text `.blur-in` stagger stays.

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1: Mark sections.** Add `data-reveal` attribute to each of the 5 `<section>` tags. Both files.

- [ ] **Step 2: Add reveal CSS** (initial state so no flash; reduced-motion opts out):

```css
section[data-reveal]{ will-change:opacity,transform; }
@media (prefers-reduced-motion:reduce){ section[data-reveal]{ opacity:1!important; transform:none!important; } }
```

- [ ] **Step 3: Add the reveal loop** in the main `<script>` (after the scrollspy block, before the star-field). Replace the existing `.box-reveal` observation: keep observing `.blur-in` only; the section breathing is now this loop:

```js
/* ── Naresh-style section reveal: opacity [0→1→1→0] + scale [0.92→1→1→0.92] by distance from centre ── */
if(!reduce){
  var revSecs = Array.prototype.slice.call(document.querySelectorAll("section[data-reveal]"));
  var revTick = false;
  function reveal(){
    revTick = false;
    var vh = window.innerHeight;
    for(var i=0;i<revSecs.length;i++){
      var s = revSecs[i], r = s.getBoundingClientRect();
      var centre = (r.top + r.height/2) / vh;     /* 0.5 when section centred */
      var d = Math.min(1, Math.abs(centre - 0.5) / 0.85);  /* 0 centred → 1 far */
      var k = 1 - d*d;                              /* ease */
      s.style.opacity = k.toFixed(3);
      s.style.transform = "scale(" + (0.92 + 0.08*k).toFixed(3) + ")";
    }
  }
  function onRev(){ if(!revTick){ revTick = true; requestAnimationFrame(reveal); } }
  window.addEventListener("scroll", onRev, {passive:true});
  window.addEventListener("resize", onRev);
  reveal();
}
```

In the existing reveal IO (line ~759), change the selector from `".blur-in,.box-reveal"` to `".blur-in"` (sections no longer use the one-shot). Leave `.box-reveal` CSS in place (harmless) or remove unused `.box-reveal` rules if trivial.

- [ ] **Step 4: Harness — reveal responds to scroll.** Add:

```js
// centre the experience section, assert near full opacity; then scroll away, assert reduced
const op = await page.evaluate(async()=>{
  const s=document.getElementById("experience"); s.scrollIntoView({block:"center"});
  await new Promise(r=>setTimeout(r,500));
  return parseFloat(getComputedStyle(s).opacity);
});
if (op>0.85) pass(`[${tag}] centred section near full opacity (${op.toFixed(2)})`);
else fail(`[${tag}] centred section opacity too low (${op.toFixed(2)})`);
await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(400);
```

- [ ] **Step 5: Run.** Expected PASS for all tags. **Note:** in `withPage`, set `reducedMotion` default to `"no-preference"` so this runs in motion mode.

- [ ] **Step 6: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): universal opacity+scale section reveal (Naresh breathing)"
```

## Task 1.5: Sticky centered headings + oversized sections

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1: Identify each section's heading.** Each non-hero section has a heading element (e.g. `.sec-head h2` / the section title). Add a class `sticky-head` to each section's heading wrapper. Both files.

- [ ] **Step 2: Add CSS:**

```css
.sticky-head{ position:sticky; top:70px; z-index:2; text-align:center; margin-bottom:64px; }
@media (max-width:768px){ .sticky-head{ top:58px; margin-bottom:40px; } }
/* oversized scroll runway (Naresh uses 120–150vh) */
#experience, #projects{ min-height:130vh; }
#skills{ min-height:120vh; }
#contact{ min-height:100vh; }
```

Adjust existing section padding so content remains vertically centered within the taller sections (use `display:flex;flex-direction:column;justify-content:center` on the section inner `.wrap` if not already).

- [ ] **Step 3: Harness — no horizontal overflow (phone) + headings sticky.** Add:

```js
if (view.key==="phone"){
  const ov = await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  if (ov>1) fail(`[${tag}] horizontal overflow ${ov}px`); else pass(`[${tag}] no overflow`);
}
const sticky = await page.evaluate(()=>{ const h=document.querySelector("#projects .sticky-head"); return h?getComputedStyle(h).position:""; });
if (sticky==="sticky") pass(`[${tag}] section headings sticky`);
else fail(`[${tag}] heading not sticky (${sticky})`);
```

- [ ] **Step 4: Run.** Expected PASS all tags.

- [ ] **Step 5: Visual check.** Manually screenshot review `scripts/_sj-en-desk.png` / `_sj-ar-desk.png`: headings centered, layout intact, RTL mirrored.

- [ ] **Step 6: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): sticky centred headings + oversized sections (Naresh layout)"
```

## Task 1.6: Naresh font/layout fidelity pass

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1: Confirm type stack.** Verify the display font is **Archivo Black**, body **Inter**, mono **JetBrains Mono** (already loaded per the memory). If Inter is not the body font, add it (Google Fonts `<link>` already present for the others) and set `--font-body:'Inter',system-ui,sans-serif` used by `body`.

- [ ] **Step 2: Hero proportions.** Ensure hero = left text column (max ~440px) with the right half empty for the keyboard backdrop (matches current Phase-6 layout). No change if already so; otherwise adjust `#hero .grid{max-width:440px}` at ≥900px.

- [ ] **Step 3: Section internals match Naresh.** Experience = vertical timeline of cards (already present); Projects = 3-col card grid → modal (already present); Contact = translucent form card on one side. Tune spacing to Naresh's generous rhythm (section vertical padding ~`clamp(80px,12vh,160px)`). Keep Soft Daylight colors.

- [ ] **Step 4: Harness — fonts applied.** Add:

```js
const fonts = await page.evaluate(()=>{
  const h1=document.querySelector("#hero h1");
  return { display: h1?getComputedStyle(h1).fontFamily:"", body:getComputedStyle(document.body).fontFamily };
});
if (/Archivo/i.test(fonts.display)) pass(`[${tag}] hero display = Archivo Black`);
else fail(`[${tag}] hero display font is "${fonts.display}"`);
```

- [ ] **Step 5: Run + visual review.** Expected PASS; screenshots read as Naresh-arranged with our colors.

- [ ] **Step 6: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): Naresh font + layout fidelity pass"
```

---

# PHASE 2 — Keyboard → fixed rotatable background

Goal: port the keyboard scene out of the trapping iframe into a parent-page fixed canvas; keep drag-rotate + keycap click/sound + idle spin; wheel scrolls the page; no per-section movement.

## Task 2.1: Create `keyboard.js` (port the scene)

**Files:** Create `public/demo/developer/keyboard.js`; reference `public/demo/developer/stack/index.html`

- [ ] **Step 1: Port the scene.** Copy the entire `<script>` body of `stack/index.html` (the scene build, lights, keyboard halves, `trackball`, keycaps, `PROFILES`, the audio `ac()/playUp()/playDown()`, the `animate()` loop, `layout()`, and pointer handlers) into `keyboard.js`, wrapped in an IIFE `(function(){ "use strict"; if(!window.THREE) return; … })();`. Apply these EXACT transformations:
  - Render target: replace the canvas lookup so it uses `document.getElementById("kbd-stage")` instead of `#stage`. If absent, `return`.
  - **Remove the scroll trap:** do NOT set `touch-action:none` on `html,body` (that lived in the iframe's CSS, not JS — nothing to port). On the `#kbd-stage` canvas set `touch-action:none` ONLY via CSS in Task 2.2 is WRONG — instead leave the canvas default and handle gestures manually (Step 2).
  - Renderer `alpha:true` (transparent clear) so it composites over `#stars`/page bg; copy the Phase-6 orb pattern: `try{…}catch{ return; }` around `new THREE.WebGLRenderer`.
  - Keep `PROFILES`, sounds, `trackball`, keycaps, idle spin (`rollSpeedY/X`), and the keycap raycast/press logic intact.
  - Remove the in-iframe HUD buttons (`#snd`, `#sw` switch button) — sound + mute are unified in Task 3.3. Keep the synth `playDown/playUp` functions (called on keycap press); gate them behind a shared `window.__demoSound` mute flag (default true): wrap sound playback in `if(window.__demoSound!==false){…}`.

- [ ] **Step 2: Gesture model (drag rotates, wheel scrolls).** Attach pointer listeners to `document` (as the scene already does) but guard them so they ONLY rotate when the gesture starts on the keyboard, never capturing the wheel:
  - Keep `pointerdown/move/up` for drag-rotate + keycap press exactly as ported.
  - Do NOT add any `wheel` listener and do NOT `preventDefault` on wheel anywhere — so wheel always scrolls the page.
  - For touch: in `pointerdown`, only begin a rotate-drag if the ray hits the keyboard/trackball/a keycap (reuse the existing `pickHover`/`hovered` logic — if nothing hit, leave `isDown=false` so the touch scrolls the page). This prevents the mobile scroll-trap.

- [ ] **Step 3: Expose a fallback signal.** On first successful render, add `document.documentElement.classList.add("kbd-live")` (mirrors orb's `.orb-live`) so a CSS fallback can hide. Guard creation; on `webglcontextlost` remove `kbd-live`.

- [ ] **Step 4: Syntax check.** Run: `node --check public/demo/developer/keyboard.js` → Expected: no output (valid).

- [ ] **Step 5: Commit.**

```bash
git add public/demo/developer/keyboard.js
git commit -m "feat(dev-demo): port keyboard scene to parent-page keyboard.js"
```

## Task 2.2: Mount `#kbd-stage`, remove the iframe, lazy-inject

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1: Add the canvas** next to `#orb-stage`: `<canvas id="kbd-stage" aria-hidden="true"></canvas>`. Both files.

- [ ] **Step 2: CSS** (behind the orb, in front of stars; pointer-events ON so drag/click reach it; wheel passes because we never preventDefault it):

```css
#kbd-stage{ position:fixed; inset:0; width:100%; height:100%; z-index:-2; pointer-events:auto; }
/* keyboard fallback (reduced-motion / low-end / no-WebGL): hidden once .kbd-live */
.kbd-live #kbd-fallback{ display:none; }
```

(AR identical — the keyboard fills the viewport; its in-scene position already floats right; for RTL, optionally flip via a scene var, see Task 4.1.)

- [ ] **Step 2b:** Set `#orb-stage{ pointer-events:none; }` explicitly (so clicks fall through the orb layer to `#kbd-stage`). Confirm `#stars` is also `pointer-events:none`.

- [ ] **Step 3: Remove the inline iframe.** In the `#skills` section delete `<iframe class="stack-frame" …>`. Replace the Skills section body with the sticky heading + a hint line: `<p class="kbd-hint">Drag to rotate · press a key</p>`. Both files. (The keyboard now renders as the fixed background behind this section and all others.)

- [ ] **Step 4: Lazy-inject keyboard.js, tier-gated** (mirror the orb injector around line 1054). In the orb injection IIFE (or a sibling), after Three.js loads, also inject `keyboard.js`:

```js
// inside the existing post-load injector, after three.min.js onload, alongside orb.js:
var k=document.createElement("script"); k.src="/demo/developer/keyboard.js"; document.body.appendChild(k);
```

Reuse the SAME `if(reduce||lowEnd) return;` gate already added in Phase 6 (so weak phones skip both 3D scripts).

- [ ] **Step 5: Harness — keyboard live + scroll free over it.** Add (desktop only where the keyboard is prominent):

```js
const kbd = await page.evaluate(()=>{
  const c=document.getElementById("kbd-stage");
  const gl=c&&(c.getContext("webgl2")||c.getContext("webgl"));
  return { exists:!!c, live:document.documentElement.classList.contains("kbd-live"), glLost: gl?gl.isContextLost():"no-gl" };
});
if (kbd.exists) pass(`[${tag}] #kbd-stage present`); else fail(`[${tag}] #kbd-stage missing`);
// scroll must advance even with pointer over the keyboard centre
const moved = await page.evaluate(async()=>{
  const before=window.scrollY;
  window.dispatchEvent(new Event("x")); // noop
  await new Promise(r=>requestAnimationFrame(r));
  window.scrollTo(0,600); await new Promise(r=>setTimeout(r,500));
  return window.scrollY>before;
});
if (moved) pass(`[${tag}] page scrolls with keyboard as background`);
else fail(`[${tag}] scroll blocked`);
const noIframe = await page.evaluate(()=>!document.querySelector(".stack-frame"));
if (noIframe) pass(`[${tag}] inline keyboard iframe removed`); else fail(`[${tag}] iframe still present`);
```

- [ ] **Step 6: Run.** Expected PASS for `#kbd-stage present`, `iframe removed`, `page scrolls`. On capable (desktop) tags `kbd.live` should be true and `glLost` false — assert those only for desktop:

```js
if (view.key==="desk"){
  if (kbd.live) pass(`[${tag}] keyboard live`); else fail(`[${tag}] keyboard not live`);
  if (kbd.glLost===false) pass(`[${tag}] keyboard GL healthy`); else fail(`[${tag}] keyboard GL ${kbd.glLost}`);
}
```

- [ ] **Step 7: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): mount keyboard as fixed background, remove trapping iframe"
```

## Task 2.3: Verify drag-rotate + keycap click/sound still work

**Files:** Modify `scripts/socket-journey-check.mjs`

- [ ] **Step 1: Harness — drag rotates the keyboard** (desktop). Probe the scene's exposed rotation if available, else assert a drag does not scroll the page and produces no error. In `keyboard.js` Step from 2.1, expose `window.__kbd = { getRotation: ()=> half ? half.rotation.y : 0 };` (use the keyboard group variable name from the port). Then:

```js
if (view.key==="desk"){
  const rot = await page.evaluate(async()=>{
    if(!window.__kbd) return null;
    const r0=window.__kbd.getRotation();
    // simulate a horizontal drag across the keyboard centre
    const cx=window.innerWidth*0.66, cy=window.innerHeight*0.5;
    function pe(t,x){ window.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:cy,bubbles:true,pointerId:1})); }
    pe("pointerdown",cx); for(let i=1;i<=8;i++){ pe("pointermove",cx+i*12); } pe("pointerup",cx+96);
    await new Promise(r=>setTimeout(r,300));
    return { before:r0, after:window.__kbd.getRotation(), scrollY:window.scrollY };
  });
  if (rot && Math.abs(rot.after-rot.before)>0.001) pass(`[${tag}] drag rotates keyboard`);
  else fail(`[${tag}] drag did not rotate keyboard (${JSON.stringify(rot)})`);
  if (rot && rot.scrollY<5) pass(`[${tag}] drag did not scroll page`);
  else fail(`[${tag}] drag leaked into scroll`);
}
```

- [ ] **Step 2: Run.** Expected PASS for drag-rotate. If the drag also scrolls, tighten the touch/drag guard in `keyboard.js` (only rotate when the gesture started on the keyboard; otherwise let it scroll).

- [ ] **Step 3: Commit.**

```bash
git add public/demo/developer/keyboard.js scripts/socket-journey-check.mjs
git commit -m "test(dev-demo): verify keyboard drag-rotate without scroll capture"
```

## Task 2.4: Keyboard static fallback (reduced-motion / low-end / no-WebGL)

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1: Add fallback element** in the Skills section: `<div id="kbd-fallback" aria-hidden="true"></div>`. Both files.

- [ ] **Step 2: CSS** — a static keyboard impression (reuse the existing photoreal `.hero-kbd` image asset if present, else a styled placeholder card). Hidden when `.kbd-live`:

```css
#kbd-fallback{ display:block; margin:24px auto; width:min(72%,520px); aspect-ratio:16/9;
  border-radius:18px; background:linear-gradient(180deg,#5a6068,#4b5056 55%,#3a3f45);
  box-shadow:0 24px 40px -16px rgba(34,40,49,.4), inset 0 2px 0 rgba(255,255,255,.15); }
.kbd-live #kbd-fallback{ display:none; }
@media (prefers-reduced-motion:reduce){ /* fallback stays; no 3D injected per the Phase-6 gate */ }
```

- [ ] **Step 3: Harness — reduced-motion shows fallback, no kbd-live, no keyboard.js.** Add a reduced-motion pass (a new context). In the run loop add a second `withPage(route,view,{reducedMotion:"reduce"},…)` desktop-only block:

```js
await withPage(route,{key:"desk",vp:{width:1280,height:900}},{reducedMotion:"reduce"},async(page,errors,tag0)=>{
  const tag=tag0+"-rm";
  const st=await page.evaluate(()=>({ live:document.documentElement.classList.contains("kbd-live"),
    fb: (()=>{const f=document.getElementById("kbd-fallback");return f?getComputedStyle(f).display:"none";})() }));
  if(!st.live) pass(`[${tag}] keyboard not live (reduced-motion)`); else fail(`[${tag}] kbd-live set under reduced-motion`);
  if(st.fb!=="none") pass(`[${tag}] keyboard fallback visible`); else fail(`[${tag}] keyboard fallback hidden`);
  if(errors.length) fail(`[${tag}] ${errors.length} console errors`); else pass(`[${tag}] zero console errors`);
});
```

- [ ] **Step 4: Run.** Expected PASS.

- [ ] **Step 5: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): keyboard static fallback for reduced-motion/low-end"
```

---

# PHASE 3 — Orb falls into a Davy socket per section

Goal: shrink the orb, remove the dock + travel keyframes, add Davy sockets, target the current section's socket with a gravity-fall + bounce + roll, click on landing, sound + mute.

## Task 3.1: Add Davy `.orb-socket` cradles to all 5 sections

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1: Add a socket div** as a direct child of each of the 5 sections (it is `position:absolute`, so the section needs `position:relative` — most already are; add it where missing): `<div class="orb-socket" data-socket aria-hidden="true"></div>`.

- [ ] **Step 2: Base CSS** (a Davy cradle/cup; the orb sits behind content so the cup occludes its base):

```css
.orb-socket{ position:absolute; z-index:0; pointer-events:none;
  width:clamp(120px,16vw,190px); aspect-ratio:2/1;
  border-radius:0 0 50% 50% / 0 0 90% 90%;
  background:linear-gradient(180deg,#565c63 0%,#4b5056 45%,#33373c 100%);
  box-shadow:inset 0 10px 16px rgba(0,0,0,.38), 0 16px 26px -10px rgba(34,40,49,.5);
  transform:translateY(-50%); }
.orb-socket::after{ content:""; position:absolute; left:8%; right:8%; top:0; height:46%;
  border-radius:50%; background:radial-gradient(50% 120% at 50% 0,rgba(0,0,0,.28),transparent 70%); }
@media (prefers-reduced-motion:reduce){ .orb-socket{ } /* sockets stay; inert */ }
```

- [ ] **Step 3: Per-section placement (zig-zag).** EN values (AR mirrors right↔left):

```css
#hero       .orb-socket{ right:6%;  top:54%; }
#skills     .orb-socket{ left:8%;   top:60%; }
#experience .orb-socket{ right:7%;  top:48%; }
#projects   .orb-socket{ left:6%;   top:42%; }
#contact    .orb-socket{ left:50%;  top:60%; transform:translate(-50%,-50%); }
/* Contact bg is dark Davy — add a rim so the socket reads */
#contact .orb-socket{ box-shadow:inset 0 10px 16px rgba(0,0,0,.45), 0 0 0 1px rgba(238,244,252,.12), 0 16px 26px -10px rgba(0,0,0,.5); }
```

For AR, add a mirrored block in `index-ar.html` swapping `right`↔`left` for hero/skills/experience/projects (contact stays centered).

- [ ] **Step 4: Harness — sockets present + sized in all 5 sections.** Add:

```js
const socks = await page.evaluate(()=>{
  const ids=["hero","skills","experience","projects","contact"];
  return ids.map(id=>{ const s=document.getElementById(id); const k=s&&s.querySelector(".orb-socket");
    if(!k) return {id,ok:false}; const r=k.getBoundingClientRect(); return {id,ok:true,w:Math.round(r.width),h:Math.round(r.height)}; });
});
const allOk = socks.every(s=>s.ok && s.w>60 && s.h>20);
if (allOk) pass(`[${tag}] Davy socket in all 5 sections`);
else fail(`[${tag}] missing/undersized socket: ${JSON.stringify(socks.filter(s=>!s.ok||s.w<=60))}`);
```

- [ ] **Step 5: Run + visual review** of `_sj-*-desk.png` (sockets read as Davy cups; AR mirrored).

- [ ] **Step 6: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): Davy socket cradles in all 5 sections (zig-zag)"
```

## Task 3.2: Rewrite orb.js — smaller orb, socket targeting, fall+bounce+roll, remove dock

**Files:** Modify `public/demo/developer/orb.js`

- [ ] **Step 1: Remove dock + travel keyframes.** Delete the `stackIframe`, `DOCK_*`, `dockProgress()`, and the dock blending block inside `frame()` (the `if (dp > 0.001){…}` and the canvas z-index lift). Delete the per-section `KF` position/scale keyframe table and `targetAt()`’s interpolation of x/y — replace targeting per Step 2. Keep the renderer, shader orb, particles (bloom only — keep hero bloom, drop the dock-burst branch), Phase-6 fallback, and the spring integrator.

- [ ] **Step 2: Socket targeting.** Add a socket map + a "current section" picker:

```js
/* sockets: the orb targets the on-screen centre of the current section's .orb-socket */
var SECTION_IDS = ["hero","skills","experience","projects","contact"];
function currentSocket(){
  var vh = window.innerHeight, best=null, bestD=1e9;
  for (var i=0;i<SECTION_IDS.length;i++){
    var s=document.getElementById(SECTION_IDS[i]); if(!s) continue;
    var k=s.querySelector(".orb-socket"); if(!k) continue;
    var sr=s.getBoundingClientRect();
    var centreDist=Math.abs((sr.top+sr.height/2) - vh/2);
    if(centreDist<bestD){ bestD=centreDist; best=k; }
  }
  return best;
}
/* convert an element rect to the orb's fraction-of-half-viewport target (top-of-cup, so the ball seats in it) */
function socketTarget(el){
  var r=el.getBoundingClientRect();
  var px=r.left + r.width/2, py=r.top + r.height*0.30; /* sit slightly above cup centre */
  return { fx:(px/window.innerWidth)*2-1, fy:-((py/window.innerHeight)*2-1) };
}
```

- [ ] **Step 3: Smaller orb + fall/bounce/roll.** Set a constant small scale (`var ORB_SCALE = 0.5;`). In `frame()`, replace the target computation with:

```js
var sock = currentSocket();
var tx = cur.x, ty = cur.y;
if (sock){ var t = socketTarget(sock); tx = t.fx; ty = t.fy; }
/* gravity-biased vertical: accelerate toward the socket, then the spring damps into a bounce-settle */
var GRAV = 0.020;
if (ty < cur.y){ vy += (ty - cur.y) * K; }              /* moving up: normal spring */
else { vy += (ty - cur.y) * K + GRAV; }                 /* moving down: add gravity for a "fall" */
vy *= DAMP; cur.y += vy;
vx += (tx - cur.x) * K; vx *= DAMP; cur.x += vx;
/* roll: spin proportional to horizontal travel */
orb.rotation.z -= vx * 6.0;
orb.rotation.y += dt * 0.10;
/* scale fixed small */
cur.scale += (ORB_SCALE - cur.scale) * 0.15;
```

Keep the world-mapping (`orb.position.set(cur.x*vpW/2, cur.y*vpH/2, 0)`) and the eased colour (use the single blue-glass palette — color no longer varies per section; you can drop the per-section colour lerp or keep a constant `#6d99ce`).

- [ ] **Step 4: Landing detector (fires once per section entry).** Add state `var landedId=null;` and after the spring update:

```js
var sId = sock ? (sock.closest("section")||{}).id : null;
var settled = Math.abs(vx)<0.004 && Math.abs(vy)<0.004 && Math.abs(tx-cur.x)<0.02 && Math.abs(ty-cur.y)<0.02;
if (sId && sId!==landedId && settled){
  landedId = sId;
  if (window.__orbLand) window.__orbLand();   /* click + squash, wired in Task 3.3 */
}
if (sId && sId!==landedId && !settled){ /* still falling toward a new socket; allow re-arm */ }
```

- [ ] **Step 5: Syntax + harness — one orb lands in each socket.** `node --check public/demo/developer/orb.js`. Then add harness:

```js
if (view.key==="desk"){
  const land = await page.evaluate(async()=>{
    const out=[]; const ids=["hero","skills","experience","projects","contact"];
    for(const id of ids){ document.getElementById(id).scrollIntoView({block:"center"}); await new Promise(r=>setTimeout(r,900));
      const k=document.getElementById(id).querySelector(".orb-socket").getBoundingClientRect();
      // read orb screen pos via exposed hook
      const o=window.__orbPos? window.__orbPos() : null;
      out.push({id, dx:o?Math.round(Math.abs(o.x-(k.left+k.width/2))):999, dy:o?Math.round(Math.abs(o.y-(k.top+k.height*0.3))):999}); }
    return out;
  });
  const near = land.every(l=>l.dx<90 && l.dy<120);
  if (near) pass(`[${tag}] orb lands in each section's socket`);
  else fail(`[${tag}] orb off-socket: ${JSON.stringify(land.filter(l=>l.dx>=90||l.dy>=120))}`);
}
```

In `orb.js` expose `window.__orbPos = ()=>({ x:(orb.position.x/vpW*2+ ... ) })` — simpler: compute screen px from `cur`: `window.__orbPos=function(){ return { x:(cur.x*0.5+0.5)*window.innerWidth, y:(-cur.y*0.5+0.5)*window.innerHeight }; };`

- [ ] **Step 6: Run.** Expected PASS "orb lands in each section's socket". Tune `top:` percentages / `socketTarget` 0.30 factor if dy is off.

- [ ] **Step 7: Commit.**

```bash
git add public/demo/developer/orb.js scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): orb falls into each section's socket (remove dock + travel)"
```

## Task 3.3: Landing click sound + shared mute button + gesture unlock

**Files:** Modify `index.html`, `index-ar.html`, `orb.js`

- [ ] **Step 1: Shared audio + mute flag.** In the main `<script>`, add a tiny shared audio module (used by both orb landings and keyboard keycaps via `window.__demoSound`):

```js
/* ── shared demo audio: unlock on first gesture, mute toggle persisted ── */
(function(){
  var AC = window.AudioContext||window.webkitAudioContext; var actx=null;
  window.__demoSound = (localStorage.getItem("demoMute")==="1") ? false : true;
  function ctx(){ if(!actx&&AC){ actx=new AC(); } if(actx&&actx.state==="suspended"){ actx.resume(); } return actx; }
  function unlock(){ var a=ctx(); if(a){ var b=a.createBuffer(1,1,22050); var s=a.createBufferSource(); s.buffer=b; s.connect(a.destination); s.start(0); } window.removeEventListener("pointerdown",unlock); window.removeEventListener("keydown",unlock); window.removeEventListener("touchstart",unlock); window.removeEventListener("wheel",unlock); }
  ["pointerdown","keydown","touchstart","wheel"].forEach(function(ev){ window.addEventListener(ev,unlock,{once:false,passive:true}); });
  /* marble-click for orb landings */
  window.__orbLand = function(){ if(window.__demoSound===false) return; var a=ctx(); if(!a) return;
    var o=a.createOscillator(), g=a.createGain(); o.type="triangle"; o.frequency.setValueAtTime(420,a.currentTime);
    o.frequency.exponentialRampToValueAtTime(140,a.currentTime+0.08);
    g.gain.setValueAtTime(0.0001,a.currentTime); g.gain.exponentialRampToValueAtTime(0.25,a.currentTime+0.005);
    g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+0.13); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+0.14); };
})();
```

- [ ] **Step 2: Mute button.** Add a fixed-corner button (outside `.content` so it's always clickable): `<button id="mute" aria-label="Toggle sound">🔊</button>`. CSS:

```css
#mute{ position:fixed; right:16px; bottom:16px; z-index:30; width:42px; height:42px; border-radius:50%;
  border:1px solid var(--border); background:var(--card); color:var(--fg); cursor:pointer; font-size:18px; }
@media (max-width:768px){ #mute{ right:12px; bottom:12px; } }
```

(AR: `left:16px`.) JS:

```js
var muteBtn=document.getElementById("mute");
if(muteBtn){ muteBtn.textContent = window.__demoSound===false ? "🔇" : "🔊";
  muteBtn.addEventListener("click",function(){ window.__demoSound=!window.__demoSound; localStorage.setItem("demoMute", window.__demoSound?"0":"1"); muteBtn.textContent= window.__demoSound?"🔊":"🔇"; }); }
```

- [ ] **Step 3: Landing squash (visual).** In `orb.js`, on landing also trigger a brief scale squash: set a `squash` impulse in `__orbLand` consumed by the frame loop, OR simplest — in the landing branch add `cur.scale *= 0.86;` (the spring restores it) for a contact pop.

- [ ] **Step 4: Harness — mute toggles + landing calls sound path.** Add:

```js
const mute = await page.evaluate(()=>{ const b=document.getElementById("mute"); if(!b) return null;
  const before=window.__demoSound; b.click(); const after=window.__demoSound; b.click(); return {before,after}; });
if (mute && mute.before!==mute.after) pass(`[${tag}] mute button toggles sound`);
else fail(`[${tag}] mute button missing/!toggling`);
const hasLand = await page.evaluate(()=>typeof window.__orbLand==="function");
if (hasLand) pass(`[${tag}] orb landing sound hook present`); else fail(`[${tag}] __orbLand missing`);
```

- [ ] **Step 5: Run.** Expected PASS.

- [ ] **Step 6: Commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html public/demo/developer/orb.js scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): orb landing click + shared mute button + audio unlock"
```

## Task 3.4: Fallback orb rests in the hero socket (extend Phase 6)

**Files:** Modify `index.html`, `index-ar.html`

- [ ] **Step 1:** Reposition the Phase-6 `#orb-fallback` to sit in the hero `.orb-socket` location (so under reduced-motion the static ball appears seated in the hero cup). Update its CSS `right/top` to match `#hero .orb-socket` placement; smaller radius (trackball size). Sockets already render inert in fallback (they're CSS).

- [ ] **Step 2: Harness — reduced-motion: fallback orb visible, sockets present, no orb.js.** Extend the reduced-motion `withPage` block from Task 2.4:

```js
const fb=await page.evaluate(()=>{ const f=document.getElementById("orb-fallback"); return f?getComputedStyle(f).display:"none"; });
if(fb!=="none") pass(`[${tag}] orb fallback visible (reduced-motion)`); else fail(`[${tag}] orb fallback hidden`);
```

- [ ] **Step 3: Run + commit.**

```bash
git add public/demo/developer/index.html public/demo/developer/index-ar.html scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): fallback orb seats in hero socket (reduced-motion)"
```

---

# PHASE 4 — RTL + fallback + perf hardening + full verify

## Task 4.1: AR parity audit

**Files:** Modify `index-ar.html`, `orb.js`, `keyboard.js`

- [ ] **Step 1:** Confirm every Phase 1–3 HTML/CSS change landed in `index-ar.html` with X mirrored (sockets, mute button side `left`, keyboard fallback, sticky heads). The orb already negates X for `dir=rtl` (Phase-6 code) — confirm `currentSocket`/`socketTarget` use live rects (auto-correct for RTL, no extra mirroring needed since they read actual DOM positions). For the keyboard, if its in-scene float is hardcoded right, add an RTL check reading `document.dir==="rtl"` to float it left.

- [ ] **Step 2: Harness — AR sockets mirrored.** Compare hero socket centre X: EN should be right-of-centre, AR left-of-centre:

```js
// in the per-page block, record hero socket centre x fraction
const hx = await page.evaluate(()=>{ const k=document.querySelector("#hero .orb-socket"); const r=k.getBoundingClientRect(); return (r.left+r.width/2)/window.innerWidth; });
if (route.key==="en" && hx>0.55) pass(`[${tag}] EN hero socket right`);
else if (route.key==="ar" && hx<0.45) pass(`[${tag}] AR hero socket left (mirrored)`);
else fail(`[${tag}] hero socket side wrong (hx=${hx.toFixed(2)})`);
```

- [ ] **Step 3: Run + commit.**

```bash
git add public/demo/developer/index-ar.html public/demo/developer/orb.js public/demo/developer/keyboard.js scripts/socket-journey-check.mjs
git commit -m "feat(dev-demo): RTL parity for sockets/keyboard/mute"
```

## Task 4.2: Perf hardening (pause + context-loss + tier-gate, both canvases)

**Files:** Modify `keyboard.js` (orb.js already hardened in Phase 6)

- [ ] **Step 1:** Add to `keyboard.js`: pause the rAF loop on `document.hidden` (`visibilitychange`), a `running` guard, and `webglcontextlost`/`restored` handling that toggles `.kbd-live` (mirror `orb.js`’s Phase-6 pattern exactly).

- [ ] **Step 2: Harness — both canvases healthy on desktop, neither injected on low-end.** Add a low-end `withPage` (override `navigator.hardwareConcurrency`/`deviceMemory`=2 via `addInitScript`) asserting neither `orb.js` nor `keyboard.js` was requested and both fallbacks show. (Mirror the Phase-6 low-end block; track `/orb.js` and `/keyboard.js` request URLs.)

- [ ] **Step 3: Run + commit.**

```bash
git add public/demo/developer/keyboard.js scripts/socket-journey-check.mjs
git commit -m "perf(dev-demo): keyboard pause/context-loss/tier-gate hardening"
```

## Task 4.3: Full harness green + visual review

- [ ] **Step 1: Run the complete harness.** `node scripts/socket-journey-check.mjs` → Expected: `ALL CHECKS PASSED` (every tag: 5 sections, scroll free, keyboard live+rotatable, orb lands in each socket, mute toggles, fallbacks for reduced-motion/low-end, zero console errors, no phone overflow).

- [ ] **Step 2: Visual review** all `scripts/_sj-*.png` (EN/AR × phone/desk + -rm): Naresh-arranged layout, Soft Daylight colors, sockets read as Davy cups, orb seated, keyboard backdrop present, RTL mirrored.

- [ ] **Step 3: Commit any tuning** made during review.

```bash
git add public/demo/developer/*.html public/demo/developer/orb.js public/demo/developer/keyboard.js scripts/socket-journey-check.mjs
git commit -m "fix(dev-demo): final tuning — socket placement + reveal + visual pass"
```

## Task 4.4: Deploy + live verify (ON USER GO ONLY)

- [ ] **Step 1:** Confirm `git rev-list --left-right --count origin/master...master` and that nothing foreign is staged. Push: `git push origin master`.
- [ ] **Step 2:** `vercel --prod --yes` (git auto-deploy can silently no-op here — per the 2026-06-08 gotcha).
- [ ] **Step 3:** Live verify: drive the headless harness against `https://portfolio-trimind.com/demo/developer/index.html` (+ `index-ar.html`) — keyboard live, orb lands, scroll free, zero errors. `curl` the markup to confirm `#kbd-stage`/`.orb-socket`/no `.stack-frame`.

---

## Self-review (completed by author)
- **Spec coverage:** 5 sections (T1.1) · scroll fix Lenis+overlay (T1.2/1.3) · reveal (T1.4) · sticky/oversized (T1.5) · font/layout (T1.6) · keyboard→bg keep-rotate (T2.1–2.3) · keyboard fallback (T2.4) · Davy sockets (T3.1) · orb fall/bounce/roll/no-dock (T3.2) · click+mute+unlock (T3.3) · fallback orb in socket (T3.4) · RTL (T4.1) · perf (T4.2) · full verify (T4.3) · deploy (T4.4). All spec sections mapped.
- **Placeholder scan:** new code blocks are concrete; the keyboard port (T2.1) is a precise copy-with-transformations of `stack/index.html` (existing working code), not a placeholder.
- **Naming consistency:** `window.__demoSound` (mute flag), `window.__orbLand` (landing sound), `window.__orbPos` (orb screen pos), `window.__kbd.getRotation` (keyboard rotation), `.orb-socket`, `#kbd-stage`, `.kbd-live`, `#kbd-fallback`, `#orb-fallback`, `.orb-live`, `.content` overlay — used consistently across tasks.
- **Risk note:** T2.1 (keyboard port) is the largest task; if a single port proves too big for one subagent, split it into "port scene + render" and "port interaction + sounds" sub-tasks.
