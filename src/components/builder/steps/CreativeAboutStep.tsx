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
  const certifications = data.certifications || [];
  const endorsements = data.endorsements || [];

  return (
    <div className="space-y-10">
      {/* Skills / mediums */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">Skills &amp; Mediums</h2>
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
                  className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* Experience / exhibitions */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">Exhibitions &amp; Experience</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Awards / certifications / licenses */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">Awards, Certificates &amp; Licenses</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          Show off recognition — awards, certifications, licenses, or honors. Shown in their own section.
        </p>
        <DynamicList
          items={certifications}
          onChange={(items) => onChange({ certifications: items })}
          createEmpty={() => ({ name: "", issuer: "", year: "" })}
          maxItems={12}
          addLabel="Add Award / Certificate"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-16">
              <TextField
                label="Title"
                value={item.name}
                onChange={(v) => update({ name: v })}
                placeholder="Best in Show"
                examples={["Best in Show", "Adobe Certified Professional", "Interior Design License", "Gold — Dubai Lynx"]}
              />
              <TextField
                label="Issuer"
                value={item.issuer}
                onChange={(v) => update({ issuer: v })}
                placeholder="Kuwait Art Biennale"
              />
              <TextField
                label="Year"
                value={item.year || ""}
                onChange={(v) => update({ year: v })}
                placeholder="2024"
              />
            </div>
          )}
        />
      </div>

      {/* Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">By the Numbers</h2>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-16">
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

      {/* Testimonials / endorsements */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">Testimonials</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          What collectors, curators, or clients say about your work. Shown as quoted endorsements.
        </p>
        <DynamicList
          items={endorsements}
          onChange={(items) => onChange({ endorsements: items })}
          createEmpty={() => ({ quote: "", name: "", title: "", company: "" })}
          maxItems={8}
          addLabel="Add Testimonial"
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextareaField
                label="Quote"
                value={item.quote}
                onChange={(v) => update({ quote: v })}
                placeholder="Her work transformed our space — bold, intimate, unforgettable."
                rows={3}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TextField
                  label="Name"
                  value={item.name}
                  onChange={(v) => update({ name: v })}
                  placeholder="Sara Al-Mutairi"
                />
                <TextField
                  label="Title"
                  value={item.title}
                  onChange={(v) => update({ title: v })}
                  placeholder="Curator"
                  examples={["Curator", "Gallery Director", "Collector", "Art Director"]}
                />
                <TextField
                  label="Company"
                  value={item.company}
                  onChange={(v) => update({ company: v })}
                  placeholder="Contemporary Art Platform"
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
