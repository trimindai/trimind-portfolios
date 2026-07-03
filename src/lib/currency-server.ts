import "server-only";
import { cookies } from "next/headers";
import { CUR_COOKIE, type Cur } from "./currency";

// Server helper: read the 'cur' cookie set by middleware (SA → SAR, else KWD).
// The STATIC next/headers import (not a dynamic import()) is what makes Next
// detect the cookie read and render the page per-request instead of caching a
// static KWD copy — do not inline this back into the client-shared currency.ts.
export async function getCurrency(): Promise<Cur> {
  return (await cookies()).get(CUR_COOKIE)?.value === "SAR" ? "SAR" : "KWD";
}
