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
   * IMPORTANT:
   * Hold a PostgreSQL transaction-level advisory lock for this
   * exact prefix/year until the surrounding Prisma transaction ends.
   *
   * hashtextextended() converts the prefix/year into a stable bigint
   * lock key. Different prefixes can operate independently.
   */
  await tx.$executeRaw`
    SELECT pg_advisory_xact_lock(
      hashtextextended(${`${prefix}:${year}`}, 0)
    )
  `;

  /*
   * Now that this prefix/year is locked, no other transaction can
   * generate a number for the same prefix/year until this transaction
   * finishes.
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

  let number = sequence.lastNumber;

  /*
   * SALES
   *
   * Never return a sale number that already exists.
   *
   * This also handles databases where InvoiceSequence was behind
   * because records were imported/synchronized previously.
   */
  if (
    prefix === INVOICE_PREFIXES.SALE ||
    prefix === INVOICE_PREFIXES.SALE_ONLINE ||
    prefix === INVOICE_PREFIXES.SALE_DESKTOP
  ) {
    while (true) {
      const candidate =
        `${prefix}-${year}-${String(number).padStart(6, "0")}`;

      const existingSale = await tx.sale.findUnique({
        where: {
          saleNumber: candidate,
        },
        select: {
          id: true,
        },
      });

      if (!existingSale) {
        break;
      }

      number += 1;

      await tx.invoiceSequence.update({
        where: {
          prefix_year: {
            prefix,
            year,
          },
        },
        data: {
          lastNumber: number,
        },
      });
    }
  }

  /*
   * Supplier payments do not use a year.
   */
  if (
    prefix === INVOICE_PREFIXES.SUPPLIER_PAYMENT &&
    !withYear
  ) {
    while (true) {
      const candidate =
        `${prefix}-${String(number).padStart(6, "0")}`;

      const existingPayment =
        await tx.supplierPayment.findUnique({
          where: {
            paymentNumber: candidate,
          },
          select: {
            id: true,
          },
        });

      if (!existingPayment) {
        break;
      }

      number += 1;

      await tx.invoiceSequence.update({
        where: {
          prefix_year: {
            prefix,
            year,
          },
        },
        data: {
          lastNumber: number,
        },
      });
    }
  }

  const padded = String(number).padStart(6, "0");

  return withYear
    ? `${prefix}-${year}-${padded}`
    : `${prefix}-${padded}`;
}
