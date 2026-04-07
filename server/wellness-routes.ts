import type { Express, Request, Response } from "express";
import { prisma } from "./prisma";
import { z } from "zod";

// ── Validation Schemas ───────────────────────────────────────────────────────

const providerTypeEnum = z.enum(["physician", "trainer", "nutritionist", "wellness_doctor"]);

const createProviderSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  providerType: providerTypeEnum,
  specialization: z.string().optional(),
  credentials: z.array(z.string()).default([]),
  bio: z.string().optional(),
  profileImageUrl: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  locationCity: z.string().optional().nullable(),
  locationCountry: z.string().optional().nullable(),
  isAcceptingClients: z.boolean().default(true),
  availabilityNote: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
});

const connectProviderSchema = z.object({
  profileId: z.string().min(1),
  providerId: z.string().min(1),
  requestNote: z.string().optional(),
});

const createLabTestSchema = z.object({
  profileId: z.string().min(1),
  testType: z.enum(["annual", "follow_up", "on_demand"]),
  testName: z.string().min(2),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  recommendedBy: z.string().optional(),
});

const recordBiomarkerResultSchema = z.object({
  profileId: z.string().min(1),
  biomarkerId: z.string().min(1),
  labTestId: z.string().optional(),
  value: z.coerce.number(),
  testedAt: z.string().datetime(),
  note: z.string().optional(),
});

const createProtocolSchema = z.object({
  title: z.string().min(2),
  protocolType: z.enum(["nutrition", "supplement", "exercise", "sleep", "whole_body"]),
  goal: z.string().optional(),
  durationWeeks: z.coerce.number().int().min(1).optional(),
  description: z.string().min(10),
  steps: z.array(
    z.object({
      order: z.number().int().min(1),
      instruction: z.string().min(2),
      frequency: z.string().min(1),
    }),
  ).default([]),
  tags: z.array(z.string()).default([]),
  isTemplate: z.boolean().default(true),
  providerId: z.string().optional().nullable(),
});

const assignProtocolSchema = z.object({
  profileId: z.string().min(1),
  protocolId: z.string().min(1),
  assignedBy: z.string().optional(),
  notes: z.string().optional(),
});

// ── Helper: compute biomarker status ────────────────────────────────────────
function computeBiomarkerStatus(
  value: number,
  low: number | null,
  high: number | null,
): string {
  if (low === null || high === null) return "in_range";
  if (value < low * 0.8) return "critical_low";
  if (value > high * 1.2) return "critical_high";
  if (value < low) return "low";
  if (value > high) return "high";
  return "in_range";
}

// ── Seed default biomarker categories + biomarkers ──────────────────────────
const DEFAULT_CATEGORIES = [
  {
    name: "Heart & Cardiovascular",
    slug: "cardiovascular",
    description: "Markers related to heart health, lipid balance, and circulatory function.",
    icon: "heart",
    colorHex: "#ef4444",
    sortOrder: 1,
    biomarkers: [
      { name: "Total Cholesterol", slug: "total-cholesterol", unit: "mg/dL", referenceRangeLow: 0, referenceRangeHigh: 200, optimalRangeLow: 150, optimalRangeHigh: 180, description: "Total amount of cholesterol in your blood.", whyItMatters: "Elevated cholesterol is a key risk factor for cardiovascular disease.", whatAffectsIt: "Diet (saturated fats, trans fats), physical activity, genetics, body weight." },
      { name: "LDL Cholesterol", slug: "ldl-cholesterol", unit: "mg/dL", referenceRangeLow: 0, referenceRangeHigh: 100, optimalRangeLow: 0, optimalRangeHigh: 70, description: "Low-density lipoprotein, often called 'bad' cholesterol.", whyItMatters: "High LDL contributes to arterial plaque buildup and heart disease risk.", whatAffectsIt: "Saturated fat intake, genetics, physical activity levels." },
      { name: "HDL Cholesterol", slug: "hdl-cholesterol", unit: "mg/dL", referenceRangeLow: 40, referenceRangeHigh: 999, optimalRangeLow: 60, optimalRangeHigh: 999, description: "High-density lipoprotein, often called 'good' cholesterol.", whyItMatters: "HDL helps remove other forms of cholesterol from the bloodstream.", whatAffectsIt: "Exercise, diet, smoking cessation, moderate alcohol intake." },
      { name: "Triglycerides", slug: "triglycerides", unit: "mg/dL", referenceRangeLow: 0, referenceRangeHigh: 150, optimalRangeLow: 0, optimalRangeHigh: 100, description: "A type of fat found in the blood.", whyItMatters: "High triglycerides are linked to cardiovascular disease and metabolic syndrome.", whatAffectsIt: "Sugar and refined carb intake, alcohol, obesity, physical inactivity." },
      { name: "hsCRP", slug: "hs-crp", unit: "mg/L", referenceRangeLow: 0, referenceRangeHigh: 1.0, optimalRangeLow: 0, optimalRangeHigh: 0.5, description: "High-sensitivity C-reactive protein — a marker of systemic inflammation.", whyItMatters: "Elevated hsCRP predicts future cardiovascular events independently of cholesterol.", whatAffectsIt: "Infection, chronic stress, diet, sleep quality, exercise." },
    ],
  },
  {
    name: "Metabolic Health",
    slug: "metabolic",
    description: "Markers reflecting blood sugar regulation, insulin sensitivity, and metabolic efficiency.",
    icon: "activity",
    colorHex: "#f97316",
    sortOrder: 2,
    biomarkers: [
      { name: "Fasting Glucose", slug: "fasting-glucose", unit: "mg/dL", referenceRangeLow: 70, referenceRangeHigh: 100, optimalRangeLow: 75, optimalRangeHigh: 90, description: "Blood sugar level after an overnight fast.", whyItMatters: "Sustained high glucose contributes to insulin resistance, diabetes, and accelerated aging.", whatAffectsIt: "Diet, physical activity, stress, sleep, medications." },
      { name: "HbA1c", slug: "hba1c", unit: "%", referenceRangeLow: 0, referenceRangeHigh: 5.7, optimalRangeLow: 0, optimalRangeHigh: 5.2, description: "Average blood glucose over the past 2-3 months.", whyItMatters: "Reflects long-term blood sugar control; predicts diabetes risk and complications.", whatAffectsIt: "Dietary carbohydrate intake, physical activity, sleep quality, stress." },
      { name: "Fasting Insulin", slug: "fasting-insulin", unit: "µIU/mL", referenceRangeLow: 2, referenceRangeHigh: 25, optimalRangeLow: 2, optimalRangeHigh: 8, description: "Baseline insulin level when fasting.", whyItMatters: "Elevated fasting insulin indicates early insulin resistance before glucose rises.", whatAffectsIt: "Carbohydrate intake, body fat percentage, physical activity, sleep." },
      { name: "HOMA-IR", slug: "homa-ir", unit: "index", referenceRangeLow: 0, referenceRangeHigh: 2.0, optimalRangeLow: 0, optimalRangeHigh: 1.0, description: "Homeostatic Model Assessment of Insulin Resistance.", whyItMatters: "A composite measure of insulin resistance using glucose and insulin values.", whatAffectsIt: "Calculated from fasting glucose and insulin levels." },
    ],
  },
  {
    name: "Nutrients & Vitamins",
    slug: "nutrients",
    description: "Essential vitamins, minerals, and micronutrients that fuel cellular function.",
    icon: "leaf",
    colorHex: "#22c55e",
    sortOrder: 3,
    biomarkers: [
      { name: "Vitamin D (25-OH)", slug: "vitamin-d", unit: "ng/mL", referenceRangeLow: 30, referenceRangeHigh: 100, optimalRangeLow: 50, optimalRangeHigh: 80, description: "The storage form of vitamin D, reflecting total body status.", whyItMatters: "Vitamin D deficiency is linked to immune dysfunction, bone loss, depression, and cancer risk.", whatAffectsIt: "Sun exposure, diet (fatty fish, eggs), supplementation, skin tone, latitude." },
      { name: "Vitamin B12", slug: "vitamin-b12", unit: "pg/mL", referenceRangeLow: 200, referenceRangeHigh: 900, optimalRangeLow: 400, optimalRangeHigh: 900, description: "Essential vitamin for nerve function and red blood cell production.", whyItMatters: "Deficiency causes neurological damage, fatigue, and anemia.", whatAffectsIt: "Animal product consumption, gut absorption, medications (e.g., metformin, PPIs)." },
      { name: "Ferritin", slug: "ferritin", unit: "ng/mL", referenceRangeLow: 12, referenceRangeHigh: 300, optimalRangeLow: 50, optimalRangeHigh: 150, description: "The body's main iron storage protein.", whyItMatters: "Low ferritin impairs energy production, cognitive function, and athletic recovery.", whatAffectsIt: "Dietary iron intake, blood loss, gut absorption, inflammation." },
      { name: "Magnesium (RBC)", slug: "magnesium-rbc", unit: "mg/dL", referenceRangeLow: 4.2, referenceRangeHigh: 6.8, optimalRangeLow: 5.2, optimalRangeHigh: 6.5, description: "Intracellular magnesium reflecting tissue stores.", whyItMatters: "Magnesium is involved in 300+ enzymatic reactions; deficiency causes fatigue, cramps, and poor sleep.", whatAffectsIt: "Diet (leafy greens, nuts, seeds), alcohol, stress, medications." },
      { name: "Zinc", slug: "zinc", unit: "µg/dL", referenceRangeLow: 60, referenceRangeHigh: 120, optimalRangeLow: 80, optimalRangeHigh: 110, description: "An essential trace mineral involved in immunity and hormone synthesis.", whyItMatters: "Zinc deficiency impairs immune function, wound healing, and testosterone production.", whatAffectsIt: "Animal protein intake, plant-based diet (phytates block absorption), stress, aging." },
      { name: "Omega-3 Index", slug: "omega-3-index", unit: "%", referenceRangeLow: 4, referenceRangeHigh: 12, optimalRangeLow: 8, optimalRangeHigh: 12, description: "Percentage of EPA + DHA in red blood cell membranes.", whyItMatters: "A low omega-3 index is a significant cardiovascular and cognitive risk factor.", whatAffectsIt: "Fatty fish consumption, fish oil supplementation, overall dietary fat quality." },
    ],
  },
  {
    name: "Hormones",
    slug: "hormones",
    description: "Key hormones governing energy, mood, body composition, and reproductive health.",
    icon: "zap",
    colorHex: "#a855f7",
    sortOrder: 4,
    biomarkers: [
      { name: "Free Testosterone", slug: "free-testosterone", unit: "pg/mL", referenceRangeLow: 5, referenceRangeHigh: 21, optimalRangeLow: 12, optimalRangeHigh: 21, description: "The biologically active fraction of testosterone.", whyItMatters: "Low free testosterone impacts muscle mass, energy, libido, mood, and fat distribution.", whatAffectsIt: "Age, sleep quality, stress, exercise, body fat percentage, alcohol." },
      { name: "Cortisol (AM)", slug: "cortisol-am", unit: "µg/dL", referenceRangeLow: 6, referenceRangeHigh: 23, optimalRangeLow: 10, optimalRangeHigh: 20, description: "Morning cortisol, reflecting HPA axis function.", whyItMatters: "Chronically elevated or suppressed cortisol disrupts metabolism, immunity, sleep, and cognition.", whatAffectsIt: "Stress, sleep quality, circadian rhythm, nutrition, exercise." },
      { name: "TSH", slug: "tsh", unit: "mIU/L", referenceRangeLow: 0.45, referenceRangeHigh: 4.5, optimalRangeLow: 0.5, optimalRangeHigh: 2.0, description: "Thyroid Stimulating Hormone — reflects thyroid gland activity.", whyItMatters: "Thyroid dysfunction affects energy, weight, mood, heart rate, and cognition.", whatAffectsIt: "Iodine intake, selenium, autoimmune conditions, medications, stress." },
      { name: "DHEA-S", slug: "dhea-s", unit: "µg/dL", referenceRangeLow: 65, referenceRangeHigh: 380, optimalRangeLow: 150, optimalRangeHigh: 380, description: "The sulfate form of DHEA, a precursor to sex hormones.", whyItMatters: "DHEA-S declines with age and supports energy, immune function, and hormone balance.", whatAffectsIt: "Age, chronic stress, sleep quality, nutrition." },
    ],
  },
  {
    name: "Kidney & Liver Function",
    slug: "kidney-liver",
    description: "Markers assessing detoxification, filtration, and organ health.",
    icon: "shield",
    colorHex: "#3b82f6",
    sortOrder: 5,
    biomarkers: [
      { name: "eGFR", slug: "egfr", unit: "mL/min/1.73m²", referenceRangeLow: 60, referenceRangeHigh: 999, optimalRangeLow: 90, optimalRangeHigh: 999, description: "Estimated glomerular filtration rate — kidney filtering capacity.", whyItMatters: "eGFR below 60 indicates chronic kidney disease; early detection allows intervention.", whatAffectsIt: "Hydration, blood pressure, diabetes, NSAIDs, age." },
      { name: "ALT", slug: "alt", unit: "U/L", referenceRangeLow: 7, referenceRangeHigh: 56, optimalRangeLow: 7, optimalRangeHigh: 30, description: "Alanine aminotransferase — a liver enzyme.", whyItMatters: "Elevated ALT signals liver cell damage from fatty liver, alcohol, or toxin exposure.", whatAffectsIt: "Alcohol, fructose intake, medications, body weight, exercise intensity." },
      { name: "AST", slug: "ast", unit: "U/L", referenceRangeLow: 10, referenceRangeHigh: 40, optimalRangeLow: 10, optimalRangeHigh: 25, description: "Aspartate aminotransferase — found in liver and muscle.", whyItMatters: "Elevated AST alongside ALT indicates liver pathology; isolated elevation may reflect muscle damage.", whatAffectsIt: "Liver health, intense exercise, alcohol, medications." },
    ],
  },
  {
    name: "Blood & Inflammation",
    slug: "blood-inflammation",
    description: "Complete blood count markers and inflammatory indicators.",
    icon: "droplet",
    colorHex: "#ec4899",
    sortOrder: 6,
    biomarkers: [
      { name: "Hemoglobin", slug: "hemoglobin", unit: "g/dL", referenceRangeLow: 12, referenceRangeHigh: 17.5, optimalRangeLow: 13.5, optimalRangeHigh: 17.5, description: "The oxygen-carrying protein in red blood cells.", whyItMatters: "Low hemoglobin (anemia) causes fatigue, poor exercise performance, and cognitive impairment.", whatAffectsIt: "Iron, B12, folate status; chronic disease; blood loss." },
      { name: "Homocysteine", slug: "homocysteine", unit: "µmol/L", referenceRangeLow: 0, referenceRangeHigh: 15, optimalRangeLow: 0, optimalRangeHigh: 8, description: "An inflammatory amino acid linked to cardiovascular and cognitive risk.", whyItMatters: "Elevated homocysteine is an independent risk factor for heart disease, stroke, and dementia.", whatAffectsIt: "B6, B12, folate status; genetic variants (MTHFR); renal function." },
    ],
  },
];

// ── Seed function ─────────────────────────────────────────────────────────
export async function seedBiomarkerCategories() {
  const prismaClient = prisma!;
  for (const cat of DEFAULT_CATEGORIES) {
    const { biomarkers: bms, ...catData } = cat;
    const category = await prismaClient.biomarkerCategory.upsert({
      where: { slug: catData.slug },
      update: catData,
      create: catData,
    });
    for (const bm of bms) {
      await prismaClient.biomarker.upsert({
        where: { slug: bm.slug },
        update: { ...bm, categoryId: category.id },
        create: { ...bm, categoryId: category.id },
      });
    }
  }
}

// ── Route Registration ────────────────────────────────────────────────────
export async function registerWellnessRoutes(app: Express): Promise<void> {
  const prismaClient = prisma!;

  // Seed default biomarkers on startup
  await seedBiomarkerCategories().catch((e) => console.error("Biomarker seed error:", e));

  // ── PROVIDER ROUTES ───────────────────────────────────────────────────

  // GET /api/wellness/providers — list all providers (optionally filtered by type)
  app.get("/api/wellness/providers", async (req: Request, res: Response) => {
    try {
      const { type, accepting } = req.query;
      const where: Record<string, unknown> = {};
      if (type) where.providerType = type;
      if (accepting === "true") where.isAcceptingClients = true;

      const providers = await prismaClient.wellnessProvider.findMany({
        where,
        orderBy: [{ isVerified: "desc" }, { lastName: "asc" }],
      });
      return res.json(providers);
    } catch (err) {
      console.error("GET /api/wellness/providers error:", err);
      return res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  // GET /api/wellness/providers/:id — single provider detail
  app.get("/api/wellness/providers/:id", async (req: Request, res: Response) => {
    try {
      const provider = await prismaClient.wellnessProvider.findUnique({
        where: { id: req.params.id },
      });
      if (!provider) return res.status(404).json({ message: "Provider not found" });
      return res.json(provider);
    } catch (err) {
      console.error("GET /api/wellness/providers/:id error:", err);
      return res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  // POST /api/wellness/providers — create a provider (admin only)
  app.post("/api/wellness/providers", async (req: Request, res: Response) => {
    try {
      const data = createProviderSchema.parse(req.body);
      const provider = await prismaClient.wellnessProvider.create({ data });
      return res.status(201).json(provider);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("POST /api/wellness/providers error:", err);
      return res.status(500).json({ message: "Failed to create provider" });
    }
  });

  // POST /api/wellness/provider-connections — client opts into a provider
  app.post("/api/wellness/provider-connections", async (req: Request, res: Response) => {
    try {
      const data = connectProviderSchema.parse(req.body);
      const existing = await prismaClient.providerClientConnection.findUnique({
        where: { profileId_providerId: { profileId: data.profileId, providerId: data.providerId } },
      });
      if (existing) {
        return res.status(409).json({ message: "Connection already exists", connection: existing });
      }
      const connection = await prismaClient.providerClientConnection.create({ data });
      return res.status(201).json(connection);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("POST /api/wellness/provider-connections error:", err);
      return res.status(500).json({ message: "Failed to create connection" });
    }
  });

  // GET /api/wellness/provider-connections/:profileId — get a client's providers
  app.get("/api/wellness/provider-connections/:profileId", async (req: Request, res: Response) => {
    try {
      const connections = await prismaClient.providerClientConnection.findMany({
        where: { profileId: req.params.profileId },
        include: { provider: true },
        orderBy: { createdAt: "desc" },
      });
      return res.json(connections);
    } catch (err) {
      console.error("GET /api/wellness/provider-connections/:profileId error:", err);
      return res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  // PATCH /api/wellness/provider-connections/:id — update connection status
  app.patch("/api/wellness/provider-connections/:id", async (req: Request, res: Response) => {
    try {
      const { status } = z.object({ status: z.enum(["pending", "active", "paused", "ended"]) }).parse(req.body);
      const connection = await prismaClient.providerClientConnection.update({
        where: { id: req.params.id },
        data: { status, acceptedAt: status === "active" ? new Date() : undefined },
      });
      return res.json(connection);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("PATCH /api/wellness/provider-connections/:id error:", err);
      return res.status(500).json({ message: "Failed to update connection" });
    }
  });

  // ── BIOMARKER ROUTES ─────────────────────────────────────────────────

  // GET /api/wellness/biomarker-categories — all categories with biomarkers
  app.get("/api/wellness/biomarker-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await prismaClient.biomarkerCategory.findMany({
        include: { biomarkers: true },
        orderBy: { sortOrder: "asc" },
      });
      return res.json(categories);
    } catch (err) {
      console.error("GET /api/wellness/biomarker-categories error:", err);
      return res.status(500).json({ message: "Failed to fetch biomarker categories" });
    }
  });

  // GET /api/wellness/biomarkers/:slug — biomarker detail
  app.get("/api/wellness/biomarkers/:slug", async (req: Request, res: Response) => {
    try {
      const biomarker = await prismaClient.biomarker.findUnique({
        where: { slug: req.params.slug },
        include: { category: true },
      });
      if (!biomarker) return res.status(404).json({ message: "Biomarker not found" });
      return res.json(biomarker);
    } catch (err) {
      console.error("GET /api/wellness/biomarkers/:slug error:", err);
      return res.status(500).json({ message: "Failed to fetch biomarker" });
    }
  });

  // GET /api/wellness/biomarker-results/:profileId — all results for a client
  app.get("/api/wellness/biomarker-results/:profileId", async (req: Request, res: Response) => {
    try {
      const results = await prismaClient.userBiomarkerResult.findMany({
        where: { profileId: req.params.profileId },
        include: { biomarker: { include: { category: true } }, labTest: true },
        orderBy: { testedAt: "desc" },
      });
      return res.json(results);
    } catch (err) {
      console.error("GET /api/wellness/biomarker-results/:profileId error:", err);
      return res.status(500).json({ message: "Failed to fetch biomarker results" });
    }
  });

  // POST /api/wellness/biomarker-results — record a new result
  app.post("/api/wellness/biomarker-results", async (req: Request, res: Response) => {
    try {
      const data = recordBiomarkerResultSchema.parse(req.body);
      // Look up the biomarker to compute status
      const biomarker = await prismaClient.biomarker.findUnique({ where: { id: data.biomarkerId } });
      if (!biomarker) return res.status(404).json({ message: "Biomarker not found" });
      const status = computeBiomarkerStatus(data.value, biomarker.referenceRangeLow, biomarker.referenceRangeHigh);
      const result = await prismaClient.userBiomarkerResult.create({
        data: {
          ...data,
          testedAt: new Date(data.testedAt),
          status,
        },
        include: { biomarker: { include: { category: true } } },
      });
      return res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("POST /api/wellness/biomarker-results error:", err);
      return res.status(500).json({ message: "Failed to record biomarker result" });
    }
  });

  // GET /api/wellness/health-summary/:profileId — dashboard summary stats
  app.get("/api/wellness/health-summary/:profileId", async (req: Request, res: Response) => {
    try {
      const { profileId } = req.params;
      // Get the most recent result for each biomarker
      const allResults = await prismaClient.userBiomarkerResult.findMany({
        where: { profileId },
        orderBy: { testedAt: "desc" },
        include: { biomarker: { include: { category: true } }, labTest: true },
      });

      // Deduplicate to latest per biomarker
      const latestMap = new Map<string, typeof allResults[number]>();
      for (const r of allResults) {
        if (!latestMap.has(r.biomarkerId)) latestMap.set(r.biomarkerId, r);
      }
      const latest = Array.from(latestMap.values());
      const total = latest.length;
      const inRange = latest.filter((r) => r.status === "in_range").length;
      const outOfRange = total - inRange;
      const pctInRange = total > 0 ? Math.round((inRange / total) * 100) : null;

      // Most recent lab test
      const lastTest = await prismaClient.labTest.findFirst({
        where: { profileId, status: "completed" },
        orderBy: { completedAt: "desc" },
      });
      // Upcoming lab test
      const nextTest = await prismaClient.labTest.findFirst({
        where: { profileId, status: { in: ["scheduled", "sample_collected", "processing"] } },
        orderBy: { scheduledAt: "asc" },
      });

      return res.json({
        profileId,
        totalBiomarkersTested: total,
        inRangeCount: inRange,
        outOfRangeCount: outOfRange,
        percentInRange: pctInRange,
        latestResults: latest,
        lastTestCompletedAt: lastTest?.completedAt ?? null,
        nextTestScheduledAt: nextTest?.scheduledAt ?? null,
        nextTestName: nextTest?.testName ?? null,
      });
    } catch (err) {
      console.error("GET /api/wellness/health-summary/:profileId error:", err);
      return res.status(500).json({ message: "Failed to generate health summary" });
    }
  });

  // ── LAB TEST ROUTES ──────────────────────────────────────────────────

  // GET /api/wellness/lab-tests/:profileId — all tests for a client
  app.get("/api/wellness/lab-tests/:profileId", async (req: Request, res: Response) => {
    try {
      const tests = await prismaClient.labTest.findMany({
        where: { profileId: req.params.profileId },
        include: { biomarkerResults: { include: { biomarker: true } } },
        orderBy: { createdAt: "desc" },
      });
      return res.json(tests);
    } catch (err) {
      console.error("GET /api/wellness/lab-tests/:profileId error:", err);
      return res.status(500).json({ message: "Failed to fetch lab tests" });
    }
  });

  // POST /api/wellness/lab-tests — schedule a new lab test
  app.post("/api/wellness/lab-tests", async (req: Request, res: Response) => {
    try {
      const data = createLabTestSchema.parse(req.body);
      const test = await prismaClient.labTest.create({
        data: {
          ...data,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        },
      });
      return res.status(201).json(test);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("POST /api/wellness/lab-tests error:", err);
      return res.status(500).json({ message: "Failed to schedule lab test" });
    }
  });

  // PATCH /api/wellness/lab-tests/:id/status — update test status
  app.patch("/api/wellness/lab-tests/:id/status", async (req: Request, res: Response) => {
    try {
      const { status } = z.object({ status: z.enum(["scheduled", "sample_collected", "processing", "completed"]) }).parse(req.body);
      const test = await prismaClient.labTest.update({
        where: { id: req.params.id },
        data: { status, completedAt: status === "completed" ? new Date() : undefined },
      });
      return res.json(test);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("PATCH /api/wellness/lab-tests/:id/status error:", err);
      return res.status(500).json({ message: "Failed to update test status" });
    }
  });

  // ── PROTOCOL ROUTES ──────────────────────────────────────────────────

  // GET /api/wellness/protocols — all protocol templates
  app.get("/api/wellness/protocols", async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      const where: Record<string, unknown> = { isTemplate: true };
      if (type) where.protocolType = type;
      const protocols = await prismaClient.healthProtocol.findMany({
        where,
        include: { provider: true },
        orderBy: { createdAt: "desc" },
      });
      return res.json(protocols);
    } catch (err) {
      console.error("GET /api/wellness/protocols error:", err);
      return res.status(500).json({ message: "Failed to fetch protocols" });
    }
  });

  // POST /api/wellness/protocols — create a protocol
  app.post("/api/wellness/protocols", async (req: Request, res: Response) => {
    try {
      const data = createProtocolSchema.parse(req.body);
      const protocol = await prismaClient.healthProtocol.create({ data });
      return res.status(201).json(protocol);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("POST /api/wellness/protocols error:", err);
      return res.status(500).json({ message: "Failed to create protocol" });
    }
  });

  // GET /api/wellness/user-protocols/:profileId — protocols assigned to a client
  app.get("/api/wellness/user-protocols/:profileId", async (req: Request, res: Response) => {
    try {
      const userProtocols = await prismaClient.userProtocol.findMany({
        where: { profileId: req.params.profileId },
        include: { protocol: { include: { provider: true } } },
        orderBy: { startedAt: "desc" },
      });
      return res.json(userProtocols);
    } catch (err) {
      console.error("GET /api/wellness/user-protocols/:profileId error:", err);
      return res.status(500).json({ message: "Failed to fetch user protocols" });
    }
  });

  // POST /api/wellness/user-protocols — assign a protocol to a client
  app.post("/api/wellness/user-protocols", async (req: Request, res: Response) => {
    try {
      const data = assignProtocolSchema.parse(req.body);
      const userProtocol = await prismaClient.userProtocol.create({
        data,
        include: { protocol: true },
      });
      return res.status(201).json(userProtocol);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("POST /api/wellness/user-protocols error:", err);
      return res.status(500).json({ message: "Failed to assign protocol" });
    }
  });

  // PATCH /api/wellness/user-protocols/:id — update protocol status / adherence
  app.patch("/api/wellness/user-protocols/:id", async (req: Request, res: Response) => {
    try {
      const body = z.object({
        status: z.enum(["active", "paused", "completed"]).optional(),
        adherenceScore: z.coerce.number().int().min(0).max(100).optional(),
        notes: z.string().optional(),
      }).parse(req.body);
      const updated = await prismaClient.userProtocol.update({
        where: { id: req.params.id },
        data: { ...body, completedAt: body.status === "completed" ? new Date() : undefined },
        include: { protocol: true },
      });
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: err.errors });
      console.error("PATCH /api/wellness/user-protocols/:id error:", err);
      return res.status(500).json({ message: "Failed to update user protocol" });
    }
  });
}
