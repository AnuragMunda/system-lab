// Signup route (`/signup`) — renders the account creation screen using the shared auth layout and card.
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

// Page-level metadata for the signup screen.
export const metadata: Metadata = {
  title: "Sign Up | System Labs",
  description:
    "Create a System Labs account to design distributed architectures and simulate real-world behavior.",
};

// Renders the signup page: "create your laboratory" card wrapping the SignupForm.
export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Create your laboratory."
        subtitle="Build distributed systems. Simulate real-world behavior. Learn by breaking them."
      >
        <SignupForm />
      </AuthCard>
    </AuthLayout>
  );
}
