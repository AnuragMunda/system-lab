interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We caught a cache stampede in the simulator two weeks before it would have happened in prod. That alone paid for the year.",
    name: "Priya Nathan",
    role: "Staff Engineer, Payments",
    initials: "PN",
  },
  {
    quote:
      "The failure injection tools are the closest thing to a real incident without paging anyone at 3am.",
    name: "Marcus Weil",
    role: "SRE Lead",
    initials: "MW",
  },
  {
    quote:
      "Being able to diff two architectures on the same traffic replay changed how we run design reviews.",
    name: "Sana Farooq",
    role: "Principal Architect",
    initials: "SF",
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1600px] px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            In production
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trusted by engineers who get paged
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col justify-between rounded-md border border-border bg-card p-6"
            >
              <blockquote className="text-sm leading-relaxed text-foreground">
                {"\u201C"}
                {testimonial.quote}
                {"\u201D"}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong font-mono text-xs text-primary">
                  {testimonial.initials}
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
