// Clerk → Convex JWT bridge.
//
// REQUIRED ENV (set in Convex dashboard → Settings → Environment Variables):
//   CLERK_JWT_ISSUER_DOMAIN  e.g. https://clerk.your-app.com  (no trailing slash)
//
// REQUIRED Clerk setup:
//   Clerk dashboard → JWT Templates → New template → Name it exactly "convex"
//   Use the Convex preset; copy the Issuer URL into CLERK_JWT_ISSUER_DOMAIN above.

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
