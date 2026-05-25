import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--land-bg)]">
      <SignUp
        fallbackRedirectUrl="/en/dashboard"
        appearance={{
          elements: {
            footerAction__signIn: "font-semibold text-[var(--land-accent)]",
          },
        }}
      />
    </div>
  );
}
