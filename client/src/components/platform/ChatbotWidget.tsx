import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, ChevronRight, MessageCircle, PauseCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./AuthProvider";
import { chatbotSteps, recommendChatbotPathway, type ChatDraft } from "./chatbot-config";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const STORAGE_KEY = "wellness-chatbot-session-id";

function toBoolean(value: string) {
  return value === "yes";
}

export function ChatbotWidget() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"guest_preview" | "full_intake" | null>(null);
  const [draft, setDraft] = useState<ChatDraft>({});
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Wellness with Dr. Jindani. I can help you explore the available pathways, gather intake details conversationally, and guide you toward the right next step.",
    },
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<null | { profileId?: string; pathway: string; requiresClearance?: boolean; categories?: string[]; redFlags?: Array<{ description: string }> }>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSessionId(saved);
    }
  }, []);

  useEffect(() => {
    if (!user || sessionId) return;
    fetch("/api/platform/chatbot/my-latest", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (data?.id) {
          setSessionId(data.id);
          window.localStorage.setItem(STORAGE_KEY, data.id);
        }
      })
      .catch(() => undefined);
  }, [user, sessionId]);

  const activeSteps = useMemo(() => chatbotSteps.filter((step) => (step.include ? step.include(draft) : true)), [draft]);
  const currentStep = currentStepIndex >= 0 ? activeSteps[currentStepIndex] : null;
  const progressPercent = activeSteps.length > 0 && currentStepIndex >= 0 ? Math.min(100, Math.round((currentStepIndex / activeSteps.length) * 100)) : 0;

  const saveSessionMutation = useMutation({
    mutationFn: async (
      override?: Partial<{
        status: "active" | "paused" | "completed";
        completionStatus: "preview" | "in_progress" | "completed";
        profileId: string;
        silent: boolean;
      }>,
    ) => {
      const recommendation = recommendChatbotPathway(draft);
      const response = await apiRequest("POST", "/api/platform/chatbot/session", {
        sessionId: sessionId ?? undefined,
        profileId: override?.profileId ?? user?.profileId ?? undefined,
        mode: mode ?? "guest_preview",
        status: override?.status ?? "active",
        completionStatus: override?.completionStatus ?? (mode === "guest_preview" ? "preview" : "in_progress"),
        currentStep: currentStep?.id ?? "opening",
        progressPercent,
        pathwayInterest: String(draft.pathwayInterest ?? ""),
        recommendedPathway: recommendation.pathway,
        routingReason: recommendation.reason,
        email: typeof draft.email === "string" ? draft.email : undefined,
        draft,
        transcript: messages,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.id) {
        setSessionId(data.id);
        window.localStorage.setItem(STORAGE_KEY, data.id);
      }
    },
  });

  const loadSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/platform/chatbot/session/${id}`);
      if (!response.ok) throw new Error("Unable to load saved intake.");
      return response.json();
    },
    onSuccess: (data) => {
      setMode(data.mode);
      setDraft((data.draftJson as ChatDraft) ?? {});
      setMessages((data.messages as Message[])?.length ? (data.messages as Message[]) : messages);
      const targetIndex = chatbotSteps.findIndex((step) => step.id === data.currentStep);
      setCurrentStepIndex(targetIndex >= 0 ? targetIndex : 0);
      toast({
        title: "Draft resumed",
        description: "Your previous chatbot intake was restored.",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const recommendation = recommendChatbotPathway(draft);
      const onboardingPayload = {
        basicInfo: {
          firstName: String(draft.firstName ?? ""),
          lastName: String(draft.lastName ?? ""),
          dateOfBirth: String(draft.dateOfBirth ?? ""),
          gender: String(draft.gender ?? ""),
          email: String(draft.email ?? ""),
          phone: String(draft.phone ?? ""),
          emergencyContactName: String(draft.emergencyContactName ?? ""),
          emergencyContactPhone: String(draft.emergencyContactPhone ?? ""),
          servicePreference: recommendation.pathway === "wellness_consultation" || recommendation.pathway === "needs_medical_clearance" ? "advanced" : "fitness",
          disabilityFlag: Boolean(draft.disabilitySupport),
        },
        screeningStage1: {
          heartCondition: Boolean(draft.heartCondition),
          chestDiscomfort: Boolean(draft.chestDiscomfort),
          dizzinessOrFainting: Boolean(draft.dizzinessOrFainting),
          breathingIssues: Boolean(draft.breathingIssues),
          diabetesManagementConcern: Boolean(draft.diabetesManagementConcern),
          musculoskeletalLimitation: Boolean(draft.musculoskeletalLimitation) || Boolean(draft.exerciseModificationCondition),
          currentActivityLevel: String(draft.activityLevel || "minimal"),
          lightActivityMinutes: Number(draft.lightMinutes || 0),
          moderateActivityMinutes: Number(draft.moderateMinutes || 0),
          vigorousActivityMinutes: Number(draft.vigorousMinutes || 0),
          notes: String(draft.mainGoals || ""),
        },
        screeningStage2: {
          smokingHistory: Boolean(draft.smokingHistory),
          bloodPressureHistory: Boolean(draft.bloodPressureHistory),
          cholesterolHistory: Boolean(draft.cholesterolHistory),
          bloodGlucoseHistory: Boolean(draft.bloodGlucoseHistory),
          medicationConsiderations: Boolean(draft.medicationConsiderations),
          priorHospitalizations: Boolean(draft.priorHospitalizations),
          pregnancyRelated: Boolean(draft.pregnancyRelated),
          injuryHistory: Boolean(draft.injuryHistory),
          details: String(draft.riskDetails || ""),
        },
        wellnessHistory:
          recommendation.pathway === "wellness_consultation" || recommendation.pathway === "needs_medical_clearance"
            ? {
                sleepQuality: String(draft.sleepQuality || "Not provided"),
                stressLoad: String(draft.stressLoad || "Not provided"),
                nutritionPattern: String(draft.nutritionPattern || "Not provided"),
                movementHistory: String(draft.exerciseHistory || draft.dailyRoutine || "Not provided"),
                mentalWellbeing: String(draft.emotionalWellbeing || "Not provided"),
                primaryGoals: String(draft.broaderGoals || draft.mainGoals || "Not provided"),
                currentBarriers: String(draft.barriers || "Not provided"),
                advancedInterest: true,
              }
            : undefined,
        consents: {
          coachingConsent: Boolean(draft.coachingConsent),
          privacyConsent: Boolean(draft.privacyConsent),
          physicianConsultConsent: Boolean(draft.physicianConsultConsent),
          liabilityAcknowledgement: Boolean(draft.emergencyContactAcknowledgement),
          signature: String(draft.signature ?? ""),
        },
      };

      const response = await apiRequest("POST", "/api/platform/onboarding", onboardingPayload);
      return response.json();
    },
    onSuccess: async (data) => {
      setResult(data);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Thank you. Your guided intake has been submitted. We’ve saved your details, assigned an initial pathway, and prepared the next step for the team.",
        },
      ]);
      await saveSessionMutation.mutateAsync({
        status: "completed",
        completionStatus: "completed",
        profileId: data.profileId,
        silent: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to submit guided intake",
        description: error instanceof Error ? error.message : "Please review your answers and try again.",
        variant: "destructive",
      });
    },
  });

  const appendUserAnswer = (content: string) => {
    setMessages((current) => [...current, { role: "user", content }]);
  };

  const askCurrentPrompt = (index: number) => {
    const step = activeSteps[index];
    if (!step) return;
    setMessages((current) => [...current, { role: "assistant", content: step.prompt }]);
  };

  const startFlow = (choice: "fitness" | "wellness" | "unsure" | "learn") => {
    if (choice === "learn") {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "The Fitness Journey Pathway focuses on exercise, movement, strength, mobility, and practical coaching. The Wellness Consultation Pathway is broader and may include physician consultation with Dr. Shireen when appropriate after review.",
        },
      ]);
      return;
    }

    if (choice === "unsure") {
      setDraft((current) => ({ ...current, pathwayInterest: "unsure" }));
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "No problem. I’ll ask a few short questions and recommend a sensible starting pathway based on what you share.",
        },
      ]);
    } else {
      setDraft((current) => ({
        ...current,
        pathwayInterest: choice === "fitness" ? "fitness_journey" : "wellness_consultation",
        supportType: choice === "fitness" ? "fitness" : "wellness",
      }));
    }

    setCurrentStepIndex(0);
    askCurrentPrompt(0);
  };

  const handleAnswer = async (value: string | boolean) => {
    if (!currentStep) return;

    const normalizedValue =
      currentStep.type === "yesno" ? Boolean(value) : typeof value === "boolean" ? String(value) : value;

    setDraft((current) => ({
      ...current,
      [currentStep.field]: normalizedValue,
    }));

    appendUserAnswer(typeof normalizedValue === "boolean" ? (normalizedValue ? "Yes" : "No") : String(normalizedValue));

    const nextIndex = currentStepIndex + 1;
    const nextStep = activeSteps[nextIndex];

    if (mode === "guest_preview" && nextIndex > 6) {
      const recommendation = recommendChatbotPathway({
        ...draft,
        [currentStep.field]: normalizedValue,
      });
      setResult({ pathway: recommendation.pathway });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${recommendation.reason} If you would like, switch to Full Guided Intake and I can save your details and route you properly.`,
        },
      ]);
      return;
    }

    if (!nextStep) {
      const recommendation = recommendChatbotPathway({
        ...draft,
        [currentStep.field]: normalizedValue,
      });

      if (
        recommendation.pathway === "needs_medical_clearance" &&
        !messages.some((entry) => entry.content.includes("additional review would be sensible"))
      ) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              "Thank you for sharing that. Based on your responses, a little more review would be sensible before exercise planning. A physician consultation or medical clearance may be appropriate before proceeding.",
          },
        ]);
      }

      if (mode === "full_intake") {
        completeMutation.mutate();
      } else {
        setResult({ pathway: recommendation.pathway });
      }
      return;
    }

    setCurrentStepIndex(nextIndex);
    setInputValue("");
    askCurrentPrompt(nextIndex);

    if (mode === "full_intake") {
      await saveSessionMutation.mutateAsync({ silent: true });
    }
  };

  const renderInput = () => {
    if (!currentStep) return null;

    if (currentStep.type === "yesno") {
      return (
        <div className="flex gap-3">
          <Button className="rounded-full" onClick={() => handleAnswer(true)}>Yes</Button>
          <Button variant="outline" className="rounded-full" onClick={() => handleAnswer(false)}>No</Button>
        </div>
      );
    }

    if (currentStep.type === "choice" && currentStep.options) {
      return (
        <div className="flex flex-wrap gap-3">
          {currentStep.options.map((option) => (
            <Button key={option.value} variant="outline" className="rounded-full" onClick={() => handleAnswer(option.value)}>
              {option.label}
            </Button>
          ))}
        </div>
      );
    }

    const commonProps = {
      value: inputValue,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInputValue(event.target.value),
      className: "rounded-2xl",
      placeholder: currentStep.helper ?? "Type your answer",
    };

    return (
      <div className="space-y-3">
        {currentStep.type === "textarea" ? (
          <Textarea {...commonProps} className="min-h-28 rounded-2xl" />
        ) : (
          <Input
            {...commonProps}
            type={currentStep.type === "email" ? "email" : currentStep.type === "date" ? "date" : currentStep.type === "number" ? "number" : "text"}
          />
        )}
        <Button className="rounded-full" onClick={() => handleAnswer(inputValue)}>
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 z-40 h-14 rounded-full px-5 shadow-[0_20px_60px_-28px_rgba(33,56,45,0.45)]">
          <MessageCircle className="h-5 w-5" />
          Guided Intake
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xl border-l-primary/10 bg-[#fbf8f2] px-0 sm:max-w-xl">
        <SheetHeader className="border-b border-primary/10 px-6 pb-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <SheetTitle className="font-display text-2xl">Guided Intake Assistant</SheetTitle>
          <SheetDescription>
            A calm conversational guide for pathway selection, intake, screening, and routing. Coaching support and physician consultation remain clearly distinct throughout.
          </SheetDescription>
          <Progress value={progressPercent} className="mt-4 h-2" />
        </SheetHeader>

        <div className="flex h-[calc(100vh-180px)] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {!mode ? (
              <div className="space-y-4">
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <p className="text-sm leading-7 text-muted-foreground">
                    Choose how you would like to use the assistant. Guest Preview lets you explore the pathways. Full Guided Intake saves your progress and can submit your intake into the platform.
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {user
                      ? `Signed in as ${user.email}. Your guided intake drafts can be resumed from this account.`
                      : "If you want account-based resume, create or log into an account at /account before starting full intake."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button className="rounded-full" onClick={() => setMode("guest_preview")}>Guest Preview</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => setMode("full_intake")}>Full Guided Intake</Button>
                    {sessionId ? (
                      <Button variant="outline" className="rounded-full" onClick={() => loadSessionMutation.mutate(sessionId)}>
                        Resume Previous Draft
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    What would you like help with?
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button variant="outline" className="rounded-full" onClick={() => startFlow("fitness")}>Start My Fitness Journey</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => startFlow("wellness")}>Explore Full Wellness Consultation</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => startFlow("unsure")}>I’m Not Sure Yet</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => startFlow("learn")}>Learn How It Works</Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 text-sm leading-7 ${
                      message.role === "assistant"
                        ? "bg-white text-foreground shadow-sm"
                        : "ml-auto bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
                {result ? (
                  <div className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-sm">
                    <h3 className="text-xl font-semibold">Your guided intake summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Recommended pathway: <span className="font-semibold text-foreground">{result.pathway.replaceAll("_", " ")}</span>
                    </p>
                    {result.categories ? (
                      <p className="text-sm text-muted-foreground">
                        Categories: {result.categories.join(", ")}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      <Button asChild className="rounded-full">
                        <a href="/admin">Open Admin Dashboard</a>
                      </Button>
                      <Button asChild variant="outline" className="rounded-full">
                        <a href={sessionId ? `/onboarding?sessionId=${encodeURIComponent(sessionId)}` : "/onboarding"}>
                          Open Full Form Intake
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  renderInput()
                )}
              </>
            )}
          </div>

          {mode === "full_intake" && !result ? (
            <div className="space-y-3 border-t border-primary/10 px-6 py-4">
              {sessionId ? (
                <Button asChild variant="outline" className="w-full rounded-full">
                  <a href={`/onboarding?sessionId=${encodeURIComponent(sessionId)}`}>Continue in Full Form</a>
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => {
                  saveSessionMutation.mutate(
                    { status: "paused", completionStatus: "in_progress" },
                    {
                      onSuccess: () => {
                        toast({
                          title: "Draft saved",
                          description: "You can return later from this device or from your signed-in account.",
                        });
                      },
                    },
                  );
                }}
              >
                <PauseCircle className="h-4 w-4" />
                Save and continue later
              </Button>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
