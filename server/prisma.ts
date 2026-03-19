import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __platformPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__platformPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__platformPrisma = prisma;
}
