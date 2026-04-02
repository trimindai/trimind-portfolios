"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useRef } from "react";

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Convert to base64 for reliable storage in the portfolio data
      // (Convex storage URLs require auth, base64 works everywhere)
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange(base64);
        setPreview(base64);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      // Fallback to base64 directly
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange(base64);
        setPreview(base64);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="text-sm font-medium text-slate-300 mb-1.5 block">
        Profile Photo
      </label>
      <p className="text-xs text-slate-500 mb-2">
        Square photo works best. Max 5MB. JPG or PNG.
      </p>
      <div className="flex items-center gap-4">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 hover:border-emerald-500 flex items-center justify-center cursor-pointer transition-colors overflow-hidden bg-slate-800 flex-shrink-0"
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              {uploading ? (
                <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
              ) : (
                <svg className="w-8 h-8 text-slate-500 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                </svg>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
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
