"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { DynamicList } from "../fields/DynamicList";

interface BasicsStepProps {
  data: any;
  onChange: (updates: any) => void;
  [key: string]: any;
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
        <p className="text-sm text-slate-400 mt-1">Fill in your core professional identity. The published portfolio will have an auto-translate button for Arabic.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Full Name" value={basics.fullName} onChange={(v) => updateBasics("fullName", v)} required placeholder="Sarah Al-Rashidi" hint="As it appears on your official documents" />
        <TextField label="Professional Title" value={basics.title} onChange={(v) => updateBasics("title", v)} required placeholder="Senior Financial Analyst" hint="Your current or target role" examples={["Senior Financial Analyst", "Software Engineer", "Marketing Director", "UX Designer", "Project Manager"]} />
      </div>

      <TextField label="Subtitle / Tagline" value={basics.subtitle} onChange={(v) => updateBasics("subtitle", v)} placeholder="Transforming data into strategic insights" hint="A one-liner that captures your professional brand" examples={["Transforming complex data into actionable insights", "Building scalable solutions for enterprise challenges", "Driving growth through strategic innovation"]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Email" value={basics.email} onChange={(v) => updateBasics("email", v)} required type="email" placeholder="email@example.com" />
        <TextField label="Phone" value={basics.phone} onChange={(v) => updateBasics("phone", v)} placeholder="+965 1234 5678" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Location" value={basics.location} onChange={(v) => updateBasics("location", v)} placeholder="Kuwait City, Kuwait" />
        <TextField label="Nationality" value={basics.nationality} onChange={(v) => updateBasics("nationality", v)} placeholder="Kuwaiti National" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="LinkedIn URL" value={basics.linkedin} onChange={(v) => updateBasics("linkedin", v)} placeholder="linkedin.com/in/yourname" />
        <TextField label="Website" value={basics.website} onChange={(v) => updateBasics("website", v)} placeholder="yourwebsite.com" />
      </div>

      <TextareaField
        label="Professional Summary"
        value={basics.bio}
        onChange={(v) => updateBasics("bio", v)}
        placeholder="Write 2-3 sentences about your expertise and career highlights..."
        hint="Focus on achievements and impact, not just job duties."
        rows={3}
        writingTips={[
          "Start with your years of experience and core expertise",
          "Mention 2-3 specific achievements with numbers",
          "Use strong verbs: led, delivered, transformed, optimized",
        ]}
        templates={[
          { label: "Finance", text: "Results-driven financial analyst with [X]+ years of experience in corporate finance, investment analysis, and risk management. Proven track record of delivering data-driven insights that have influenced over $[X] in strategic decisions." },
          { label: "Tech", text: "Full-stack engineer with [X]+ years building scalable applications. Led teams of [X] and delivered solutions serving [X]+ users." },
          { label: "General", text: "Accomplished professional with [X]+ years of experience in [field]. Known for [key strength] and delivering measurable results including [achievement]." },
        ]}
      />

      <TextareaField
        label="Value Proposition"
        value={basics.valueProposition}
        onChange={(v) => updateBasics("valueProposition", v)}
        placeholder="What unique value do you bring to employers?"
        hint="Your elevator pitch — why should they hire YOU?"
        rows={4}
        writingTips={[
          "Answer: What problem do you solve better than anyone?",
          "Include your unique combination of skills",
          "Quantify your impact where possible",
        ]}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">Key Metrics</h3>
          <span className="text-xs text-slate-500">Numbers that prove impact</span>
        </div>
        <DynamicList
          items={metrics}
          onChange={(items) => onChange({ metrics: items })}
          createEmpty={() => ({ value: "", label: "" })}
          maxItems={4}
          addLabel="Add Metric"
          renderItem={(item, _, update) => (
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Value" value={item.value} onChange={(v) => update({ value: v })} placeholder="10+" examples={["10+", "$2.4B", "35+", "6", "98%"]} />
              <TextField label="Label" value={item.label} onChange={(v) => update({ label: v })} placeholder="Years Experience" examples={["Years Experience", "Projects Delivered", "Clients Served", "Certifications"]} />
            </div>
          )}
        />
      </div>
    </div>
  );
}
