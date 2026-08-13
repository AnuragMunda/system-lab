// Decorative animated background for auth screens: a grid + flowing network motif.
// Purely presentational and non-interactive (aria-hidden, pointer-events-none).
export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-grid opacity-60" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="var(--color-border-strong)" strokeWidth="1">
          <line x1="140" y1="120" x2="380" y2="220" className="animate-flow" />
          <line x1="380" y1="220" x2="620" y2="140" className="animate-flow" />
          <line x1="620" y1="140" x2="900" y2="260" className="animate-flow" />
          <line x1="200" y1="560" x2="460" y2="480" className="animate-flow" />
          <line x1="460" y1="480" x2="760" y2="600" className="animate-flow" />
          <line x1="760" y1="600" x2="1020" y2="520" className="animate-flow" />
          <line x1="620" y1="140" x2="460" y2="480" className="animate-flow" />
        </g>

        <g fill="var(--color-primary)">
          <circle cx="140" cy="120" r="3" className="animate-pulse-dot" />
          <circle cx="380" cy="220" r="3" className="animate-pulse-dot" style={{ animationDelay: "0.3s" }} />
          <circle cx="620" cy="140" r="3" className="animate-pulse-dot" style={{ animationDelay: "0.6s" }} />
          <circle cx="900" cy="260" r="3" className="animate-pulse-dot" style={{ animationDelay: "0.9s" }} />
          <circle cx="200" cy="560" r="3" className="animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
          <circle cx="460" cy="480" r="3" className="animate-pulse-dot" style={{ animationDelay: "0.5s" }} />
          <circle cx="760" cy="600" r="3" className="animate-pulse-dot" style={{ animationDelay: "0.8s" }} />
          <circle cx="1020" cy="520" r="3" className="animate-pulse-dot" style={{ animationDelay: "1.1s" }} />
        </g>
      </svg>
    </div>
  );
}
