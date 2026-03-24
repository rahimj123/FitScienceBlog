import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { Express } from "express";
import { loginSchema, registerSchema } from "@shared/auth";
import { prisma } from "./prisma";
import { z } from "zod";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, originalHash] = stored.split(":");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(derived, "hex"));
}

export function registerAuthRoutes(app: Express) {
  if (!prisma) {
    app.get("/api/auth/me", (_req, res) => res.json({ user: null }));
    app.post("/api/auth/register", (_req, res) =>
      res.status(503).json({ message: "Authentication is unavailable in local no-database mode." }),
    );
    app.post("/api/auth/login", (_req, res) =>
      res.status(503).json({ message: "Authentication is unavailable in local no-database mode." }),
    );
    app.post("/api/auth/logout", (_req, res) => res.json({ success: true }));
    return;
  }

  const prismaClient = prisma;

  app.get("/api/auth/me", async (req, res) => {
    const sessionUserId = (req.session as any)?.userId as string | undefined;
    if (!sessionUserId) {
      return res.json({ user: null });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: sessionUserId },
      include: { profile: true },
    });

    if (!user) {
      return res.json({ user: null });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId: user.profile?.id ?? null,
      },
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const input = registerSchema.parse(req.body);
      const existing = await prismaClient.user.findUnique({ where: { email: input.email } });
      if (existing?.passwordHash) {
        return res.status(409).json({ message: "An account already exists for this email." });
      }

      const user = existing
        ? await prismaClient.user.update({
            where: { email: input.email },
            data: {
              passwordHash: hashPassword(input.password),
              role: existing.role || input.role,
            },
          })
        : await prismaClient.user.create({
            data: {
              email: input.email,
              passwordHash: hashPassword(input.password),
              role: input.role,
            },
          });

      (req.session as any).userId = user.id;
      (req.session as any).role = user.role;
      return res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration payload", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to register account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const input = loginSchema.parse(req.body);
      const user = await prismaClient.user.findUnique({ where: { email: input.email }, include: { profile: true } });
      if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      (req.session as any).userId = user.id;
      (req.session as any).role = user.role;
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profileId: user.profile?.id ?? null,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login payload", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
}
