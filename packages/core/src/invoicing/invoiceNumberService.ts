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
   * SALES:
   *
   * Electron and Online POS use different prefixes:
   *
   *   TB-DES-2026-000001
   *   TB-ONL-2026-000001
   *   TB-SALE-2026-000001 (legacy)
   *
   * The database may already contain sales while InvoiceSequence
   * is behind, so never return an already-existing saleNumber.
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
  if (prefix === INVOICE_PREFIXES.SUPPLIER_PAYMENT && !withYear) {
    while (true) {
      const candidate =
        `${prefix}-${String(number).padStart(6, "0")}`;

      const existingPayment = await tx.supplierPayment.findUnique({
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
