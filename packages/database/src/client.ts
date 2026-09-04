import { PrismaClient as SqlitePrismaClient } from "../prisma/generated/sqlite";
import { PrismaClient as PostgresPrismaClient, Prisma } from "@prisma/client";

/**
 * Runtime database selection:
 *
 * - Railway / PostgreSQL -> @prisma/client
 * - Desktop / local      -> generated SQLite client
 *
 * The runtime client can be either implementation, but TypeScript needs
 * one stable Prisma type so that TransactionClient, Decimal, model delegates,
 * and $transaction overloads do not collapse into `never`.
 */

const usePostgres =
  process.env.DATABASE_URL?.startsWith("postgres") === true ||
  process.env.DATABASE_URL?.startsWith("postgresql") === true;

type RuntimePrismaClient =
  | SqlitePrismaClient
  | PostgresPrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __torkiBazarPrisma: RuntimePrismaClient | undefined;
}

function createPrisma(): RuntimePrismaClient {
  if (usePostgres) {
    return new PostgresPrismaClient({
      datasources: {
        db: {
          url:
            process.env.NEON_DATABASE_URL ??
            process.env.DATABASE_URL,
        },
      },
      log:
        process.env.NODE_ENV === "development"
          ? ["warn", "error"]
          : ["error"],
    });
  }

  return new SqlitePrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

/**
 * IMPORTANT:
 *
 * The generated SQLite and PostgreSQL clients have the same application
 * models for the common application API. We expose the PostgreSQL Prisma
 * type to consumers so TypeScript has one stable TransactionClient/Decimal
 * namespace instead of producing unions whose methods become `never`.
 *
 * Runtime selection above is still preserved.
 */
export const prisma: PostgresPrismaClient =
  (global.__torkiBazarPrisma ?? createPrisma()) as PostgresPrismaClient;

/**
 * Prisma namespace used by core:
 *
 *   Prisma.Decimal
 *   Prisma.TransactionClient
 *   Prisma.SaleItemUncheckedCreateInput
 *   etc.
 */
export { Prisma };

if (process.env.NODE_ENV !== "production") {
  global.__torkiBazarPrisma = prisma;
}
