import type { PortfolioData } from "./template-engine";

export function toPortfolioData(
  portfolio: any,
  locale: string
): PortfolioData & { contentAr?: any } {
  let contentAr = null;
  try {
    if (portfolio.contentAr) {
      contentAr = JSON.parse(portfolio.contentAr);
    }
  } catch {}

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
    contentAr,
  };
}
