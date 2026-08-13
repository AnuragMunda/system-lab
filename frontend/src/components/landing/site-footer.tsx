// Site footer for the landing page — brand blurb and link columns.
import Link from "next/link";
import { Terminal } from "lucide-react";

const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Product",
    links: ["Editor", "Simulation Engine", "Pricing", "Changelog"],
  },
  { title: "Resources", links: ["Documentation", "GitHub", "Community"] },
  { title: "Company", links: ["Privacy", "Terms"] },
];

// SiteFooter — renders the brand block, link columns from FOOTER_COLUMNS,
// and the bottom status/copyright bar.
export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-[1600px] px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Terminal className="size-4 text-primary" aria-hidden="true" />
              <span className="font-mono text-sm font-medium text-foreground">
                system<span className="text-muted-foreground">_</span>labs
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              An interactive distributed-systems architecture and simulation
              platform.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {column.title}
              </h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} System Labs. All systems operational.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" />
            status: online
          </span>
        </div>
      </div>
    </footer>
  );
}
