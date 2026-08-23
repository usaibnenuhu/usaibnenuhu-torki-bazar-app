import { PrismaClient } from "@prisma/client";

// Single shared Prisma Client instance. This is the ONLY place that should
// import "@prisma/client" directly — everything else in the app must go
// through the repository/service layer in @torki-bazar/core.
declare global {
  // eslint-disable-next-line no-var
  var __torkiBazarPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__torkiBazarPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__torkiBazarPrisma = prisma;
}

export * from "@prisma/client";
