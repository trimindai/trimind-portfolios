"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("builder.creative");
  const projects = data.projects || [];
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const LINK_KINDS = [
    { value: "demo", label: t("linkKindDemo") },
    { value: "video", label: t("linkKindVideo") },
    { value: "external", label: t("linkKindExternal") },
    { value: "repo", label: t("linkKindRepo") },
    { value: "paper", label: t("linkKindPaper") },
  ];

  const BLOCK_KINDS = [
    { value: "paragraph", label: t("blockKindParagraph") },
    { value: "image", label: t("blockKindImage") },
    { value: "imageGrid", label: t("blockKindImageGrid") },
    { value: "video", label: t("blockKindVideo") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("galleryHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          {t.rich("galleryIntro", { em: (chunks) => <em>{chunks}</em> })}
        </p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-border)] rounded-lg p-4 text-sm text-[var(--land-body)]">
        <strong className="text-[var(--land-bright)]">{t("galleryTipLabel")}</strong> {t("galleryTip")}
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
          meta: { type: "", year: "", role: "", duration: "" },
          links: [] as any[],
          blocks: [] as any[],
        })}
        maxItems={20}
        addLabel={t("galleryAddWork")}
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
                  {isExpanded ? t("galleryCollapse") : t("galleryDetailToggle")}
                </button>
                {item.slug && (
                  <span className="text-xs bg-[var(--land-accent)]/15 text-[var(--land-accent-hover)] px-2 py-0.5 rounded">
                    {t("galleryHasDetail")}
                  </span>
                )}
              </div>

              <TextField
                label={t("galleryItemTitle")}
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder={t("galleryItemTitlePlaceholder")}
                hint={t("galleryItemTitleHint")}
              />

              <TextField
                label={t("galleryCoverUrl")}
                value={item.coverUrl || ""}
                onChange={(v) => update({ coverUrl: v })}
                placeholder={t("galleryCoverUrlPlaceholder")}
                hint={t("galleryCoverUrlHint")}
              />

              <TextField
                label={t("galleryLink")}
                value={item.link || ""}
                onChange={(v) => update({ link: v })}
                placeholder={t("galleryLinkPlaceholder")}
                hint={t("galleryLinkHint")}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label={t("galleryType")}
                  value={item.meta?.type || ""}
                  onChange={(v) => update({ meta: { ...item.meta, type: v } })}
                  placeholder={t("galleryTypePlaceholder")}
                  hint={t("galleryTypeHint")}
                  examples={t.raw("galleryTypeExamples") as string[]}
                />
                <TextField
                  label={t("galleryYear")}
                  value={item.meta?.year || ""}
                  onChange={(v) => update({ meta: { ...item.meta, year: v } })}
                  placeholder={t("galleryYearPlaceholder")}
                />
              </div>

              <TextareaField
                label={t("galleryDescription")}
                value={item.description}
                onChange={(v) => update({ description: v })}
                placeholder={t("galleryDescriptionPlaceholder")}
                rows={2}
                hint={t("galleryDescriptionHint")}
              />

              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                  {t("galleryTools")}
                </label>
                <input
                  value={(item.technologies || []).join(", ")}
                  onChange={(e) =>
                    update({
                      technologies: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder={t("galleryToolsPlaceholder")}
                  className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                />
                <p className="text-xs text-[var(--land-muted)] mt-1">{t("galleryToolsHint")}</p>
              </div>

              {isExpanded && (
                <div className="space-y-5 mt-2 pt-4 border-t border-[var(--land-border)]">
                  <h4 className="text-sm font-semibold text-[var(--land-accent-hover)] uppercase tracking-wider">
                    {t("galleryDetailHeading")}
                  </h4>
                  <p className="text-xs text-[var(--land-muted)]">
                    {t("galleryDetailHint")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <TextField
                        label={t("gallerySlug")}
                        value={item.slug || ""}
                        onChange={(v) => update({ slug: v })}
                        placeholder={t("gallerySlugPlaceholder")}
                        hint={t("gallerySlugHint")}
                      />
                      {item.title && !item.slug && (
                        <button
                          type="button"
                          onClick={() => update({ slug: slugify(item.title) })}
                          className="text-xs text-[var(--land-accent-hover)] hover:text-[var(--land-accent)] mt-1 transition-colors"
                        >
                          {t("gallerySlugGenerate")}
                        </button>
                      )}
                    </div>
                    <TextField
                      label={t("galleryTagline")}
                      value={item.tagline || ""}
                      onChange={(v) => update({ tagline: v })}
                      placeholder={t("galleryTaglinePlaceholder")}
                      hint={t("galleryTaglineHint")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextField
                      label={t("galleryRole")}
                      value={item.meta?.role || ""}
                      onChange={(v) => update({ meta: { ...item.meta, role: v } })}
                      placeholder={t("galleryRolePlaceholder")}
                      examples={t.raw("galleryRoleExamples") as string[]}
                    />
                    <TextField
                      label={t("galleryDuration")}
                      value={item.meta?.duration || ""}
                      onChange={(v) => update({ meta: { ...item.meta, duration: v } })}
                      placeholder={t("galleryDurationPlaceholder")}
                    />
                  </div>

                  {/* Links: live site / video / press */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">{t("galleryLinksHeading")}</h5>
                    <p className="text-xs text-[var(--land-muted)] mb-2">
                      {t("galleryLinksHint")}
                    </p>
                    <DynamicList
                      items={item.links || []}
                      onChange={(links) => update({ links })}
                      createEmpty={() => ({ kind: "demo" as string, label: "", url: "" })}
                      maxItems={6}
                      addLabel={t("galleryAddLink")}
                      renderItem={(link, _, updateLink) => (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("galleryLinkType")}</label>
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
                          <TextField label={t("galleryLinkLabel")} value={link.label} onChange={(v) => updateLink({ label: v })} placeholder={t("galleryLinkLabelPlaceholder")} />
                          <TextField label={t("galleryLinkUrl")} value={link.url} onChange={(v) => updateLink({ url: v })} placeholder={t("galleryLinkUrlPlaceholder")} />
                        </div>
                      )}
                    />
                  </div>

                  {/* Content blocks: the case-study body */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--land-bright)] mb-2">{t("galleryBlocksHeading")}</h5>
                    <p className="text-xs text-[var(--land-muted)] mb-2">
                      {t("galleryBlocksHint")}
                    </p>
                    <DynamicList
                      items={item.blocks || []}
                      onChange={(blocks) => update({ blocks })}
                      createEmpty={() => ({ kind: "paragraph" as string, body: "" })}
                      maxItems={20}
                      addLabel={t("galleryAddBlock")}
                      renderItem={(block, _, updateBlock) => (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("galleryBlockType")}</label>
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
                              label={t("galleryBlockText")}
                              value={block.body || ""}
                              onChange={(v) => updateBlock({ body: v })}
                              placeholder={t("galleryBlockTextPlaceholder")}
                              rows={3}
                            />
                          )}

                          {block.kind === "image" && (
                            <div className="space-y-2">
                              <TextField label={t("galleryBlockImageUrl")} value={block.url || ""} onChange={(v) => updateBlock({ url: v })} placeholder={t("galleryBlockImageUrlPlaceholder")} />
                              <TextField label={t("galleryBlockCaption")} value={block.caption || ""} onChange={(v) => updateBlock({ caption: v })} placeholder={t("galleryBlockCaptionPlaceholder")} />
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={block.fullBleed || false}
                                  onChange={(e) => updateBlock({ fullBleed: e.target.checked })}
                                  className="w-4 h-4 rounded border-[var(--land-border)] text-[var(--land-accent)] focus:ring-[var(--land-accent)] bg-[var(--land-surface-raised)]"
                                />
                                <span className="text-sm text-[var(--land-body)]">{t("galleryBlockFullBleed")}</span>
                              </label>
                            </div>
                          )}

                          {block.kind === "imageGrid" && (
                            <div className="space-y-2">
                              <p className="text-xs text-[var(--land-muted)]">{t("galleryBlockGridHint")}</p>
                              <TextareaField
                                label={t("galleryBlockImages")}
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
                                placeholder={t("galleryBlockImagesPlaceholder")}
                                rows={3}
                              />
                            </div>
                          )}

                          {block.kind === "video" && (
                            <div className="space-y-2">
                              <TextField
                                label={t("galleryBlockVideoUrl")}
                                value={block.url || ""}
                                onChange={(v) => updateBlock({ url: v })}
                                placeholder={t("galleryBlockVideoUrlPlaceholder")}
                                hint={t("galleryBlockVideoUrlHint")}
                              />
                              <TextField label={t("galleryBlockCaption")} value={block.caption || ""} onChange={(v) => updateBlock({ caption: v })} placeholder={t("galleryBlockVideoCaptionPlaceholder")} />
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
