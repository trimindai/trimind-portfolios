"use client";

import { useState } from "react";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";

interface EngineerBasicsStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function EngineerBasicsStep({ data, onChange }: EngineerBasicsStepProps) {
  const basics = data.basics || {};
  // Mobile: collapse optional fields so the step opens with just the 3 required
  // fields. Desktop (md+) always shows everything.
  const [showOptional, setShowOptional] = useState(false);

  const updateBasics = (field: string, value: string) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">Basic Information</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          Your engineering identity. The published portfolio auto-hides empty fields.
        </p>
      </div>

      {/* REQUIRED — always visible */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Full Name"
            value={basics.fullName}
            onChange={(v) => updateBasics("fullName", v)}
            required
            placeholder="Ahmad Al-Mutairi"
            hint="As it appears on your professional documents"
          />
          <TextField
            label="Engineering Discipline"
            value={basics.title}
            onChange={(v) => updateBasics("title", v)}
            required
            placeholder="Electrical Engineer"
            hint="Your engineering specialization"
            examples={[
              "Electrical Engineer",
              "Mechanical Engineer",
              "Civil Engineer",
              "Petroleum Engineer",
              "Chemical Engineer",
              "Industrial Engineer",
              "Structural Engineer",
              "Process Engineer",
            ]}
          />
        </div>
        <TextField
          label="Email"
          value={basics.email}
          onChange={(v) => updateBasics("email", v)}
          required
          type="email"
          placeholder="email@example.com"
        />
      </div>

      {/* OPTIONAL toggle — MOBILE ONLY. Desktop always shows the fields below. */}
      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="md:hidden w-full flex items-center justify-between min-h-[48px] px-4 rounded-lg border border-[var(--land-border)] bg-[var(--land-surface)]/40 text-sm font-medium text-[var(--land-bright)]"
        aria-expanded={showOptional}
      >
        <span>{showOptional ? "▼ " : "▶ "}Optional details</span>
        <span className="text-xs text-[var(--land-muted)]">{showOptional ? "Hide" : "Phone, links, bio…"}</span>
      </button>

      {/* OPTIONAL — collapsed on mobile (unless expanded), always shown on md+ */}
      <div className={`${showOptional ? "block" : "hidden"} md:block space-y-6`}>
      <TextField
        label="Subtitle / Tagline"
        value={basics.subtitle}
        onChange={(v) => updateBasics("subtitle", v)}
        placeholder="Power systems and renewable energy integration"
        hint="A one-liner about your engineering focus area"
        examples={[
          "Power systems and renewable energy integration",
          "Structural design for high-rise and industrial facilities",
          "Process optimization in oil & gas downstream operations",
          "Embedded systems and industrial automation",
        ]}
      />

      <TextField
        label="Phone"
        value={basics.phone}
        onChange={(v) => updateBasics("phone", v)}
        placeholder="+965 1234 5678"
      />

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
        />
        <TextField
          label="GitHub URL"
          value={basics.github}
          onChange={(v) => updateBasics("github", v)}
          placeholder="github.com/yourname"
          hint="For code repos, simulations, or technical work"
        />
      </div>

      <TextField
        label="Website"
        value={basics.website}
        onChange={(v) => updateBasics("website", v)}
        placeholder="yourwebsite.com"
      />

      {/* Resume — greglagana.com-style prominent download button */}
      <div className="bg-[var(--land-surface-raised)]/30 border border-[var(--land-accent)]/30 rounded-lg p-4">
        <TextField
          label="Resume / CV URL"
          value={basics.resumeUrl}
          onChange={(v) => updateBasics("resumeUrl", v)}
          placeholder="https://drive.google.com/file/d/.../view"
          hint="Link to your resume PDF. Shows as a prominent 'Resume' button on the portfolio (like greglagana.com). Upload to Google Drive, Dropbox, or your own site."
        />
      </div>

      <TextareaField
        label="About Me"
        value={basics.bio}
        onChange={(v) => updateBasics("bio", v)}
        placeholder="Write 2-3 sentences about your engineering background and expertise..."
        hint="Describe your technical focus, industries you've worked in, and what drives you."
        rows={4}
        writingTips={[
          "Lead with your discipline and years of experience",
          "Name the industries you've worked in (oil & gas, construction, power, etc.)",
          "Mention specific technical domains (SCADA, FEA, PLC, CFD, etc.)",
          "Keep it factual — let your projects speak for impact",
        ]}
        templates={[
          {
            label: "Experienced",
            text: "[Discipline] engineer with [X]+ years of experience in [industry]. Specialized in [technical domain], with hands-on project delivery spanning [scope]. Committed to engineering excellence and practical problem-solving.",
          },
          {
            label: "Fresh Graduate",
            text: "Recent [degree] graduate from [university] with strong foundations in [technical areas]. Completed [X] academic and personal projects including [notable project]. Eager to apply analytical skills to real-world engineering challenges.",
          },
        ]}
      />

      <TextareaField
        label="Career Objective"
        value={basics.valueProposition}
        onChange={(v) => updateBasics("valueProposition", v)}
        placeholder="What kind of engineering work are you seeking?"
        hint="Optional — shown as a highlighted quote on your portfolio"
        rows={3}
        writingTips={[
          "State the type of role or projects you're targeting",
          "Mention what you bring: specific skills, certifications, domain knowledge",
          "Keep it concise — 1-2 sentences",
        ]}
      />
      </div>
    </div>
  );
}
