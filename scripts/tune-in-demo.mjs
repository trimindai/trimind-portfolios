// Tune the hero keyboard pose IN THE REAL DEMO (the only faithful camera
// context). An injected rAF loop forces the keyboard to each candidate,
// out-writing the template's lerp, then screenshots. Result transfers 1:1.
import { chromium } from "playwright-core";
const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";
const URL = process.env.URL || "http://localhost:8799/demo/developer/index.html";
const browser = await chromium.launch({ executablePath: EXEC, headless: true, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "load", timeout: 60000 });
// wait until the keyboard object is resolvable
await page.waitForFunction(() => { const sv = document.querySelector("spline-viewer"); return sv && sv._spline && sv._spline.findObjectByName && sv._spline.findObjectByName("keyboard"); }, { timeout: 30000 });
await page.waitForTimeout(2500);

// install a forcing loop that always wins the frame
await page.evaluate(() => {
  const k = document.querySelector("spline-viewer")._spline.findObjectByName("keyboard");
  window.__force = null;
  (function f(){ const p = window.__force; if (p && k){ k.scale.x=k.scale.y=k.scale.z=p.s; k.position.x=p.x; k.position.y=p.y; k.rotation.x=p.rx||0; k.rotation.y=p.ry||0; k.rotation.z=p.rz||0; } requestAnimationFrame(f); })();
});

const CANDS = {
  T1: { s: 0.23, x: 430, y: -30 },
  T2: { s: 0.24, x: 460, y: -55 },
  T3: { s: 0.22, x: 410, y: -10 },
  T4: { s: 0.25, x: 470, y: -70 },
};
for (const [name, p] of Object.entries(CANDS)) {
  await page.evaluate((pp) => { window.__force = pp; }, p);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `scripts/demo-${name}.png` });
  console.log(`demo-${name}.png  ${JSON.stringify(p)}`);
}
await browser.close();
