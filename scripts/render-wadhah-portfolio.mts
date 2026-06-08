// Build Wadhah Almutairi's LIVE developer portfolio by CLONING the polished
// demo (public/demo/developer/index.html — the correct design) and swapping in
// her real content. The keyboard.js is INLINED with her own skills + "WA" badge
// so her page is fully self-contained (served from Convex) and needs NO Vercel
// deploy and NO edit to the shared demo files. All vendor/stack/three assets are
// referenced by absolute /demo/developer/... paths that are already live + CSP-safe.
//
// Writes /tmp/wadhah-portfolio.html + /tmp/wadhah-publish.json.
// Run: npx tsx scripts/render-wadhah-portfolio.mts

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEMO = resolve(ROOT, "public/demo/developer");

let html = readFileSync(resolve(DEMO, "index.html"), "utf8");

/** Replace `from` with `to`, throwing if `from` isn't found verbatim. */
function rep(label: string, from: string, to: string) {
  if (!html.includes(from)) throw new Error(`REPLACE FAILED [${label}]: anchor not found`);
  html = html.replace(from, to);
}
function repAll(from: string, to: string) {
  html = html.split(from).join(to);
}

/* ── inline keyboard.js with Wadhah's skills + WA trackball badge ── */
let kbd = readFileSync(resolve(DEMO, "keyboard.js"), "utf8");
// Wadhah's FULL technical stack (her Technical Skills section) — the keyboard
// scales (4 rows x ceil(n/4) cols). Deep, true-shade palette grouped by domain:
// offense = reds/orange, network = teal/cyan, identity = blue/indigo,
// SIEM = cyan, AI = violet, dev = blue/slate. python+docker get real logos.
const WADHAH_SKILLS = `var SKILLS = [
    /* Offensive Security */
    { slug: null,     label: "Pentest",      tag: "find what attackers would",      color: "#b91c1c" },
    { slug: null,     label: "Vuln Assess",  tag: "rank risk by severity",          color: "#c2410c" },
    { slug: null,     label: "OWASP ZAP",    tag: "automated web scans",            color: "#ea580c" },
    { slug: null,     label: "Nuclei",       tag: "templated vuln scanning",        color: "#dc2626" },
    { slug: null,     label: "Nikto",        tag: "web server scanning",            color: "#9a3412" },
    { slug: null,     label: "sqlmap",       tag: "SQL injection testing",          color: "#0f172a" },
    { slug: null,     label: "Kali Linux",   tag: "the pentester's toolkit",        color: "#1e293b" },
    { slug: null,     label: "Burp Suite",   tag: "web pentest proxy",              color: "#b45309" },
    /* Network & Perimeter */
    { slug: null,     label: "FortiClient",  tag: "managed endpoint security",      color: "#0d9488" },
    { slug: null,     label: "FortiGate",    tag: "next-gen firewall",              color: "#0f766e" },
    { slug: null,     label: "NetScaler",    tag: "app delivery + WAF",             color: "#0e7490" },
    { slug: null,     label: "VPN",          tag: "secure remote access",           color: "#155e75" },
    { slug: null,     label: "Firewall",     tag: "perimeter rule design",          color: "#0891b2" },
    { slug: null,     label: "IPv6",         tag: "modern addressing",              color: "#0369a1" },
    /* Identity & Access */
    { slug: null,     label: "Active Dir",   tag: "Windows identity",               color: "#1d4ed8" },
    { slug: null,     label: "GPO",          tag: "endpoint hardening",             color: "#1e40af" },
    { slug: null,     label: "WDAC",         tag: "app control / allowlisting",     color: "#3730a3" },
    { slug: null,     label: "MECM",         tag: "endpoint config management",     color: "#4338ca" },
    { slug: null,     label: "Machine Certs",tag: "certificate-based trust",        color: "#4f46e5" },
    { slug: null,     label: "AD Deleg",     tag: "least-privilege admin",          color: "#6d28d9" },
    /* SIEM / EDR */
    { slug: null,     label: "Vision One",   tag: "XDR detect & respond",           color: "#be185d" },
    { slug: null,     label: "Winlogbeat",   tag: "ship Windows logs",              color: "#0e7490" },
    { slug: null,     label: "Triage",       tag: "prioritize what matters",        color: "#0891b2" },
    { slug: null,     label: "Log Corr",     tag: "connect the dots",               color: "#0f766e" },
    { slug: null,     label: "Threat Intel", tag: "understand the adversary",       color: "#155e75" },
    /* AI & Security */
    { slug: null,     label: "Ollama/vLLM",  tag: "on-prem LLM serving",            color: "#7c3aed" },
    { slug: null,     label: "Llama 3",      tag: "open-weight models",             color: "#8b5cf6" },
    { slug: null,     label: "AI Threats",   tag: "LLM-assisted detection",         color: "#a855f7" },
    { slug: null,     label: "Sec Automation",tag: "scripts that defend",           color: "#9333ea" },
    /* Dev & Tooling */
    { slug: "python", label: "Python",       tag: "automation + tooling",           color: "#2563eb" },
    { slug: null,     label: "PowerShell",   tag: "Windows automation",             color: "#1e40af" },
    { slug: null,     label: "Bash",         tag: "shell + servers",                color: "#1f2937" },
    { slug: "docker", label: "Docker",       tag: "isolated labs",                  color: "#2496ed" },
    { slug: null,     label: "Scripting",    tag: "glue + custom tooling",          color: "#334155" }
  ];`;
// swap the default SKILLS array (from `var SKILLS = [` to its first `];`)
kbd = kbd.replace(/var SKILLS = \[[\s\S]*?\n  \];/, WADHAH_SKILLS);
if (!kbd.includes('label: "Pentest"')) throw new Error("KBD SKILLS swap failed");
kbd = kbd.replace('mCtx.fillText("Maya", 128, 128);', 'mCtx.fillText("WA", 128, 128);');
if (kbd.includes('fillText("Maya"')) throw new Error("KBD badge swap failed");

/* ── HEAD ── */
rep("title",
  "<title>Maya Okafor — Full-Stack Engineer</title>",
  "<title>Wadhah Almutairi — Cybersecurity Professional & Computer Engineer</title>");
rep("meta-desc",
  'content="I build fast, interactive web products — from real-time systems to 3D interfaces — and care about the millimetre of polish that makes software feel alive.">',
  'content="Cybersecurity professional and computer engineer — lead security assessor for Kuwait News Agency (KUNA). Offensive security, enterprise hardening, and AI-driven security tooling.">');
rep("favicon", "%3EMO%3C", "%3EWA%3C");
rep("jsonld",
  '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Maya Okafor","jobTitle":"Full-Stack Engineer","description":"Creative Technologist","url":"https://portfolio-trimind.com/demo/developer","email":"maya@okafor.dev","address":{"@type":"PostalAddress","addressLocality":"Lisbon, Portugal"},"sameAs":["https://www.instagram.com/","https://www.linkedin.com/in/example","https://github.com/","https://okafor.dev"]}</script>',
  '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Wadhah Almutairi","jobTitle":"Cybersecurity Professional & Computer Engineer","description":"Lead Security Assessor — Kuwait News Agency (KUNA)","url":"https://portfolio-trimind.com/p/wadhah-almutairi","email":"w.baazm@gmail.com","address":{"@type":"PostalAddress","addressLocality":"Kuwait City, Kuwait"}}</script>');

/* ── HERO ── */
rep("hero-role",
  '<div class="role blur-in" data-delay="160">Full-Stack Engineer · Creative Technologist</div>',
  '<div class="role blur-in" data-delay="160">Cybersecurity Professional &amp; Computer Engineer · Lead Security Assessor (KUNA)</div>');
rep("hero-pitch",
  '<p class="pitch blur-in" data-delay="220">I build fast, interactive web products — from real-time systems to 3D interfaces — and care about the millimetre of polish that makes software feel alive.</p>',
  '<p class="pitch blur-in" data-delay="220">I secure the digital footprint of one of the Arab world\'s largest news agencies — from offensive penetration testing through enterprise hardening to on-premise AI that keeps sensitive data in-house.</p>');
rep("hero-cta",
  `<div class="cta blur-in" data-delay="300">
        <a class="btn primary" href="https://okafor.dev/resume.pdf" target="_blank" rel="noopener"><i class="fa-regular fa-file"></i> Resume</a>
        <a class="btn" href="#contact"><i class="fa-solid fa-paper-plane"></i> Get in touch</a>
        <a class="btn icon" href="https://github.com/" target="_blank" rel="noopener" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>
        <a class="btn icon" href="https://www.linkedin.com/in/example" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
        <a class="btn icon" href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
        <a class="btn icon" href="https://okafor.dev" target="_blank" rel="noopener" aria-label="Website"><i class="fa-solid fa-globe"></i></a>
      </div>`,
  `<div class="cta blur-in" data-delay="300">
        <a class="btn primary" href="#contact"><i class="fa-solid fa-paper-plane"></i> Get in touch</a>
        <a class="btn" href="mailto:w.baazm@gmail.com"><i class="fa-solid fa-envelope"></i> Email me</a>
      </div>`);
rep("hero-metrics",
  '<div><b style="font-family:var(--font-display);font-size:1.7rem">6+</b><div style="color:var(--muted);font-size:.78rem">Years shipping</div></div><div><b style="font-family:var(--font-display);font-size:1.7rem">40+</b><div style="color:var(--muted);font-size:.78rem">Projects delivered</div></div><div><b style="font-family:var(--font-display);font-size:1.7rem">1.2M</b><div style="color:var(--muted);font-size:.78rem">Users reached</div></div>',
  '<div><b style="font-family:var(--font-display);font-size:1.7rem">KUNA</b><div style="color:var(--muted);font-size:.78rem">Lead security assessor</div></div><div><b style="font-family:var(--font-display);font-size:1.7rem">CEH</b><div style="color:var(--muted);font-size:.78rem">Certified Ethical Hacker</div></div><div><b style="font-family:var(--font-display);font-size:1.7rem">2024</b><div style="color:var(--muted);font-size:.78rem">Securing KUNA since</div></div>');

/* ── EXPERIENCE (replace whole section) ── */
html = html.replace(/<section id="experience"[\s\S]*?<\/section>/, `<section id="experience" data-reveal>
  <div class="wrap">
    <div class="sec-head sticky-head">
      <div class="eyebrow">Experience</div>
      <h2>Experience</h2>
    </div>
    <div class="timeline">
      <div class="tl-item box-reveal">
        <div class="tl-card">
          <div class="tl-head">
            <div>
              <h3>Cybersecurity Professional</h3>
              <div class="co">Kuwait News Agency (KUNA)</div>
            </div>
            <div class="tl-date">2024 — Present</div>
          </div>
          <div class="desc">Lead security assessor for KUNA's entire digital footprint — the public website (kuna.net.kw) and all internal enterprise systems; responsible for scoping, executing, and reporting on all security assessments organization-wide.</div>
          <ul>
            <li>Designed and executed full authorized penetration tests using Nuclei, Nikto, OWASP ZAP, sqlmap, and custom Python tooling on Kali Linux — producing confirmed findings with actionable remediation reports.</li>
            <li>Led a high-stakes three-party security dispute (KUNA / vendor MESC / assessor BroadBITS) across 5 contested findings — building Python verification scripts and evidence-backed reports that won a favorable resolution for KUNA.</li>
            <li>Administered Active Directory, Group Policy, and OU-level access; implemented DC delegation without Domain Admin to cut privileged-account exposure.</li>
            <li>Operated Trend Micro Vision One SIEM/EDR — brute-force pattern analysis, alert triage, and Winlogbeat log correlation across the endpoint fleet.</li>
            <li>Designed a FortiClient EMS device-restriction architecture (AD + MECM + machine certificates) as a triple-factor VPN access gate.</li>
            <li>Authored KUNA-IT-SEC-001 Security Guidelines and the AI Acceptable Use Policy; architected on-premise LLM deployment (Llama 3 / Mistral via Ollama / vLLM) to eliminate third-party AI data-exposure risk.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>`);
if (!html.includes("Kuwait News Agency (KUNA)")) throw new Error("experience swap failed");

/* ── PROJECTS + MODALS (replace projects section through just before contact) ── */
const projects = [
  { t: "Trend Micro Vision One (XDR) Onboarding", ph: "T", cat: "XDR onboarding", desc: "Integrated KUNA assets into a unified XDR platform for end-to-end threat visibility and automated response across endpoint, network, and server telemetry.", tech: ["Trend Micro Vision One", "XDR", "EDR", "Incident Response"] },
  { t: "Logging Automation — Elastic Stack", ph: "L", cat: "SIEM automation", desc: "Built Python automation that extracts Elasticsearch logs into structured local databases via Winlogbeat pipelines — turning raw event streams into queryable, audit-ready records.", tech: ["Elasticsearch", "Winlogbeat", "Python", "SIEM"] },
  { t: "Wake-on-LAN Enterprise Deployment", ph: "W", cat: "Infrastructure", desc: "Engineered Wake-on-LAN across multi-VLAN environments to enable remote patching and update operations on the enterprise endpoint fleet.", tech: ["Networking", "Multi-VLAN", "Endpoint Mgmt"] },
  { t: "Security Reporting & Vulnerability Automation", ph: "S", cat: "Automation", desc: "Built structured CEH-style penetration-test reports and automated repetitive documentation, accelerating turnaround from finding to actionable remediation.", tech: ["Python", "Pentest Reporting", "Automation"] },
  { t: "AI-Powered Chatbot", ph: "A", cat: "NLP · senior project", desc: "Built a multilingual NLP chatbot end-to-end: designed the data pipeline, UI, and datasets, and deployed it as a functional system for students.", tech: ["NLP", "Machine Learning", "Python"] },
];
const esc = (s: string) => s.replace(/&/g, "&amp;");
const projGrid = projects.map((p, i) =>
  `      <div class="proj box-reveal" data-proj="${i}" role="button" tabindex="0" aria-label="${esc(p.t)}">
        <div class="ph">${p.ph}</div>
        <div class="open"><i class="fa-solid fa-arrow-up-right-from-square"></i></div>
        <div class="cap">
          <h3>${esc(p.t)}</h3>
          <span class="tag">${esc(p.cat)}</span>
        </div>
      </div>`).join("\n");
const projModals = projects.map((p, i) =>
  `<div class="modal" id="modal-${i}" role="dialog" aria-modal="true" aria-label="${esc(p.t)}">
  <div class="scrim" data-close></div>
  <div class="panel">
    <button class="close" data-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    <h3>${esc(p.t)}</h3>
    <div class="m-cat">${esc(p.cat)}</div>
    <p>${esc(p.desc)}</p>
    <div class="badges">
      ${p.tech.map((t) => `<span class="badge">${esc(t)}</span>`).join("")}
    </div>
  </div>
</div>`).join("\n");
html = html.replace(/<section id="projects"[\s\S]*?(?=<section id="contact")/, `<section id="projects" data-reveal>
  <div class="wrap">
    <div class="sec-head sticky-head">
      <div class="eyebrow">Projects</div>
      <h2>Projects</h2>
      <p>Click any project to dive into the details.</p>
    </div>
    <div class="proj-grid">
${projGrid}
    </div>
  </div>
</section>

${projModals}

`);
if (!html.includes('id="modal-4"')) throw new Error("projects swap failed");

/* ── CONTACT LIST (email + location only) ── */
rep("contact-list",
  `<div class="contact-list box-reveal" data-delay="120">
      <a href="mailto:maya@okafor.dev"><i class="fa-solid fa-envelope"></i><div><b>Email</b>maya@okafor.dev</div></a>
      <a href="https://www.linkedin.com/in/example" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin-in"></i><div><b>LinkedIn</b>Let's connect</div></a>
      <a href="https://github.com/" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i><div><b>GitHub</b>See the code</div></a>
      <a href="tel:+351 900 000 000"><i class="fa-solid fa-phone"></i><div><b>Phone</b>+351 900 000 000</div></a>
      <a><i class="fa-solid fa-location-dot"></i><div><b>Location</b>Lisbon, Portugal</div></a>
    </div>`,
  `<div class="contact-list box-reveal" data-delay="120">
      <a href="mailto:w.baazm@gmail.com"><i class="fa-solid fa-envelope"></i><div><b>Email</b>w.baazm@gmail.com</div></a>
      <a><i class="fa-solid fa-location-dot"></i><div><b>Location</b>Kuwait City, Kuwait</div></a>
    </div>`);

/* ── FOOTER ── */
rep("footer-meta", "Maya Okafor · Full-Stack Engineer", "Wadhah Almutairi · Cybersecurity Professional");
rep("footer-socials",
  `<div class="socials">
      <a href="https://github.com/" target="_blank" rel="noopener" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>
      <a href="https://www.linkedin.com/in/example" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
      <a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
      <a href="mailto:maya@okafor.dev" aria-label="Email"><i class="fa-solid fa-envelope"></i></a>
    </div>`,
  `<div class="socials">
      <a href="mailto:w.baazm@gmail.com" aria-label="Email"><i class="fa-solid fa-envelope"></i></a>
    </div>`);

/* ── INLINE the keyboard (it's injected dynamically via k.src) ── */
const kbdLiteral = JSON.stringify(kbd).replace(/<\/(script)/gi, "<\\/$1");
rep("kbd-inject",
  'var k=document.createElement("script"); k.src="/demo/developer/keyboard.js"; document.body.appendChild(k);',
  `var k=document.createElement("script"); k.textContent=${kbdLiteral}; document.body.appendChild(k);`);

/* ── global stragglers ── */
repAll("maya@okafor.dev", "w.baazm@gmail.com");
repAll("Maya Okafor", "Wadhah Almutairi");

// Hero: keep the demo's dark blue-gray gradient name (that IS the "dark blue gray"
// the user wants), but shrink it so her longer name fits the 440px text column and
// no longer overflows/overlaps the 3D keyboard on the right.
rep("hero-name-fit", "</head>",
  '<style>#hero h1{font-size:clamp(2.2rem,6vw,4.6rem)!important;line-height:.96!important}@media(min-width:900px){#hero .grid{max-width:520px}}</style></head>');

writeFileSync("/tmp/wadhah-portfolio.html", html);
writeFileSync("/tmp/wadhah-publish.json", JSON.stringify({ generatedHtml: html }));

const leftover = (html.match(/Maya|okafor|Lisbon|Nebula|Orbit|Pixel|Aurora|Stargazer|Switchboard|Quietbox/gi) || []).length;
console.log(`rendered: portfolio ${html.length}b → /tmp/wadhah-portfolio.html`);
console.log(`leftover demo-persona refs (should be 0): ${leftover}`);
console.log(`phone on page (should be 0): ${(html.match(/99252378|\+351/g) || []).length}`);
