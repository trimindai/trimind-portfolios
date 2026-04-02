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
      <div>
        <h2 className="text-xl font-semibold text-white">Work Experience</h2>
        <p className="text-sm text-slate-400 mt-1">
          List your positions starting with the most recent. Focus on <strong className="text-slate-300">results and impact</strong>, not just duties.
        </p>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-sm text-slate-400">
        <strong className="text-amber-400">Pro tip:</strong> Use the STAR format for highlights — Situation, Task, Action, Result. Quantify results with numbers wherever possible (e.g., &quot;Reduced costs by 18%&quot; instead of &quot;Reduced costs&quot;).
      </div>

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
              <TextField label="Start Date" value={item.startDate} onChange={(v) => update({ startDate: v })} placeholder="2021" hint="Year or Month Year" />
              <TextField label="End Date" value={item.endDate || ""} onChange={(v) => update({ endDate: v })} placeholder="Present" hint="Leave blank if current" />
            </div>
            <TextareaField
              label="Role Description"
              value={item.description || ""}
              onChange={(v) => update({ description: v })}
              placeholder="Brief description of your role and responsibilities..."
              rows={2}
              aiEnhance
              aiContext={`role description for ${item.title || "this position"} at ${item.company || "this company"}. Make it concise, impactful, and focused on scope and responsibility. Use strong action verbs.`}
            />
            <TextareaField
              label="Key Achievements (one per line)"
              value={(item.highlights || []).join("\n")}
              onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })}
              placeholder="Reduced operational costs by 18% through process optimization&#10;Led cross-functional team of 6 analysts&#10;Delivered $1.2B risk framework ahead of schedule"
              rows={4}
              hint="Start each line with a strong action verb. Include numbers and percentages."
              aiEnhance
              aiContext={`achievement bullets for ${item.title || "a professional"} at ${item.company || "a company"}. Transform these into powerful, quantified achievement statements that sell the candidate to hiring managers. Use strong action verbs like Led, Delivered, Reduced, Increased, Automated, Designed. Add metrics and numbers where plausible.`}
            />
          </div>
        )}
      />
    </div>
  );
}
