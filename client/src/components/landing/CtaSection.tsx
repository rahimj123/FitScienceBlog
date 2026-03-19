import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cta } from "./content";
import { Reveal } from "./Reveal";

export function CtaSection() {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="container-custom">
        <Reveal>
          <div className="rounded-[2.2rem] bg-primary px-8 py-12 text-primary-foreground shadow-[0_30px_90px_-35px_rgba(44,95,68,0.45)] sm:px-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="font-display text-sm uppercase tracking-[0.24em] text-primary-foreground/70">
                  Take The Next Step
                </p>
                <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                  Your first session can be the start of lasting change
                </h2>
                <p className="mt-4 text-lg leading-8 text-primary-foreground/85">
                  If you are ready to improve your health with expert support, practical guidance,
                  and a sustainable plan, this is the right place to begin.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-8 text-base text-primary hover:bg-[#f5edde]"
              >
                <a href="#contact">
                  {cta.final}
                  <MoveRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
