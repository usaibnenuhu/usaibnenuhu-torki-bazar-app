import { prisma } from "@torki-bazar/database";
import {
  INVOICE_PREFIXES,
  type InvoicePrefix,
} from "@torki-bazar/shared";

export async function nextInvoiceNumber(
  tx: typeof prisma,
  prefix: InvoicePrefix,
  opts: { withYear?: boolean } = { withYear: true }
): Promise<string> {
  const withYear = opts.withYear !== false;
  const year = withYear ? new Date().getFullYear() : 0;

  /*
   * PostgreSQL: serialize concurrent sequence generation.
   * SQLite/Electron: this call is unsupported, so continue and let
   * SQLite transaction locking provide serialization.
   */
  try {
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(
        hashtextextended(${`${prefix}:${year}`}, 0)
      )
    `;
  } catch {
    // SQLite/Electron does not support PostgreSQL advisory locks.
  }

  /*
   * Sales use InvoiceSequence directly.
   *
   * ONLINE and DESKTOP have different prefixes, so numbers generated
   * independently by Neon and Electron cannot collide.
   */
  if (
    prefix === INVOICE_PREFIXES.SALE ||
    prefix === INVOICE_PREFIXES.SALE_ONLINE ||
    prefix === INVOICE_PREFIXES.SALE_DESKTOP
  ) {
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

    return `${prefix}-${year}-${padded}`;
  }

  /*
   * All other invoice/reference numbers.
   */
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
