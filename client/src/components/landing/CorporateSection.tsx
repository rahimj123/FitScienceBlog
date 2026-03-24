import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Building2, BriefcaseBusiness, Gauge, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const enterpriseHighlights = [
  {
    icon: Building2,
    title: "Corporate onboarding flow",
    description: "Bring executives or teams into a structured wellness journey with bulk entry and premium routing.",
  },
  {
    icon: Users,
    title: "Bulk user management",
    description: "Track members by team, tier, and engagement state without losing the individual coaching layer.",
  },
  {
    icon: Gauge,
    title: "Executive dashboards",
    description: "Monitor participation, milestone completion, and wellness momentum across leadership cohorts.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Performance insights",
    description: "Translate wellness activity into a higher-level view of engagement, consistency, and employee support needs.",
  },
] as const;

export function CorporateSection() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    organizationName: "",
    contactName: "",
    contactEmail: "",
    teamSize: "",
    priorities: "",
    interestArea: "executive",
  });

  const leadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/membership/corporate-lead", form);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Corporate inquiry received",
        description: "The enterprise lead was saved for executive wellness follow-up.",
      });
      setForm({
        organizationName: "",
        contactName: "",
        contactEmail: "",
        teamSize: "",
        priorities: "",
        interestArea: "executive",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to send inquiry",
        description: error instanceof Error ? error.message : "Please review the form and try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <section id="corporates" className="bg-[#f3f0e7] py-20 sm:py-24">
      <div className="container-custom">
        <Reveal>
          <SectionHeading
            eyebrow="For Corporates"
            title="Executive wellness designed for leadership teams and high-value professionals"
            description="Tier 3 is also a corporate offer: high-touch onboarding, leadership-focused planning, premium accountability, and a physician-connected escalation pathway when needed."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="grid gap-4">
              {enterpriseHighlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-[1.8rem] border border-primary/10 bg-white p-6 shadow-[0_22px_70px_-40px_rgba(33,56,45,0.28)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <highlight.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{highlight.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{highlight.description}</p>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="rounded-[2rem] border border-primary/10 bg-white p-8 shadow-[0_28px_90px_-42px_rgba(33,56,45,0.32)]">
              <p className="text-sm uppercase tracking-[0.22em] text-primary/70">Enterprise Contact Flow</p>
              <h3 className="mt-3 text-3xl font-semibold text-foreground">Request a corporate wellness conversation</h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Share your organization details and the type of executive or workforce support you need. The system captures the lead and routes it into the corporate pipeline.
              </p>

              <form
                className="mt-8 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  leadMutation.mutate();
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="organizationName">Organization</Label>
                    <Input
                      id="organizationName"
                      className="mt-2 h-12 rounded-2xl"
                      value={form.organizationName}
                      onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact name</Label>
                    <Input
                      id="contactName"
                      className="mt-2 h-12 rounded-2xl"
                      value={form.contactName}
                      onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="contactEmail">Contact email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      className="mt-2 h-12 rounded-2xl"
                      value={form.contactEmail}
                      onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamSize">Team size</Label>
                    <Input
                      id="teamSize"
                      className="mt-2 h-12 rounded-2xl"
                      value={form.teamSize}
                      onChange={(event) => setForm((current) => ({ ...current, teamSize: event.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="interestArea">Interest area</Label>
                  <select
                    id="interestArea"
                    className="mt-2 flex h-12 w-full rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm"
                    value={form.interestArea}
                    onChange={(event) => setForm((current) => ({ ...current, interestArea: event.target.value }))}
                  >
                    <option value="executive">Executive wellness</option>
                    <option value="workforce">Workforce wellbeing</option>
                    <option value="leadership">Leadership cohort</option>
                    <option value="custom">Custom design</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priorities">Priorities</Label>
                  <Textarea
                    id="priorities"
                    className="mt-2 min-h-32 rounded-2xl"
                    value={form.priorities}
                    onChange={(event) => setForm((current) => ({ ...current, priorities: event.target.value }))}
                    placeholder="Tell us what outcomes, accountability model, or executive support structure you want."
                  />
                </div>

                <Button className="rounded-full" disabled={leadMutation.isPending}>
                  {leadMutation.isPending ? "Sending..." : "Send Corporate Inquiry"}
                </Button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
