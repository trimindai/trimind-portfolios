/**
 * Single source of truth for builder color presets, per template.
 *
 * To add a new palette (e.g. delivered via the Dalal bot), append one object
 * to the relevant template array below — every Customize step renders from
 * this file, so no component changes are needed.
 *
 * `primary` is optional: the creative template only customizes accent + bg.
 */
export type ColorPreset = {
  name: string;
  primary?: string;
  accent: string;
  bg: string;
};

export type TemplatePresetKey =
  | "general"
  | "engineer"
  | "creative"
  | "creator"
  | "developer";

const GENERAL_PRESETS: ColorPreset[] = [
  { name: "Corporate Navy", primary: "#0F172A", accent: "#A16207", bg: "#F8FAFC" },
  { name: "Ocean Blue", primary: "#1E3A5F", accent: "#0891B2", bg: "#F0F9FF" },
  { name: "Forest Green", primary: "#14532D", accent: "#CA8A04", bg: "#F0FDF4" },
  { name: "Royal Purple", primary: "#3B0764", accent: "#A855F7", bg: "#FAF5FF" },
  { name: "Warm Charcoal", primary: "#292524", accent: "#DC2626", bg: "#FAFAF9" },
  { name: "Midnight", primary: "#0C0A09", accent: "#F59E0B", bg: "#FFFFFF" },
  // ── Warm editorial / earthy — from owner palette cards (2026-06-26) ──
  { name: "Warm Editorial", primary: "#89A474", accent: "#BF886D", bg: "#F2F1EC" },
  { name: "Olive & Rose", primary: "#716C49", accent: "#BF886D", bg: "#EFE5D5" },
  { name: "Lotus Rosewood", primary: "#92333C", accent: "#E1A49A", bg: "#F1E4DB" },
  { name: "Forest Sage", primary: "#283524", accent: "#AAAF97", bg: "#EAE9E3" },
  { name: "Autumn Oak", primary: "#564014", accent: "#D6A752", bg: "#E8CFBD" },
  { name: "Wellness Teal", primary: "#194459", accent: "#F1CC61", bg: "#F6ECCB" },
  // ── Surgeon series, light sub-mood (Calm Down/Inner Child, Minimal Luxury) ──
  { name: "Calm Rose", primary: "#C4737C", accent: "#DFA0F3", bg: "#F3EEE9" },
  { name: "Minimal Stone", primary: "#141413", accent: "#AFACA1", bg: "#C9C8BF" },
];

const ENGINEER_PRESETS: ColorPreset[] = [
  { name: "Deep Steel", primary: "#18181b", accent: "#1e3a5f", bg: "#ffffff" },
  { name: "Clean White", primary: "#0f172a", accent: "#0369a1", bg: "#ffffff" },
  { name: "Warm Gray", primary: "#1c1917", accent: "#92400e", bg: "#fafaf9" },
  { name: "Dark Mode", primary: "#f4f4f5", accent: "#3b82f6", bg: "#18181b" },
  { name: "Petrol", primary: "#0f172a", accent: "#0d9488", bg: "#f0fdfa" },
  { name: "Industrial", primary: "#292524", accent: "#dc2626", bg: "#fafaf9" },
  // ── Muted earthy — from owner palette cards (2026-06-26) ──
  { name: "Ferra Taupe", primary: "#695449", accent: "#AB9A83", bg: "#F0EEE3" },
  { name: "Clay Sage", primary: "#7C5D46", accent: "#889182", bg: "#F3F2E7" },
  { name: "Sand Dune", primary: "#262625", accent: "#CBB2A1", bg: "#F3F2E7" },
];

const CREATIVE_PRESETS: ColorPreset[] = [
  { name: "Lime Noir", accent: "#DFFF00", bg: "#1b1b1b" },
  { name: "Electric Cyan", accent: "#00E5FF", bg: "#0d0d0f" },
  { name: "Coral", accent: "#FF6B5B", bg: "#1a1413" },
  { name: "Violet", accent: "#B794F6", bg: "#15131c" },
  { name: "Mono", accent: "#FFFFFF", bg: "#111111" },
  { name: "Gold", accent: "#E8C547", bg: "#161310" },
  // ── Dark editorial (Surgeon 9/9 series) — from owner palette cards (2026-06-26) ──
  { name: "Sahara Noir", accent: "#AD6E54", bg: "#17191A" },
  { name: "Gilded Dark", accent: "#B89B6F", bg: "#060701" },
  { name: "ReGrowth", accent: "#4A6958", bg: "#1B2922" },
  { name: "Beach Stillness", accent: "#66726B", bg: "#212D2D" },
  { name: "Rust Noir", accent: "#5F2E1B", bg: "#141413" },
  { name: "Night Wander", accent: "#B8B8CA", bg: "#121315" },
];

const DEVELOPER_PRESETS: ColorPreset[] = [
  { name: "Spacebar", primary: "#7c5cff", accent: "#38bdf8", bg: "#020617" },
  { name: "Aurora", primary: "#34d399", accent: "#22d3ee", bg: "#04140f" },
  { name: "Magma", primary: "#fb7185", accent: "#fbbf24", bg: "#0a0608" },
  { name: "Cobalt", primary: "#3b82f6", accent: "#06b6d4", bg: "#020817" },
  { name: "Violet Night", primary: "#a78bfa", accent: "#f472b6", bg: "#0b0614" },
  { name: "Mono", primary: "#e2e8f0", accent: "#94a3b8", bg: "#0a0a0a" },
  // ── Editorial dark (Surgeon 9/9 series) — from owner palette cards (2026-06-26) ──
  { name: "Editorial Noir", primary: "#F3EEE9", accent: "#AD6E54", bg: "#141413" },
  { name: "Sahara Elegance", primary: "#EEC5A0", accent: "#AD6E54", bg: "#17191A" },
  { name: "Subtle Difference", primary: "#E2D2B8", accent: "#B89B6F", bg: "#060701" },
];

export const COLOR_PRESETS: Record<TemplatePresetKey, ColorPreset[]> = {
  general: GENERAL_PRESETS,
  engineer: ENGINEER_PRESETS,
  creative: CREATIVE_PRESETS,
  // Creator shares the general palette set today; give it its own list here
  // the moment a creator-specific palette lands.
  creator: GENERAL_PRESETS,
  developer: DEVELOPER_PRESETS,
};

const norm = (v?: string) => (v || "").trim().toLowerCase();

/**
 * True when the user's current customization matches a preset exactly
 * (used to render the selected state on preset swatches).
 */
export function isPresetActive(
  preset: ColorPreset,
  customization: { primaryColor?: string; accentColor?: string; bgColor?: string },
  defaults: { primary?: string; accent: string; bg: string }
): boolean {
  const current = {
    primary: norm(customization.primaryColor) || norm(defaults.primary),
    accent: norm(customization.accentColor) || norm(defaults.accent),
    bg: norm(customization.bgColor) || norm(defaults.bg),
  };
  const presetMatchesPrimary =
    preset.primary === undefined || current.primary === norm(preset.primary);
  return (
    presetMatchesPrimary &&
    current.accent === norm(preset.accent) &&
    current.bg === norm(preset.bg)
  );
}
