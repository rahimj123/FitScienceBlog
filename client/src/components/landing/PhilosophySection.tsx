import { Reveal } from "./Reveal";

export function PhilosophySection() {
  return (
    <section id="philosophy" className="py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <div className="overflow-hidden rounded-[2.2rem] border border-primary/10 bg-[linear-gradient(135deg,_#fbf8f2,_#eef3ec)] p-8 shadow-[0_30px_90px_-42px_rgba(33,56,45,0.38)] sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/80">
                  Wellness Philosophy
                </p>
                <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Balanced health is built through movement, mindset, and consistency
                </h2>
              </div>
              <div className="space-y-5 text-lg leading-8 text-muted-foreground">
                <p>
                  True transformation does not come from extremes. It comes from building a strong
                  foundation of daily habits that support your body, energy, confidence, and
                  long-term wellbeing.
                </p>
                <p>
                  Wellness with Dr. Jindani emphasizes balanced movement, supportive routines,
                  realistic progress, and a mindset that values consistency over perfection. The
                  result is a healthier lifestyle that feels sustainable, empowering, and aligned
                  with real life.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
