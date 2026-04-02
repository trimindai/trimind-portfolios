"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface BasicsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function BasicsStep({ data, onChange }: BasicsStepProps) {
  const basics = data.basics || {};
  const metrics = data.metrics || [];

  const updateBasics = (field: string, value: string) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Basic Information</h2>
        <p className="text-sm text-slate-400 mt-1">Start with your core professional identity. This is what hiring managers see first.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Full Name"
          value={basics.fullName}
          onChange={(v) => updateBasics("fullName", v)}
          required
          placeholder="Sarah Al-Rashidi"
          hint="As it appears on your official documents"
        />
        <TextField
          label="Professional Title"
          value={basics.title}
          onChange={(v) => updateBasics("title", v)}
          required
          placeholder="Senior Financial Analyst"
          hint="Your current or target role title"
          aiEnhance
          aiContext="professional job title for a portfolio - make it concise, impactful, and industry-standard"
        />
      </div>

      <TextField
        label="Subtitle / Tagline"
        value={basics.subtitle}
        onChange={(v) => updateBasics("subtitle", v)}
        placeholder="Transforming data into strategic insights"
        hint="A one-liner that captures your professional brand"
        aiEnhance
        aiContext="professional tagline/subtitle for a portfolio - make it memorable and compelling for recruiters"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Email"
          value={basics.email}
          onChange={(v) => updateBasics("email", v)}
          required
          type="email"
          placeholder="email@example.com"
        />
        <TextField
          label="Phone"
          value={basics.phone}
          onChange={(v) => updateBasics("phone", v)}
          placeholder="+965 1234 5678"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Location"
          value={basics.location}
          onChange={(v) => updateBasics("location", v)}
          placeholder="Kuwait City, Kuwait"
        />
        <TextField
          label="Nationality"
          value={basics.nationality}
          onChange={(v) => updateBasics("nationality", v)}
          placeholder="Kuwaiti National"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="LinkedIn URL"
          value={basics.linkedin}
          onChange={(v) => updateBasics("linkedin", v)}
          placeholder="linkedin.com/in/yourname"
          hint="Full URL or just the path"
        />
        <TextField
          label="Website"
          value={basics.website}
          onChange={(v) => updateBasics("website", v)}
          placeholder="yourwebsite.com"
        />
      </div>

      <TextareaField
        label="Professional Summary"
        value={basics.bio}
        onChange={(v) => updateBasics("bio", v)}
        placeholder="Write a brief summary of your career, expertise, and what makes you stand out..."
        hint="2-3 sentences. Focus on achievements, not just responsibilities."
        rows={3}
        aiEnhance
        aiContext="professional summary/bio for a corporate portfolio targeting hiring managers. Make it powerful, achievement-focused, and compelling. Use strong action verbs. Mention quantified results if possible."
      />

      <TextareaField
        label="Value Proposition"
        value={basics.valueProposition}
        onChange={(v) => updateBasics("valueProposition", v)}
        placeholder="I bring 10+ years of experience in transforming complex financial data..."
        hint="What unique value do you bring to an employer? This is your elevator pitch."
        rows={4}
        aiEnhance
        aiContext="value proposition statement for a professional portfolio. This should clearly articulate the candidate's unique selling points, key strengths, and the value they bring to potential employers. Make it persuasive and results-oriented."
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">Key Metrics</h3>
          <span className="text-xs text-slate-500">Numbers that prove your impact</span>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Add up to 4 impressive numbers that quantify your career achievements (e.g., &quot;10+ Years Experience&quot;, &quot;$2.4B Assets Analyzed&quot;).
        </p>
        <DynamicList
          items={metrics}
          onChange={(items) => onChange({ metrics: items })}
          createEmpty={() => ({ value: "", label: "" })}
          maxItems={4}
          addLabel="Add Metric"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Value" value={item.value} onChange={(v) => update({ value: v })} placeholder="10+" hint="The number or stat" />
              <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} placeholder="Years Experience" hint="What it measures" />
            </div>
          )}
        />
      </div>
    </div>
  );
}
