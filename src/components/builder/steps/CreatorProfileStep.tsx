"use client";

import { useState } from "react";
import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";

interface CreatorProfileStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function CreatorProfileStep({ data, onChange }: CreatorProfileStepProps) {
  const basics = data.basics || {};
  // Mobile: collapse optional fields; desktop (md+) always shows everything.
  const [showOptional, setShowOptional] = useState(false);
  const set = (field: string, value: string) =>
    onChange({ basics: { ...basics, [field]: value } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--land-bright)]">Your Profile</h2>
        <p className="text-sm text-[var(--land-body)] mt-1">
          The headline of your portfolio. Your initials become the monogram — no profile photo needed.
        </p>
      </div>

      {/* REQUIRED — always visible */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Full Name" autoComplete="name"
            value={basics.fullName}
            onChange={(v) => set("fullName", v)}
            required
            placeholder="Remi Vance"
            hint="Shown large in the hero and as your monogram"
          />
          <TextField
            label="Title"
            value={basics.title}
            onChange={(v) => set("title", v)}
            required
            placeholder="Content Creator"
            hint="The small label above your name"
            examples={[
              "Content Creator",
              "YouTuber",
              "Filmmaker",
              "Podcast Host",
              "Brand Storyteller",
              "Digital Creator",
            ]}
          />
        </div>
        <TextField
          label="Email"
          value={basics.email}
          onChange={(v) => set("email", v)}
          required
          type="email" autoComplete="email" inputMode="email" dir="ltr"
          placeholder="hello@yourname.com"
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
        <span className="text-xs text-[var(--land-muted)]">{showOptional ? "Hide" : "Tagline, channels…"}</span>
      </button>

      {/* OPTIONAL — collapsed on mobile (unless expanded), always shown on md+ */}
      <div className={`${showOptional ? "block" : "hidden"} md:block space-y-6`}>
      <TextField
        label="Tagline"
        value={basics.subtitle}
        onChange={(v) => set("subtitle", v)}
        placeholder="Brand Storyteller & Short-form Specialist"
        hint="The line under your name, in the accent color"
      />

      <TextareaField
        label="Intro"
        value={basics.valueProposition}
        onChange={(v) => set("valueProposition", v)}
        placeholder="I turn brands into stories people want to watch — cinematic short-form, vlogs and campaigns across YouTube, Instagram and TikTok."
        hint="One or two sentences about what you make and who it's for. Shown in the hero."
        rows={3}
        writingTips={[
          "Lead with what you create and the platforms you create it for",
          "Name the outcome brands get (reach, engagement, audience)",
          "Keep it to 1-2 punchy sentences",
        ]}
      />

      <TextField
        label="Phone" type="tel" autoComplete="tel" inputMode="tel" dir="ltr"
        value={basics.phone}
        onChange={(v) => set("phone", v)}
        placeholder="+965 1234 5678"
      />

      <TextField
        label="Location"
        value={basics.location}
        onChange={(v) => set("location", v)}
        placeholder="Kuwait City"
      />

      <div>
        <h3 className="text-sm font-semibold text-[var(--land-bright)] mb-1">Channels</h3>
        <p className="text-xs text-[var(--land-body)] mb-3">
          Each one you add becomes a contact button. Leave blank to hide it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Instagram URL" type="url" inputMode="url" dir="ltr"
            value={basics.instagram}
            onChange={(v) => set("instagram", v)}
            placeholder="https://instagram.com/yourhandle"
          />
          <TextField
            label="YouTube URL" type="url" inputMode="url" dir="ltr"
            value={basics.youtube}
            onChange={(v) => set("youtube", v)}
            placeholder="https://youtube.com/@yourchannel"
          />
          <TextField
            label="TikTok URL" type="url" inputMode="url" dir="ltr"
            value={basics.tiktok}
            onChange={(v) => set("tiktok", v)}
            placeholder="https://tiktok.com/@yourhandle"
          />
          <TextField
            label="Website URL" type="url" inputMode="url" dir="ltr"
            value={basics.website}
            onChange={(v) => set("website", v)}
            placeholder="https://yoursite.com"
          />
          <TextField
            label="LinkedIn URL" type="url" inputMode="url" dir="ltr"
            value={basics.linkedin}
            onChange={(v) => set("linkedin", v)}
            placeholder="https://linkedin.com/in/yourname"
          />
        </div>
      </div>
      </div>
    </div>
  );
}
