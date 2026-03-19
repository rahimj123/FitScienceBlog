type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const alignment = align === "left" ? "text-left" : "mx-auto max-w-3xl text-center";

  return (
    <div className={alignment}>
      <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/80">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">{description}</p>
    </div>
  );
}
