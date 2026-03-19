import { audienceItems } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function BenefitsSection() {
  return (
    <section id="who-this-is-for" className="py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Who This Is For"
            title="Designed for people who want coordinated, credible support"
            description="This model works especially well for adults who want expert movement guidance, sustainable lifestyle support, and in some cases a more medically informed wellness review."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {audienceItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.05}>
                <div className="rounded-[1.75rem] border border-primary/10 bg-white p-7 shadow-[0_18px_60px_-36px_rgba(33,56,45,0.28)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ec] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
