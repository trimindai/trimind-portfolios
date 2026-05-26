"use client";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";

interface CreativeProfileStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function CreativeProfileStep({ data, onChange }: CreativeProfileStepProps) {
  const basics = data.basics || {};

  const updateBasics = (field: string, value: string) => {
    onChange({ basics: { ...basics, [field]: value } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Your Profile</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          The headline of your portfolio. Your initials become the monogram — no profile photo needed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Full Name"
          value={basics.fullName}
          onChange={(v) => updateBasics("fullName", v)}
          required
          placeholder="Dalal Al-Kandari"
          hint="Shown large in the hero and as your monogram"
        />
        <TextField
          label="Title / Discipline"
          value={basics.title}
          onChange={(v) => updateBasics("title", v)}
          required
          placeholder="Visual Artist"
          examples={[
            "Visual Artist",
            "Photographer",
            "Illustrator",
            "Sculptor",
            "Graphic Designer",
            "Art Director",
            "Mixed-Media Artist",
            "Ceramicist",
          ]}
        />
      </div>

      <TextField
        label="Tagline"
        value={basics.subtitle}
        onChange={(v) => updateBasics("subtitle", v)}
        placeholder="Contemporary Mixed-Media Artist"
        hint="A short line under your name. Shown in the accent color."
        examples={[
          "Contemporary Mixed-Media Artist",
          "Light, Memory & Landscape",
          "Abstract Painter & Printmaker",
          "Documentary Photographer",
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Email"
          value={basics.email}
          onChange={(v) => updateBasics("email", v)}
          required
          type="email"
          placeholder="you@example.com"
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
          placeholder="Kuwait City"
        />
        <TextField
          label="Nationality"
          value={basics.nationality}
          onChange={(v) => updateBasics("nationality", v)}
          placeholder="Kuwaiti"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField
          label="Instagram URL"
          value={basics.instagram}
          onChange={(v) => updateBasics("instagram", v)}
          placeholder="https://instagram.com/yourhandle"
          hint="Where most artists & designers live"
        />
        <TextField
          label="LinkedIn URL"
          value={basics.linkedin}
          onChange={(v) => updateBasics("linkedin", v)}
          placeholder="https://linkedin.com/in/yourname"
        />
        <TextField
          label="Website / Portfolio URL"
          value={basics.website}
          onChange={(v) => updateBasics("website", v)}
          placeholder="https://yourstudio.com"
          hint="Behance, Dribbble, or your own site"
        />
      </div>

      <TextareaField
        label="Artist Bio"
        value={basics.bio}
        onChange={(v) => updateBasics("bio", v)}
        placeholder="A few sentences about your practice, themes, and what drives your work..."
        hint="Shown in the hero, beside your monogram. Keep it evocative and concise."
        rows={4}
        writingTips={[
          "Open with your medium and the themes you explore",
          "Name what makes your perspective distinct",
          "Mention notable shows, collections, or recognition if relevant",
          "Keep it to 2-3 sentences — let the work speak",
        ]}
        templates={[
          {
            label: "Practice-led",
            text: "I work across [mediums] to explore [themes]. My practice is rooted in [place/idea], translating [subject] into [form]. Recent work has been shown at [venues].",
          },
          {
            label: "Emerging artist",
            text: "[Discipline] based in [city], working primarily in [medium]. My work investigates [theme], drawing on [influence]. I am currently developing [project/series].",
          },
        ]}
      />
    </div>
  );
}
