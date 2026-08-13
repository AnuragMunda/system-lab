import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "Design",
    description: "Drag together gateways, services, caches, queues, and databases on a live canvas.",
  },
  {
    step: "Simulate",
    description: "Replay realistic traffic patterns against the architecture you just drew.",
  },
  {
    step: "Break",
    description: "Inject latency, partitions, and outages to see where it actually fails.",
  },
  {
    step: "Observe",
    description: "Trace requests end-to-end with per-node latency, throughput, and error telemetry.",
  },
  {
    step: "Optimize",
    description: "Fork the design, rerun the same scenario, and diff the results side by side.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Workflow
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
        </div>

        <ol className="flex flex-col gap-0 lg:flex-row lg:items-stretch lg:gap-0">
          {STEPS.map((item, index) => (
            <li key={item.step} className="flex flex-1 items-stretch">
              <div className="flex flex-1 flex-col border border-border bg-card p-5">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-3 font-mono text-sm font-medium uppercase tracking-wide text-foreground">
                  {item.step}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className="hidden w-10 shrink-0 items-center justify-center lg:flex">
                  <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
