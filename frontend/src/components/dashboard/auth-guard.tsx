// Client-side guard for authenticated dashboard routes. The access token is
// held in memory (not a cookie), so it can't be checked by Next middleware;
// instead we wait for the bootstrap session to resolve and redirect anonymous
// visitors to /login. While the session is still resolving we render nothing.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/store/hooks";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
