"use client";

import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface CreatorBrandsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

type Brand = { name: string; logoUrl?: string };

export function CreatorBrandsStep({ data, onChange }: CreatorBrandsStepProps) {
  const t = useTranslations("builder.creator");
  const brands: Brand[] = data.brands || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">{t("brandsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          {t("brandsIntro")}
        </p>
      </div>

      <DynamicList<Brand>
        items={brands}
        onChange={(items) => onChange({ brands: items })}
        createEmpty={() => ({ name: "" })}
        maxItems={20}
        addLabel={t("brandsAdd")}
        renderItem={(item, _index, updateItem) => (
          <TextField
            label={t("brandsName")}
            value={item.name}
            onChange={(v) => updateItem({ name: v })}
            placeholder={t("brandsNamePlaceholder")}
          />
        )}
      />
    </div>
  );
}
