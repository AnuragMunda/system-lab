// Sticky top bar for the dashboard: brand, workspace switcher, global search,
// notifications, and the account avatar menu (with logout).
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Search,
  Terminal,
} from "lucide-react";
import { useAppDispatch, useAuth } from "@/store/hooks";
import { logoutThunk } from "@/store/authSlice";

// Top navigation header rendered across all dashboard pages.
export function TopNav() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Derive up-to-two-letter initials from the user's name; fall back before
  // the session is resolved.
  const initials = user
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AM";

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await dispatch(logoutThunk()).unwrap();
    } finally {
      router.push("/login");
    }
  }

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

      {/* Account menu: avatar toggles a small dropdown with the user's identity
          and a logout action. A transparent backdrop closes it on outside click. */}
      <div className="relative">
        <button
          type="button"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-muted text-xs font-medium text-foreground transition-colors hover:border-primary"
        >
          {initials}
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div
              role="menu"
              className="absolute right-0 top-10 z-50 w-48 overflow-hidden rounded-md border border-border bg-card shadow-lg"
            >
              {user && (
                <div className="border-b border-border px-3 py-2">
                  <div className="truncate text-xs font-medium text-foreground">
                    {user.name}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
