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
   * PostgreSQL transaction-level lock.
   *
   * Only one transaction can generate a number for the same
   * prefix/year at a time.
   */
  await tx.$executeRaw`
    SELECT pg_advisory_xact_lock(
      hashtextextended(${`${prefix}:${year}`}, 0)
    )
  `;

  /*
   * For SALES, determine the next number from the actual Sale table.
   *
   * InvoiceSequence may be behind because sales can have been created
   * by another installation/database/synchronisation process.
   */
  if (
    prefix === INVOICE_PREFIXES.SALE ||
    prefix === INVOICE_PREFIXES.SALE_ONLINE ||
    prefix === INVOICE_PREFIXES.SALE_DESKTOP
  ) {
    const prefixPattern = `${prefix}-${year}-%`;

    const latest = await tx.sale.findFirst({
      where: {
        saleNumber: {
          startsWith: `${prefix}-${year}-`,
        },
      },
      orderBy: {
        saleNumber: "desc",
      },
      select: {
        saleNumber: true,
      },
    });

    let nextNumber = 1;

    if (latest?.saleNumber) {
      const match = latest.saleNumber.match(
        new RegExp(`^${prefix}-${year}-(\\d+)$`)
      );

      if (match) {
        nextNumber = Number(match[1]) + 1;
      }
    }

    /*
     * Keep InvoiceSequence synchronized with the database-authoritative
     * Sale number.
     */
    await tx.invoiceSequence.upsert({
      where: {
        prefix_year: {
          prefix,
          year,
        },
      },
      update: {
        lastNumber: nextNumber,
      },
      create: {
        prefix,
        year,
        lastNumber: nextNumber,
      },
    });

    return `${prefix}-${year}-${String(nextNumber).padStart(6, "0")}`;
  }

  /*
   * All other invoice/reference numbers continue using InvoiceSequence.
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
