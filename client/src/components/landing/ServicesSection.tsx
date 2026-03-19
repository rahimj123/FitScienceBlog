import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { serviceGroups } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function ServicesSection() {
  return (
    <section id="services" className="bg-[#f7f5f0] py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title="Two service groups, one coordinated wellness experience"
            description="The site distinguishes clearly between Rahim’s coaching-led support and the more advanced physician-involved pathway, while showing how both can work together when appropriate."
          />
        </Reveal>
        <div className="mt-14 space-y-10">
          {serviceGroups.map((group, groupIndex) => (
            <Reveal key={group.title} delay={groupIndex * 0.08}>
              <section className="rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_22px_70px_-40px_rgba(33,56,45,0.32)] sm:p-8">
                <div className="max-w-3xl">
                  <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/80">
                    {group.title}
                  </p>
                  <p className="mt-4 text-lg leading-8 text-muted-foreground">{group.description}</p>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((service, index) => {
                    const Icon = service.icon;
                    return (
                      <div
                        key={service.title}
                        className="group rounded-[1.75rem] border border-primary/10 bg-[#fcfbf8] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-32px_rgba(33,56,45,0.22)]"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-2xl font-semibold text-foreground">{service.title}</h3>
                        <p className="mt-3 text-base leading-7 text-muted-foreground">{service.description}</p>
                        <Button
                          asChild
                          variant="ghost"
                          className="mt-5 h-auto rounded-full px-0 text-sm font-semibold text-primary hover:bg-transparent hover:text-primary/80"
                        >
                          <a href={service.href}>
                            {service.ctaLabel}
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
