// Phase 6 verification harness for the "developer" demo Orb Journey.
// Asserts the progressive-enhancement contract across three device states:
//   1. NORMAL (motion allowed, capable GPU) → live WebGL orb paints, <html>.orb-live set,
//      #orb-fallback hidden, #orb-stage canvas has a non-lost WebGL context, three.min.js loaded.
//   2. REDUCED-MOTION → NO .orb-live, #orb-fallback VISIBLE & sized, three.min.js NOT requested.
//   3. LOW-END (hardwareConcurrency/deviceMemory = 2) → same as reduced: fallback visible, no 3D download.
// Plus: zero console errors and no horizontal overflow everywhere. EN + AR.
// Self-contained: serves public/ and drives playwright-core (chromium + swiftshader). Exit non-zero on fail.

import { chromium } from "playwright-core";
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";

function portFree(port){
  return new Promise((resolve)=>{
    const srv = net.createServer();
    srv.once("error", ()=>resolve(false));
    srv.once("listening", ()=>srv.close(()=>resolve(true)));
    srv.listen(port, "127.0.0.1");
  });
}
let server = null;
function killServer(){ if (server && !server.killed){ try { server.kill("SIGKILL"); } catch {} } server = null; }
process.on("exit", killServer);
process.on("SIGINT", ()=>{ killServer(); process.exit(130); });
process.on("SIGTERM", ()=>{ killServer(); process.exit(143); });
function spawnServer(port){
  const py = spawnSync("python3", ["--version"], { stdio: "ignore" });
  if (py.status === 0) return spawn("python3", ["-m","http.server", String(port), "--directory","public"], { stdio: "ignore" });
  return spawn("npx", ["--yes","serve","public","-l",String(port)], { stdio: "ignore" });
}
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

const failures = [];
function log(s){ console.log(s); }
function pass(m){ log("PASS " + m); }
function fail(m){ failures.push(m); log("FAIL " + m); }

let PORT = (await portFree(8799)) ? 8799 : ((await portFree(8800)) ? 8800 : 8801);
const BASE = `http://localhost:${PORT}`;
server = spawnServer(PORT);
await sleep(800);

const browser = await chromium.launch({
  executablePath: EXEC, headless: true,
  args: ["--no-sandbox", "--use-gl=swiftshader"],
});

const ROUTES = [
  { key: "en", url: `${BASE}/demo/developer/index.html` },
  { key: "ar", url: `${BASE}/demo/developer/index-ar.html` },
];
// mode: "normal" expects the live orb; "reduce"/"lowend" expect the static fallback
const MODES = [
  { key: "normal", expectLive: true,  vp: { width: 1280, height: 900 }, reduce: false, lowEnd: false },
  { key: "reduce", expectLive: false, vp: { width: 1280, height: 900 }, reduce: true,  lowEnd: false },
  { key: "lowend", expectLive: false, vp: { width: 390,  height: 844 }, reduce: false, lowEnd: true  },
];

try {
  log("── Orb Journey · Phase 6 harness ──");
  log(`server: ${BASE}  (public/ static)`);

  for (const route of ROUTES){
    for (const mode of MODES){
      const tag = `${route.key}-${mode.key}`;
      const ctx = await browser.newContext({
        viewport: mode.vp, deviceScaleFactor: 2,
        reducedMotion: mode.reduce ? "reduce" : "no-preference",
      });
      const page = await ctx.newPage();

      if (mode.lowEnd){
        await page.addInitScript(()=>{
          try { Object.defineProperty(navigator, "hardwareConcurrency", { get: ()=>2, configurable: true }); } catch {}
          try { Object.defineProperty(navigator, "deviceMemory", { get: ()=>2, configurable: true }); } catch {}
        });
      }

      const errors = [];
      // orb.js is injected ONLY by the gated orb loader → unambiguous "3D orb pipeline triggered" signal.
      // (three.min.js is a poor signal: the keyboard /stack/ iframe loads its own copy regardless.)
      let orbJsRequested = false;
      page.on("console", (m)=>{ if (m.type()==="error") errors.push(m.text()); });
      page.on("pageerror", (e)=>errors.push("PAGEERROR: " + e.message));
      page.on("request", (r)=>{ if (r.url().includes("/orb.js")) orbJsRequested = true; });

      await page.goto(route.url, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(3200); // allow lazy inject + first WebGL frame (or confirm it never comes)

      // ── core state probe ──
      const state = await page.evaluate(()=>{
        const html = document.documentElement;
        const fb = document.getElementById("orb-fallback");
        const fbStyle = fb ? getComputedStyle(fb) : null;
        const fbBox = fb ? fb.getBoundingClientRect() : null;
        const canvas = document.getElementById("orb-stage");
        let gl = null, glLost = "no-canvas";
        if (canvas){
          try { gl = canvas.getContext("webgl2") || canvas.getContext("webgl"); } catch {}
          glLost = gl ? gl.isContextLost() : "no-gl";
        }
        return {
          orbLive: html.classList.contains("orb-live"),
          fbExists: !!fb,
          fbDisplay: fbStyle ? fbStyle.display : null,
          fbW: fbBox ? Math.round(fbBox.width) : 0,
          fbH: fbBox ? Math.round(fbBox.height) : 0,
          glLost,
        };
      });

      if (!state.fbExists){ fail(`[${tag}] #orb-fallback element missing from DOM`); }

      if (mode.expectLive){
        // NORMAL: live orb must have taken over
        if (state.orbLive) pass(`[${tag}] live orb active (.orb-live set)`);
        else fail(`[${tag}] expected live orb but .orb-live was NOT set`);

        if (state.fbDisplay === "none") pass(`[${tag}] static fallback hidden behind live orb`);
        else fail(`[${tag}] fallback should be display:none when live; got "${state.fbDisplay}"`);

        if (state.glLost === false) pass(`[${tag}] #orb-stage WebGL context healthy`);
        else fail(`[${tag}] #orb-stage WebGL context state = ${state.glLost}`);

        if (orbJsRequested) pass(`[${tag}] orb.js injected (3D pipeline enabled)`);
        else fail(`[${tag}] orb.js was never requested on a capable device`);
      } else {
        // REDUCE / LOW-END: static fallback must be the (only) orb, no 3D download
        if (!state.orbLive) pass(`[${tag}] live orb correctly NOT engaged`);
        else fail(`[${tag}] .orb-live should be absent in ${mode.key} mode`);

        const visible = state.fbDisplay && state.fbDisplay !== "none" && state.fbW > 40 && state.fbH > 40;
        if (visible) pass(`[${tag}] static fallback orb visible & sized (${state.fbW}×${state.fbH})`);
        else fail(`[${tag}] static fallback not visible/sized (display=${state.fbDisplay}, ${state.fbW}×${state.fbH})`);

        // roughly circular (fallback is a sphere)
        if (state.fbW > 40 && Math.abs(state.fbW - state.fbH) <= 2) pass(`[${tag}] fallback orb is circular`);
        else if (state.fbW > 40) fail(`[${tag}] fallback orb not square/circular (${state.fbW}×${state.fbH})`);

        if (!orbJsRequested) pass(`[${tag}] orb.js NOT injected (perf: 3D pipeline skipped)`);
        else fail(`[${tag}] orb.js was injected in ${mode.key} mode (should be skipped)`);
      }

      // ── overflow (phone viewport only) ──
      if (mode.vp.width <= 430){
        const overflow = await page.evaluate(()=>document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 1) fail(`[${tag}] horizontal overflow ${overflow}px`);
        else pass(`[${tag}] no horizontal overflow (${overflow}px)`);
      }

      // ── zero console errors ──
      if (errors.length) fail(`[${tag}] ${errors.length} console error(s): ${errors.slice(0,3).join(" | ")}`);
      else pass(`[${tag}] zero console errors`);

      const shot = `scripts/_orb6-${tag}.png`;
      await page.screenshot({ path: shot, fullPage: false });
      log(`     screenshot → ${shot}`);

      await ctx.close();
    }
  }
} finally {
  await browser.close().catch(()=>{});
  killServer();
}

if (failures.length){
  console.error("\n──────── FAILURES (" + failures.length + ") ────────");
  for (const f of failures) console.error(" ✗ " + f);
  process.exit(1);
} else {
  console.log("\nALL CHECKS PASSED");
  process.exit(0);
}
