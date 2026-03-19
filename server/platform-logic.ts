import type { OnboardingInput } from "@shared/platform";

export type PathwayResult = {
  pathwayType: "fitness_pathway" | "advanced_wellness_pathway" | "needs_medical_clearance";
  requiresClearance: boolean;
  redFlags: Array<{ flagType: string; severity: "moderate" | "high"; description: string }>;
};

export function computeAge(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthOffset = today.getMonth() - dob.getMonth();
  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function computeWeeklyActivityMinutes(input: OnboardingInput["screeningStage1"]) {
  return input.lightActivityMinutes + input.moderateActivityMinutes + input.vigorousActivityMinutes * 2;
}

export function determineCategories(dateOfBirth: string, disabilityFlag: boolean) {
  const age = computeAge(dateOfBirth);
  const categories = [];

  if (age < 18) {
    categories.push("under_18");
  }
  if (age >= 18 && age <= 50) {
    categories.push("age_18_to_50");
  }
  if (age >= 45 && age <= 80) {
    categories.push("age_45_to_80");
  }
  if (disabilityFlag) {
    categories.push("disability");
  }

  return { age, categories };
}

export function determinePathway(input: OnboardingInput): PathwayResult {
  const redFlags: PathwayResult["redFlags"] = [];
  const age = computeAge(input.basicInfo.dateOfBirth);
  const stage1 = input.screeningStage1;
  const stage2 = input.screeningStage2;
  const wantsAdvanced = input.basicInfo.servicePreference === "advanced" || Boolean(input.wellnessHistory?.advancedInterest);

  if (stage1.heartCondition) {
    redFlags.push({
      flagType: "heart_condition",
      severity: "high",
      description: "Client reported a history suggestive of a cardiovascular condition.",
    });
  }
  if (stage1.chestDiscomfort) {
    redFlags.push({
      flagType: "chest_discomfort",
      severity: "high",
      description: "Client reported chest discomfort relevant to exercise safety screening.",
    });
  }
  if (stage1.dizzinessOrFainting) {
    redFlags.push({
      flagType: "dizziness_or_fainting",
      severity: "high",
      description: "Client reported dizziness or fainting concerns.",
    });
  }
  if (stage1.breathingIssues || stage1.diabetesManagementConcern || stage2.medicationConsiderations) {
    redFlags.push({
      flagType: "medical_considerations",
      severity: "moderate",
      description: "Client reported active medical considerations that may need physician review or clearance.",
    });
  }
  if (stage2.priorHospitalizations || stage2.pregnancyRelated) {
    redFlags.push({
      flagType: "recent_health_history",
      severity: "moderate",
      description: "Client reported recent hospitalization or pregnancy-related consideration.",
    });
  }
  if (stage1.musculoskeletalLimitation || stage2.injuryHistory) {
    redFlags.push({
      flagType: "movement_limitations",
      severity: "moderate",
      description: "Client reported musculoskeletal or injury-related limitations that may affect exercise planning.",
    });
  }
  if (age < 18) {
    redFlags.push({
      flagType: "under_18",
      severity: "moderate",
      description: "Client is under 18 and requires additional review before standard adult coaching flow.",
    });
  }

  if (redFlags.some((item) => item.severity === "high")) {
    return {
      pathwayType: "needs_medical_clearance",
      requiresClearance: true,
      redFlags,
    };
  }

  if (wantsAdvanced || redFlags.length > 0) {
    return {
      pathwayType: "advanced_wellness_pathway",
      requiresClearance: redFlags.length > 0,
      redFlags,
    };
  }

  return {
    pathwayType: "fitness_pathway",
    requiresClearance: false,
    redFlags,
  };
}
