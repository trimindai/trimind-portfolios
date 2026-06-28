// Bundled pricing tiers (one-time, KWD). "Free Preview" = no purchase
// (a draft portfolio: watermarked, no export, no live page).
export const PRICE_TOLERANCE = 0.99; // 1% tolerance for FX rounding

export type Tier = "essential" | "pro" | "pro_review";

// Full price of each tier bought from scratch.
export const TIER_PRICE: Record<Tier, number> = {
  essential: 4.9, // CV PDF (watermark off), no live page
  pro: 9.9, // + live /p/<name> page + QR + 1 year hosting  ⭐ hero
  pro_review: 24.9, // + human expert review (48h)
};

export const TIER_RANK: Record<Tier, number> = {
  essential: 1,
  pro: 2,
  pro_review: 3,
};

// What the user actually pays to reach `target` given their `current` tier:
// full price from scratch, or the upgrade delta from a lower tier.
export function priceFor(target: Tier, current?: Tier | null): number {
  if (!current || TIER_RANK[current] >= TIER_RANK[target]) return TIER_PRICE[target];
  if (current === "essential" && target === "pro") return 5.0;
  if (current === "essential" && target === "pro_review") return 20.0; // →pro (5) + review (15)
  if (current === "pro" && target === "pro_review") return 15.0; // review add-on
  return TIER_PRICE[target];
}

// Legacy: a flat-4.9 purchase (status "paid"/"published" with no `tier`) used
// to unlock EVERYTHING, so treat it as Pro for access checks. New purchases set
// an explicit `tier`.
export function effectiveTier(p: {
  tier?: Tier | null;
  status?: string | null;
}): Tier | null {
  if (p?.tier) return p.tier;
  if (p?.status === "paid" || p?.status === "published") return "pro";
  return null;
}

// Feature gates.
export const canExportPdf = (t: Tier | null): boolean => t != null; // any paid tier
export const canPublishLive = (t: Tier | null): boolean =>
  t === "pro" || t === "pro_review";
export const hasExpertReview = (t: Tier | null): boolean => t === "pro_review";

// Back-compat: some callers still import PRICE_KWD (= the Essential entry price).
export const PRICE_KWD = TIER_PRICE.essential;
