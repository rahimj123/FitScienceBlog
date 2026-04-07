import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Activity,
  ArrowLeft,
  Check,
  Clock,
  Dumbbell,
  Filter,
  Leaf,
  ListChecks,
  Plus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/landing/Navbar";
import { LandingFooter } from "@/components/landing/Footer";
import { useAuth } from "@/components/platform/AuthProvider";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProtocolStep {
  order: number;
  instruction: string;
  frequency: string;
}

interface Protocol {
  id: string;
  title: string;
  protocolType: string;
  goal: string | null;
  durationWeeks: number | null;
  description: string;
  steps: ProtocolStep[];
  tags: string[];
  isTemplate: boolean;
  provider: { id: string; firstName: string; lastName: string; providerType: string } | null;
}

interface UserProtocol {
  id: string;
  status: string;
  startedAt: string;
  adherenceScore: number | null;
  protocol: Protocol;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const PROTOCOL_TYPES = [
  { value: "all", label: "All protocols", icon: ListChecks, color: "bg-slate-100 text-slate-700" },
  { value: "nutrition", label: "Nutrition", icon: Leaf, color: "bg-emerald-100 text-emerald-700" },
  { value: "supplement", label: "Supplements", icon: Zap, color: "bg-purple-100 text-purple-700" },
  { value: "exercise", label: "Exercise", icon: Dumbbell, color: "bg-blue-100 text-blue-700" },
  { value: "sleep", label: "Sleep", icon: Clock, color: "bg-indigo-100 text-indigo-700" },
  { value: "whole_body", label: "Whole Body", icon: Activity, color: "bg-orange-100 text-orange-700" },
];

function typeConfig(type: string) {
  return PROTOCOL_TYPES.find((t) => t.value === type) ?? PROTOCOL_TYPES[0];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Protocol Card ─────────────────────────────────────────────────────────────
function ProtocolCard({
  protocol,
  isAssigned,
  onAssign,
  isAssigning,
}: {
  protocol: Protocol;
  isAssigned: boolean;
  onAssign: (id: string) => void;
  isAssigning: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = typeConfig(protocol.protocolType);
  const Icon = cfg.icon;

  return (
    <div className="group rounded-[1.75rem] border border-primary/10 bg-white shadow-[0_16px_50px_-32px_rgba(33,56,45,0.12)] transition hover:-translate-y-0.5">
      {/* Card header */}
      <div className="flex gap-4 p-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${cfg.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold text-foreground leading-snug">{protocol.title}</p>
              {protocol.goal && (
                <p className="mt-0.5 text-xs text-primary/80 font-semibold">{protocol.goal}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {protocol.durationWeeks && (
                <Badge variant="secondary">{protocol.durationWeeks}w</Badge>
              )}
              <Badge className={cfg.color} variant="outline">
                {cfg.label}
              </Badge>
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">{protocol.description}</p>
          {protocol.provider && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              By Dr. {protocol.provider.firstName} {protocol.provider.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {protocol.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-6 pb-4">
          {protocol.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#f0ede6] px-2.5 py-0.5 text-xs text-foreground/70">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Steps preview */}
      {expanded && protocol.steps.length > 0 && (
        <div className="border-t border-primary/5 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Protocol steps</p>
          <ol className="space-y-2">
            {protocol.steps.map((step) => (
              <li key={step.order} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {step.order}
                </span>
                <span className="text-foreground">
                  {step.instruction}
                  <span className="ml-1.5 text-xs text-muted-foreground">({step.frequency})</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-primary/5 px-6 py-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {expanded ? "Hide steps" : `View ${protocol.steps.length} steps`}
        </button>
        {isAssigned ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <Check className="h-3.5 w-3.5" /> Active
          </span>
        ) : (
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => onAssign(protocol.id)}
            disabled={isAssigning}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {isAssigning ? "Adding…" : "Add to my plan"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── My Protocol Card ──────────────────────────────────────────────────────────
function MyProtocolCard({
  userProtocol,
  onUpdateStatus,
}: {
  userProtocol: UserProtocol;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const cfg = typeConfig(userProtocol.protocol.protocolType);
  const Icon = cfg.icon;

  return (
    <div className="rounded-[1.75rem] border border-primary/10 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${cfg.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{userProtocol.protocol.title}</p>
          <p className="text-xs text-muted-foreground">
            Started {formatDate(userProtocol.startedAt)}
            {userProtocol.protocol.durationWeeks ? ` · ${userProtocol.protocol.durationWeeks} wk program` : ""}
          </p>
          {userProtocol.adherenceScore !== null && (
            <div className="mt-2">
              <div className="mb-0.5 flex justify-between text-[10px] text-muted-foreground">
                <span>Adherence</span>
                <span>{userProtocol.adherenceScore}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${userProtocol.adherenceScore}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="shrink-0">
          {userProtocol.status === "active" ? (
            <button
              onClick={() => onUpdateStatus(userProtocol.id, "paused")}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Pause
            </button>
          ) : userProtocol.status === "paused" ? (
            <button
              onClick={() => onUpdateStatus(userProtocol.id, "active")}
              className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
            >
              Resume
            </button>
          ) : (
            <Badge variant="secondary">Completed</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProtocolEngine() {
  const { user } = useAuth();
  const profileId = (user as any)?.profileId ?? "demo";
  const [activeType, setActiveType] = useState("all");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: protocols = [], isLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/wellness/protocols"],
  });

  const { data: userProtocols = [] } = useQuery<UserProtocol[]>({
    queryKey: [`/api/wellness/user-protocols/${profileId}`],
    enabled: !!profileId,
  });

  const assignedIds = new Set(userProtocols.map((up) => up.protocol.id));

  const assignMutation = useMutation({
    mutationFn: async (protocolId: string) => {
      const res = await apiRequest("POST", "/api/wellness/user-protocols", { profileId, protocolId });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/wellness/user-protocols/${profileId}`] });
      toast({ title: "Protocol added to your plan" });
    },
    onError: () => toast({ title: "Failed to add protocol", variant: "destructive" }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/wellness/user-protocols/${id}`, { status });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [`/api/wellness/user-protocols/${profileId}`] }),
    onError: () => toast({ title: "Failed to update protocol", variant: "destructive" }),
  });

  const filtered = activeType === "all" ? protocols : protocols.filter((p) => p.protocolType === activeType);
  const activeUserProtocols = userProtocols.filter((up) => up.status === "active");
  const pausedUserProtocols = userProtocols.filter((up) => up.status === "paused");

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
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">Protocol Engine</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Your personalised protocols
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Science-informed programs for nutrition, supplementation, exercise, and sleep — each one goal-focused, trackable, and built to work together.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Type filter tabs */}
            <div className="flex flex-wrap gap-2">
              {PROTOCOL_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setActiveType(t.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      activeType === t.value
                        ? t.color + " ring-1 ring-current"
                        : "bg-white text-foreground border border-primary/10 hover:border-primary/30"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Protocol library */}
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading protocols…</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-12 text-center">
                <Filter className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 font-semibold text-foreground">No protocols in this category yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your wellness team will publish protocols here as they become available.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filtered.map((p) => (
                  <ProtocolCard
                    key={p.id}
                    protocol={p}
                    isAssigned={assignedIds.has(p.id)}
                    onAssign={(id) => assignMutation.mutate(id)}
                    isAssigning={assignMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: My Plan */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-foreground">My plan</h2>

            {activeUserProtocols.length === 0 && pausedUserProtocols.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-6 text-center">
                <ListChecks className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-semibold text-foreground">No protocols yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Add protocols from the library to build your plan.</p>
              </div>
            ) : (
              <>
                {activeUserProtocols.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active</p>
                    <div className="space-y-3">
                      {activeUserProtocols.map((up) => (
                        <MyProtocolCard
                          key={up.id}
                          userProtocol={up}
                          onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {pausedUserProtocols.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paused</p>
                    <div className="space-y-3">
                      {pausedUserProtocols.map((up) => (
                        <MyProtocolCard
                          key={up.id}
                          userProtocol={up}
                          onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tip card */}
            <div className="rounded-[1.75rem] border border-primary/10 bg-[#eef3ec] p-5">
              <Leaf className="h-5 w-5 text-primary" />
              <p className="mt-2 text-sm font-semibold text-foreground">Start with one protocol</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Research shows that doing one protocol well produces better outcomes than doing several poorly. Start with the highest-priority area from your biomarker report.
              </p>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
