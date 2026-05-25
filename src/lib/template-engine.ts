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
      type?: "academic" | "industrial" | "personal" | "research";
      year?: string;
      courseCode?: string;
      institution?: string;
      teamSize?: number;
      role?: string;
      duration?: string;
    };
    blocks?: Array<{
      kind: "paragraph" | "image" | "imageGrid" | "specs" | "standards" | "challenge";
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
