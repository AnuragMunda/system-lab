import Link from "next/link";
import { Command, Terminal } from "lucide-react";

const NAV_LINKS = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Architectures", href: "#architectures" },
  { label: "Docs", href: "#docs" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-20 max-w-[1600px] mx-auto items-center justify-between px-10">
        <Link href="/" className="flex items-center gap-2">
          <Terminal className="size-4 text-primary" aria-hidden="true" />
          <span className="font-mono text-sm font-medium tracking-tight text-foreground">
            system<span className="text-muted-foreground">_</span>labs
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-8">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:flex"
            aria-label="Open command palette"
          >
            <Command className="size-3.5" aria-hidden="true" />
            <span className="font-mono">K</span>
          </button>
          <Link
            href="/login"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-sm bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
