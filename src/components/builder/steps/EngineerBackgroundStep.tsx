"use client";

import { useState } from "react";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface EngineerBackgroundStepProps {
  data: any;
  onChange: (updates: any) => void;
}

type Section = "experience" | "skills" | "education" | "certifications" | "languages";

const SECTION_TABS: { id: Section; label: string }[] = [
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "languages", label: "Languages" },
];

export function EngineerBackgroundStep({ data, onChange }: EngineerBackgroundStepProps) {
  const [activeSection, setActiveSection] = useState<Section>("experience");

  const experience = data.experience || [];
  const skills = data.skills || [];
  const education = data.education || [];
  const certifications = data.certifications || [];
  const languages = data.languages || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Background</h2>
        <p className="text-sm text-slate-400 mt-1">
          Optional sections — all auto-hide when empty. Fill in what applies to you.
          Your projects are the star; this adds professional context.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-800/50 rounded-lg p-1">
        {SECTION_TABS.map((tab) => {
          const count =
            tab.id === "experience" ? experience.length :
            tab.id === "skills" ? skills.length :
            tab.id === "education" ? education.length :
            tab.id === "certifications" ? certifications.length :
            languages.length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeSection === tab.id
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeSection === tab.id ? "bg-emerald-500/50" : "bg-slate-700"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Experience */}
      {activeSection === "experience" && (
        <div className="space-y-4">
          <div className="bg-slate-800/30 border border-amber-900/30 rounded-lg p-3 text-sm text-amber-300/80">
            <strong>Tip:</strong> Most recent first. Focus on engineering scope, not job duties.
          </div>
          <DynamicList
            items={experience}
            onChange={(items) => onChange({ experience: items })}
            createEmpty={() => ({ title: "", company: "", startDate: "", endDate: "", description: "", highlights: [] as string[] })}
            maxItems={10}
            addLabel="Add Position"
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Job Title" value={item.title} onChange={(v) => update({ title: v })} placeholder="Project Engineer" examples={["Project Engineer", "Design Engineer", "Field Engineer", "Process Engineer", "Maintenance Engineer"]} />
                  <TextField label="Company" value={item.company} onChange={(v) => update({ company: v })} placeholder="Kuwait Oil Company" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Start Date" value={item.startDate} onChange={(v) => update({ startDate: v })} placeholder="2021" />
                  <TextField label="End Date" value={item.endDate || ""} onChange={(v) => update({ endDate: v })} placeholder="Present" hint="Leave blank if current" />
                </div>
                <TextareaField label="Description" value={item.description || ""} onChange={(v) => update({ description: v })} placeholder="Brief scope: what you engineered, for whom, at what scale..." rows={2} />
                <TextareaField
                  label="Key Highlights (one per line)"
                  value={(item.highlights || []).join("\n")}
                  onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })}
                  placeholder={"Designed 132kV substation layout per IEC standards\nLed commissioning of 3 gas turbine units\nReduced maintenance downtime by 22%"}
                  rows={3}
                  hint="Start each line with what you did. Add numbers where possible."
                />
              </div>
            )}
          />
        </div>
      )}

      {/* Skills */}
      {activeSection === "skills" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Group skills by category. Common engineering categories: Technical, Software, Tools & Equipment, Standards & Codes.</p>
          <DynamicList
            items={skills}
            onChange={(items) => onChange({ skills: items })}
            createEmpty={() => ({ category: "", items: [] as string[] })}
            maxItems={8}
            addLabel="Add Skill Category"
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <TextField
                  label="Category"
                  value={item.category}
                  onChange={(v) => update({ category: v })}
                  placeholder="Technical Skills"
                  examples={["Technical Skills", "Software & Tools", "Standards & Codes", "Lab & Equipment", "Project Management"]}
                />
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 block">Skills (comma-separated)</label>
                  <input
                    value={item.items.join(", ")}
                    onChange={(e) => update({ items: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                    placeholder="MATLAB, AutoCAD, SolidWorks, PLC Programming, SCADA"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          />
        </div>
      )}

      {/* Education */}
      {activeSection === "education" && (
        <div className="space-y-4">
          <DynamicList
            items={education}
            onChange={(items) => onChange({ education: items })}
            createEmpty={() => ({ degree: "", institution: "", year: "", description: "" })}
            maxItems={5}
            addLabel="Add Education"
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Degree" value={item.degree} onChange={(v) => update({ degree: v })} placeholder="B.Sc. Electrical Engineering" examples={["B.Sc. Electrical Engineering", "B.Sc. Mechanical Engineering", "B.Sc. Civil Engineering", "M.Sc. Petroleum Engineering", "B.Eng. Chemical Engineering"]} />
                  <TextField label="Institution" value={item.institution} onChange={(v) => update({ institution: v })} placeholder="Kuwait University" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Year" value={item.year} onChange={(v) => update({ year: v })} placeholder="2018-2023" />
                  <TextField label="GPA / Notes" value={item.description || ""} onChange={(v) => update({ description: v })} placeholder="GPA 3.6/4.0, Dean's List" hint="GPA, honors, or relevant coursework" />
                </div>
              </div>
            )}
          />
        </div>
      )}

      {/* Certifications */}
      {activeSection === "certifications" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Professional certifications, licenses, and technical qualifications.</p>
          <DynamicList
            items={certifications}
            onChange={(items) => onChange({ certifications: items })}
            createEmpty={() => ({ name: "", issuer: "", year: "" })}
            maxItems={10}
            addLabel="Add Certification"
            renderItem={(item, _, update) => (
              <div className="grid grid-cols-3 gap-3 pr-16">
                <TextField label="Name" value={item.name} onChange={(v) => update({ name: v })} placeholder="PE License" examples={["PE License", "PMP", "NEBOSH", "AWS CWI", "Six Sigma Green Belt", "OSHA 30"]} />
                <TextField label="Issuer" value={item.issuer} onChange={(v) => update({ issuer: v })} placeholder="Kuwait Society of Engineers" />
                <TextField label="Year" value={item.year || ""} onChange={(v) => update({ year: v })} placeholder="2024" />
              </div>
            )}
          />
        </div>
      )}

      {/* Languages */}
      {activeSection === "languages" && (
        <div className="space-y-4">
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
      )}
    </div>
  );
}
