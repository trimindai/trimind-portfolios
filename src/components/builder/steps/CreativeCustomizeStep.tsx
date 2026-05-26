"use client";

interface CreativeCustomizeStepProps {
  data: any;
  onChange: (updates: any) => void;
}

const PRESETS = [
  { name: "Lime Noir", accent: "#DFFF00", bg: "#1b1b1b" },
  { name: "Electric Cyan", accent: "#00E5FF", bg: "#0d0d0f" },
  { name: "Coral", accent: "#FF6B5B", bg: "#1a1413" },
  { name: "Violet", accent: "#B794F6", bg: "#15131c" },
  { name: "Mono", accent: "#FFFFFF", bg: "#111111" },
  { name: "Gold", accent: "#E8C547", bg: "#161310" },
];

const SECTIONS = [
  { id: "portfolio-showcase", label: "Gallery Grid" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience / Journey" },
];

export function CreativeCustomizeStep({ data, onChange }: CreativeCustomizeStepProps) {
  const customization = data.customization || {};
  const hiddenSections = customization.hiddenSections || [];
  const accent = customization.accentColor || "#DFFF00";
  const bg = customization.bgColor || "#1b1b1b";

  const update = (field: string, value: any) => {
    onChange({ customization: { ...customization, [field]: value } });
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    onChange({ customization: { ...customization, accentColor: p.accent, bgColor: p.bg } });
  };

  const toggleSection = (id: string) => {
    const next = hiddenSections.includes(id)
      ? hiddenSections.filter((s: string) => s !== id)
      : [...hiddenSections, id];
    update("hiddenSections", next);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Look &amp; Feel</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          The creative template is dark by design. Pick an accent and background, and choose which sections to show.
        </p>
      </div>

      {/* Presets */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Theme Presets</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESETS.map((p) => {
            const active = accent.toLowerCase() === p.accent.toLowerCase() && bg.toLowerCase() === p.bg.toLowerCase();
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={`group rounded-lg border p-3 transition-colors text-center ${
                  active ? "border-[var(--land-accent)]" : "border-[var(--land-border)] hover:border-[var(--land-accent-hover)]"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: p.bg }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.accent }} />
                  </div>
                </div>
                <span className="text-[10px] text-[var(--land-muted)] group-hover:text-[var(--land-bright)]">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom colors */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Custom Colors</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">Accent</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accent}
                onChange={(e) => update("accentColor", e.target.value)}
                className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent"
              />
              <span className="text-xs text-[var(--land-muted)] font-mono">{accent}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">Highlights, links, hover states</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--land-bright)] mb-2 block">Background</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bg}
                onChange={(e) => update("bgColor", e.target.value)}
                className="w-12 h-12 rounded-lg border border-[var(--land-border)] cursor-pointer bg-transparent"
              />
              <span className="text-xs text-[var(--land-muted)] font-mono">{bg}</span>
            </div>
            <p className="text-xs text-[var(--land-muted)] mt-1">Keep it dark for best contrast</p>
          </div>
        </div>
      </div>

      {/* Section visibility */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Section Visibility</h3>
        <p className="text-sm text-[var(--land-body)] mb-4">
          The hero and contact always show. Empty sections are auto-hidden.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {SECTIONS.map((s) => (
            <label
              key={s.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--land-surface-raised)]/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={!hiddenSections.includes(s.id)}
                onChange={() => toggleSection(s.id)}
                className="w-4 h-4 rounded border-[var(--land-border)] text-[var(--land-accent)] focus:ring-[var(--land-accent)] bg-[var(--land-surface-raised)]"
              />
              <span className="text-sm text-[var(--land-bright)]">{s.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
