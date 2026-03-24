import { randomUUID } from "crypto";
import type { Express } from "express";
import {
  corporateLeadSchema,
  getMembershipTierLabel,
  membershipChangeSchema,
  membershipEnrollmentSchema,
  membershipPlans,
  membershipRecommendationInputSchema,
  recommendMembership,
  type CorporateLeadInput,
  type MembershipTier,
  type StageOfChange,
  type SubscriptionStatus,
} from "@shared/membership";
import { z } from "zod";

type MembershipRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currentTier: MembershipTier;
  recommendedTier: MembershipTier;
  stageOfChange: StageOfChange;
  startDate: string;
  subscriptionStatus: SubscriptionStatus;
  engagementScore: number;
  source: string;
  corporateInterest: boolean;
  organizationName: string | null;
};

type UpgradeRecord = {
  id: string;
  email: string;
  fromTier: MembershipTier | null;
  toTier: MembershipTier;
  changedAt: string;
  reason: string;
};

type EngagementRecord = {
  id: string;
  email: string;
  score: number;
  socialTouches: number;
  accountabilityTouches: number;
  milestoneCount: number;
  updatedAt: string;
};

type CorporateLeadRecord = CorporateLeadInput & {
  id: string;
  createdAt: string;
  status: "new" | "contacted" | "qualified";
};

const memberships = new Map<string, MembershipRecord>([
  [
    "member-prep@wellness.local",
    {
      id: randomUUID(),
      email: "member-prep@wellness.local",
      firstName: "Amina",
      lastName: "Cole",
      currentTier: "tier1",
      recommendedTier: "tier1",
      stageOfChange: "preparation",
      startDate: new Date().toISOString(),
      subscriptionStatus: "active",
      engagementScore: 48,
      source: "challenge",
      corporateInterest: false,
      organizationName: null,
    },
  ],
  [
    "member-action@wellness.local",
    {
      id: randomUUID(),
      email: "member-action@wellness.local",
      firstName: "Jordan",
      lastName: "Lee",
      currentTier: "tier2",
      recommendedTier: "tier2",
      stageOfChange: "action",
      startDate: new Date().toISOString(),
      subscriptionStatus: "active",
      engagementScore: 74,
      source: "onboarding",
      corporateInterest: false,
      organizationName: null,
    },
  ],
  [
    "exec@wellness.local",
    {
      id: randomUUID(),
      email: "exec@wellness.local",
      firstName: "Priya",
      lastName: "Morgan",
      currentTier: "tier3",
      recommendedTier: "tier3",
      stageOfChange: "maintenance",
      startDate: new Date().toISOString(),
      subscriptionStatus: "active",
      engagementScore: 92,
      source: "corporate",
      corporateInterest: true,
      organizationName: "Northbank Advisory",
    },
  ],
]);

const upgradeHistory: UpgradeRecord[] = [
  {
    id: randomUUID(),
    email: "member-action@wellness.local",
    fromTier: "tier1",
    toTier: "tier2",
    changedAt: new Date().toISOString(),
    reason: "Completed the foundations milestones and joined accountability coaching.",
  },
];

const engagementMetrics = new Map<string, EngagementRecord>([
  [
    "member-prep@wellness.local",
    {
      id: randomUUID(),
      email: "member-prep@wellness.local",
      score: 48,
      socialTouches: 7,
      accountabilityTouches: 3,
      milestoneCount: 2,
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "member-action@wellness.local",
    {
      id: randomUUID(),
      email: "member-action@wellness.local",
      score: 74,
      socialTouches: 13,
      accountabilityTouches: 9,
      milestoneCount: 6,
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "exec@wellness.local",
    {
      id: randomUUID(),
      email: "exec@wellness.local",
      score: 92,
      socialTouches: 5,
      accountabilityTouches: 14,
      milestoneCount: 11,
      updatedAt: new Date().toISOString(),
    },
  ],
]);

const corporateLeads: CorporateLeadRecord[] = [];

function upsertMembershipRecord(input: z.infer<typeof membershipEnrollmentSchema>) {
  const existing = memberships.get(input.email);
  const nextRecord: MembershipRecord = existing
    ? {
        ...existing,
        firstName: input.firstName,
        lastName: input.lastName,
        currentTier: input.chosenTier,
        recommendedTier: input.recommendedTier,
        stageOfChange: input.stageOfChange,
        engagementScore: input.engagementScore,
        source: input.source,
        corporateInterest: input.corporateInterest,
        organizationName: input.organizationName ?? existing.organizationName,
        subscriptionStatus: existing.currentTier === input.chosenTier ? existing.subscriptionStatus : "upgraded",
      }
    : {
        id: randomUUID(),
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        currentTier: input.chosenTier,
        recommendedTier: input.recommendedTier,
        stageOfChange: input.stageOfChange,
        startDate: new Date().toISOString(),
        subscriptionStatus: input.chosenTier === "free" ? "lead" : "active",
        engagementScore: input.engagementScore,
        source: input.source,
        corporateInterest: input.corporateInterest,
        organizationName: input.organizationName ?? null,
      };

  memberships.set(input.email, nextRecord);

  if (!existing || existing.currentTier !== input.chosenTier) {
    upgradeHistory.unshift({
      id: randomUUID(),
      email: input.email,
      fromTier: existing?.currentTier ?? null,
      toTier: input.chosenTier,
      changedAt: new Date().toISOString(),
      reason: `Enrollment captured from ${input.source}.`,
    });
  }

  engagementMetrics.set(input.email, {
    id: existing ? engagementMetrics.get(input.email)?.id ?? randomUUID() : randomUUID(),
    email: input.email,
    score: input.engagementScore,
    socialTouches: input.chosenTier === "free" ? 4 : input.chosenTier === "tier1" ? 8 : input.chosenTier === "tier2" ? 12 : 15,
    accountabilityTouches: input.chosenTier === "free" ? 1 : input.chosenTier === "tier1" ? 5 : input.chosenTier === "tier2" ? 9 : 14,
    milestoneCount: input.chosenTier === "free" ? 1 : input.chosenTier === "tier1" ? 3 : input.chosenTier === "tier2" ? 7 : 10,
    updatedAt: new Date().toISOString(),
  });

  return nextRecord;
}

export function registerMembershipRoutes(app: Express) {
  app.get("/api/membership/plans", (_req, res) => {
    return res.json({
      plans: membershipPlans,
      progression: ["free", "tier1", "tier2", "tier3"],
      socialDriver:
        "Social engagement starts broad, then becomes progressively more accountable, structured, and personalized.",
    });
  });

  app.post("/api/membership/recommend", (req, res) => {
    try {
      const input = membershipRecommendationInputSchema.parse(req.body);
      return res.json(recommendMembership(input));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid membership recommendation payload", errors: error.errors });
      }
      return res.status(500).json({ message: "Unable to recommend a membership tier" });
    }
  });

  app.post("/api/membership/enroll", (req, res) => {
    try {
      const input = membershipEnrollmentSchema.parse(req.body);
      const record = upsertMembershipRecord(input);
      return res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid membership enrollment payload", errors: error.errors });
      }
      return res.status(500).json({ message: "Unable to save membership enrollment" });
    }
  });

  app.post("/api/membership/corporate-lead", (req, res) => {
    try {
      const input = corporateLeadSchema.parse(req.body);
      const lead: CorporateLeadRecord = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        status: "new",
      };
      corporateLeads.unshift(lead);
      return res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid corporate lead payload", errors: error.errors });
      }
      return res.status(500).json({ message: "Unable to save corporate inquiry" });
    }
  });

  app.get("/api/membership/admin/summary", (_req, res) => {
    const members = Array.from(memberships.values()).map((member) => ({
      ...member,
      tierLabel: getMembershipTierLabel(member.currentTier),
      recommendedTierLabel: getMembershipTierLabel(member.recommendedTier),
      metrics: engagementMetrics.get(member.email) ?? null,
    }));

    const counts = {
      free: members.filter((member) => member.currentTier === "free").length,
      tier1: members.filter((member) => member.currentTier === "tier1").length,
      tier2: members.filter((member) => member.currentTier === "tier2").length,
      tier3: members.filter((member) => member.currentTier === "tier3").length,
      corporateLeads: corporateLeads.length,
    };

    return res.json({
      counts,
      members,
      upgradeHistory,
    });
  });

  app.post("/api/membership/admin/change-tier", (req, res) => {
    try {
      const input = membershipChangeSchema.parse(req.body);
      const member = memberships.get(input.email);
      if (!member) {
        return res.status(404).json({ message: "Membership record not found" });
      }

      const updated: MembershipRecord = {
        ...member,
        currentTier: input.targetTier,
        recommendedTier: input.targetTier,
        subscriptionStatus: "upgraded",
      };
      memberships.set(input.email, updated);
      upgradeHistory.unshift({
        id: randomUUID(),
        email: input.email,
        fromTier: member.currentTier,
        toTier: input.targetTier,
        changedAt: new Date().toISOString(),
        reason: input.reason,
      });

      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid membership change payload", errors: error.errors });
      }
      return res.status(500).json({ message: "Unable to change membership tier" });
    }
  });

  app.get("/api/membership/admin/corporate-leads", (_req, res) => {
    return res.json({
      leads: corporateLeads,
      enterpriseMetrics: {
        activeExecutiveMembers: Array.from(memberships.values()).filter((member) => member.currentTier === "tier3").length,
        organizations: Array.from(
          new Set(Array.from(memberships.values()).map((member) => member.organizationName).filter(Boolean)),
        ).length,
        avgExecutiveEngagement:
          Math.round(
            Array.from(engagementMetrics.values())
              .filter((metric) => memberships.get(metric.email)?.currentTier === "tier3")
              .reduce((acc, metric) => acc + metric.score, 0) /
              Math.max(
                1,
                Array.from(engagementMetrics.values()).filter(
                  (metric) => memberships.get(metric.email)?.currentTier === "tier3",
                ).length,
              ),
          ) || 0,
      },
    });
  });
}
