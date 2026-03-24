import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Download, FileText, Filter, ShieldCheck, Stethoscope, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type DashboardRole = "coach" | "physician" | "admin";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  pathway: string;
  requiresClearance: boolean;
  categories: string[];
  redFlags: number;
  physicianReviewStatus: string;
};

type ClientDetail = {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  disabilityFlag: boolean;
  pathway: { pathwayType: string; currentStatus: string; requiresClearance: boolean } | null;
  categories: Array<{ slug: string; label: string }>;
  flags: Array<{ id: string; flagType: string; severity: string; description: string }>;
  followUpTasks: Array<{ id: string; taskType: string; status: string; note: string; dueAt: string | null }>;
  physicianReviewStatus:
    | {
        consultationStatus: string;
        clearanceDecision: string;
        reviewSummary?: string;
        labRecommendations: Array<{ id: string; title: string; rationale: string; status: string }>;
      }
    | null;
  latestIntake:
    | {
        submittedAt: string;
        servicePreference: string;
        preferredPathway: string;
        screeningStage1?: {
          currentActivityLevel: string;
          weeklyActivityMinutes: number;
        };
        screeningStage2?: {
          details?: string | null;
        };
        wellnessHistory?: {
          sleepQuality: string;
          stressLoad: string;
          nutritionPattern: string;
          movementHistory: string;
          mentalWellbeing: string;
          primaryGoals: string;
          currentBarriers: string;
        };
      }
    | null;
};

type ChatbotSessionRow = {
  id: string;
  email: string | null;
  mode: string;
  status: string;
  completionStatus: string;
  progressPercent: number;
  recommendedPathway: string | null;
  routingReason: string | null;
  profileId: string | null;
  profileName: string | null;
  lastInteractionAt: string;
};

type FollowUpTaskRow = {
  id: string;
  profileId: string;
  clientName: string;
  taskType: string;
  status: string;
  note: string;
  dueAt: string | null;
};

type MembershipSummary = {
  counts: {
    free: number;
    tier1: number;
    tier2: number;
    tier3: number;
    corporateLeads: number;
  };
  members: Array<{
    email: string;
    firstName: string;
    lastName: string;
    currentTier: "free" | "tier1" | "tier2" | "tier3";
    recommendedTier: "free" | "tier1" | "tier2" | "tier3";
    stageOfChange: string;
    engagementScore: number;
    tierLabel: string;
    recommendedTierLabel: string;
    organizationName: string | null;
    metrics: {
      score: number;
      socialTouches: number;
      accountabilityTouches: number;
      milestoneCount: number;
    } | null;
  }>;
  upgradeHistory: Array<{
    id: string;
    email: string;
    fromTier: string | null;
    toTier: string;
    changedAt: string;
    reason: string;
  }>;
};

type CorporateLeadSummary = {
  leads: Array<{
    id: string;
    organizationName: string;
    contactName: string;
    contactEmail: string;
    teamSize: string;
    priorities: string;
    interestArea: string;
    status: string;
    createdAt: string;
  }>;
  enterpriseMetrics: {
    activeExecutiveMembers: number;
    organizations: number;
    avgExecutiveEngagement: number;
  };
};

async function fetchWithRole<T>(url: string, role: DashboardRole, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-user-role": role,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }

  return response as unknown as T;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [role, setRole] = useState<DashboardRole>("admin");
  const [category, setCategory] = useState("");
  const [pathway, setPathway] = useState("");
  const [redFlagOnly, setRedFlagOnly] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    consultationBookedAt: "",
    consultationStatus: "booked",
    clearanceDecision: "wellness_review_only",
    reviewSummary: "",
    labTitle: "",
    labRationale: "",
  });
  const [overrideForm, setOverrideForm] = useState({
    pathwayType: "fitness_pathway",
    note: "",
    followUpNote: "",
    dueAt: "",
  });
  const [membershipOverride, setMembershipOverride] = useState<Record<string, "free" | "tier1" | "tier2" | "tier3">>({});

  const categoriesQuery = useQuery<Array<{ slug: string; label: string }>>({
    queryKey: ["platform-categories"],
    queryFn: () => fetchWithRole("/api/platform/categories", role),
  });

  const clientsQuery = useQuery<ClientRow[]>({
    queryKey: ["platform-clients", role, category, pathway, redFlagOnly],
    queryFn: () =>
      fetchWithRole(
        `/api/platform/clients?category=${encodeURIComponent(category)}&pathway=${encodeURIComponent(pathway)}&redFlag=${redFlagOnly ? "1" : ""}`,
        role,
      ),
  });

  const selectedClientQuery = useQuery<ClientDetail>({
    queryKey: ["platform-client-detail", selectedClientId, role],
    queryFn: () => fetchWithRole(`/api/platform/clients/${selectedClientId}`, role),
    enabled: Boolean(selectedClientId),
  });

  const chatbotSessionsQuery = useQuery<ChatbotSessionRow[]>({
    queryKey: ["platform-chatbot-sessions", role],
    queryFn: () => fetchWithRole("/api/platform/chatbot/sessions", role),
  });

  const followUpTasksQuery = useQuery<FollowUpTaskRow[]>({
    queryKey: ["platform-follow-up-tasks", role],
    queryFn: () => fetchWithRole("/api/platform/follow-up-tasks", role),
  });

  const membershipSummaryQuery = useQuery<MembershipSummary>({
    queryKey: ["membership-summary"],
    queryFn: () => fetchWithRole("/api/membership/admin/summary", role),
  });

  const corporateLeadsQuery = useQuery<CorporateLeadSummary>({
    queryKey: ["corporate-leads"],
    queryFn: () => fetchWithRole("/api/membership/admin/corporate-leads", role),
  });

  const reviewMutation = useMutation({
    mutationFn: async () =>
      fetchWithRole("/api/platform/physician-reviews", role, {
        method: "POST",
        body: JSON.stringify({
          profileId: selectedClientId,
          consultationBookedAt: reviewForm.consultationBookedAt || undefined,
          consultationStatus: reviewForm.consultationStatus,
          clearanceDecision: reviewForm.clearanceDecision,
          reviewSummary: reviewForm.reviewSummary,
          labRecommendations:
            reviewForm.labTitle && reviewForm.labRationale
              ? [
                  {
                    title: reviewForm.labTitle,
                    rationale: reviewForm.labRationale,
                    status: "recommended",
                  },
                ]
              : [],
        }),
      }),
    onSuccess: () => {
      toast({
        title: "Physician review saved",
        description: "The consultation review and any lab recommendation notes were stored successfully.",
      });
      selectedClientQuery.refetch();
      clientsQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "Unable to save review",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const overrideMutation = useMutation({
    mutationFn: async () =>
      fetchWithRole("/api/platform/pathway-override", role, {
        method: "POST",
        body: JSON.stringify({
          profileId: selectedClientId,
          pathwayType: overrideForm.pathwayType,
          note: overrideForm.note,
          followUpNote: overrideForm.followUpNote,
          dueAt: overrideForm.dueAt || undefined,
        }),
      }),
    onSuccess: () => {
      toast({
        title: "Pathway override saved",
        description: "The pathway was updated and an open admin follow-up task was created for review.",
      });
      setOverrideForm((current) => ({ ...current, note: "", followUpNote: "", dueAt: "" }));
      selectedClientQuery.refetch();
      clientsQuery.refetch();
      followUpTasksQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "Unable to override pathway",
        description: error instanceof Error ? error.message : "Please review the override details and try again.",
        variant: "destructive",
      });
    },
  });

  const membershipChangeMutation = useMutation({
    mutationFn: async ({ email, targetTier }: { email: string; targetTier: "free" | "tier1" | "tier2" | "tier3" }) =>
      fetchWithRole("/api/membership/admin/change-tier", role, {
        method: "POST",
        body: JSON.stringify({
          email,
          targetTier,
          reason: "Adjusted from admin dashboard",
        }),
      }),
    onSuccess: () => {
      toast({
        title: "Membership tier updated",
        description: "The membership record and upgrade history were updated.",
      });
      membershipSummaryQuery.refetch();
    },
    onError: (error) => {
      toast({
        title: "Unable to update membership",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const stats = useMemo(() => {
    const clients = clientsQuery.data ?? [];
    return {
      total: clients.length,
      redFlags: clients.filter((item) => item.redFlags > 0).length,
      advanced: clients.filter((item) => item.pathway !== "fitness_pathway").length,
    };
  }, [clientsQuery.data]);

  const exportCsv = async () => {
    const response = await fetch("/api/platform/clients/export.csv", {
      headers: { "x-user-role": role },
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/80">Admin Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
              Intake review, pathway oversight, and physician workflow
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              This dashboard lets coach, physician, and admin roles review clients, apply category and pathway filters, export records, and access PDF summaries.
            </p>
          </div>
          <div className="flex gap-3">
            {(["coach", "physician", "admin"] as DashboardRole[]).map((value) => (
              <Button key={value} variant={role === value ? "default" : "outline"} className="rounded-full" onClick={() => setRole(value)}>
                {value}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardDescription>Total clients</CardDescription>
              <CardTitle>{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardDescription>Flagged records</CardDescription>
              <CardTitle>{stats.redFlags}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardDescription>Advanced or clearance pathway</CardDescription>
              <CardTitle>{stats.advanced}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardDescription>Tier 2 members</CardDescription>
              <CardTitle>{membershipSummaryQuery.data?.counts.tier2 ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardDescription>Tier 3 executive members</CardDescription>
              <CardTitle>{membershipSummaryQuery.data?.counts.tier3 ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardDescription>Corporate leads</CardDescription>
              <CardTitle>{membershipSummaryQuery.data?.counts.corporateLeads ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Category</Label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm">
                    <option value="">All categories</option>
                    {categoriesQuery.data?.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Pathway</Label>
                  <select value={pathway} onChange={(e) => setPathway(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm">
                    <option value="">All pathways</option>
                    <option value="fitness_pathway">Fitness Pathway</option>
                    <option value="advanced_wellness_pathway">Advanced Wellness Pathway</option>
                    <option value="needs_medical_clearance">Needs Medical Clearance</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-primary/10 bg-[#fcfbf8] px-4 py-3">
                  <span className="text-sm font-medium">Show red flags only</span>
                  <Button variant={redFlagOnly ? "default" : "outline"} className="rounded-full" onClick={() => setRedFlagOnly((current) => !current)}>
                    {redFlagOnly ? "On" : "Off"}
                  </Button>
                </div>
                <div className="sm:col-span-2">
                  <Button className="rounded-full" onClick={exportCsv}>
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="text-2xl">Clients</CardTitle>
                <CardDescription>Filtered onboarding records with pathway and review status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clientsQuery.data?.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
                      selectedClientId === client.id ? "border-primary bg-[#f8f5ef]" : "border-primary/10 bg-white hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold text-foreground">{client.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{client.email}</div>
                      </div>
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                        {client.pathway.replaceAll("_", " ")}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {client.categories.map((entry) => (
                        <span key={entry} className="rounded-full bg-[#eef3ec] px-3 py-1">
                          {entry}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Flags: {client.redFlags}</span>
                      <span>Review: {client.physicianReviewStatus}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="text-2xl">Chatbot intakes</CardTitle>
                <CardDescription>Sessions started through the guided intake assistant, including progress and recommended routing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chatbotSessionsQuery.data?.map((session) => (
                  <div key={session.id} className="rounded-[1.25rem] border border-primary/10 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {session.profileName ?? session.email ?? "Guest preview session"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {session.recommendedPathway ?? "No recommendation yet"} • {session.progressPercent}% complete
                        </div>
                      </div>
                      <Button asChild variant="outline" className="rounded-full">
                        <a href={`/api/platform/chatbot/session/${session.id}/summary.pdf`} target="_blank" rel="noreferrer">
                          PDF
                        </a>
                      </Button>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{session.routingReason ?? "No routing reason recorded yet."}</p>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Last interaction: {new Date(session.lastInteractionAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="text-2xl">Follow-up queue</CardTitle>
                <CardDescription>Admin-created follow-up items that still need review or outreach.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {followUpTasksQuery.data?.length ? (
                  followUpTasksQuery.data.map((task) => (
                    <div key={task.id} className="rounded-[1.25rem] border border-primary/10 bg-white p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{task.clientName}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-primary/80">{task.taskType.replaceAll("_", " ")}</div>
                        </div>
                        <div className="rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                          {task.status}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{task.note}</p>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Due: {task.dueAt ? new Date(task.dueAt).toLocaleString() : "No due date set"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-primary/20 bg-[#fcfbf8] p-5 text-sm text-muted-foreground">
                    No follow-up tasks have been created yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="h-5 w-5" />
                  Membership engine
                </CardTitle>
                <CardDescription>Tier assignments, stage-of-change mapping, and upgrade controls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {membershipSummaryQuery.data?.members.map((member) => (
                  <div key={member.email} className="rounded-[1.25rem] border border-primary/10 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{member.email}</div>
                      </div>
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                        {member.tierLabel}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                      <div>Stage: {member.stageOfChange}</div>
                      <div>Engagement: {member.engagementScore}</div>
                      <div>Recommended: {member.recommendedTierLabel}</div>
                      <div>Organization: {member.organizationName ?? "Individual"}</div>
                    </div>
                    {member.metrics ? (
                      <div className="mt-3 rounded-xl bg-[#fcfbf8] p-4 text-xs text-muted-foreground">
                        Social touches {member.metrics.socialTouches} • Accountability touches {member.metrics.accountabilityTouches} • Milestones {member.metrics.milestoneCount}
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <select
                        value={membershipOverride[member.email] ?? member.currentTier}
                        onChange={(event) =>
                          setMembershipOverride((current) => ({
                            ...current,
                            [member.email]: event.target.value as "free" | "tier1" | "tier2" | "tier3",
                          }))
                        }
                        className="h-11 rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm"
                      >
                        <option value="free">Free</option>
                        <option value="tier1">Tier 1</option>
                        <option value="tier2">Tier 2</option>
                        <option value="tier3">Tier 3</option>
                      </select>
                      <Button
                        className="rounded-full"
                        onClick={() =>
                          membershipChangeMutation.mutate({
                            email: member.email,
                            targetTier: membershipOverride[member.email] ?? member.currentTier,
                          })
                        }
                        disabled={membershipChangeMutation.isPending}
                      >
                        Save tier
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="text-2xl">Client detail</CardTitle>
                <CardDescription>Screening responses, pathway assignment, PDF output, and physician review workflow.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {!selectedClientQuery.data ? (
                  <div className="rounded-[1.25rem] border border-dashed border-primary/20 bg-[#fcfbf8] p-8 text-center text-muted-foreground">
                    Select a client to review the full onboarding record.
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">{selectedClientQuery.data.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedClientQuery.data.email} • Age {selectedClientQuery.data.age} • {selectedClientQuery.data.gender}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild variant="outline" className="rounded-full">
                          <a href={`/api/platform/clients/${selectedClientQuery.data.id}/intake-summary.pdf`} target="_blank" rel="noreferrer">
                            <FileText className="h-4 w-4" />
                            View PDF
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f8f5ef] p-5">
                        <p className="text-sm uppercase tracking-[0.18em] text-primary/70">Pathway</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {selectedClientQuery.data.pathway?.pathwayType ?? "Unassigned"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedClientQuery.data.pathway?.currentStatus ?? "No status"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f8f5ef] p-5">
                        <p className="text-sm uppercase tracking-[0.18em] text-primary/70">Categories</p>
                        <p className="mt-2 text-base text-muted-foreground">
                          {selectedClientQuery.data.categories.map((item) => item.label).join(", ") || "None"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-primary/10 p-5">
                      <h3 className="text-lg font-semibold">Screening overview</h3>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-[#fcfbf8] p-4 text-sm text-muted-foreground">
                          Activity level: {selectedClientQuery.data.latestIntake?.screeningStage1?.currentActivityLevel ?? "N/A"}
                        </div>
                        <div className="rounded-xl bg-[#fcfbf8] p-4 text-sm text-muted-foreground">
                          Weighted activity: {selectedClientQuery.data.latestIntake?.screeningStage1?.weeklyActivityMinutes ?? 0} minutes
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {selectedClientQuery.data.flags.map((flag) => (
                          <div key={flag.id} className="rounded-xl bg-[#fcfbf8] p-4 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{flag.flagType}</span> ({flag.severity}): {flag.description}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-primary/10 p-5">
                      <h3 className="text-lg font-semibold">Open follow-up tasks</h3>
                      {selectedClientQuery.data.followUpTasks.length ? (
                        <div className="mt-4 space-y-3">
                          {selectedClientQuery.data.followUpTasks.map((task) => (
                            <div key={task.id} className="rounded-xl bg-[#fcfbf8] p-4 text-sm text-muted-foreground">
                              <div className="font-semibold text-foreground">
                                {task.taskType.replaceAll("_", " ")} • {task.status}
                              </div>
                              <div className="mt-1">{task.note}</div>
                              <div className="mt-2 text-xs">
                                Due: {task.dueAt ? new Date(task.dueAt).toLocaleString() : "No due date set"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">No follow-up tasks are open for this client yet.</p>
                      )}
                    </div>

                    {(role === "physician" || role === "admin") && selectedClientId ? (
                      <Card className="rounded-[1.5rem] border-primary/10">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <Stethoscope className="h-5 w-5" />
                            Physician review workflow
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <Label>Consultation booked at</Label>
                              <Input type="datetime-local" value={reviewForm.consultationBookedAt} onChange={(e) => setReviewForm((c) => ({ ...c, consultationBookedAt: e.target.value }))} className="mt-2 h-12 rounded-2xl" />
                            </div>
                            <div>
                              <Label>Consultation status</Label>
                              <select value={reviewForm.consultationStatus} onChange={(e) => setReviewForm((c) => ({ ...c, consultationStatus: e.target.value }))} className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm">
                                <option value="not_booked">Not booked</option>
                                <option value="booked">Booked</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label>Clearance decision</Label>
                            <select value={reviewForm.clearanceDecision} onChange={(e) => setReviewForm((c) => ({ ...c, clearanceDecision: e.target.value }))} className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm">
                              <option value="no_review_needed">No review needed</option>
                              <option value="wellness_review_only">Wellness review only</option>
                              <option value="medical_clearance_needed">Medical clearance needed</option>
                            </select>
                          </div>
                          <div>
                            <Label>Review summary</Label>
                            <Textarea value={reviewForm.reviewSummary} onChange={(e) => setReviewForm((c) => ({ ...c, reviewSummary: e.target.value }))} className="mt-2 min-h-28 rounded-2xl" />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <Label>Lab recommendation title</Label>
                              <Input value={reviewForm.labTitle} onChange={(e) => setReviewForm((c) => ({ ...c, labTitle: e.target.value }))} className="mt-2 h-12 rounded-2xl" />
                            </div>
                            <div>
                              <Label>Lab rationale</Label>
                              <Input value={reviewForm.labRationale} onChange={(e) => setReviewForm((c) => ({ ...c, labRationale: e.target.value }))} className="mt-2 h-12 rounded-2xl" />
                            </div>
                          </div>
                          <Button className="rounded-full" onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
                            <ShieldCheck className="h-4 w-4" />
                            {reviewMutation.isPending ? "Saving..." : "Save physician review"}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : null}

                    {role === "admin" && selectedClientId ? (
                      <Card className="rounded-[1.5rem] border-primary/10">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <ShieldCheck className="h-5 w-5" />
                            Admin pathway override
                          </CardTitle>
                          <CardDescription>
                            Overrides require admin review notes and automatically create a follow-up task for outreach or internal check-in.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Override pathway</Label>
                            <select
                              value={overrideForm.pathwayType}
                              onChange={(e) => setOverrideForm((current) => ({ ...current, pathwayType: e.target.value }))}
                              className="mt-2 h-12 w-full rounded-2xl border border-primary/10 bg-[#fcfbf8] px-3 text-sm"
                            >
                              <option value="fitness_pathway">Fitness Pathway</option>
                              <option value="advanced_wellness_pathway">Advanced Wellness Pathway</option>
                              <option value="needs_medical_clearance">Needs Medical Clearance / Review</option>
                            </select>
                          </div>
                          <div>
                            <Label>Admin review note</Label>
                            <Textarea
                              value={overrideForm.note}
                              onChange={(e) => setOverrideForm((current) => ({ ...current, note: e.target.value }))}
                              className="mt-2 min-h-24 rounded-2xl"
                              placeholder="Explain why the pathway is being adjusted."
                            />
                          </div>
                          <div>
                            <Label>Required follow-up note</Label>
                            <Textarea
                              value={overrideForm.followUpNote}
                              onChange={(e) => setOverrideForm((current) => ({ ...current, followUpNote: e.target.value }))}
                              className="mt-2 min-h-24 rounded-2xl"
                              placeholder="Describe the follow-up action that still needs to happen."
                            />
                          </div>
                          <div>
                            <Label>Follow-up due at</Label>
                            <Input
                              type="datetime-local"
                              value={overrideForm.dueAt}
                              onChange={(e) => setOverrideForm((current) => ({ ...current, dueAt: e.target.value }))}
                              className="mt-2 h-12 rounded-2xl"
                            />
                          </div>
                          <Button className="rounded-full" onClick={() => overrideMutation.mutate()} disabled={overrideMutation.isPending}>
                            {overrideMutation.isPending ? "Saving override..." : "Save override and create follow-up"}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="h-5 w-5" />
                  Corporate pipeline
                </CardTitle>
                <CardDescription>Executive membership metrics and enterprise lead capture.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#f8f5ef] p-4 text-sm text-muted-foreground">
                    Executive members
                    <div className="mt-2 text-2xl font-semibold text-foreground">
                      {corporateLeadsQuery.data?.enterpriseMetrics.activeExecutiveMembers ?? 0}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#f8f5ef] p-4 text-sm text-muted-foreground">
                    Organizations
                    <div className="mt-2 text-2xl font-semibold text-foreground">
                      {corporateLeadsQuery.data?.enterpriseMetrics.organizations ?? 0}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#f8f5ef] p-4 text-sm text-muted-foreground">
                    Avg. executive engagement
                    <div className="mt-2 text-2xl font-semibold text-foreground">
                      {corporateLeadsQuery.data?.enterpriseMetrics.avgExecutiveEngagement ?? 0}
                    </div>
                  </div>
                </div>

                {corporateLeadsQuery.data?.leads.length ? (
                  corporateLeadsQuery.data.leads.map((lead) => (
                    <div key={lead.id} className="rounded-[1.25rem] border border-primary/10 bg-white p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{lead.organizationName}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {lead.contactName} • {lead.contactEmail}
                          </div>
                        </div>
                        <div className="rounded-full bg-[#eef3ec] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                          {lead.status}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        {lead.teamSize} people • {lead.interestArea}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{lead.priorities}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-primary/20 bg-[#fcfbf8] p-5 text-sm text-muted-foreground">
                    No corporate leads have been submitted yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
