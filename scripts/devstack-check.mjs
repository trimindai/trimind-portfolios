import { chromium } from "playwright-core";

const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";
const BASE = "http://localhost:8799";
const b = await chromium.launch({ executablePath: EXEC, headless: true, args: ["--no-sandbox", "--use-gl=swiftshader"] });

async function shot(url, file, vp, waitMs = 6000, extra = null) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
  const errors = [];
  p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  p.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  await p.goto(url, { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(waitMs);
  if (extra) await extra(p);
  // canvas non-blank check (stack page only)
  const canvasInfo = await p.evaluate(() => {
    const c = document.querySelector("canvas#stage");
    if (!c) return { canvas: false };
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return { canvas: true, w: c.width, h: c.height, glLost: gl ? gl.isContextLost() : "no-gl" };
  });
  await p.screenshot({ path: file, fullPage: false });
  await p.close();
  return { url, file, errors, canvasInfo };
}

const out = [];
out.push(await shot(`${BASE}/demo/developer/stack/`, "scripts/_stack-desktop.png", { width: 1440, height: 900 }, 7000));
out.push(await shot(`${BASE}/demo/developer/stack/`, "scripts/_stack-phone.png", { width: 390, height: 844 }, 7000));
// full developer demo: hero + skills(iframe) region
out.push(await shot(`${BASE}/demo/developer/index.html`, "scripts/_dev-hero.png", { width: 1440, height: 900 }, 4000));
out.push(await shot(`${BASE}/demo/developer/index.html`, "scripts/_dev-phone-hero.png", { width: 390, height: 844 }, 4000));
// scroll the full demo to the skills section and shoot
out.push(await shot(`${BASE}/demo/developer/index.html`, "scripts/_dev-skills.png", { width: 1440, height: 900 }, 5000, async (p) => {
  await p.evaluate(() => { const s = document.getElementById("skills"); if (s) s.scrollIntoView(); });
  await p.waitForTimeout(4000);
}));

console.log(JSON.stringify(out, null, 2));
await b.close();
