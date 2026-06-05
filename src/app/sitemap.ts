import type { MetadataRoute } from "next";
import { convexClient } from "@/lib/convex";
import { api } from "@convex/_generated/api";

const SITE_URL = "https://portfolio-trimind.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/ar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/en/templates`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/ar/templates`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/en/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/en/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let portfolioPages: MetadataRoute.Sitemap = [];
  try {
    const slugs = await convexClient.query(api.portfolios.listPublishedSlugs, {});
    portfolioPages = slugs.map((entry) => ({
      url: `${SITE_URL}/p/${entry.slug}`,
      lastModified: new Date(entry.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Convex may be unavailable during build
  }

  return [...staticPages, ...portfolioPages];
}
