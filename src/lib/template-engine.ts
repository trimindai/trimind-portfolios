import Handlebars from "handlebars";
import generalTemplateSource from "@/templates/general/template.hbs";
import engineerTemplateSource from "@/templates/engineer/template.hbs";
import engineerProjectDetailSource from "@/templates/engineer/project-detail.hbs";
import creativeTemplateSource from "@/templates/creative/template.hbs";
import creativeProjectDetailSource from "@/templates/creative/project-detail.hbs";
import creatorTemplateSource from "@/templates/creator/template.hbs";
import developerTemplateSource from "@/templates/developer/template.hbs";
import cvTemplateSource from "@/templates/_cv/cv.hbs";

export interface PortfolioData {
  basics: {
    fullName: string;
    title: string;
    subtitle?: string;
    bio?: string;
    summary?: string;
    valueProposition?: string;
    location?: string;
    nationality?: string;
    visaStatus?: string;
    email: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    photoUrl?: string;
    resumeUrl?: string;
    languages?: Array<{ name: string; level?: string }>;
  };
  brands?: Array<{ name: string; logoUrl?: string }>;
  metrics?: Array<{ value: string; label: string }>;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
    highlights?: string[];
  }>;
  skills?: Array<{ category: string; items: string[] }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    metrics?: Array<{ value: string; label: string }>;
    link?: string;
    isFeatured?: boolean;
    // Detail-page fields — set `slug` to enable /p/<portfolio>/projects/<slug>
    slug?: string;
    tagline?: string;
    coverUrl?: string;
    meta?: {
      type?: string;
      year?: string;
      courseCode?: string;
      institution?: string;
      teamSize?: number;
      role?: string;
      duration?: string;
    };
    blocks?: Array<{
      kind: "paragraph" | "image" | "imageGrid" | "video" | "specs" | "standards" | "challenge";
      body?: string;
      caption?: string;
      url?: string;
      fullBleed?: boolean;
      images?: Array<{ url: string; caption?: string }>;
      items?: Array<{ label: string; value: string }>;
      problem?: string;
      solution?: string;
    }>;
    links?: Array<{
      kind: "report" | "repo" | "demo" | "paper" | "video" | "external";
      label: string;
      url: string;
    }>;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }>;
  certifications?: Array<{ name: string; issuer: string; year?: string }>;
  languages?: Array<{ name: string; level: string }>;
  endorsements?: Array<{
    quote: string;
    name: string;
    title: string;
    company: string;
  }>;
  references?: Array<{ name: string; title?: string; contact?: string }>;
  professionalAffiliations?: Array<{ name: string; role?: string }>;
  continuousDevelopment?: Array<{
    name: string;
    provider?: string;
    year?: string;
  }>;
  customization?: {
    primaryColor?: string;
    accentColor?: string;
    bgColor?: string;
    fontFamily?: string;
    hiddenSections?: string[];
    // Developer template: chassis colour of the 3D skills keyboard.
    // "black" (default) | "white" | "gray". Drives the kbdBody helper.
    keyboardBody?: string;
    // Developer template: text shown on the 3D keyboard's trackball badge.
    // Falls back to the first name, then "you" (see trackballBadgeValue).
    trackballLabel?: string;
    // Deprecated: the Spline keyboard was replaced by the self-contained
    // CSS-3D keyboard. Retained only for backward compatibility; unused.
    skillsSplineUrl?: string;
  };
  templateId?: string;
  locale: string;
  isRTL: boolean;
  portfolioUrl: string;
}

// Register Handlebars helpers
Handlebars.registerHelper(
  "isHidden",
  function (this: Record<string, any>, sectionId: string) {
    const customization = this.customization as
      | { hiddenSections?: string[] }
      | undefined;
    const hidden = customization?.hiddenSections || [];
    return hidden.includes(sectionId);
  }
);

Handlebars.registerHelper(
  "ifEq",
  function (this: any, a: any, b: any, options: Handlebars.HelperOptions) {
    return a === b ? options.fn(this) : options.inverse(this);
  }
);

Handlebars.registerHelper("or", function (this: any, ...args: any[]) {
  args.pop(); // last arg is Handlebars options
  return args.some(Boolean);
});

Handlebars.registerHelper("gt", function (a: number, b: number) {
  return a > b;
});

Handlebars.registerHelper("json", function (context: any) {
  return new Handlebars.SafeString(JSON.stringify(context || {}));
});

Handlebars.registerHelper("titleCase", function (name: string) {
  if (!name) return "";
  return String(name).trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
});

Handlebars.registerHelper("initials", function (name: string) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
});

// safeUrl(value) → allow only http(s)/mailto/tel/relative URLs in href/src.
// Any other scheme (javascript:, data:, vbscript:, …) becomes "#" so a stored
// URL on a published page cannot execute script. Output is still HTML-escaped
// by Handlebars in the attribute context.
Handlebars.registerHelper("safeUrl", function (value: any) {
  if (value == null) return "";
  let raw = "";
  for (const ch of String(value).trim()) {
    const code = ch.charCodeAt(0);
    if (code <= 0x20 || code === 0x7f) continue; // drop whitespace + control chars
    raw += ch;
  }
  if (!raw) return "";
  const scheme = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    if (s !== "http" && s !== "https" && s !== "mailto" && s !== "tel") {
      return "#";
    }
  }
  return raw;
});

// safeColor(value, fallback) → only emit a value that is a plain CSS color
// token (hex / rgb()/rgba()/hsl()/hsla() / named). Anything else returns the
// fallback, so a crafted customization color can't break out of a <style> block.
Handlebars.registerHelper("safeColor", function (value: any, fallback: any) {
  const fb = typeof fallback === "string" ? fallback : "";
  if (value == null) return fb;
  const v = String(value).trim();
  const ok =
    /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) ||
    /^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\)$/.test(v) ||
    /^[a-zA-Z]{3,20}$/.test(v);
  return ok ? v : fb;
});

// Render a responsive video embed from a YouTube / Vimeo / direct-file URL.
// IDs are matched and reinserted (safe); raw URLs are validated to http(s)
// and escaped before being placed in attributes to avoid injection.
Handlebars.registerHelper("videoEmbed", function (url: string) {
  if (!url) return "";
  const u = String(url).trim();
  const safe = Handlebars.escapeExpression(u);
  const isHttp = /^https?:\/\//i.test(u);
  let inner = "";
  let m: RegExpMatchArray | null;
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/))) {
    inner = `<iframe src="https://www.youtube.com/embed/${m[1]}" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`;
  } else if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/))) {
    inner = `<iframe src="https://player.vimeo.com/video/${m[1]}" title="Video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  } else if (isHttp && /\.(mp4|webm|ogg)(\?|#|$)/i.test(u)) {
    inner = `<video src="${safe}" controls preload="metadata" playsinline></video>`;
  } else if (isHttp) {
    return new Handlebars.SafeString(
      `<a href="${safe}" target="_blank" rel="noopener" class="lnk">Watch video &rarr;</a>`
    );
  } else {
    return "";
  }
  return new Handlebars.SafeString(`<div class="video-embed">${inner}</div>`);
});

// cycle(index, a, b, c, ...) → returns the option at index % count.
// Used to rotate color/icon classes over an array without per-item data.
Handlebars.registerHelper("cycle", function (...args: any[]) {
  args.pop(); // Handlebars options object
  const index = Number(args.shift()) || 0;
  if (!args.length) return "";
  return args[((index % args.length) + args.length) % args.length];
});

// flattenSkills(skills) → flat array of individual technologies for the
// Developer template's "Tech Stack" keyboard. Each entry carries its source
// category (used as the readout subtitle) and the category's index (used to
// keep a category's keycaps in the same colour family). A category with no
// items still yields one keycap so it is never dropped from the keyboard.
Handlebars.registerHelper("flattenSkills", function (skills: any) {
  if (!Array.isArray(skills)) return [];
  const out: Array<{ name: string; category: string; catIndex: number; description: string }> = [];
  skills.forEach((cat: any, catIndex: number) => {
    const category = typeof cat?.category === "string" ? cat.category : "";
    const items = Array.isArray(cat?.items) ? cat.items : [];
    if (!items.length) {
      if (category) out.push({ name: category, category, catIndex, description: "" });
      return;
    }
    items.forEach((it: any) => {
      const name = typeof it === "string" ? it : String(it?.name ?? it ?? "");
      const description = typeof it === "object" && it ? String(it.description ?? it.desc ?? "") : "";
      if (name.trim()) out.push({ name: name.trim(), category, catIndex, description: description.trim() });
    });
  });
  return out;
});

// kbdBody(value) → CSS modifier class for the Developer keyboard chassis colour.
// Whitelisted: "white"/"light" → kbd-light, "gray"/"grey" → kbd-gray, anything
// else (incl. "black"/unset) → "" (the default dark chassis).
Handlebars.registerHelper("kbdBody", function (value: any) {
  const s = typeof value === "string" ? value.toLowerCase().trim() : "";
  if (s === "white" || s === "light") return "kbd-light";
  if (s === "gray" || s === "grey") return "kbd-gray";
  return "";
});

// techIcon(name) → a Font Awesome class for the technology, or "" when no
// brand/solid glyph fits (the template then falls back to a short abbr label).
// Keys are matched on the name with non-alphanumerics stripped.
const TECH_ICONS: Record<string, string> = {
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
  // Solid-glyph mappings for concepts without a brand mark
  sql: "fas fa-database", mysql: "fas fa-database", postgresql: "fas fa-database",
  postgres: "fas fa-database", mongodb: "fas fa-database", database: "fas fa-database",
  redis: "fas fa-database", sqlite: "fas fa-database", oracle: "fas fa-database",
  cloud: "fas fa-cloud", azure: "fas fa-cloud", gcp: "fas fa-cloud", googlecloud: "fas fa-cloud",
  security: "fas fa-shield-halved", cybersecurity: "fas fa-shield-halved", infosec: "fas fa-shield-halved",
  api: "fas fa-plug", rest: "fas fa-plug", graphql: "fas fa-diagram-project",
  mobile: "fas fa-mobile-screen", flutter: "fas fa-mobile-screen", reactnativemobile: "fas fa-mobile-screen",
  ai: "fas fa-robot", ml: "fas fa-robot", machinelearning: "fas fa-robot",
  tensorflow: "fas fa-robot", pytorch: "fas fa-robot", deeplearning: "fas fa-robot",
  data: "fas fa-chart-line", analytics: "fas fa-chart-line", datascience: "fas fa-chart-line",
  terraform: "fas fa-server", ansible: "fas fa-server", devops: "fas fa-infinity",
  networking: "fas fa-network-wired", network: "fas fa-network-wired",
};
function normalizeTech(name: string): string {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
Handlebars.registerHelper("techIcon", function (name: string) {
  return TECH_ICONS[normalizeTech(name)] || "";
});

// kbAbbr(name) → a short keycap label (2-5 chars) used when no icon matches.
const TECH_ABBR: Record<string, string> = {
  typescript: "TS", javascript: "JS", kubernetes: "K8s", graphql: "GQL",
  postgresql: "PG", postgres: "PG", nextjs: "Next", nodejs: "Node",
  tailwind: "TW", tailwindcss: "TW", mongodb: "Mongo", express: "Ex",
  expressjs: "Ex", terraform: "TF", cplusplus: "C++", csharp: "C#",
  dotnet: ".NET", objectivec: "Obj-C",
};
Handlebars.registerHelper("kbAbbr", function (name: string) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  const norm = normalizeTech(raw);
  if (TECH_ABBR[norm]) return TECH_ABBR[norm];
  const words = raw.split(/[\s/.\-_]+/).filter(Boolean);
  if (words.length > 1) {
    return words.slice(0, 3).map((w) => w[0].toUpperCase()).join("");
  }
  const w = words[0] || raw;
  if (w.length <= 5) return w;
  return w.slice(0, 4);
});

// ── SEO / structured-data helpers ──────────────────────────────
// Emit a JSON-LD <script> built entirely in JS (never from raw template
// interpolation), so user data can't break out of the <script> block:
// every "<" is escaped to < and empty values are pruned.
function httpUrlOrEmpty(value: any): string {
  if (value == null) return "";
  const v = String(value).trim();
  return /^https?:\/\//i.test(v) ? v : "";
}

function pruneEmpty(node: any): any {
  if (Array.isArray(node)) {
    const arr = node.map(pruneEmpty).filter((x) => x !== undefined);
    return arr.length ? arr : undefined;
  }
  if (node && typeof node === "object") {
    const out: Record<string, any> = {};
    for (const [k, val] of Object.entries(node)) {
      const c = pruneEmpty(val);
      if (c !== undefined) out[k] = c;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (node === "" || node === null) return undefined;
  return node;
}

// JSON safe to embed inside a <script> block: user data can't break out.
export function safeScriptJson(value: any): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function ldScript(obj: Record<string, any>): Handlebars.SafeString {
  const cleaned = pruneEmpty(obj) || {};
  return new Handlebars.SafeString(
    `<script type="application/ld+json">${safeScriptJson(cleaned)}</script>`
  );
}

Handlebars.registerHelper("personJsonLd", function (basics: any, portfolioUrl: any) {
  const b = basics || {};
  const sameAs = [b.instagram, b.linkedin, b.github, b.website]
    .map(httpUrlOrEmpty)
    .filter(Boolean);
  return ldScript({
    "@context": "https://schema.org",
    "@type": "Person",
    name: b.fullName,
    jobTitle: b.title,
    description: b.subtitle || b.bio,
    url: httpUrlOrEmpty(portfolioUrl),
    image: httpUrlOrEmpty(b.photoUrl),
    email: b.email,
    address: b.location
      ? { "@type": "PostalAddress", addressLocality: b.location }
      : undefined,
    sameAs,
  });
});

Handlebars.registerHelper(
  "creativeWorkJsonLd",
  function (project: any, basics: any, portfolioUrl: any) {
    const p = project || {};
    const b = basics || {};
    const url = httpUrlOrEmpty(portfolioUrl);
    return ldScript({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: p.title,
      headline: p.tagline,
      description: p.description,
      image: httpUrlOrEmpty(p.coverUrl),
      genre: p.meta?.type,
      url: url && p.slug ? `${url}/projects/${p.slug}` : url,
      creator: b.fullName
        ? { "@type": "Person", name: b.fullName, url: url || undefined }
        : undefined,
    });
  }
);

// faviconLink(fullName, accentColor, bgColor) → an inline SVG data-URI favicon
// showing the monogram initials on the portfolio's background, in the accent
// color. Colors are validated (same rule as safeColor) before use.
Handlebars.registerHelper(
  "faviconLink",
  function (fullName: any, accentColor: any, bgColor: any) {
    const colorOk = (v: any, fb: string) => {
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
    const bg = colorOk(bgColor, "#1b1b1b");
    const accent = colorOk(accentColor, "#DFFF00");
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
      `<rect width="64" height="64" rx="10" fill="${bg}"/>` +
      `<text x="32" y="34" font-family="Geist,Arial,sans-serif" font-size="30" ` +
      `font-weight="800" letter-spacing="-1" fill="${accent}" ` +
      `text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
    return new Handlebars.SafeString(
      `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`
    );
  }
);

// ── trackballBadge helper ──────────────────────────────────────────────────
// Returns the text shown on the trackball: explicit label if provided,
// else the first word of the full name, else "you". Capped at 10 chars.
export function trackballBadgeValue(explicit?: string | null, fullName?: string | null): string {
  const e = String(explicit ?? "").trim();
  if (e) return e.slice(0, 10);
  const first = String(fullName ?? "").trim().split(/\s+/)[0] || "";
  if (first) return first.slice(0, 10);
  return "you";
}
Handlebars.registerHelper("trackballBadge", (explicit: any, fullName: any) =>
  trackballBadgeValue(explicit, fullName),
);

// trackballBadgeJSON(explicit, fullName) → the badge label as a JSON string
// literal safe to inject inside a <script> block (quotes preserved, no HTML
// entities, "<" escaped so a hostile label can't close the script tag).
Handlebars.registerHelper("trackballBadgeJSON", (explicit: any, fullName: any) =>
  new Handlebars.SafeString(safeScriptJson(trackballBadgeValue(explicit, fullName))),
);

// ── kbdSkillsJSON helper ───────────────────────────────────────────────────
// Maps user skills → keyboard keycap data (slug, label, tag, color).
// Slug is one of the 19 SVG icons that exist in public/demo/developer/stack/icons/;
// unknown tools get slug: null (keyboard.js renders a 3-letter text cap).
// normalizeTech strips all non-alphanumeric chars and lowercases, so:
//   "Next.js" → "nextjs", "Node.js" → "nodejs", "Three.js" → "threejs", etc.
const KBD_SLUGS: Record<string, string> = {
  react: "react",
  reactjs: "react",
  next: "nextdotjs",
  nextjs: "nextdotjs",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  three: "threedotjs",
  threejs: "threedotjs",
  webgl: "webgl",
  framer: "framer",
  framermotion: "framer",
  node: "nodedotjs",
  nodejs: "nodedotjs",
  python: "python",
  graphql: "graphql",
  postgres: "postgresql",
  postgresql: "postgresql",
  redis: "redis",
  aws: "amazonwebservices",
  amazonwebservices: "amazonwebservices",
  docker: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  githubactions: "githubactions",
  actions: "githubactions",
  git: "git",
  figma: "figma",
};

// Brand colors keyed by icon slug (near-black tools get a readable dark-slate).
const KBD_COLORS: Record<string, string> = {
  react: "#61dafb",
  nextdotjs: "#cfd6e4",
  typescript: "#3178c6",
  javascript: "#f7df1e",
  tailwindcss: "#06b6d4",
  threedotjs: "#cfd6e4",
  webgl: "#990000",
  framer: "#0055ff",
  nodedotjs: "#5fa04e",
  python: "#3776ab",
  graphql: "#e10098",
  postgresql: "#4169e1",
  redis: "#ff4438",
  amazonwebservices: "#ff9900",
  docker: "#2496ed",
  kubernetes: "#326ce5",
  githubactions: "#2088ff",
  git: "#f05032",
  figma: "#f24e1e",
};
const KBD_DEFAULT_COLOR = "#5b6478";

/** Contract for window.__KBD_SKILLS consumed by public/demo/developer/keyboard.js */
export type KbdSkillItem = { slug: string | null; label: string; tag: string; color: string };

export function kbdSkillsData(
  skills: any,
): KbdSkillItem[] {
  if (!Array.isArray(skills)) return [];
  const out: KbdSkillItem[] = [];
  skills.forEach((cat: any) => {
    const category = typeof cat?.category === "string" ? cat.category : "";
    const items = Array.isArray(cat?.items) ? cat.items : [];
    if (!items.length) {
      // Mirror flattenSkills: a non-empty category name with zero valid items
      // still yields one keycap so it is never silently dropped from the keyboard.
      // A blank/whitespace-only category name is treated as absent (yields nothing).
      if (category.trim()) {
        out.push({ slug: null, label: category, tag: "", color: KBD_DEFAULT_COLOR });
      }
      return;
    }
    items.forEach((it: any) => {
      const label = (typeof it === "string" ? it : String(it?.name ?? it ?? "")).trim();
      if (!label) return;
      const desc = typeof it === "object" && it ? String(it.description ?? "").trim() : "";
      const slug = KBD_SLUGS[normalizeTech(label)] ?? null;
      const color = (slug && KBD_COLORS[slug]) || KBD_DEFAULT_COLOR;
      out.push({ slug, label, tag: desc || category, color });
    });
  });
  return out;
}
Handlebars.registerHelper("kbdSkillsJSON", (skills: any) =>
  new Handlebars.SafeString(safeScriptJson(kbdSkillsData(skills))),
);

let compiledGeneralTemplate: Handlebars.TemplateDelegate | null = null;
let compiledEngineerTemplate: Handlebars.TemplateDelegate | null = null;
let compiledEngineerProjectDetail: Handlebars.TemplateDelegate | null = null;
let compiledCreativeTemplate: Handlebars.TemplateDelegate | null = null;
let compiledCreativeProjectDetail: Handlebars.TemplateDelegate | null = null;
let compiledCreatorTemplate: Handlebars.TemplateDelegate | null = null;
let compiledDeveloperTemplate: Handlebars.TemplateDelegate | null = null;
let compiledCvTemplate: Handlebars.TemplateDelegate | null = null;

function prepareTemplateData(data: PortfolioData & { contentAr?: any }) {
  const templateData: any = { ...data };
  if (data.contentAr) {
    templateData.contentArJson = JSON.stringify(data.contentAr);
    templateData.enBasicsJson = JSON.stringify(data.basics || {});
    templateData.enMetricsJson = JSON.stringify(data.metrics || []);
    templateData.enExperienceJson = JSON.stringify(data.experience || []);
  }
  return templateData;
}

export function renderGeneralTemplate(data: PortfolioData & { contentAr?: any }): string {
  if (!compiledGeneralTemplate) {
    compiledGeneralTemplate = Handlebars.compile(generalTemplateSource as string);
  }
  return compiledGeneralTemplate(prepareTemplateData(data));
}

export function renderEngineerTemplate(data: PortfolioData & { contentAr?: any }): string {
  if (!compiledEngineerTemplate) {
    compiledEngineerTemplate = Handlebars.compile(engineerTemplateSource as string);
  }
  return compiledEngineerTemplate(prepareTemplateData(data));
}

export function renderCreativeTemplate(data: PortfolioData & { contentAr?: any }): string {
  if (!compiledCreativeTemplate) {
    compiledCreativeTemplate = Handlebars.compile(creativeTemplateSource as string);
  }
  return compiledCreativeTemplate(prepareTemplateData(data));
}

export function renderCreatorTemplate(data: PortfolioData & { contentAr?: any }): string {
  if (!compiledCreatorTemplate) {
    compiledCreatorTemplate = Handlebars.compile(creatorTemplateSource as string);
  }
  return compiledCreatorTemplate(prepareTemplateData(data));
}

export function renderDeveloperTemplate(data: PortfolioData & { contentAr?: any }): string {
  if (!compiledDeveloperTemplate) {
    compiledDeveloperTemplate = Handlebars.compile(developerTemplateSource as string);
  }
  return compiledDeveloperTemplate(prepareTemplateData(data));
}

/**
 * Render the shared ATS PDF CV (`_cv/cv.hbs`).
 *
 * One quiet, A4, print-optimised CV for every discipline: all job-application
 * sections, hide-if-empty, discipline accent pulled from
 * `customization.accentColor`, and a QR code in the header that points at the
 * candidate's live portfolio. Supports EN (LTR) and AR (RTL) via the data's
 * `locale` / `isRTL`. Reuses the engine's existing helpers (isHidden, ifEq,
 * safeColor, safeUrl, …).
 *
 * @param data       the full `PortfolioData`
 * @param qrDataUrl  PNG data-URL for the QR (see `portfolioQrDataUrl`)
 * @param liveUrl    the live portfolio URL printed beneath the QR
 */
export function renderCvPdf(
  data: PortfolioData & { contentAr?: any },
  { qrDataUrl, liveUrl }: { qrDataUrl?: string; liveUrl?: string } = {}
): string {
  if (!compiledCvTemplate) {
    compiledCvTemplate = Handlebars.compile(cvTemplateSource as string);
  }
  return compiledCvTemplate({
    ...prepareTemplateData(data),
    qrDataUrl: qrDataUrl || "",
    liveUrl: liveUrl || "",
  });
}

/**
 * Render a project detail page (/p/<portfolio>/projects/<slug>) in the Engineer style.
 * Returns null when the project has no slug (means no detail page is offered).
 */
export function renderEngineerProjectDetail(
  data: PortfolioData & { contentAr?: any; slug?: string },
  projectSlug: string
): string | null {
  if (!data.projects?.length) return null;
  const projectIndex = data.projects.findIndex((p) => p.slug === projectSlug);
  if (projectIndex === -1) return null;

  // Forward-only "Next" — next project in array order that also has a slug.
  const nextProject = data.projects
    .slice(projectIndex + 1)
    .find((p) => p.slug);

  if (!compiledEngineerProjectDetail) {
    compiledEngineerProjectDetail = Handlebars.compile(
      engineerProjectDetailSource as string
    );
  }

  return compiledEngineerProjectDetail({
    ...prepareTemplateData(data),
    project: data.projects[projectIndex],
    nextProject,
    portfolioSlug: data.slug || "",
  });
}

/**
 * Render a project detail page (/p/<portfolio>/projects/<slug>) in the Creative
 * "My Eye Brain" style — cover image with zoom lightbox + plus-shape prev/next.
 * Prev/next walk the slugged projects in array order (both directions).
 */
export function renderCreativeProjectDetail(
  data: PortfolioData & { contentAr?: any; slug?: string },
  projectSlug: string
): string | null {
  if (!data.projects?.length) return null;
  const slugged = data.projects.filter((p) => p.slug);
  const idx = slugged.findIndex((p) => p.slug === projectSlug);
  if (idx === -1) return null;

  const prevProject = idx > 0 ? slugged[idx - 1] : undefined;
  const nextProject = idx < slugged.length - 1 ? slugged[idx + 1] : undefined;

  if (!compiledCreativeProjectDetail) {
    compiledCreativeProjectDetail = Handlebars.compile(
      creativeProjectDetailSource as string
    );
  }

  return compiledCreativeProjectDetail({
    ...prepareTemplateData(data),
    project: slugged[idx],
    prevProject,
    nextProject,
    portfolioSlug: data.slug || "",
  });
}

/**
 * Bulk-render every project that has a `slug` for a portfolio.
 * Used at publish time to populate `portfolio.generatedProjectPages`.
 */
export function renderAllProjectDetailPages(
  data: PortfolioData & { contentAr?: any; slug?: string }
): Array<{ slug: string; html: string }> {
  const templateId = data.templateId || "general";
  const slugged = (data.projects || []).filter((p) => p.slug);
  const detailRenderer =
    templateId === "engineer"
      ? renderEngineerProjectDetail
      : templateId === "creative"
        ? renderCreativeProjectDetail
        : null;
  if (!detailRenderer) return [];

  return slugged.flatMap((p) => {
    const html = detailRenderer(data, p.slug!);
    return html ? [{ slug: p.slug!, html }] : [];
  });
}
