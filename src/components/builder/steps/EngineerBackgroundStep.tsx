"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface EngineerBackgroundStepProps {
  data: any;
  onChange: (updates: any) => void;
}

type Section = "experience" | "skills" | "education" | "certifications" | "endorsements";

export function EngineerBackgroundStep({ data, onChange }: EngineerBackgroundStepProps) {
  const t = useTranslations("builder.engineer");
  const [activeSection, setActiveSection] = useState<Section>("experience");

  const SECTION_TABS: { id: Section; label: string }[] = [
    { id: "experience", label: t("bgTabExperience") },
    { id: "skills", label: t("bgTabSkills") },
    { id: "education", label: t("bgTabEducation") },
    { id: "certifications", label: t("bgTabCertifications") },
    { id: "endorsements", label: t("bgTabEndorsements") },
  ];

  const experience = data.experience || [];
  const skills = data.skills || [];
  const education = data.education || [];
  const certifications = data.certifications || [];
  const endorsements = data.endorsements || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("bgHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          {t("bgIntro")}
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1 bg-[var(--land-surface-raised)]/50 rounded-lg p-1">
        {SECTION_TABS.map((tab) => {
          const count =
            tab.id === "experience" ? experience.length :
            tab.id === "skills" ? skills.length :
            tab.id === "education" ? education.length :
            tab.id === "certifications" ? certifications.length :
            endorsements.length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeSection === tab.id
                  ? "bg-[var(--land-accent)] text-[var(--land-bright)]"
                  : "text-[var(--land-body)] hover:text-[var(--land-bright)]"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeSection === tab.id ? "bg-[var(--land-accent-hover)]/50" : "bg-[var(--land-border)]"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Experience */}
      {activeSection === "experience" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>{t("bgExpTipTitle")}</strong> {t("bgExpTipBody")}
          </div>
          <DynamicList
            items={experience}
            onChange={(items) => onChange({ experience: items })}
            createEmpty={() => ({ title: "", company: "", startDate: "", endDate: "", description: "", highlights: [] as string[] })}
            maxItems={10}
            addLabel={t("bgAddPosition")}
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label={t("bgJobTitleLabel")} value={item.title} onChange={(v) => update({ title: v })} placeholder={t("bgJobTitlePlaceholder")} examples={t.raw("bgJobTitleExamples") as string[]} />
                  <TextField label={t("bgCompanyLabel")} value={item.company} onChange={(v) => update({ company: v })} placeholder={t("bgCompanyPlaceholder")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label={t("bgStartDateLabel")} value={item.startDate} onChange={(v) => update({ startDate: v })} placeholder={t("bgStartDatePlaceholder")} />
                  <TextField label={t("bgEndDateLabel")} value={item.endDate || ""} onChange={(v) => update({ endDate: v })} placeholder={t("bgEndDatePlaceholder")} hint={t("bgEndDateHint")} />
                </div>
                <TextareaField label={t("bgExpDescLabel")} value={item.description || ""} onChange={(v) => update({ description: v })} placeholder={t("bgExpDescPlaceholder")} rows={2} />
                <TextareaField
                  label={t("bgHighlightsLabel")}
                  value={(item.highlights || []).join("\n")}
                  onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })}
                  placeholder={t("bgHighlightsPlaceholder")}
                  rows={3}
                  hint={t("bgHighlightsHint")}
                />
              </div>
            )}
          />
        </div>
      )}

      {/* Skills */}
      {activeSection === "skills" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--land-body)]">{t("bgSkillsIntro")}</p>
          <DynamicList
            items={skills}
            onChange={(items) => onChange({ skills: items })}
            createEmpty={() => ({ category: "", items: [] as string[] })}
            maxItems={8}
            addLabel={t("bgAddSkillCategory")}
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <TextField
                  label={t("bgCategoryLabel")}
                  value={item.category}
                  onChange={(v) => update({ category: v })}
                  placeholder={t("bgCategoryPlaceholder")}
                  examples={t.raw("bgCategoryExamples") as string[]}
                />
                <div>
                  <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">{t("bgSkillsItemsLabel")}</label>
                  <input
                    value={item.items.join(", ")}
                    onChange={(e) => update({ items: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                    placeholder={t("bgSkillsItemsPlaceholder")}
                    className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          />
        </div>
      )}

      {/* Education */}
      {activeSection === "education" && (
        <div className="space-y-4">
          <DynamicList
            items={education}
            onChange={(items) => onChange({ education: items })}
            createEmpty={() => ({ degree: "", institution: "", year: "", description: "" })}
            maxItems={5}
            addLabel={t("bgAddEducation")}
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label={t("bgDegreeLabel")} value={item.degree} onChange={(v) => update({ degree: v })} placeholder={t("bgDegreePlaceholder")} examples={t.raw("bgDegreeExamples") as string[]} />
                  <TextField label={t("bgEduInstitutionLabel")} value={item.institution} onChange={(v) => update({ institution: v })} placeholder={t("bgEduInstitutionPlaceholder")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label={t("bgEduYearLabel")} value={item.year} onChange={(v) => update({ year: v })} placeholder={t("bgEduYearPlaceholder")} />
                  <TextField label={t("bgGpaLabel")} value={item.description || ""} onChange={(v) => update({ description: v })} placeholder={t("bgGpaPlaceholder")} hint={t("bgGpaHint")} />
                </div>
              </div>
            )}
          />
        </div>
      )}

      {/* Certifications */}
      {activeSection === "certifications" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--land-body)]">{t("bgCertsIntro")}</p>
          <DynamicList
            items={certifications}
            onChange={(items) => onChange({ certifications: items })}
            createEmpty={() => ({ name: "", issuer: "", year: "" })}
            maxItems={10}
            addLabel={t("bgAddCertification")}
            renderItem={(item, _, update) => (
              <div className="grid grid-cols-3 gap-3 pr-16">
                <TextField label={t("bgCertNameLabel")} value={item.name} onChange={(v) => update({ name: v })} placeholder={t("bgCertNamePlaceholder")} examples={t.raw("bgCertNameExamples") as string[]} />
                <TextField label={t("bgIssuerLabel")} value={item.issuer} onChange={(v) => update({ issuer: v })} placeholder={t("bgIssuerPlaceholder")} />
                <TextField label={t("bgCertYearLabel")} value={item.year || ""} onChange={(v) => update({ year: v })} placeholder={t("bgCertYearPlaceholder")} />
              </div>
            )}
          />
        </div>
      )}

      {/* Endorsements */}
      {activeSection === "endorsements" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--land-body)]">{t("bgEndorsementsIntro")}</p>
          <DynamicList
            items={endorsements}
            onChange={(items) => onChange({ endorsements: items })}
            createEmpty={() => ({ quote: "", name: "", title: "", company: "" })}
            maxItems={5}
            addLabel={t("bgAddEndorsement")}
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <TextareaField label={t("bgEndQuoteLabel")} value={item.quote} onChange={(v) => update({ quote: v })} placeholder={t("bgEndQuotePlaceholder")} rows={3} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <TextField label={t("bgEndNameLabel")} value={item.name} onChange={(v) => update({ name: v })} placeholder={t("bgEndNamePlaceholder")} />
                  <TextField label={t("bgEndTitleLabel")} value={item.title} onChange={(v) => update({ title: v })} placeholder={t("bgEndTitlePlaceholder")} />
                  <TextField label={t("bgEndCompanyLabel")} value={item.company} onChange={(v) => update({ company: v })} placeholder={t("bgEndCompanyPlaceholder")} />
                </div>
              </div>
            )}
          />
        </div>
      )}

    </div>
  );
}
