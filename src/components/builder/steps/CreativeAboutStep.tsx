"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface CreativeAboutStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function CreativeAboutStep({ data, onChange }: CreativeAboutStepProps) {
  const skills = data.skills || [];
  const experience = data.experience || [];
  const metrics = data.metrics || [];

  return (
    <div className="space-y-10">
      {/* Skills / mediums */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Skills &amp; Mediums</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          Grouped into categories. These appear as pills and in the scrolling marquee.
        </p>
        <DynamicList
          items={skills}
          onChange={(items) => onChange({ skills: items })}
          createEmpty={() => ({ category: "", items: [] as string[] })}
          maxItems={6}
          addLabel="Add Category"
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextField
                label="Category"
                value={item.category}
                onChange={(v) => update({ category: v })}
                placeholder="Mediums"
                examples={["Mediums", "Tools", "Techniques", "Software", "Disciplines"]}
              />
              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                  Items (comma-separated)
                </label>
                <input
                  value={(item.items || []).join(", ")}
                  onChange={(e) =>
                    update({
                      items: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Oil, Acrylic, Charcoal, Resin"
                  className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* Experience / exhibitions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Exhibitions &amp; Experience</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          Shows, residencies, roles. Listed as a timeline under &quot;Journey&quot;.
        </p>
        <DynamicList
          items={experience}
          onChange={(items) => onChange({ experience: items })}
          createEmpty={() => ({ title: "", company: "", startDate: "", endDate: "", description: "" })}
          maxItems={10}
          addLabel="Add Entry"
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextField
                label="Title"
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder="Solo Exhibition — 'Sand & Static'"
                examples={[
                  "Solo Exhibition — 'Title'",
                  "Group Show — 'Title'",
                  "Artist Residency",
                  "Art Director",
                ]}
              />
              <TextField
                label="Venue / Organization"
                value={item.company}
                onChange={(v) => update({ company: v })}
                placeholder="Contemporary Art Platform, Kuwait"
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Start / Year"
                  value={item.startDate}
                  onChange={(v) => update({ startDate: v })}
                  placeholder="2024"
                />
                <TextField
                  label="End (optional)"
                  value={item.endDate || ""}
                  onChange={(v) => update({ endDate: v })}
                  placeholder="Leave blank if ongoing"
                />
              </div>
              <TextareaField
                label="Description"
                value={item.description || ""}
                onChange={(v) => update({ description: v })}
                placeholder="A 30-piece show exploring desert ecology and memory."
                rows={2}
              />
            </div>
          )}
        />
      </div>

      {/* Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">By the Numbers</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          Optional highlights shown in a scrolling strip (e.g. works, exhibitions, awards).
        </p>
        <DynamicList
          items={metrics}
          onChange={(items) => onChange({ metrics: items })}
          createEmpty={() => ({ value: "", label: "" })}
          maxItems={5}
          addLabel="Add Stat"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-2 gap-3 pr-16">
              <TextField
                label="Value"
                value={item.value}
                onChange={(v) => update({ value: v })}
                placeholder="45"
                examples={["45", "12", "6", "10K+"]}
              />
              <TextField
                label="Label"
                value={item.label}
                onChange={(v) => update({ label: v })}
                placeholder="Works"
                examples={["Works", "Exhibitions", "Awards", "Collections"]}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
