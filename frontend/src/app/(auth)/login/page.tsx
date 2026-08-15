// Login route (`/login`) — renders the sign-in screen using the shared auth layout and card.
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

// Page-level metadata for the sign-in screen.
export const metadata: Metadata = {
  title: "Sign In | System Labs",
  description:
    "Sign in to System Labs to continue building, breaking, and understanding distributed systems.",
};

// Renders the login page: welcome card wrapping the email/password LoginForm.
export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Continue building, breaking, and understanding systems."
    >
      <LoginForm />
    </AuthCard>
  );
}
