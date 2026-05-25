"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * OAuth landing route. Google sign-in/sign-up redirect here; Clerk completes
 * the handshake and forwards to the `redirectUrlComplete` captured when the
 * flow started (the original template/dashboard target).
 */
export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--land-bg)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--land-border)] border-t-[var(--land-accent)]" />
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
