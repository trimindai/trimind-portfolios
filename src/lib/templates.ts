// Static registry of all templates available in src/templates/.
// Read at build time — no filesystem access needed at runtime.

// The "general" template (formerly "corporate"). Old portfolios stored with
// templateId "corporate" keep working via TEMPLATE_ALIASES / resolveTemplateId.
import general from "@/templates/general/manifest.json";
import creative from "@/templates/creative/manifest.json";
import creator from "@/templates/creator/manifest.json";
import developer from "@/templates/developer/manifest.json";
import engineer from "@/templates/engineer/manifest.json";

export type TemplateManifest = {
  id: string;
  name: string;
  description: string;
  category: string;
  targetProfessions: string[];
  colors: Record<string, string>;
};

// Backward-compat: old template ids -> current canonical id. Portfolios created
// before a rename keep rendering. Apply resolveTemplateId() at EVERY templateId
// lookup (renderers, builder steps, demo route, getTemplate).
export const TEMPLATE_ALIASES: Record<string, string> = {
  corporate: "general",
};

export function resolveTemplateId(id?: string | null): string {
  const t = id || "general";
  return TEMPLATE_ALIASES[t] ?? t;
}

// Live preview URLs hosted separately (one per template that has a demo).
// Templates without a demo URL render a styled placeholder card.
const DEMO_URLS: Record<string, string | undefined> = {
  general: "/demo/general",
  engineer: "/demo/engineer",
  creative: "/demo/creative",
  developer: "/demo/developer",
  creator: "/demo/creator",
};

export type Template = TemplateManifest & {
  demoUrl?: string;
  available: boolean;
};

export const TEMPLATES: Template[] = (
  [
    general,
    engineer,
    creative,
    creator,
    developer,
  ] as TemplateManifest[]
).map((m) => ({
  ...m,
  demoUrl: DEMO_URLS[m.id],
  // Live templates — others are coming soon.
  available:
    m.id === "general" ||
    m.id === "engineer" ||
    m.id === "creative" ||
    m.id === "developer" ||
    m.id === "creator",
}));

export function getTemplate(id: string): Template | undefined {
  const rid = resolveTemplateId(id);
  return TEMPLATES.find((t) => t.id === rid);
}
