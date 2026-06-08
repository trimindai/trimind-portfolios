"use client";

import { useState, useEffect, useRef } from "react";

const DEMO_LINES = [
  { label: "Name", text: "Sarah Al-Rashidi" },
  { label: "Title", text: "Financial Analyst" },
  { label: "Company", text: "BB Bank" },
  { label: "Summary", text: "Detail-oriented financial analyst with 6+ years of experience in corporate banking, risk assessment, and portfolio management across the Gulf region." },
];

const CHAR_DELAY = 40; // ms per character
const FIELD_PAUSE = 500; // ms pause between fields completing and next starting
const RESET_PAUSE = 2000; // ms pause after all fields complete before looping

export function CvPreviewCard() {
  const [fieldIndex, setFieldIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "fieldPause" | "resetPause">("typing");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === "typing") {
      const currentField = DEMO_LINES[fieldIndex];
      if (charIndex < currentField.text.length) {
        timerRef.current = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, CHAR_DELAY);
      } else {
        // Field complete
        if (fieldIndex < DEMO_LINES.length - 1) {
          // More fields to go: pause then start next
          setPhase("fieldPause");
        } else {
          // All fields complete: longer pause then reset
          setPhase("resetPause");
        }
      }
    } else if (phase === "fieldPause") {
      timerRef.current = setTimeout(() => {
        setFieldIndex((prev) => prev + 1);
        setCharIndex(0);
        setPhase("typing");
      }, FIELD_PAUSE);
    } else if (phase === "resetPause") {
      timerRef.current = setTimeout(() => {
        setFieldIndex(0);
        setCharIndex(0);
        setPhase("typing");
      }, RESET_PAUSE);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fieldIndex, charIndex, phase]);

  return (
    <div className="mt-6 lg:mt-0 w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">AI generating...</span>
        </div>
        <div className="space-y-2">
          {DEMO_LINES.map((line, i) => {
            let displayText = "";
            let showCursor = false;

            if (i < fieldIndex) {
              // Completed field
              displayText = line.text;
            } else if (i === fieldIndex) {
              // Currently typing field
              displayText = line.text.slice(0, charIndex);
              showCursor = phase === "typing";
            }
            // Fields after fieldIndex stay empty (no text, no "...")

            return (
              <div key={i}>
                <p className="text-[10px] uppercase tracking-wider text-gray-400">{line.label}</p>
                <p className={`text-sm text-gray-900 min-h-[1.25rem] ${i === 3 ? "leading-relaxed" : "font-medium"}`}>
                  {displayText}
                  {showCursor && <span className="inline-block w-0.5 h-4 bg-emerald-500 animate-pulse ml-0.5 align-text-bottom" />}
                </p>
              </div>
            );
          })}
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
