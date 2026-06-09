"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface EndorsementsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

function Accordion({ title, subtitle, count, defaultOpen, children }: { title: string; subtitle: string; count: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-[var(--land-border)] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--land-surface-raised)]/30 hover:bg-[var(--land-surface-raised)]/60 transition-colors text-start"
      >
        <div className="flex items-center gap-2">
          {count > 0 && (
            <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
          <span className="font-medium text-[var(--land-bright)]">{title}</span>
          <span className="text-xs text-[var(--land-muted)] bg-[var(--land-border)]/50 rounded-full px-2 py-0.5">{count}</span>
        </div>
        <svg className={`w-4 h-4 text-[var(--land-muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "2000px" : "0px", opacity: open ? 1 : 0, overflow: "hidden" }}
      >
        <div className="px-4 py-4 space-y-4">
          <p className="text-sm text-[var(--land-body)]">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function EndorsementsStep({ data, onChange }: EndorsementsStepProps) {
  const t = useTranslations("builder.general");
  const endorsements = data.endorsements || [];
  const affiliations = data.professionalAffiliations || [];
  const development = data.continuousDevelopment || [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-2">{t("endHeading")}</h2>
        <p className="text-sm text-[var(--land-body)]">{t("endIntro")}</p>
      </div>

      <Accordion title={t("endAccordionTitle")} subtitle={t("endAccordionSubtitle")} count={endorsements.length} defaultOpen>
        <DynamicList
          items={endorsements}
          onChange={(items) => onChange({ endorsements: items })}
          createEmpty={() => ({ quote: "", name: "", title: "", company: "" })}
          maxItems={5}
          addLabel={t("addEndorsement")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextareaField
                label={t("quoteLabel")}
                value={item.quote}
                onChange={(v) => update({ quote: v })}
                placeholder={t("quotePlaceholder")}
                rows={2}
                writingTips={t.raw("quoteTips") as string[]}
                templates={t.raw("quoteTemplates") as Array<{ label: string; text: string }>}
              />
              <div className="grid grid-cols-3 gap-3">
                <TextField label={t("endNameLabel")} value={item.name} onChange={(v) => update({ name: v })} placeholder={t("endNamePlaceholder")} />
                <TextField label={t("endTitleLabel")} value={item.title} onChange={(v) => update({ title: v })} placeholder={t("endTitlePlaceholder")} />
                <TextField label={t("endCompanyLabel")} value={item.company} onChange={(v) => update({ company: v })} placeholder={t("endCompanyPlaceholder")} />
              </div>
            </div>
          )}
        />
      </Accordion>

      <Accordion title={t("affAccordionTitle")} subtitle={t("affAccordionSubtitle")} count={affiliations.length}>
        <DynamicList
          items={affiliations}
          onChange={(items) => onChange({ professionalAffiliations: items })}
          createEmpty={() => ({ name: "", role: "" })}
          maxItems={6}
          addLabel={t("addAffiliation")}
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-2 gap-3 pr-16">
              <TextField label={t("affOrgLabel")} value={item.name} onChange={(v) => update({ name: v })} placeholder={t("affOrgPlaceholder")} />
              <TextField label={t("affRoleLabel")} value={item.role || ""} onChange={(v) => update({ role: v })} placeholder={t("affRolePlaceholder")} examples={t.raw("affRoleExamples") as string[]} />
            </div>
          )}
        />
      </Accordion>

      <Accordion title={t("devAccordionTitle")} subtitle={t("devAccordionSubtitle")} count={development.length}>
        <DynamicList
          items={development}
          onChange={(items) => onChange({ continuousDevelopment: items })}
          createEmpty={() => ({ name: "", provider: "", year: "" })}
          maxItems={6}
          addLabel={t("addCourse")}
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-3 gap-3 pr-16">
              <TextField label={t("devNameLabel")} value={item.name} onChange={(v) => update({ name: v })} placeholder={t("devNamePlaceholder")} />
              <TextField label={t("devProviderLabel")} value={item.provider || ""} onChange={(v) => update({ provider: v })} placeholder={t("devProviderPlaceholder")} />
              <TextField label={t("devYearLabel")} value={item.year || ""} onChange={(v) => update({ year: v })} placeholder={t("devYearPlaceholder")} />
            </div>
          )}
        />
      </Accordion>
    </div>
  );
}
