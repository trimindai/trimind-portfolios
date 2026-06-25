// Extracted portfolio HTML render block — the single place that turns a stored
// portfolio doc into the published `generatedHtml` + per-project detail pages.
// Used by the cv-bot bridge route (`/api/bot/portfolio`). The existing
// `/api/publish` route still carries its own inline copy; point it here on the
// next refactor (left untouched now to keep the cv-bot branch to its 3 files).
//
// ponytail: pure function, no auth/IO — callers own the trust boundary (the
// publish mutation re-checks ownership + payment with the server secret).

import { toPortfolioData } from "./portfolio-data";
import { resolveTemplateId } from "./templates";
import {
  renderGeneralTemplate,
  renderEngineerTemplate,
  renderCreativeTemplate,
  renderCreatorTemplate,
  renderDeveloperTemplate,
  renderAllProjectDetailPages,
} from "./template-engine";

const RENDERERS: Record<string, (d: any) => string> = {
  general: renderGeneralTemplate,
  engineer: renderEngineerTemplate,
  creative: renderCreativeTemplate,
  creator: renderCreatorTemplate,
  developer: renderDeveloperTemplate,
};

export interface RenderedPortfolio {
  generatedHtml: string;
  generatedProjectPages: { slug: string; html: string }[];
}

/**
 * Render a stored portfolio into its published HTML. `slug` is the slug being
 * published (project detail links are built from it). `locale` selects EN/AR.
 */
export function renderPortfolio(
  portfolio: any,
  slug: string,
  locale: "en" | "ar" = "en"
): RenderedPortfolio {
  const data = toPortfolioData({ ...portfolio, slug }, locale);
  const templateId = resolveTemplateId(data.templateId);
  const render = RENDERERS[templateId] || renderGeneralTemplate;
  return {
    generatedHtml: render(data),
    generatedProjectPages: renderAllProjectDetailPages({ ...data, slug }),
  };
}
