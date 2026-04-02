"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface EndorsementsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function EndorsementsStep({ data, onChange }: EndorsementsStepProps) {
  const endorsements = data.endorsements || [];
  const affiliations = data.professionalAffiliations || [];
  const development = data.continuousDevelopment || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Endorsements & Professional Profile</h2>
        <p className="text-sm text-slate-400">Testimonials from colleagues build trust. Professional memberships show commitment.</p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-1">Endorsements</h3>
        <p className="text-sm text-slate-400 mb-4">Add quotes from colleagues, supervisors, or clients who can vouch for your work.</p>
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
                placeholder="Sarah's analytical rigor and attention to detail consistently deliver results..."
                rows={2}
                aiEnhance
                aiContext={`endorsement/testimonial quote from ${item.name || "a colleague"} (${item.title || "professional"} at ${item.company || "company"}) about the portfolio owner. Make it sound authentic, specific, and highlight professional strengths. Keep it 2-3 sentences.`}
              />
              <div className="grid grid-cols-3 gap-3">
                <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} placeholder="Ahmad Al-Sabah" />
                <TextField label="Title" value={item.title} onChange={(v) => update({ title: v })} placeholder="VP Corporate Banking" />
                <TextField label="Company" value={item.company} onChange={(v) => update({ company: v })} placeholder="NBK" />
              </div>
            </div>
          )}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-1">Professional Affiliations</h3>
        <p className="text-sm text-slate-400 mb-3">Memberships in professional bodies show industry commitment.</p>
        <DynamicList
          items={affiliations}
          onChange={(items) => onChange({ professionalAffiliations: items })}
          createEmpty={() => ({ name: "", role: "" })}
          maxItems={6}
          addLabel="Add Affiliation"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-2 gap-3 pr-16">
              <TextField label="Organization" value={item.name} onChange={(v) => update({ name: v })} placeholder="Kuwait CFA Society" />
              <TextField label="Role" value={item.role || ""} onChange={(v) => update({ role: v })} placeholder="Member" />
            </div>
          )}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-1">Continuous Development</h3>
        <p className="text-sm text-slate-400 mb-3">Recent courses and certifications show you stay current.</p>
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
      </div>
    </div>
  );
}
