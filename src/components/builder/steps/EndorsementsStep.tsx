"use client";

import { useState } from "react";
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
  const endorsements = data.endorsements || [];
  const affiliations = data.professionalAffiliations || [];
  const development = data.continuousDevelopment || [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-2">Endorsements & Professional Profile</h2>
        <p className="text-sm text-[var(--land-body)]">Testimonials build trust. Professional memberships show commitment.</p>
      </div>

      <Accordion title="Endorsements" subtitle="Quotes from colleagues or supervisors who can vouch for your work." count={endorsements.length} defaultOpen>
        <DynamicList
          items={endorsements}
          onChange={(items) => onChange({ endorsements: items })}
          createEmpty={() => ({ quote: "", name: "", title: "", company: "" })}
          maxItems={5}
          addLabel="Add Endorsement"
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextareaField
                label="Quote"
                value={item.quote}
                onChange={(v) => update({ quote: v })}
                placeholder="Sarah's analytical rigor and attention to detail consistently deliver exceptional results..."
                rows={2}
                writingTips={[
                  "Ask your reference to focus on specific skills or projects",
                  "Mention measurable outcomes they witnessed",
                  "Keep it 2-3 sentences — concise and specific beats long and vague",
                ]}
                templates={[
                  { label: "Skills-focused", text: "[Name]'s expertise in [skill] is exceptional. Their ability to [specific action] has consistently delivered [measurable result] for our team." },
                  { label: "Leadership", text: "Working with [Name] has been outstanding. They led [project/initiative] with remarkable [quality], delivering results that exceeded expectations by [metric]." },
                ]}
              />
              <div className="grid grid-cols-3 gap-3">
                <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} placeholder="Ahmad Al-Sabah" />
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} placeholder="VP Corporate Banking" />
                <TextField label="Company" value={item.company} onChange={(v) => update({ company: v })} placeholder="NBK" />
              </div>
            </div>
          )}
        />
      </Accordion>

      <Accordion title="Professional Affiliations" subtitle="Memberships in professional bodies show industry commitment." count={affiliations.length}>
        <DynamicList
          items={affiliations}
          onChange={(items) => onChange({ professionalAffiliations: items })}
          createEmpty={() => ({ name: "", role: "" })}
          maxItems={6}
          addLabel="Add Affiliation"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-2 gap-3 pr-16">
              <TextField label="Organization" value={item.name} onChange={(v) => update({ name: v })} placeholder="Kuwait CFA Society" />
              <TextField label="Role" value={item.role || ""} onChange={(v) => update({ role: v })} placeholder="Member" examples={["Member", "Board Member", "Fellow", "Associate", "Certified Member"]} />
            </div>
          )}
        />
      </Accordion>

      <Accordion title="Continuous Development" subtitle="Recent courses show you stay current in your field." count={development.length}>
        <DynamicList
          items={development}
          onChange={(items) => onChange({ continuousDevelopment: items })}
          createEmpty={() => ({ name: "", provider: "", year: "" })}
          maxItems={6}
          addLabel="Add Course / Training"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-3 gap-3 pr-16">
              <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} placeholder="Advanced Financial Modeling" />
              <TextField label="Provider" value={item.provider || ""} onChange={(v) => update({ provider: v })} placeholder="Wall Street Prep" />
              <TextField label="Year" value={item.year || ""} onChange={(v) => update({ year: v })} placeholder="2024" />
            </div>
          )}
        />
      </Accordion>
    </div>
  );
}
