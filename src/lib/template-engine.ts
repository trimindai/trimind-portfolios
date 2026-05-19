import Handlebars from "handlebars";
// @ts-ignore - webpack asset/source loader
import corporateTemplateSource from "@/templates/corporate/template.hbs";
// @ts-ignore - webpack asset/source loader
import engineerTemplateSource from "@/templates/engineer/template.hbs";

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

let compiledCorporateTemplate: Handlebars.TemplateDelegate | null = null;
let compiledEngineerTemplate: Handlebars.TemplateDelegate | null = null;

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
