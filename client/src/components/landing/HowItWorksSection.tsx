import { processSteps } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function HowItWorksSection() {
  return (
    <section id="process" className="py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="How It Works"
            title="A clear process from intake to personalized next steps"
            description="The journey is designed to be structured, transparent, and appropriately paced so clients understand exactly when they are receiving coaching support and when physician consultation becomes part of the process."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.step} delay={index * 0.05}>
                <article className="relative h-full rounded-[1.9rem] border border-primary/10 bg-white p-7 shadow-[0_20px_70px_-42px_rgba(33,56,45,0.3)]">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
                    {step.step}
                  </div>
                  <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef3ec] text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">{step.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
