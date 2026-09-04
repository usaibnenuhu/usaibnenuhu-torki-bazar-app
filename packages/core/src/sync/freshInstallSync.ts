import { prisma } from "@torki-bazar/database";
import { neonPrisma } from "@torki-bazar/database/dist/neonClient";

/*
 * Complete Neon -> SQLite snapshot for a BRAND-NEW installation.
 *
 * This is intentionally separate from the normal incremental sync.
 *
 * A fresh Windows installation starts from the bundled SQLite template,
 * which can contain seed/default records that do not match Neon.
 *
 * For the first installation only, replace that template data with the
 * complete Neon application state while preserving all Neon IDs.
 *
 * Local-only tables are deliberately excluded:
 *   - SyncQueue: belongs to the local synchronization engine.
 *   - Backup: contains local filesystem paths and must not be copied.
 */

const EXCLUDED_MODELS = new Set([
  "SyncQueue",
  "Backup",
]);

function modelDelegate(client: any, modelName: string) {
  const delegateName =
    modelName.charAt(0).toLowerCase() + modelName.slice(1);

  const delegate = client[delegateName];

  if (!delegate) {
    throw new Error(
      `[fresh-pull] Prisma delegate not found for model ${modelName}`
    );
  }

  return delegate;
}

function quoteIdentifier(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function normalizeValue(value: unknown, fieldType: string) {
  if (value === null || value === undefined) {
    return null;
  }

  if (fieldType === "Decimal") {
    return value.toString();
  }

  if (fieldType === "DateTime") {
    return value instanceof Date ? value : new Date(String(value));
  }

  if (fieldType === "Bytes") {
    return value;
  }

  if (fieldType === "Json") {
    return JSON.stringify(value);
  }

  return value;
}

export async function pullFreshNeonSnapshot() {
  const neonRuntime = (neonPrisma as any)._runtimeDataModel;
  const localRuntime = (prisma as any)._runtimeDataModel;

  if (!neonRuntime?.models || !localRuntime?.models) {
    throw new Error(
      "[fresh-pull] Prisma runtime model metadata is unavailable."
    );
  }

  const modelNames = Object.keys(neonRuntime.models).filter(
    (name) => !EXCLUDED_MODELS.has(name)
  );

  console.log(
    `[fresh-pull] Starting complete Neon snapshot. Models: ${modelNames.length}`
  );

  /*
   * SQLite foreign keys are temporarily disabled while replacing the
   * template database. Neon data is internally consistent, so after all
   * rows are inserted the resulting database has the correct relationships.
   */
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF");

  try {
    /*
     * ------------------------------------------------------------
     * CLEAR TEMPLATE DATA
     * ------------------------------------------------------------
     *
     * Delete every application model that exists in the local SQLite
     * runtime model. We deliberately leave SyncQueue and Backup alone.
     */
    const localModelNames = Object.keys(localRuntime.models).filter(
      (name) => !EXCLUDED_MODELS.has(name)
    );

    for (const modelName of localModelNames) {
      const localModel = localRuntime.models[modelName];
      const tableName = localModel.dbName ?? modelName;

      await prisma.$executeRawUnsafe(
        `DELETE FROM ${quoteIdentifier(tableName)}`
      );
    }

    /*
     * ------------------------------------------------------------
     * COPY NEON -> SQLITE
     * ------------------------------------------------------------
     *
     * We use Prisma runtime metadata rather than hard-coding only the
     * financial tables. This makes the fresh-install snapshot include
     * newly-added application tables automatically, provided the Neon
     * and SQLite schemas contain the same model.
     */
    let totalRows = 0;
    const copiedCounts: Record<string, number> = {};

    for (const modelName of modelNames) {
      const neonModel = neonRuntime.models[modelName];
      const localModel = localRuntime.models[modelName];

      if (!localModel) {
        console.warn(
          `[fresh-pull] Skipping ${modelName}: model does not exist in SQLite.`
        );
        continue;
      }

      const neonDelegate = modelDelegate(neonPrisma, modelName);

      const rows = await neonDelegate.findMany();

      if (!rows.length) {
        copiedCounts[modelName] = 0;
        continue;
      }

      const scalarFields = neonModel.fields.filter(
        (field: any) =>
          field.kind === "scalar" &&
          field.relationName == null
      );

      /*
       * Only insert columns that exist in BOTH generated schemas.
       * This protects against harmless generated-client differences.
       */
      const localFieldsByName = new Map<string, any>(
        localModel.fields
          .filter(
            (field: any) =>
              field.kind === "scalar" &&
              field.relationName == null
          )
          .map((field: any) => [field.name, field] as [string, any])
      );

      const fields = scalarFields.filter((field: any) =>
        localFieldsByName.has(field.name)
      );

      if (!fields.length) {
        console.warn(
          `[fresh-pull] Skipping ${modelName}: no compatible scalar fields.`
        );
        continue;
      }

      const columns = fields.map(
        (field: any) =>
          quoteIdentifier(
            localFieldsByName.get(field.name).dbName ?? field.name
          )
      );

      const placeholders = fields.map(() => "?").join(", ");

      const sql =
        `INSERT INTO ${quoteIdentifier(localModel.dbName ?? modelName)} ` +
        `(${columns.join(", ")}) VALUES (${placeholders})`;

      let inserted = 0;

      for (const row of rows) {
        const values = fields.map((field: any) =>
          normalizeValue(row[field.name], field.type)
        );

        await prisma.$executeRawUnsafe(sql, ...values);
        inserted++;
        totalRows++;
      }

      copiedCounts[modelName] = inserted;

      console.log(
        `[fresh-pull] ${modelName}: ${inserted} rows`
      );
    }

    console.log(
      `[fresh-pull] Complete Neon snapshot finished. Total rows copied: ${totalRows}`
    );

    console.log(
      "[fresh-pull] Row counts:",
      JSON.stringify(copiedCounts)
    );

    return {
      pulled: totalRows,
      counts: copiedCounts,
    };
  } finally {
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");
  }
}
