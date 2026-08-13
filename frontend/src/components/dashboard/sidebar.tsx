// Sidebar navigation for the dashboard shell: groups primary lab, analysis, and
// collaboration links plus footer settings/shortcuts. Hidden on small screens.
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  DollarSign,
  FlaskConical,
  FolderKanban,
  GitCompare,
  Home,
  Keyboard,
  LayoutTemplate,
  Settings,
  Share2,
  Users,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

// A single navigation entry: its label, route, icon, and optional active/badge state.
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
}

// Primary workspace links (Home, Projects, Experiments, Simulations, Scenarios, Templates).
const LAB_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, active: true },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Experiments", href: "/dashboard/experiments", icon: FlaskConical },
  { label: "Simulations", href: "/dashboard/simulations", icon: Waypoints },
  { label: "Scenarios", href: "/dashboard/scenarios", icon: GitCompare },
  { label: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
];

// Observability and analysis links; Incidents carries a "2" badge.
const ANALYSIS_ITEMS: NavItem[] = [
  { label: "Metrics", href: "/dashboard/metrics", icon: Activity },
  { label: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle, badge: "2" },
  { label: "Cost Explorer", href: "/dashboard/cost-explorer", icon: DollarSign },
  { label: "Architecture Diff", href: "/dashboard/architecture-diff", icon: GitCompare },
];

// Team and shared-project collaboration links.
const COLLAB_ITEMS: NavItem[] = [
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Shared Projects", href: "/dashboard/shared", icon: Share2 },
];

// Renders a labelled group of nav links, highlighting the active item and any badge.
function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div>
      <p className="px-2.5 pb-2 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <nav className="flex flex-col gap-0.5" aria-label={label}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`group flex items-center justify-between rounded-sm px-2.5 py-1.5 text-sm transition-colors ${
                item.active
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  className={`size-4 ${item.active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                  aria-hidden="true"
                />
                {item.label}
              </span>
              {item.badge ? (
                <span className="rounded-full bg-danger/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-danger">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// The full dashboard sidebar: sectioned nav plus footer settings, docs, and shortcuts.
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-border bg-background md:flex">
      <div className="flex flex-col gap-6 overflow-y-auto px-3 py-5">
        <NavSection label="Lab" items={LAB_ITEMS} />
        <NavSection label="Analysis" items={ANALYSIS_ITEMS} />
        <NavSection label="Collaboration" items={COLLAB_ITEMS} />
      </div>

      <div className="flex flex-col gap-0.5 border-t border-border px-3 py-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          <Settings className="size-4" aria-hidden="true" />
          Settings
        </Link>
        <Link
          href="/dashboard/docs"
          className="flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          Documentation
        </Link>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          <Keyboard className="size-4" aria-hidden="true" />
          Keyboard shortcuts
        </button>
      </div>
    </aside>
  );
}
