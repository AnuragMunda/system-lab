import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Your Laboratory — System Labs",
  description:
    "Create a System Labs account to design distributed architectures and simulate real-world behavior.",
};

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
