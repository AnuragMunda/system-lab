// Dashboard layout (`/dashboard/*`) — wraps all dashboard routes with the top nav and sidebar shell.
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { AuthGuard } from "@/components/dashboard/auth-guard";
import { Metadata } from "next";

// Page-level metadata for the dashboard screen.
export const metadata: Metadata = {
  title: "Dashboard | System Labs",
  description: "Your dashboard of System Labs",
};

// Renders the dashboard shell: a full-height column with TopNav on top and Sidebar + scrollable main content below.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-grid">
      <AuthGuard>
      <TopNav />
      <div
        className="flex flex-1"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 20%, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent 70%)",
        }}
      >
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
      </AuthGuard>
    </div>
  );
}
