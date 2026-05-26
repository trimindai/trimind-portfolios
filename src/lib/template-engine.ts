import Handlebars from "handlebars";
import corporateTemplateSource from "@/templates/corporate/template.hbs";
import engineerTemplateSource from "@/templates/engineer/template.hbs";
import engineerProjectDetailSource from "@/templates/engineer/project-detail.hbs";
import creativeTemplateSource from "@/templates/creative/template.hbs";
import creativeProjectDetailSource from "@/templates/creative/project-detail.hbs";
import creatorTemplateSource from "@/templates/creator/template.hbs";
import developerTemplateSource from "@/templates/developer/template.hbs";
import medicalTemplateSource from "@/templates/medical/template.hbs";
import educatorTemplateSource from "@/templates/educator/template.hbs";

export interface PortfolioData {
  basics: {
    fullName: string;
    title: string;
    subtitle?: string;
    bio?: string;
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
    photoUrl?: string;
    resumeUrl?: string;
  };
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
  professionalAffiliations?: Array<{ name: string; role?: string }>;
  continuousDevelopment?: Array<{
    name: string;
    provider?: string;
    year?: string;
  }>;
  customization?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    hiddenSections?: string[];
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

let compiledCorporateTemplate: Handlebars.TemplateDelegate | null = null;
let compiledEngineerTemplate: Handlebars.TemplateDelegate | null = null;
let compiledEngineerProjectDetail: Handlebars.TemplateDelegate | null = null;
let compiledCreativeTemplate: Handlebars.TemplateDelegate | null = null;
let compiledCreativeProjectDetail: Handlebars.TemplateDelegate | null = null;
let compiledCreatorTemplate: Handlebars.TemplateDelegate | null = null;
let compiledDeveloperTemplate: Handlebars.TemplateDelegate | null = null;
let compiledMedicalTemplate: Handlebars.TemplateDelegate | null = null;
let compiledEducatorTemplate: Handlebars.TemplateDelegate | null = null;

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

export function renderCorporateTemplate(data: PortfolioData & { contentAr?: any }): string {
  if (!compiledCorporateTemplate) {
    compiledCorporateTemplate = Handlebars.compile(corporateTemplateSource as string);
  }
  return compiledCorporateTemplate(prepareTemplateData(data));
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

export function renderMedicalTemplate(data: PortfolioData & { contentAr?: any }): string {
  if (!compiledMedicalTemplate) {
    compiledMedicalTemplate = Handlebars.compile(medicalTemplateSource as string);
  }
  return compiledMedicalTemplate(prepareTemplateData(data));
}

export function renderEducatorTemplate(data: PortfolioData & { contentAr?: any }): string {
  if (!compiledEducatorTemplate) {
    compiledEducatorTemplate = Handlebars.compile(educatorTemplateSource as string);
  }
  return compiledEducatorTemplate(prepareTemplateData(data));
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
  const templateId = data.templateId || "corporate";
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
