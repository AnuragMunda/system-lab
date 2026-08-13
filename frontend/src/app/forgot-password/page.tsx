// Forgot-password route (`/forgot-password`) — renders the password reset request screen.
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

// Page-level metadata for the reset-password screen.
export const metadata: Metadata = {
  title: "Reset Password — System Labs",
  description: "Reset the password for your System Labs account.",
};

// Renders the forgot-password page: card explaining the reset flow and wrapping the ForgotPasswordForm.
export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Reset your password"
        subtitle="Enter the email associated with your account and we'll send you a link to reset your password."
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}
