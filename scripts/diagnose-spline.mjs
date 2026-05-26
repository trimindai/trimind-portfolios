// Verify the keyboard fix in a real browser — NATURAL state (no forced styles).
// Confirms #scene becomes visible on its own, the keyboard frames per section,
// and reports canvas presence. Screenshots hero + skills.
import { chromium } from "playwright-core";

const EXEC = process.env.CHROME || "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";
const URL = process.env.URL || "http://localhost:8799/demo/developer/index.html";

const browser = await chromium.launch({ executablePath: EXEC, headless: true, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`.slice(0, 160)));
page.on("pageerror", (e) => logs.push(`[pageerror] ${String(e).slice(0, 160)}`));

await page.goto(URL, { waitUntil: "load", timeout: 60000 });

// sanity: did the real page load (not a 404)?
const title = await page.title();
if (!/Maya Okafor|—/.test(title)) console.log("WARNING: unexpected title:", JSON.stringify(title));

await page.waitForTimeout(13000); // allow runtime + keyboard discovery (poll up to 15s)

const hero = await page.evaluate(() => {
  const h = document.getElementById("scene");
  const sv = document.querySelector("spline-viewer");
  const canvas = sv && (sv.shadowRoot?.querySelector("canvas") || sv.querySelector("canvas"));
  return {
    title: document.title,
    sceneReady: h && h.classList.contains("ready"),
    sceneOpacity: h && getComputedStyle(h).opacity,   // should be ~1 with NO forcing
    splineViewer: !!sv,
    canvas: !!canvas,
    canvasSize: canvas ? `${canvas.width}x${canvas.height}` : null,
    activeSection: document.body.getAttribute("data-active"),
    kbdHookInstalled: typeof window.__setKbdSection === "function",
  };
});
console.log("=== HERO (natural) ===", JSON.stringify(hero, null, 2));
await page.screenshot({ path: "scripts/diag-hero.png" });

await page.evaluate(() => { const s = document.getElementById("skills"); if (s) s.scrollIntoView({ block: "center" }); });
await page.waitForTimeout(3000);
const sk = await page.evaluate(() => ({ active: document.body.getAttribute("data-active"), opacity: getComputedStyle(document.getElementById("scene")).opacity }));
console.log("=== SKILLS (natural) ===", JSON.stringify(sk));
await page.screenshot({ path: "scripts/diag-skills.png" });

console.log("=== console (last 6) ===\n" + logs.slice(-6).join("\n"));
await browser.close();
