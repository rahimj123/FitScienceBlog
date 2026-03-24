import { z } from "zod";

export const membershipTierSchema = z.enum(["free", "tier1", "tier2", "tier3"]);
export const stageOfChangeSchema = z.enum([
  "precontemplation",
  "contemplation",
  "preparation",
  "action",
  "maintenance",
]);
export const subscriptionStatusSchema = z.enum(["lead", "active", "paused", "upgraded", "cancelled"]);

export type MembershipTier = z.infer<typeof membershipTierSchema>;
export type StageOfChange = z.infer<typeof stageOfChangeSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const membershipRecommendationInputSchema = z.object({
  stageOfChange: stageOfChangeSchema.optional(),
  currentActivityLevel: z.enum(["minimal", "light", "moderate", "vigorous"]).optional(),
  servicePreference: z.enum(["fitness", "advanced"]).optional(),
  supportType: z.enum(["fitness", "wellness", "unsure"]).optional(),
  broaderSupport: z.boolean().optional(),
  wantsCommunity: z.boolean().optional(),
  wantsAccountability: z.boolean().optional(),
  wantsExecutiveSupport: z.boolean().optional(),
  professionalDemand: z.boolean().optional(),
  corporateInterest: z.boolean().optional(),
  consistencyScore: z.coerce.number().min(0).max(10).optional(),
  barriers: z.string().optional(),
  medicalFlag: z.boolean().optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  source: z.string().optional(),
});

export type MembershipRecommendationInput = z.infer<typeof membershipRecommendationInputSchema>;

export const membershipPlanSchema = z.object({
  id: z.string(),
  tier: membershipTierSchema,
  name: z.string(),
  stageFocus: z.array(stageOfChangeSchema),
  tagline: z.string(),
  purpose: z.string(),
  primaryDriver: z.string(),
  features: z.array(z.string()),
  socialFeatures: z.array(z.string()),
  upgradeGoal: z.string(),
  ctaLabel: z.string(),
  designIntent: z.array(z.string()),
});

export type MembershipPlan = z.infer<typeof membershipPlanSchema>;

export const membershipPlans: MembershipPlan[] = [
  {
    id: "free-community",
    tier: "free",
    name: "Free Membership",
    stageFocus: ["precontemplation", "contemplation"],
    tagline: "Start small, learn publicly, and discover that you are not alone.",
    purpose: "Top-of-funnel awareness built through social engagement, light challenges, and educational content.",
    primaryDriver: "Belonging before commitment.",
    features: [
      "Access to the social media ecosystem",
      "Educational content including articles, videos, and short guides",
      "Community forum and awareness discussions",
      "Limited chatbot guidance",
      "Wellness awareness challenges with light participation",
    ],
    socialFeatures: [
      "Awareness posts and comment prompts",
      "Forum discussions around common barriers",
      "Community highlights that normalize small starts",
    ],
    upgradeGoal: "Move curious users into a structured planning phase.",
    ctaLabel: "Join Free Community",
    designIntent: [
      "Feel valuable but incomplete",
      "Reinforce that progress can start with small wins",
      "Create desire for more structure and accountability",
    ],
  },
  {
    id: "tier-1-foundations",
    tier: "tier1",
    name: "Tier 1 Foundations",
    stageFocus: ["preparation"],
    tagline: "Turn readiness into a practical starting plan.",
    purpose: "Move members from intent into structured preparation with beginner guidance and basic accountability.",
    primaryDriver: "Planning plus early social commitment.",
    features: [
      "Guided beginner fitness plans",
      "Basic habit tracking",
      "Goal setting tools",
      "Structured onboarding via chatbot or form",
      "Limited group sessions and beginner challenges",
      "Access to starter programs",
      "Basic accountability nudges",
    ],
    socialFeatures: [
      "Buddy system introduction",
      "Beginner group interaction",
      "Simple social challenges with visible milestones",
    ],
    upgradeGoal: "Help members feel momentum and readiness for deeper coaching.",
    ctaLabel: "Start Tier 1",
    designIntent: [
      "Reduce intimidation",
      "Increase structure without overload",
      "Make readiness visible through progress markers",
    ],
  },
  {
    id: "tier-2-transformation",
    tier: "tier2",
    name: "Tier 2 Transformation",
    stageFocus: ["action", "maintenance"],
    tagline: "Sustain momentum through coaching, accountability, and community.",
    purpose: "Support active behavior change and long-term consistency with stronger structure and richer group support.",
    primaryDriver: "Community accountability and habit reinforcement.",
    features: [
      "Advanced fitness programming",
      "Structured wellness plans",
      "Group coaching sessions",
      "Accountability systems",
      "Progress tracking dashboards",
      "Community-based challenges",
      "Access to Mind, Body, Spirit modules",
      "Optional wellness consultation pathway",
      "Physician review pathway when needed",
    ],
    socialFeatures: [
      "Group workouts and classes",
      "Accountability pods",
      "Step challenges and community events",
    ],
    upgradeGoal: "Retain consistency while identifying members ready for premium support.",
    ctaLabel: "Move Into Tier 2",
    designIntent: [
      "Make consistency visible",
      "Reward repeat action",
      "Tie social belonging to ongoing progress",
    ],
  },
  {
    id: "tier-3-executive",
    tier: "tier3",
    name: "Tier 3 Executive Wellness",
    stageFocus: ["action", "maintenance"],
    tagline: "Elite, highly personalized, time-efficient wellness support.",
    purpose: "Premium executive-level coaching for professionals, corporates, and high-performance clients.",
    primaryDriver: "Precision, exclusivity, and expert access.",
    features: [
      "Personalized coaching with Dr. Rahim Jindani",
      "Priority scheduling",
      "Direct communication channel",
      "High-touch accountability",
      "Custom fitness and lifestyle planning",
      "Access to physician consultation pathway with Dr. Shireen Jindani",
      "Lab-informed wellness guidance after consultation",
      "Executive wellness tracking",
      "Performance optimization focus",
    ],
    socialFeatures: [
      "Private coaching relationship",
      "Structured elite accountability loop",
      "High-performance planning cadence",
    ],
    upgradeGoal: "Deliver premium retention and corporate expansion.",
    ctaLabel: "Request Executive Wellness",
    designIntent: [
      "Feel premium and efficient",
      "Minimize friction for high-value clients",
      "Blend privacy with expert coordination",
    ],
  },
];

export const membershipEnrollmentSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  chosenTier: membershipTierSchema,
  recommendedTier: membershipTierSchema,
  stageOfChange: stageOfChangeSchema,
  engagementScore: z.coerce.number().min(0).max(100),
  source: z.string().default("web"),
  corporateInterest: z.boolean().default(false),
  organizationName: z.string().optional(),
});

export type MembershipEnrollmentInput = z.infer<typeof membershipEnrollmentSchema>;

export const membershipChangeSchema = z.object({
  email: z.string().email(),
  targetTier: membershipTierSchema,
  reason: z.string().min(3),
});

export type MembershipChangeInput = z.infer<typeof membershipChangeSchema>;

export const corporateLeadSchema = z.object({
  organizationName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  teamSize: z.string().min(1),
  priorities: z.string().min(8),
  interestArea: z.enum(["executive", "workforce", "leadership", "custom"]),
});

export type CorporateLeadInput = z.infer<typeof corporateLeadSchema>;

export function getMembershipPlan(tier: MembershipTier) {
  return membershipPlans.find((plan) => plan.tier === tier)!;
}

export function getMembershipTierLabel(tier: MembershipTier) {
  switch (tier) {
    case "free":
      return "Free Membership";
    case "tier1":
      return "Tier 1 Foundations";
    case "tier2":
      return "Tier 2 Transformation";
    case "tier3":
      return "Tier 3 Executive Wellness";
  }
}

export function getStageLabel(stage: StageOfChange) {
  switch (stage) {
    case "precontemplation":
      return "Precontemplation";
    case "contemplation":
      return "Contemplation";
    case "preparation":
      return "Preparation";
    case "action":
      return "Action";
    case "maintenance":
      return "Maintenance";
  }
}

function inferStage(input: MembershipRecommendationInput): StageOfChange {
  if (input.stageOfChange) {
    return input.stageOfChange;
  }

  if (input.corporateInterest || input.wantsExecutiveSupport || input.professionalDemand) {
    return "action";
  }

  if (input.consistencyScore !== undefined) {
    if (input.consistencyScore >= 8) return "maintenance";
    if (input.consistencyScore >= 5) return "action";
    if (input.consistencyScore >= 3) return "preparation";
  }

  if (input.currentActivityLevel === "vigorous" || input.currentActivityLevel === "moderate") {
    return "action";
  }

  if (input.currentActivityLevel === "light") {
    return "preparation";
  }

  if (input.wantsAccountability || input.wantsCommunity || input.servicePreference === "advanced") {
    return "preparation";
  }

  return "contemplation";
}

export function recommendMembership(input: MembershipRecommendationInput) {
  const stageOfChange = inferStage(input);
  let recommendedTier: MembershipTier = "free";

  if (input.corporateInterest || input.wantsExecutiveSupport || input.professionalDemand) {
    recommendedTier = "tier3";
  } else if (stageOfChange === "preparation") {
    recommendedTier = "tier1";
  } else if (stageOfChange === "action" || stageOfChange === "maintenance") {
    recommendedTier = "tier2";
  }

  const rationale: string[] = [];

  if (recommendedTier === "free") {
    rationale.push("You appear to be in an early awareness stage where social support and low-pressure learning matter most.");
    rationale.push("A free community layer keeps the barrier low while creating familiarity, trust, and small wins.");
  }
  if (recommendedTier === "tier1") {
    rationale.push("You sound ready to begin and would benefit from structure, beginner planning, and light accountability.");
    rationale.push("Tier 1 is designed for the preparation stage, where momentum grows from clear next steps and early social reinforcement.");
  }
  if (recommendedTier === "tier2") {
    rationale.push("You are already taking action or trying to stay consistent, so the next need is accountability, deeper programming, and group reinforcement.");
    rationale.push("Tier 2 is built to strengthen behavior maintenance through community challenges and visible progress.");
  }
  if (recommendedTier === "tier3") {
    rationale.push("Your responses suggest a need for high-touch support, fast access, and a premium coaching relationship.");
    rationale.push("Tier 3 is designed for executives, professionals, and high-performance clients who need efficient, personalized care.");
  }
  if (input.medicalFlag) {
    rationale.push("A physician-informed pathway can be layered in when risk, complexity, or lab-informed review is appropriate.");
  }

  const engagementScore = Math.min(
    100,
    20 +
      (input.wantsCommunity ? 10 : 0) +
      (input.wantsAccountability ? 15 : 0) +
      (input.servicePreference === "advanced" ? 10 : 0) +
      (input.currentActivityLevel === "moderate" ? 15 : 0) +
      (input.currentActivityLevel === "vigorous" ? 20 : 0) +
      (input.professionalDemand ? 10 : 0) +
      (input.corporateInterest ? 10 : 0) +
      Math.round((input.consistencyScore ?? 0) * 2),
  );

  const progression: MembershipTier[] = ["free", "tier1", "tier2", "tier3"];
  const currentIndex = progression.indexOf(recommendedTier);
  const nextTier = progression[Math.min(currentIndex + 1, progression.length - 1)];

  return {
    recommendedTier,
    stageOfChange,
    engagementScore,
    rationale,
    nextStep:
      recommendedTier === "free"
        ? "Start with community content, awareness challenges, and low-friction chatbot exploration."
        : recommendedTier === "tier1"
          ? "Begin structured onboarding, choose a starter program, and join an entry-level accountability loop."
          : recommendedTier === "tier2"
            ? "Commit to group coaching, progress dashboards, and weekly accountability milestones."
            : "Request executive onboarding and a premium planning consultation.",
    upgradeTarget: nextTier,
    upgradePrompt:
      recommendedTier === "free"
        ? "Upgrade when you are ready for a plan and guided accountability."
        : recommendedTier === "tier1"
          ? "Upgrade when you want stronger accountability, group coaching, and broader wellness support."
          : recommendedTier === "tier2"
            ? "Upgrade when you need elite personalization, direct access, and executive-level coordination."
            : "Stay in Tier 3 for premium performance optimization and coordinated expert access.",
  };
}
