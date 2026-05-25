// Authenticated and auth-flow routes (dashboard, admin, sign-in, sign-up) are
// user-specific and must never be statically prerendered or cached. Forcing
// dynamic rendering here also stops the build from trying to pre-render these
// Clerk-gated pages, which require <ClerkProvider> at request time, not build time.
export const dynamic = "force-dynamic";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
