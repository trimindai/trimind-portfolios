"use client";

import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface EducationStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function EducationStep({ data, onChange }: EducationStepProps) {
  const education = data.education || [];
  const languages = data.languages || [];

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

      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Languages</h2>
        <DynamicList
          items={languages}
          onChange={(items) => onChange({ languages: items })}
          createEmpty={() => ({ name: "", level: "Fluent" })}
          maxItems={6}
          addLabel="Add Language"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-2 gap-3 pr-16">
              <TextField label="Language" value={item.name} onChange={(v) => update({ name: v })} placeholder="Arabic" />
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Level</label>
                <select
                  value={item.level}
                  onChange={(e) => update({ level: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
