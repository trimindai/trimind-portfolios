// Phone + desktop verification for /demo/developer (EN + AR).
// Serves public/ statically, drives Chrome with swiftshader WebGL, and asserts:
//   - cap-drag does NOT scroll the page; empty-area drag DOES
//   - the skill label lives inside #kbd-label-host on phone and never overlaps the heading
//   - the auto-hover spotlight cycles the label across caps
//   - the board never clips the viewport (projected cap bounds within screen)
// Usage: node scripts/dev-demo-phone-verify.mjs
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json",
  ".ico": "image/x-icon", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
    const file = resolve(ROOT, "." + normalize(p));
    if (!file.startsWith(ROOT)) return res.writeHead(403).end();
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" }); res.end(body);
  } catch { res.writeHead(404).end("not found"); }
});
await new Promise((res, rej) => { server.once("error", rej); server.listen(8787, res); });
const BASE = "http://localhost:8787";

const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
let fails = 0;
const ok = (n, c, extra = "") => { console.log(`  ${c ? "ok  " : "FAIL"}- ${n}${extra ? "  " + extra : ""}`); if (!c) fails++; };

// Project every cap's world position with the live camera and return the
// screen-space horizontal extent in CSS pixels.
async function capScreenExtent(page) {
  return await page.evaluate(() => {
    const k = window.__kbd; if (!k || !k.caps?.length || !window.THREE) return null;
    const v = new window.THREE.Vector3(); let minX = Infinity, maxX = -Infinity;
    for (const cap of k.caps) {
      cap.getWorldPosition(v); v.project(k.camera);
      const x = (v.x * 0.5 + 0.5) * window.innerWidth;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
    }
    return { minX, maxX, w: window.innerWidth, cols: k.cols, rows: k.rows };
  });
}

async function liveSkills(page) {
  await page.waitForFunction(() => document.documentElement.classList.contains("kbd-live"), { timeout: 25000 });
  await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.waitForTimeout(900);
}

async function checkPhone(path, label) {
  console.log(`\n[phone ${label}] ${path}`);
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  try {
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
    await liveSkills(page);

    // --- scroll-lock: drag starting ON a keycap should not scroll the page ---
    const dragDelta = async (x, y0) => {
      const before = await page.evaluate(() => Math.round(window.scrollY));
      let y = y0;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      for (let i = 0; i < 8; i++) { y -= 22; await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] }); await page.waitForTimeout(35); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => Math.round(window.scrollY));
      return after - before;
    };
    // keyboard sits in the lower-centre on phone; caps around y560, board centre x195
    const capDrag = await dragDelta(195, 600);
    ok("cap-drag does not scroll the page (|delta| <= 8px)", Math.abs(capDrag) <= 8, `delta=${capDrag}`);
    await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForTimeout(500);
    // empty area near the very top edge of the section (above the board) should still scroll
    const emptyDrag = await dragDelta(40, 120);
    ok("empty-area drag still scrolls the page (delta > 40px)", emptyDrag > 40, `delta=${emptyDrag}`);

    // --- label hosting + no overlap with the heading on scroll ---
    const hostId = await page.evaluate(() => document.getElementById("kbd-label")?.parentElement?.id || "");
    ok("skill label is hosted inside #kbd-label-host on phone", hostId === "kbd-label-host", `parent=#${hostId}`);

    // sweep the skills section through the viewport; the in-flow label must never
    // vertically overlap the section heading.
    let worstOverlap = -1e9;
    const skillsTop = await page.evaluate(() => { const s = document.getElementById("skills"); return s.getBoundingClientRect().top + window.scrollY; });
    for (let off = -120; off <= 640; off += 160) {
      await page.evaluate((y) => window.scrollTo(0, y), skillsTop + off);
      await page.waitForTimeout(450);
      const o = await page.evaluate(() => {
        const h = document.querySelector("#skills h2"), l = document.getElementById("kbd-label");
        if (!h || !l || getComputedStyle(l).opacity === "0") return -1e9;
        const hr = h.getBoundingClientRect(), lr = l.getBoundingClientRect();
        return Math.min(hr.bottom, lr.bottom) - Math.max(hr.top, lr.top); // >0 means overlap
      });
      worstOverlap = Math.max(worstOverlap, o);
    }
    ok("in-flow label never overlaps the heading across scroll", worstOverlap <= 2, `worstOverlap=${Math.round(worstOverlap)}px`);

    // --- auto-hover spotlight: the label must cycle across multiple skills while idle ---
    await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
    const seen = new Set();
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(800);
      const name = await page.evaluate(() => document.querySelector("#kbd-label .kbd-label-name")?.textContent?.trim() || "");
      if (name) seen.add(name);
    }
    ok("auto-hover spotlight cycles the label across >= 3 skills", seen.size >= 3, `distinct=${seen.size} [${[...seen].join(", ")}]`);

    await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForTimeout(700);
    const ext = await capScreenExtent(page);
    ok("keyboard does not clip the phone viewport (caps within 0..width)", !!ext && ext.minX >= 0 && ext.maxX <= ext.w,
       ext ? `minX=${Math.round(ext.minX)} maxX=${Math.round(ext.maxX)} w=${ext.w} grid=${ext.rows}x${ext.cols}` : "no __kbd");
  } finally {
    await ctx.close();
  }
}

async function checkDesktop(path, label) {
  console.log(`\n[desktop ${label}] ${path}`);
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  try {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
    await liveSkills(page);
    const ext = await capScreenExtent(page);
    ok("desktop: grid is 4x5 for Maya (rule no-op)", !!ext && ext.rows === 4 && ext.cols === 5, ext ? `grid=${ext.rows}x${ext.cols}` : "no __kbd");
    ok("desktop: keyboard does not clip", !!ext && ext.minX >= 0 && ext.maxX <= ext.w, ext ? `minX=${Math.round(ext.minX)} maxX=${Math.round(ext.maxX)} w=${ext.w}` : "no __kbd");
    const parent = await page.evaluate(() => document.getElementById("kbd-label")?.parentElement?.id || "body");
    ok("desktop: label is NOT in #kbd-label-host (stays floating)", parent !== "kbd-label-host", `parent=${parent}`);
  } finally {
    await ctx.close();
  }
}
async function checkReducedMotion(path, label) {
  console.log(`\n[reduced-motion ${label}] ${path}`);
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" });
  try {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
    // Under prefers-reduced-motion the page intentionally skips loading Three.js +
    // keyboard.js entirely (line ~1140 of index.html: `if(reduce||lowEnd) return`).
    // kbd-live is never set — wait for the page to settle instead of liveSkills().
    await page.evaluate(() => document.getElementById("skills")?.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForTimeout(1200);
    const seen = new Set();
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(800);
      const name = await page.evaluate(() => document.querySelector("#kbd-label .kbd-label-name")?.textContent?.trim() || "");
      if (name) seen.add(name);
    }
    ok("reduced-motion: spotlight does NOT cycle (<= 1 label)", seen.size <= 1, `distinct=${seen.size}`);
  } finally {
    await ctx.close();
  }
}

try {
  await checkPhone("/demo/developer/index.html", "EN");
  await checkPhone("/demo/developer/index-ar.html", "AR");
  await checkDesktop("/demo/developer/index.html", "EN");
  await checkReducedMotion("/demo/developer/index.html", "EN");
} finally {
  await b.close();
  server.close();
}
console.log(fails ? `\nVERIFY: ${fails} failing` : "\nVERIFY: all passing");
process.exit(fails ? 1 : 0);
