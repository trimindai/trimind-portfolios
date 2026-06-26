// One CV per user. Existing users may have several portfolios from before this
// rule; we surface exactly one and hide (never delete) the rest. Selection:
//   1. A paid/published CV always wins — a paying user is never stranded.
//   2. Otherwise the most recently edited (fallback: most recently created).
// Operates on the projected card shape returned by portfolios.listByUser.

type CvLike = {
  _id: string;
  status?: string;
  lastEditedAt?: number;
  _creationTime?: number;
};

export function pickPrimaryPortfolio<T extends CvLike>(items: T[] | undefined): T | null {
  if (!items || items.length === 0) return null;
  const recency = (p: T) => p.lastEditedAt ?? p._creationTime ?? 0;
  const sorted = [...items].sort((a, b) => recency(b) - recency(a));
  return (
    sorted.find((p) => p.status === "paid" || p.status === "published") ?? sorted[0]
  );
}
