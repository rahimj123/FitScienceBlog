import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LandingFooter } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { Reveal } from "@/components/landing/Reveal";

const stage1Questions = [
  { key: "heartCondition", label: "Have you been told to be cautious with exercise because of a heart-related concern?" },
  { key: "chestDiscomfort", label: "Have you recently noticed chest discomfort during activity or at rest?" },
  { key: "dizzinessOrFainting", label: "Have you experienced fainting, near-fainting, or unexplained dizziness?" },
  { key: "breathingIssues", label: "Do breathing issues, asthma, or shortness of breath affect your activity?" },
  { key: "diabetesManagementConcern", label: "Do you need special consideration around diabetes or blood sugar management?" },
  { key: "musculoskeletalLimitation", label: "Do pain, joint issues, or movement limitations affect how you exercise?" },
] as const;

const stage2Questions = [
  { key: "smokingHistory", label: "Smoking history" },
  { key: "bloodPressureHistory", label: "High blood pressure history" },
  { key: "cholesterolHistory", label: "Cholesterol concerns" },
  { key: "bloodGlucoseHistory", label: "Blood glucose concerns" },
  { key: "medicationConsiderations", label: "Medication considerations" },
  { key: "priorHospitalizations", label: "Recent hospitalizations" },
  { key: "pregnancyRelated", label: "Pregnancy-related considerations" },
  { key: "injuryHistory", label: "Injury history" },
] as const;

type BooleanKey = (typeof stage1Questions)[number]["key"] | (typeof stage2Questions)[number]["key"];

type OnboardingState = {
  basicInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    servicePreference: "fitness" | "advanced";
    disabilityFlag: boolean;
  };
  screeningStage1: {
    heartCondition: boolean;
    chestDiscomfort: boolean;
    dizzinessOrFainting: boolean;
    breathingIssues: boolean;
    diabetesManagementConcern: boolean;
    musculoskeletalLimitation: boolean;
    currentActivityLevel: "minimal" | "light" | "moderate" | "vigorous";
    lightActivityMinutes: string;
    moderateActivityMinutes: string;
    vigorousActivityMinutes: string;
    notes: string;
  };
  screeningStage2: {
    smokingHistory: boolean;
    bloodPressureHistory: boolean;
    cholesterolHistory: boolean;
    bloodGlucoseHistory: boolean;
    medicationConsiderations: boolean;
    priorHospitalizations: boolean;
    pregnancyRelated: boolean;
    injuryHistory: boolean;
    details: string;
  };
  wellnessHistory: {
    sleepQuality: string;
    stressLoad: string;
    nutritionPattern: string;
    movementHistory: string;
    mentalWellbeing: string;
    primaryGoals: string;
    currentBarriers: string;
    advancedInterest: boolean;
  };
  consents: {
    coachingConsent: boolean;
    privacyConsent: boolean;
    physicianConsultConsent: boolean;
    liabilityAcknowledgement: boolean;
    signature: string;
  };
};

const initialState: OnboardingState = {
  basicInfo: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    servicePreference: "fitness",
    disabilityFlag: false,
  },
  screeningStage1: {
    heartCondition: false,
    chestDiscomfort: false,
    dizzinessOrFainting: false,
    breathingIssues: false,
    diabetesManagementConcern: false,
    musculoskeletalLimitation: false,
    currentActivityLevel: "minimal",
    lightActivityMinutes: "0",
    moderateActivityMinutes: "0",
    vigorousActivityMinutes: "0",
    notes: "",
  },
  screeningStage2: {
    smokingHistory: false,
    bloodPressureHistory: false,
    cholesterolHistory: false,
    bloodGlucoseHistory: false,
    medicationConsiderations: false,
    priorHospitalizations: false,
    pregnancyRelated: false,
    injuryHistory: false,
    details: "",
  },
  wellnessHistory: {
    sleepQuality: "",
    stressLoad: "",
    nutritionPattern: "",
    movementHistory: "",
    mentalWellbeing: "",
    primaryGoals: "",
    currentBarriers: "",
    advancedInterest: false,
  },
  consents: {
    coachingConsent: false,
    privacyConsent: false,
    physicianConsultConsent: false,
    liabilityAcknowledgement: false,
    signature: "",
  },
};

function getServicePreference() {
  if (typeof window === "undefined") {
    return "fitness";
  }

  const params = new URLSearchParams(window.location.search);
  const service = params.get("service")?.toLowerCase() ?? "";
  if (service.includes("advanced") || service.includes("wellness") || service.includes("physician")) {
    return "advanced";
  }
  return "fitness";
}

function yesNoField(
  label: string,
  checked: boolean,
  onChange: (value: boolean) => void,
) {
  return (
    <div className="rounded-[1.25rem] border border-primary/10 bg-[#fcfbf8] p-4">
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="mt-4 flex gap-3">
        <Button
          type="button"
          variant={checked ? "default" : "outline"}
          className="rounded-full"
          onClick={() => onChange(true)}
        >
          Yes
        </Button>
        <Button
          type="button"
          variant={!checked ? "default" : "outline"}
          className="rounded-full"
          onClick={() => onChange(false)}
        >
          No
        </Button>
      </div>
    </div>
  );
}

function ServiceSignup() {
  const inferredPath = useMemo(() => getServicePreference(), []);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingState>({
    ...initialState,
    basicInfo: {
      ...initialState.basicInfo,
      servicePreference: inferredPath,
    },
    wellnessHistory: {
      ...initialState.wellnessHistory,
      advancedInterest: inferredPath === "advanced",
    },
  });
  const [result, setResult] = useState<null | {
    profileId: string;
    pathway: string;
    requiresClearance: boolean;
    categories: string[];
    redFlags: Array<{ flagType: string; description: string }>;
  }>(null);
  const { toast } = useToast();

  const weightedActivityMinutes =
    Number(form.screeningStage1.lightActivityMinutes || 0) +
    Number(form.screeningStage1.moderateActivityMinutes || 0) +
    Number(form.screeningStage1.vigorousActivityMinutes || 0) * 2;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        basicInfo: form.basicInfo,
        screeningStage1: {
          ...form.screeningStage1,
          lightActivityMinutes: Number(form.screeningStage1.lightActivityMinutes),
          moderateActivityMinutes: Number(form.screeningStage1.moderateActivityMinutes),
          vigorousActivityMinutes: Number(form.screeningStage1.vigorousActivityMinutes),
        },
        screeningStage2: form.screeningStage2,
        wellnessHistory:
          form.basicInfo.servicePreference === "advanced" || form.wellnessHistory.advancedInterest
            ? form.wellnessHistory
            : undefined,
        consents: form.consents,
      };
      const response = await apiRequest("POST", "/api/platform/onboarding", payload);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Onboarding submitted",
        description: "The intake, screening, pathway classification, and audit trail were created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to submit onboarding",
        description: error instanceof Error ? error.message : "Please review the form and try again.",
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
              <div className="mt-8 max-w-4xl">
                <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/80">
                  Client Onboarding Platform
                </p>
                <h1 className="mt-4 text-balance font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                  Complete intake, screening, consent, and pathway assignment in one flow
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Every client begins here. The system collects intake details, original pre-exercise
                  screening, risk factors, optional expanded wellness history, and consent before
                  assigning Fitness Pathway, Advanced Wellness Pathway, or Needs Medical Clearance.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container-custom grid gap-8 lg:grid-cols-[0.45fr_1fr]">
            <Reveal>
              <div className="rounded-[2rem] border border-primary/10 bg-white p-6 shadow-[0_20px_70px_-40px_rgba(33,56,45,0.3)]">
                <div className="space-y-3">
                  {[
                    "1. Basic Info",
                    "2. Pre-Exercise Screening",
                    "3. Risk Factors",
                    "4. Expanded Wellness Intake",
                    "5. Consent",
                  ].map((label, index) => (
                    <div
                      key={label}
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        step === index + 1 ? "bg-primary text-primary-foreground" : "bg-[#f8f5ef] text-foreground/80"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-[#f8f5ef] p-4 text-sm leading-6 text-muted-foreground">
                  Weighted weekly activity: <span className="font-semibold text-foreground">{weightedActivityMinutes}</span> minutes
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_24px_90px_-40px_rgba(33,56,45,0.34)] sm:p-8">
                {result ? (
                  <div className="space-y-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-3xl font-semibold">Onboarding submitted successfully</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f8f5ef] p-5">
                        <p className="text-sm uppercase tracking-[0.18em] text-primary/70">Assigned pathway</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{result.pathway}</p>
                      </div>
                      <div className="rounded-2xl bg-[#f8f5ef] p-5">
                        <p className="text-sm uppercase tracking-[0.18em] text-primary/70">Medical clearance</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {result.requiresClearance ? "Required" : "Not currently required"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-primary/10 p-5">
                      <p className="text-sm uppercase tracking-[0.18em] text-primary/70">Assigned categories</p>
                      <p className="mt-2 text-base text-muted-foreground">{result.categories.join(", ") || "None"}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 p-5">
                      <p className="text-sm uppercase tracking-[0.18em] text-primary/70">Identified flags</p>
                      {result.redFlags.length ? (
                        <div className="mt-3 space-y-3">
                          {result.redFlags.map((flag) => (
                            <div key={flag.flagType} className="rounded-xl bg-[#fcfbf8] p-4 text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">{flag.flagType}</span>: {flag.description}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-base text-muted-foreground">No active flags were recorded in this submission.</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Button asChild className="rounded-full">
                        <a href="/admin">Open admin dashboard</a>
                      </Button>
                      <Button asChild variant="outline" className="rounded-full">
                        <a href="/">Return to landing page</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form
                    className="space-y-8"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (step < 5) {
                        setStep((current) => current + 1);
                        return;
                      }
                      submitMutation.mutate();
                    }}
                  >
                    {step === 1 && (
                      <div className="space-y-5">
                        <h2 className="text-3xl font-semibold">Step 1: Basic info</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="firstName">First name</Label>
                            <Input id="firstName" value={form.basicInfo.firstName} onChange={(e) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, firstName: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last name</Label>
                            <Input id="lastName" value={form.basicInfo.lastName} onChange={(e) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, lastName: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="dob">Date of birth</Label>
                            <Input id="dob" type="date" value={form.basicInfo.dateOfBirth} onChange={(e) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, dateOfBirth: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Input id="gender" value={form.basicInfo.gender} onChange={(e) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, gender: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={form.basicInfo.email} onChange={(e) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, email: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={form.basicInfo.phone} onChange={(e) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, phone: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="emergencyName">Emergency contact name</Label>
                            <Input id="emergencyName" value={form.basicInfo.emergencyContactName} onChange={(e) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, emergencyContactName: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                          <div>
                            <Label htmlFor="emergencyPhone">Emergency contact phone</Label>
                            <Input id="emergencyPhone" value={form.basicInfo.emergencyContactPhone} onChange={(e) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, emergencyContactPhone: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <Label>Service preference</Label>
                            <div className="mt-2 flex gap-3">
                              <Button type="button" variant={form.basicInfo.servicePreference === "fitness" ? "default" : "outline"} className="rounded-full" onClick={() => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, servicePreference: "fitness" } }))}>Fitness Pathway</Button>
                              <Button type="button" variant={form.basicInfo.servicePreference === "advanced" ? "default" : "outline"} className="rounded-full" onClick={() => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, servicePreference: "advanced" }, wellnessHistory: { ...c.wellnessHistory, advancedInterest: true } }))}>Advanced Pathway</Button>
                            </div>
                          </div>
                          <div className="rounded-[1.25rem] border border-primary/10 bg-[#fcfbf8] p-4">
                            <div className="flex items-center gap-3">
                              <Checkbox checked={form.basicInfo.disabilityFlag} onCheckedChange={(checked) => setForm((c) => ({ ...c, basicInfo: { ...c.basicInfo, disabilityFlag: Boolean(checked) } }))} />
                              <Label>Client requests disability-related support consideration</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-5">
                        <h2 className="text-3xl font-semibold">Step 2: Original pre-exercise screening</h2>
                        <p className="text-base leading-7 text-muted-foreground">
                          This section is designed as an original risk-identification safety filter before exercise.
                        </p>
                        <div className="grid gap-4">
                          {stage1Questions.map((question) => (
                            <div key={question.key}>
                              {yesNoField(
                                question.label,
                                form.screeningStage1[question.key],
                                (value) =>
                                  setForm((current) => ({
                                    ...current,
                                    screeningStage1: {
                                      ...current.screeningStage1,
                                      [question.key]: value,
                                    },
                                  }))
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <Label>Current activity level</Label>
                            <select
                              value={form.screeningStage1.currentActivityLevel}
                              onChange={(e) => setForm((c) => ({ ...c, screeningStage1: { ...c.screeningStage1, currentActivityLevel: e.target.value as OnboardingState["screeningStage1"]["currentActivityLevel"] } }))}
                              className="mt-2 flex h-12 w-full rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm"
                            >
                              <option value="minimal">Minimal</option>
                              <option value="light">Light</option>
                              <option value="moderate">Moderate</option>
                              <option value="vigorous">Vigorous</option>
                            </select>
                          </div>
                          <div>
                            <Label>Light activity minutes</Label>
                            <Input type="number" min="0" value={form.screeningStage1.lightActivityMinutes} onChange={(e) => setForm((c) => ({ ...c, screeningStage1: { ...c.screeningStage1, lightActivityMinutes: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                          <div>
                            <Label>Moderate activity minutes</Label>
                            <Input type="number" min="0" value={form.screeningStage1.moderateActivityMinutes} onChange={(e) => setForm((c) => ({ ...c, screeningStage1: { ...c.screeningStage1, moderateActivityMinutes: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                          <div>
                            <Label>Vigorous activity minutes</Label>
                            <Input type="number" min="0" value={form.screeningStage1.vigorousActivityMinutes} onChange={(e) => setForm((c) => ({ ...c, screeningStage1: { ...c.screeningStage1, vigorousActivityMinutes: e.target.value } }))} className="mt-2 h-12 rounded-2xl" />
                          </div>
                        </div>
                        <div>
                          <Label>Additional notes</Label>
                          <Textarea value={form.screeningStage1.notes} onChange={(e) => setForm((c) => ({ ...c, screeningStage1: { ...c.screeningStage1, notes: e.target.value } }))} className="mt-2 min-h-28 rounded-2xl" />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-5">
                        <h2 className="text-3xl font-semibold">Step 3: Risk factors</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                          {stage2Questions.map((question) => (
                            <div key={question.key}>
                              {yesNoField(
                                question.label,
                                form.screeningStage2[question.key],
                                (value) =>
                                  setForm((current) => ({
                                    ...current,
                                    screeningStage2: {
                                      ...current.screeningStage2,
                                      [question.key]: value,
                                    },
                                  }))
                              )}
                            </div>
                          ))}
                        </div>
                        <div>
                          <Label>Risk factor details</Label>
                          <Textarea value={form.screeningStage2.details} onChange={(e) => setForm((c) => ({ ...c, screeningStage2: { ...c.screeningStage2, details: e.target.value } }))} className="mt-2 min-h-28 rounded-2xl" />
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-5">
                        <h2 className="text-3xl font-semibold">Step 4: Expanded wellness intake</h2>
                        <p className="text-base leading-7 text-muted-foreground">
                          This section is primarily for the advanced pathway and helps the team understand broader lifestyle context.
                        </p>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <Label>Sleep</Label>
                            <Textarea value={form.wellnessHistory.sleepQuality} onChange={(e) => setForm((c) => ({ ...c, wellnessHistory: { ...c.wellnessHistory, sleepQuality: e.target.value } }))} className="mt-2 min-h-24 rounded-2xl" />
                          </div>
                          <div>
                            <Label>Stress</Label>
                            <Textarea value={form.wellnessHistory.stressLoad} onChange={(e) => setForm((c) => ({ ...c, wellnessHistory: { ...c.wellnessHistory, stressLoad: e.target.value } }))} className="mt-2 min-h-24 rounded-2xl" />
                          </div>
                          <div>
                            <Label>Nutrition</Label>
                            <Textarea value={form.wellnessHistory.nutritionPattern} onChange={(e) => setForm((c) => ({ ...c, wellnessHistory: { ...c.wellnessHistory, nutritionPattern: e.target.value } }))} className="mt-2 min-h-24 rounded-2xl" />
                          </div>
                          <div>
                            <Label>Exercise history</Label>
                            <Textarea value={form.wellnessHistory.movementHistory} onChange={(e) => setForm((c) => ({ ...c, wellnessHistory: { ...c.wellnessHistory, movementHistory: e.target.value } }))} className="mt-2 min-h-24 rounded-2xl" />
                          </div>
                          <div>
                            <Label>Mental wellbeing</Label>
                            <Textarea value={form.wellnessHistory.mentalWellbeing} onChange={(e) => setForm((c) => ({ ...c, wellnessHistory: { ...c.wellnessHistory, mentalWellbeing: e.target.value } }))} className="mt-2 min-h-24 rounded-2xl" />
                          </div>
                          <div>
                            <Label>Goals</Label>
                            <Textarea value={form.wellnessHistory.primaryGoals} onChange={(e) => setForm((c) => ({ ...c, wellnessHistory: { ...c.wellnessHistory, primaryGoals: e.target.value } }))} className="mt-2 min-h-24 rounded-2xl" />
                          </div>
                        </div>
                        <div>
                          <Label>Barriers</Label>
                          <Textarea value={form.wellnessHistory.currentBarriers} onChange={(e) => setForm((c) => ({ ...c, wellnessHistory: { ...c.wellnessHistory, currentBarriers: e.target.value } }))} className="mt-2 min-h-28 rounded-2xl" />
                        </div>
                        <div className="rounded-[1.25rem] border border-primary/10 bg-[#fcfbf8] p-4">
                          <div className="flex items-center gap-3">
                            <Checkbox checked={form.wellnessHistory.advancedInterest} onCheckedChange={(checked) => setForm((c) => ({ ...c, wellnessHistory: { ...c.wellnessHistory, advancedInterest: Boolean(checked) }, basicInfo: { ...c.basicInfo, servicePreference: Boolean(checked) ? "advanced" : c.basicInfo.servicePreference } }))} />
                            <Label>I want consideration for the advanced wellness pathway</Label>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 5 && (
                      <div className="space-y-5">
                        <h2 className="text-3xl font-semibold">Step 5: Consent and acknowledgement</h2>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 rounded-[1.25rem] border border-primary/10 bg-[#fcfbf8] p-4">
                            <Checkbox checked={form.consents.coachingConsent} onCheckedChange={(checked) => setForm((c) => ({ ...c, consents: { ...c.consents, coachingConsent: Boolean(checked) } }))} />
                            <Label>I understand that exercise and wellness coaching is educational and does not replace medical diagnosis or treatment.</Label>
                          </div>
                          <div className="flex items-start gap-3 rounded-[1.25rem] border border-primary/10 bg-[#fcfbf8] p-4">
                            <Checkbox checked={form.consents.privacyConsent} onCheckedChange={(checked) => setForm((c) => ({ ...c, consents: { ...c.consents, privacyConsent: Boolean(checked) } }))} />
                            <Label>I consent to privacy handling and secure use of my intake information for onboarding and coordinated review.</Label>
                          </div>
                          <div className="flex items-start gap-3 rounded-[1.25rem] border border-primary/10 bg-[#fcfbf8] p-4">
                            <Checkbox checked={form.consents.physicianConsultConsent} onCheckedChange={(checked) => setForm((c) => ({ ...c, consents: { ...c.consents, physicianConsultConsent: Boolean(checked) } }))} />
                            <Label>I understand physician consultation is separate from coaching and only occurs through formal booking and review.</Label>
                          </div>
                          <div className="flex items-start gap-3 rounded-[1.25rem] border border-primary/10 bg-[#fcfbf8] p-4">
                            <Checkbox checked={form.consents.liabilityAcknowledgement} onCheckedChange={(checked) => setForm((c) => ({ ...c, consents: { ...c.consents, liabilityAcknowledgement: Boolean(checked) } }))} />
                            <Label>I acknowledge that exercise participation involves responsibility, honest disclosure, and appropriate escalation if symptoms or risks arise.</Label>
                          </div>
                        </div>
                        <div>
                          <Label>E-signature</Label>
                          <Input value={form.consents.signature} onChange={(e) => setForm((c) => ({ ...c, consents: { ...c.consents, signature: e.target.value } }))} className="mt-2 h-12 rounded-2xl" placeholder="Type your full name" />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-4 border-t border-primary/10 pt-6 sm:flex-row sm:justify-between">
                      <Button type="button" variant="outline" className="rounded-full" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>
                        Back
                      </Button>
                      <Button type="submit" className="rounded-full" disabled={submitMutation.isPending}>
                        {step < 5 ? (
                          <>
                            Continue
                            <ArrowRight className="h-4 w-4" />
                          </>
                        ) : submitMutation.isPending ? (
                          "Submitting..."
                        ) : (
                          "Submit onboarding"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
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
