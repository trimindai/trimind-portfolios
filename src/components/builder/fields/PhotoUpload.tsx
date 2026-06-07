"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useRef, useEffect } from "react";

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
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || "");
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
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

  const handleRemove = () => {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    onChange("");
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="text-sm font-medium text-[var(--land-bright)] mb-1.5 block">
        Profile Photo
      </label>
      <p className="text-xs text-[var(--land-muted)] mb-2">
        Square photo works best. Max 5MB. JPG or PNG.
      </p>
      <div className="flex items-center gap-4">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="group relative w-24 h-24 rounded-full border-2 border-dashed border-[var(--land-border)] hover:border-[var(--land-accent)] flex items-center justify-center cursor-pointer transition-colors overflow-hidden bg-[var(--land-surface-raised)] flex-shrink-0"
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
            {uploading ? "Uploading..." : preview ? "Change photo" : "Upload photo"}
          </button>
          {preview && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
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
