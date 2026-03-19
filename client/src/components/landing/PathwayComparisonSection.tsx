import { Button } from "@/components/ui/button";
import { pathwayOptions } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function PathwayComparisonSection() {
  return (
    <section id="pathways" className="bg-[#f7f5f0] py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Pathway Comparison"
            title="Choose the level of support that fits your goals"
            description="Some clients need focused exercise and lifestyle coaching. Others want a fuller wellness pathway that may include physician consultation. The page explains both without blurring the difference."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {pathwayOptions.map((pathway, index) => (
            <Reveal key={pathway.title} delay={index * 0.07}>
              <article className="h-full rounded-[2rem] border border-primary/10 bg-white p-8 shadow-[0_22px_70px_-40px_rgba(33,56,45,0.32)]">
                <h3 className="font-display text-3xl font-semibold text-foreground">{pathway.title}</h3>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">{pathway.subtitle}</p>
                <div className="mt-8 space-y-4">
                  {pathway.points.map((point) => (
                    <div key={point} className="rounded-2xl bg-[#f8f5ef] px-4 py-4 text-sm leading-6 text-foreground/85">
                      {point}
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-8 rounded-full">
                  <a href={pathway.href}>Choose this pathway</a>
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
