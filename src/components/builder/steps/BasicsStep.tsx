"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";
import { LanguageToggle } from "../fields/LanguageToggle";

interface BasicsStepProps {
  data: any;
  onChange: (updates: any) => void;
  contentAr?: any;
  onArChange?: (updates: any) => void;
  editLang?: "en" | "ar";
  onLangChange?: (lang: "en" | "ar") => void;
}

export function BasicsStep({ data, onChange, contentAr = {}, onArChange, editLang = "en", onLangChange }: BasicsStepProps) {
  const basics = data.basics || {};
  const basicsAr = contentAr.basics || {};
  const metrics = data.metrics || [];
  const metricsAr = contentAr.metrics || [];
  const isAr = editLang === "ar";

  const updateBasics = (field: string, value: string) => {
    if (isAr) {
      onArChange?.({ basics: { ...basicsAr, [field]: value } });
    } else {
      onChange({ basics: { ...basics, [field]: value } });
    }
  };

  const currentBasics = isAr ? basicsAr : basics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>
          <p className="text-sm text-slate-400 mt-1">
            {isAr ? "أدخل معلوماتك باللغة العربية" : "Fill in your core professional identity."}
          </p>
        </div>
      </div>

      {onLangChange && <LanguageToggle lang={editLang} onChange={onLangChange} />}

      <div className={isAr ? "text-right" : ""} dir={isAr ? "rtl" : "ltr"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label={isAr ? "الاسم الكامل" : "Full Name"} value={currentBasics.fullName} onChange={(v) => updateBasics("fullName", v)} required placeholder={isAr ? "سارة الرشيدي" : "Sarah Al-Rashidi"} />
          <TextField label={isAr ? "المسمى الوظيفي" : "Professional Title"} value={currentBasics.title} onChange={(v) => updateBasics("title", v)} required placeholder={isAr ? "محلل مالي أول" : "Senior Financial Analyst"} />
        </div>

        <div className="mt-4">
          <TextField label={isAr ? "العنوان الفرعي" : "Subtitle / Tagline"} value={currentBasics.subtitle} onChange={(v) => updateBasics("subtitle", v)} placeholder={isAr ? "تحويل البيانات إلى رؤى استراتيجية" : "Transforming data into strategic insights"} />
        </div>

        {!isAr && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <TextField label="Email" value={basics.email} onChange={(v) => onChange({ basics: { ...basics, email: v } })} required type="email" placeholder="email@example.com" />
              <TextField label="Phone" value={basics.phone} onChange={(v) => onChange({ basics: { ...basics, phone: v } })} placeholder="+965 1234 5678" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <TextField label="Location" value={basics.location} onChange={(v) => onChange({ basics: { ...basics, location: v } })} placeholder="Kuwait City, Kuwait" />
              <TextField label="Nationality" value={basics.nationality} onChange={(v) => onChange({ basics: { ...basics, nationality: v } })} placeholder="Kuwaiti National" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <TextField label="LinkedIn URL" value={basics.linkedin} onChange={(v) => onChange({ basics: { ...basics, linkedin: v } })} placeholder="linkedin.com/in/yourname" />
              <TextField label="Website" value={basics.website} onChange={(v) => onChange({ basics: { ...basics, website: v } })} placeholder="yourwebsite.com" />
            </div>
          </>
        )}

        {isAr && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <TextField label="الموقع" value={basicsAr.location} onChange={(v) => onArChange?.({ basics: { ...basicsAr, location: v } })} placeholder="مدينة الكويت" />
            <TextField label="الجنسية" value={basicsAr.nationality} onChange={(v) => onArChange?.({ basics: { ...basicsAr, nationality: v } })} placeholder="كويتي" />
          </div>
        )}

        <div className="mt-4">
          <TextareaField
            label={isAr ? "الملخص المهني" : "Professional Summary"}
            value={isAr ? (basicsAr.bio || "") : (basics.bio || "")}
            onChange={(v) => updateBasics("bio", v)}
            placeholder={isAr ? "اكتب ملخصاً موجزاً عن خبرتك المهنية..." : "Write 2-3 sentences about your expertise..."}
            rows={3}
            writingTips={isAr ? undefined : [
              "Start with years of experience and core expertise",
              "Mention 2-3 specific achievements with numbers",
              "Use strong verbs: led, delivered, transformed, optimized",
            ]}
          />
        </div>

        <div className="mt-4">
          <TextareaField
            label={isAr ? "عرض القيمة" : "Value Proposition"}
            value={isAr ? (basicsAr.valueProposition || "") : (basics.valueProposition || "")}
            onChange={(v) => updateBasics("valueProposition", v)}
            placeholder={isAr ? "ما القيمة الفريدة التي تقدمها؟" : "What unique value do you bring?"}
            rows={4}
          />
        </div>

        {!isAr && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-3">Key Metrics</h3>
            <DynamicList
              items={metrics}
              onChange={(items) => onChange({ metrics: items })}
              createEmpty={() => ({ value: "", label: "" })}
              maxItems={4}
              addLabel="Add Metric"
              renderItem={(item, _, update) => (
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Value" value={item.value} onChange={(v) => update({ value: v })} placeholder="10+" />
                  <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} placeholder="Years Experience" />
                </div>
              )}
            />
          </div>
        )}

        {isAr && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-3">المقاييس الرئيسية</h3>
            <DynamicList
              items={metricsAr.length ? metricsAr : metrics.map((m: any) => ({ value: m.value, label: "" }))}
              onChange={(items) => onArChange?.({ metrics: items })}
              createEmpty={() => ({ value: "", label: "" })}
              maxItems={4}
              addLabel="إضافة مقياس"
              renderItem={(item, _, update) => (
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="القيمة" value={item.value} onChange={(v) => update({ value: v })} placeholder="١٠+" />
                  <TextField label="التسمية" value={item.label} onChange={(v) => update({ label: v })} placeholder="سنوات خبرة" />
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
