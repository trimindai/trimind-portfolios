"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface BasicsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function BasicsStep({ data, onChange }: BasicsStepProps) {
  const basics = data.basics || {};
  const metrics = data.metrics || [];

  const updateBasics = (field: string, value: string) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Basic Information</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Full Name" value={basics.fullName} onChange={(v) => updateBasics("fullName", v)} required placeholder="Sarah Al-Rashidi" />
        <TextField label="Professional Title" value={basics.title} onChange={(v) => updateBasics("title", v)} required placeholder="Senior Financial Analyst" />
      </div>

      <TextField label="Subtitle" value={basics.subtitle} onChange={(v) => updateBasics("subtitle", v)} placeholder="Optional tagline" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Email" value={basics.email} onChange={(v) => updateBasics("email", v)} required type="email" placeholder="email@example.com" />
        <TextField label="Phone" value={basics.phone} onChange={(v) => updateBasics("phone", v)} placeholder="+965 1234 5678" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Location" value={basics.location} onChange={(v) => updateBasics("location", v)} placeholder="Kuwait City, Kuwait" />
        <TextField label="Nationality" value={basics.nationality} onChange={(v) => updateBasics("nationality", v)} placeholder="Kuwaiti National" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="LinkedIn" value={basics.linkedin} onChange={(v) => updateBasics("linkedin", v)} placeholder="linkedin.com/in/yourname" />
        <TextField label="Website" value={basics.website} onChange={(v) => updateBasics("website", v)} placeholder="yourwebsite.com" />
      </div>

      <TextareaField label="Bio / Summary" value={basics.bio} onChange={(v) => updateBasics("bio", v)} placeholder="Brief professional summary..." rows={3} />

      <TextareaField label="Value Proposition" value={basics.valueProposition} onChange={(v) => updateBasics("valueProposition", v)} placeholder="What unique value do you bring?" rows={3} />

      <div>
        <h3 className="text-lg font-medium text-white mb-3">Key Metrics</h3>
        <p className="text-sm text-slate-400 mb-3">Highlight up to 4 key numbers (e.g., "10+ Years Experience")</p>
        <DynamicList
          items={metrics}
          onChange={(items) => onChange({ metrics: items })}
          createEmpty={() => ({ value: "", label: "" })}
          maxItems={4}
          addLabel="Add Metric"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Value" value={item.value} onChange={(v) => update({ value: v })} placeholder="10+" />
              <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} placeholder="Years Experience" />
            </div>
          )}
        />
      </div>
    </div>
  );
}
