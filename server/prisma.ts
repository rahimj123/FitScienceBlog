import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __platformPrisma: PrismaClient | undefined;
}

const shouldUsePrisma = Boolean(process.env.DATABASE_URL);

export const prisma = shouldUsePrisma
  ? globalThis.__platformPrisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    })
  : null;

if (prisma && process.env.NODE_ENV !== "production") {
  globalThis.__platformPrisma = prisma;
}
