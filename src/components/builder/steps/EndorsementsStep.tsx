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
        <p className="text-sm text-slate-400">Testimonials build trust. Professional memberships show commitment.</p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-1">Endorsements</h3>
        <p className="text-sm text-slate-400 mb-4">Quotes from colleagues or supervisors who can vouch for your work.</p>
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
              <TextField label="Role" value={item.role || ""} onChange={(v) => update({ role: v })} placeholder="Member" examples={["Member", "Board Member", "Fellow", "Associate", "Certified Member"]} />
            </div>
          )}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-1">Continuous Development</h3>
        <p className="text-sm text-slate-400 mb-3">Recent courses show you stay current in your field.</p>
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
