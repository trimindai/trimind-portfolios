// Socket Journey + Naresh-scroll verification harness (developer demo).
// Serves public/, drives playwright-core + swiftshader, EN+AR × phone+desktop.
// Phases add checks; run: node scripts/socket-journey-check.mjs
import { chromium } from "playwright-core";
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";

const EXEC = "/home/trimind/.cache/ms-playwright/chromium-1169/chrome-linux/chrome";
function portFree(p){return new Promise(r=>{const s=net.createServer();s.once("error",()=>r(false));s.once("listening",()=>s.close(()=>r(true)));s.listen(p,"127.0.0.1");});}
let server=null;
function killServer(){ if(server&&!server.killed){ try{server.kill("SIGKILL");}catch{} } server=null; }
process.on("exit",killServer); process.on("SIGINT",()=>{killServer();process.exit(130);}); process.on("SIGTERM",()=>{killServer();process.exit(143);});
function spawnServer(p){ const py=spawnSync("python3",["--version"],{stdio:"ignore"}); if(py.status===0) return spawn("python3",["-m","http.server",String(p),"--directory","public"],{stdio:"ignore"}); return spawn("npx",["--yes","serve","public","-l",String(p)],{stdio:"ignore"}); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const failures=[]; const pass=m=>console.log("PASS "+m); const fail=m=>{failures.push(m);console.log("FAIL "+m);};

let PORT=(await portFree(8799))?8799:((await portFree(8800))?8800:8801);
const BASE=`http://localhost:${PORT}`;
server=spawnServer(PORT); await sleep(800);
const browser=await chromium.launch({executablePath:EXEC,headless:true,args:["--no-sandbox","--use-gl=swiftshader"]});

const ROUTES=[{key:"en",file:"index.html"},{key:"ar",file:"index-ar.html"}];
const VIEWS=[{key:"phone",vp:{width:390,height:844}},{key:"desk",vp:{width:1280,height:900}}];

async function withPage(route,view,opts,fn){
  const ctx=await browser.newContext({viewport:view.vp,deviceScaleFactor:2,reducedMotion:"no-preference",...(opts||{})});
  const page=await ctx.newPage(); const errors=[];
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  page.on("pageerror",e=>errors.push("PE:"+e.message));
  await page.goto(`${BASE}/demo/developer/${route.file}`,{waitUntil:"load",timeout:60000});
  await page.waitForTimeout(3000);
  await fn(page,errors,`${route.key}-${view.key}`);
  await ctx.close();
}

try {
  console.log("── Socket Journey harness ──", BASE);
  for (const route of ROUTES) for (const view of VIEWS) {
    await withPage(route,view,null,async(page,errors,tag)=>{
      // PHASE CHECKS APPENDED BELOW (Tasks add blocks here)
      // T1.1: education section removed
      const secCount = await page.evaluate(()=>document.querySelectorAll("section[id]").length);
      const hasExtras = await page.evaluate(()=>!!document.getElementById("extras"));
      if (hasExtras) fail(`[${tag}] #extras section still present`);
      else pass(`[${tag}] education section removed`);
      if (secCount===5) pass(`[${tag}] exactly 5 sections`);
      else fail(`[${tag}] expected 5 sections, found ${secCount}`);
      // T1.2: scroll reaches the bottom (not trapped)
      await page.evaluate(()=>{ const h=document.documentElement; window.scrollTo(0,h.scrollHeight); });
      await page.waitForTimeout(1200);
      const reachedBottom = await page.evaluate(()=>{ const h=document.documentElement; return (h.scrollHeight - (window.scrollY + h.clientHeight)) < 80; });
      if (reachedBottom) pass(`[${tag}] scroll reaches contact (not trapped)`);
      else fail(`[${tag}] could not scroll to bottom`);
      await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(400);
      // T1.3: interactivity preserved under the overlay
      const navClickable = await page.evaluate(()=>{ const a=document.querySelector('nav a'); if(!a) return false; return getComputedStyle(a).pointerEvents!=="none"; });
      if (navClickable) pass(`[${tag}] nav links remain clickable under overlay`);
      else fail(`[${tag}] nav lost pointer-events`);
      // T1.4: centred section reaches near full opacity (motion mode)
      const op = await page.evaluate(async()=>{ const s=document.getElementById("experience"); s.scrollIntoView({block:"center"}); await new Promise(r=>setTimeout(r,500)); return parseFloat(getComputedStyle(s).opacity); });
      if (op>0.85) pass(`[${tag}] centred section near full opacity (${op.toFixed(2)})`);
      else fail(`[${tag}] centred section opacity too low (${op.toFixed(2)})`);
      await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(400);
      if (errors.length) fail(`[${tag}] ${errors.length} console error(s): ${errors.slice(0,3).join(" | ")}`);
      else pass(`[${tag}] zero console errors`);
      try { await page.screenshot({path:`scripts/_sj-${tag}.png`,fullPage:false,timeout:8000,animations:"disabled"}); }
      catch(e){ console.log(`note: screenshot skipped for ${tag} (${e.name})`); }
    });
  }
} finally { await browser.close().catch(()=>{}); killServer(); }

if (failures.length){ console.error("\n──── FAILURES ("+failures.length+") ────"); failures.forEach(f=>console.error(" ✗ "+f)); process.exit(1); }
else { console.log("\nALL CHECKS PASSED"); process.exit(0); }
