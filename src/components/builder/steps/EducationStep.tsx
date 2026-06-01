"use client";

import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface EducationStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function EducationStep({ data, onChange }: EducationStepProps) {
  const education = data.education || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Education</h2>
        <DynamicList
          items={education}
          onChange={(items) => onChange({ education: items })}
          createEmpty={() => ({ degree: "", institution: "", year: "", description: "" })}
          maxItems={5}
          addLabel="Add Education"
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Degree" value={item.degree} onChange={(v) => update({ degree: v })} placeholder="MBA (Finance)" />
                <TextField label="Institution" value={item.institution} onChange={(v) => update({ institution: v })} placeholder="Kuwait University" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Year" value={item.year} onChange={(v) => update({ year: v })} placeholder="2014-2016" />
                <TextField label="Description" value={item.description || ""} onChange={(v) => update({ description: v })} placeholder="Optional details" />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
