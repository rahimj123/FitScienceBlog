import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplet,
  HeartPulse,
  Info,
  Leaf,
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/landing/Navbar";
import { LandingFooter } from "@/components/landing/Footer";
import { useAuth } from "@/components/platform/AuthProvider";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BiomarkerDef {
  id: string;
  slug: string;
  name: string;
  unit: string;
  description: string | null;
  whyItMatters: string | null;
  whatAffectsIt: string | null;
  referenceRangeLow: number | null;
  referenceRangeHigh: number | null;
  optimalRangeLow: number | null;
  optimalRangeHigh: number | null;
  category: BiomarkerCategory;
}

interface BiomarkerCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  colorHex: string | null;
  biomarkers?: BiomarkerDef[];
}

interface UserBiomarkerResult {
  id: string;
  value: number;
  status: string;
  testedAt: string;
  note: string | null;
  biomarker: BiomarkerDef;
}

// ── Icon map ──────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  heart: HeartPulse,
  activity: Activity,
  leaf: Leaf,
  zap: Zap,
  shield: Shield,
  droplet: Droplet,
};

function CategoryIcon({ icon, className }: { icon: string | null; className?: string }) {
  const Icon = (icon && iconMap[icon]) ? iconMap[icon] : Activity;
  return <Icon className={className} />;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusConfig(status: string) {
  switch (status) {
    case "in_range": return { label: "In Range", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", icon: CheckCircle2 };
    case "low": return { label: "Low", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", icon: TrendingDown };
    case "high": return { label: "High", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", icon: TrendingUp };
    case "critical_low": return { label: "Critical Low", bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", icon: AlertTriangle };
    case "critical_high": return { label: "Critical High", bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", icon: AlertTriangle };
    default: return { label: "Unknown", bg: "bg-slate-50", text: "text-slate-500", ring: "ring-slate-200", icon: Info };
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Compute % along the reference range for the mini bar
function rangePercent(value: number, low: number | null, high: number | null): number {
  if (low === null || high === null) return 50;
  const min = low * 0.6;
  const max = high * 1.4;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

// ── Biomarker Detail Page ────────────────────────────────────────────────────
function BiomarkerDetail({ slug }: { slug: string }) {
  const { user } = useAuth();
  const profileId = (user as any)?.profileId ?? "demo";

  const { data: biomarker, isLoading } = useQuery<BiomarkerDef>({
    queryKey: [`/api/wellness/biomarkers/${slug}`],
  });

  const { data: allResults = [] } = useQuery<UserBiomarkerResult[]>({
    queryKey: [`/api/wellness/biomarker-results/${profileId}`],
    enabled: !!profileId,
  });

  const myResults = allResults
    .filter((r) => r.biomarker.slug === slug)
    .sort((a, b) => new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime());

  const latest = myResults[0];
  const sc = latest ? statusConfig(latest.status) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0]">
        <Navbar />
        <div className="container-custom py-16 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!biomarker) {
    return (
      <div className="min-h-screen bg-[#f7f5f0]">
        <Navbar />
        <div className="container-custom py-16 text-center text-muted-foreground">Biomarker not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Navbar />
      <main className="container-custom py-12">
        <Link href="/biomarkers">
          <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Biomarker Report
          </a>
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Left: definition */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header */}
            <div className="rounded-[1.75rem] border border-primary/10 bg-white p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">
                    {biomarker.category.name}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-foreground">{biomarker.name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Measured in {biomarker.unit}</p>
                </div>
                {latest && sc && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}>
                    <sc.icon className="h-4 w-4" />
                    {sc.label}
                  </span>
                )}
              </div>
              {biomarker.description && (
                <p className="mt-5 text-base leading-7 text-muted-foreground">{biomarker.description}</p>
              )}
            </div>

            {/* Plain language insight */}
            {biomarker.whyItMatters && (
              <div className="rounded-[1.75rem] border border-primary/10 bg-white p-7">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <HeartPulse className="h-5 w-5 text-primary" /> Why this matters for you
                </h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{biomarker.whyItMatters}</p>
              </div>
            )}

            {biomarker.whatAffectsIt && (
              <div className="rounded-[1.75rem] border border-primary/10 bg-white p-7">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Activity className="h-5 w-5 text-primary" /> What affects this biomarker
                </h2>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{biomarker.whatAffectsIt}</p>
              </div>
            )}

            {/* History table */}
            {myResults.length > 0 && (
              <div className="rounded-[1.75rem] border border-primary/10 bg-white p-7">
                <h2 className="text-lg font-bold text-foreground">Your test history</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-primary/5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/5 bg-[#fcfbf8]">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {myResults.map((r) => {
                        const cfg = statusConfig(r.status);
                        return (
                          <tr key={r.id} className="hover:bg-[#fcfbf8]">
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(r.testedAt)}</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                              {r.value} {biomarker.unit}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                                {cfg.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right: ranges + protocol nudge */}
          <div className="space-y-5">
            {/* Reference ranges */}
            <div className="rounded-[1.75rem] border border-primary/10 bg-white p-6">
              <h2 className="font-bold text-foreground">Reference ranges</h2>
              <div className="mt-4 space-y-3 text-sm">
                {biomarker.optimalRangeLow !== null && (
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-semibold">Optimal</span>
                    <span className="font-mono text-foreground">
                      {biomarker.optimalRangeLow} – {biomarker.optimalRangeHigh} {biomarker.unit}
                    </span>
                  </div>
                )}
                {biomarker.referenceRangeLow !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard range</span>
                    <span className="font-mono text-foreground">
                      {biomarker.referenceRangeLow} – {biomarker.referenceRangeHigh} {biomarker.unit}
                    </span>
                  </div>
                )}
                {latest && (
                  <>
                    <hr className="border-primary/5 my-2" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Your last result</span>
                      <span className="font-mono font-bold text-foreground">{latest.value} {biomarker.unit}</span>
                    </div>
                    {/* Mini range bar */}
                    <div className="relative mt-2 h-3 rounded-full bg-slate-100">
                      <div
                        className="absolute top-0 h-full rounded-full bg-emerald-100"
                        style={{
                          left: `${rangePercent(biomarker.referenceRangeLow ?? 0, biomarker.referenceRangeLow, biomarker.referenceRangeHigh) * 0.7}%`,
                          width: `${(rangePercent(biomarker.referenceRangeHigh ?? 0, biomarker.referenceRangeLow, biomarker.referenceRangeHigh) - rangePercent(biomarker.referenceRangeLow ?? 0, biomarker.referenceRangeLow, biomarker.referenceRangeHigh)) * 0.7}%`,
                        }}
                      />
                      <div
                        className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow"
                        style={{ left: `calc(${rangePercent(latest.value, biomarker.referenceRangeLow, biomarker.referenceRangeHigh)}% - 3px)` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Low</span><span>High</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Protocol nudge */}
            <div className="rounded-[1.75rem] border border-primary/10 bg-[#eef3ec] p-6">
              <Leaf className="h-6 w-6 text-primary" />
              <p className="mt-3 font-bold text-foreground">Personalised protocol available</p>
              <p className="mt-1 text-sm text-muted-foreground">
                View nutrition, supplement, or lifestyle protocols that may support healthy {biomarker.name} levels.
              </p>
              <Button asChild size="sm" className="mt-4 w-full rounded-full">
                <Link href={`/protocols?tag=${biomarker.slug}`}><a>Browse related protocols</a></Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

// ── Category Section ──────────────────────────────────────────────────────────
function CategorySection({
  category,
  results,
}: {
  category: BiomarkerCategory & { biomarkers: BiomarkerDef[] };
  results: Map<string, UserBiomarkerResult>;
}) {
  const [expanded, setExpanded] = useState(true);
  const tested = category.biomarkers.filter((b) => results.has(b.id));
  const outOfRange = tested.filter((b) => {
    const r = results.get(b.id);
    return r && r.status !== "in_range";
  });

  return (
    <div className="rounded-[1.75rem] border border-primary/10 bg-white overflow-hidden shadow-[0_16px_50px_-32px_rgba(33,56,45,0.15)]">
      {/* Category header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-6 py-5 hover:bg-[#fcfbf8] transition text-left"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${category.colorHex}18`, color: category.colorHex ?? "#234432" }}
        >
          <CategoryIcon icon={category.icon} className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground">{category.name}</p>
          <p className="text-sm text-muted-foreground">
            {tested.length} of {category.biomarkers.length} tested
            {outOfRange.length > 0 && (
              <span className="ml-2 text-amber-600 font-semibold">· {outOfRange.length} need attention</span>
            )}
          </p>
        </div>
        {outOfRange.length > 0 && (
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Biomarker rows */}
      {expanded && (
        <div className="border-t border-primary/5 divide-y divide-primary/5">
          {category.biomarkers.map((b) => {
            const result = results.get(b.id);
            const sc = result ? statusConfig(result.status) : null;
            return (
              <Link key={b.id} href={`/biomarkers/${b.slug}`}>
                <a className="flex items-center gap-4 px-6 py-4 hover:bg-[#fcfbf8] transition group">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition truncate">{b.name}</p>
                    {result && (
                      <p className="text-xs text-muted-foreground">
                        Last tested {formatDate(result.testedAt)} · {result.value} {b.unit}
                      </p>
                    )}
                    {!result && (
                      <p className="text-xs text-muted-foreground">Not yet tested</p>
                    )}
                  </div>

                  {/* Mini range indicator */}
                  {result && b.referenceRangeLow !== null && b.referenceRangeHigh !== null && (
                    <div className="hidden sm:block w-24">
                      <div className="relative h-2 rounded-full bg-slate-100">
                        <div
                          className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full shadow"
                          style={{
                            left: `calc(${rangePercent(result.value, b.referenceRangeLow, b.referenceRangeHigh)}% - 2px)`,
                            backgroundColor: result.status === "in_range" ? "#22c55e" : "#f59e0b",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {result && sc ? (
                    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}>
                      <sc.icon className="h-3 w-3" />
                      {sc.label}
                    </span>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 text-xs">Untested</Badge>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground/50 shrink-0" />
                </a>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Biomarker System Page ────────────────────────────────────────────────
function BiomarkerSystemPage() {
  const { user } = useAuth();
  const profileId = (user as any)?.profileId ?? "demo";
  const [filterStatus, setFilterStatus] = useState<"all" | "out_of_range">("all");

  const { data: categories = [], isLoading: catsLoading } = useQuery<(BiomarkerCategory & { biomarkers: BiomarkerDef[] })[]>({
    queryKey: ["/api/wellness/biomarker-categories"],
  });

  const { data: allResults = [] } = useQuery<UserBiomarkerResult[]>({
    queryKey: [`/api/wellness/biomarker-results/${profileId}`],
    enabled: !!profileId,
  });

  // Build latest result map: biomarkerId → result
  const latestMap = new Map<string, UserBiomarkerResult>();
  for (const r of [...allResults].sort((a, b) => new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime())) {
    if (!latestMap.has(r.biomarker.id)) latestMap.set(r.biomarker.id, r);
  }

  const total = latestMap.size;
  const inRange = Array.from(latestMap.values()).filter((r) => r.status === "in_range").length;
  const pct = total > 0 ? Math.round((inRange / total) * 100) : null;

  const filteredCategories = filterStatus === "out_of_range"
    ? categories.map((cat) => ({
        ...cat,
        biomarkers: cat.biomarkers.filter((b) => {
          const r = latestMap.get(b.id);
          return r && r.status !== "in_range";
        }),
      })).filter((cat) => cat.biomarkers.length > 0)
    : categories;

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Navbar />
      <main className="container-custom py-12 sm:py-16">
        {/* Header */}
        <div className="mb-3">
          <Link href="/dashboard">
            <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </a>
          </Link>
        </div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">Biomarker Report</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Your body systems</h1>
            <p className="mt-2 max-w-xl text-lg text-muted-foreground">
              All biomarkers organised by system — with plain-language context for every result.
            </p>
          </div>
          {pct !== null && (
            <div className="rounded-[1.5rem] border border-primary/10 bg-white px-6 py-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-foreground">{pct}%</p>
              <p className="text-sm text-muted-foreground">
                {inRange}/{total} in range
              </p>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filterStatus === "all" ? "bg-primary text-white" : "bg-white text-foreground border border-primary/10 hover:border-primary/30"}`}
          >
            All systems
          </button>
          <button
            onClick={() => setFilterStatus("out_of_range")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filterStatus === "out_of_range" ? "bg-amber-500 text-white" : "bg-white text-foreground border border-primary/10 hover:border-primary/30"}`}
          >
            Needs attention only
          </button>
        </div>

        {catsLoading ? (
          <div className="py-16 text-center text-muted-foreground">Loading biomarker data…</div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <p className="mt-3 text-lg font-semibold text-foreground">All results in range</p>
            <p className="mt-1 text-muted-foreground">No biomarkers currently flagged as out of range.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredCategories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                results={latestMap}
              />
            ))}
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}

// ── Route Switcher ────────────────────────────────────────────────────────────
export default function BiomarkerSystem() {
  const [matchDetail, paramsDetail] = useRoute("/biomarkers/:slug");
  if (matchDetail && paramsDetail?.slug) {
    return <BiomarkerDetail slug={paramsDetail.slug} />;
  }
  return <BiomarkerSystemPage />;
}
