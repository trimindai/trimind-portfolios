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
      // T1.5: headings sticky + no phone overflow
      if (view.key==="phone"){
        const ov = await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
        if (ov>1) fail(`[${tag}] horizontal overflow ${ov}px`); else pass(`[${tag}] no overflow`);
      }
      const sticky = await page.evaluate(()=>{ const h=document.querySelector("#projects .sticky-head"); return h?getComputedStyle(h).position:""; });
      if (sticky==="sticky") pass(`[${tag}] section headings sticky`);
      else fail(`[${tag}] heading not sticky (${sticky})`);
      // T1.6: fonts applied
      const fonts = await page.evaluate(()=>{ const h1=document.querySelector("#hero h1"); return { display: h1?getComputedStyle(h1).fontFamily:"", body:getComputedStyle(document.body).fontFamily }; });
      if (/Archivo/i.test(fonts.display)) pass(`[${tag}] hero display = Archivo Black`);
      else fail(`[${tag}] hero display font is "${fonts.display}"`);
      // T2.2: keyboard mounted as background, iframe gone, scroll free
      const kbd = await page.evaluate(()=>{ const c=document.getElementById("kbd-stage"); const gl=c&&(c.getContext("webgl2")||c.getContext("webgl")); return { exists:!!c, live:document.documentElement.classList.contains("kbd-live"), glLost: gl?gl.isContextLost():"no-gl" }; });
      if (kbd.exists) pass(`[${tag}] #kbd-stage present`); else fail(`[${tag}] #kbd-stage missing`);
      const noIframe = await page.evaluate(()=>!document.querySelector(".stack-frame"));
      if (noIframe) pass(`[${tag}] inline keyboard iframe removed`); else fail(`[${tag}] iframe still present`);
      const moved = await page.evaluate(async()=>{ window.scrollTo(0,600); await new Promise(r=>setTimeout(r,400)); return window.scrollY>300; });
      if (moved) pass(`[${tag}] page scrolls with keyboard as background`); else fail(`[${tag}] scroll blocked`);
      await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(300);
      if (view.key==="desk"){
        if (kbd.live) pass(`[${tag}] keyboard live`); else fail(`[${tag}] keyboard not live`);
        if (kbd.glLost===false) pass(`[${tag}] keyboard GL healthy`); else fail(`[${tag}] keyboard GL ${kbd.glLost}`);
      }
      // R2: keyboard repositions per section (hero/contact floated to a side, skills centred)
      if (view.key==="desk"){
        const pos = await page.evaluate(async()=>{
          if(!window.__kbd || !window.__kbd.getPosFrac) return null;
          async function at(id){ document.getElementById(id).scrollIntoView({block:"center"}); await new Promise(r=>setTimeout(r,1100)); return window.__kbd.getPosFrac(); }
          const hero=await at("hero"), skills=await at("skills"), contact=await at("contact");
          return {hero,skills,contact};
        });
        if(!pos){ fail(`[${tag}] __kbd.getPosFrac missing`); }
        else if (route.key==="en"){
          if(pos.hero>0.15) pass(`[${tag}] hero keyboard floated right (${pos.hero.toFixed(2)})`); else fail(`[${tag}] hero keyboard not right (${pos.hero.toFixed(2)})`);
          if(Math.abs(pos.skills)<0.15) pass(`[${tag}] skills keyboard centred (${pos.skills.toFixed(2)})`); else fail(`[${tag}] skills keyboard not centred (${pos.skills.toFixed(2)})`);
          if(pos.contact>0.15) pass(`[${tag}] contact keyboard floated right (${pos.contact.toFixed(2)})`); else fail(`[${tag}] contact keyboard not right (${pos.contact.toFixed(2)})`);
        } else { // AR mirrored
          if(pos.hero<-0.15) pass(`[${tag}] AR hero keyboard floated left (${pos.hero.toFixed(2)})`); else fail(`[${tag}] AR hero keyboard not left (${pos.hero.toFixed(2)})`);
          if(Math.abs(pos.skills)<0.15) pass(`[${tag}] AR skills keyboard centred (${pos.skills.toFixed(2)})`); else fail(`[${tag}] AR skills keyboard not centred (${pos.skills.toFixed(2)})`);
          if(pos.contact<-0.15) pass(`[${tag}] AR contact keyboard floated left (${pos.contact.toFixed(2)})`); else fail(`[${tag}] AR contact keyboard not left (${pos.contact.toFixed(2)})`);
        }
        await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(500);
      }
      // T2.3: drag rotates the keyboard, without leaking into page scroll
      if (view.key==="desk"){
        const rot = await page.evaluate(async()=>{
          if(!window.__kbd) return null;
          // keyboard is centred at the skills section; scroll there so the centre-drag hits the board
          document.getElementById("skills").scrollIntoView({block:"center"}); await new Promise(r=>setTimeout(r,1100));
          const sy0=window.scrollY;
          const r0=window.__kbd.getRotation();
          // drag horizontally across the centred keyboard, using viewport centre.
          const cx=window.innerWidth*0.5, cy=window.innerHeight*0.5;
          function pe(t,x){ window.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:cy,bubbles:true,pointerId:1,isPrimary:true,pointerType:"mouse"})); }
          pe("pointerdown",cx);
          for(let i=1;i<=10;i++){ pe("pointermove",cx+i*14); }
          pe("pointerup",cx+140);
          await new Promise(r=>setTimeout(r,300));
          return { before:r0, after:window.__kbd.getRotation(), scrollDelta:Math.abs(window.scrollY-sy0) };
        });
        if (rot && Math.abs(rot.after-rot.before)>0.001) pass(`[${tag}] drag rotates keyboard (Δ=${rot?(rot.after-rot.before).toFixed(3):'?'})`);
        else fail(`[${tag}] drag did not rotate keyboard (${JSON.stringify(rot)})`);
        if (rot && rot.scrollDelta<5) pass(`[${tag}] drag did not scroll page`);
        else fail(`[${tag}] drag leaked into scroll (scrollDelta=${rot?rot.scrollDelta:'?'})`);
        await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(400);
      }
      // T3.3: mute toggles shared sound flag
      const mute = await page.evaluate(()=>{ const b=document.getElementById("mute"); if(!b) return null; const before=window.__demoSound; b.click(); const after=window.__demoSound; b.click(); return {before,after}; });
      if (mute && mute.before!==mute.after) pass(`[${tag}] mute button toggles sound`);
      else fail(`[${tag}] mute button missing/not toggling`);
      if (errors.length) fail(`[${tag}] ${errors.length} console error(s): ${errors.slice(0,3).join(" | ")}`);
      else pass(`[${tag}] zero console errors`);
      try { await page.screenshot({path:`scripts/_sj-${tag}.png`,fullPage:false,timeout:8000,animations:"disabled"}); }
      catch(e){ console.log(`note: screenshot skipped for ${tag} (${e.name})`); }
    });
  }

  // T2.4: reduced-motion → static keyboard fallback visible, no live keyboard
  for (const route of ROUTES){
    await withPage(route,{key:"desk",vp:{width:1280,height:900}},{reducedMotion:"reduce"},async(page,errors,tag0)=>{
      const tag=tag0+"-rm";
      const st=await page.evaluate(()=>({
        live: document.documentElement.classList.contains("kbd-live"),
        fb: (()=>{ const f=document.getElementById("kbd-fallback"); return f?getComputedStyle(f).display:"none"; })()
      }));
      if(!st.live) pass(`[${tag}] keyboard not live (reduced-motion)`); else fail(`[${tag}] kbd-live set under reduced-motion`);
      if(st.fb!=="none") pass(`[${tag}] keyboard fallback visible`); else fail(`[${tag}] keyboard fallback hidden (${st.fb})`);
      if(errors.length) fail(`[${tag}] ${errors.length} console error(s): ${errors.slice(0,3).join(" | ")}`); else pass(`[${tag}] zero console errors`);
    });
  }

  // T4.2: low-end → neither 3D script injected; both fallbacks visible
  for (const route of ROUTES){
    const ctx=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:2});
    const page=await ctx.newPage(); const errors=[];
    let kbdJs=false;
    page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
    page.on("pageerror",e=>errors.push("PE:"+e.message));
    page.on("request",r=>{ const u=r.url(); if(u.includes("/keyboard.js"))kbdJs=true; });
    await page.addInitScript(()=>{ try{Object.defineProperty(navigator,"hardwareConcurrency",{get:()=>2,configurable:true});}catch{} try{Object.defineProperty(navigator,"deviceMemory",{get:()=>2,configurable:true});}catch{} });
    await page.goto(`${BASE}/demo/developer/${route.file}`,{waitUntil:"load",timeout:60000});
    await page.waitForTimeout(3000);
    const tag=route.key+"-lowend";
    const st=await page.evaluate(()=>({ kbdFb:(()=>{const f=document.getElementById("kbd-fallback");return f?getComputedStyle(f).display:"none";})() }));
    if(!kbdJs) pass(`[${tag}] keyboard.js NOT injected`); else fail(`[${tag}] keyboard.js injected on low-end`);
    if(st.kbdFb!=="none") pass(`[${tag}] keyboard fallback visible`); else fail(`[${tag}] keyboard fallback hidden`);
    if(errors.length) fail(`[${tag}] ${errors.length} console errors: ${errors.slice(0,3).join(" | ")}`); else pass(`[${tag}] zero console errors`);
    await ctx.close();
  }
} finally { await browser.close().catch(()=>{}); killServer(); }

if (failures.length){ console.error("\n──── FAILURES ("+failures.length+") ────"); failures.forEach(f=>console.error(" ✗ "+f)); process.exit(1); }
else { console.log("\nALL CHECKS PASSED"); process.exit(0); }
