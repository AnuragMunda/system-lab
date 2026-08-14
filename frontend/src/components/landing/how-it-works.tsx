// Landing "workflow" section — the design → simulate → break → observe →
// optimize pipeline, shown as both a flow diagram and a steps list.
import { ArrowRight } from "lucide-react";
import { BRAND_ACCENTS } from "@/lib/constants";

const STEPS = [
  {
    n: "01",
    step: "DESIGN",
    description:
      "Drag nodes onto the canvas. Connect them. Configure each one — instance type, replicas, retry policies, connection pools, caching strategies.",
    bullets: ["10+ node types", "Custom connections", "Config per node"],
    accent: BRAND_ACCENTS.primary,
  },
  {
    n: "02",
    step: "SIMULATE",
    description:
      "Generate traffic that mirrors reality. Steady-state, diurnal, flash-crowd, or your own custom distribution.",
    bullets: ["Realistic load", "Geo distribution", "Custom patterns"],
    accent: BRAND_ACCENTS.cyan,
  },
  {
    n: "03",
    step: "BREAK",
    description:
      "Inject chaos. Kill nodes, partition networks, saturate disks, add latency, drop packets. Watch failure cascade.",
    bullets: ["Node failure", "Network partition", "Latency injection"],
    accent: BRAND_ACCENTS.warning,
  },
  {
    n: "04",
    step: "OBSERVE",
    description:
      "Per-node metrics, distributed traces, service maps, flame graphs. See exactly where requests queue, retry, and fail.",
    bullets: ["Live metrics", "Distributed traces", "Bottleneck analysis"],
    accent: BRAND_ACCENTS.purple,
  },
  {
    n: "05",
    step: "OPTIMIZE",
    description:
      "Compare architectures side by side. Run the same workload against two topologies. Let the optimizer suggest improvements.",
    bullets: ["A/B comparison", "Cost analysis", "AI suggestions"],
    accent: BRAND_ACCENTS.primary,
  },
];

// HowItWorks — renders the numbered pipeline header, the connecting flow
// diagram, and the per-step description list.
export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto max-w-[1600px] px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Workflow
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            From sketch to simulation to certainty.
          </p>
        </div>

        {/* flow diagram */}
        <div className="flex items-center justify-center gap-2 mb-16 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-mono font-semibold"
                  style={{
                    borderColor: s.accent,
                    color: s.accent,
                    boxShadow: `0 0 12px -4px ${s.accent}`,
                  }}
                >
                  {s.n}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {s.step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight className="w-5 h-4 text-[#5b5b6d]" />
              )}
            </div>
          ))}
        </div>

        <ol className="flex flex-col gap-0 lg:flex-row lg:items-stretch lg:gap-0">
          {STEPS.map((item, index) => (
            <li key={item.step} className="flex flex-1 items-stretch">
              <div className="flex flex-1 flex-col border border-border bg-card px-5 py-7">
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: item.accent,
                      boxShadow: `0 0 6px ${item.accent}`,
                    }}
                  />
                  <span className="font-mono text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-sm font-medium uppercase tracking-wide text-foreground">
                    {item.step}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
