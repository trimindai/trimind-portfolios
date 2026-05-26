"use client";

import { useState } from "react";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface CreativeGalleryStepProps {
  data: any;
  onChange: (updates: any) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CreativeGalleryStep({ data, onChange }: CreativeGalleryStepProps) {
  const projects = data.projects || [];
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Your Gallery</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          Each piece becomes a card in the rotating 3D cone and the gallery grid.
          The cover image is what visitors see — add at least a few to bring the cone to life.
        </p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-border)] rounded-lg p-4 text-sm text-[var(--land-body)]">
        <strong className="text-[var(--land-bright)]">Tip:</strong> Use a direct image URL for each cover
        (portrait / 3:4 works best). Paste links from your own hosting, Cloudinary, or an image you uploaded elsewhere.
        Add a slug to give a piece its own zoomable detail page.
      </div>

      <DynamicList
        items={projects}
        onChange={(items) => onChange({ projects: items })}
        createEmpty={() => ({
          title: "",
          description: "",
          coverUrl: "",
          link: "",
          slug: "",
          tagline: "",
          technologies: [] as string[],
          meta: { year: "", role: "", duration: "" },
        })}
        maxItems={16}
        addLabel="Add Artwork"
        renderItem={(item, index, update, stableKey) => {
          const isExpanded = expandedKey === stableKey;

          return (
            <div className="space-y-4 pr-16">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[var(--land-muted)]">
                  #{String(index + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedKey(isExpanded ? null : stableKey)}
                  className="text-xs text-[var(--land-accent-hover)] hover:text-[var(--land-accent)] transition-colors"
                >
                  {isExpanded ? "Collapse" : "Detail page & extras"}
                </button>
                {item.slug && (
                  <span className="text-xs bg-[var(--land-accent)]/15 text-[var(--land-accent-hover)] px-2 py-0.5 rounded">
                    Has detail page
                  </span>
                )}
              </div>

              <TextField
                label="Title"
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder="Echoes of Sand"
                hint="Shown on the card and as the page heading"
              />

              <TextField
                label="Cover Image URL"
                value={item.coverUrl || ""}
                onChange={(v) => update({ coverUrl: v })}
                placeholder="https://example.com/artwork.jpg"
                hint="Direct link to the image. Portrait (3:4) looks best in the cone."
              />

              <TextareaField
                label="Short Description"
                value={item.description}
                onChange={(v) => update({ description: v })}
                placeholder="Oil and sand on linen — an exploration of memory and erosion."
                rows={2}
                hint="One or two lines. Shown on the detail page."
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Medium"
                  value={(item.technologies || [])[0] || ""}
                  onChange={(v) => update({ technologies: v ? [v] : [] })}
                  placeholder="Oil on linen"
                  hint="e.g. Oil on canvas, Digital, Bronze"
                />
                <TextField
                  label="Year"
                  value={item.meta?.year || ""}
                  onChange={(v) => update({ meta: { ...item.meta, year: v } })}
                  placeholder="2024"
                />
              </div>

              {isExpanded && (
                <div className="space-y-4 mt-2 pt-4 border-t border-[var(--land-border)]">
                  <h4 className="text-sm font-semibold text-[var(--land-accent-hover)] uppercase tracking-wider">
                    Detail Page
                  </h4>
                  <p className="text-xs text-[var(--land-muted)]">
                    Give this piece a slug and it gets its own page with a full-screen zoomable view.
                    Leave the slug empty to keep it as a card only.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <TextField
                        label="URL Slug"
                        value={item.slug || ""}
                        onChange={(v) => update({ slug: v })}
                        placeholder="echoes-of-sand"
                        hint="Creates /p/yourname/projects/slug"
                      />
                      {item.title && !item.slug && (
                        <button
                          type="button"
                          onClick={() => update({ slug: slugify(item.title) })}
                          className="text-xs text-[var(--land-accent-hover)] hover:text-[var(--land-accent)] mt-1 transition-colors"
                        >
                          Generate from title
                        </button>
                      )}
                    </div>
                    <TextField
                      label="Tagline"
                      value={item.tagline || ""}
                      onChange={(v) => update({ tagline: v })}
                      placeholder="A meditation on the desert's memory"
                      hint="Subtitle on the detail page"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="Role / Context"
                      value={item.meta?.role || ""}
                      onChange={(v) => update({ meta: { ...item.meta, role: v } })}
                      placeholder="Commission"
                      examples={["Commission", "Personal work", "Series", "Collaboration"]}
                    />
                    <TextField
                      label="Dimensions / Duration"
                      value={item.meta?.duration || ""}
                      onChange={(v) => update({ meta: { ...item.meta, duration: v } })}
                      placeholder="120 × 90 cm"
                    />
                  </div>

                  <TextField
                    label="External Link (optional)"
                    value={item.link || ""}
                    onChange={(v) => update({ link: v })}
                    placeholder="https://shop.example.com/echoes-of-sand"
                    hint="If set and there's no slug, the card links here (e.g. a shop or article)."
                  />
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
