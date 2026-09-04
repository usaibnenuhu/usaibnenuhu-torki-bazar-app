import { prisma } from "@torki-bazar/database";
import { DEFAULT_UNITS, DEFAULT_EXPENSE_CATEGORIES } from "@torki-bazar/shared";

type SqliteColumn = {
  name: string;
};

async function ensureColumn(
  tableName: string,
  columnName: string,
  alterSql: string,
): Promise<void> {
  const columns = await prisma.$queryRawUnsafe<SqliteColumn[]>(
    `PRAGMA table_info("${tableName}")`,
  );

  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    console.log(
      `[main] ${tableName}.${columnName} is missing. Applying SQLite migration...`,
    );

    await prisma.$executeRawUnsafe(alterSql);

    const verifiedColumns = await prisma.$queryRawUnsafe<SqliteColumn[]>(
      `PRAGMA table_info("${tableName}")`,
    );

    const migrated = verifiedColumns.some(
      (column) => column.name === columnName,
    );

    if (!migrated) {
      throw new Error(
        `SQLite migration failed: ${tableName}.${columnName} was not added.`,
      );
    }

    console.log(
      `[main] SQLite migration complete: ${tableName}.${columnName} added.`,
    );
  } else {
    console.log(
      `[main] SQLite schema OK: ${tableName}.${columnName} exists.`,
    );
  }
}

export async function ensureLocalSchema(): Promise<void> {
  console.log("[main] Starting local SQLite schema verification...");

  // Make absolutely sure the database connection used here is SQLite.
  const databaseProvider = await prisma.$queryRawUnsafe<
    Array<{ journal_mode: string }>
  >(`PRAGMA journal_mode`);

  console.log(
    `[main] SQLite database connection verified: journal_mode=${databaseProvider[0]?.journal_mode ?? "unknown"}`,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BkashTransaction" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "amount" DECIMAL NOT NULL,
      "transactionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "note" TEXT,
      "createdById" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "BkashTransaction_createdById_fkey"
        FOREIGN KEY ("createdById")
        REFERENCES "User" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "BkashTransaction_transactionDate_idx"
    ON "BkashTransaction" ("transactionDate")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "BkashTransaction_type_transactionDate_idx"
    ON "BkashTransaction" ("type", "transactionDate")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BankTransaction" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "amount" DECIMAL NOT NULL,
      "transactionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "note" TEXT,
      "reference" TEXT,
      "transferId" TEXT,
      "createdById" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "BankTransaction_createdById_fkey"
        FOREIGN KEY ("createdById")
        REFERENCES "User" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "BankTransaction_transactionDate_idx"
    ON "BankTransaction" ("transactionDate")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "BankTransaction_type_transactionDate_idx"
    ON "BankTransaction" ("type", "transactionDate")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "BankTransaction_transferId_idx"
    ON "BankTransaction" ("transferId")
  `);

  // Existing production databases.
  await ensureColumn(
    "Membership",
    "discountPercent",
    `
      ALTER TABLE "Membership"
      ADD COLUMN "discountPercent" DECIMAL NOT NULL DEFAULT 0
    `,
  );

  await ensureColumn(
    "SupplierPayment",
    "idempotencyKey",
    `
      ALTER TABLE "SupplierPayment"
      ADD COLUMN "idempotencyKey" TEXT
    `,
  );

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "SupplierPayment_idempotencyKey_key"
    ON "SupplierPayment" ("idempotencyKey")
  `);

  // Preserve existing setup data and restore missing defaults.
  for (const unit of DEFAULT_UNITS) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {},
      create: unit,
    });
  }

  for (const name of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // FINAL HARD CHECK:
  // Do not allow the desktop application to continue if the
  // Membership schema is still incompatible with the Prisma client.
  const finalMembershipColumns =
    await prisma.$queryRawUnsafe<SqliteColumn[]>(
      `PRAGMA table_info("Membership")`,
    );

  const membershipReady = finalMembershipColumns.some(
    (column) => column.name === "discountPercent",
  );

  if (!membershipReady) {
    throw new Error(
      "LOCAL DATABASE IS INCOMPATIBLE: Membership.discountPercent is missing after schema migration.",
    );
  }

  console.log(
    "[main] Local SQLite schema verification COMPLETE. Membership schema is ready.",
  );
}
