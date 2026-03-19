import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Linkedin, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cta, socialLinks } from "./content";
import { Reveal } from "./Reveal";

export function ContactSection() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const contactMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      await apiRequest("POST", "/api/contact", {
        ...payload,
        subject: "Landing page inquiry",
      });
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your inquiry was saved successfully and is ready for follow-up.",
      });
      setForm({
        name: "",
        email: "",
        message: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to send message",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <section id="contact" className="border-t border-primary/10 bg-[#f7f5f0] py-20 sm:py-24">
      <div className="container-custom grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div>
            <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/80">Contact</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Ask a question or take the next step with the right pathway
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              If you are ready to begin, choose either focused fitness coaching with Rahim or the
              fuller wellness review pathway that may include physician consultation with Dr.
              Shireen after intake and appropriate review.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild className="rounded-full px-6">
                <a href="/signup?service=Fitness%20Pathway">{cta.finalPrimary}</a>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-primary/20 px-6">
                <a href="/signup?service=Full%20Wellness%20Pathway">{cta.finalSecondary}</a>
              </Button>
            </div>
            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a href={socialLinks.email} className="text-muted-foreground transition hover:text-primary">
                    hello@wellnesswithdrjindani.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Linkedin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Rahim LinkedIn</p>
                  <a href={socialLinks.linkedinRahim} className="text-muted-foreground transition hover:text-primary">
                    linkedin.com/in/rj987
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Linkedin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Shireen LinkedIn</p>
                  <a href={socialLinks.linkedinShireen} className="text-muted-foreground transition hover:text-primary">
                    linkedin.com/in/shireenjindani
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p className="text-muted-foreground">Available Online</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_24px_90px_-40px_rgba(33,56,45,0.34)] sm:p-8">
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                contactMutation.mutate(form);
              }}
            >
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="h-12 rounded-2xl border-primary/10 bg-[#fcfbf8]"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="h-12 rounded-2xl border-primary/10 bg-[#fcfbf8]"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us a little about your goals and what support you are looking for."
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  className="min-h-36 rounded-2xl border-primary/10 bg-[#fcfbf8]"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full text-base"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
