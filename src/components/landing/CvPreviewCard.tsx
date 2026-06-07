"use client";

import { useState, useEffect } from "react";

const DEMO_LINES = [
  { label: "Name", text: "Sarah Al-Rashidi" },
  { label: "Title", text: "Financial Analyst" },
  { label: "Company", text: "BB Bank" },
  { label: "Summary", text: "Detail-oriented financial analyst with 6+ years of experience in corporate banking, risk assessment, and portfolio management across the Gulf region." },
];

export function CvPreviewCard() {
  const [charIndex, setCharIndex] = useState(0);
  const fullText = DEMO_LINES.map((l) => l.text).join("|||");
  const totalChars = fullText.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= totalChars) return 0;
        return prev + 1;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [totalChars]);

  let consumed = 0;
  const rendered = DEMO_LINES.map((line) => {
    const start = consumed;
    consumed += line.text.length + 3;
    const visible = Math.max(0, Math.min(line.text.length, charIndex - start));
    const text = line.text.slice(0, visible);
    const showCursor = charIndex >= start && charIndex < start + line.text.length;
    return { ...line, text, showCursor };
  });

  return (
    <div className="mt-6 lg:mt-0 w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">AI generating...</span>
        </div>
        <div className="space-y-2">
          {rendered.map((line, i) => (
            <div key={i}>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">{line.label}</p>
              <p className={`text-sm text-gray-900 ${i === 3 ? "leading-relaxed" : "font-medium"}`}>
                {line.text || <span className="text-gray-300">...</span>}
                {line.showCursor && <span className="inline-block w-0.5 h-4 bg-emerald-500 animate-pulse ml-0.5 align-text-bottom" />}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex gap-1">
            {["Skills", "Education", "Certs"].map((s) => (
              <span key={s} className="text-[9px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{s}</span>
            ))}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">~10 sec</span>
        </div>
      </div>
    </div>
  );
}
