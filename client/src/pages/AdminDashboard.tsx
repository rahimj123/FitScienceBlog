import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, FileText, Filter, ShieldCheck, Stethoscope } from "lucide-react";
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
                  </>
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
