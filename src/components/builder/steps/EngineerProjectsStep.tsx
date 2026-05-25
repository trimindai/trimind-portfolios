"use client";

import { useState } from "react";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface EngineerProjectsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

const PROJECT_TYPES = [
  { value: "", label: "Select type..." },
  { value: "academic", label: "Academic" },
  { value: "industrial", label: "Industrial" },
  { value: "personal", label: "Personal" },
  { value: "research", label: "Research" },
];

const LINK_KINDS = [
  { value: "report", label: "Report / PDF" },
  { value: "repo", label: "Repository" },
  { value: "demo", label: "Live Demo" },
  { value: "paper", label: "Paper" },
  { value: "video", label: "Video" },
  { value: "external", label: "External Link" },
];

const BLOCK_KINDS = [
  { value: "paragraph", label: "Text Paragraph" },
  { value: "image", label: "Single Image" },
  { value: "imageGrid", label: "Image Grid" },
  { value: "specs", label: "Specs / Data Table" },
  { value: "standards", label: "Standards & Codes" },
  { value: "challenge", label: "Challenge & Solution" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function EngineerProjectsStep({ data, onChange }: EngineerProjectsStepProps) {
  const projects = data.projects || [];
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Projects</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          Showcase your engineering work. Each project gets a card on the main page.
          Add a slug to create a full detail page with narrative blocks.
        </p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-blue-900/30 rounded-lg p-4 text-sm text-blue-300/80">
        <strong>Tip:</strong> Add 2-5 of your strongest projects. Include a cover image for visual impact.
        Projects with a slug get their own dedicated page with images, specs, and challenge/solution narratives.
      </div>

      <DynamicList
        items={projects}
        onChange={(items) => onChange({ projects: items })}
        createEmpty={() => ({
          title: "",
          description: "",
          technologies: [] as string[],
          slug: "",
          tagline: "",
          coverUrl: "",
          meta: { type: "" as string, year: "", courseCode: "", institution: "", teamSize: undefined as number | undefined, role: "", duration: "" },
          blocks: [] as any[],
          links: [] as any[],
          metrics: [] as any[],
        })}
        maxItems={8}
        addLabel="Add Project"
        renderItem={(item, index, update, stableKey) => {
          const isExpanded = expandedKey === stableKey;

          return (
            <div className="space-y-4 pr-16">
              {/* Header — always visible */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedKey(isExpanded ? null : stableKey)}
                    className="text-xs text-[var(--land-accent-hover)] hover:text-[var(--land-accent)] transition-colors"
                  >
                    {isExpanded ? "Collapse" : "Expand details"}
                  </button>
                  {item.slug && (
                    <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">
                      Has detail page
                    </span>
                  )}
                </div>
              </div>

              {/* Core fields — always visible */}
              <TextField
                label="Project Title"
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder="Smart Irrigation System"
                hint="Concise, descriptive title"
              />

              <TextareaField
                label="Short Description"
                value={item.description}
                onChange={(v) => update({ description: v })}
                placeholder="Designed and built an automated irrigation system using soil moisture sensors, Arduino, and a Raspberry Pi controller..."
                rows={2}
                hint="Shown on the project card. 1-3 sentences."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">Project Type</label>
                  <select
                    value={item.meta?.type || ""}
                    onChange={(e) => update({ meta: { ...item.meta, type: e.target.value } })}
                    className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <TextField
                  label="Year"
                  value={item.meta?.year || ""}
                  onChange={(v) => update({ meta: { ...item.meta, year: v } })}
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">Technologies Used</label>
                <input
                  value={(item.technologies || []).join(", ")}
                  onChange={(e) => update({ technologies: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                  placeholder="Arduino, Raspberry Pi, Python, SolidWorks, MATLAB"
                  className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                />
                <p className="text-xs text-[var(--land-muted)] mt-1">Comma-separated</p>
              </div>

              <TextField
                label="Cover Image URL"
                value={item.coverUrl || ""}
                onChange={(v) => update({ coverUrl: v })}
                placeholder="https://example.com/project-cover.jpg"
                hint="Direct image URL for the project card. 16:10 aspect ratio recommended."
              />

              {/* Expanded detail fields */}
              {isExpanded && (
                <div className="space-y-4 mt-4 pt-4 border-t border-[var(--land-border)]">
                  <h4 className="text-sm font-semibold text-[var(--land-accent-hover)] uppercase tracking-wider">Detail Page Settings</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <TextField
                        label="URL Slug"
                        value={item.slug || ""}
                        onChange={(v) => update({ slug: v })}
                        placeholder="smart-irrigation"
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
                      placeholder="IoT-based precision agriculture for arid climates"
                      hint="Subtitle shown on the detail page"
                    />
                  </div>

                  {/* Project Meta */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-3">Project Metadata</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <TextField
                        label="Institution"
                        value={item.meta?.institution || ""}
                        onChange={(v) => update({ meta: { ...item.meta, institution: v } })}
                        placeholder="Kuwait University"
                      />
                      <TextField
                        label="Course Code"
                        value={item.meta?.courseCode || ""}
                        onChange={(v) => update({ meta: { ...item.meta, courseCode: v } })}
                        placeholder="EE 499"
                      />
                      <TextField
                        label="Your Role"
                        value={item.meta?.role || ""}
                        onChange={(v) => update({ meta: { ...item.meta, role: v } })}
                        placeholder="Lead Designer"
                        examples={["Lead Designer", "Team Lead", "Solo Developer", "Researcher", "CAD Engineer"]}
                      />
                      <TextField
                        label="Team Size"
                        value={item.meta?.teamSize?.toString() || ""}
                        onChange={(v) => update({ meta: { ...item.meta, teamSize: v ? parseInt(v, 10) || undefined : undefined } })}
                        placeholder="4"
                      />
                      <TextField
                        label="Duration"
                        value={item.meta?.duration || ""}
                        onChange={(v) => update({ meta: { ...item.meta, duration: v } })}
                        placeholder="6 months"
                        examples={["3 months", "6 months", "1 year", "2 semesters"]}
                      />
                    </div>
                  </div>

                  {/* KPIs / Metrics */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">Key Results / Metrics</h5>
                    <p className="text-xs text-[var(--land-muted)] mb-2">Quantifiable outcomes of this project</p>
                    <DynamicList
                      items={item.metrics || []}
                      onChange={(m) => update({ metrics: m })}
                      createEmpty={() => ({ value: "", label: "" })}
                      maxItems={4}
                      addLabel="Add Metric"
                      renderItem={(kpi, _, updateKpi) => (
                        <div className="grid grid-cols-2 gap-3">
                          <TextField label="Value" value={kpi.value} onChange={(v) => updateKpi({ value: v })} placeholder="30%" examples={["30%", "4x", "99.5%", "50+ hrs", "$12K"]} />
                          <TextField label="Label" value={kpi.label} onChange={(v) => updateKpi({ label: v })} placeholder="Water Savings" examples={["Water Savings", "Efficiency Gain", "Cost Reduction", "Uptime"]} />
                        </div>
                      )}
                    />
                  </div>

                  {/* Links */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">Project Links</h5>
                    <DynamicList
                      items={item.links || []}
                      onChange={(links) => update({ links })}
                      createEmpty={() => ({ kind: "repo" as string, label: "", url: "" })}
                      maxItems={5}
                      addLabel="Add Link"
                      renderItem={(link, _, updateLink) => (
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">Type</label>
                            <select
                              value={link.kind}
                              onChange={(e) => updateLink({ kind: e.target.value })}
                              className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                            >
                              {LINK_KINDS.map((k) => (
                                <option key={k.value} value={k.value}>{k.label}</option>
                              ))}
                            </select>
                          </div>
                          <TextField label="Label" value={link.label} onChange={(v) => updateLink({ label: v })} placeholder="View Report" />
                          <TextField label="URL" value={link.url} onChange={(v) => updateLink({ url: v })} placeholder="https://..." />
                        </div>
                      )}
                    />
                  </div>

                  {/* Content Blocks */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">Content Blocks</h5>
                    <p className="text-xs text-[var(--land-muted)] mb-2">
                      Build the project detail page as a narrative. Add text, images, specs tables, and challenge/solution sections.
                    </p>
                    <DynamicList
                      items={item.blocks || []}
                      onChange={(blocks) => update({ blocks })}
                      createEmpty={() => ({ kind: "paragraph" as string, body: "" })}
                      maxItems={12}
                      addLabel="Add Block"
                      renderItem={(block, _, updateBlock) => (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">Block Type</label>
                            <select
                              value={block.kind}
                              onChange={(e) => updateBlock({ kind: e.target.value })}
                              className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                            >
                              {BLOCK_KINDS.map((k) => (
                                <option key={k.value} value={k.value}>{k.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Paragraph */}
                          {block.kind === "paragraph" && (
                            <TextareaField
                              label="Content"
                              value={block.body || ""}
                              onChange={(v) => updateBlock({ body: v })}
                              placeholder="Describe this part of the project..."
                              rows={3}
                            />
                          )}

                          {/* Single Image */}
                          {block.kind === "image" && (
                            <div className="space-y-2">
                              <TextField label="Image URL" value={block.url || ""} onChange={(v) => updateBlock({ url: v })} placeholder="https://example.com/diagram.png" />
                              <TextField label="Caption" value={block.caption || ""} onChange={(v) => updateBlock({ caption: v })} placeholder="High-level system architecture" />
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

                          {/* Image Grid */}
                          {block.kind === "imageGrid" && (
                            <div className="space-y-2">
                              <p className="text-xs text-[var(--land-muted)]">Add images as comma-separated URLs (caption after |)</p>
                              <TextareaField
                                label="Images"
                                value={
                                  (block.images || [])
                                    .map((img: any) => img.caption ? `${img.url}|${img.caption}` : img.url)
                                    .join("\n")
                                }
                                onChange={(v) =>
                                  updateBlock({
                                    images: v
                                      .split("\n")
                                      .filter(Boolean)
                                      .map((line: string) => {
                                        const [url, ...captionParts] = line.split("|");
                                        return { url: url.trim(), caption: captionParts.join("|").trim() || undefined };
                                      }),
                                  })
                                }
                                placeholder={"https://example.com/img1.jpg|Front view\nhttps://example.com/img2.jpg|Side view"}
                                rows={3}
                              />
                            </div>
                          )}

                          {/* Specs Table */}
                          {block.kind === "specs" && (
                            <div>
                              <DynamicList
                                items={block.items || []}
                                onChange={(items) => updateBlock({ items })}
                                createEmpty={() => ({ label: "", value: "" })}
                                maxItems={10}
                                addLabel="Add Spec"
                                renderItem={(spec, _, updateSpec) => (
                                  <div className="grid grid-cols-2 gap-3">
                                    <TextField label="Label" value={spec.label} onChange={(v) => updateSpec({ label: v })} placeholder="Voltage Rating" />
                                    <TextField label="Value" value={spec.value} onChange={(v) => updateSpec({ value: v })} placeholder="240V AC" />
                                  </div>
                                )}
                              />
                            </div>
                          )}

                          {/* Standards */}
                          {block.kind === "standards" && (
                            <div>
                              <DynamicList
                                items={block.items || []}
                                onChange={(items) => updateBlock({ items })}
                                createEmpty={() => ({ label: "", value: "" })}
                                maxItems={10}
                                addLabel="Add Standard"
                                renderItem={(std, _, updateStd) => (
                                  <div className="grid grid-cols-2 gap-3">
                                    <TextField label="Code" value={std.label} onChange={(v) => updateStd({ label: v })} placeholder="IEC 61131-3" />
                                    <TextField label="Description" value={std.value} onChange={(v) => updateStd({ value: v })} placeholder="PLC Programming Standard" />
                                  </div>
                                )}
                              />
                            </div>
                          )}

                          {/* Challenge / Solution */}
                          {block.kind === "challenge" && (
                            <div className="space-y-3">
                              <TextareaField
                                label="Challenge / Problem"
                                value={block.problem || ""}
                                onChange={(v) => updateBlock({ problem: v })}
                                placeholder="What was the engineering challenge?"
                                rows={2}
                              />
                              <TextareaField
                                label="Solution / Approach"
                                value={block.solution || ""}
                                onChange={(v) => updateBlock({ solution: v })}
                                placeholder="How did you solve it?"
                                rows={2}
                              />
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
