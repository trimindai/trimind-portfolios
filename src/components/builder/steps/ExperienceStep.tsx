"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface ExperienceStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

export function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const experience = data.experience || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Work Experience</h2>
        <p className="text-sm text-slate-400 mt-1">Most recent first. Focus on <strong className="text-slate-300">results and impact</strong>.</p>
      </div>

      <div className="bg-slate-800/30 border border-amber-900/30 rounded-lg p-4 text-sm text-amber-300/80">
        <strong>Power words:</strong> Led, Delivered, Reduced, Increased, Automated, Designed, Launched, Optimized, Managed, Generated
      </div>

      <DynamicList
        items={experience}
        onChange={(items) => onChange({ experience: items })}
        createEmpty={() => ({ title: "", company: "", startDate: "", endDate: "", description: "", highlights: [] })}
        maxItems={10}
        addLabel="Add Position"
        renderItem={(item, _, update) => (
          <div className="space-y-3 pr-16">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Job Title" value={item.title} onChange={(v) => update({ title: v })} placeholder="Senior Financial Analyst" />
              <TextField label="Company" value={item.company} onChange={(v) => update({ company: v })} placeholder="National Bank of Kuwait" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Start Date" value={item.startDate} onChange={(v) => update({ startDate: v })} placeholder="2021" hint="Year or Month Year" />
              <TextField label="End Date" value={item.endDate || ""} onChange={(v) => update({ endDate: v })} placeholder="Present" hint="Leave blank if current" />
            </div>
            <TextareaField label="Role Description" value={item.description || ""} onChange={(v) => update({ description: v })} placeholder="Brief role description..." rows={2} writingTips={["Describe scope: team size, budget, departments", "Keep it to 1-2 sentences"]} />
            <TextareaField
              label="Key Achievements (one per line)"
              value={(item.highlights || []).join("\n")}
              onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })}
              placeholder="Reduced operational costs by 18%&#10;Led cross-functional team of 6 analysts&#10;Delivered $1.2B risk framework ahead of schedule"
              rows={4}
              hint="Start each line with a power verb. Add numbers."
              writingTips={[
                "Formula: [Action verb] + [what you did] + [result with numbers]",
                "Bad: 'Responsible for reports' → Good: 'Delivered 50+ monthly reports reducing decision time by 30%'",
              ]}
            />
          </div>
        )}
      />
    </div>
  );
}
