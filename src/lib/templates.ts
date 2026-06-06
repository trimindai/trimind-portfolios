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
  // Public availability — live for all users.
  available: boolean;
  // Work-in-progress template: usable by admins for finishing & QA, shown as
  // "coming soon" to everyone else. When it's ready for all users, move its id
  // into AVAILABLE_IDS and remove it from ADMIN_PREVIEW_IDS.
  adminPreview: boolean;
};

// Templates live for every visitor.
const AVAILABLE_IDS = new Set(["general", "engineer", "creative", "creator"]);
// Templates only admins can see/use while they're still being built.
const ADMIN_PREVIEW_IDS = new Set(["developer"]);

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
  available: AVAILABLE_IDS.has(m.id),
  adminPreview: ADMIN_PREVIEW_IDS.has(m.id),
}));

// Effective availability for a given viewer. Admins additionally see templates
// that are still in admin-preview, so they can finish and test them live.
export function isTemplateAvailableFor(
  tpl: Template,
  opts?: { isAdmin?: boolean },
): boolean {
  return tpl.available || (!!opts?.isAdmin && tpl.adminPreview);
}

export function getTemplate(id: string): Template | undefined {
  const rid = resolveTemplateId(id);
  return TEMPLATES.find((t) => t.id === rid);
}
