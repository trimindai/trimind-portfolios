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
        <h2 className="text-xl font-semibold text-white mb-2">Endorsements</h2>
        <p className="text-sm text-slate-400 mb-4">Add quotes from colleagues or supervisors.</p>
        <DynamicList
          items={endorsements}
          onChange={(items) => onChange({ endorsements: items })}
          createEmpty={() => ({ quote: "", name: "", title: "", company: "" })}
          maxItems={5}
          addLabel="Add Endorsement"
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextareaField label="Quote" value={item.quote} onChange={(v) => update({ quote: v })} placeholder="Sarah's analytical rigor..." rows={2} />
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
        <h2 className="text-xl font-semibold text-white mb-2">Professional Affiliations</h2>
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
        <h2 className="text-xl font-semibold text-white mb-2">Continuous Development</h2>
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
