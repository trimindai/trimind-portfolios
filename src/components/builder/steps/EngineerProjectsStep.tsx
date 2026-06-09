"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface EngineerProjectsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function EngineerProjectsStep({ data, onChange }: EngineerProjectsStepProps) {
  const t = useTranslations("builder.engineer");
  const projects = data.projects || [];
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const PROJECT_TYPES = [
    { value: "", label: t("projTypeSelect") },
    { value: "academic", label: t("projTypeAcademic") },
    { value: "industrial", label: t("projTypeIndustrial") },
    { value: "personal", label: t("projTypePersonal") },
    { value: "research", label: t("projTypeResearch") },
  ];

  const LINK_KINDS = [
    { value: "report", label: t("projLinkKindReport") },
    { value: "repo", label: t("projLinkKindRepo") },
    { value: "demo", label: t("projLinkKindDemo") },
    { value: "paper", label: t("projLinkKindPaper") },
    { value: "video", label: t("projLinkKindVideo") },
    { value: "external", label: t("projLinkKindExternal") },
  ];

  const BLOCK_KINDS = [
    { value: "paragraph", label: t("projBlockParagraph") },
    { value: "image", label: t("projBlockImage") },
    { value: "imageGrid", label: t("projBlockImageGrid") },
    { value: "specs", label: t("projBlockSpecs") },
    { value: "standards", label: t("projBlockStandards") },
    { value: "challenge", label: t("projBlockChallenge") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("projHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          {t("projIntro")}
        </p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-blue-900/30 rounded-lg p-4 text-sm text-blue-300/80">
        <strong>{t("projTipTitle")}</strong> {t("projTipBody")}
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
        addLabel={t("projAddLabel")}
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
                    {isExpanded ? t("projCollapse") : t("projExpand")}
                  </button>
                  {item.slug && (
                    <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">
                      {t("projHasDetailPage")}
                    </span>
                  )}
                </div>
              </div>

              {/* Core fields — always visible */}
              <TextField
                label={t("projTitleLabel")}
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder={t("projTitlePlaceholder")}
                hint={t("projTitleHint")}
              />

              <TextareaField
                label={t("projDescLabel")}
                value={item.description}
                onChange={(v) => update({ description: v })}
                placeholder={t("projDescPlaceholder")}
                rows={2}
                hint={t("projDescHint")}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("projTypeLabel")}</label>
                  <select
                    value={item.meta?.type || ""}
                    onChange={(e) => update({ meta: { ...item.meta, type: e.target.value } })}
                    className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <TextField
                  label={t("projYearLabel")}
                  value={item.meta?.year || ""}
                  onChange={(v) => update({ meta: { ...item.meta, year: v } })}
                  placeholder={t("projYearPlaceholder")}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("projTechLabel")}</label>
                <input
                  value={(item.technologies || []).join(", ")}
                  onChange={(e) => update({ technologies: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                  placeholder={t("projTechPlaceholder")}
                  className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                />
                <p className="text-xs text-[var(--land-muted)] mt-1">{t("projCommaSeparated")}</p>
              </div>

              <TextField
                label={t("projCoverLabel")}
                value={item.coverUrl || ""}
                onChange={(v) => update({ coverUrl: v })}
                placeholder={t("projCoverPlaceholder")}
                hint={t("projCoverHint")}
              />

              {/* Expanded detail fields */}
              {isExpanded && (
                <div className="space-y-4 mt-4 pt-4 border-t border-[var(--land-border)]">
                  <h4 className="text-sm font-semibold text-[var(--land-accent-hover)] uppercase tracking-wider">{t("projDetailHeading")}</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <TextField
                        label={t("projSlugLabel")}
                        value={item.slug || ""}
                        onChange={(v) => update({ slug: v })}
                        placeholder={t("projSlugPlaceholder")}
                        hint={t("projSlugHint")}
                      />
                      {item.title && !item.slug && (
                        <button
                          type="button"
                          onClick={() => update({ slug: slugify(item.title) })}
                          className="text-xs text-[var(--land-accent-hover)] hover:text-[var(--land-accent)] mt-1 transition-colors"
                        >
                          {t("projGenerateFromTitle")}
                        </button>
                      )}
                    </div>
                    <TextField
                      label={t("projTaglineLabel")}
                      value={item.tagline || ""}
                      onChange={(v) => update({ tagline: v })}
                      placeholder={t("projTaglinePlaceholder")}
                      hint={t("projTaglineHint")}
                    />
                  </div>

                  {/* Project Meta */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-3">{t("projMetaHeading")}</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <TextField
                        label={t("projInstitutionLabel")}
                        value={item.meta?.institution || ""}
                        onChange={(v) => update({ meta: { ...item.meta, institution: v } })}
                        placeholder={t("projInstitutionPlaceholder")}
                      />
                      <TextField
                        label={t("projCourseCodeLabel")}
                        value={item.meta?.courseCode || ""}
                        onChange={(v) => update({ meta: { ...item.meta, courseCode: v } })}
                        placeholder={t("projCourseCodePlaceholder")}
                      />
                      <TextField
                        label={t("projRoleLabel")}
                        value={item.meta?.role || ""}
                        onChange={(v) => update({ meta: { ...item.meta, role: v } })}
                        placeholder={t("projRolePlaceholder")}
                        examples={t.raw("projRoleExamples") as string[]}
                      />
                      <TextField
                        label={t("projTeamSizeLabel")}
                        value={item.meta?.teamSize?.toString() || ""}
                        onChange={(v) => update({ meta: { ...item.meta, teamSize: v ? parseInt(v, 10) || undefined : undefined } })}
                        placeholder={t("projTeamSizePlaceholder")}
                      />
                      <TextField
                        label={t("projDurationLabel")}
                        value={item.meta?.duration || ""}
                        onChange={(v) => update({ meta: { ...item.meta, duration: v } })}
                        placeholder={t("projDurationPlaceholder")}
                        examples={t.raw("projDurationExamples") as string[]}
                      />
                    </div>
                  </div>

                  {/* KPIs / Metrics */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">{t("projMetricsHeading")}</h5>
                    <p className="text-xs text-[var(--land-muted)] mb-2">{t("projMetricsIntro")}</p>
                    <DynamicList
                      items={item.metrics || []}
                      onChange={(m) => update({ metrics: m })}
                      createEmpty={() => ({ value: "", label: "" })}
                      maxItems={4}
                      addLabel={t("projAddMetric")}
                      renderItem={(kpi, _, updateKpi) => (
                        <div className="grid grid-cols-2 gap-3">
                          <TextField label={t("projMetricValueLabel")} value={kpi.value} onChange={(v) => updateKpi({ value: v })} placeholder={t("projMetricValuePlaceholder")} examples={t.raw("projMetricValueExamples") as string[]} />
                          <TextField label={t("projMetricLabelLabel")} value={kpi.label} onChange={(v) => updateKpi({ label: v })} placeholder={t("projMetricLabelPlaceholder")} examples={t.raw("projMetricLabelExamples") as string[]} />
                        </div>
                      )}
                    />
                  </div>

                  {/* Links */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">{t("projLinksHeading")}</h5>
                    <DynamicList
                      items={item.links || []}
                      onChange={(links) => update({ links })}
                      createEmpty={() => ({ kind: "repo" as string, label: "", url: "" })}
                      maxItems={5}
                      addLabel={t("projAddLink")}
                      renderItem={(link, _, updateLink) => (
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("projLinkTypeLabel")}</label>
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
                          <TextField label={t("projLinkLabelLabel")} value={link.label} onChange={(v) => updateLink({ label: v })} placeholder={t("projLinkLabelPlaceholder")} />
                          <TextField label={t("projLinkUrlLabel")} value={link.url} onChange={(v) => updateLink({ url: v })} placeholder={t("projLinkUrlPlaceholder")} />
                        </div>
                      )}
                    />
                  </div>

                  {/* Content Blocks */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">{t("projBlocksHeading")}</h5>
                    <p className="text-xs text-[var(--land-muted)] mb-2">
                      {t("projBlocksIntro")}
                    </p>
                    <DynamicList
                      items={item.blocks || []}
                      onChange={(blocks) => update({ blocks })}
                      createEmpty={() => ({ kind: "paragraph" as string, body: "" })}
                      maxItems={12}
                      addLabel={t("projAddBlock")}
                      renderItem={(block, _, updateBlock) => (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("projBlockTypeLabel")}</label>
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

                          {/* Paragraph */}
                          {block.kind === "paragraph" && (
                            <TextareaField
                              label={t("projParagraphLabel")}
                              value={block.body || ""}
                              onChange={(v) => updateBlock({ body: v })}
                              placeholder={t("projParagraphPlaceholder")}
                              rows={3}
                            />
                          )}

                          {/* Single Image */}
                          {block.kind === "image" && (
                            <div className="space-y-2">
                              <TextField label={t("projImageUrlLabel")} value={block.url || ""} onChange={(v) => updateBlock({ url: v })} placeholder={t("projImageUrlPlaceholder")} />
                              <TextField label={t("projCaptionLabel")} value={block.caption || ""} onChange={(v) => updateBlock({ caption: v })} placeholder={t("projCaptionPlaceholder")} />
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={block.fullBleed || false}
                                  onChange={(e) => updateBlock({ fullBleed: e.target.checked })}
                                  className="w-4 h-4 rounded border-[var(--land-border)] text-[var(--land-accent)] focus:ring-[var(--land-accent)] bg-[var(--land-surface-raised)]"
                                />
                                <span className="text-sm text-[var(--land-body)]">{t("projFullBleed")}</span>
                              </label>
                            </div>
                          )}

                          {/* Image Grid */}
                          {block.kind === "imageGrid" && (
                            <div className="space-y-2">
                              <p className="text-xs text-[var(--land-muted)]">{t("projImageGridHint")}</p>
                              <TextareaField
                                label={t("projImagesLabel")}
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
                                placeholder={t("projImagesPlaceholder")}
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
                                addLabel={t("projAddSpec")}
                                renderItem={(spec, _, updateSpec) => (
                                  <div className="grid grid-cols-2 gap-3">
                                    <TextField label={t("projSpecLabelLabel")} value={spec.label} onChange={(v) => updateSpec({ label: v })} placeholder={t("projSpecLabelPlaceholder")} />
                                    <TextField label={t("projSpecValueLabel")} value={spec.value} onChange={(v) => updateSpec({ value: v })} placeholder={t("projSpecValuePlaceholder")} />
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
                                addLabel={t("projAddStandard")}
                                renderItem={(std, _, updateStd) => (
                                  <div className="grid grid-cols-2 gap-3">
                                    <TextField label={t("projStandardCodeLabel")} value={std.label} onChange={(v) => updateStd({ label: v })} placeholder={t("projStandardCodePlaceholder")} />
                                    <TextField label={t("projStandardDescLabel")} value={std.value} onChange={(v) => updateStd({ value: v })} placeholder={t("projStandardDescPlaceholder")} />
                                  </div>
                                )}
                              />
                            </div>
                          )}

                          {/* Challenge / Solution */}
                          {block.kind === "challenge" && (
                            <div className="space-y-3">
                              <TextareaField
                                label={t("projChallengeLabel")}
                                value={block.problem || ""}
                                onChange={(v) => updateBlock({ problem: v })}
                                placeholder={t("projChallengePlaceholder")}
                                rows={2}
                              />
                              <TextareaField
                                label={t("projSolutionLabel")}
                                value={block.solution || ""}
                                onChange={(v) => updateBlock({ solution: v })}
                                placeholder={t("projSolutionPlaceholder")}
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
