import { MessageSquare } from "lucide-react";
import { testimonials } from "./content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-[#183222] py-20 text-white sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Testimonials"
            title="Support that helps clients feel capable, consistent, and cared for"
            description="Every journey looks different, but the goal stays the same: steady progress, better confidence, and healthier routines that last."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.06}>
              <figure className="h-full rounded-[1.9rem] border border-white/10 bg-white/8 p-7 backdrop-blur-md">
                <MessageSquare className="h-8 w-8 text-[#d7c49e]" />
                <blockquote className="mt-6 text-lg leading-8 text-white/90">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-8 border-t border-white/10 pt-5">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-white/65">{testimonial.detail}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
