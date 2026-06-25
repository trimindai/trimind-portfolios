import { Suspense } from "react";
import StudioClient from "@/components/studio/StudioClient";

// /build — CV Studio in CREATE mode (upload/paste → AI auto-build).
// Suspense satisfies useSearchParams (StudioClient resumes a draft via ?id=).
export default function BuildPage() {
  return (
    <Suspense>
      <StudioClient />
    </Suspense>
  );
}
