// Dashboard layout (`/dashboard/*`) — wraps all dashboard routes with the top nav
// and sidebar shell. The architecture editor route opts out of that chrome (see
// `DashboardShell`) so it can own the full viewport.
import { AuthGuard } from "@/components/dashboard/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Metadata } from "next";

// Page-level metadata for the dashboard screen.
export const metadata: Metadata = {
  title: "Dashboard | System Labs",
  description: "Your dashboard of System Labs",
};

// Renders the dashboard shell, conditionally including the top nav + sidebar.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col bg-grid">
      <AuthGuard>
        <DashboardShell>{children}</DashboardShell>
      </AuthGuard>
    </div>
  );
}
