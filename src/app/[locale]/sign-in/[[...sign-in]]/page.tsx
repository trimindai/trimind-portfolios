import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--land-bg)]">
      <SignIn
        fallbackRedirectUrl="/en/dashboard"
        appearance={{
          elements: {
            footerAction__signUp: "font-semibold text-[var(--land-accent)]",
          },
        }}
      />
    </div>
  );
}
