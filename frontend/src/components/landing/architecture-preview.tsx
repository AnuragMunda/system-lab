import {
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  Network,
  Terminal,
} from "lucide-react";

interface ExampleArchitecture {
  name: string;
  summary: string;
  nodes: string[];
  stats: { label: string; value: string }[];
}
const SCREENS = [
  {
    title: "Architecture Editor",
    desc: "A visual canvas with the density and keyboard ergonomics of a real IDE.",
    icon: Network,
    accent: "#3dd68c",
    mock: "editor",
  },
  {
    title: "Live Observability",
    desc: "Grafana-grade dashboards wired directly to your running simulation.",
    icon: Cpu,
    accent: "#22d3ee",
    mock: "observability",
  },
  {
    title: "Chaos Console",
    desc: "Inject failures with the precision of a CLI and the visibility of a GUI.",
    icon: AlertTriangle,
    accent: "#f59e0b",
    mock: "chaos",
  },
];

function MockEditor() {
  return (
    <div className="flex h-full">
      {/* left panel */}
      <div className="w-36 border-r border-ink-700 bg-ink-900 p-2 space-y-1">
        {[
          "Load Balancer",
          "API Gateway",
          "Service",
          "Database",
          "Cache",
          "Queue",
          "Worker",
          "Object Storage",
          "External API",
        ].map((n, i) => (
          <div
            key={n}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono ${
              i === 2
                ? "bg-accent/10 border border-accent/30 text-accent"
                : "text-ink-300 hover:bg-ink-800 border border-transparent"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm border border-ink-500" />
            {n}
          </div>
        ))}
      </div>
      {/* canvas */}
      <div className="flex-1 relative grid-bg-sm">
        <svg className="absolute inset-0 w-full h-full">
          <line
            x1="60"
            y1="50"
            x2="140"
            y2="50"
            stroke="#2a2a32"
            strokeWidth="1"
          />
          <line
            x1="140"
            y1="50"
            x2="220"
            y2="30"
            stroke="#2a2a32"
            strokeWidth="1"
          />
          <line
            x1="140"
            y1="50"
            x2="220"
            y2="70"
            stroke="#2a2a32"
            strokeWidth="1"
          />
          <line
            x1="220"
            y1="30"
            x2="300"
            y2="30"
            stroke="#2a2a32"
            strokeWidth="1"
          />
          <line
            x1="220"
            y1="70"
            x2="300"
            y2="70"
            stroke="#2a2a32"
            strokeWidth="1"
          />
        </svg>
        {[
          { x: 20, y: 35, label: "LB", c: "#3dd68c" },
          { x: 100, y: 35, label: "GW", c: "#3dd68c" },
          { x: 180, y: 15, label: "svc", c: "#3dd68c" },
          { x: 180, y: 55, label: "svc", c: "#f59e0b" },
          { x: 260, y: 15, label: "db", c: "#3dd68c" },
          { x: 260, y: 55, label: "cache", c: "#3dd68c" },
        ].map((n, i) => (
          <div
            key={i}
            className="absolute w-12 h-8 bg-ink-850 border rounded text-[8px] font-mono flex items-center justify-center"
            style={{ left: n.x, top: n.y, borderColor: n.c }}
          >
            <span
              className="w-1 h-1 rounded-full mr-1"
              style={{ background: n.c }}
            />
            {n.label}
          </div>
        ))}
      </div>
      {/* right panel */}
      <div className="w-32 border-l border-ink-700 bg-ink-900 p-2">
        <div className="text-[8px] font-mono text-ink-400 mb-1.5 uppercase">
          Properties
        </div>
        {[
          ["type", "c5.2xlarge"],
          ["replicas", "4"],
          ["cpu", "72%"],
          ["mem", "61%"],
          ["pool", "48/50"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between text-[9px] font-mono py-0.5"
          >
            <span className="text-ink-400">{k}</span>
            <span className="text-ink-200">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockObservability() {
  const bars = [
    40, 65, 52, 78, 45, 82, 60, 71, 55, 88, 63, 74, 50, 67, 80, 58, 72, 45, 66,
    79,
  ];
  return (
    <div className="p-3 space-y-2 h-full">
      <div className="grid grid-cols-4 gap-2">
        {[
          { l: "rps", v: "12.4k", c: "#3dd68c" },
          { l: "p99", v: "48ms", c: "#f59e0b" },
          { l: "err", v: "0.3%", c: "#ef4444" },
          { l: "sat", v: "67%", c: "#22d3ee" },
        ].map((m) => (
          <div
            key={m.l}
            className="bg-ink-850 border border-ink-700 rounded px-2 py-1.5"
          >
            <div className="text-[8px] font-mono text-ink-400">{m.l}</div>
            <div
              className="text-sm font-mono font-semibold"
              style={{ color: m.c }}
            >
              {m.v}
            </div>
          </div>
        ))}
      </div>
      {/* chart */}
      <div className="bg-ink-850 border border-ink-700 rounded p-2 h-24">
        <div className="text-[8px] font-mono text-ink-400 mb-1">
          throughput / 60s
        </div>
        <div className="flex items-end gap-px h-14">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${h}%`,
                background: `linear-gradient(to top, #3dd68c55, #3dd68c)`,
              }}
            />
          ))}
        </div>
      </div>
      {/* sparklines */}
      <div className="grid grid-cols-2 gap-2">
        {["cpu.utilization", "mem.utilization"].map((l) => (
          <div key={l} className="bg-ink-850 border border-ink-700 rounded p-2">
            <div className="text-[8px] font-mono text-ink-400 mb-1">{l}</div>
            <svg className="w-full h-8" viewBox="0 0 100 32">
              <polyline
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1"
                points="0,20 10,15 20,18 30,10 40,14 50,8 60,12 70,6 80,10 90,4 100,8"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockChaos() {
  return (
    <div className="p-3 h-full font-mono text-[10px]">
      <div className="flex items-center gap-1.5 mb-2">
        <Terminal className="w-3 h-3 text-signal-amber" />
        <span className="text-ink-300">chaos@console:~$</span>
      </div>
      <div className="space-y-0.5 text-ink-400">
        <div className="text-accent">
          $ inject --node orders-svc --type latency --value 500ms
        </div>
        <div className="text-ink-500">
          {" "}
          → injecting 500ms latency into orders-svc
        </div>
        <div className="text-ink-500"> → monitoring cascade effects...</div>
        <div className="text-signal-amber">
          {" "}
          ⚠ p99 rising on payments-svc (142ms → 380ms)
        </div>
        <div className="text-signal-red">
          {" "}
          ✗ queue backlog growing: 1.2k → 4.8k msgs
        </div>
        <div className="text-signal-red">
          {" "}
          ✗ worker pool saturated: 6/6 replicas at 94% cpu
        </div>
        <div className="text-signal-amber">
          {" "}
          ⚠ autoscaler triggered: scaling workers 6 → 9
        </div>
        <div className="text-accent"> ✓ recovery detected after 47s</div>
        <div className="text-ink-500">
          {" "}
          → report saved: /reports/chaos-2026-08-12.json
        </div>
        <div className="text-ink-300 mt-1">
          $ <span className="animate-blink">█</span>
        </div>
      </div>
    </div>
  );
}

export function ArchitecturePreview() {
  return (
    <section className="relative py-24 border-t border-ink-700">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[11px] font-mono text-ink-400 mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Interace
            </span>
          </div>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Built like the tools you already trust.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {SCREENS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="bg-ink-850 border border-ink-700 rounded-lg overflow-hidden group hover:border-ink-500 transition-colors"
              >
                {/* window chrome */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-ink-700 bg-ink-900">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-600" />
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-600" />
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-600" />
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 text-[10px] font-mono text-ink-400">
                    <Icon className="w-3 h-3" style={{ color: s.accent }} />
                    {s.title}
                  </div>
                  <span className="ml-auto text-[9px] font-mono text-ink-500">
                    ⌘1
                  </span>
                </div>
                {/* mock content */}
                <div className="h-56 bg-ink-900">
                  {s.mock === "editor" && <MockEditor />}
                  {s.mock === "observability" && <MockObservability />}
                  {s.mock === "chaos" && <MockChaos />}
                </div>
                {/* footer */}
                <div className="px-3 py-2.5 border-t border-ink-700">
                  <p className="text-[12px] text-ink-300">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
