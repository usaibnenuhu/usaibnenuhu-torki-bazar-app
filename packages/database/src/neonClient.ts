import { PrismaClient } from "../prisma/generated/neon";

const neonUrl = process.env.NEON_DATABASE_URL;

if (!neonUrl) {
  throw new Error("NEON_DATABASE_URL is not configured.");
}

declare global {
  // eslint-disable-next-line no-var
  var __torkiBazarNeonPrisma: PrismaClient | undefined;
}

export const neonPrisma =
  global.__torkiBazarNeonPrisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: neonUrl,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__torkiBazarNeonPrisma = neonPrisma;
}
