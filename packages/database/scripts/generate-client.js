#!/usr/bin/env node

const { execSync } = require("node:child_process");
const path = require("node:path");

const packageRoot = path.resolve(__dirname, "..");

const databaseUrl = process.env.DATABASE_URL || "";

// Railway/production must use PostgreSQL.
// Local Electron/Desktop must use SQLite.
const forcePostgres =
  process.env.TORKI_PRISMA_PROVIDER === "postgresql" ||
  process.env.RAILWAY_ENVIRONMENT_ID ||
  process.env.RAILWAY_ENVIRONMENT_NAME ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_ID;

const isSqlite =
  !forcePostgres &&
  (databaseUrl.startsWith("file:") || databaseUrl === "");

const schema = isSqlite
  ? "prisma/schema.prisma"
  : "prisma/schema.postgres.prisma";

console.log(
  `[db] generating Prisma client from ${schema} ` +
  `(provider=${isSqlite ? "sqlite" : "postgresql"})`
);

execSync(`npx prisma generate --schema=${schema}`, {
  cwd: packageRoot,
  stdio: "inherit",
});

// Separate Neon client used by neonClient.ts.
execSync(`npx prisma generate --schema=prisma/schema.neon.prisma`, {
  cwd: packageRoot,
  stdio: "inherit",
});
