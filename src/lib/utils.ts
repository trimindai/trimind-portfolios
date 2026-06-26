import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function titleCase(name: string): string {
  if (!name) return "";
  // Preserve acronyms / mixed-case words (QA, iOS, McK, PhD); only fix all-lowercase.
  return name.trim().split(/\s+/)
    .map(w => /[A-Z]/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function hasPlaceholders(text: string): boolean {
  return /\[.+?\]/.test(text ?? "");
}

export function getPlaceholders(text: string): string[] {
  return (text ?? "").match(/\[.+?\]/g) ?? [];
}
