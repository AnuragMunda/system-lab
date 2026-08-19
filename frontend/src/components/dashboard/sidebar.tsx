// Sidebar navigation for the dashboard shell: groups primary lab, analysis, and
// collaboration links plus footer settings/shortcuts. Hidden on small screens.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
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

// A single navigation entry: its label, route, icon, and optional badge state.
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

// True when `pathname` is the item's route or a nested sub-route (e.g. a project
// workspace under /projects keeps "Projects" highlighted).
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

// Primary workspace links (Home, Projects, Experiments, Simulations, Scenarios, Templates).
const LAB_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Projects", href: "/projects", icon: FolderKanban },
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
// When `collapsed`, only icons are shown (labels + group headings hidden). An optional
// `action` (e.g. the collapse control) renders on the same line as the heading.
function NavSection({
  label,
  items,
  pathname,
  collapsed,
  action,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
  action?: ReactNode;
}) {
  const showLabel = !collapsed;
  return (
    <div className={collapsed ? "px-1" : ""}>
      {showLabel ? (
        <div className="flex items-center justify-between px-2.5 pb-2">
          <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {label}
          </p>
          {action}
        </div>
      ) : null}
      <nav className="flex flex-col gap-0.5" aria-label={label}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center justify-between rounded-sm py-1.5 text-sm transition-colors ${
                collapsed ? "justify-center px-0" : "px-2.5"
              } ${
                active
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              <span
                className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}
              >
                <Icon
                  className={`size-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                  aria-hidden="true"
                />
                {collapsed ? null : item.label}
              </span>
              {item.badge && !collapsed ? (
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

// The full dashboard sidebar: sectioned nav plus footer settings, docs, and
// shortcuts. Collapsible to an icon-only rail (labels + group headings hidden).
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Restore the last collapsed state without a hydration mismatch (localStorage
  // is only readable on the client). This is a deliberate external-state sync.
  useEffect(() => {
    const saved = window.localStorage.getItem("sidebar:collapsed");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      window.localStorage.setItem("sidebar:collapsed", next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`hidden h-full shrink-0 flex-col justify-between overflow-hidden border-r border-border bg-background md:flex ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Collapsed: toggle sits at the top, above the icon rail. */}
      {collapsed ? (
        <div className="flex h-14 items-center justify-center border-b border-border px-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            aria-pressed={collapsed}
            title="Expand sidebar"
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <ChevronsRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div
        className={`flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-5 ${
          collapsed ? "px-1" : "px-3"
        }`}
      >
        <NavSection
          label="Lab"
          items={LAB_ITEMS}
          pathname={pathname}
          collapsed={collapsed}
          action={
            collapsed ? undefined : (
              <button
                type="button"
                onClick={toggle}
                aria-label="Collapse sidebar"
                aria-pressed={collapsed}
                title="Collapse sidebar"
                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                <ChevronsLeft className="size-4" aria-hidden="true" />
              </button>
            )
          }
        />
        <NavSection
          label="Analysis"
          items={ANALYSIS_ITEMS}
          pathname={pathname}
          collapsed={collapsed}
        />
        <NavSection
          label="Collaboration"
          items={COLLAB_ITEMS}
          pathname={pathname}
          collapsed={collapsed}
        />
      </div>

      <div
        className={`flex flex-col gap-0.5 border-t border-border py-4 ${
          collapsed ? "px-1" : "px-3"
        }`}
      >
        <Link
          href="/dashboard/settings"
          title={collapsed ? "Settings" : undefined}
          aria-current={isActive(pathname, "/dashboard/settings") ? "page" : undefined}
          className={`flex items-center rounded-sm py-1.5 text-sm transition-colors ${
            collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
          } ${
            isActive(pathname, "/dashboard/settings")
              ? "bg-card text-foreground"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
        >
          <Settings className="size-4" aria-hidden="true" />
          {collapsed ? null : "Settings"}
        </Link>
        <Link
          href="/dashboard/docs"
          title={collapsed ? "Documentation" : undefined}
          aria-current={isActive(pathname, "/dashboard/docs") ? "page" : undefined}
          className={`flex items-center rounded-sm py-1.5 text-sm transition-colors ${
            collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
          } ${
            isActive(pathname, "/dashboard/docs")
              ? "bg-card text-foreground"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
        >
          <BookOpen className="size-4" aria-hidden="true" />
          {collapsed ? null : "Documentation"}
        </Link>
        <button
          type="button"
          title={collapsed ? "Keyboard shortcuts" : undefined}
          className={`flex items-center rounded-sm py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground ${
            collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
          }`}
        >
          <Keyboard className="size-4" aria-hidden="true" />
          {collapsed ? null : "Keyboard shortcuts"}
        </button>
      </div>
    </aside>
  );
}
