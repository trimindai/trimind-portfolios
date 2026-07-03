"use client";

import { useEffect, useState } from "react";
import { CUR_COOKIE, type Cur } from "@/lib/currency";

// Client read of the 'cur' cookie set by middleware. SSR renders KWD, then
// hydrates to SAR for Saudi visitors (a one-frame price settle, acceptable).
export function useCurrency(): Cur {
  const [cur, setCur] = useState<Cur>("KWD");
  useEffect(() => {
    const m = document.cookie.match(new RegExp(`(?:^|; )${CUR_COOKIE}=([^;]+)`));
    if (m?.[1] === "SAR") setCur("SAR");
  }, []);
  return cur;
}
