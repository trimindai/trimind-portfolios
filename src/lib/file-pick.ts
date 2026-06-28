// Snapshot + validate the files the CV Studio picker hands back. Pure + testable
// because this is the exact spot iOS keeps breaking:
//   1. iOS Safari clears the live FileList (input.value = "") right after the
//      onChange fires — emptying it BEFORE a deferred React setState reads it.
//      Array.from() here materialises a synchronous snapshot so a later read
//      can't lose the file.
//   2. iCloud files that aren't downloaded yet come back as 0-byte Files — those
//      are unusable and must surface a "download it first" hint, never silently
//      vanish. `picked` lets the caller tell "cancelled picker" (picked 0, stay
//      silent) apart from "picked an empty file" (picked > 0, show the hint).

export type PickedFiles = {
  /** How many entries the user actually selected (0 = cancelled the picker). */
  picked: number;
  /** Non-empty files, snapshotted off the (possibly soon-cleared) FileList. */
  usable: File[];
};

export function pickUsableFiles(list: FileList | File[] | null): PickedFiles {
  if (!list) return { picked: 0, usable: [] };
  const arr = Array.from(list);
  return { picked: arr.length, usable: arr.filter((f) => f.size > 0) };
}
