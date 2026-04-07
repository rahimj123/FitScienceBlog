import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowLeft,
  BadgeCheck,
  Dumbbell,
  HeartPulse,
  Leaf,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/landing/Navbar";
import { LandingFooter } from "@/components/landing/Footer";
import { useAuth } from "@/components/platform/AuthProvider";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WellnessProvider {
  id: string;
  firstName: string;
  lastName: string;
  providerType: string;
  specialization: string | null;
  credentials: string[];
  bio: string | null;
  profileImageUrl: string | null;
  email: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  isVerified: boolean;
  isAcceptingClients: boolean;
  availabilityNote: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
}

interface ProviderConnection {
  id: string;
  providerId: string;
  status: string;
  provider: WellnessProvider;
}

// ── Provider type config ──────────────────────────────────────────────────────
const PROVIDER_TYPES = [
  { value: "all", label: "All providers", icon: Users, color: "bg-slate-100 text-slate-700" },
  { value: "physician", label: "Physicians", icon: Stethoscope, color: "bg-blue-100 text-blue-700" },
  { value: "wellness_doctor", label: "Wellness Doctors", icon: HeartPulse, color: "bg-rose-100 text-rose-700" },
  { value: "trainer", label: "Personal Trainers", icon: Dumbbell, color: "bg-orange-100 text-orange-700" },
  { value: "nutritionist", label: "Nutritionists", icon: Leaf, color: "bg-emerald-100 text-emerald-700" },
];

function typeConfig(type: string) {
  return PROVIDER_TYPES.find((t) => t.value === type) ?? PROVIDER_TYPES[0];
}

function typeLabel(type: string): string {
  return typeConfig(type).label.replace(/s$/, ""); // singular
}

// ── Opt-in Modal ──────────────────────────────────────────────────────────────
function OptInModal({
  provider,
  onConfirm,
  onClose,
  isLoading,
}: {
  provider: WellnessProvider;
  onConfirm: (note: string) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const [note, setNote] = useState("");
  const cfg = typeConfig(provider.providerType);
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${cfg.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                Dr. {provider.firstName} {provider.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{typeLabel(provider.providerType)}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <h2 className="mt-5 text-xl font-bold text-foreground">Request to connect</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send a connection request to {provider.firstName}. They will review your intake and respond. You can add an optional note below.
        </p>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-foreground">
            Message (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. I'm interested in support with my metabolic health results…"
            className="w-full rounded-2xl border border-primary/20 bg-[#fcfbf8] p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            rows={3}
          />
        </div>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full"
            onClick={() => onConfirm(note)}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1.5" />}
            Send request
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  connectionStatus,
  onRequestConnect,
}: {
  provider: WellnessProvider;
  connectionStatus: string | null;
  onRequestConnect: (provider: WellnessProvider) => void;
}) {
  const cfg = typeConfig(provider.providerType);
  const Icon = cfg.icon;

  const initials = `${provider.firstName[0]}${provider.lastName[0]}`.toUpperCase();

  return (
    <div className="group rounded-[1.75rem] border border-primary/10 bg-white p-6 shadow-[0_16px_50px_-32px_rgba(33,56,45,0.12)] transition hover:-translate-y-0.5">
      <div className="flex gap-4">
        {/* Avatar */}
        {provider.profileImageUrl ? (
          <img
            src={provider.profileImageUrl}
            alt={`${provider.firstName} ${provider.lastName}`}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${cfg.color}`}>
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2">
            <div>
              <p className="font-bold text-foreground">
                {provider.firstName} {provider.lastName}
                {provider.isVerified && (
                  <BadgeCheck className="ml-1.5 inline h-4 w-4 text-primary" />
                )}
              </p>
              {provider.specialization && (
                <p className="text-sm text-primary/80 font-medium">{provider.specialization}</p>
              )}
            </div>
            <Badge className={`${cfg.color} shrink-0`} variant="outline">
              <Icon className="mr-1 h-3 w-3" />
              {typeLabel(provider.providerType)}
            </Badge>
          </div>

          {/* Location */}
          {(provider.locationCity || provider.locationCountry) && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {[provider.locationCity, provider.locationCountry].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {provider.bio && (
        <p className="mt-4 text-sm leading-6 text-muted-foreground line-clamp-3">{provider.bio}</p>
      )}

      {/* Credentials */}
      {provider.credentials.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {provider.credentials.map((c) => (
            <span key={c} className="rounded-full bg-[#f0ede6] px-2.5 py-0.5 text-xs text-foreground/70">
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Availability */}
      {provider.availabilityNote && (
        <p className="mt-3 text-xs text-muted-foreground italic">{provider.availabilityNote}</p>
      )}

      {/* Actions */}
      <div className="mt-5 flex items-center gap-3 border-t border-primary/5 pt-4">
        <div className="flex-1">
          {!provider.isAcceptingClients && (
            <span className="text-xs text-muted-foreground">Not accepting new clients</span>
          )}
        </div>

        {connectionStatus === "active" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <UserCheck className="h-3.5 w-3.5" /> Connected
          </span>
        ) : connectionStatus === "pending" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Request pending
          </span>
        ) : (
          <Button
            size="sm"
            variant={provider.isAcceptingClients ? "default" : "outline"}
            className="rounded-full"
            onClick={() => onRequestConnect(provider)}
            disabled={!provider.isAcceptingClients}
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Connect
          </Button>
        )}

        {provider.linkedinUrl && (
          <a
            href={provider.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground transition"
            title="LinkedIn"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── My Connections Section ────────────────────────────────────────────────────
function MyConnectionCard({ connection }: { connection: ProviderConnection }) {
  const cfg = typeConfig(connection.provider.providerType);
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] border border-primary/10 bg-white p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${cfg.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-foreground text-sm">
          {connection.provider.firstName} {connection.provider.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{typeLabel(connection.provider.providerType)}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
          connection.status === "active"
            ? "bg-emerald-50 text-emerald-700"
            : connection.status === "pending"
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {connection.status}
      </span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProviderDirectory() {
  const { user } = useAuth();
  const profileId = (user as any)?.profileId ?? "demo";
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectTarget, setConnectTarget] = useState<WellnessProvider | null>(null);

  const { data: providers = [], isLoading } = useQuery<WellnessProvider[]>({
    queryKey: ["/api/wellness/providers"],
  });

  const { data: connections = [] } = useQuery<ProviderConnection[]>({
    queryKey: [`/api/wellness/provider-connections/${profileId}`],
    enabled: !!profileId,
  });

  const connectMutation = useMutation({
    mutationFn: async ({ providerId, requestNote }: { providerId: string; requestNote: string }) => {
      const res = await apiRequest("POST", "/api/wellness/provider-connections", {
        profileId,
        providerId,
        requestNote: requestNote || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/wellness/provider-connections/${profileId}`] });
      toast({ title: "Connection request sent!" });
      setConnectTarget(null);
    },
    onError: (err: Error) => {
      if (err.message.includes("409")) {
        toast({ title: "Request already sent", variant: "destructive" });
      } else {
        toast({ title: "Failed to send request", variant: "destructive" });
      }
      setConnectTarget(null);
    },
  });

  // Connection status map
  const connectionStatusMap = new Map(connections.map((c) => [c.providerId, c.status]));

  // Filter
  const filtered = providers.filter((p) => {
    const matchesType = activeType === "all" || p.providerType === activeType;
    const matchesSearch =
      !searchQuery ||
      `${p.firstName} ${p.lastName} ${p.specialization ?? ""} ${p.bio ?? ""}`.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const myActiveConnections = connections.filter((c) => c.status === "active" || c.status === "pending");

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
          <p className="text-sm font-semibold uppercase tracking-widest text-primary/70">Provider Directory</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Find your wellness team
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Connect with verified physicians, wellness doctors, personal trainers, and nutritionists who can support your journey alongside the Jindani team.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search + type filter */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, specialization…"
                  className="h-11 rounded-full pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROVIDER_TYPES.map((t) => {
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

            {/* Provider grid */}
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading providers…</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-12 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 font-semibold text-foreground">No providers found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Check back soon as the directory grows."}
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {filtered.map((p) => (
                  <ProviderCard
                    key={p.id}
                    provider={p}
                    connectionStatus={connectionStatusMap.get(p.id) ?? null}
                    onRequestConnect={setConnectTarget}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* My connections */}
            <h2 className="text-xl font-bold text-foreground">My connections</h2>
            {myActiveConnections.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-white p-6 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-semibold text-foreground">No connections yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Browse the directory and connect with providers.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myActiveConnections.map((c) => (
                  <MyConnectionCard key={c.id} connection={c} />
                ))}
              </div>
            )}

            {/* Info card */}
            <div className="rounded-[1.75rem] border border-primary/10 bg-[#eef3ec] p-6">
              <Stethoscope className="h-6 w-6 text-primary" />
              <p className="mt-3 font-bold text-foreground">How connections work</p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  Send a connection request with an optional note
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  The provider reviews your intake and accepts
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  Once active, they can view your health summary and assign protocols
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  You remain in full control and can disconnect at any time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Opt-in modal */}
      {connectTarget && (
        <OptInModal
          provider={connectTarget}
          onClose={() => setConnectTarget(null)}
          onConfirm={(note) =>
            connectMutation.mutate({ providerId: connectTarget.id, requestNote: note })
          }
          isLoading={connectMutation.isPending}
        />
      )}

      <LandingFooter />
    </div>
  );
}
