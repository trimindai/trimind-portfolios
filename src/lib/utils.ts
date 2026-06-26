import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function titleCase(name: string): string {
  if (!name) return "";
  // Capitalize each segment unless it already carries an uppercase letter
  // (preserves acronyms QA/iOS, McK, PhD). Hyphenated parts are handled
  // segment-by-segment so "al-rashidi" / "Al-rashidi" → "Al-Rashidi".
  const capSeg = (s: string) =>
    !s || /[A-Z]/.test(s) ? s : s.charAt(0).toUpperCase() + s.slice(1);
  const capWord = (w: string) => w.split("-").map(capSeg).join("-");
  return name.trim().split(/\s+/).map(capWord).join(" ");
}

export function hasPlaceholders(text: string): boolean {
  return /\[.+?\]/.test(text ?? "");
}

export function getPlaceholders(text: string): string[] {
  return (text ?? "").match(/\[.+?\]/g) ?? [];
}
