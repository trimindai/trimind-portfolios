"use client";

import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface CreativeAboutStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function CreativeAboutStep({ data, onChange }: CreativeAboutStepProps) {
  const t = useTranslations("builder.creative");
  const skills = data.skills || [];
  const experience = data.experience || [];
  const metrics = data.metrics || [];
  const certifications = data.certifications || [];
  const endorsements = data.endorsements || [];

  return (
    <div className="space-y-10">
      {/* Skills / mediums */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">{t("aboutSkillsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          {t("aboutSkillsIntro")}
        </p>
        <DynamicList
          items={skills}
          onChange={(items) => onChange({ skills: items })}
          createEmpty={() => ({ category: "", items: [] as string[] })}
          maxItems={6}
          addLabel={t("aboutAddCategory")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextField
                label={t("aboutCategory")}
                value={item.category}
                onChange={(v) => update({ category: v })}
                placeholder={t("aboutCategoryPlaceholder")}
                examples={t.raw("aboutCategoryExamples") as string[]}
              />
              <div>
                <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
                  {t("aboutItems")}
                </label>
                <input
                  value={(item.items || []).join(", ")}
                  onChange={(e) =>
                    update({
                      items: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder={t("aboutItemsPlaceholder")}
                  className="w-full bg-white border border-[var(--land-border)] rounded-lg px-4 py-2.5 text-[var(--land-bright)] placeholder:text-[var(--land-muted)] shadow-sm focus:border-[var(--land-accent)] focus:ring-1 focus:ring-[var(--land-accent)] outline-none transition-colors"
                />
              </div>
            </div>
          )}
        />
      </div>

      {/* Experience / exhibitions */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">{t("aboutExperienceHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          {t("aboutExperienceIntro")}
        </p>
        <DynamicList
          items={experience}
          onChange={(items) => onChange({ experience: items })}
          createEmpty={() => ({ title: "", company: "", startDate: "", endDate: "", description: "" })}
          maxItems={10}
          addLabel={t("aboutAddEntry")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextField
                label={t("aboutExpTitle")}
                value={item.title}
                onChange={(v) => update({ title: v })}
                placeholder={t("aboutExpTitlePlaceholder")}
                examples={t.raw("aboutExpTitleExamples") as string[]}
              />
              <TextField
                label={t("aboutVenue")}
                value={item.company}
                onChange={(v) => update({ company: v })}
                placeholder={t("aboutVenuePlaceholder")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label={t("aboutStart")}
                  value={item.startDate}
                  onChange={(v) => update({ startDate: v })}
                  placeholder={t("aboutStartPlaceholder")}
                />
                <TextField
                  label={t("aboutEnd")}
                  value={item.endDate || ""}
                  onChange={(v) => update({ endDate: v })}
                  placeholder={t("aboutEndPlaceholder")}
                />
              </div>
              <TextareaField
                label={t("aboutExpDescription")}
                value={item.description || ""}
                onChange={(v) => update({ description: v })}
                placeholder={t("aboutExpDescriptionPlaceholder")}
                rows={2}
              />
            </div>
          )}
        />
      </div>

      {/* Awards / certifications / licenses */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">{t("aboutAwardsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          {t("aboutAwardsIntro")}
        </p>
        <DynamicList
          items={certifications}
          onChange={(items) => onChange({ certifications: items })}
          createEmpty={() => ({ name: "", issuer: "", year: "" })}
          maxItems={12}
          addLabel={t("aboutAddAward")}
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-16">
              <TextField
                label={t("aboutAwardTitle")}
                value={item.name}
                onChange={(v) => update({ name: v })}
                placeholder={t("aboutAwardTitlePlaceholder")}
                examples={t.raw("aboutAwardTitleExamples") as string[]}
              />
              <TextField
                label={t("aboutIssuer")}
                value={item.issuer}
                onChange={(v) => update({ issuer: v })}
                placeholder={t("aboutIssuerPlaceholder")}
              />
              <TextField
                label={t("aboutYear")}
                value={item.year || ""}
                onChange={(v) => update({ year: v })}
                placeholder={t("aboutYearPlaceholder")}
              />
            </div>
          )}
        />
      </div>

      {/* Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">{t("aboutMetricsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          {t("aboutMetricsIntro")}
        </p>
        <DynamicList
          items={metrics}
          onChange={(items) => onChange({ metrics: items })}
          createEmpty={() => ({ value: "", label: "" })}
          maxItems={5}
          addLabel={t("aboutAddStat")}
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-16">
              <TextField
                label={t("aboutMetricValue")}
                value={item.value}
                onChange={(v) => update({ value: v })}
                placeholder={t("aboutMetricValuePlaceholder")}
                examples={t.raw("aboutMetricValueExamples") as string[]}
              />
              <TextField
                label={t("aboutMetricLabel")}
                value={item.label}
                onChange={(v) => update({ label: v })}
                placeholder={t("aboutMetricLabelPlaceholder")}
                examples={t.raw("aboutMetricLabelExamples") as string[]}
              />
            </div>
          )}
        />
      </div>

      {/* Testimonials / endorsements */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)] mb-1">{t("aboutTestimonialsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mb-4">
          {t("aboutTestimonialsIntro")}
        </p>
        <DynamicList
          items={endorsements}
          onChange={(items) => onChange({ endorsements: items })}
          createEmpty={() => ({ quote: "", name: "", title: "", company: "" })}
          maxItems={8}
          addLabel={t("aboutAddTestimonial")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextareaField
                label={t("aboutQuote")}
                value={item.quote}
                onChange={(v) => update({ quote: v })}
                placeholder={t("aboutQuotePlaceholder")}
                rows={3}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TextField
                  label={t("aboutName")}
                  value={item.name}
                  onChange={(v) => update({ name: v })}
                  placeholder={t("aboutNamePlaceholder")}
                />
                <TextField
                  label={t("aboutTitleField")}
                  value={item.title}
                  onChange={(v) => update({ title: v })}
                  placeholder={t("aboutTitleFieldPlaceholder")}
                  examples={t.raw("aboutTitleFieldExamples") as string[]}
                />
                <TextField
                  label={t("aboutCompany")}
                  value={item.company}
                  onChange={(v) => update({ company: v })}
                  placeholder={t("aboutCompanyPlaceholder")}
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
