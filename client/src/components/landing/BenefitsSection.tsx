import { benefits } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Why Choose Us"
            title="A modern wellness experience built on trust, clarity, and consistency"
            description="Wellness with Dr. Jindani is designed to remove confusion and replace it with personalized support, practical strategy, and sustainable momentum."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <Reveal key={benefit.title} delay={index * 0.05}>
                <div className="rounded-[1.75rem] border border-primary/10 bg-white p-7 shadow-[0_18px_60px_-36px_rgba(33,56,45,0.28)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ec] text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{benefit.title}</h3>
                  </div>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">{benefit.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
