"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";
import { LanguageToggle } from "../fields/LanguageToggle";

interface ExperienceStepProps {
  data: any;
  onChange: (updates: any) => void;
  contentAr?: any;
  onArChange?: (updates: any) => void;
  editLang?: "en" | "ar";
  onLangChange?: (lang: "en" | "ar") => void;
}

export function ExperienceStep({ data, onChange, contentAr = {}, onArChange, editLang = "en", onLangChange }: ExperienceStepProps) {
  const experience = data.experience || [];
  const experienceAr = contentAr.experience || [];
  const isAr = editLang === "ar";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{isAr ? "الخبرة المهنية" : "Work Experience"}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {isAr ? "أضف خبراتك المهنية باللغة العربية" : "Most recent first. Focus on results and impact."}
        </p>
      </div>

      {onLangChange && <LanguageToggle lang={editLang} onChange={onLangChange} />}

      {!isAr && (
        <>
          <div className="bg-slate-800/30 border border-amber-900/30 rounded-lg p-4 text-sm text-amber-300/80">
            <strong>Power words:</strong> Led, Delivered, Reduced, Increased, Automated, Designed, Launched, Optimized, Managed, Generated
          </div>
          <DynamicList
            items={experience}
            onChange={(items) => onChange({ experience: items })}
            createEmpty={() => ({ title: "", company: "", startDate: "", endDate: "", description: "", highlights: [] })}
            maxItems={10}
            addLabel="Add Position"
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Job Title" value={item.title} onChange={(v) => update({ title: v })} placeholder="Senior Financial Analyst" />
                  <TextField label="Company" value={item.company} onChange={(v) => update({ company: v })} placeholder="National Bank of Kuwait" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Start Date" value={item.startDate} onChange={(v) => update({ startDate: v })} placeholder="2021" />
                  <TextField label="End Date" value={item.endDate || ""} onChange={(v) => update({ endDate: v })} placeholder="Present" />
                </div>
                <TextareaField label="Role Description" value={item.description || ""} onChange={(v) => update({ description: v })} placeholder="Brief role description..." rows={2} />
                <TextareaField
                  label="Key Achievements (one per line)"
                  value={(item.highlights || []).join("\n")}
                  onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })}
                  placeholder="Reduced costs by 18%&#10;Led team of 6 analysts"
                  rows={4}
                  hint="Start each line with a power verb. Add numbers."
                />
              </div>
            )}
          />
        </>
      )}

      {isAr && (
        <div dir="rtl" className="text-right">
          <DynamicList
            items={experienceAr.length ? experienceAr : experience.map((e: any) => ({ title: "", company: "", description: "", highlights: [], startDate: e.startDate, endDate: e.endDate }))}
            onChange={(items) => onArChange?.({ experience: items })}
            createEmpty={() => ({ title: "", company: "", startDate: "", endDate: "", description: "", highlights: [] })}
            maxItems={10}
            addLabel="إضافة منصب"
            renderItem={(item, _, update) => (
              <div className="space-y-3 pr-16">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="المسمى الوظيفي" value={item.title} onChange={(v) => update({ title: v })} placeholder="محلل مالي أول" />
                  <TextField label="الشركة" value={item.company} onChange={(v) => update({ company: v })} placeholder="بنك الكويت الوطني" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="تاريخ البداية" value={item.startDate} onChange={(v) => update({ startDate: v })} placeholder="٢٠٢١" />
                  <TextField label="تاريخ النهاية" value={item.endDate || ""} onChange={(v) => update({ endDate: v })} placeholder="حتى الآن" />
                </div>
                <TextareaField label="وصف الدور" value={item.description || ""} onChange={(v) => update({ description: v })} placeholder="وصف موجز للدور..." rows={2} />
                <TextareaField label="الإنجازات (سطر لكل إنجاز)" value={(item.highlights || []).join("\n")} onChange={(v) => update({ highlights: v.split("\n").filter(Boolean) as string[] })} placeholder="خفض التكاليف بنسبة ١٨%&#10;قيادة فريق من ٦ محللين" rows={4} />
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
