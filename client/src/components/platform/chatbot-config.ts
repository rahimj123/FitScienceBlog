import { getMembershipTierLabel, getStageLabel, recommendMembership } from "@shared/membership";

export type ChatDraft = Record<string, string | boolean>;

export type ChatStep = {
  id: string;
  prompt: string;
  helper?: string;
  field: string;
  type: "text" | "email" | "phone" | "date" | "textarea" | "yesno" | "choice" | "number";
  options?: Array<{ label: string; value: string }>;
  include?: (draft: ChatDraft) => boolean;
};

export const chatbotSteps: ChatStep[] = [
  { id: "firstName", field: "firstName", prompt: "Let’s start with your first name.", type: "text" },
  { id: "lastName", field: "lastName", prompt: "And your last name?", type: "text" },
  { id: "email", field: "email", prompt: "What email should we use for your intake record?", type: "email" },
  { id: "phone", field: "phone", prompt: "What phone number would you like attached to your profile?", type: "phone" },
  { id: "dateOfBirth", field: "dateOfBirth", prompt: "What is your date of birth?", type: "date" },
  { id: "gender", field: "gender", prompt: "How would you like your gender recorded?", type: "text" },
  { id: "emergencyContactName", field: "emergencyContactName", prompt: "Who should we list as your emergency contact?", type: "text" },
  { id: "emergencyContactPhone", field: "emergencyContactPhone", prompt: "What is their phone number?", type: "phone" },
  {
    id: "disabilitySupport",
    field: "disabilitySupport",
    prompt: "Do you want us to note any disability or accessibility support needs?",
    type: "yesno",
  },
  { id: "mainGoals", field: "mainGoals", prompt: "What are your main goals right now?", type: "textarea" },
  {
    id: "stageOfChange",
    field: "stageOfChange",
    prompt: "Which statement best matches where you are right now?",
    type: "choice",
    options: [
      { label: "I am mostly exploring", value: "contemplation" },
      { label: "I am ready to start", value: "preparation" },
      { label: "I have started but want consistency", value: "action" },
      { label: "I am maintaining momentum", value: "maintenance" },
    ],
  },
  {
    id: "supportType",
    field: "supportType",
    prompt: "What kind of support feels most relevant at the moment?",
    type: "choice",
    options: [
      { label: "Exercise and fitness coaching", value: "fitness" },
      { label: "Broader whole-person wellness guidance", value: "wellness" },
      { label: "Not sure yet", value: "unsure" },
    ],
  },
  {
    id: "wantsCommunity",
    field: "wantsCommunity",
    prompt: "Would community support and group accountability help you stay engaged?",
    type: "yesno",
  },
  {
    id: "wantsAccountability",
    field: "wantsAccountability",
    prompt: "Would you benefit from structured accountability and milestone tracking?",
    type: "yesno",
  },
  {
    id: "professionalDemand",
    field: "professionalDemand",
    prompt: "Do you need a more time-efficient, premium wellness structure because of work or performance demands?",
    type: "yesno",
  },
  {
    id: "corporateInterest",
    field: "corporateInterest",
    prompt: "Is this support for an executive, leadership, or corporate wellness context?",
    type: "yesno",
  },
  {
    id: "activityLevel",
    field: "activityLevel",
    prompt: "How would you describe your current exercise or activity level?",
    type: "choice",
    options: [
      { label: "Minimal", value: "minimal" },
      { label: "Light", value: "light" },
      { label: "Moderate", value: "moderate" },
      { label: "Vigorous", value: "vigorous" },
    ],
  },
  { id: "exerciseHistory", field: "exerciseHistory", prompt: "Tell me a little about your exercise history.", type: "textarea" },
  { id: "availability", field: "availability", prompt: "How much time can you realistically set aside most weeks?", type: "textarea" },
  { id: "supportPreferences", field: "supportPreferences", prompt: "What kind of support helps you stay consistent?", type: "textarea" },
  {
    id: "heartCondition",
    field: "heartCondition",
    prompt: "Has a clinician ever advised you to be careful with exercise because of a heart-related concern?",
    type: "yesno",
  },
  {
    id: "chestDiscomfort",
    field: "chestDiscomfort",
    prompt: "Have you noticed chest symptoms during rest or activity that you think we should note before exercise planning?",
    type: "yesno",
  },
  {
    id: "dizzinessOrFainting",
    field: "dizzinessOrFainting",
    prompt: "Have you recently experienced fainting, near-fainting, dizziness, or loss of balance?",
    type: "yesno",
  },
  {
    id: "breathingIssues",
    field: "breathingIssues",
    prompt: "Do breathing concerns sometimes need urgent attention or strongly affect activity?",
    type: "yesno",
  },
  {
    id: "diabetesManagementConcern",
    field: "diabetesManagementConcern",
    prompt: "Would exercise planning need to account for diabetes or blood sugar management?",
    type: "yesno",
  },
  {
    id: "exerciseModificationCondition",
    field: "exerciseModificationCondition",
    prompt: "Do you have any health conditions that may call for exercise modifications?",
    type: "yesno",
  },
  {
    id: "musculoskeletalLimitation",
    field: "musculoskeletalLimitation",
    prompt: "Do joint, muscle, pain, or movement limitations affect what you can comfortably do?",
    type: "yesno",
  },
  { id: "lightMinutes", field: "lightMinutes", prompt: "How many light movement minutes do you usually get in a week?", type: "number" },
  { id: "moderateMinutes", field: "moderateMinutes", prompt: "How many moderate activity minutes do you usually get in a week?", type: "number" },
  { id: "vigorousMinutes", field: "vigorousMinutes", prompt: "How many vigorous activity minutes do you usually get in a week?", type: "number" },
  {
    id: "smokingHistory",
    field: "smokingHistory",
    prompt: "Would you like us to note any smoking history as part of your intake?",
    type: "yesno",
  },
  {
    id: "bloodPressureHistory",
    field: "bloodPressureHistory",
    prompt: "Have you had blood pressure history that you think we should include?",
    type: "yesno",
  },
  {
    id: "cholesterolHistory",
    field: "cholesterolHistory",
    prompt: "Any cholesterol or lipid history worth noting?",
    type: "yesno",
  },
  {
    id: "bloodGlucoseHistory",
    field: "bloodGlucoseHistory",
    prompt: "Any blood sugar history you would like captured?",
    type: "yesno",
  },
  {
    id: "priorHospitalizations",
    field: "priorHospitalizations",
    prompt: "Have there been recent hospital admissions or health events we should know about?",
    type: "yesno",
  },
  {
    id: "pregnancyRelated",
    field: "pregnancyRelated",
    prompt: "Are there any pregnancy or postpartum considerations we should keep in mind?",
    type: "yesno",
  },
  {
    id: "medicationConsiderations",
    field: "medicationConsiderations",
    prompt: "Do you take medications or supplements that you would like reflected in your intake?",
    type: "yesno",
  },
  {
    id: "injuryHistory",
    field: "injuryHistory",
    prompt: "Any injury or joint limitations you would like us to note?",
    type: "yesno",
  },
  { id: "riskDetails", field: "riskDetails", prompt: "Is there any context you want to add around those health or movement considerations?", type: "textarea" },
  {
    id: "sleepQuality",
    field: "sleepQuality",
    prompt: "How would you describe your current sleep pattern?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "stressLoad",
    field: "stressLoad",
    prompt: "How would you describe your current stress load?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "emotionalWellbeing",
    field: "emotionalWellbeing",
    prompt: "How has your emotional wellbeing been feeling lately in day-to-day life?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "nutritionPattern",
    field: "nutritionPattern",
    prompt: "What do your nutrition habits or daily eating patterns generally look like?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "dailyRoutine",
    field: "dailyRoutine",
    prompt: "What does a typical day look like for you right now?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "motivation",
    field: "motivation",
    prompt: "What is motivating you to seek support at this point?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "barriers",
    field: "barriers",
    prompt: "What tends to get in the way when you try to follow through on your goals?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "supportSystem",
    field: "supportSystem",
    prompt: "Who or what currently supports you in your health and wellbeing?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "broaderGoals",
    field: "broaderGoals",
    prompt: "What broader wellness goals would you like this team to understand?",
    type: "textarea",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "physicianReadiness",
    field: "physicianReadiness",
    prompt: "If appropriate after intake review, would you be open to a physician consultation with Dr. Shireen Jindani?",
    type: "yesno",
    include: (draft) => draft.supportType === "wellness" || draft.pathwayInterest === "wellness_consultation",
  },
  {
    id: "coachingConsent",
    field: "coachingConsent",
    prompt: "Do you agree that coaching support is educational and wellness-focused, and not a substitute for diagnosis or treatment?",
    type: "yesno",
  },
  {
    id: "privacyConsent",
    field: "privacyConsent",
    prompt: "Do you agree to the secure use of your intake information for onboarding, planning, and appropriate follow-up?",
    type: "yesno",
  },
  {
    id: "physicianConsultConsent",
    field: "physicianConsultConsent",
    prompt: "Do you understand that any physician consultation is separate from coaching and only occurs through formal booking and review?",
    type: "yesno",
  },
  {
    id: "emergencyContactAcknowledgement",
    field: "emergencyContactAcknowledgement",
    prompt: "Do you confirm that the emergency contact details you provided are accurate to the best of your knowledge?",
    type: "yesno",
  },
  { id: "signature", field: "signature", prompt: "Please type your full name as your confirmation.", type: "text" },
];

export function recommendChatbotPathway(draft: ChatDraft) {
  const redFlag =
    draft.heartCondition === true ||
    draft.chestDiscomfort === true ||
    draft.dizzinessOrFainting === true ||
    draft.breathingIssues === true;

  if (redFlag) {
    return {
      pathway: "needs_medical_clearance",
      reason: "A few responses suggest that extra review would be sensible before exercise planning.",
    };
  }

  const broaderSupport =
    draft.pathwayInterest === "wellness_consultation" ||
    draft.supportType === "wellness" ||
    draft.physicianReadiness === true;

  if (broaderSupport) {
    return {
      pathway: "wellness_consultation",
      reason: "Your responses point toward a broader whole-person wellness pathway with optional physician review when appropriate.",
    };
  }

  return {
    pathway: "fitness_journey",
    reason: "Your responses fit best with a coaching-led fitness and wellness starting point.",
  };
}

export function recommendChatbotJourney(draft: ChatDraft) {
  const pathwayRecommendation = recommendChatbotPathway(draft);
  const membership = recommendMembership({
    stageOfChange:
      typeof draft.stageOfChange === "string"
        ? (draft.stageOfChange as "contemplation" | "preparation" | "action" | "maintenance")
        : undefined,
    currentActivityLevel:
      typeof draft.activityLevel === "string"
        ? (draft.activityLevel as "minimal" | "light" | "moderate" | "vigorous")
        : undefined,
    servicePreference: pathwayRecommendation.pathway === "fitness_journey" ? "fitness" : "advanced",
    supportType: typeof draft.supportType === "string" ? (draft.supportType as "fitness" | "wellness" | "unsure") : undefined,
    broaderSupport: pathwayRecommendation.pathway !== "fitness_journey",
    wantsCommunity: draft.wantsCommunity === true,
    wantsAccountability: draft.wantsAccountability === true,
    wantsExecutiveSupport: draft.professionalDemand === true || draft.corporateInterest === true,
    professionalDemand: draft.professionalDemand === true,
    corporateInterest: draft.corporateInterest === true,
    medicalFlag:
      draft.heartCondition === true ||
      draft.chestDiscomfort === true ||
      draft.dizzinessOrFainting === true ||
      draft.breathingIssues === true,
  });

  return {
    ...pathwayRecommendation,
    ...membership,
    summary: `${getStageLabel(membership.stageOfChange)} stage, ${getMembershipTierLabel(membership.recommendedTier)} recommended.`,
  };
}
