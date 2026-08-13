import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password — System Labs",
  description: "Reset the password for your System Labs account.",
};

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
