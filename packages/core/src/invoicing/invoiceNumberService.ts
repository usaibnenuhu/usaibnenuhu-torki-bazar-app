import { prisma } from "@torki-bazar/database";
import {
  INVOICE_PREFIXES,
  type InvoicePrefix,
} from "@torki-bazar/shared";

function extractTrailingNumber(value: string | undefined): number {
  if (!value) return 0;

  const match = value.match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

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

  // Sales
  if (prefix === INVOICE_PREFIXES.SALE) {
    const rows = await tx.sale.findMany({
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

    const existingMax = extractTrailingNumber(rows[0]?.saleNumber);

    if (number <= existingMax) {
      number = existingMax + 1;
    }
  }

  // Purchases
  if (prefix === INVOICE_PREFIXES.PURCHASE) {
    const rows = await tx.purchase.findMany({
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

    const existingMax = extractTrailingNumber(rows[0]?.purchaseNumber);

    if (number <= existingMax) {
      number = existingMax + 1;
    }
  }

  // Returns
  if (prefix === INVOICE_PREFIXES.RETURN) {
    const rows = await tx.return.findMany({
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

    const existingMax = extractTrailingNumber(rows[0]?.returnNumber);

    if (number <= existingMax) {
      number = existingMax + 1;
    }
  }

  // Expenses
  if (prefix === INVOICE_PREFIXES.EXPENSE) {
    const rows = await tx.expense.findMany({
      where: {
        expenseNumber: {
          startsWith: `${prefix}-${year}-`,
        },
      },
      select: {
        expenseNumber: true,
      },
      orderBy: {
        expenseNumber: "desc",
      },
      take: 1,
    });

    const existingMax = extractTrailingNumber(rows[0]?.expenseNumber);

    if (number <= existingMax) {
      number = existingMax + 1;
    }
  }

  // Memberships do not use a year.
  if (prefix === INVOICE_PREFIXES.MEMBERSHIP && !withYear) {
    const rows = await tx.membership.findMany({
      select: {
        membershipNumber: true,
      },
      orderBy: {
        membershipNumber: "desc",
      },
      take: 1,
    });

    const existingMax = extractTrailingNumber(
      rows[0]?.membershipNumber
    );

    if (number <= existingMax) {
      number = existingMax + 1;
    }
  }

  // Supplier payments do not use a year.
  if (prefix === INVOICE_PREFIXES.SUPPLIER_PAYMENT && !withYear) {
    const rows = await tx.supplierPayment.findMany({
      select: {
        paymentNumber: true,
      },
      orderBy: {
        paymentNumber: "desc",
      },
      take: 1,
    });

    const existingMax = extractTrailingNumber(
      rows[0]?.paymentNumber
    );

    if (number <= existingMax) {
      number = existingMax + 1;
    }
  }

  // Supplier returns do not use a year.
  if (prefix === INVOICE_PREFIXES.SUPPLIER_RETURN && !withYear) {
    const rows = await tx.supplierReturn.findMany({
      select: {
        returnNumber: true,
      },
      orderBy: {
        returnNumber: "desc",
      },
      take: 1,
    });

    const existingMax = extractTrailingNumber(
      rows[0]?.returnNumber
    );

    if (number <= existingMax) {
      number = existingMax + 1;
    }
  }

  // Keep the sequence synchronized with the actual highest number.
  await tx.invoiceSequence.update({
    where: {
      prefix_year: { prefix, year },
    },
    data: {
      lastNumber: number,
    },
  });

  const padded = String(number).padStart(6, "0");

  return withYear
    ? `${prefix}-${year}-${padded}`
    : `${prefix}-${padded}`;
}
