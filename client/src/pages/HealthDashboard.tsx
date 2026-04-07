import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Dumbbell,
  HeartPulse,
  Leaf,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/landing/Navbar";
import { LandingFooter } from "@/components/landing/Footer";
import { useAuth } from "@/components/platform/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Types ────────────────────────────────────────────────────────────────────
interface HealthSummary {
  profileId: string;
  totalBiomarkersTested: number;
  inRangeCount: number;
  outOfRangeCount: number;
  percentInRange: number | null;
  latestResults: LatestResult[];
  lastTestCompletedAt: string | null;
  nextTestScheduledAt: string | null;
  nextTestName: string | null;
}

interface LatestResult {
  id: string;
  value: number;
  status: string;
  testedAt: string;
  biomarker: {
    name: string;
    slug: string;
    unit: string;
    category: { name: string; colorHex: string | null; icon: string | null };
  };
}

interface UserProtocol {
  id: string;
  status: string;
  startedAt: string;
  adherenceScore: number | null;
  protocol: {
    title: string;
    protocolType: string;
    goal: string | null;
    durationWeeks: number | null;
  };
}

const DEMO_HEALTH_SUMMARY: HealthSummary = {
  profileId: "demo",
  totalBiomarkersTested: 12,
  inRangeCount: 9,
  outOfRangeCount: 3,
  percentInRange: 75,
  latestResults: [
    {
      id: "demo-hba1c",
      value: 5.9,
      status: "high",
      testedAt: "2026-03-10T10:00:00.000Z",
      biomarker: {
        name: "HbA1c",
        slug: "hba1c",
        unit: "%",
        category: { name: "Metabolic", colorHex: "#f59e0b", icon: null },
      },
    },
    {
      id: "demo-ldl",
      value: 132,
      status: "high",
      testedAt: "2026-03-10T10:00:00.000Z",
      biomarker: {
        name: "LDL Cholesterol",
        slug: "ldl-cholesterol",
        unit: "mg/dL",
        category: { name: "Cardiovascular", colorHex: "#ef4444", icon: null },
      },
    },
    {
      id: "demo-vitd",
      value: 24,
      status: "low",
      testedAt: "2026-03-10T10:00:00.000Z",
      biomarker: {
        name: "Vitamin D",
        slug: "vitamin-d",
        unit: "ng/mL",
        category: { name: "Micronutrients", colorHex: "#3b82f6", icon: null },
      },
    },
    {
      id: "demo-fg",
      value: 94,
      status: "in_range",
      testedAt: "2026-03-10T10:00:00.000Z",
      biomarker: {
        name: "Fasting Glucose",
        slug: "fasting-glucose",
        unit: "mg/dL",
        category: { name: "Metabolic", colorHex: "#10b981", icon: null },
      },
    },
  ],
  lastTestCompletedAt: "2026-03-10T10:00:00.000Z",
  nextTestScheduledAt: "2026-05-12T10:00:00.000Z",
  nextTestName: "Metabolic Follow-up Panel",
};

const DEMO_PROTOCOLS: UserProtocol[] = [
  {
    id: "demo-protocol-1",
    status: "active",
    startedAt: "2026-03-12T10:00:00.000Z",
    adherenceScore: 82,
    protocol: {
      title: "Metabolic Reset Protocol",
      protocolType: "nutrition",
      goal: "Improve glucose and lipid markers",
      durationWeeks: 12,
    },
  },
  {
    id: "demo-protocol-2",
    status: "active",
    startedAt: "2026-03-20T10:00:00.000Z",
    adherenceScore: 76,
    protocol: {
      title: "Strength and Mobility Foundation",
      protocolType: "exercise",
      goal: "Build consistency and reduce sedentary load",
      durationWeeks: 8,
    },
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusColor(status: string) {
  switch (status) {
    case "in_range": return "text-emerald-600 bg-emerald-50";
    case "low": return "text-amber-600 bg-amber-50";
    case "high": return "text-amber-600 bg-amber-50";
    case "critical_low": return "text-red-600 bg-red-50";
    case "critical_high": return "text-red-600 bg-red-50";
    default: return "text-slate-500 bg-slate-50";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "in_range": return "In Range";
    case "low": return "Low";
    case "high": return "High";
    case "critical_low": return "Critical Low";
    case "critical_high": return "Critical High";
    default: return "Unknown";
  }
}

function protocolIcon(type: string) {
  switch (type) {
    case "nutrition": return Leaf;
    case "supplement": return Zap;
    case "exercise": return Dumbbell;
    case "sleep": return Clock;
    case "whole_body": return Activity;
    default: return Activity;
  }
}

function protocolColor(type: string) {
  switch (type) {
    case "nutrition": return "bg-emerald-50 text-emerald-700";
    case "supplement": return "bg-purple-50 text-purple-700";
    case "exercise": return "bg-blue-50 text-blue-700";
    case "sleep": return "bg-indigo-50 text-indigo-700";
    case "whole_body": return "bg-orange-50 text-orange-700";
    default: return "bg-slate-50 text-slate-700";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildClientSummary(summary: HealthSummary, activeProtocols: UserProtocol[]) {
  const inRangePct = summary.percentInRange ?? 0;
  const markersNeedingAttention = summary.latestResults.filter((r) => r.status !== "in_range");
  const markerNames = markersNeedingAttention.slice(0, 3).map((r) => r.biomarker.name);
  const keyMarkerText = markerNames.length > 0 ? markerNames.join(", ") : "no critical markers at this time";
  const nextTestDate = summary.nextTestScheduledAt ? formatDate(summary.nextTestScheduledAt) : "not yet scheduled";

  const text = `Current status: ${summary.inRangeCount} of ${summary.totalBiomarkersTested} biomarkers are in range (${inRangePct}%). This indicates a strong baseline with clear opportunities to improve a few markers over the next cycle. The latest review shows attention is needed for ${keyMarkerText}. Your active plan includes ${activeProtocols.length} protocol${activeProtocols.length === 1 ? "" : "s"}, which supports steady progress through nutrition, movement, and behavior consistency. The next lab checkpoint is ${nextTestDate}, which should be used to confirm trend direction rather than judge progress from one data point alone. Overall, momentum is positive; the main focus now is improving execution quality week by week so out-of-range markers move toward target values while maintaining strengths that are already in range.`;

  const pointers = [
    "Follow your active protocols at least 5 days per week and track adherence honestly.",
    "Prioritize sleep and movement consistency before adding extra complexity.",
    "Prepare for your next lab test in advance and compare trends, not single values.",
    "If symptoms change or energy drops, report early so your plan can be adjusted.",
  ];

  return { text, pointers };
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(33,56,45,0.15)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-4xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Timeline Step ────────────────────────────────────────────────────────────
function TimelineStep({
  label,
  date,
  status,
  isLast,
}: {
  label: string;
  date: string;
  status: "completed" | "upcoming" | "pending";
  isLast?: boolean;
}) {
  const dotColor =
    status === "completed" ? "bg-emerald-500" :
    status === "upcoming" ? "bg-primary" : "bg-slate-300";
  const lineColor = status === "completed" ? "bg-emerald-200" : "bg-slate-100";
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`h-4 w-4 rounded-full ring-2 ring-white ${dotColor}`} />
        {!isLast && <div className={`mt-1 w-0.5 flex-1 ${lineColor}`} />}
      </div>
      <div className="pb-6">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}

// ── Quick Action Card ────────────────────────────────────────────────────────
function QuickAction({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <a className="group flex items-start gap-4 rounded-[1.5rem] border border-primary/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-24px_rgba(33,56,45,0.2)]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition group-hover:text-primary" />
      </a>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HealthDashboard() {
  const { user } = useAuth();
  const profileId = (user as any)?.profileId ?? "demo";

  const { data: summary, isLoading: summaryLoading } = useQuery<HealthSummary>({
    queryKey: [`/api/wellness/health-summary/${profileId}`],
    enabled: !!profileId,
  });

  const { data: userProtocols = [] } = useQuery<UserProtocol[]>({
    queryKey: [`/api/wellness/user-protocols/${profileId}`],
    enabled: !!profileId,
  });

  const fallbackSummary = !summary || summary.totalBiomarkersTested === 0 ? DEMO_HEALTH_SUMMARY : summary;
  const protocolSource = userProtocols.length > 0 ? userProtocols : DEMO_PROTOCOLS;
  const activeProtocols = protocolSource.filter((p) => p.status === "active");

  // Derived values
  const pct = fallbackSummary.percentInRange ?? null;
  const inRangeDisplay = pct !== null ? `${pct}%` : "—";
  const totalTested = fallbackSummary.totalBiomarkersTested ?? 0;
  const outOfRange = fallbackSummary.outOfRangeCount ?? 0;

  // Top out-of-range markers for the alert strip
  const alertMarkers = (fallbackSummary.latestResults ?? [])
    .filter((r) => r.status !== "in_range")
    .slice(0, 4);

  const clientSummary = buildClientSummary(fallbackSummary, activeProtocols);

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Navbar />
      <main className="container-custom py-12 sm:py-16">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">Health Dashboard</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Your health at a glance
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            A unified view of your biomarkers, active protocols, lab timeline, and wellness team — updated after every test.
          </p>
        </div>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full bg-white p-1 shadow-sm">
            <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
            <TabsTrigger value="summary" className="rounded-full">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
        {/* ── Hero Metric Cards ──────────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Biomarkers in Range"
            value={summaryLoading && !summary ? "…" : inRangeDisplay}
            sub={totalTested > 0 ? `${fallbackSummary.inRangeCount} of ${totalTested} tested` : "No results yet"}
            icon={CheckCircle2}
            colorClass="bg-emerald-100 text-emerald-700"
          />
          <StatCard
            label="Out of Range"
            value={summaryLoading && !summary ? "…" : outOfRange}
            sub={outOfRange > 0 ? "Review your biomarker report" : "All results look good"}
            icon={AlertTriangle}
            colorClass={outOfRange > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}
          />
          <StatCard
            label="Active Protocols"
            value={activeProtocols.length}
            sub={activeProtocols.length > 0 ? activeProtocols[0].protocol.title : "No active protocols"}
            icon={ClipboardList}
            colorClass="bg-blue-100 text-blue-700"
          />
          <StatCard
            label="Last Test"
            value={summaryLoading && !summary ? "…" : (fallbackSummary.lastTestCompletedAt ? formatDate(fallbackSummary.lastTestCompletedAt) : "None yet")}
            sub={fallbackSummary.nextTestName ? `Next: ${fallbackSummary.nextTestName}` : "Schedule your first test"}
            icon={CalendarCheck}
            colorClass="bg-purple-100 text-purple-700"
          />
        </div>

        {/* ── Alert Strip ───────────────────────────────────────────────── */}
        {alertMarkers.length > 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-wrap items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  {alertMarkers.length} biomarker{alertMarkers.length > 1 ? "s" : ""} need attention
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {alertMarkers.map((r) => (
                    <Link key={r.id} href={`/biomarkers/${r.biomarker.slug}`}>
                      <a className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm ring-1 ring-amber-200 hover:ring-amber-400">
                        {r.biomarker.name}
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${statusColor(r.status)}`}>
                          {statusLabel(r.status)}
                        </span>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/biomarkers">
                <a className="shrink-0 text-sm font-semibold text-amber-700 hover:underline">View all →</a>
              </Link>
            </div>
          </div>
        )}

        {/* ── Main Grid ─────────────────────────────────────────────────── */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* Left column: Quick Actions + Protocols */}
          <div className="space-y-6 lg:col-span-2">

            {/* Quick Actions */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-foreground">Quick actions</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <QuickAction
                  href="/lab-tests"
                  icon={CalendarCheck}
                  label="Book a lab test"
                  description="Schedule annual, follow-up, or on-demand testing"
                />
                <QuickAction
                  href="/biomarkers"
                  icon={HeartPulse}
                  label="View biomarker report"
                  description="Explore all results by system — heart, hormones, nutrients and more"
                />
                <QuickAction
                  href="/protocols"
                  icon={ClipboardList}
                  label="Browse protocols"
                  description="Nutrition, sleep, exercise and supplement programs"
                />
                <QuickAction
                  href="/providers"
                  icon={Users}
                  label="Find a wellness provider"
                  description="Connect with doctors, trainers, and nutritionists"
                />
              </div>
            </section>

            {/* Active Protocols */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Active protocols</h2>
                <Link href="/protocols">
                  <a className="text-sm font-semibold text-primary hover:underline">
                    View all <ArrowRight className="inline h-3 w-3" />
                  </a>
                </Link>
              </div>
              {activeProtocols.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-8 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 font-semibold text-foreground">No active protocols yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Browse the protocol library and assign one to get started.</p>
                  <Button asChild className="mt-4 rounded-full" size="sm">
                    <Link href="/protocols"><a>Browse protocols</a></Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProtocols.map((up) => {
                    const Icon = protocolIcon(up.protocol.protocolType);
                    const colorClass = protocolColor(up.protocol.protocolType);
                    return (
                      <div
                        key={up.id}
                        className="flex items-center gap-4 rounded-[1.5rem] border border-primary/10 bg-white p-5"
                      >
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold text-foreground">{up.protocol.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Started {formatDate(up.startedAt)}
                            {up.protocol.durationWeeks ? ` · ${up.protocol.durationWeeks} weeks` : ""}
                          </p>
                        </div>
                        {up.adherenceScore !== null && (
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-foreground">{up.adherenceScore}%</p>
                            <p className="text-[10px] text-muted-foreground">adherence</p>
                          </div>
                        )}
                        <Badge variant="secondary" className="capitalize shrink-0">
                          {up.protocol.protocolType.replace("_", " ")}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recent Biomarker Results */}
            {(fallbackSummary.latestResults ?? []).length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Latest biomarker snapshot</h2>
                  <Link href="/biomarkers">
                    <a className="text-sm font-semibold text-primary hover:underline">
                      Full report <ArrowRight className="inline h-3 w-3" />
                    </a>
                  </Link>
                </div>
                <div className="overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/5 bg-[#fcfbf8]">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Biomarker</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">System</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {(fallbackSummary.latestResults ?? []).slice(0, 8).map((r) => (
                        <tr key={r.id} className="group hover:bg-[#fcfbf8]">
                          <td className="px-5 py-3">
                            <Link href={`/biomarkers/${r.biomarker.slug}`}>
                              <a className="font-medium text-foreground hover:text-primary hover:underline">
                                {r.biomarker.name}
                              </a>
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{r.biomarker.category.name}</td>
                          <td className="px-5 py-3 text-right font-mono font-semibold text-foreground">
                            {r.value} {r.biomarker.unit}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(r.status)}`}>
                              {statusLabel(r.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Right column: Lab Timeline + Provider snapshot */}
          <div className="space-y-6">

            {/* Lab Timeline */}
            <section className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(33,56,45,0.12)]">
              <h2 className="font-bold text-foreground">Lab timeline</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your test journey from collection to insights.</p>
              <div className="mt-6">
                {fallbackSummary.lastTestCompletedAt ? (
                  <>
                    <TimelineStep
                      label="Annual panel completed"
                      date={formatDate(fallbackSummary.lastTestCompletedAt)}
                      status="completed"
                    />
                    <TimelineStep
                      label="Results reviewed"
                      date={formatDate(fallbackSummary.lastTestCompletedAt)}
                      status="completed"
                    />
                    {fallbackSummary.nextTestScheduledAt ? (
                      <TimelineStep
                        label={fallbackSummary.nextTestName ?? "Follow-up test"}
                        date={formatDate(fallbackSummary.nextTestScheduledAt)}
                        status="upcoming"
                        isLast
                      />
                    ) : (
                      <TimelineStep
                        label="Recommended next test"
                        date="Not yet scheduled"
                        status="pending"
                        isLast
                      />
                    )}
                  </>
                ) : (
                  <>
                    <TimelineStep label="Schedule your first test" date="Pending" status="pending" />
                    <TimelineStep label="Sample collection" date="After scheduling" status="pending" />
                    <TimelineStep label="Results & insights" date="After processing" status="pending" isLast />
                  </>
                )}
              </div>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-full">
                <Link href="/lab-tests"><a>Manage lab tests</a></Link>
              </Button>
            </section>

            {/* Journey Progress */}
            {totalTested > 0 && (
              <section className="rounded-[1.75rem] border border-primary/10 bg-white p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-foreground">Wellness progress</h2>
                </div>
                <div className="mt-5 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>In range</span>
                      <span>{pct ?? 0}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                        style={{ width: `${pct ?? 0}%` }}
                      />
                    </div>
                  </div>
                  {activeProtocols.length > 0 && (
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Protocol adherence</span>
                        <span>
                          {activeProtocols[0].adherenceScore !== null
                            ? `${activeProtocols[0].adherenceScore}%`
                            : "—"}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${activeProtocols[0].adherenceScore ?? 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Button asChild variant="outline" size="sm" className="mt-5 w-full rounded-full">
                  <Link href="/progress"><a>View progress trends</a></Link>
                </Button>
              </section>
            )}

            {/* Provider shortcut */}
            <section className="rounded-[1.75rem] border border-primary/10 bg-white p-6">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground">Your wellness team</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect with external doctors, personal trainers, and nutritionists who can support your journey.
              </p>
              <Button asChild size="sm" className="mt-4 w-full rounded-full">
                <Link href="/providers"><a>Find providers</a></Link>
              </Button>
            </section>
          </div>
        </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <section className="rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(33,56,45,0.12)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">Client Summary</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Your current health snapshot
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              {clientSummary.text}
            </p>
            <div className="mt-8 rounded-2xl bg-[#f8f5ef] p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">Next Steps</p>
              <ul className="mt-3 space-y-2">
                {clientSummary.pointers.slice(0, 4).map((pointer) => (
                  <li key={pointer} className="text-sm leading-7 text-muted-foreground">
                    • {pointer}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </TabsContent>
        </Tabs>
      </main>
      <LandingFooter />
    </div>
  );
}
