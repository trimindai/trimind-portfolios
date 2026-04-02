import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

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
  skills?: Array<{
    category: string;
    items: string[];
  }>;
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
  certifications?: Array<{
    name: string;
    issuer: string;
    year?: string;
  }>;
  languages?: Array<{
    name: string;
    level: string;
  }>;
  endorsements?: Array<{
    quote: string;
    name: string;
    title: string;
    company: string;
  }>;
  professionalAffiliations?: Array<{
    name: string;
    role?: string;
  }>;
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
  locale: string;
  isRTL: boolean;
  portfolioUrl: string;
}

// Register Handlebars helpers
Handlebars.registerHelper(
  "isHidden",
  function (this: Record<string, unknown>, sectionId: string) {
    const customization = this.customization as
      | { hiddenSections?: string[] }
      | undefined;
    const hidden = customization?.hiddenSections || [];
    return hidden.includes(sectionId);
  }
);

Handlebars.registerHelper(
  "ifEq",
  function (
    this: unknown,
    a: unknown,
    b: unknown,
    options: Handlebars.HelperOptions
  ) {
    return a === b ? options.fn(this) : options.inverse(this);
  }
);

Handlebars.registerHelper(
  "ifCond",
  function (
    this: unknown,
    v1: unknown,
    v2: unknown,
    options: Handlebars.HelperOptions
  ) {
    if (v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  }
);

Handlebars.registerHelper("or", function (this: unknown, ...args: unknown[]) {
  // Last argument is the Handlebars options object
  args.pop();
  return args.some(Boolean);
});

Handlebars.registerHelper("gt", function (a: number, b: number) {
  return a > b;
});

Handlebars.registerHelper("json", function (context: unknown) {
  return JSON.stringify(context);
});

let cachedTemplate: Handlebars.TemplateDelegate | null = null;
let cachedPartials: Record<string, string> = {};

function loadPartials(): void {
  if (Object.keys(cachedPartials).length > 0) return;

  const partialsDir = path.join(
    process.cwd(),
    "src",
    "templates",
    "_partials"
  );

  try {
    if (fs.existsSync(partialsDir)) {
      const files = fs.readdirSync(partialsDir);
      for (const file of files) {
        if (file.endsWith(".html") || file.endsWith(".hbs")) {
          const name = path.basename(file, path.extname(file));
          const content = fs.readFileSync(
            path.join(partialsDir, file),
            "utf-8"
          );
          Handlebars.registerPartial(name, content);
          cachedPartials[name] = content;
        }
      }
    }
  } catch {
    // Partials are optional
  }
}

function getTemplate(): Handlebars.TemplateDelegate {
  if (cachedTemplate) return cachedTemplate;

  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "corporate",
    "template.hbs"
  );

  const source = fs.readFileSync(templatePath, "utf-8");
  cachedTemplate = Handlebars.compile(source);
  return cachedTemplate;
}

export function renderCorporateTemplate(data: PortfolioData): string {
  loadPartials();
  const template = getTemplate();
  return template(data);
}

/**
 * Force recompilation of the template on next render.
 * Useful for development or after template file changes.
 */
export function invalidateTemplateCache(): void {
  cachedTemplate = null;
  cachedPartials = {};
}
