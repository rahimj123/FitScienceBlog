import type { Prisma } from "@prisma/client";
import type { Express, Request, Response } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "./prisma";
import { onboardingSchema, physicianReviewSchema, platformRoleSchema } from "@shared/platform";
import { computeAge, computeWeeklyActivityMinutes, determineCategories, determinePathway } from "./platform-logic";
import { z } from "zod";

const defaultCategories = [
  { slug: "under_18", label: "Under 18", description: "Client is younger than 18 years old." },
  { slug: "age_18_to_50", label: "Age 18 to 50", description: "Client age falls within 18 to 50." },
  { slug: "age_45_to_80", label: "Age 45 to 80", description: "Client age falls within 45 to 80." },
  { slug: "disability", label: "Disability", description: "Client has indicated a disability-related support need." },
];

async function ensureCategories() {
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
}

function getRole(req: Request) {
  const parsed = platformRoleSchema.safeParse(req.header("x-user-role") ?? "admin");
  return parsed.success ? parsed.data : "admin";
}

function requireRole(req: Request, res: Response, allowed: string[]) {
  const role = getRole(req);
  if (!allowed.includes(role)) {
    res.status(403).json({ message: "This role is not permitted for that action." });
    return null;
  }
  return role;
}

function toCsv(rows: Array<Record<string, string | number | boolean | null>>) {
  if (!rows.length) {
    return "id,name,email,pathway,categories,redFlags\n";
  }

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ];

  return lines.join("\n");
}

async function writeAuditLog(action: string, entityType: string, entityId: string, metadataJson?: Record<string, unknown>) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      metadataJson: metadataJson as Prisma.InputJsonValue | undefined,
    },
  });
}

async function getClientSummary(profileId: string, role: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      user: true,
      intakeForms: {
        orderBy: { submittedAt: "desc" },
        include: {
          screeningStage1: true,
          screeningStage2: true,
          wellnessHistory: true,
          consent: true,
        },
      },
      pathways: {
        orderBy: { createdAt: "desc" },
      },
      flags: true,
      clientCategories: {
        include: {
          category: true,
        },
      },
      physicianReviews: {
        orderBy: { createdAt: "desc" },
        include: {
          labRecommendations: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  const latestReview = profile.physicianReviews[0] ?? null;
  const latestPathway = profile.pathways[0] ?? null;
  const latestIntake = profile.intakeForms[0] ?? null;

  return {
    id: profile.id,
    name: `${profile.firstName} ${profile.lastName}`,
    email: profile.user.email,
    age: computeAge(profile.dateOfBirth.toISOString()),
    gender: profile.gender,
    disabilityFlag: profile.disabilityFlag,
    pathway: latestPathway,
    categories: profile.clientCategories.map((item) => item.category),
    flags: profile.flags,
    physicianReviewStatus: latestReview
      ? {
          consultationStatus: latestReview.consultationStatus,
          clearanceDecision: latestReview.clearanceDecision,
          reviewSummary: role === "physician" || role === "admin" ? latestReview.reviewSummary : undefined,
          labRecommendations:
            role === "physician" || role === "admin" ? latestReview.labRecommendations : [],
        }
      : null,
    latestIntake: latestIntake
      ? {
          submittedAt: latestIntake.submittedAt,
          servicePreference: latestIntake.servicePreference,
          preferredPathway: latestIntake.preferredPathway,
          screeningStage1: latestIntake.screeningStage1,
          screeningStage2: latestIntake.screeningStage2,
          wellnessHistory:
            role === "physician" || role === "admin" ? latestIntake.wellnessHistory : undefined,
          consent: latestIntake.consent,
        }
      : null,
  };
}

function sendSummaryPdf(res: Response, summary: Awaited<ReturnType<typeof getClientSummary>>) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${summary?.name.replaceAll(" ", "-").toLowerCase()}-summary.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text("Wellness with Dr. Jindani", { align: "left" });
  doc.moveDown(0.5);
  doc.fontSize(16).text("Client Intake Summary");
  doc.moveDown();

  if (!summary) {
    doc.fontSize(12).text("No summary available.");
    doc.end();
    return;
  }

  doc.fontSize(12).text(`Client: ${summary.name}`);
  doc.text(`Email: ${summary.email}`);
  doc.text(`Age: ${summary.age}`);
  doc.text(`Gender: ${summary.gender}`);
  doc.text(`Pathway: ${summary.pathway?.pathwayType ?? "Not assigned"}`);
  doc.text(`Requires clearance: ${summary.pathway?.requiresClearance ? "Yes" : "No"}`);
  doc.moveDown();

  doc.fontSize(14).text("Categories");
  doc.fontSize(12).text(summary.categories.map((item) => item.label).join(", ") || "None");
  doc.moveDown();

  doc.fontSize(14).text("Flags");
  if (summary.flags.length) {
    summary.flags.forEach((flag) => {
      doc.fontSize(12).text(`- ${flag.flagType}: ${flag.description}`);
    });
  } else {
    doc.fontSize(12).text("No active flags recorded.");
  }
  doc.moveDown();

  if (summary.latestIntake?.screeningStage1) {
    doc.fontSize(14).text("Screening Summary");
    doc.fontSize(12).text(
      `Weekly activity score: ${summary.latestIntake.screeningStage1.weeklyActivityMinutes} weighted minutes`,
    );
    doc.text(`Activity level: ${summary.latestIntake.screeningStage1.currentActivityLevel}`);
    doc.moveDown();
  }

  doc.fontSize(12).text(`Generated at: ${new Date().toISOString()}`);
  doc.end();
}

export async function registerPlatformRoutes(app: Express) {
  await ensureCategories();

  app.get("/api/platform/categories", async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { label: "asc" } });
    return res.json(categories);
  });

  app.post("/api/platform/onboarding", async (req, res) => {
    try {
      const input = onboardingSchema.parse(req.body);
      const { age, categories } = determineCategories(input.basicInfo.dateOfBirth, input.basicInfo.disabilityFlag);
      const pathway = determinePathway(input);
      const weeklyActivityMinutes = computeWeeklyActivityMinutes(input.screeningStage1);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: input.basicInfo.email,
            role: "client",
          },
        });

        const profile = await tx.profile.create({
          data: {
            userId: user.id,
            firstName: input.basicInfo.firstName,
            lastName: input.basicInfo.lastName,
            dateOfBirth: new Date(input.basicInfo.dateOfBirth),
            gender: input.basicInfo.gender,
            phone: input.basicInfo.phone,
            emergencyContactName: input.basicInfo.emergencyContactName,
            emergencyContactPhone: input.basicInfo.emergencyContactPhone,
            disabilityFlag: input.basicInfo.disabilityFlag,
          },
        });

        const intakeForm = await tx.intakeForm.create({
          data: {
            profileId: profile.id,
            servicePreference: input.basicInfo.servicePreference,
            preferredPathway: pathway.pathwayType,
            status: "submitted",
            screeningStage1: {
              create: {
                heartCondition: input.screeningStage1.heartCondition,
                chestDiscomfort: input.screeningStage1.chestDiscomfort,
                dizzinessOrFainting: input.screeningStage1.dizzinessOrFainting,
                breathingIssues: input.screeningStage1.breathingIssues,
                diabetesManagementConcern: input.screeningStage1.diabetesManagementConcern,
                musculoskeletalLimitation: input.screeningStage1.musculoskeletalLimitation,
                currentActivityLevel: input.screeningStage1.currentActivityLevel,
                lightActivityMinutes: input.screeningStage1.lightActivityMinutes,
                moderateActivityMinutes: input.screeningStage1.moderateActivityMinutes,
                vigorousActivityMinutes: input.screeningStage1.vigorousActivityMinutes,
                weeklyActivityMinutes,
                notes: input.screeningStage1.notes || null,
              },
            },
            screeningStage2: {
              create: {
                ageRisk: age >= 45,
                smokingHistory: input.screeningStage2.smokingHistory,
                bloodPressureHistory: input.screeningStage2.bloodPressureHistory,
                cholesterolHistory: input.screeningStage2.cholesterolHistory,
                bloodGlucoseHistory: input.screeningStage2.bloodGlucoseHistory,
                medicationConsiderations: input.screeningStage2.medicationConsiderations,
                priorHospitalizations: input.screeningStage2.priorHospitalizations,
                pregnancyRelated: input.screeningStage2.pregnancyRelated,
                injuryHistory: input.screeningStage2.injuryHistory,
                details: input.screeningStage2.details || null,
              },
            },
            wellnessHistory: input.wellnessHistory
              ? {
                  create: input.wellnessHistory,
                }
              : undefined,
            consent: {
              create: {
                coachingConsent: input.consents.coachingConsent,
                privacyConsent: input.consents.privacyConsent,
                physicianConsultConsent: input.consents.physicianConsultConsent,
                liabilityAcknowledgement: input.consents.liabilityAcknowledgement,
                signature: input.consents.signature,
              },
            },
          },
        });

        await tx.pathway.create({
          data: {
            profileId: profile.id,
            pathwayType: pathway.pathwayType,
            currentStatus: pathway.requiresClearance ? "awaiting_review" : "active",
            requiresClearance: pathway.requiresClearance,
          },
        });

        for (const slug of categories) {
          const category = await tx.category.findUnique({ where: { slug } });
          if (category) {
            await tx.clientCategory.create({
              data: {
                profileId: profile.id,
                categoryId: category.id,
              },
            });
          }
        }

        for (const flag of pathway.redFlags) {
          await tx.flag.create({
            data: {
              profileId: profile.id,
              flagType: flag.flagType,
              severity: flag.severity,
              source: "onboarding",
              description: flag.description,
            },
          });
        }

        if (pathway.pathwayType !== "fitness_pathway") {
          await tx.physicianReview.create({
            data: {
              profileId: profile.id,
              consultationStatus: pathway.pathwayType === "needs_medical_clearance" ? "booked" : "not_booked",
              clearanceDecision:
                pathway.pathwayType === "needs_medical_clearance" ? "medical_clearance_needed" : "wellness_review_only",
              reviewSummary: null,
            },
          });
        }

        return { user, profile, intakeForm };
      });

      await writeAuditLog("onboarding_submitted", "profile", result.profile.id, {
        pathway: pathway.pathwayType,
        categories,
      });

      return res.status(201).json({
        profileId: result.profile.id,
        pathway: pathway.pathwayType,
        requiresClearance: pathway.requiresClearance,
        categories,
        redFlags: pathway.redFlags,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid onboarding payload", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create onboarding record" });
    }
  });

  app.get("/api/platform/clients", async (req, res) => {
    const role = requireRole(req, res, ["coach", "physician", "admin"]);
    if (!role) return;

    const category = req.query.category as string | undefined;
    const pathway = req.query.pathway as string | undefined;
    const redFlag = req.query.redFlag as string | undefined;

    const profiles = await prisma.profile.findMany({
      include: {
        user: true,
        pathways: { orderBy: { createdAt: "desc" }, take: 1 },
        flags: true,
        clientCategories: { include: { category: true } },
        physicianReviews: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    const filtered = profiles.filter((profile) => {
      const matchesCategory = category
        ? profile.clientCategories.some((entry) => entry.category.slug === category)
        : true;
      const matchesPathway = pathway ? profile.pathways[0]?.pathwayType === pathway : true;
      const matchesFlag = redFlag ? profile.flags.length > 0 : true;
      return matchesCategory && matchesPathway && matchesFlag;
    });

    const data = filtered.map((profile) => ({
      id: profile.id,
      name: `${profile.firstName} ${profile.lastName}`,
      email: profile.user.email,
      pathway: profile.pathways[0]?.pathwayType ?? "unassigned",
      requiresClearance: profile.pathways[0]?.requiresClearance ?? false,
      categories: profile.clientCategories.map((entry) => entry.category.slug),
      redFlags: profile.flags.length,
      physicianReviewStatus: profile.physicianReviews[0]?.consultationStatus ?? "not_started",
    }));

    return res.json(data);
  });

  app.get("/api/platform/clients/export.csv", async (req, res) => {
    const role = requireRole(req, res, ["coach", "physician", "admin"]);
    if (!role) return;

    const profiles = await prisma.profile.findMany({
      include: {
        user: true,
        pathways: { orderBy: { createdAt: "desc" }, take: 1 },
        flags: true,
        clientCategories: { include: { category: true } },
      },
    });

    const csv = toCsv(
      profiles.map((profile) => ({
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.user.email,
        pathway: profile.pathways[0]?.pathwayType ?? "unassigned",
        categories: profile.clientCategories.map((entry) => entry.category.slug).join("|"),
        redFlags: profile.flags.length,
      })),
    );

    await writeAuditLog("clients_exported", "profile", "bulk", { role });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"wellness-clients.csv\"");
    return res.send(csv);
  });

  app.get("/api/platform/clients/:profileId", async (req, res) => {
    const role = requireRole(req, res, ["coach", "physician", "admin"]);
    if (!role) return;
    const summary = await getClientSummary(req.params.profileId, role);
    if (!summary) {
      return res.status(404).json({ message: "Client not found" });
    }
    return res.json(summary);
  });

  app.get("/api/platform/clients/:profileId/intake-summary.pdf", async (req, res) => {
    const role = requireRole(req, res, ["coach", "physician", "admin"]);
    if (!role) return;
    const summary = await getClientSummary(req.params.profileId, role);
    if (!summary) {
      return res.status(404).json({ message: "Client not found" });
    }
    await writeAuditLog("pdf_generated", "profile", req.params.profileId, { role });
    return sendSummaryPdf(res, summary);
  });

  app.post("/api/platform/physician-reviews", async (req, res) => {
    const role = requireRole(req, res, ["physician", "admin"]);
    if (!role) return;

    try {
      const input = physicianReviewSchema.parse(req.body);
      const review = await prisma.$transaction(async (tx) => {
        const created = await tx.physicianReview.create({
          data: {
            profileId: input.profileId,
            consultationBookedAt: input.consultationBookedAt ? new Date(input.consultationBookedAt) : null,
            consultationStatus: input.consultationStatus,
            reviewSummary: input.reviewSummary ?? null,
            clearanceDecision: input.clearanceDecision,
          },
        });

        if (input.labRecommendations.length) {
          await tx.labRecommendation.createMany({
            data: input.labRecommendations.map((item) => ({
              physicianReviewId: created.id,
              title: item.title,
              rationale: item.rationale,
              status: item.status,
            })),
          });
        }

        await tx.pathway.updateMany({
          where: { profileId: input.profileId },
          data: {
            currentStatus: input.clearanceDecision === "medical_clearance_needed" ? "awaiting_clearance" : "active",
            requiresClearance: input.clearanceDecision === "medical_clearance_needed",
          },
        });

        return created;
      });

      await writeAuditLog("physician_review_created", "physician_review", review.id, {
        profileId: input.profileId,
        role,
      });

      return res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid physician review payload", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to save physician review" });
    }
  });
}
