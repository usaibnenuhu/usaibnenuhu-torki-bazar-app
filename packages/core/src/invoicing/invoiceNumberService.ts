import { prisma } from "@torki-bazar/database";
import {
  INVOICE_PREFIXES,
  type InvoicePrefix,
} from "@torki-bazar/shared";

/**
 * Generate the next invoice/reference number safely.
 *
 * PostgreSQL advisory transaction locks make number generation
 * single-file for the same prefix/year, even when:
 *
 * - Online POS and Electron POS submit simultaneously
 * - multiple browser tabs submit simultaneously
 * - Railway has multiple API requests running concurrently
 * - InvoiceSequence is behind existing records
 */
export async function nextInvoiceNumber(
  tx: typeof prisma,
  prefix: InvoicePrefix,
  opts: { withYear?: boolean } = { withYear: true }
): Promise<string> {
  const withYear = opts.withYear !== false;
  const year = withYear ? new Date().getFullYear() : 0;

  /*
   * The database is the source of truth.
   *
   * Lock this prefix/year for the entire surrounding transaction so
   * concurrent POS requests cannot receive the same number.
   */
  await tx.$executeRaw`
    SELECT pg_advisory_xact_lock(
      hashtextextended(${`${prefix}:${year}`}, 0)
    )
  `;

  /*
   * Synchronize InvoiceSequence with records that already exist.
   *
   * This is important because historical/synchronized records may exist
   * even when InvoiceSequence was previously behind.
   */
  if (
    prefix === INVOICE_PREFIXES.SALE ||
    prefix === INVOICE_PREFIXES.SALE_ONLINE ||
    prefix === INVOICE_PREFIXES.SALE_DESKTOP
  ) {
    const rows = await tx.$queryRaw<{ max_number: number | null }[]>`
      SELECT MAX(
        CAST(
          regexp_replace("saleNumber", '^.*-([0-9]+)$', '\\1')
          AS INTEGER
        )
      ) AS max_number
      FROM "Sale"
      WHERE "saleNumber" LIKE ${`${prefix}-${year}-%`}
    `;

    const existingMax = Number(rows[0]?.max_number ?? 0);

    await tx.invoiceSequence.upsert({
      where: {
        prefix_year: {
          prefix,
          year,
        },
      },
      update: {
        lastNumber: {
          set: existingMax,
        },
      },
      create: {
        prefix,
        year,
        lastNumber: existingMax,
      },
    });

    const sequence = await tx.invoiceSequence.update({
      where: {
        prefix_year: {
          prefix,
          year,
        },
      },
      data: {
        lastNumber: {
          increment: 1,
        },
      },
    });

    return `${prefix}-${year}-${String(sequence.lastNumber).padStart(6, "0")}`;
  }

  const sequence = await tx.invoiceSequence.upsert({
    where: {
      prefix_year: {
        prefix,
        year,
      },
    },
    update: {
      lastNumber: {
        increment: 1,
      },
    },
    create: {
      prefix,
      year,
      lastNumber: 1,
    },
  });

  const padded = String(sequence.lastNumber).padStart(6, "0");

  return withYear
    ? `${prefix}-${year}-${padded}`
    : `${prefix}-${padded}`;
}
