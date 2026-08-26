#!/usr/bin/env node

/**
 * Picks the right Prisma schema for `prisma generate` based on the actual
 * DATABASE_URL at build time, instead of relying on whoever invokes this
 * script to pass the right --schema flag.
 *
 * Electron/local dev sets DATABASE_URL to a `file:` path (SQLite).
 * Railway sets DATABASE_URL to the Neon Postgres connection string.
 * Generating from the wrong schema produces a client whose datasource
 * provider doesn't match DATABASE_URL, which fails at runtime with
 * "the URL must start with the protocol `file:`" (or the reverse).
 */

const { execSync } = require("node:child_process");
const path = require("node:path");

const packageRoot = path.resolve(__dirname, "..");
const databaseUrl = process.env.DATABASE_URL || "";
const isSqlite = databaseUrl.startsWith("file:") || databaseUrl === "";
const schema = isSqlite ? "prisma/schema.prisma" : "prisma/schema.postgres.prisma";

console.log(
  `[db] DATABASE_URL looks like ${isSqlite ? "SQLite (or unset)" : "Postgres"}; generating client from ${schema}`
);

execSync(`npx prisma generate --schema=${schema}`, {
  cwd: packageRoot,
  stdio: "inherit",
});

// Always regenerate the separate Neon client used for auth (packages/database/src/neonClient.ts).
// This has its own output dir and doesn't need NEON_DATABASE_URL to be set at generate time.
execSync(`npx prisma generate --schema=prisma/schema.neon.prisma`, {
  cwd: packageRoot,
  stdio: "inherit",
});
