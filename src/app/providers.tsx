"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { enUS, arSA } from "@clerk/localizations";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function Providers({
  children,
  locale = "en",
}: {
  children: ReactNode;
  locale?: string;
}) {
  if (!convex) return <>{children}</>;

  return (
    <ClerkProvider
      localization={locale === "ar" ? arSA : enUS}
      appearance={{ variables: { colorPrimary: "#059669" } }}
      signInUrl="/en/sign-in"
      signUpUrl="/en/sign-up"
      afterSignOutUrl="/en"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
