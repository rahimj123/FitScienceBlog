import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Leaf,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { LandingFooter } from "@/components/landing/Footer";
import { useAuth } from "@/components/platform/AuthProvider";

// ── Types ──────────────────────────────────────────────────────────────────────
interface UserBiomarkerResult {
  id: string;
  value: number;
  status: string;
  testedAt: string;
  biomarker: {
    id: string;
    name: string;
    slug: string;
    unit: string;
    referenceRangeLow: number | null;
    referenceRangeHigh: number | null;
    category: { name: string; colorHex: string | null };
  };
}

interface UserProtocol {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  adherenceScore: number | null;
  protocol: {
    title: string;
    protocolType: string;
    goal: string | null;
    durationWeeks: number | null;
  };
}

interface LabTest {
  id: string;
  testName: string;
  testType: string;
  status: string;
  scheduledAt: string | null;
  completedAt: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function weeksBetween(a: string, b: string): number {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.round(ms / (1000 * 60 * 60 * 24 * 7));
}

function protocolTypeIcon(type: string) {
  switch (type) {
    case "nutrition": return Leaf;
    case "supplement": return Zap;
    case "exercise": return Dumbbell;
    case "sleep": return Clock;
    default: return Activity;
  }
}

function protocolTypeColor(type: string) {
  switch (type) {
    case "nutrition": return "text-emerald-700 bg-emerald-50";
    case "supplement": return "text-purple-700 bg-purple-50";
    case "exercise": return "text-blue-700 bg-blue-50";
    case "sleep": return "text-indigo-700 bg-indigo-50";
    default: return "text-orange-700 bg-orange-50";
  }
}

// ── Trend Sparkline (SVG) ─────────────────────────────────────────────────────
function TrendSparkline({ values, color = "#234432" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 80;
  const H = 32;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
      {/* Last point dot */}
      <circle
        cx={W}
        cy={H - ((values[values.length - 1] - min) / range) * H}
        r="3"
        fill={color}
      />
    </svg>
  );
}

// ── Biomarker Trend Row ───────────────────────────────────────────────────────
function BiomarkerTrendRow({ name, unit, results, categoryColor }: {
  name: string;
  unit: string;
  results: UserBiomarkerResult[];
  categoryColor: string | null;
}) {
  const sorted = [...results].sort((a, b) => new Date(a.testedAt).getTime() - new Date(b.testedAt).getTime());
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const values = sorted.map((r) => r.value);

  const delta = previous ? latest.value - previous.value : null;
  const deltaPct = previous ? ((delta! / previous.value) * 100).toFixed(1) : null;
  const improved = latest.status === "in_range";

  return (
    <tr className="group hover:bg-[#fcfbf8]">
      <td className="px-5 py-3">
        <Link href={`/biomarkers/${results[0].biomarker.slug}`}>
          <a className="font-medium text-foreground hover:text-primary hover:underline">{name}</a>
        </Link>
      </td>
      <td className="px-5 py-3 text-right font-mono font-semibold text-foreground">
        {latest.value} {unit}
      </td>
      <td className="px-5 py-3 text-right">
        {delta !== null ? (
          <span className={`inline-flex items-center gap-0.5 text-sm font-semibold ${delta > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {delta > 0 ? "+" : ""}{deltaPct}%
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-5 py-3">
        <TrendSparkline values={values} color={categoryColor ?? "#234432"} />
      </td>
      <td className="px-5 py-3 text-right">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${improved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {improved ? "In Range" : latest.status === "low" ? "Low" : "High"}
        </span>
      </td>
    </tr>
  );
}

// ── In Range Progress Arc ─────────────────────────────────────────────────────
function ProgressArc({ pct, size = 120, stroke = 10 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={center} cy={center} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="#22c55e"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProgressTracking() {
  const { user } = useAuth();
  const profileId = (user as any)?.profileId ?? "demo";
  const [showAllTests, setShowAllTests] = useState(false);

  const { data: allResults = [] } = useQuery<UserBiomarkerResult[]>({
    queryKey: [`/api/wellness/biomarker-results/${profileId}`],
    enabled: !!profileId,
  });

  const { data: userProtocols = [] } = useQuery<UserProtocol[]>({
    queryKey: [`/api/wellness/user-protocols/${profileId}`],
    enabled: !!profileId,
  });

  const { data: labTests = [] } = useQuery<LabTest[]>({
    queryKey: [`/api/wellness/lab-tests/${profileId}`],
    enabled: !!profileId,
  });

  // Group results by biomarker, sorted by date
  const byBiomarker = new Map<string, UserBiomarkerResult[]>();
  for (const r of allResults) {
    const key = r.biomarker.id;
    if (!byBiomarker.has(key)) byBiomarker.set(key, []);
    byBiomarker.get(key)!.push(r);
  }

  // Biomarkers with > 1 result (can show trends)
  const trendsData = Array.from(byBiomarker.entries())
    .filter(([, rs]) => rs.length >= 1)
    .sort(([, a], [, b]) => b.length - a.length);

  // Summary stats (latest snapshot)
  const latestMap = new Map<string, UserBiomarkerResult>();
  for (const [, rs] of byBiomarker) {
    const sorted = [...rs].sort((a, b) => new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime());
    latestMap.set(rs[0].biomarker.id, sorted[0]);
  }
  const total = latestMap.size;
  const inRange = Array.from(latestMap.values()).filter((r) => r.status === "in_range").length;
  const pct = total > 0 ? Math.round((inRange / total) * 100) : 0;

  // Completed lab tests
  const completedTests = labTests.filter((t) => t.status === "completed")
    .sort((a, b) => new Date(b.completedAt ?? "").getTime() - new Date(a.completedAt ?? "").getTime());
  const displayedTests = showAllTests ? completedTests : completedTests.slice(0, 4);

  // Protocol adherence
  const completedProtocols = userProtocols.filter((up) => up.status === "completed");
  const activeProtocols = userProtocols.filter((up) => up.status === "active");

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
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">Progress Tracking</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Your wellness journey
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Before-and-after comparisons, biomarker trend lines, protocol adherence, and your full testing history — all in one place.
          </p>
        </div>

        {/* ── Top Summary Strip ──────────────────────────────────────────── */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* In-range arc */}
          <div className="flex items-center gap-5 rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm">
            <div className="relative shrink-0">
              <ProgressArc pct={pct} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-foreground">{pct}%</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground">In range</p>
              <p className="text-sm text-muted-foreground">{inRange} of {total} tested</p>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm">
            <CalendarCheck className="h-7 w-7 text-primary" />
            <p className="mt-3 text-3xl font-bold text-foreground">{completedTests.length}</p>
            <p className="text-sm text-muted-foreground">Lab tests completed</p>
          </div>

          <div className="flex flex-col justify-center rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            <p className="mt-3 text-3xl font-bold text-foreground">{completedProtocols.length}</p>
            <p className="text-sm text-muted-foreground">Protocols completed</p>
          </div>

          <div className="flex flex-col justify-center rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-sm">
            <Activity className="h-7 w-7 text-blue-600" />
            <p className="mt-3 text-3xl font-bold text-foreground">{activeProtocols.length}</p>
            <p className="text-sm text-muted-foreground">Active protocols</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">

            {/* ── Biomarker Trend Table ─────────────────────────────────── */}
            {trendsData.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Biomarker trends</h2>
                  <Link href="/biomarkers">
                    <a className="text-sm font-semibold text-primary hover:underline">
                      Full report <ArrowUpRight className="inline h-3 w-3" />
                    </a>
                  </Link>
                </div>
                <div className="overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/5 bg-[#fcfbf8]">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Biomarker</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latest</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Change</th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trend</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {trendsData.map(([, rs]) => (
                        <BiomarkerTrendRow
                          key={rs[0].biomarker.id}
                          name={rs[0].biomarker.name}
                          unit={rs[0].biomarker.unit}
                          results={rs}
                          categoryColor={rs[0].biomarker.category.colorHex}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ── Protocol Progress ─────────────────────────────────────── */}
            {userProtocols.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-foreground">Protocol history</h2>
                <div className="space-y-3">
                  {userProtocols.map((up) => {
                    const Icon = protocolTypeIcon(up.protocol.protocolType);
                    const colorClass = protocolTypeColor(up.protocol.protocolType);
                    const weeks = up.completedAt
                      ? weeksBetween(up.startedAt, up.completedAt)
                      : weeksBetween(up.startedAt, new Date().toISOString());
                    return (
                      <div
                        key={up.id}
                        className="rounded-[1.5rem] border border-primary/10 bg-white p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-foreground">{up.protocol.title}</p>
                                {up.protocol.goal && (
                                  <p className="text-xs text-muted-foreground">{up.protocol.goal}</p>
                                )}
                              </div>
                              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                up.status === "active" ? "bg-emerald-50 text-emerald-700" :
                                up.status === "paused" ? "bg-amber-50 text-amber-700" :
                                "bg-slate-100 text-slate-500"
                              }`}>
                                {up.status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Started {formatDate(up.startedAt)} · {weeks}w in
                              {up.completedAt ? ` · Completed ${formatDate(up.completedAt)}` : ""}
                            </p>
                            {up.adherenceScore !== null && (
                              <div className="mt-2">
                                <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                                  <span>Adherence</span>
                                  <span>{up.adherenceScore}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all duration-700"
                                    style={{ width: `${up.adherenceScore}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Empty state */}
            {allResults.length === 0 && userProtocols.length === 0 && (
              <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-12 text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 text-lg font-semibold text-foreground">No progress data yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete your first lab test and start a protocol to begin tracking your wellness journey.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Link href="/lab-tests">
                    <a className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                      Book a test
                    </a>
                  </Link>
                  <Link href="/protocols">
                    <a className="rounded-full border border-primary/20 bg-white px-5 py-2 text-sm font-semibold text-foreground hover:border-primary/40">
                      Browse protocols
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar: Lab test history ─────────────────────────── */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-foreground">Test history</h2>
            {completedTests.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-6 text-center">
                <CalendarCheck className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-semibold text-foreground">No tests yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Your completed lab tests will appear here.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {displayedTests.map((test) => (
                    <div
                      key={test.id}
                      className="rounded-[1.5rem] border border-primary/10 bg-white p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <CalendarCheck className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold text-foreground text-sm">{test.testName}</p>
                          <p className="text-xs text-muted-foreground">
                            Completed {formatDate(test.completedAt)}
                          </p>
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            test.testType === "annual" ? "bg-blue-50 text-blue-700" :
                            test.testType === "follow_up" ? "bg-purple-50 text-purple-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {test.testType.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {completedTests.length > 4 && (
                  <button
                    onClick={() => setShowAllTests((v) => !v)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/10 bg-white py-2 text-sm font-semibold text-foreground hover:border-primary/30"
                  >
                    {showAllTests ? (
                      <><ChevronUp className="h-4 w-4" /> Show less</>
                    ) : (
                      <><ChevronDown className="h-4 w-4" /> Show all {completedTests.length} tests</>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Insight card */}
            <div className="rounded-[1.75rem] border border-primary/10 bg-[#eef3ec] p-5">
              <TrendingUp className="h-5 w-5 text-primary" />
              <p className="mt-2 text-sm font-bold text-foreground">The value of re-testing</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Trending biomarkers over multiple test cycles is where the real insight emerges. Each completed test adds another data point to your health story.
              </p>
              <Link href="/lab-tests">
                <a className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
                  Schedule your next test →
                </a>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
