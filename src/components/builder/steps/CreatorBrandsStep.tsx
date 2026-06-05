"use client";

import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface CreatorBrandsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

type Brand = { name: string; logoUrl?: string };

export function CreatorBrandsStep({ data, onChange }: CreatorBrandsStepProps) {
  const brands: Brand[] = data.brands || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">Brands you've worked with</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          Names of brands, clients or collaborators. They scroll in a marquee that signals credibility at a glance. Optional — add as many as you like.
        </p>
      </div>

      <DynamicList<Brand>
        items={brands}
        onChange={(items) => onChange({ brands: items })}
        createEmpty={() => ({ name: "" })}
        maxItems={20}
        addLabel="Add Brand"
        renderItem={(item, _index, updateItem) => (
          <TextField
            label="Brand / Client Name"
            value={item.name}
            onChange={(v) => updateItem({ name: v })}
            placeholder="Vélo"
          />
        )}
      />
    </div>
  );
}
