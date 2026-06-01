"use client";

import { useState } from "react";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface CreativeGalleryStepProps {
  data: any;
  onChange: (updates: any) => void;
}

const LINK_KINDS = [
  { value: "demo", label: "Live Site / App" },
  { value: "video", label: "Video" },
  { value: "external", label: "Link" },
  { value: "repo", label: "Source Code" },
  { value: "paper", label: "Press / Article" },
];

const BLOCK_KINDS = [
  { value: "paragraph", label: "Text" },
  { value: "image", label: "Single Image" },
  { value: "imageGrid", label: "Image Grid" },
  { value: "video", label: "Video Embed" },
];

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
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">Your Work</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          Each piece becomes a card in the rotating 3D cone and the gallery grid. The cover image is
          what visitors see first. Open <em>Detail page</em> to build a full case study with images,
          videos, and text — perfect for projects, UI/UX work, photography series, or live sites.
        </p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-border)] rounded-lg p-4 text-sm text-[var(--land-body)]">
        <strong className="text-[var(--land-bright)]">Tip:</strong> Use a direct image URL for each cover
        (portrait / 3:4 looks best in the cone). Add a slug to unlock the detail page, where you can embed
        videos (YouTube, Vimeo, or .mp4), image galleries, and link out to the live site or app.
      </div>

      <DynamicList
        items={projects}
        onChange={(items) => onChange({ projects: items })}
        createEmpty={() => ({
          title: "",
          description: "",
          coverUrl: "",
          slug: "",
          tagline: "",
          technologies: [] as string[],
          meta: { type: "", year: "", role: "", duration: "" },
          links: [] as any[],
          blocks: [] as any[],
        })}
        maxItems={20}
        addLabel="Add Work"
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
                  {isExpanded ? "Collapse" : "Detail page (case study)"}
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
                placeholder="https://example.com/cover.jpg"
                hint="Direct link to the image. Portrait (3:4) looks best in the cone."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label="Type / Medium"
                  value={item.meta?.type || ""}
                  onChange={(v) => update({ meta: { ...item.meta, type: v } })}
                  placeholder="UI/UX"
                  hint="Shown as the card category"
                  examples={[
                    "Painting",
                    "Photography",
                    "UI/UX",
                    "Branding",
                    "Interior",
                    "3D / Motion",
                    "Illustration",
                    "Web Design",
                  ]}
                />
                <TextField
                  label="Year"
                  value={item.meta?.year || ""}
                  onChange={(v) => update({ meta: { ...item.meta, year: v } })}
                  placeholder="2024"
                />
              </div>

              <TextareaField
                label="Short Description"
                value={item.description}
                onChange={(v) => update({ description: v })}
                placeholder="A brand system and responsive site for a Gulf coffee roaster..."
                rows={2}
                hint="One or two lines. Shown on the detail page."
              />

              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                  Tools / Materials
                </label>
                <input
                  value={(item.technologies || []).join(", ")}
                  onChange={(e) =>
                    update({
                      technologies: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Figma, Photoshop, Oil on canvas, Next.js"
                  className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                />
                <p className="text-xs text-[var(--land-muted)] mt-1">Comma-separated. Shown as tags on the detail page.</p>
              </div>

              {isExpanded && (
                <div className="space-y-5 mt-2 pt-4 border-t border-[var(--land-border)]">
                  <h4 className="text-sm font-semibold text-[var(--land-accent-hover)] uppercase tracking-wider">
                    Detail Page
                  </h4>
                  <p className="text-xs text-[var(--land-muted)]">
                    Add a slug to give this piece its own page with a zoomable cover, content blocks, and links.
                    Leave the slug empty to keep it as a card only.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      placeholder="Brand & site for a desert coffee roaster"
                      hint="Subtitle on the detail page"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextField
                      label="Role / Context"
                      value={item.meta?.role || ""}
                      onChange={(v) => update({ meta: { ...item.meta, role: v } })}
                      placeholder="Lead Designer"
                      examples={["Lead Designer", "Solo", "Art Director", "Photographer", "Commission"]}
                    />
                    <TextField
                      label="Dimensions / Duration"
                      value={item.meta?.duration || ""}
                      onChange={(v) => update({ meta: { ...item.meta, duration: v } })}
                      placeholder="120 × 90 cm  ·  or  ·  6 weeks"
                    />
                  </div>

                  {/* Links: live site / video / press */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">Links</h5>
                    <p className="text-xs text-[var(--land-muted)] mb-2">
                      Live site or app, a video, press coverage, or source code.
                    </p>
                    <DynamicList
                      items={item.links || []}
                      onChange={(links) => update({ links })}
                      createEmpty={() => ({ kind: "demo" as string, label: "", url: "" })}
                      maxItems={6}
                      addLabel="Add Link"
                      renderItem={(link, _, updateLink) => (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">Type</label>
                            <select
                              value={link.kind}
                              onChange={(e) => updateLink({ kind: e.target.value })}
                              className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                            >
                              {LINK_KINDS.map((k) => (
                                <option key={k.value} value={k.value}>{k.label}</option>
                              ))}
                            </select>
                          </div>
                          <TextField label="Label" value={link.label} onChange={(v) => updateLink({ label: v })} placeholder="View Live Site" />
                          <TextField label="URL" value={link.url} onChange={(v) => updateLink({ url: v })} placeholder="https://..." />
                        </div>
                      )}
                    />
                  </div>

                  {/* Content blocks: the case-study body */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">Content Blocks</h5>
                    <p className="text-xs text-[var(--land-muted)] mb-2">
                      Build the page as a story — text, images, image grids, and embedded videos in any order.
                    </p>
                    <DynamicList
                      items={item.blocks || []}
                      onChange={(blocks) => update({ blocks })}
                      createEmpty={() => ({ kind: "paragraph" as string, body: "" })}
                      maxItems={20}
                      addLabel="Add Block"
                      renderItem={(block, _, updateBlock) => (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">Block Type</label>
                            <select
                              value={block.kind}
                              onChange={(e) => updateBlock({ kind: e.target.value })}
                              className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                            >
                              {BLOCK_KINDS.map((k) => (
                                <option key={k.value} value={k.value}>{k.label}</option>
                              ))}
                            </select>
                          </div>

                          {block.kind === "paragraph" && (
                            <TextareaField
                              label="Text"
                              value={block.body || ""}
                              onChange={(v) => updateBlock({ body: v })}
                              placeholder="Describe the concept, process, or outcome..."
                              rows={3}
                            />
                          )}

                          {block.kind === "image" && (
                            <div className="space-y-2">
                              <TextField label="Image URL" value={block.url || ""} onChange={(v) => updateBlock({ url: v })} placeholder="https://example.com/shot.jpg" />
                              <TextField label="Caption" value={block.caption || ""} onChange={(v) => updateBlock({ caption: v })} placeholder="Final composition" />
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={block.fullBleed || false}
                                  onChange={(e) => updateBlock({ fullBleed: e.target.checked })}
                                  className="w-4 h-4 rounded border-[var(--land-border)] text-[var(--land-accent)] focus:ring-[var(--land-accent)] bg-[var(--land-surface-raised)]"
                                />
                                <span className="text-sm text-[var(--land-body)]">Full-width image</span>
                              </label>
                            </div>
                          )}

                          {block.kind === "imageGrid" && (
                            <div className="space-y-2">
                              <p className="text-xs text-[var(--land-muted)]">One image per line. Add a caption after a | character.</p>
                              <TextareaField
                                label="Images"
                                value={
                                  (block.images || [])
                                    .map((img: any) => (img.caption ? `${img.url}|${img.caption}` : img.url))
                                    .join("\n")
                                }
                                onChange={(v) =>
                                  updateBlock({
                                    images: v
                                      .split("\n")
                                      .filter(Boolean)
                                      .map((line: string) => {
                                        const [url, ...rest] = line.split("|");
                                        return { url: url.trim(), caption: rest.join("|").trim() || undefined };
                                      }),
                                  })
                                }
                                placeholder={"https://example.com/1.jpg|Detail\nhttps://example.com/2.jpg|Process"}
                                rows={3}
                              />
                            </div>
                          )}

                          {block.kind === "video" && (
                            <div className="space-y-2">
                              <TextField
                                label="Video URL"
                                value={block.url || ""}
                                onChange={(v) => updateBlock({ url: v })}
                                placeholder="https://youtube.com/watch?v=...  ·  vimeo.com/...  ·  .mp4"
                                hint="YouTube, Vimeo, or a direct .mp4/.webm link — embedded inline."
                              />
                              <TextField label="Caption" value={block.caption || ""} onChange={(v) => updateBlock({ caption: v })} placeholder="Walkthrough / reel" />
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
