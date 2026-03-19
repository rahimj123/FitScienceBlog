type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  tone?: "default" | "light";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "default",
}: SectionHeadingProps) {
  const alignment = align === "left" ? "text-left" : "mx-auto max-w-3xl text-center";
  const titleClass = tone === "light" ? "text-white" : "text-foreground";
  const descriptionClass = tone === "light" ? "text-white/75" : "text-muted-foreground";
  const eyebrowClass = tone === "light" ? "text-[#d7c49e]" : "text-primary/80";

  return (
    <div className={alignment}>
      <p className={`font-display text-sm uppercase tracking-[0.24em] ${eyebrowClass}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl ${titleClass}`}>
        {title}
      </h2>
      <p className={`mt-4 text-lg leading-8 ${descriptionClass}`}>{description}</p>
    </div>
  );
}
