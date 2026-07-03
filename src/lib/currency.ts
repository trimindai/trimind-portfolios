// Display-currency localization. Prices are authored/charged in KWD (the
// MyFatoorah merchant account settles in KWD); Saudi visitors are SHOWN the
// equivalent in SAR as an indicative price — the actual charge stays KWD.
// ponytail: two currencies only (KW default, SA), fixed FX rate. Add a live
// FX feed / more currencies only if we actually expand beyond the Gulf entry.

export type Cur = "KWD" | "SAR";
export const CUR_COOKIE = "cur";

// Fixed conversion. 4.900 KWD * 12.04 ≈ 59.00 SAR → we round to whole riyals.
// Update if the KWD/SAR peg drifts materially.
export const RATE_KWD_SAR = 12.04;

type Meta = { code: Cur; decimals: number; symEn: string; symAr: string; rate: number };
export const CURRENCIES: Record<Cur, Meta> = {
  KWD: { code: "KWD", decimals: 3, symEn: "KD", symAr: "د.ك", rate: 1 },
  SAR: { code: "SAR", decimals: 0, symEn: "SAR", symAr: "ر.س", rate: RATE_KWD_SAR },
};

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const toArabicDigits = (s: string): string =>
  s.replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

// A KWD amount converted to the display currency (whole riyals for SAR).
export function amountIn(kwd: number, cur: Cur): number {
  return cur === "SAR" ? Math.round(kwd * RATE_KWD_SAR) : kwd;
}

// Number only, localized digits: "4.900" / "٤.٩٠٠" / "59" / "٥٩".
export function priceNumber(kwd: number, cur: Cur, locale: "en" | "ar"): string {
  const s = amountIn(kwd, cur).toFixed(CURRENCIES[cur].decimals);
  return locale === "ar" ? toArabicDigits(s) : s;
}

export function currencySymbol(cur: Cur, locale: "en" | "ar"): string {
  return locale === "ar" ? CURRENCIES[cur].symAr : CURRENCIES[cur].symEn;
}

// Full label: "4.900 KD" · "٤.٩٠٠ د.ك" · "SAR 59" · "٥٩ ر.س".
export function priceLabel(kwd: number, cur: Cur, locale: "en" | "ar"): string {
  const n = priceNumber(kwd, cur, locale);
  const sym = currencySymbol(cur, locale);
  return locale === "en" && cur === "SAR" ? `${sym} ${n}` : `${n} ${sym}`;
}

// Saudi checkout disclaimer — the SAR figure is indicative; the charge is KWD.
export const chargedInKwdNote = (locale: "en" | "ar"): string =>
  locale === "ar"
    ? "يُحصّل المبلغ بالدينار الكويتي المكافئ"
    : "charged in the equivalent Kuwaiti Dinar";

// getCurrency() lives in currency-server.ts (static next/headers import forces
// per-request rendering). This module stays pure so client components can import
// the formatting helpers above.
