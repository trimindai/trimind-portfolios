"use client";

import { useTranslations } from "next-intl";
import { TextField } from "../fields/TextField";
import { DynamicList } from "../fields/DynamicList";

interface DeveloperCredentialsStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
}

export function DeveloperCredentialsStep({ data, onChange }: DeveloperCredentialsStepProps) {
  const t = useTranslations("builder.developer");
  const education = data.education || [];
  const certifications = data.certifications || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">{t("credentialsHeading")}</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">{t("credentialsIntro")}</p>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">{t("educationHeading")}</h3>
        <DynamicList
          items={education}
          onChange={(items) => onChange({ education: items })}
          createEmpty={() => ({ degree: "", institution: "", year: "" })}
          maxItems={5}
          addLabel={t("addEducation")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label={t("degree")}
                  value={item.degree}
                  onChange={(v) => update({ degree: v })}
                  placeholder={t("degreePlaceholder")}
                />
                <TextField
                  label={t("institution")}
                  value={item.institution}
                  onChange={(v) => update({ institution: v })}
                  placeholder={t("institutionPlaceholder")}
                />
              </div>
              <TextField
                label={t("eduYear")}
                value={item.year}
                onChange={(v) => update({ year: v })}
                placeholder={t("eduYearPlaceholder")}
              />
            </div>
          )}
        />
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">{t("certificationsHeading")}</h3>
        <DynamicList
          items={certifications}
          onChange={(items) => onChange({ certifications: items })}
          createEmpty={() => ({ name: "", issuer: "", year: "" })}
          maxItems={8}
          addLabel={t("addCertification")}
          renderItem={(item, _, update) => (
            <div className="space-y-3 pr-16">
              <TextField
                label={t("certName")}
                value={item.name}
                onChange={(v) => update({ name: v })}
                placeholder={t("certNamePlaceholder")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label={t("certIssuer")}
                  value={item.issuer}
                  onChange={(v) => update({ issuer: v })}
                  placeholder={t("certIssuerPlaceholder")}
                />
                <TextField
                  label={t("certYear")}
                  value={item.year}
                  onChange={(v) => update({ year: v })}
                  placeholder={t("certYearPlaceholder")}
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
