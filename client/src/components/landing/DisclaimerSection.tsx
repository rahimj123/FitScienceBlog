import { disclaimerItems } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function DisclaimerSection() {
  return (
    <section id="trust" className="py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <div className="rounded-[2.2rem] border border-primary/10 bg-[linear-gradient(135deg,_#fbf8f2,_#eef3ec)] p-8 shadow-[0_30px_90px_-42px_rgba(33,56,45,0.38)] sm:p-12">
            <SectionHeading
              eyebrow="Trust and Safety"
              title="Wellness coaching and physician care are related here, but they are not the same thing"
              description="The site intentionally keeps coaching guidance, formal physician consultation, and lab decisions clearly separated so clients understand the scope of each service."
              align="left"
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {disclaimerItems.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.04}>
                  <div className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-6">
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
