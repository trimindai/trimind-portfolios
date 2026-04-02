import type { PortfolioData } from "./template-engine";

/**
 * Converts a Convex portfolio document into the PortfolioData format
 * expected by the template engine.
 */
export function toPortfolioData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  portfolio: any,
  locale: string
): PortfolioData {
  return {
    basics: portfolio.basics,
    metrics: portfolio.metrics,
    experience: portfolio.experience,
    skills: portfolio.skills,
    projects: portfolio.projects,
    education: portfolio.education,
    certifications: portfolio.certifications,
    languages: portfolio.languages,
    endorsements: portfolio.endorsements,
    professionalAffiliations: portfolio.professionalAffiliations,
    continuousDevelopment: portfolio.continuousDevelopment,
    customization: portfolio.customization,
    locale,
    isRTL: locale === "ar",
    portfolioUrl: `https://portfolio-trimind.com/p/${portfolio.slug || "preview"}`,
  };
}
