import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function ServicesSection() {
  return (
    <section id="services" className="bg-[#f7f5f0] py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title="Thoughtful coaching for every stage of your wellness journey"
            description="Each service is designed to make health improvement feel structured, supportive, and realistic, whether you are just starting out or ready to build on your progress."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <Reveal key={service.title} delay={index * 0.06}>
                <article className="group h-full rounded-[1.75rem] border border-primary/10 bg-white p-7 shadow-[0_18px_60px_-32px_rgba(33,56,45,0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-32px_rgba(33,56,45,0.35)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-foreground">{service.title}</h3>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">{service.description}</p>
                  <Button
                    asChild
                    variant="ghost"
                    className="mt-6 h-auto rounded-full px-0 text-sm font-semibold text-primary hover:bg-transparent hover:text-primary/80"
                  >
                    <a href={service.href}>
                      {service.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
