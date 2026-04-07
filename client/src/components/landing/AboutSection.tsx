import { Stethoscope, Dumbbell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function AboutSection() {
  return (
    <section id="experts" className="py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Join The Network"
            title="An expanding wellness and health network for qualified professionals"
            description="We are opening this platform to verified physicians and personal trainers who want to support clients through practical, science-informed care."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <Reveal delay={0.04}>
            <article className="rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_22px_70px_-38px_rgba(33,56,45,0.35)]">
              <Stethoscope className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-semibold text-foreground">For Physicians</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Join as a licensed physician to offer consultation, health review, and medically informed wellness guidance.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.12}>
            <article className="rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_22px_70px_-38px_rgba(33,56,45,0.35)]">
              <Dumbbell className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-semibold text-foreground">For Personal Trainers</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Join as a certified trainer to deliver practical coaching in movement, strength, mobility, and habit support.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.2}>
            <article className="rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_22px_70px_-38px_rgba(33,56,45,0.35)]">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-semibold text-foreground">Growing Professional Community</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                This section is intentionally profile-free while the platform expands to welcome qualified wellness and health professionals.
              </p>
            </article>
          </Reveal>
        </div>
        <Reveal delay={0.26}>
          <div className="mt-8 rounded-[2rem] border border-primary/10 bg-[#f8f5ef] p-7">
            <p className="text-base leading-7 text-muted-foreground">
              Are you a physician or personal trainer interested in joining Wellness&Health4all?
              Reach out and we will share onboarding details.
            </p>
            <Button asChild className="mt-5 rounded-full">
              <a href="#contact">Apply to Join</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
