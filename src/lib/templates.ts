// Static registry of all templates available in src/templates/.
// Read at build time — no filesystem access needed at runtime.

import corporate from "@/templates/corporate/manifest.json";
import creative from "@/templates/creative/manifest.json";
import creator from "@/templates/creator/manifest.json";
import developer from "@/templates/developer/manifest.json";
import educator from "@/templates/educator/manifest.json";
import engineer from "@/templates/engineer/manifest.json";
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
  corporate: "/demo/corporate",
  engineer: "/demo/engineer",
  creative: "/demo/creative",
};

export type Template = TemplateManifest & {
  demoUrl?: string;
  available: boolean;
};

export const TEMPLATES: Template[] = (
  [
    corporate,
    engineer,
    creative,
    creator,
    developer,
    medical,
    educator,
  ] as TemplateManifest[]
).map((m) => ({
  ...m,
  demoUrl: DEMO_URLS[m.id],
  // Only corporate and engineer are live — others are coming soon.
  available: m.id === "corporate" || m.id === "engineer" || m.id === "creative",
}));

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
