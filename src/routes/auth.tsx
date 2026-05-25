import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — CrypGuyKy" }, { name: "robots", content: "noindex" }] }),
});

function AuthPage() {
  return (
    <div className="min-h-screen bg-background grid place-items-center px-6 py-16">
      <SignIn routing="hash" fallbackRedirectUrl="/admin" />
    </div>
  );
}
