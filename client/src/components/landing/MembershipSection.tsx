import { BadgeCheck, ChartNoAxesColumn, LockKeyhole, Target, Users } from "lucide-react";
import { membershipPlans, getMembershipTierLabel } from "@shared/membership";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const progression = [
  {
    tier: "free",
    title: "Attract",
    detail: "Social engagement, awareness, and low-pressure exploration.",
    progress: "20%",
  },
  {
    tier: "tier1",
    title: "Activate",
    detail: "Structured planning, beginner programs, and accountability nudges.",
    progress: "45%",
  },
  {
    tier: "tier2",
    title: "Transform",
    detail: "Community-driven action, dashboards, and consistency loops.",
    progress: "75%",
  },
  {
    tier: "tier3",
    title: "Optimize",
    detail: "Executive-level personalization, expert access, and performance tracking.",
    progress: "100%",
  },
] as const;

const highlights = [
  {
    icon: Users,
    title: "Community-first behavior change",
    description: "Social connection is the entry point, then accountability deepens as clients move up tiers.",
  },
  {
    icon: Target,
    title: "Stage-matched progression",
    description: "Each tier aligns with readiness, from contemplation through maintenance and executive optimization.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Visible momentum",
    description: "Milestones, progress bars, and community challenges keep behavior change measurable.",
  },
  {
    icon: LockKeyhole,
    title: "Premium access reserved for Tier 3",
    description: "Executive members receive a high-touch coaching relationship with physician pathway access when appropriate.",
  },
] as const;

export function MembershipSection() {
  return (
    <section id="memberships" className="bg-[linear-gradient(180deg,_#fbf5ea_0%,_#f6f7f2_38%,_#ffffff_100%)] py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="Membership Engine"
            title="A behavioral transformation engine built around tiers, community, and progression"
            description="The free tier builds trust and social engagement. Tier 1 turns readiness into action. Tier 2 reinforces consistency through accountability and community. Tier 3 delivers executive-level optimization for clients who need precision and exclusive access."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {progression.map((item, index) => (
            <Reveal key={item.tier} delay={index * 0.06}>
              <article className="rounded-[2rem] border border-primary/10 bg-white p-6 shadow-[0_22px_70px_-40px_rgba(33,56,45,0.28)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.18em] text-primary/70">{getMembershipTierLabel(item.tier)}</p>
                  <BadgeCheck className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.detail}</p>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-primary/70">
                    <span>Behavior Progress</span>
                    <span>{item.progress}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full rounded-full bg-primary" style={{ width: item.progress }} />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6 lg:grid-cols-2">
            {membershipPlans.map((plan, index) => (
              <Reveal key={plan.id} delay={index * 0.06}>
                <article className="h-full rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_24px_90px_-40px_rgba(33,56,45,0.32)]">
                  <p className="text-sm uppercase tracking-[0.2em] text-primary/70">{getMembershipTierLabel(plan.tier)}</p>
                  <h3 className="mt-3 font-display text-3xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">{plan.tagline}</p>
                  <div className="mt-6 rounded-2xl bg-[#f8f5ef] p-4 text-sm leading-6 text-foreground/85">
                    <span className="font-semibold text-foreground">Behavioral focus:</span> {plan.primaryDriver}
                  </div>
                  <div className="mt-6 space-y-3">
                    {plan.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="rounded-2xl border border-primary/10 px-4 py-3 text-sm leading-6 text-muted-foreground">
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl bg-[#fcfbf8] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Upgrade logic</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.upgradeGoal}</p>
                  </div>
                  <Button asChild className="mt-6 rounded-full">
                    <a href={`/signup?membership=${encodeURIComponent(plan.tier)}`}>{plan.ctaLabel}</a>
                  </Button>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-[2rem] bg-[#21382d] p-8 text-white shadow-[0_28px_90px_-42px_rgba(19,34,28,0.55)]">
              <SectionHeading
                eyebrow="Social Intervention"
                title="Social interaction increases as structure increases"
                description="Behavior change here is not treated as a solo discipline problem. It is intentionally designed around belonging, accountability loops, and milestone reinforcement."
                align="left"
                tone="light"
              />
              <div className="mt-8 space-y-4">
                {highlights.map((highlight) => (
                  <div key={highlight.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <highlight.icon className="h-5 w-5 text-[#d7c49e]" />
                      <p className="font-semibold text-white">{highlight.title}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/75">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
