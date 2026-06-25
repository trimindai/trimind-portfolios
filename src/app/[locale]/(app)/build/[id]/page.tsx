import { Suspense } from "react";
import StudioClient from "@/components/studio/StudioClient";

// /build/[id] — CV Studio in EDIT mode: loads an existing portfolio straight
// into the two-pane studio (no upload step). Same component as /build.
export default async function BuildEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <StudioClient initialId={id} />
    </Suspense>
  );
}
