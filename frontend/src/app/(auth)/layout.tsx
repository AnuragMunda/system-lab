import { AuthLayout } from "@/components/auth/auth-layout";
import { GuestGuard } from "@/components/auth/guest-guard";

export default function AuthLayoutRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  );
}
