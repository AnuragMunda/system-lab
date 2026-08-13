// Sticky top bar for the dashboard: brand, workspace switcher, global search,
// notifications, and the account avatar menu.
import Link from "next/link";
import { Bell, ChevronDown, Command, Search, Terminal } from "lucide-react";

// Top navigation header rendered across all dashboard pages.
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-md">
      <Link href="/dashboard" className="flex items-center gap-2 pr-2">
        <Terminal className="size-4 text-primary" aria-hidden="true" />
        <span className="hidden font-mono text-sm font-medium tracking-tight text-foreground sm:inline">
          system<span className="text-muted-foreground">_</span>labs
        </span>
      </Link>

      <div className="hidden h-5 w-px bg-border md:block" aria-hidden="true" />

      <button
        type="button"
        className="hidden items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-card md:flex"
      >
        <span className="text-muted-foreground">Personal Workspace</span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </button>

      <div className="ml-0 flex-1 md:ml-2">
        <button
          type="button"
          aria-label="Search projects, experiments, docs"
          className="flex w-full max-w-md items-center justify-between gap-2 rounded-sm border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border-strong"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden truncate sm:inline">
              Search projects, experiments, docs...
            </span>
            <span className="sm:hidden">Search</span>
          </span>
          <span className="hidden shrink-0 items-center gap-0.5 rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:flex">
            <Command className="size-3" aria-hidden="true" />K
          </span>
        </button>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
      >
        <Bell className="size-4" aria-hidden="true" />
        <span
          className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent"
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        aria-label="Account menu"
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-muted text-xs font-medium text-foreground transition-colors hover:border-primary"
      >
        AM
      </button>
    </header>
  );
}
