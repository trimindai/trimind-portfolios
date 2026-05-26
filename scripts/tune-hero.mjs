// Try candidate hero keyboard poses and screenshot each, so we can match the
// original's hero framing (large keyboard floating right). Compare to orig-hero.png.
import { chromium } from "playwright-core";
const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: EXEC, headless: true, args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:8799/demo/developer/_tune.html", { waitUntil: "load", timeout: 60000 });
await page.waitForFunction("window.__ready === true", { timeout: 30000 });
await page.waitForTimeout(1500);

const P = Math.PI;
const CANDS = {
  N: { s: 0.24, x: 300, y: 40, rx: 0, ry: 0, rz: 0 }, // replicate demo (validate harness)
  O: { s: 0.22, x: 430, y: 30, rx: 0, ry: 0, rz: 0 },
  P: { s: 0.20, x: 520, y: 20, rx: 0, ry: 0, rz: 0 },
  Q: { s: 0.21, x: 470, y: 25, rx: 0, ry: 0, rz: 0 },
  R: { s: 0.19, x: 580, y: 10, rx: 0, ry: 0, rz: 0 },
};
for (const [name, p] of Object.entries(CANDS)) {
  const ok = await page.evaluate((pp) => window.__setPose(pp), p);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `scripts/tune-${name}.png` });
  console.log(`tune-${name}.png  applied=${ok}  ${JSON.stringify(p)}`);
}
await browser.close();
