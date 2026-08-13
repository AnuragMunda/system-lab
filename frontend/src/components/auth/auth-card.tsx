export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-sm rounded-md border border-border bg-card p-7 shadow-[0_0_0_1px_rgba(0,0,0,0.2)] sm:p-8">
      <div className="mb-6">
        <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {children}

      {footer ? (
        <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
