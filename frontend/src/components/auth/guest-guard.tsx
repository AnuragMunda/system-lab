// Client-side guard for guest-only auth pages (login, signup, forgot-password).
// The access token is held in memory (not a cookie), so it can't be checked by
// Next middleware; instead we wait for the bootstrap session to resolve and
// redirect authenticated visitors to /dashboard. While the session is still
// resolving we render nothing to avoid flashing the auth form.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/store/hooks";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status !== "anonymous") {
    return null;
  }

  return <>{children}</>;
}