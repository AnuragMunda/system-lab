// Landing closing call-to-action — a final prompt to sign up, with headline and button.
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// FinalCta — renders the "Enter the Lab" signup CTA section.
export function FinalCta() {
  return (
    <section id="start" className="border-b border-border bg-grid">
      <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-6 px-6 py-24 sm:items-center sm:text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">
          Ready when you are
        </span>
        <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Enter the Lab
        </h2>
        <p className="max-w-md text-pretty text-muted-foreground">
          Spin up a canvas, wire your first architecture, and run a live
          simulation in minutes.
        </p>
        <Link
          href="/signup"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Enter the Lab
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
