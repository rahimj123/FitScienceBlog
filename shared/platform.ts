import { z } from "zod";

export const platformRoleSchema = z.enum(["coach", "physician", "admin"]);

export const onboardingSchema = z.object({
  basicInfo: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    dateOfBirth: z.string().min(1),
    gender: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(6),
    emergencyContactName: z.string().min(2),
    emergencyContactPhone: z.string().min(6),
    servicePreference: z.enum(["fitness", "advanced"]),
    disabilityFlag: z.boolean().default(false),
  }),
  screeningStage1: z.object({
    heartCondition: z.boolean(),
    chestDiscomfort: z.boolean(),
    dizzinessOrFainting: z.boolean(),
    breathingIssues: z.boolean(),
    diabetesManagementConcern: z.boolean(),
    musculoskeletalLimitation: z.boolean(),
    currentActivityLevel: z.enum(["minimal", "light", "moderate", "vigorous"]),
    lightActivityMinutes: z.coerce.number().int().min(0).max(2000),
    moderateActivityMinutes: z.coerce.number().int().min(0).max(2000),
    vigorousActivityMinutes: z.coerce.number().int().min(0).max(2000),
    notes: z.string().max(1000).optional().or(z.literal("")),
  }),
  screeningStage2: z.object({
    smokingHistory: z.boolean(),
    bloodPressureHistory: z.boolean(),
    cholesterolHistory: z.boolean(),
    bloodGlucoseHistory: z.boolean(),
    medicationConsiderations: z.boolean(),
    priorHospitalizations: z.boolean(),
    pregnancyRelated: z.boolean(),
    injuryHistory: z.boolean(),
    details: z.string().max(1500).optional().or(z.literal("")),
  }),
  wellnessHistory: z.object({
    sleepQuality: z.string().min(2),
    stressLoad: z.string().min(2),
    nutritionPattern: z.string().min(2),
    movementHistory: z.string().min(2),
    mentalWellbeing: z.string().min(2),
    primaryGoals: z.string().min(2),
    currentBarriers: z.string().min(2),
    advancedInterest: z.boolean().default(false),
  }).optional(),
  consents: z.object({
    coachingConsent: z.literal(true),
    privacyConsent: z.literal(true),
    physicianConsultConsent: z.boolean(),
    liabilityAcknowledgement: z.literal(true),
    signature: z.string().min(2),
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const physicianReviewSchema = z.object({
  profileId: z.string().min(1),
  consultationBookedAt: z.string().optional(),
  consultationStatus: z.enum(["not_booked", "booked", "completed"]),
  reviewSummary: z.string().max(3000).optional(),
  clearanceDecision: z.enum(["no_review_needed", "wellness_review_only", "medical_clearance_needed"]),
  labRecommendations: z.array(
    z.object({
      title: z.string().min(2),
      rationale: z.string().min(2),
      status: z.enum(["recommended", "deferred"]),
    }),
  ).default([]),
});

export type PhysicianReviewInput = z.infer<typeof physicianReviewSchema>;
