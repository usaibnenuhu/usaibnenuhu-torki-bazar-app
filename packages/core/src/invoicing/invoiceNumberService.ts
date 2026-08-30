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
      prefix_year: { prefix, year },
    },
    update: {
      lastNumber: { increment: 1 },
    },
    create: {
      prefix,
      year,
      lastNumber: 1,
    },
  });

  let number = sequence.lastNumber;

  // ------------------------------------------------------------
  // IMPORTANT:
  // Keep the invoice sequence ahead of records that already exist.
  //
  // This is especially important for SALES because Electron and
  // Neon can be synchronized/imported independently. In that case
  // the InvoiceSequence can be behind the highest existing sale
  // number and the next generated number would violate the unique
  // constraint on Sale.saleNumber.
  // ------------------------------------------------------------

  if (prefix === INVOICE_PREFIXES.SALE) {
    const sales = await tx.sale.findMany({
      where: {
        saleNumber: {
          startsWith: `${prefix}-${year}-`,
        },
      },
      select: {
        saleNumber: true,
      },
      orderBy: {
        saleNumber: "desc",
      },
      take: 1,
    });

    const latestSaleNumber = sales[0]?.saleNumber;
    const match = latestSaleNumber?.match(/(\d+)$/);
    const existingMax = match ? Number(match[1]) : 0;

    if (number <= existingMax) {
      number = existingMax + 1;

      await tx.invoiceSequence.update({
        where: {
          prefix_year: { prefix, year },
        },
        data: {
          lastNumber: number,
        },
      });
    }
  }

  // ------------------------------------------------------------
  // Keep PURCHASE and CUSTOMER RETURN sequences ahead of records
  // that may have arrived through Electron/Neon synchronization.
  // ------------------------------------------------------------

  if (prefix === INVOICE_PREFIXES.PURCHASE) {
    const purchases = await tx.purchase.findMany({
      where: {
        purchaseNumber: {
          startsWith: `${prefix}-${year}-`,
        },
      },
      select: {
        purchaseNumber: true,
      },
      orderBy: {
        purchaseNumber: "desc",
      },
      take: 1,
    });

    const latestPurchaseNumber = purchases[0]?.purchaseNumber;
    const match = latestPurchaseNumber?.match(/(\d+)$/);
    const existingMax = match ? Number(match[1]) : 0;

    if (number <= existingMax) {
      number = existingMax + 1;

      await tx.invoiceSequence.update({
        where: {
          prefix_year: { prefix, year },
        },
        data: {
          lastNumber: number,
        },
      });
    }
  }

  if (prefix === INVOICE_PREFIXES.RETURN) {
    const returns = await tx.return.findMany({
      where: {
        returnNumber: {
          startsWith: `${prefix}-${year}-`,
        },
      },
      select: {
        returnNumber: true,
      },
      orderBy: {
        returnNumber: "desc",
      },
      take: 1,
    });

    const latestReturnNumber = returns[0]?.returnNumber;
    const match = latestReturnNumber?.match(/(\d+)$/);
    const existingMax = match ? Number(match[1]) : 0;

    if (number <= existingMax) {
      number = existingMax + 1;

      await tx.invoiceSequence.update({
        where: {
          prefix_year: { prefix, year },
        },
        data: {
          lastNumber: number,
        },
      });
    }
  }

  // Supplier payments do not use a year.
  // Make sure the sequence is never behind an existing payment.
  if (prefix === "SP" && !withYear) {
    const payments = await tx.supplierPayment.findMany({
      select: { paymentNumber: true },
      orderBy: { paymentNumber: "desc" },
      take: 1,
    });

    const latest = payments[0]?.paymentNumber;
    const match = latest?.match(/(\d+)$/);
    const existingMax = match ? Number(match[1]) : 0;

    if (number <= existingMax) {
      number = existingMax + 1;

      await tx.invoiceSequence.update({
        where: {
          prefix_year: { prefix, year },
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
