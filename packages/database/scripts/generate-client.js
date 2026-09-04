#!/usr/bin/env node

const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const packageRoot = path.resolve(__dirname, "..");

const envPath = path.join(packageRoot, ".env");

if (fs.existsSync(envPath)) {
  require("dotenv").config({
    path: envPath,
    override: false,
  });
}

console.log("");
console.log("=================================");
console.log(" TORKI BAZAR PRISMA GENERATOR");
console.log("=================================");

console.log("[db] Generating SQLite client -> prisma/generated/sqlite");

execSync(
  "npx prisma generate --schema=prisma/schema.prisma",
  {
    cwd: packageRoot,
    stdio: "inherit",
  }
);

console.log("[db] Generating PostgreSQL client -> @prisma/client");

execSync(
  "npx prisma generate --schema=prisma/schema.postgres.prisma",
  {
    cwd: packageRoot,
    stdio: "inherit",
  }
);

console.log("[db] Generating Neon client -> prisma/generated/neon");

execSync(
  "npx prisma generate --schema=prisma/schema.neon.prisma",
  {
    cwd: packageRoot,
    stdio: "inherit",
  }
);

console.log("");
console.log("[db] All Prisma clients generated successfully.");
