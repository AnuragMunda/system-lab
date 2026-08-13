import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { ArchitectureCanvas } from "./architecture-canvas";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-grid">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pt-24">
        <div className="animate-rise mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success animate-pulse-dot" />
          v0.9 — simulation engine now supports network partitions
        </div>

        <h1
          className="animate-rise max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          style={{ animationDelay: "0.05s" }}
        >
          Build systems. <span className="text-primary text-glow">Break systems.</span>{" "}
          Understand systems.
        </h1>

        <p
          className="animate-rise mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
          style={{ animationDelay: "0.1s" }}
        >
          Design distributed architectures, simulate real-world traffic and
          failures, and understand how your systems behave under pressure.
        </p>

        <div
          className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "0.15s" }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Start Building
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="#demo"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-border-strong"
          >
            <PlayCircle className="size-4 text-muted-foreground" aria-hidden="true" />
            Explore a Demo
          </Link>
        </div>

        <div
          className="animate-rise mt-14"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>architecture.live · production-mirror</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" />
              streaming telemetry
            </span>
          </div>
          <ArchitectureCanvas />
        </div>
      </div>
    </section>
  );
}
