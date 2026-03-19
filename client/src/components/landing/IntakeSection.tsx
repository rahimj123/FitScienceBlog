import { intakeItems } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function IntakeSection() {
  return (
    <section id="intake" className="py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Intake and Screening"
            title="Every new client starts with a clear, professional onboarding process"
            description="The intake flow is designed to support secure handling, careful review, and guided next steps before coaching begins or physician consultation is considered."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {intakeItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <article className="rounded-[1.75rem] border border-primary/10 bg-white p-7 shadow-[0_18px_60px_-36px_rgba(33,56,45,0.28)]">
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-muted-foreground">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
