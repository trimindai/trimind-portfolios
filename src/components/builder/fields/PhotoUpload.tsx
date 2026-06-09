"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  /** Person's full name — used for the gradient initials fallback when no photo is set. */
  name?: string;
  /** Template accent color — tints the gradient initials avatar. */
  accentColor?: string;
}

/** First letter of first word + first letter of last word, uppercased (char-based, so it
 *  also works for Arabic names). Mirrors the `initials` Handlebars helper. */
function computeInitials(name?: string): string {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Darken a #rrggbb hex color by `amount` (0–1) toward black. Falls back to the
 *  input if it isn't a 6-digit hex, so non-hex accents still render a flat fill. */
function darken(hex: string, amount: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 0xff) * (1 - amount));
  const g = Math.round(((n >> 8) & 0xff) * (1 - amount));
  const b = Math.round((n & 0xff) * (1 - amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function PhotoUpload({ value, onChange, name, accentColor }: PhotoUploadProps) {
  const t = useTranslations("builder.fields");
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || "");
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const initials = computeInitials(name);
  const accent = accentColor || "#059669";

  // Revoke blob URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const processFile = async (file: File) => {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError(t("photoErrNotImage"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("photoErrTooLarge", { size: (file.size / (1024 * 1024)).toFixed(1) }));
      return;
    }

    // Revoke any previous blob URL before creating a new one
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    blobUrlRef.current = localUrl;
    setPreview(localUrl);
    setUploading(true);

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // Convert to base64 for reliable storage in the portfolio data
      // (Convex storage URLs require auth, base64 works everywhere)
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange(base64);
        setPreview(base64);
        if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      // Fallback to base64 directly
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange(base64);
        setPreview(base64);
        if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    onChange("");
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
        {t("profilePhoto")}
      </label>
      <p className="text-xs text-[var(--land-muted)] mb-2">
        {t("photoHint")}
      </p>
      <div className="flex items-center gap-4">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !uploading) { e.preventDefault(); fileInputRef.current?.click(); } }}
          aria-label={t("photoDropAria")}
          className={`group relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden bg-[var(--land-surface-raised)] flex-shrink-0 ${
            dragActive ? "border-[var(--land-accent)] ring-2 ring-[var(--land-accent)]/40" : "border-[var(--land-border)] hover:border-[var(--land-accent)]"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : uploading ? (
            <div className="animate-spin h-6 w-6 border-2 border-[var(--land-accent)] border-t-transparent rounded-full" />
          ) : initials ? (
            // Gradient initials avatar (no photo yet). Subtle camera icon appears on hover.
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-2xl tracking-wide select-none uppercase"
              style={{ background: `linear-gradient(135deg, ${accent}, ${darken(accent, 0.32)})` }}
              aria-label={name}
            >
              {initials}
            </div>
          ) : (
            <svg className="w-8 h-8 text-[var(--land-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
            </svg>
          )}
          {/* Hover hint that a photo can be uploaded (builder only). */}
          {!uploading && (
            <div className="pointer-events-none absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/40">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-[var(--land-accent-hover)] hover:text-[var(--land-accent-hover)] transition-colors disabled:opacity-50"
          >
            {uploading ? t("uploading") : preview ? t("changePhoto") : t("uploadPhoto")}
          </button>
          {preview && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              {t("remove")}
            </button>
          )}
          {uploading && (
            <div className="w-28 h-1 rounded-full bg-[var(--land-border)] overflow-hidden" role="progressbar" aria-label={t("uploading")}>
              <div className="h-full w-1/3 rounded-full bg-[var(--land-accent)] motion-safe:animate-[photo-upload-slide_1s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
