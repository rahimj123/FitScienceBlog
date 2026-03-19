import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { badge, brand, cta, quickStats } from "./content";
import { Reveal } from "./Reveal";

export function HeroSection() {
  const BadgeIcon = badge.icon;

  return (
    <section className="relative overflow-hidden pt-10 sm:pt-14">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(34,76,55,0.18),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(185,150,92,0.16),_transparent_35%),linear-gradient(180deg,_#f8f4ee_0%,_#f7f8f4_55%,_#ffffff_100%)]" />
      <div className="container-custom grid items-center gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <Reveal>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-sm text-primary shadow-sm">
              <BadgeIcon className="h-4 w-4" />
              {badge.text}
            </div>
            <h1 className="mt-8 max-w-4xl text-balance font-semibold leading-tight text-foreground">
              Whole-person wellness guided by fitness coaching and physician-informed care
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Wellness with Dr. Jindani brings together Rahim Jindani&apos;s practical movement and
              wellness coaching with Dr. Shireen Jindani&apos;s physician-guided internal medicine
              wellness review for clients who need a broader, more medically informed pathway.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20">
                <a href="#contact">
                  {cta.primary}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary/20 bg-white/80 px-8 text-base text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                <a href="/signup?service=Fitness%20Pathway">{cta.secondary}</a>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {quickStats.map((item) => (
                <div
                  key={item.value}
                  className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_-28px_rgba(39,66,53,0.28)] backdrop-blur"
                >
                  <div className="font-display text-xl text-primary">{item.value}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative">
            <div className="absolute -left-6 top-10 hidden h-28 w-28 rounded-full bg-accent/80 blur-2xl sm:block" />
            <div className="absolute -bottom-10 right-0 hidden h-32 w-32 rounded-full bg-primary/15 blur-2xl sm:block" />
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_30px_90px_-35px_rgba(35,63,49,0.4)]">
              <div className="relative overflow-hidden rounded-[1.6rem]">
                <img
                  src={brand.heroImage}
                  alt="Collaborative wellness experience with fitness coaching and physician-guided support"
                  className="h-[26rem] w-full object-cover sm:h-[34rem]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#183222]/45 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/25 bg-white/18 p-5 text-white backdrop-blur-md">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    Two distinct but connected pathways, shaped around coaching needs and physician review when appropriate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
