// Committed verification harness for the developer template demo-parity plan.
// Renders the template via a tsx child process (same technique as _t46-render-check.mjs),
// serves rendered HTML at /p/test-* alongside /demo/developer/* assets from public/,
// then drives Playwright with swiftshader WebGL across the full test matrix:
//
//   RICH  × desktop 1280×800  × EN
//   RICH  × desktop 1280×800  × AR (RTL)
//   RICH  × phone   390×844   × EN
//   RICH  × phone   390×844   × AR (RTL)
//   SPARSE × desktop 1280×800 × EN
//
// Usage: node scripts/developer-parity-check.mjs
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, writeFile, rm } from "node:fs/promises";
import { resolve, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = resolve(ROOT, "public");

/* ── MIME types ──────────────────────────────────────────────────────────── */
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".json": "application/json", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".ttf": "font/ttf", ".woff": "font/woff",
};

/* ── Render fixtures via tsx child process ───────────────────────────────── */
// We write a small TypeScript snippet to /tmp, run it with npx tsx, and read
// the rendered HTML back from /tmp.  This is the same approach _t46-render-check.mjs
// proved works and avoids any .hbs import issues in plain .mjs.

const RENDER_SCRIPT = `
import Handlebars from "handlebars";
import "../src/lib/template-engine";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const tpl = Handlebars.compile(
  readFileSync(resolve(ROOT, "src/templates/developer/template.hbs"), "utf8")
);

// ── RICH fixture: Maya Okafor — 14 skills across 4 categories ──────────────
// Skills: React, Next.js, TypeScript, JavaScript, Tailwind (Frontend = 5)
//         Node.js, Python, GraphQL, PostgreSQL (Backend = 4)
//         Docker, Kubernetes, AWS (Infra = 3)
//         MysteryToolX, ObscureKitY (Other = 2)   → total = 14
const rich = {
  basics: {
    fullName: "Maya Okafor",
    title: "Full-Stack Engineer",
    subtitle: "Creative Technologist",
    valueProposition: "I build fast, interactive web products.",
    email: "maya@okafor.dev",
    phone: "+351 900 000 000",
    location: "Lisbon, Portugal",
    github: "https://github.com/example",
    linkedin: "https://www.linkedin.com/in/example",
    website: "https://okafor.dev",
    resumeUrl: "https://okafor.dev/resume.pdf",
  },
  metrics: [
    { value: "6+", label: "Years shipping" },
    { value: "40+", label: "Projects delivered" },
    { value: "12", label: "Open-source libs" },
  ],
  skills: [
    { category: "Frontend",  items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind"] },
    { category: "Backend",   items: ["Node.js", "Python", "GraphQL", "PostgreSQL"] },
    { category: "Infra",     items: ["Docker", "Kubernetes", "AWS"] },
    { category: "Other",     items: ["MysteryToolX", "ObscureKitY"] },
  ],
  experience: [
    { title: "Senior Engineer",    company: "Nebula Labs",   startDate: "Jan 2024",
      description: "Lead engineer on the core platform.",    highlights: ["Shipped A", "Built B"] },
    { title: "Developer",          company: "Orbit Studio",  startDate: "Jun 2021", endDate: "Dec 2023" },
    { title: "Frontend Engineer",  company: "Pixel & Co.",   startDate: "Aug 2019", endDate: "May 2021" },
  ],
  projects: [
    { title: "Aurora",      description: "Multiplayer canvas app.",  tagline: "Real-time collab",
      technologies: ["Next.js", "Redis"], link: "https://okafor.dev" },
    { title: "Stargazer",   description: "3D star map.",             tagline: "3D / WebGL",
      technologies: ["Three.js"] },
    { title: "Switchboard", description: "Feature flag platform.",   tagline: "Developer tool" },
    { title: "Quietbox",    description: "Distraction-free writing app.", tagline: "Side project" },
  ],
  education: [{ degree: "BSc Computer Science", institution: "U Lisbon", year: "2019" }],
  customization: { trackballLabel: "Synth", primaryColor: "", accentColor: "", bgColor: "" },
  locale: "en",
  isRTL: false,
  portfolioUrl: "https://portfolio-trimind.com/p/test-rich",
};

// AR variant: same data, RTL locale
const richAr = { ...rich,
  locale: "ar", isRTL: true,
  portfolioUrl: "https://portfolio-trimind.com/p/test-rich-ar",
};

// SPARSE fixture: minimal basics, no skills/projects/email/phone/customization
const sparse = {
  basics: {
    fullName: "Alex Doe",
    title: "Developer",
    github: "https://github.com/example",
    linkedin: "https://www.linkedin.com/in/example",
    // no email, phone, location
  },
  skills: [],
  experience: [],
  projects: [],
  customization: {},
  locale: "en",
  isRTL: false,
  portfolioUrl: "https://portfolio-trimind.com/p/test-sparse",
};

writeFileSync("/tmp/parity-rich-en.html",  tpl(rich));
writeFileSync("/tmp/parity-rich-ar.html",  tpl(richAr));
writeFileSync("/tmp/parity-sparse-en.html", tpl(sparse));
console.log("rendered OK");
`;

// Write render script inside the project (so tsx resolves packages from node_modules)
const RENDER_SCRIPT_PATH = resolve(ROOT, "scripts/_parity-render-tmp.mts");
await writeFile(RENDER_SCRIPT_PATH, RENDER_SCRIPT, "utf8");

console.log("Rendering fixtures via tsx…");
try {
  execSync("npx tsx scripts/_parity-render-tmp.mts", {
    cwd: ROOT,
    stdio: "inherit",
    timeout: 30_000,
  });
} catch (err) {
  console.error("FATAL: tsx render failed:", err.message);
  await rm(RENDER_SCRIPT_PATH, { force: true });
  process.exit(1);
}

const htmlRichEn   = await readFile("/tmp/parity-rich-en.html",   "utf8");
const htmlRichAr   = await readFile("/tmp/parity-rich-ar.html",   "utf8");
const htmlSparseEn = await readFile("/tmp/parity-sparse-en.html", "utf8");

// Clean up render script (outputs stay in /tmp)
await rm(RENDER_SCRIPT_PATH, { force: true });

/* ── Static server ───────────────────────────────────────────────────────── */
const HTML_MAP = {
  "/p/test-rich-en":   htmlRichEn,
  "/p/test-rich-ar":   htmlRichAr,
  "/p/test-sparse-en": htmlSparseEn,
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (HTML_MAP[p]) {
      return res.writeHead(200, { "content-type": "text/html" }).end(HTML_MAP[p]);
    }
    const file = resolve(PUBLIC, "." + normalize(p));
    if (!file.startsWith(PUBLIC)) return res.writeHead(403).end();
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});

await new Promise((res, rej) => { server.once("error", rej); server.listen(8793, res); });
const BASE = "http://localhost:8793";

/* ── Playwright ──────────────────────────────────────────────────────────── */
const b = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
});

let fails = 0;
const ok = (name, cond, extra = "") => {
  console.log(`  ${cond ? "ok  " : "FAIL"}- ${name}${extra ? "  " + extra : ""}`);
  if (!cond) fails++;
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
async function waitForLive(page) {
  await page.waitForFunction(
    () => document.documentElement.classList.contains("kbd-live"),
    { timeout: 30_000 }
  );
  await page.evaluate(() =>
    document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" })
  );
  await page.waitForTimeout(1200);
}

// Collect console errors + page errors
function attachErrorCollector(page) {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

// Collect all responses (url + status)
function attachResponseCollector(page) {
  const requests = [];
  page.on("response", (r) => requests.push({ url: r.url(), status: r.status() }));
  return requests;
}

const cspAllowed = (u) =>
  u.startsWith("https://fonts.googleapis.com/") ||
  u.startsWith("https://fonts.gstatic.com/");

/* ══════════════════════════════════════════════════════════════════════════
   checkRichDesktop — RICH fixture, 1280×800
   ══════════════════════════════════════════════════════════════════════════ */
async function checkRichDesktop(path, label) {
  console.log(`\n[desktop ${label}] ${path}`);
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    const errors = attachErrorCollector(page);
    const requests = attachResponseCollector(page);

    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45_000 });

    // ── 3D keyboard ──────────────────────────────────────────────────────────
    await waitForLive(page);

    const live = await page.evaluate(() => document.documentElement.classList.contains("kbd-live"));
    ok("html has .kbd-live", live);

    const fbDisplay = await page.evaluate(() =>
      getComputedStyle(document.getElementById("kbd-fallback") || document.body).display
    );
    ok("kbd-fallback hidden when live", fbDisplay === "none", `display=${fbDisplay}`);

    const fbItems = await page.evaluate(() =>
      document.querySelectorAll("#kbd-fallback .kbd-fallback-list li").length
    );
    ok("kbd-fallback list has 14 items (SEO/a11y)", fbItems === 14, `n=${fbItems}`);

    const skillsLen = await page.evaluate(() => (window.__KBD_SKILLS || []).length);
    ok("window.__KBD_SKILLS.length === 14", skillsLen === 14, `len=${skillsLen}`);

    const trackball = await page.evaluate(() => window.__KBD_TRACKBALL);
    ok('window.__KBD_TRACKBALL === "Synth"', trackball === "Synth", `got=${JSON.stringify(trackball)}`);

    const hasReactColor = await page.evaluate(() =>
      Array.isArray(window.__KBD_SKILLS) &&
      window.__KBD_SKILLS.some((s) => s.color === "#61dafb")
    );
    ok("React cap carries brand color #61dafb", hasReactColor);

    // ── Hero ─────────────────────────────────────────────────────────────────
    const h1 = await page.evaluate(() => document.querySelector("#hero h1")?.textContent?.trim() || "");
    ok('hero name "Maya Okafor"', h1 === "Maya Okafor", `h1="${h1}"`);

    const role = await page.evaluate(() => document.querySelector("#hero .role")?.textContent?.trim() || "");
    ok("hero role includes title text", role.includes("Full-Stack Engineer"), `role="${role}"`);

    const pitch = await page.evaluate(() => document.querySelector("#hero .pitch")?.textContent?.trim() || "");
    ok("hero pitch renders", pitch.length > 0, `pitch="${pitch.slice(0, 60)}"`);

    // stat counters present in DOM (they're in .cta, not animated to numbers — just check existence)
    const statCount = await page.evaluate(() =>
      document.querySelectorAll("#hero .cta b").length
    );
    ok("stat counters present (>=3)", statCount >= 3, `n=${statCount}`);
    // verify at least one stat counter has non-empty text
    const statHasContent = await page.evaluate(() =>
      [...document.querySelectorAll("#hero .cta b")].some((b) => b.textContent?.trim().length > 0)
    );
    ok("stat counters have non-empty text", statHasContent);

    // ── Nav active state after scroll ────────────────────────────────────────
    const initialActive = await page.evaluate(() => {
      const a = document.querySelector("nav a.active");
      return a?.getAttribute("data-sec") || "";
    });
    ok("nav has an active item initially", initialActive.length > 0, `sec="${initialActive}"`);

    await page.evaluate(() =>
      document.getElementById("experience")?.scrollIntoView({ behavior: "instant", block: "center" })
    );
    await page.waitForTimeout(600);
    const activeAfterScroll = await page.evaluate(() => {
      const a = document.querySelector("nav a.active");
      return a?.getAttribute("data-sec") || "";
    });
    ok("nav active-state updates after scrolling to #experience",
      activeAfterScroll === "experience" || activeAfterScroll !== initialActive,
      `sec="${activeAfterScroll}"`
    );

    // ── Experience timeline ──────────────────────────────────────────────────
    const expCards = await page.evaluate(() => document.querySelectorAll(".timeline .tl-item").length);
    ok("experience timeline: 3 cards", expCards === 3, `n=${expCards}`);

    // ── Projects ─────────────────────────────────────────────────────────────
    const projCards = await page.evaluate(() => document.querySelectorAll(".proj-grid .proj").length);
    ok("projects: 4 cards", projCards === 4, `n=${projCards}`);

    // Click first project to open modal
    await page.evaluate(() => document.querySelector('[data-proj="0"]')?.click());
    await page.waitForTimeout(500);
    const modalOpen = await page.evaluate(() =>
      document.getElementById("modal-0")?.classList.contains("open") ?? false
    );
    ok("project modal opens on click", modalOpen);

    // Close with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    const modalClosed = await page.evaluate(() => !document.querySelector(".modal.open"));
    ok("project modal closes with Escape", modalClosed);

    // Close button also works — open again and click close
    await page.evaluate(() => document.querySelector('[data-proj="0"]')?.click());
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelector("[data-close]")?.click());
    await page.waitForTimeout(300);
    const modalClosedBtn = await page.evaluate(() => !document.querySelector(".modal.open"));
    ok("project modal closes via close button", modalClosedBtn);

    // ── Contact ──────────────────────────────────────────────────────────────
    const hasContactForm = await page.evaluate(() => !!document.getElementById("contact-form"));
    ok("contact form renders", hasContactForm);

    const contactListItems = await page.evaluate(() =>
      document.querySelectorAll(".contact-list a").length
    );
    ok("contact strip has seeded fields (>=4)", contactListItems >= 4, `n=${contactListItems}`);

    // Email and phone in contact strip
    const hasEmail = await page.evaluate(() =>
      [...document.querySelectorAll(".contact-list a")].some((a) =>
        a.href?.startsWith("mailto:")
      )
    );
    ok("contact strip includes email link", hasEmail);

    const hasPhone = await page.evaluate(() =>
      [...document.querySelectorAll(".contact-list a")].some((a) =>
        a.href?.startsWith("tel:")
      )
    );
    ok("contact strip includes phone link", hasPhone);

    // ── Asset hygiene ─────────────────────────────────────────────────────────
    const offOrigin = requests.filter(
      (r) => !r.url.startsWith(BASE) && !r.url.startsWith("data:") && !cspAllowed(r.url)
    );
    ok("all asset requests same-origin or CSP-allowed fonts",
      offOrigin.length === 0, offOrigin.slice(0, 3).map((r) => r.url).join(", ")
    );

    const notFound = requests.filter((r) => r.status === 404);
    ok("no 404s", notFound.length === 0, notFound.slice(0, 3).map((r) => r.url).join(", "));

    // three.js + keyboard.js loaded
    const gotThree = requests.some((r) => r.url.includes("/demo/developer/vendor/three.min.js"));
    const gotKbd   = requests.some((r) => r.url.includes("/demo/developer/keyboard.js"));
    ok("three.min.js loaded from /demo/developer/vendor/", gotThree);
    ok("keyboard.js loaded from /demo/developer/", gotKbd);

    // ── Console errors ────────────────────────────────────────────────────────
    ok("0 console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

  } finally {
    await ctx.close();
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   checkRichPhone — RICH fixture, 390×844, touch
   ══════════════════════════════════════════════════════════════════════════ */
async function checkRichPhone(path, label) {
  console.log(`\n[phone ${label}] ${path}`);
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  try {
    const page = await ctx.newPage();
    const errors = attachErrorCollector(page);
    const requests = attachResponseCollector(page);

    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45_000 });
    await waitForLive(page);

    // ── 3D keyboard (phone) ──────────────────────────────────────────────────
    const live = await page.evaluate(() => document.documentElement.classList.contains("kbd-live"));
    ok("html has .kbd-live", live);

    const skillsLen = await page.evaluate(() => (window.__KBD_SKILLS || []).length);
    ok("window.__KBD_SKILLS.length === 14", skillsLen === 14, `len=${skillsLen}`);

    const trackball = await page.evaluate(() => window.__KBD_TRACKBALL);
    ok('window.__KBD_TRACKBALL === "Synth"', trackball === "Synth", `got=${JSON.stringify(trackball)}`);

    // ── Hero ─────────────────────────────────────────────────────────────────
    const h1 = await page.evaluate(() => document.querySelector("#hero h1")?.textContent?.trim() || "");
    ok('hero name "Maya Okafor"', h1 === "Maya Okafor", `h1="${h1}"`);

    // ── No horizontal overflow ────────────────────────────────────────────────
    // Scroll to the top first, then check scrollWidth
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    ok("no horizontal overflow (scrollWidth <= 390)", scrollWidth <= 390, `scrollWidth=${scrollWidth}`);

    // ── Vertical scroll is not trapped ───────────────────────────────────────
    // Mirror dev-demo-phone-verify.mjs: use CDP touch events to drag in empty
    // area — the page should scroll (delta > 0 after a downward drag from top).
    const cdp = await ctx.newCDPSession(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    const scrollBefore = await page.evaluate(() => Math.round(window.scrollY));
    // Drag downward from top-left corner (empty hero area)
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 40, y: 200 }] });
    for (let i = 0; i < 8; i++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove", touchPoints: [{ x: 40, y: 200 - (i + 1) * 25 }]
      });
      await page.waitForTimeout(30);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => Math.round(window.scrollY));
    const scrollDelta = scrollAfter - scrollBefore;
    ok("vertical scroll is not trapped (drag scrolls page, delta > 0)", scrollDelta > 0, `delta=${scrollDelta}`);

    // ── Asset hygiene ─────────────────────────────────────────────────────────
    const offOrigin = requests.filter(
      (r) => !r.url.startsWith(BASE) && !r.url.startsWith("data:") && !cspAllowed(r.url)
    );
    ok("all asset requests same-origin or CSP-allowed fonts",
      offOrigin.length === 0, offOrigin.slice(0, 3).map((r) => r.url).join(", ")
    );

    const notFound = requests.filter((r) => r.status === 404);
    ok("no 404s", notFound.length === 0, notFound.slice(0, 3).map((r) => r.url).join(", "));

    // ── Console errors ────────────────────────────────────────────────────────
    ok("0 console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

  } finally {
    await ctx.close();
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   checkRichAR — same as Rich desktop but verifies RTL + Arabic hints
   ══════════════════════════════════════════════════════════════════════════ */
async function checkRichAR(path, label, viewport) {
  console.log(`\n[${label}] ${path}`);
  const isPhone = viewport.width <= 400;
  const ctx = await b.newContext({
    viewport,
    isMobile: isPhone,
    hasTouch: isPhone,
    deviceScaleFactor: isPhone ? 2 : 1,
  });
  try {
    const page = await ctx.newPage();
    const errors = attachErrorCollector(page);
    const requests = attachResponseCollector(page);

    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45_000 });
    await waitForLive(page);

    // ── RTL ──────────────────────────────────────────────────────────────────
    const dir = await page.evaluate(() => document.documentElement.getAttribute("dir"));
    ok('html dir="rtl"', dir === "rtl", `dir="${dir}"`);

    // Arabic kbd-hint text present (template emits "اسحب للتدوير · اضغط أي مفتاح" for RTL)
    const kbdHint = await page.evaluate(() =>
      document.querySelector(".kbd-hint")?.textContent?.trim() || ""
    );
    ok("Arabic kbd-hint text present", kbdHint.includes("اسحب"), `hint="${kbdHint}"`);

    // ── 3D keyboard present ───────────────────────────────────────────────────
    const live = await page.evaluate(() => document.documentElement.classList.contains("kbd-live"));
    ok("html has .kbd-live (AR)", live);

    const skillsLen = await page.evaluate(() => (window.__KBD_SKILLS || []).length);
    ok("window.__KBD_SKILLS.length === 14 (AR)", skillsLen === 14, `len=${skillsLen}`);

    // ── No horizontal overflow ────────────────────────────────────────────────
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(`no horizontal overflow (scrollWidth <= ${viewport.width})`,
      scrollWidth <= viewport.width, `scrollWidth=${scrollWidth}`
    );

    // ── Hero name ─────────────────────────────────────────────────────────────
    const h1 = await page.evaluate(() => document.querySelector("#hero h1")?.textContent?.trim() || "");
    ok('hero name "Maya Okafor" (AR locale)', h1 === "Maya Okafor", `h1="${h1}"`);

    // ── Asset hygiene ─────────────────────────────────────────────────────────
    const offOrigin = requests.filter(
      (r) => !r.url.startsWith(BASE) && !r.url.startsWith("data:") && !cspAllowed(r.url)
    );
    ok("all asset requests same-origin or CSP-allowed fonts (AR)",
      offOrigin.length === 0, offOrigin.slice(0, 3).map((r) => r.url).join(", ")
    );

    const notFound = requests.filter((r) => r.status === 404);
    ok("no 404s (AR)", notFound.length === 0, notFound.slice(0, 3).map((r) => r.url).join(", "));

    // ── Console errors ────────────────────────────────────────────────────────
    ok("0 console errors (AR)", errors.length === 0, errors.slice(0, 3).join(" | "));

  } finally {
    await ctx.close();
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   checkSparse — SPARSE fixture, desktop, EN
   ══════════════════════════════════════════════════════════════════════════ */
async function checkSparse(path, label) {
  console.log(`\n[sparse ${label}] ${path}`);
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    const errors = attachErrorCollector(page);
    const requests = attachResponseCollector(page);

    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45_000 });
    // No skills → no kbd-live ever fires; wait for page to settle instead
    await page.waitForTimeout(3000);

    // ── No skills → no keyboard globals / canvas / section ───────────────────
    const noGlobal = await page.evaluate(() => typeof window.__KBD_SKILLS === "undefined");
    ok("no __KBD_SKILLS global (sparse)", noGlobal);

    const noStage = await page.evaluate(() => !document.getElementById("kbd-stage"));
    ok("no #kbd-stage canvas (sparse)", noStage);

    const noSkillsSec = await page.evaluate(() => !document.getElementById("skills"));
    ok("no #skills section (sparse)", noSkillsSec);

    // three.js + keyboard.js must NOT be requested
    const noThree = !requests.some(
      (r) => r.url.includes("three.min.js") || r.url.includes("keyboard.js")
    );
    ok("no three.js / keyboard.js request (sparse)", noThree);

    // ── No projects → no projects section ─────────────────────────────────────
    const noProjects = await page.evaluate(() => !document.getElementById("projects"));
    ok("no #projects section (sparse)", noProjects);

    // ── No experience → no experience section ─────────────────────────────────
    const noExp = await page.evaluate(() => !document.getElementById("experience"));
    ok("no #experience section (sparse)", noExp);

    // ── Page integrity (hero + contact still render) ──────────────────────────
    const h1 = await page.evaluate(() => document.querySelector("#hero h1")?.textContent?.trim() || "");
    ok('sparse hero renders "Alex Doe"', h1 === "Alex Doe", `h1="${h1}"`);

    const hasContactForm = await page.evaluate(() => !!document.getElementById("contact-form"));
    ok("contact section still renders (sparse)", hasContactForm);

    // Contact strip: no email/phone links (sparse basics has neither)
    const hasEmailLink = await page.evaluate(() =>
      [...document.querySelectorAll(".contact-list a")].some((a) => a.href?.startsWith("mailto:"))
    );
    ok("no email link in contact strip (sparse — no email field)", !hasEmailLink);

    // ── Asset hygiene ─────────────────────────────────────────────────────────
    const offOrigin = requests.filter(
      (r) => !r.url.startsWith(BASE) && !r.url.startsWith("data:") && !cspAllowed(r.url)
    );
    ok("all asset requests same-origin or CSP-allowed fonts (sparse)",
      offOrigin.length === 0, offOrigin.slice(0, 3).map((r) => r.url).join(", ")
    );

    const notFound = requests.filter((r) => r.status === 404);
    ok("no 404s (sparse)", notFound.length === 0, notFound.slice(0, 3).map((r) => r.url).join(", "));

    // ── Console errors ────────────────────────────────────────────────────────
    ok("0 console errors (sparse)", errors.length === 0, errors.slice(0, 3).join(" | "));

  } finally {
    await ctx.close();
  }
}

/* ── Run the matrix ─────────────────────────────────────────────────────── */
try {
  // RICH × desktop EN
  await checkRichDesktop("/p/test-rich-en", "EN");

  // RICH × desktop AR (RTL)
  await checkRichAR("/p/test-rich-ar", "desktop AR", { width: 1280, height: 800 });

  // RICH × phone EN
  await checkRichPhone("/p/test-rich-en", "EN");

  // RICH × phone AR (RTL)
  await checkRichAR("/p/test-rich-ar", "phone AR", { width: 390, height: 844 });

  // SPARSE × desktop EN
  await checkSparse("/p/test-sparse-en", "EN");

} finally {
  await b.close();
  server.close();
}

console.log(
  fails
    ? `\nPARITY CHECK: ${fails} failing`
    : "\nPARITY CHECK: all passing"
);
process.exit(fails ? 1 : 0);
