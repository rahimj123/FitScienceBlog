import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  FlaskConical,
  Loader2,
  Plus,
  RefreshCcw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/landing/Navbar";
import { LandingFooter } from "@/components/landing/Footer";
import { useAuth } from "@/components/platform/AuthProvider";

// ── Types ─────────────────────────────────────────────────────────────────────
interface LabTest {
  id: string;
  testName: string;
  testType: string;
  status: string;
  scheduledAt: string | null;
  completedAt: string | null;
  notes: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700", icon: CalendarClock },
  sample_collected: { label: "Sample Collected", color: "bg-purple-50 text-purple-700", icon: FlaskConical },
  processing: { label: "Processing", color: "bg-amber-50 text-amber-700", icon: Loader2 },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
};

const TYPE_LABELS: Record<string, string> = {
  annual: "Annual Panel",
  follow_up: "Follow-up",
  on_demand: "On-Demand",
};

const SUGGESTED_PANELS = [
  { name: "Essential Wellness Panel", type: "annual", description: "Comprehensive metabolic, lipid, thyroid, and nutrient markers." },
  { name: "Hormone & Energy Panel", type: "on_demand", description: "Testosterone, cortisol, DHEA-S, thyroid — ideal for fatigue or body composition concerns." },
  { name: "Cardiovascular Deep Dive", type: "follow_up", description: "hsCRP, homocysteine, advanced lipid panel, and blood glucose markers." },
  { name: "Nutrient Deficiency Panel", type: "on_demand", description: "Vitamin D, B12, ferritin, magnesium, zinc, and omega-3 index." },
  { name: "Metabolic Health Panel", type: "follow_up", description: "Fasting glucose, HbA1c, fasting insulin, and HOMA-IR." },
];

// ── Schedule Form ─────────────────────────────────────────────────────────────
function ScheduleForm({
  profileId,
  onSuccess,
}: {
  profileId: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [testName, setTestName] = useState("");
  const [testType, setTestType] = useState<"annual" | "follow_up" | "on_demand">("annual");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/wellness/lab-tests", {
        profileId,
        testName,
        testType,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        notes: notes || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/wellness/lab-tests/${profileId}`] });
      toast({ title: "Test scheduled!" });
      onSuccess();
    },
    onError: () => toast({ title: "Failed to schedule test", variant: "destructive" }),
  });

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-primary/10 bg-white p-6">
      <h3 className="font-bold text-foreground">Schedule a new test</h3>
      <div>
        <Label className="mb-1.5 block text-sm font-semibold">Test name</Label>
        <Input
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="e.g. Essential Wellness Panel"
          className="h-11 rounded-2xl"
        />
      </div>
      <div>
        <Label className="mb-1.5 block text-sm font-semibold">Test type</Label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value as typeof testType)}
          className="h-11 w-full rounded-2xl border border-primary/10 bg-white px-3 text-sm"
        >
          <option value="annual">Annual Panel</option>
          <option value="follow_up">Follow-up</option>
          <option value="on_demand">On-Demand</option>
        </select>
      </div>
      <div>
        <Label className="mb-1.5 block text-sm font-semibold">Preferred date (optional)</Label>
        <Input
          type="date"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="h-11 rounded-2xl"
        />
      </div>
      <div>
        <Label className="mb-1.5 block text-sm font-semibold">Notes (optional)</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions or context…"
          className="h-11 rounded-2xl"
        />
      </div>
      <Button
        className="w-full rounded-full"
        onClick={() => scheduleMutation.mutate()}
        disabled={!testName || scheduleMutation.isPending}
      >
        {scheduleMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Schedule test
      </Button>
    </div>
  );
}

// ── Test Card ─────────────────────────────────────────────────────────────────
function TestCard({ test, onUpdateStatus }: { test: LabTest; onUpdateStatus: (id: string, status: string) => void }) {
  const cfg = STATUS_CONFIG[test.status] ?? STATUS_CONFIG.scheduled;
  const Icon = cfg.icon;
  const nextStatus: Record<string, string> = {
    scheduled: "sample_collected",
    sample_collected: "processing",
    processing: "completed",
  };
  const next = nextStatus[test.status];

  return (
    <div className="rounded-[1.75rem] border border-primary/10 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(33,56,45,0.1)]">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${cfg.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-foreground">{test.testName}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {TYPE_LABELS[test.testType] ?? test.testType}
            {test.scheduledAt ? ` · Scheduled ${formatDate(test.scheduledAt)}` : ""}
            {test.completedAt ? ` · Completed ${formatDate(test.completedAt)}` : ""}
          </p>
          {test.notes && <p className="mt-1 text-xs text-muted-foreground italic">{test.notes}</p>}
        </div>
      </div>
      {next && (
        <div className="mt-3 flex justify-end border-t border-primary/5 pt-3">
          <button
            onClick={() => onUpdateStatus(test.id, next)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15 transition"
          >
            <RefreshCcw className="h-3 w-3" />
            Mark as {STATUS_CONFIG[next]?.label}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LabTests() {
  const { user } = useAuth();
  const profileId = (user as any)?.profileId ?? "demo";
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: labTests = [], isLoading } = useQuery<LabTest[]>({
    queryKey: [`/api/wellness/lab-tests/${profileId}`],
    enabled: !!profileId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/wellness/lab-tests/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/wellness/lab-tests/${profileId}`] }),
    onError: () => toast({ title: "Failed to update test status", variant: "destructive" }),
  });

  const upcoming = labTests.filter((t) => t.status !== "completed");
  const completed = labTests.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Navbar />
      <main className="container-custom py-12 sm:py-16">
        {/* Back nav */}
        <div className="mb-4">
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </a>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">Lab Tests</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Testing centre</h1>
            <p className="mt-2 max-w-xl text-lg text-muted-foreground">
              Schedule annual panels, follow-up tests, and on-demand draws. Track every step from booking to results.
            </p>
          </div>
          <Button
            className="rounded-full"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Schedule a test
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Schedule form */}
            {showForm && (
              <ScheduleForm profileId={profileId} onSuccess={() => setShowForm(false)} />
            )}

            {/* Upcoming / in-progress */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Upcoming & in progress
                {upcoming.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                    {upcoming.length}
                  </span>
                )}
              </h2>
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tests…</div>
              ) : upcoming.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-10 text-center">
                  <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 font-semibold text-foreground">No tests scheduled</p>
                  <p className="mt-1 text-sm text-muted-foreground">Click "Schedule a test" above to book your first panel.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((t) => (
                    <TestCard
                      key={t.id}
                      test={t}
                      onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Completed */}
            {completed.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-foreground">Completed tests</h2>
                <div className="space-y-4">
                  {completed.map((t) => (
                    <TestCard
                      key={t.id}
                      test={t}
                      onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: suggested panels */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-foreground">Suggested panels</h2>
            <div className="space-y-3">
              {SUGGESTED_PANELS.map((panel) => (
                <button
                  key={panel.name}
                  onClick={() => setShowForm(true)}
                  className="group w-full rounded-[1.5rem] border border-primary/10 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{panel.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{panel.description}</p>
                      <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        panel.type === "annual" ? "bg-blue-50 text-blue-700" :
                        panel.type === "follow_up" ? "bg-purple-50 text-purple-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {TYPE_LABELS[panel.type]}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Info card */}
            <div className="rounded-[1.75rem] border border-primary/10 bg-[#eef3ec] p-5">
              <Zap className="h-5 w-5 text-primary" />
              <p className="mt-2 text-sm font-bold text-foreground">Testing cadence</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li className="flex gap-2"><span>·</span> Annual: once per year for baseline tracking</li>
                <li className="flex gap-2"><span>·</span> Follow-up: 3–6 months after interventions</li>
                <li className="flex gap-2"><span>·</span> On-demand: when specific symptoms arise</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
