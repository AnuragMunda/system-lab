import Link from "next/link";
import { Terminal } from "lucide-react";
import { AuthBackground } from "./ui/auth-background";

// Full-screen page layout for all auth routes: brand header plus the
// decorative background, centering whatever form is passed as children.
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 py-12">
      <AuthBackground />

      <div className="relative z-10 flex w-full flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <Terminal className="size-4 text-primary" aria-hidden="true" />
          <span className="font-mono text-sm font-medium tracking-tight text-foreground">
            system<span className="text-muted-foreground">_</span>labs
          </span>
        </Link>

        {children}
      </div>
    </div>
  );
}
