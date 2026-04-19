// Static registry of all templates available in src/templates/.
// Read at build time — no filesystem access needed at runtime.

import corporate from "@/templates/corporate/manifest.json";
import creative from "@/templates/creative/manifest.json";
import designer from "@/templates/designer/manifest.json";
import developer from "@/templates/developer/manifest.json";
import educator from "@/templates/educator/manifest.json";
import executive from "@/templates/executive/manifest.json";
import medical from "@/templates/medical/manifest.json";

export type TemplateManifest = {
  id: string;
  name: string;
  description: string;
  category: string;
  targetProfessions: string[];
  colors: Record<string, string>;
};

// Live preview URLs hosted separately (one per template that has a demo).
// Templates without a demo URL render a styled placeholder card.
const DEMO_URLS: Record<string, string | undefined> = {
  corporate: "https://corporate-three-pink.vercel.app/",
};

export type Template = TemplateManifest & {
  demoUrl?: string;
  available: boolean;
};

export const TEMPLATES: Template[] = (
  [
    corporate,
    executive,
    creative,
    designer,
    developer,
    medical,
    educator,
  ] as TemplateManifest[]
).map((m) => ({
  ...m,
  demoUrl: DEMO_URLS[m.id],
  // Flag "available" templates — corporate is live, others are coming soon.
  // Flip these on as their builders ship.
  available: m.id === "corporate",
}));

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
