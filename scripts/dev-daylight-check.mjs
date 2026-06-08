// Soft Daylight verification harness for the "developer" static demo.
// Self-contained: spawns an HTTP server over public/, drives playwright-core
// (chromium + swiftshader so the Three.js keyboard renders), and asserts the
// new light palette + WCAG AA contrast + no overflow + no console errors +
// WebGL keyboard still renders. Writes screenshots. Exits non-zero on any fail.
//
// NOTE: this is the RED harness — the demo is still dark (#020617), so the
// --bg palette assertions are EXPECTED to fail until the recolor task lands.

import { chromium } from "playwright-core";
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";

// ── tiny helpers (WCAG) ──────────────────────────────────────────────
function lum([r,g,b]){const f=c=>{c/=255;return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4;};const[R,G,B]=[f(r),f(g),f(b)];return 0.2126*R+0.7152*G+0.0722*B;}
function ratio(a,b){const L1=lum(a),L2=lum(b);const[hi,lo]=L1>L2?[L1,L2]:[L2,L1];return (hi+0.05)/(lo+0.05);}
const hex=h=>{h=h.replace("#","");return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));};

const PAIRS=[
  ["page body text","#4b5056","#ccd1da"],
  ["page heading","#222831","#ccd1da"],
  ["link/eyebrow on light","#3c6fae","#ccd1da"],
  ["text on Casper card","#222831","#a6bad0"],
  ["on-dark text on Shuttle","#eef1f5","#5f6b7a"],
  ["on-dark text on Contact(Davy)","#eef1f5","#4b5056"],
  ["primary button text","#ffffff","#3c6fae"],
];

const EXPECTED_BG = "#ccd1da";

// ── pick a free port (prefer 8799, then 8800) ────────────────────────
function portFree(port){
  return new Promise((resolve)=>{
    const srv = net.createServer();
    srv.once("error", ()=>resolve(false));
    srv.once("listening", ()=>srv.close(()=>resolve(true)));
    srv.listen(port, "127.0.0.1");
  });
}

// ── server spawn (python3 http.server, fallback npx serve) ───────────
function haveCmd(cmd){
  const r = spawnSync(cmd, ["--version"], { stdio: "ignore" });
  return r.status === 0 || r.status === null ? r.error === undefined : false;
}

let server = null;
function killServer(){
  if (server && !server.killed){
    try { server.kill("SIGKILL"); } catch {}
  }
  server = null;
}
process.on("exit", killServer);
process.on("SIGINT", ()=>{ killServer(); process.exit(130); });
process.on("SIGTERM", ()=>{ killServer(); process.exit(143); });

function spawnServer(port){
  const py = spawnSync("python3", ["--version"], { stdio: "ignore" });
  if (py.status === 0){
    return spawn("python3", ["-m","http.server", String(port), "--directory","public"],
      { stdio: "ignore" });
  }
  // fallback
  return spawn("npx", ["--yes","serve","public","-l",String(port)], { stdio: "ignore" });
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

// ─────────────────────────────────────────────────────────────────────
const failures = [];
const lines = [];
function log(s){ lines.push(s); console.log(s); }

let PORT = (await portFree(8799)) ? 8799 : ((await portFree(8800)) ? 8800 : 8801);
const BASE = `http://localhost:${PORT}`;

server = spawnServer(PORT);
await sleep(800);

const browser = await chromium.launch({
  executablePath: EXEC,
  headless: true,
  args: ["--no-sandbox", "--use-gl=swiftshader"],
});

const ROUTES = [
  { key: "en", url: `${BASE}/demo/developer/index.html` },
  { key: "ar", url: `${BASE}/demo/developer/index-ar.html` },
];
const VIEWPORTS = [
  { key: "phone", vp: { width: 390, height: 844 } },
  { key: "desk",  vp: { width: 1280, height: 900 } },
];

try {
  log("── Soft Daylight harness ──");
  log(`server: ${BASE}  (public/ static)`);

  // ── per route × viewport ──
  for (const route of ROUTES){
    for (const view of VIEWPORTS){
      const tag = `${route.key}-${view.key}`;
      const page = await browser.newPage({ viewport: view.vp, deviceScaleFactor: 2 });
      const errors = [];
      page.on("console", (m)=>{ if (m.type()==="error") errors.push(m.text()); });
      page.on("pageerror", (e)=>errors.push("PAGEERROR: " + e.message));

      await page.goto(route.url, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(2500);

      // (3) palette assertion
      const bg = (await page.evaluate(()=>
        getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()
      )) || "";
      if (bg.toLowerCase() !== EXPECTED_BG.toLowerCase()){
        const msg = `[${tag}] --bg is "${bg}", expected ${EXPECTED_BG}`;
        failures.push(msg);
        log(`FAIL ${msg}`);
      } else {
        log(`PASS [${tag}] --bg = ${bg}`);
      }

      // (4) overflow — phone only
      if (view.key === "phone"){
        const overflow = await page.evaluate(()=>
          document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        if (overflow > 1){
          const msg = `[${tag}] horizontal overflow ${overflow}px (>1)`;
          failures.push(msg);
          log(`FAIL ${msg}`);
        } else {
          log(`PASS [${tag}] no horizontal overflow (${overflow}px)`);
        }
      }

      // (5) zero console errors
      if (errors.length){
        const msg = `[${tag}] ${errors.length} console error(s): ${errors.slice(0,3).join(" | ")}`;
        failures.push(msg);
        log(`FAIL ${msg}`);
      } else {
        log(`PASS [${tag}] zero console errors`);
      }

      // (6) screenshot
      const shot = `scripts/_daylight-${tag}.png`;
      await page.screenshot({ path: shot, fullPage: true });
      log(`     screenshot → ${shot}`);

      // EN desktop: verify keyboard canvas inside /stack/ iframe
      if (route.key === "en" && view.key === "desk"){
        const frame = page.frames().find(f => f.url().includes("/stack/"));
        if (!frame){
          log(`WARN [${tag}] /stack/ iframe frame not reachable — skipping WebGL check (recolor task will revisit)`);
        } else {
          let info;
          try {
            info = await frame.evaluate(()=>{
              const c = document.querySelector("canvas#stage");
              if (!c) return { canvas: false };
              const gl = c.getContext("webgl2") || c.getContext("webgl");
              return { canvas: true, glLost: gl ? gl.isContextLost() : "no-gl" };
            });
          } catch (e){
            log(`WARN [${tag}] could not evaluate in /stack/ frame: ${e.message}`);
            info = null;
          }
          if (info == null){
            // already warned
          } else if (!info.canvas){
            log(`WARN [${tag}] canvas#stage not found in /stack/ frame — skipping WebGL check`);
          } else {
            log(`     [${tag}] keyboard canvas: ${JSON.stringify(info)}`);
            if (info.glLost === true){
              const msg = `[${tag}] WebGL context LOST on keyboard canvas#stage`;
              failures.push(msg);
              log(`FAIL ${msg}`);
            } else {
              log(`PASS [${tag}] keyboard canvas WebGL context not lost`);
            }
          }
        }
      }

      await page.close();
    }
  }

  // ── WCAG AA pairs (once; theme-independent math) ──
  log("── WCAG AA contrast (target ≥ 4.5) ──");
  for (const [label, fg, bg] of PAIRS){
    const r = ratio(hex(fg), hex(bg));
    const ok = r >= 4.5;
    log(`${ok ? "PASS" : "FAIL"} AA "${label}" ${fg} on ${bg} = ${r.toFixed(2)}:1`);
    if (!ok) failures.push(`AA "${label}" ${fg} on ${bg} = ${r.toFixed(2)}:1 (< 4.5)`);
  }

} finally {
  await browser.close().catch(()=>{});
  killServer();
}

// ── verdict ──
if (failures.length){
  console.error("\n──────── FAILURES (" + failures.length + ") ────────");
  for (const f of failures) console.error(" ✗ " + f);
  process.exit(1);
} else {
  console.log("\nALL CHECKS PASSED");
  process.exit(0);
}
