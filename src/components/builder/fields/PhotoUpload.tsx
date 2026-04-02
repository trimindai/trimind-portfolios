"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useRef } from "react";

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const url = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
      onChange(url);
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-slate-300 mb-1.5 block">
        Profile Photo
      </label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-slate-700 hover:border-emerald-500 rounded-lg p-6 text-center cursor-pointer transition-colors"
      >
        {value ? (
          <img
            src={value}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mx-auto"
          />
        ) : (
          <div className="text-slate-500">
            {uploading ? "Uploading..." : "Click to upload photo"}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
