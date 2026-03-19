import { UserRound } from "lucide-react";
import { brand, credentials } from "./content";
import { Reveal } from "./Reveal";

export function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="container-custom grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <Reveal>
          <div className="rounded-[2rem] border border-primary/10 bg-[#f8f5ef] p-6 shadow-[0_20px_70px_-35px_rgba(33,56,45,0.35)] sm:p-8">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-inner">
              <img
                src={brand.founderImage}
                alt="Founder profile placeholder for Dr. Jindani"
                className="h-[22rem] w-full object-cover sm:h-[28rem]"
              />
              <div className="sr-only">Replace this founder profile image with Dr. Jindani portrait</div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {credentials.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/80">About Dr. Jindani</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Warm, credible guidance for people who want to feel stronger and healthier
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-8 text-muted-foreground">
              <p>
                Dr. Jindani brings together a professional background in wellness, fitness, health
                education, and client support to help adults make meaningful changes they can
                actually maintain.
              </p>
              <p>
                The approach is practical, encouraging, and grounded in science. Instead of
                extreme plans or quick fixes, clients receive clear direction, thoughtful
                structure, and steady support tailored to their current ability and goals.
              </p>
              <p>
                Whether you want to lose weight, improve mobility, build strength, or simply feel
                more in control of your health, Wellness with Dr. Jindani is designed to help you
                move forward with confidence.
              </p>
            </div>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-primary/10 bg-[#f8f5ef] px-5 py-3 text-sm text-foreground">
              <UserRound className="h-4 w-4 text-primary" />
              Expert-led coaching with a personal, supportive feel
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
