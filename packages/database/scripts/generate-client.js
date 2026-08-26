#!/usr/bin/env node

/**
 * Picks the right Prisma schema for `prisma generate`, instead of relying
 * on whoever invokes this script to pass the right --schema flag.
 *
 * Electron/local dev sets DATABASE_URL to a `file:` path (SQLite).
 * Railway sets DATABASE_URL to the Neon Postgres connection string, but
 * user-defined service variables aren't guaranteed to be resolved during
 * the *build* step (only at container runtime) depending on how they're
 * configured, so DATABASE_URL can read as empty here even though it's
 * correctly set at runtime. Generating from the wrong schema produces a
 * client whose datasource provider doesn't match the real DATABASE_URL,
 * which fails at runtime with "the URL must start with the protocol
 * `file:`" (or the reverse).
 *
 * To avoid depending on that timing, we also check Railway's own
 * platform-injected build variables (RAILWAY_*), which are always present
 * for any build running on Railway regardless of user-defined variable
 * resolution. An explicit `file:` DATABASE_URL still wins, so a real local
 * SQLite override is always respected.
 */

const { execSync } = require("node:child_process");
const path = require("node:path");

const packageRoot = path.resolve(__dirname, "..");
const databaseUrl = process.env.DATABASE_URL || "";
const isOnRailway = Object.keys(process.env).some((key) => key.startsWith("RAILWAY_"));

let isSqlite;
let reason;

if (databaseUrl.startsWith("file:")) {
  isSqlite = true;
  reason = "DATABASE_URL is a file: path";
} else if (databaseUrl !== "") {
  isSqlite = false;
  reason = "DATABASE_URL is set and isn't a file: path";
} else if (isOnRailway) {
  isSqlite = false;
  reason = "DATABASE_URL isn't visible at build time, but RAILWAY_* build vars are present";
} else {
  isSqlite = true;
  reason = "DATABASE_URL is unset and this isn't a Railway build";
}

const schema = isSqlite ? "prisma/schema.prisma" : "prisma/schema.postgres.prisma";

console.log(`[db] ${reason}; generating client from ${schema}`);

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
