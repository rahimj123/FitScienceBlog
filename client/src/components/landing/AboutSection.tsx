import { Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teamMembers } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function AboutSection() {
  return (
    <section id="experts" className="py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Meet The Experts"
            title="A premium collaborative model shaped by two distinct areas of expertise"
            description="Clients begin with clear guidance on who they work with, what each professional does, and when physician involvement becomes part of the pathway."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {teamMembers.map((member, index) => (
            <Reveal key={member.name} delay={index * 0.08}>
              <article className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_22px_70px_-38px_rgba(33,56,45,0.35)]">
                <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="bg-[#f6f2ea] p-5">
                    <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-inner">
                      <img
                        src={member.image}
                        alt={`${member.name} profile placeholder`}
                        className="h-[22rem] w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-7 sm:p-8">
                    <p className="text-sm uppercase tracking-[0.2em] text-primary/70">{member.role}</p>
                    <h3 className="mt-3 text-3xl font-semibold text-foreground">{member.name}</h3>
                    <p className="mt-5 text-base leading-7 text-muted-foreground">{member.bio}</p>
                    <div className="mt-6 rounded-[1.25rem] bg-[#f8f5ef] p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">Focus Area</p>
                      <p className="mt-3 text-base leading-7 text-muted-foreground">{member.focus}</p>
                    </div>
                    <div className="mt-6 space-y-3">
                      {member.credentials.map((item) => (
                        <div key={item} className="rounded-2xl border border-primary/10 px-4 py-3 text-sm text-foreground/85">
                          {item}
                        </div>
                      ))}
                    </div>
                    <Button asChild className="mt-6 rounded-full">
                      <a href={member.linkedin} target="_blank" rel="noreferrer">
                        <Linkedin className="h-4 w-4" />
                        View LinkedIn
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
