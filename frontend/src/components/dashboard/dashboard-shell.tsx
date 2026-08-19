"use client";

// Decides whether the global dashboard chrome (TopNav + Sidebar) is rendered.
// The architecture editor owns the full viewport, so its route renders only the
// page children (no top nav, no side nav).
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";

// Renders the dashboard shell for non-editor routes, and bare children for the
// full-bleed editor route.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isEditor =
    segments[0] === "projects" &&
    segments[2] === "architectures" &&
    segments.length >= 4;

  if (isEditor) return <>{children}</>;

  return (
    <>
      <TopNav />
      <div
        className="flex flex-1 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 20%, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent 70%)",
        }}
      >
        <Sidebar />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
