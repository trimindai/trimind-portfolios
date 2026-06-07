import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function titleCase(name: string): string {
  if (!name) return "";
  return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export function hasPlaceholders(text: string): boolean {
  return /\[.+?\]/.test(text ?? "");
}

export function getPlaceholders(text: string): string[] {
  return (text ?? "").match(/\[.+?\]/g) ?? [];
}
