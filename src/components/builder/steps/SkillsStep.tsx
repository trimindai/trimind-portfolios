"use client";

import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface SkillsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function SkillsStep({ data, onChange }: SkillsStepProps) {
  const skills = data.skills || [];
  const certifications = data.certifications || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Skills & Competencies</h2>
        <p className="text-sm text-slate-400 mb-4">Group skills by category (e.g., Technical, Leadership).</p>

        <DynamicList
          items={skills}
          onChange={(items) => onChange({ skills: items })}
          createEmpty={() => ({ category: "", items: [] })}
          maxItems={6}
          addLabel="Add Skill Category"
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextField label="Category" value={item.category} onChange={(v) => update({ category: v })} placeholder="Technical Skills" />
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Skills (comma-separated)</label>
                <input
                  value={item.items.join(", ")}
                  onChange={(e) => update({ items: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                  placeholder="Python, Excel, Power BI, SQL"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Certifications</h2>
        <DynamicList
          items={certifications}
          onChange={(items) => onChange({ certifications: items })}
          createEmpty={() => ({ name: "", issuer: "", year: "" })}
          maxItems={10}
          addLabel="Add Certification"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-3 gap-3 pr-16">
              <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} placeholder="CFA" />
              <TextField label="Issuer" value={item.issuer} onChange={(v) => update({ issuer: v })} placeholder="CFA Institute" />
              <TextField label="Year" value={item.year || ""} onChange={(v) => update({ year: v })} placeholder="2022" />
            </div>
          )}
        />
      </div>
    </div>
  );
}
