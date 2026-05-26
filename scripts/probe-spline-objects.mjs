// Enumerate the Spline scene graph + variables (runtime Application is sv._spline).
import { chromium } from "playwright-core";
const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";
const URL = process.env.URL || "https://portfolio-trimind.com/demo/developer";

const browser = await chromium.launch({ executablePath: EXEC, headless: true, args: ["--no-sandbox", "--use-gl=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(11000);

const info = await page.evaluate(() => {
  const sv = document.querySelector("spline-viewer");
  const app = sv && sv._spline;
  if (!app) return { app: false };
  const out = { app: true, methods: [], variables: null, objectNames: [], probe: {} };
  out.methods = Object.getOwnPropertyNames(Object.getPrototypeOf(app)).filter((m) => typeof app[m] === "function");
  try { out.variables = app.getVariables ? app.getVariables() : null; } catch (e) { out.variables = "err:" + e.message; }
  const names = new Set();
  function walk(o, d) {
    if (!o || d > 8) return;
    if (o.name) names.add(o.name);
    const kids = o.children || (o.object3D && o.object3D.children) || null;
    if (Array.isArray(kids)) kids.forEach((k) => walk(k, d + 1));
  }
  try {
    const root = app._scene || app.scene || (app._runtime && app._runtime._scene) || null;
    if (root) walk(root, 0);
    if (!names.size && app.getAllObjects) app.getAllObjects().forEach((o) => o.name && names.add(o.name));
  } catch (e) { out.walkErr = e.message; }
  ["keyboard", "Keyboard", "kbd", "keycaps", "Keycaps", "Group", "js", "react", "ts", "docker", "node", "spacebar", "Spacebar"].forEach((n) => {
    try { out.probe[n] = !!(app.findObjectByName && app.findObjectByName(n)); } catch (e) { out.probe[n] = "err"; }
  });
  out.objectNames = Array.from(names).slice(0, 150);
  return out;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
