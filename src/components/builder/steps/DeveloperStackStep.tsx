"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

interface DeveloperStackStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

// All curated tool names flattened for bulk-paste routing
// (built lazily from CURATED below; declared here so BulkAdd can reference it)
type CuratedEntry = { name: string; category: string };

type SkillGroup = { category: string; items: string[] };
type Tool = { name: string; slug: string };

// Curated palette of the best-known tools per category. `slug` = devicon icon
// slug AND (after normalize) the 3D-keyboard key it lights up in the portfolio.
const CURATED: { category: string; tools: Tool[] }[] = [
  {
    category: "Frontend",
    tools: [
      { name: "React", slug: "react" },
      { name: "Next.js", slug: "nextjs" },
      { name: "Vue.js", slug: "vuejs" },
      { name: "TypeScript", slug: "typescript" },
      { name: "JavaScript", slug: "javascript" },
      { name: "Tailwind CSS", slug: "tailwindcss" },
      { name: "HTML5", slug: "html5" },
      { name: "CSS3", slug: "css3" },
    ],
  },
  {
    category: "Backend",
    tools: [
      { name: "Node.js", slug: "nodejs" },
      { name: "Express", slug: "express" },
      { name: "Python", slug: "python" },
      { name: "Django", slug: "django" },
      { name: "Go", slug: "go" },
      { name: "GraphQL", slug: "graphql" },
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "MongoDB", slug: "mongodb" },
      { name: "Redis", slug: "redis" },
    ],
  },
  {
    category: "Cloud / Ops",
    tools: [
      { name: "AWS", slug: "amazonwebservices" },
      { name: "Google Cloud", slug: "googlecloud" },
      { name: "Docker", slug: "docker" },
      { name: "Kubernetes", slug: "kubernetes" },
      { name: "Nginx", slug: "nginx" },
      { name: "Terraform", slug: "terraform" },
    ],
  },
  {
    category: "Tools",
    tools: [
      { name: "Git", slug: "git" },
      { name: "GitHub", slug: "github" },
      { name: "Figma", slug: "figma" },
      { name: "VS Code", slug: "vscode" },
      { name: "Jira", slug: "jira" },
      { name: "Linux", slug: "linux" },
    ],
  },
];

// Flat index of { name, category } for all curated tools — used by BulkAdd routing.
// Hoisted to module scope so it's computed once, not on every render.
const curatedIndex: CuratedEntry[] = CURATED.flatMap(({ category, tools }) =>
  tools.map((tool) => ({ name: tool.name, category }))
);

// Sort a SkillGroup array: curated categories first (in CURATED order), custom last.
const _curatedOrder = CURATED.map((c) => c.category);
function sortGroups(groups: SkillGroup[]): SkillGroup[] {
  return [...groups].sort((a, b) => {
    const ia = _curatedOrder.indexOf(a.category);
    const ib = _curatedOrder.indexOf(b.category);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function ToolIcon({ slug, name }: { slug: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err || !slug) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[var(--land-border)] text-[10px] font-bold text-[var(--land-bright)]">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/builder/devicon/${slug}.svg`}
      alt=""
      width={20}
      height={20}
      className="h-5 w-5"
      onError={() => setErr(true)}
    />
  );
}

function AddOther({ onAdd, placeholder, addLabel }: { onAdd: (v: string) => void; placeholder: string; addLabel: string }) {
  const [v, setV] = useState("");
  const commit = () => {
    const name = v.trim();
    if (name) { onAdd(name); setV(""); }
  };
  return (
    <div className="mt-2 flex gap-2">
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
        placeholder={placeholder}
        className="min-h-[44px] flex-1 rounded-lg border border-[var(--land-border)] bg-white px-3 py-2 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm outline-none transition-colors focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)]"
      />
      <button
        type="button"
        onClick={commit}
        className="min-h-[44px] rounded-lg border border-[var(--land-border)] px-4 text-sm font-medium text-[var(--land-bright)] transition-colors hover:border-[var(--land-accent)]"
      >
        {addLabel}
      </button>
    </div>
  );
}

function BulkAdd({
  onAddBulk,
  label,
  placeholder,
  addLabel,
  hint,
}: {
  onAddBulk: (entries: { name: string; category: string }[]) => void;
  label: string;
  placeholder: string;
  addLabel: string;
  hint: string;
}) {
  const textareaId = useId();
  const hintId = useId();
  const [v, setV] = useState("");
  const commit = () => {
    const raw = v.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (!raw.length) return;
    const entries = raw.map((token) => {
      // Match case-insensitively but store the curated canonical name so that
      // toggle() (which uses strict includes) finds the chip, and the custom-
      // chip filter (which excludes curated-name matches) doesn't misfire.
      const match = curatedIndex.find(
        (e) => e.name.toLowerCase() === token.toLowerCase()
      );
      return match
        ? { name: match.name, category: match.category }
        : { name: token, category: "Tools" };
    });
    onAddBulk(entries);
    setV("");
  };
  return (
    <div className="rounded-lg border border-[var(--land-border)] bg-[var(--land-surface-raised)]/20 p-4">
      <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-[var(--land-bright)]">{label}</label>
      <div className="flex gap-2">
        <textarea
          id={textareaId}
          aria-describedby={hintId}
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="flex-1 rounded-lg border border-[var(--land-border)] bg-white px-3 py-2 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm outline-none transition-colors focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] resize-none"
        />
        <button
          type="button"
          onClick={commit}
          className="min-h-[44px] self-start rounded-lg border border-[var(--land-border)] px-4 text-sm font-medium text-[var(--land-bright)] transition-colors hover:border-[var(--land-accent)]"
        >
          {addLabel}
        </button>
      </div>
      <p id={hintId} className="mt-1.5 text-xs text-[var(--land-muted)]">{hint}</p>
    </div>
  );
}

export function DeveloperStackStep({ data, onChange }: DeveloperStackStepProps) {
  const t = useTranslations("builder.developer");
  const trackballInputId = useId();
  const trackballHintId = useId();
  const skills: SkillGroup[] = Array.isArray(data.skills) ? data.skills : [];
  const customization = data.customization || {};

  const itemsFor = (category: string): string[] =>
    skills.find((g) => g.category === category)?.items || [];

  const setItems = (category: string, items: string[]) => {
    const next = skills.filter((g) => g.category !== category);
    if (items.length > 0) next.push({ category, items });
    onChange({ skills: sortGroups(next) });
  };

  const toggle = (category: string, name: string) => {
    const cur = itemsFor(category);
    setItems(category, cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]);
  };

  const addCustom = (category: string, name: string) => {
    const cur = itemsFor(category);
    if (!cur.some((x) => x.toLowerCase() === name.toLowerCase())) setItems(category, [...cur, name]);
  };

  // Bulk-add: route each entry to its curated category (or "Tools"), dedupe
  const addBulk = (entries: { name: string; category: string }[]) => {
    // Build a mutable snapshot of current skills grouped by category
    const snapshot: Record<string, string[]> = {};
    for (const g of skills) snapshot[g.category] = [...(g.items || [])];

    for (const { name, category } of entries) {
      if (!snapshot[category]) snapshot[category] = [];
      if (!snapshot[category].some((x) => x.toLowerCase() === name.toLowerCase())) {
        snapshot[category].push(name);
      }
    }

    // Rebuild sorted skills array
    const next: SkillGroup[] = Object.entries(snapshot)
      .filter(([, items]) => items.length > 0)
      .map(([category, items]) => ({ category, items }));
    onChange({ skills: sortGroups(next) });
  };

  const totalSelected = skills.reduce((n, g) => n + (g.items?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("stackHeading")}</h2>
        <p className="mt-1 text-sm text-[var(--land-body)]">{t("stackIntro")}</p>
      </div>

      <div className="rounded-lg border border-[var(--land-accent)]/30 bg-[var(--land-surface-raised)]/30 p-4 text-sm text-[var(--land-body)]">
        {t("stackKeyboardHint")}
      </div>

      {/* Trackball badge */}
      <div>
        <label htmlFor={trackballInputId} className="mb-1.5 block text-sm font-medium text-[var(--land-bright)]">
          {t("trackballLabel")}
        </label>
        <input
          id={trackballInputId}
          aria-describedby={trackballHintId}
          type="text"
          value={customization.trackballLabel || ""}
          maxLength={10}
          onChange={(e) =>
            onChange({ customization: { ...customization, trackballLabel: e.target.value } })
          }
          placeholder={t("trackballPlaceholder")}
          className="min-h-[44px] w-full max-w-[16rem] rounded-lg border border-[var(--land-border)] bg-white px-3 py-2 text-sm text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm outline-none transition-colors focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)]"
        />
        <p id={trackballHintId} className="mt-1 text-xs text-[var(--land-muted)]">{t("trackballHint")}</p>
      </div>

      {/* Bulk paste */}
      <BulkAdd
        onAddBulk={addBulk}
        label={t("bulkLabel")}
        placeholder={t("bulkPlaceholder")}
        addLabel={t("bulkAdd")}
        hint={t("bulkHint")}
      />

      {CURATED.map(({ category, tools }) => {
        const selected = itemsFor(category);
        const curatedNames = tools.map((tt) => tt.name.toLowerCase());
        const custom = selected.filter((s) => !curatedNames.includes(s.toLowerCase()));
        return (
          <div key={category} className="rounded-xl border border-[var(--land-border)] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--land-bright)]">{category}</h3>
              {selected.length > 0 && (
                <span className="text-xs text-[var(--land-muted)]">{selected.length}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => {
                const on = selected.includes(tool.name);
                return (
                  <button
                    key={tool.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(category, tool.name)}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                      on
                        ? "border-[var(--land-accent)] bg-[var(--land-accent)]/10 text-[var(--land-bright)]"
                        : "border-[var(--land-border)] text-[var(--land-body)] hover:border-[var(--land-accent)]/60"
                    }`}
                  >
                    <ToolIcon slug={tool.slug} name={tool.name} />
                    <span>{tool.name}</span>
                    {on && <span className="text-[var(--land-accent)]" aria-hidden="true">✓</span>}
                  </button>
                );
              })}

              {/* custom-added skills for this category (removable) */}
              {custom.map((name) => (
                <button
                  key={`c-${name}`}
                  type="button"
                  onClick={() => toggle(category, name)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--land-accent)] bg-[var(--land-accent)]/10 px-3.5 py-2 text-sm font-medium text-[var(--land-bright)]"
                  title={t("stackRemove")}
                >
                  <span>{name}</span>
                  <span className="text-[var(--land-muted)]" aria-hidden="true">✕</span>
                </button>
              ))}
            </div>

            <AddOther
              onAdd={(v) => addCustom(category, v)}
              placeholder={t("stackOtherPlaceholder")}
              addLabel={t("stackAdd")}
            />
          </div>
        );
      })}

      <p className="text-xs text-[var(--land-muted)]">
        {totalSelected > 0 ? t("stackCount", { count: totalSelected }) : t("stackEmptyHint")}
      </p>
    </div>
  );
}
