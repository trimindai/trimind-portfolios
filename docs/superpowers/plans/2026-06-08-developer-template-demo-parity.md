# Developer Template — Full Live-Demo Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a published **developer** portfolio a data-driven clone of the live demo at `/demo/developer`, including the demo's real three.js keyboard fed by the user's stack + a trackball badge.

**Architecture:** The template's `<body>` markup ALREADY matches the demo's class structure 1:1 and is data-bound. So parity = (1) port the demo's latest `<style>` + `<script>` blocks into `template.hbs` (re-applying the template's `{{safeColor}}` customization bindings), (2) replace the template's old CSS keyboard with the demo's `#kbd-stage` canvas + three.js `keyboard.js`, made data-driven via injected globals, (3) add a trackball-badge + paste-a-list field to the builder. The demo stays the canonical asset host; nothing is deleted; `keyboard.js` keeps working unchanged on the demo via fallbacks.

**Tech Stack:** Next.js 15 / Handlebars template engine / vanilla three.js (vendored r128) / Convex / next-intl (EN/AR) / Playwright (verification).

**Spec:** `docs/superpowers/specs/2026-06-08-developer-template-builder-demo-parity-design.md`

**Source of truth for design:** `public/demo/developer/index.html` (CSS lines 14–466; main JS 748–1151; tail JS 1153–1166) + `public/demo/developer/keyboard.js`.

---

## Pre-flight (read before any task)

- [ ] Read the spec end-to-end.
- [ ] Read `public/demo/developer/index.html` fully (it is the design source of truth).
- [ ] Read current `src/templates/developer/template.hbs` (target; body bindings stay, CSS+JS+keyboard change).
- [ ] Read `public/demo/developer/keyboard.js` (lines 1–70 config, 220–305 build, 277–300 trackball).
- [ ] Confirm a way to render a developer portfolio locally for verification — find the existing render route / dev server (`npm run dev`) and how other `scripts/*-check.mjs` harnesses render a portfolio with seeded data. Reuse that pattern.

---

## Task 1: `trackballBadge` helper (TDD)

**Files:**
- Modify: `src/lib/template-engine.ts` (add helper near the other `registerHelper` calls, ~line 341)
- Test: `src/lib/__tests__/template-engine.trackball.test.ts` (or the repo's existing test location/runner — match it)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest"; // match the repo's runner (vitest/jest)
import { trackballBadgeValue } from "../template-engine"; // export a pure fn the helper wraps

describe("trackballBadgeValue", () => {
  it("uses the explicit label when present", () => {
    expect(trackballBadgeValue("Synth", "Maya Okafor")).toBe("Synth");
  });
  it("falls back to the first name", () => {
    expect(trackballBadgeValue("", "Maya Okafor")).toBe("Maya");
  });
  it("falls back to 'you' when both are empty", () => {
    expect(trackballBadgeValue("", "")).toBe("you");
  });
  it("truncates to 10 chars", () => {
    expect(trackballBadgeValue("Supercalifragilistic", "")).toBe("Supercalif");
  });
});
```

- [ ] **Step 2: Run the test, verify it fails** — `npm test -- template-engine.trackball` → FAIL (`trackballBadgeValue` not exported).

- [ ] **Step 3: Implement**

```ts
// Pure, testable core for the trackball badge text.
export function trackballBadgeValue(explicit?: string | null, fullName?: string | null): string {
  const e = String(explicit ?? "").trim();
  if (e) return e.slice(0, 10);
  const first = String(fullName ?? "").trim().split(/\s+/)[0] || "";
  if (first) return first.slice(0, 10);
  return "you";
}
Handlebars.registerHelper("trackballBadge", (explicit: any, fullName: any) =>
  trackballBadgeValue(explicit, fullName),
);
```

- [ ] **Step 4: Run the test, verify it passes.**
- [ ] **Step 5: Commit** — `git add -p` the two files; `git commit -m "feat(dev-template): trackballBadge helper"`.

---

## Task 2: `kbdSkillsJSON` helper — map user skills → keyboard data (TDD)

**Files:**
- Modify: `src/lib/template-engine.ts`
- Test: `src/lib/__tests__/template-engine.kbdskills.test.ts`

Available keycap icons (slugs that exist in `public/demo/developer/stack/icons/`): `amazonwebservices, docker, figma, framer, git, githubactions, graphql, javascript, kubernetes, nextdotjs, nodedotjs, postgresql, python, react, redis, tailwindcss, threedotjs, typescript, webgl`. Names not mapping to one of these get `slug: null` (keyboard.js draws a 3-letter text cap).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { kbdSkillsData } from "../template-engine";

describe("kbdSkillsData", () => {
  const skills = [
    { category: "Frontend", items: ["React", "Next.js", "Three.js"] },
    { category: "Backend", items: ["Node.js", "SomeUnknownTool"] },
  ];
  it("maps known names to icon slugs + brand colors + tag=category", () => {
    const out = kbdSkillsData(skills);
    expect(out).toContainEqual({ slug: "react", label: "React", tag: "Frontend", color: "#61dafb" });
    expect(out).toContainEqual({ slug: "nextdotjs", label: "Next.js", tag: "Frontend", color: expect.any(String) });
    expect(out).toContainEqual({ slug: "threedotjs", label: "Three.js", tag: "Frontend", color: expect.any(String) });
    expect(out).toContainEqual({ slug: "nodedotjs", label: "Node.js", tag: "Backend", color: expect.any(String) });
  });
  it("uses slug=null for unknown tools but keeps the label", () => {
    const out = kbdSkillsData(skills);
    const unknown = out.find((s) => s.label === "SomeUnknownTool");
    expect(unknown).toBeTruthy();
    expect(unknown!.slug).toBeNull();
  });
  it("returns [] for empty / non-array", () => {
    expect(kbdSkillsData(undefined as any)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run → verify FAIL.**

- [ ] **Step 3: Implement** (reuse `flattenSkills`' flattening; add slug + color maps)

```ts
// name (normalized) -> a keycap icon slug that EXISTS in stack/icons/. Unknown -> null.
const KBD_SLUGS: Record<string, string> = {
  react: "react", reactjs: "react",
  next: "nextdotjs", nextjs: "nextdotjs",
  typescript: "typescript", ts: "typescript",
  javascript: "javascript", js: "javascript",
  tailwind: "tailwindcss", tailwindcss: "tailwindcss",
  three: "threedotjs", threejs: "threedotjs",
  webgl: "webgl",
  framer: "framer", framermotion: "framer",
  node: "nodedotjs", nodejs: "nodedotjs",
  python: "python",
  graphql: "graphql",
  postgres: "postgresql", postgresql: "postgresql",
  redis: "redis",
  aws: "amazonwebservices", amazonwebservices: "amazonwebservices",
  docker: "docker",
  kubernetes: "kubernetes", k8s: "kubernetes",
  githubactions: "githubactions", actions: "githubactions",
  git: "git",
  figma: "figma",
};
// brand colors keyed by icon slug (near-black tools get a readable dark-slate).
const KBD_COLORS: Record<string, string> = {
  react: "#61dafb", nextdotjs: "#cfd6e4", typescript: "#3178c6", javascript: "#f7df1e",
  tailwindcss: "#06b6d4", threedotjs: "#cfd6e4", webgl: "#990000", framer: "#0055ff",
  nodedotjs: "#5fa04e", python: "#3776ab", graphql: "#e10098", postgresql: "#4169e1",
  redis: "#ff4438", amazonwebservices: "#ff9900", docker: "#2496ed", kubernetes: "#326ce5",
  githubactions: "#2088ff", git: "#f05032", figma: "#f24e1e",
};
const KBD_DEFAULT_COLOR = "#5b6478";

export function kbdSkillsData(
  skills: any,
): Array<{ slug: string | null; label: string; tag: string; color: string }> {
  if (!Array.isArray(skills)) return [];
  const out: Array<{ slug: string | null; label: string; tag: string; color: string }> = [];
  skills.forEach((cat: any) => {
    const category = typeof cat?.category === "string" ? cat.category : "";
    const items = Array.isArray(cat?.items) ? cat.items : [];
    items.forEach((it: any) => {
      const label = (typeof it === "string" ? it : String(it?.name ?? it ?? "")).trim();
      if (!label) return;
      const desc = typeof it === "object" && it ? String(it.description ?? "").trim() : "";
      const slug = KBD_SLUGS[normalizeTech(label)] ?? null;
      const color = (slug && KBD_COLORS[slug]) || KBD_DEFAULT_COLOR;
      out.push({ slug, label, tag: desc || category, color });
    });
  });
  return out;
}
Handlebars.registerHelper("kbdSkillsJSON", (skills: any) =>
  new Handlebars.SafeString(JSON.stringify(kbdSkillsData(skills))),
);
```

- [ ] **Step 4: Run → verify PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat(dev-template): kbdSkillsJSON helper (skills -> keyboard caps)"`.

---

## Task 3: Make `keyboard.js` data-driven (demo stays identical via fallback)

**Files:**
- Modify: `public/demo/developer/keyboard.js` (SKILLS ~line 40; trackball "Maya" ~line 285)

- [ ] **Step 1: Gate `SKILLS` behind the injected global.** Change line 40 from `var SKILLS = [` to:

```js
var SKILLS = (window.__KBD_SKILLS && window.__KBD_SKILLS.length) ? window.__KBD_SKILLS : [
```

(keep the existing hardcoded array as the fallback body; the demo is unchanged because it never sets `window.__KBD_SKILLS`.)

- [ ] **Step 2: Parameterize the trackball label.** Near the top of the IIFE (after `ICON_BASE`), add:

```js
var TRACKBALL = (typeof window.__KBD_TRACKBALL === "string" && window.__KBD_TRACKBALL.trim()) ? window.__KBD_TRACKBALL.trim() : "Maya";
```

Then at the trackball draw (the `mCtx.fillText("Maya", 128, 128);` line ~285) replace `"Maya"` with `TRACKBALL`.

- [ ] **Step 3: Verify the demo is unchanged** — `npm run dev`, open `/demo/developer`, confirm caps + "Maya" trackball render exactly as before, 0 console errors.
- [ ] **Step 4: Commit** — `git commit -m "feat(dev-demo): keyboard.js reads window.__KBD_SKILLS/__KBD_TRACKBALL (fallback to demo)"`.

---

## Task 4: Port the demo `<style>` into the template (preserve customization bindings)

**Files:**
- Modify: `src/templates/developer/template.hbs` (replace `<style>` 14–396)

- [ ] **Step 1:** Replace the template's entire `<style>…</style>` (lines 14–396) with the demo's `<style>…</style>` (index.html lines 14–466) **verbatim**.
- [ ] **Step 2:** Re-apply the customization color bindings onto the demo's `:root`. In the ported `:root`, set the demo's background / brand / accent variables from Handlebars, matching the demo's actual variable names:
  - background var → `{{#if customization.bgColor}}{{safeColor customization.bgColor "<demo default>"}}{{else}}<demo default>{{/if}}`
  - brand/primary var → `{{safeColor customization.primaryColor "<demo default>"}}` pattern
  - accent var → `{{safeColor customization.accentColor "<demo default>"}}` pattern
  (Use the demo's existing default hex values as the literal fallbacks. Keep ALL other demo CSS vars static.)
- [ ] **Step 3:** Keep `{{faviconLink ...}}` (line 8) and the FA stylesheet. Change the template's FA `<link>` to the demo's self-hosted one: `<link rel="stylesheet" href="/demo/developer/vendor/fa/all.min.css">` (drop the cdnjs link at template line 12 — CSP-safe, matches demo).
- [ ] **Step 4: Verify build** — `npm run build` (or the template-render path) succeeds; render a portfolio and confirm the page picks up demo styling (keyboard area will be broken until Task 5 — that's expected).
- [ ] **Step 5: Commit** — `git commit -m "feat(dev-template): port demo CSS, keep customization color bindings"`.

---

## Task 5: Swap the old CSS keyboard for the demo's canvas + accessible fallback

**Files:**
- Modify: `src/templates/developer/template.hbs` (chrome canvases near line 411; hero img line 446; #skills markup ~453–500)

- [ ] **Step 1:** Add the demo's compositing canvases + progress bar alongside the existing `<canvas id="stars">` (template line 411). Match index.html 483–485:

```html
<canvas id="stars"></canvas>
<canvas id="kbd-stage" aria-hidden="true"></canvas>
<div id="progress"></div>
```

- [ ] **Step 2:** Remove the static hero keyboard image (template line 446: `<img class="hero-kbd" ...>`). The floating canvas now occupies the hero-right per the demo's scroll positioning.
- [ ] **Step 3:** Replace the `#skills` inner keyboard markup (the `kbd-toolbar` sound `<select>`, `.kbd-wrap`, `.kbd-stage`, `.kbd-deck`, `.kbd-panel`, `.kbd-listwrap` — everything that built the old CSS keyboard) with the demo's minimal skills body + an **accessible fallback list** (the demo's `#kbd-fallback` is empty; we populate it for SEO/a11y):

```html
    <div id="kbd-fallback" aria-hidden="false">
      <ul class="kbd-fallback-list">
        {{#each (flattenSkills skills)}}<li>{{this.name}}</li>{{/each}}
      </ul>
    </div>
    <p class="kbd-hint">{{#if isRTL}}اسحب للتدوير · اضغط أي مفتاح{{else}}Drag to rotate · press a key{{/if}}</p>
```

(Add a small `.kbd-fallback-list` rule — visually quiet text chips — to the ported CSS; `.kbd-live #kbd-fallback{display:none}` from the demo already hides it once the 3D board is live.)

- [ ] **Step 4: Commit** — `git commit -m "feat(dev-template): demo canvas keyboard + accessible skills fallback"`.

---

## Task 6: Port the demo `<script>` + inject the keyboard data

**Files:**
- Modify: `src/templates/developer/template.hbs` (replace `<script>` 669–1022)

- [ ] **Step 1:** Replace the template's `<script>…</script>` blocks (669–1022, including the old CSS-keyboard builder at 830) with the demo's two script blocks (index.html 748–1151 and 1153–1166) **verbatim** — preloader, custom cursor, stars field, scroll progress, reveal/blur-in/box-reveal, project modals, nav active-state, lenis loader, and the three.js + keyboard.js loader.
- [ ] **Step 2:** Immediately BEFORE the three.js loader line (`var t=document.createElement("script"); t.src="/demo/developer/vendor/three.min.js";`), inject the user's keyboard data:

```html
<script>
  window.__KBD_SKILLS = {{{kbdSkillsJSON skills}}};
  window.__KBD_TRACKBALL = "{{trackballBadge customization.trackballLabel basics.fullName}}";
</script>
```

(The loader then loads `/demo/developer/vendor/three.min.js` → `/demo/developer/keyboard.js`, which read these globals.)

- [ ] **Step 3:** Confirm the demo's `#year` filler + any IDs referenced by the ported JS exist in the template body (they do: `#year`, `data-proj`, `.modal`, `nav a[data-sec]`).
- [ ] **Step 4: Verify** — render a portfolio with seeded skills; the 3D keyboard appears with the user's caps; `.kbd-live` hides the fallback list; 0 console errors.
- [ ] **Step 5: Commit** — `git commit -m "feat(dev-template): port demo JS + inject user keyboard data"`.

---

## Task 7: Builder — trackball badge + paste-a-list

**Files:**
- Modify: `src/components/builder/steps/DeveloperStackStep.tsx`
- Modify: `src/messages/en.json`, `src/messages/ar.json` (under `builder.developer`)

- [ ] **Step 1:** Add the new i18n keys to BOTH `en.json` and `ar.json` under `builder.developer`:

```jsonc
"trackballLabel": "Trackball badge",
"trackballPlaceholder": "Maya",
"trackballHint": "The word engraved on the keyboard's trackball — your name, or any word. Defaults to your first name.",
"bulkLabel": "Paste your whole stack",
"bulkPlaceholder": "React, Node.js, PostgreSQL, Docker, Figma…",
"bulkAdd": "Add all",
"bulkHint": "Separate with commas or new lines. We'll match each to a keycap."
```

(Arabic: provide natural AR translations — `"شارة الكرة"`, etc. Keep the same keys.)

- [ ] **Step 2:** Add the trackball-badge input near the keyboard hint block (after the `stackKeyboardHint` box). It writes `customization.trackballLabel`:

```tsx
const customization = data.customization || {};
// …
<div className="rounded-xl border border-[var(--land-border)] p-4 sm:p-5">
  <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{t("trackballLabel")}</label>
  <input
    value={customization.trackballLabel || ""}
    maxLength={12}
    onChange={(e) => onChange({ customization: { ...customization, trackballLabel: e.target.value } })}
    placeholder={t("trackballPlaceholder")}
    className="min-h-[44px] w-full max-w-[16rem] rounded-lg border border-[var(--land-border)] bg-white px-3 py-2 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm outline-none focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)]"
  />
  <p className="mt-1 text-xs text-[var(--land-muted)]">{t("trackballHint")}</p>
</div>
```

- [ ] **Step 3:** Add a bulk paste box above the curated categories. Reuse the existing `addCustom` routing; route each pasted tool to its curated category if the name matches a curated tool, else to a `"Tools"` category:

```tsx
function routeCategory(name: string): string {
  const n = name.toLowerCase();
  for (const c of CURATED) if (c.tools.some((tt) => tt.name.toLowerCase() === n)) return c.category;
  return "Tools";
}
function BulkAdd({ onAddMany, label, placeholder, addLabel, hint }: {
  onAddMany: (names: string[]) => void; label: string; placeholder: string; addLabel: string; hint: string;
}) {
  const [v, setV] = useState("");
  const commit = () => {
    const names = v.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (names.length) { onAddMany(names); setV(""); }
  };
  return (
    <div className="rounded-xl border border-[var(--land-border)] p-4 sm:p-5">
      <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">{label}</label>
      <textarea value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full rounded-lg border border-[var(--land-border)] bg-white px-3 py-2 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm outline-none focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)]" />
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--land-muted)]">{hint}</p>
        <button type="button" onClick={commit}
          className="min-h-[40px] rounded-lg border border-[var(--land-border)] px-4 text-sm font-medium text-[var(--land-bright)] hover:border-[var(--land-accent)]">{addLabel}</button>
      </div>
    </div>
  );
}
```

Wire it with an `onAddMany` that groups by `routeCategory` and merges via the existing `setItems` (dedupe case-insensitively, mirroring `addCustom`).

- [ ] **Step 4: Verify** — `npm run dev`, open the developer builder Stack step: paste a list → tools appear as chips under the right categories; type a trackball word → persists in `data.customization.trackballLabel`.
- [ ] **Step 5: Commit** — `git commit -m "feat(builder): developer trackball badge + paste-a-list stack entry"`.

---

## Task 8: Convex schema checkpoint

**Files:**
- Inspect: `convex/schema.ts` (the portfolio `customization` field)

- [ ] **Step 1:** Confirm `customization` accepts the new `trackballLabel` string (it is expected to be a flexible object / `v.any()` / open object). If it is a CLOSED validator listing explicit keys, add `trackballLabel: v.optional(v.string())`.
- [ ] **Step 2:** If a change was needed, run the Convex codegen/typecheck the repo uses; commit `git commit -m "feat(convex): allow customization.trackballLabel"`. Otherwise note "no change needed".

---

## Task 9: Verification harness (Playwright)

**Files:**
- Create: `scripts/developer-parity-check.mjs` (model after `scripts/creator-game-check.mjs`)

- [ ] **Step 1:** Write a script that renders a developer portfolio with seeded data (name `"Maya Okafor"`, trackball `"Synth"`, ~14 skills incl. React/Node.js/Docker, 3 experience items, 4 projects with tech badges, github/linkedin/email/phone/location) in real Chromium at desktop (1280px) and true phone (390px), EN and AR.
- [ ] **Step 2:** Assert:
  - 3D keyboard canvas renders and signals `kbd-live` (the fallback list hides); sample that a keycap carries a brand color (`--kc`/material color) and the trackball texture shows `"Synth"` (assert via the injected `window.__KBD_TRACKBALL === "Synth"` and `window.__KBD_SKILLS.length === 14`).
  - hero name/role/pitch/stat counters render; nav active-state updates on scroll.
  - experience timeline has 3 cards; projects grid has 4; clicking a project opens its modal; close works.
  - contact form + horizontal contact strip render; empty fields omitted on a sparse second fixture.
  - 390px phone: no vertical overflow of the document beyond viewport width; page scrolls (wheel not trapped).
  - AR (RTL): `dir="rtl"` applied; layout not broken.
  - **0 console errors** across all cases.
- [ ] **Step 3: Run** — `node scripts/developer-parity-check.mjs` → all assertions pass.
- [ ] **Step 4: Commit** — `git commit -m "test(dev-template): demo-parity verification harness"`.

---

## Task 10: Final review pass + live check

- [ ] **Step 1:** Run `node scripts/developer-parity-check.mjs` once more; capture phone + desktop screenshots EN/AR.
- [ ] **Step 2:** Open `/demo/developer` and confirm it is byte-for-byte unchanged (keyboard + "Maya" still correct).
- [ ] **Step 3:** Confirm `git rev-list --left-right origin/master...master` and that HEAD builds cleanly before any push (shared working tree — stage only this feature's files).
- [ ] **Step 4:** Optional: run `/code-review` on the diff.

---

## Self-Review notes (author)

- **Spec coverage:** hero/skills/experience/projects/contact/footer bindings already exist (Tasks 4–6 restyle, not rebind); keyboard data-driving (Tasks 2,3,6); trackball badge (Tasks 1,3,6,7); paste-a-list (Task 7); i18n (Task 7); assets same-origin/CSP (Tasks 4,6); accessible fallback (Task 5); Convex (Task 8); verification (Task 9). ✓
- **Asset coupling risk** (published portfolios depend on `/demo/developer/...`): accepted per spec; revisit by copying to `/assets/dev/` if the demo is ever removed.
- **Watch-out:** shared working tree — other sessions' uncommitted files exist; stage only this feature's paths. Confirm `origin/master` builds before/after pushing.
- **Watch-out:** demo `:root` variable names must be mapped onto the template's customization bindings in Task 4 — the executor reconciles names against the demo's actual `:root`.
