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
   * RETURN sequence self-healing
   *
   * Returns can be created on Electron and later synchronized to Neon.
   * Therefore InvoiceSequence may be behind the highest returnNumber
   * already present in the database.
   *
   * Example:
   *   Neon already contains TB-RET-2026-000004
   *   InvoiceSequence says 3
   *   The next online return MUST become 000005, not 000004.
   *
   * The PostgreSQL advisory lock above serializes concurrent generators.
   */
  /*
   * Self-healing collision-safe sequences.
   *
   * Electron can receive records from Neon whose invoice sequence is
   * ahead of the local InvoiceSequence table. Before generating a new
   * number, inspect the actual records and advance the sequence beyond
   * the highest existing number.
   *
   * This protects:
   *   - Purchases
   *   - Supplier payments
   *   - Customer returns
   *
   * The PostgreSQL advisory lock above serializes concurrent generators.
   * SQLite transaction locking provides serialization on Electron.
   */
  if (
    prefix === INVOICE_PREFIXES.PURCHASE ||
    prefix === INVOICE_PREFIXES.SUPPLIER_PAYMENT ||
    prefix === INVOICE_PREFIXES.RETURN
  ) {
    const isYearBased = prefix !== INVOICE_PREFIXES.SUPPLIER_PAYMENT;
    const effectiveYear = isYearBased ? year : 0;

    let highestExisting = 0;

    if (prefix === INVOICE_PREFIXES.PURCHASE) {
      const existing = await tx.purchase.findFirst({
        where: {
          purchaseNumber: {
            startsWith: `${prefix}-${year}-`,
          },
        },
        orderBy: {
          purchaseNumber: "desc",
        },
        select: {
          purchaseNumber: true,
        },
      });

      if (existing?.purchaseNumber) {
        const match = existing.purchaseNumber.match(/-(\d{6})$/);
        if (match) {
          highestExisting = Number(match[1]);
        }
      }
    }

    if (prefix === INVOICE_PREFIXES.SUPPLIER_PAYMENT) {
      const existing = await tx.supplierPayment.findFirst({
        where: {
          paymentNumber: {
            startsWith: `${prefix}-`,
          },
        },
        orderBy: {
          paymentNumber: "desc",
        },
        select: {
          paymentNumber: true,
        },
      });

      if (existing?.paymentNumber) {
        const match = existing.paymentNumber.match(/-(\d{6})$/);
        if (match) {
          highestExisting = Number(match[1]);
        }
      }
    }

    if (prefix === INVOICE_PREFIXES.RETURN) {
      const existing = await tx.return.findFirst({
        where: {
          returnNumber: {
            startsWith: `${prefix}-${year}-`,
          },
        },
        orderBy: {
          returnNumber: "desc",
        },
        select: {
          returnNumber: true,
        },
      });

      if (existing?.returnNumber) {
        const match = existing.returnNumber.match(/-(\d{6})$/);
        if (match) {
          highestExisting = Number(match[1]);
        }
      }
    }

    const currentSequence = await tx.invoiceSequence.findUnique({
      where: {
        prefix_year: {
          prefix,
          year: effectiveYear,
        },
      },
      select: {
        lastNumber: true,
      },
    });

    const nextNumber =
      Math.max(
        currentSequence?.lastNumber ?? 0,
        highestExisting
      ) + 1;

    const sequence = await tx.invoiceSequence.upsert({
      where: {
        prefix_year: {
          prefix,
          year: effectiveYear,
        },
      },
      update: {
        lastNumber: nextNumber,
      },
      create: {
        prefix,
        year: effectiveYear,
        lastNumber: nextNumber,
      },
    });

    const padded = String(sequence.lastNumber).padStart(6, "0");

    return isYearBased
      ? `${prefix}-${year}-${padded}`
      : `${prefix}-${padded}`;
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
