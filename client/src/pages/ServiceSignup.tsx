import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LandingFooter } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { Reveal } from "@/components/landing/Reveal";
import { services } from "@/components/landing/content";

const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"] as const;

type FormState = {
  service: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  email: string;
};

function getSelectedService() {
  if (typeof window === "undefined") {
    return services[0].title;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("service") ?? services[0].title;
}

function ServiceSignup() {
  const { toast } = useToast();
  const selectedService = useMemo(() => getSelectedService(), []);
  const [form, setForm] = useState<FormState>({
    service: selectedService,
    firstName: "",
    lastName: "",
    age: "",
    gender: genderOptions[0],
    email: "",
  });

  const signupMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      await apiRequest("POST", "/api/service-signups", {
        ...payload,
        age: Number(payload.age),
      });
    },
    onSuccess: () => {
      toast({
        title: "Signup received",
        description: "Your details were submitted successfully. Dr. Jindani can now follow up.",
      });
      setForm({
        service: selectedService,
        firstName: "",
        lastName: "",
        age: "",
        gender: genderOptions[0],
        email: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to submit",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pb-20">
        <section className="border-b border-primary/10 bg-[linear-gradient(180deg,_#f8f4ee_0%,_#f7f8f4_55%,_#ffffff_100%)] py-16 sm:py-20">
          <div className="container-custom">
            <Reveal>
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </a>
              <div className="mt-8 max-w-3xl">
                <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/80">
                  Service Signup
                </p>
                <h1 className="mt-4 text-balance font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                  Start your journey with {selectedService}
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Share a few details below so Dr. Jindani can understand who you are and follow
                  up with the right next step. The form is optimized for desktop, Android, and
                  iPhone screens, with touch-friendly inputs and single-column flow on mobile.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container-custom grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <div className="rounded-[2rem] border border-primary/10 bg-[#f8f5ef] p-7 shadow-[0_20px_70px_-40px_rgba(33,56,45,0.3)]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">What happens next</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-muted-foreground">
                  <p>Your information is stored in the SQL database for follow-up and onboarding.</p>
                  <p>Dr. Jindani can review your details and guide you toward the best starting plan.</p>
                  <p>You can later expand this form to include goals, injuries, or consultation preferences.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_24px_90px_-40px_rgba(33,56,45,0.34)] sm:p-8">
                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    signupMutation.mutate(form);
                  }}
                >
                  <div>
                    <Label htmlFor="service">Selected service</Label>
                    <Input
                      id="service"
                      value={form.service}
                      onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))}
                      className="mt-2 h-12 rounded-2xl border-primary/10 bg-[#fcfbf8]"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                        className="mt-2 h-12 rounded-2xl border-primary/10 bg-[#fcfbf8]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                        className="mt-2 h-12 rounded-2xl border-primary/10 bg-[#fcfbf8]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="18"
                        max="100"
                        inputMode="numeric"
                        value={form.age}
                        onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
                        className="mt-2 h-12 rounded-2xl border-primary/10 bg-[#fcfbf8]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={form.gender}
                        onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}
                        className="mt-2 flex h-12 w-full rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {genderOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="mt-2 h-12 rounded-2xl border-primary/10 bg-[#fcfbf8]"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full text-base"
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? "Submitting..." : "Submit Signup"}
                  </Button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

export default ServiceSignup;
