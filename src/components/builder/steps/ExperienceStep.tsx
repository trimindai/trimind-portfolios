"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface ExperienceStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const experience = data.experience || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Work Experience</h2>
      <p className="text-sm text-slate-400">Add your work history, most recent first.</p>

      <DynamicList
        items={experience}
        onChange={(items) => onChange({ experience: items })}
        createEmpty={() => ({
          title: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
          highlights: [],
        })}
        maxItems={10}
        addLabel="Add Position"
        renderItem={(item, _, update) => (
          <div className="space-y-3 pr-16">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Job Title" value={item.title} onChange={(v) => update({ title: v })} placeholder="Senior Financial Analyst" />
              <TextField label="Company" value={item.company} onChange={(v) => update({ company: v })} placeholder="National Bank of Kuwait" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Start Date" value={item.startDate} onChange={(v) => update({ startDate: v })} placeholder="2021" />
              <TextField label="End Date" value={item.endDate || ""} onChange={(v) => update({ endDate: v })} placeholder="Present" />
            </div>
            <TextareaField label="Description" value={item.description || ""} onChange={(v) => update({ description: v })} placeholder="Brief role description..." rows={2} />
            <TextareaField
              label="Highlights (one per line)"
              value={(item.highlights || []).join("\n")}
              onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })}
              placeholder="Reduced costs by 18%&#10;Led team of 6 analysts"
              rows={3}
            />
          </div>
        )}
      />
    </div>
  );
}
