export function AuthDivider({ label = "OR" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3" role="separator">
      <div className="h-px flex-1 bg-border" />
      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
