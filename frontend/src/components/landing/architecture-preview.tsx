import { ArrowUpRight } from "lucide-react";

interface ExampleArchitecture {
  name: string;
  summary: string;
  nodes: string[];
  stats: { label: string; value: string }[];
}

const EXAMPLES: ExampleArchitecture[] = [
  {
    name: "Checkout under load",
    summary: "Payment flow surviving a 10x traffic spike",
    nodes: ["Gateway", "Cart Service", "Payments", "Ledger DB"],
    stats: [
      { label: "peak rps", value: "18.2k" },
      { label: "p99", value: "142ms" },
      { label: "error rate", value: "0.03%" },
    ],
  },
  {
    name: "Realtime chat fanout",
    summary: "Pub/sub delivery across regional brokers",
    nodes: ["WS Gateway", "Presence", "Broker", "Fanout Workers"],
    stats: [
      { label: "connections", value: "412k" },
      { label: "delivery p50", value: "38ms" },
      { label: "backlog", value: "0" },
    ],
  },
  {
    name: "Partition tolerance drill",
    summary: "Primary region cut off mid-simulation",
    nodes: ["Load Balancer", "Region A", "Region B", "Replica DB"],
    stats: [
      { label: "failover", value: "1.8s" },
      { label: "data loss", value: "0 rows" },
      { label: "recovered", value: "100%" },
    ],
  },
];

export function ArchitecturePreview() {
  return (
    <section id="architectures" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Runs
            </span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Architectures teams have put to the test
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {EXAMPLES.map((example) => (
            <div
              key={example.name}
              className="group flex flex-col rounded-md border border-border bg-card transition-colors hover:border-border-strong"
            >
              <div className="flex items-start justify-between border-b border-border p-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {example.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {example.summary}
                  </p>
                </div>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 p-4">
                {example.nodes.map((node) => (
                  <span
                    key={node}
                    className="rounded-sm border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground"
                  >
                    {node}
                  </span>
                ))}
              </div>

              <div className="mt-auto grid grid-cols-3 gap-px border-t border-border bg-border">
                {example.stats.map((stat) => (
                  <div key={stat.label} className="bg-card px-3 py-3">
                    <div className="font-mono text-sm font-medium text-foreground">
                      {stat.value}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
