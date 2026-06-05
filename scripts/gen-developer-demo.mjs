// Regenerate public/demo/developer/index.html from src/templates/developer/template.hbs
// Self-contained: registers the same Handlebars helpers the live engine uses
// (mirrors src/lib/template-engine.ts) so the demo matches production output.
//   node scripts/gen-developer-demo.mjs
import Handlebars from "handlebars";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ── helpers (mirror of template-engine.ts) ─────────────────── */
Handlebars.registerHelper("isHidden", function (sectionId) {
  const hidden = (this.customization && this.customization.hiddenSections) || [];
  return hidden.includes(sectionId);
});
Handlebars.registerHelper("or", function (...args) { args.pop(); return args.some(Boolean); });
Handlebars.registerHelper("ifEq", function (a, b, options) { return a === b ? options.fn(this) : options.inverse(this); });
Handlebars.registerHelper("initials", function (name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
});
Handlebars.registerHelper("safeUrl", function (value) {
  if (value == null) return "";
  let raw = "";
  for (const ch of String(value).trim()) {
    const code = ch.charCodeAt(0);
    if (code <= 0x20 || code === 0x7f) continue;
    raw += ch;
  }
  if (!raw) return "";
  const scheme = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    if (s !== "http" && s !== "https" && s !== "mailto" && s !== "tel") return "#";
  }
  return raw;
});
Handlebars.registerHelper("safeColor", function (value, fallback) {
  const fb = typeof fallback === "string" ? fallback : "";
  if (value == null) return fb;
  const v = String(value).trim();
  const ok =
    /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) ||
    /^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\)$/.test(v) ||
    /^[a-zA-Z]{3,20}$/.test(v);
  return ok ? v : fb;
});
Handlebars.registerHelper("cycle", function (...args) {
  args.pop();
  const index = Number(args.shift()) || 0;
  if (!args.length) return "";
  return args[((index % args.length) + args.length) % args.length];
});
Handlebars.registerHelper("flattenSkills", function (skills) {
  if (!Array.isArray(skills)) return [];
  const out = [];
  skills.forEach((cat, catIndex) => {
    const category = typeof cat?.category === "string" ? cat.category : "";
    const items = Array.isArray(cat?.items) ? cat.items : [];
    if (!items.length) { if (category) out.push({ name: category, category, catIndex, description: "" }); return; }
    items.forEach((it) => {
      const name = typeof it === "string" ? it : String(it?.name ?? it ?? "");
      const description = typeof it === "object" && it ? String(it.description ?? it.desc ?? "") : "";
      if (name.trim()) out.push({ name: name.trim(), category, catIndex, description: description.trim() });
    });
  });
  return out;
});
Handlebars.registerHelper("kbdBody", function (value) {
  const s = typeof value === "string" ? value.toLowerCase().trim() : "";
  if (s === "white" || s === "light") return "kbd-light";
  if (s === "gray" || s === "grey") return "kbd-gray";
  return "";
});
const TECH_ICONS = {
  react: "fab fa-react", reactjs: "fab fa-react", reactnative: "fab fa-react",
  javascript: "fab fa-js", js: "fab fa-js",
  nodejs: "fab fa-node-js", node: "fab fa-node-js", express: "fab fa-node-js",
  python: "fab fa-python", django: "fab fa-python", flask: "fab fa-python",
  java: "fab fa-java", spring: "fab fa-java", springboot: "fab fa-java",
  html: "fab fa-html5", html5: "fab fa-html5",
  css: "fab fa-css3-alt", css3: "fab fa-css3-alt",
  sass: "fab fa-sass", scss: "fab fa-sass",
  php: "fab fa-php", laravel: "fab fa-laravel",
  vue: "fab fa-vuejs", vuejs: "fab fa-vuejs",
  angular: "fab fa-angular", angularjs: "fab fa-angular",
  aws: "fab fa-aws", amazonwebservices: "fab fa-aws",
  docker: "fab fa-docker", kubernetes: "fas fa-dharmachakra", k8s: "fas fa-dharmachakra",
  git: "fab fa-git-alt", github: "fab fa-github", gitlab: "fab fa-gitlab", bitbucket: "fab fa-bitbucket",
  linux: "fab fa-linux", ubuntu: "fab fa-ubuntu", windows: "fab fa-windows",
  apple: "fab fa-apple", ios: "fab fa-apple", macos: "fab fa-apple",
  android: "fab fa-android", swift: "fab fa-swift", rust: "fab fa-rust",
  wordpress: "fab fa-wordpress", bootstrap: "fab fa-bootstrap",
  npm: "fab fa-npm", yarn: "fab fa-yarn", figma: "fab fa-figma", sketch: "fab fa-sketch",
  slack: "fab fa-slack", jira: "fab fa-jira", trello: "fab fa-trello", confluence: "fab fa-confluence",
  unity: "fab fa-unity", stripe: "fab fa-stripe", cloudflare: "fab fa-cloudflare",
  digitalocean: "fab fa-digital-ocean", raspberrypi: "fab fa-raspberry-pi", jenkins: "fab fa-jenkins",
  sql: "fas fa-database", mysql: "fas fa-database", postgresql: "fas fa-database",
  postgres: "fas fa-database", mongodb: "fas fa-database", database: "fas fa-database",
  redis: "fas fa-database", sqlite: "fas fa-database", oracle: "fas fa-database",
  cloud: "fas fa-cloud", azure: "fas fa-cloud", gcp: "fas fa-cloud", googlecloud: "fas fa-cloud",
  security: "fas fa-shield-halved", cybersecurity: "fas fa-shield-halved", infosec: "fas fa-shield-halved",
  api: "fas fa-plug", rest: "fas fa-plug", graphql: "fas fa-diagram-project",
  mobile: "fas fa-mobile-screen", flutter: "fas fa-mobile-screen",
  ai: "fas fa-robot", ml: "fas fa-robot", machinelearning: "fas fa-robot",
  tensorflow: "fas fa-robot", pytorch: "fas fa-robot", deeplearning: "fas fa-robot",
  data: "fas fa-chart-line", analytics: "fas fa-chart-line", datascience: "fas fa-chart-line",
  terraform: "fas fa-server", ansible: "fas fa-server", devops: "fas fa-infinity",
  networking: "fas fa-network-wired", network: "fas fa-network-wired",
};
const normalizeTech = (name) => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
Handlebars.registerHelper("techIcon", (name) => TECH_ICONS[normalizeTech(name)] || "");
const TECH_ABBR = {
  typescript: "TS", javascript: "JS", kubernetes: "K8s", graphql: "GQL",
  postgresql: "PG", postgres: "PG", nextjs: "Next", nodejs: "Node",
  tailwind: "TW", tailwindcss: "TW", mongodb: "Mongo", express: "Ex",
  expressjs: "Ex", terraform: "TF", cplusplus: "C++", csharp: "C#",
  dotnet: ".NET", objectivec: "Obj-C",
};
Handlebars.registerHelper("kbAbbr", function (name) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const norm = normalizeTech(raw);
  if (TECH_ABBR[norm]) return TECH_ABBR[norm];
  const words = raw.split(/[\s/.\-_]+/).filter(Boolean);
  if (words.length > 1) return words.slice(0, 3).map((w) => w[0].toUpperCase()).join("");
  const w = words[0] || raw;
  return w.length <= 5 ? w : w.slice(0, 4);
});
function httpUrlOrEmpty(value) { if (value == null) return ""; const v = String(value).trim(); return /^https?:\/\//i.test(v) ? v : ""; }
function pruneEmpty(node) {
  if (Array.isArray(node)) { const arr = node.map(pruneEmpty).filter((x) => x !== undefined); return arr.length ? arr : undefined; }
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, val] of Object.entries(node)) { const c = pruneEmpty(val); if (c !== undefined) out[k] = c; }
    return Object.keys(out).length ? out : undefined;
  }
  if (node === "" || node === null) return undefined;
  return node;
}
function ldScript(obj) {
  const cleaned = pruneEmpty(obj) || {};
  const json = JSON.stringify(cleaned).replace(/</g, "\\u003c");
  return new Handlebars.SafeString(`<script type="application/ld+json">${json}</script>`);
}
Handlebars.registerHelper("personJsonLd", function (basics, portfolioUrl) {
  const b = basics || {};
  const sameAs = [b.instagram, b.linkedin, b.github, b.website].map(httpUrlOrEmpty).filter(Boolean);
  return ldScript({
    "@context": "https://schema.org", "@type": "Person",
    name: b.fullName, jobTitle: b.title, description: b.subtitle || b.bio,
    url: httpUrlOrEmpty(portfolioUrl), image: httpUrlOrEmpty(b.photoUrl), email: b.email,
    address: b.location ? { "@type": "PostalAddress", addressLocality: b.location } : undefined,
    sameAs,
  });
});
Handlebars.registerHelper("faviconLink", function (fullName, accentColor, bgColor) {
  const colorOk = (v, fb) => {
    const s = String(v ?? "").trim();
    const ok =
      /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s) ||
      /^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\)$/.test(s) ||
      /^[a-zA-Z]{3,20}$/.test(s);
    return ok ? s : fb;
  };
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const c = parts.length > 1 ? parts[parts.length - 1][0] : "";
  const initials = (a + c).toUpperCase().replace(/[^A-Z0-9]/g, "") || "·";
  const bg = colorOk(bgColor, "#020617");
  const accent = colorOk(accentColor, "#7C5CFF");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="10" fill="${bg}"/>` +
    `<text x="32" y="34" font-family="Archivo Black,Arial,sans-serif" font-size="28" ` +
    `font-weight="800" letter-spacing="-1" fill="${accent}" ` +
    `text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return new Handlebars.SafeString(`<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`);
});

/* ── demo persona: Wadhah Almutairi (from his CV) ───────────── */
// Demo persona: Maya Okafor's full profile, with the keyboard's Tech Stack
// populated from Wadhah Almutairi's skills array (per request — no other
// Wadhah personal info is used).
const data = {
  locale: "en",
  isRTL: false,
  portfolioUrl: "https://portfolio-trimind.com/demo/developer",
  templateId: "developer",
  basics: {
    fullName: "Maya Okafor",
    title: "Full-Stack Engineer",
    subtitle: "Creative Technologist",
    valueProposition:
      "I build fast, interactive web products — from real-time systems to 3D interfaces — and care about the millimetre of polish that makes software feel alive.",
    location: "Lisbon, Portugal",
    email: "maya@okafor.dev",
    phone: "+351 900 000 000",
    website: "https://okafor.dev",
    linkedin: "https://www.linkedin.com/in/example",
    github: "https://github.com/",
    instagram: "https://www.instagram.com/",
    resumeUrl: "https://okafor.dev/resume.pdf",
  },
  metrics: [
    { value: "6+", label: "Years shipping" },
    { value: "40+", label: "Projects delivered" },
    { value: "1.2M", label: "Users reached" },
  ],
  // Tech Stack keyboard — Wadhah Almutairi's skills (per request).
  // Each item carries a custom description shown in the keyboard's info panel.
  skills: [
    {
      category: "Cybersecurity",
      items: [
        { name: "Penetration Testing", description: "Simulating real attacks to find and prove exploitable weaknesses before adversaries do." },
        { name: "Vulnerability Assessment", description: "Systematically scanning systems and ranking findings by severity and business risk." },
        { name: "Active Directory", description: "Securing and administering Windows domain identity, users, and group policy." },
        { name: "GPO Hardening", description: "Locking down endpoints and servers through Group Policy security baselines." },
        { name: "Incident Response", description: "Detecting, containing, and recovering from security incidents with clear post-mortems." },
        { name: "IIS", description: "Configuring and hardening Microsoft's web server for safe production hosting." },
        { name: "DNS", description: "Managing name resolution and defending against DNS-based attacks and misconfig." },
      ],
    },
    {
      category: "Security Platforms",
      items: [
        { name: "Trend Micro Vision One", description: "XDR platform unifying endpoint, network, and server telemetry for detection & response." },
        { name: "Elastic Stack", description: "Elasticsearch + Kibana for centralized log search, dashboards, and threat hunting." },
        { name: "SIEM", description: "Aggregating and correlating security events to surface threats in real time." },
        { name: "Winlogbeat", description: "Shipping Windows event logs into the Elastic Stack for monitoring and alerting." },
      ],
    },
    { category: "DevOps", items: [
      { name: "Docker", description: "Containerizing tools and labs for isolated, repeatable security testing." },
    ] },
    { category: "Programming", items: [
      { name: "Python", description: "Automating assessments, parsing data, and building security tooling." },
      { name: "PowerShell", description: "Scripting Windows administration, hardening, and incident-response tasks." },
      { name: "Java", description: "Building cross-platform application logic and tooling." },
      { name: "C", description: "Low-level programming for understanding memory, exploits, and systems." },
    ] },
    { category: "AI & Data", items: [
      { name: "Machine Learning", description: "Training models on custom datasets for classification and detection." },
      { name: "NLP", description: "Processing natural language for chatbots and text understanding." },
      { name: "Pandas", description: "Wrangling and analyzing structured data in Python pipelines." },
    ] },
    { category: "Web", items: [
      { name: "HTML", description: "Structuring accessible, semantic web content." },
      { name: "CSS", description: "Styling responsive, polished interfaces." },
    ] },
  ],
  experience: [
    {
      title: "Senior Full-Stack Engineer",
      company: "Nebula Labs",
      startDate: "Jan 2024",
      endDate: "",
      description: "Lead engineer on a real-time collaboration product used by design teams.",
      highlights: [
        "Architected an async job pipeline processing 1k+ AI tasks/day with at-least-once delivery.",
        "Cut p95 page load by 47% by moving to streaming SSR and an edge cache layer.",
        "Mentored four engineers and introduced trunk-based delivery with preview environments.",
      ],
    },
    {
      title: "Full-Stack Developer",
      company: "Orbit Studio",
      startDate: "Jun 2021",
      endDate: "Dec 2023",
      description: "Built interactive marketing sites and internal tooling for an agency.",
      highlights: [
        "Shipped 20+ client sites with WebGL hero scenes and 95+ Lighthouse scores.",
        "Built a headless CMS that cut content turnaround from days to minutes.",
      ],
    },
    {
      title: "Frontend Engineer",
      company: "Pixel & Co.",
      startDate: "Aug 2019",
      endDate: "May 2021",
      description: "First engineering hire on a small product team.",
      highlights: ["Owned the design system and component library from scratch."],
    },
  ],
  projects: [
    {
      title: "Aurora",
      tagline: "Real-time collab",
      description:
        "A multiplayer canvas where teams sketch, comment, and present together. Sub-100ms cursor sync over WebSockets with conflict-free merges.",
      technologies: ["Next.js", "WebSockets", "Postgres", "Redis"],
      metrics: [
        { value: "<100ms", label: "Cursor sync" },
        { value: "99.95%", label: "Uptime" },
      ],
      link: "https://okafor.dev",
      links: [{ kind: "repo", label: "Source", url: "https://github.com/" }],
    },
    {
      title: "Stargazer",
      tagline: "3D / WebGL",
      description:
        "An interactive 3D star map that renders 100k+ points at 60fps in the browser using instanced geometry and a custom shader.",
      technologies: ["Three.js", "TypeScript", "GLSL"],
      metrics: [{ value: "100k+", label: "Points @ 60fps" }],
      link: "https://okafor.dev",
    },
    {
      title: "Switchboard",
      tagline: "Developer tool",
      description:
        "A feature-flag and config dashboard with typed SDKs, audit logs, and instant rollbacks. Used internally across a dozen services.",
      technologies: ["React", "Node.js", "GraphQL"],
      links: [{ kind: "demo", label: "Read more", url: "https://okafor.dev" }],
    },
    {
      title: "Quietbox",
      tagline: "Side project",
      description:
        "A distraction-free writing app with local-first sync, full-text search, and a focus timer. Open source.",
      technologies: ["Svelte", "SQLite", "Rust"],
      link: "https://github.com/",
    },
  ],
  education: [
    { degree: "BSc Computer Science", institution: "University of Porto", year: "2019" },
  ],
  certifications: [
    { name: "AWS Solutions Architect – Associate", issuer: "Amazon Web Services", year: "2023" },
    { name: "Professional Cloud Developer", issuer: "Google Cloud", year: "2022" },
  ],
  customization: {},
};

const tplPath = resolve(ROOT, "src/templates/developer/template.hbs");
const outPath = resolve(ROOT, "public/demo/developer/index.html");
const src = readFileSync(tplPath, "utf8");
const tpl = Handlebars.compile(src);
const html = tpl(data);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html, "utf8");
console.log(`OK: rendered ${html.length} bytes → public/demo/developer/index.html`);
console.log(`sections present: ${["#hero", "#skills", "#experience", "#projects", "#contact"].filter((s) => html.includes(`id="${s.slice(1)}"`)).join(", ")}`);
console.log(`spline-viewer ref: ${html.includes("spline-viewer") ? "yes" : "no"} | keyboard url: ${html.includes("skills-keyboard.spline") ? "yes" : "no"}`);
