import {
  Bot,
  Gauge,
  GitCompare,
  PenTool,
  Users,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: PenTool,
    title: "Design",
    description: "Visually model your architecture.",
  },
  {
    icon: Waves,
    title: "Simulate",
    description: "Generate realistic traffic and workloads.",
  },
  {
    icon: Zap,
    title: "Break",
    description: "Inject failures and chaos.",
  },
  {
    icon: Gauge,
    title: "Observe",
    description: "Understand latency, throughput and bottlenecks.",
  },
  {
    icon: GitCompare,
    title: "Optimize",
    description: "Compare architectures and find better designs.",
  },
  {
    icon: Users,
    title: "Collaborate",
    description: "Work with your team in real time.",
  },
  {
    icon: Bot,
    title: "AI Architect",
    description: "Ask AI to analyze and improve your system.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-[1600px] px-6 py-20">
        <div className="mb-12 max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Capabilities
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you need to reason about a system
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            From first sketch to chaos engineering to optimization — one canvas,
            one source of truth.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            const isLast = index === FEATURES.length - 1;
            return (
              <div
                key={feature.title}
                className={`group bg-background p-6 transition-colors hover:bg-card ${
                  isLast ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <Icon
                  className="size-5 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-sm font-medium text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-accent/80">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
