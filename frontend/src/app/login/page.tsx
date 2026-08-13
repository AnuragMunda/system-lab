import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — System Labs",
  description:
    "Sign in to System Labs to continue building, breaking, and understanding distributed systems.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Continue building, breaking, and understanding systems."
      >
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
