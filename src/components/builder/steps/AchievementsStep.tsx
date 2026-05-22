"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface AchievementsStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

export function AchievementsStep({ data, onChange }: AchievementsStepProps) {
  const projects = data.projects || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Selected Achievements</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          Showcase 1-3 major impact stories. The first one marked as &quot;Featured&quot; gets a larger card.
        </p>
      </div>

      <div className="bg-[var(--land-surface-raised)]/30 border border-amber-900/30 rounded-lg p-4 text-sm text-amber-300/80">
        <strong>STAR format:</strong> Situation (context) → Task (what was needed) → Action (what you did) → Result (quantified outcome). Add KPIs and tools used for maximum impact.
      </div>

      <DynamicList
        items={projects}
        onChange={(items) => onChange({ projects: items })}
        createEmpty={() => ({
          title: "",
          description: "",
          technologies: [] as string[],
          metrics: [] as Array<{ value: string; label: string }>,
          isFeatured: false,
        })}
        maxItems={5}
        addLabel="Add Achievement"
        renderItem={(item, index, update) => (
          <div className="space-y-3 pr-16">
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isFeatured || false}
                  onChange={(e) => update({ isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--land-border)] text-[var(--land-accent)] focus:ring-[var(--land-accent)] bg-[var(--land-surface-raised)]"
                />
                <span className="text-sm text-amber-400 font-medium">Featured (large card)</span>
              </label>
            </div>

            <TextField
              label="Achievement Title"
              value={item.title}
              onChange={(v) => update({ title: v })}
              placeholder="Enterprise Risk Framework Redesign"
              hint="A concise, impressive title"
            />

            <TextareaField
              label="Situation / Context"
              value={item.description}
              onChange={(v) => update({ description: v })}
              placeholder="Corporate Banking Division managing $1.2B across 200+ institutional clients..."
              rows={3}
              hint="Describe the challenge or context (anonymize if needed)"
              writingTips={[
                "Set the scene: what was the problem or opportunity?",
                "Include scale: team size, budget, scope",
                "Keep it 1-2 sentences",
              ]}
            />

            <div>
              <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                Key Metrics / KPIs
              </label>
              <p className="text-xs text-[var(--land-muted)] mb-2">Add 2-4 measurable results</p>
              <DynamicList
                items={item.metrics || []}
                onChange={(m) => update({ metrics: m })}
                createEmpty={() => ({ value: "", label: "" })}
                maxItems={4}
                addLabel="Add KPI"
                renderItem={(kpi, _, updateKpi) => (
                  <div className="grid grid-cols-2 gap-3">
                    <TextField label="Value" value={kpi.value} onChange={(v) => updateKpi({ value: v })} placeholder="$1.2B" examples={["$1.2B", "18%", "6 mo", "40%", "150+"]} />
                    <TextField label="Label" value={kpi.label} onChange={(v) => updateKpi({ label: v })} placeholder="Portfolio Coverage" examples={["Portfolio Coverage", "Risk Reduction", "Delivery Time", "Cost Savings", "Revenue Growth"]} />
                  </div>
                )}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                Tools & Technologies Used
              </label>
              <input
                value={(item.technologies || []).join(", ")}
                onChange={(e) => update({ technologies: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                placeholder="Python, Bloomberg, Power BI, SQL, Risk Analytics"
                className="w-full bg-[var(--land-surface-raised)] border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-white placeholder:text-[var(--land-muted)] focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
              />
              <p className="text-xs text-[var(--land-muted)] mt-1">Comma-separated</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
