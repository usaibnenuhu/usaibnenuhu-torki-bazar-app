import { prisma } from "@torki-bazar/database";
import type { InvoicePrefix } from "@torki-bazar/shared";

// Generates numbers like TB-SALE-2026-000001 or TB-MEM-000001 (no year).
// Uses an atomic increment inside the caller's transaction to avoid
// duplicate numbers under concurrent operations.
export async function nextInvoiceNumber(
  tx: typeof prisma,
  prefix: InvoicePrefix,
  opts: { withYear?: boolean } = { withYear: true }
): Promise<string> {
  const withYear = opts.withYear !== false;
  const year = withYear ? new Date().getFullYear() : 0; // 0 = no year component

  const sequence = await tx.invoiceSequence.upsert({
    where: { prefix_year: { prefix, year } },
    update: { lastNumber: { increment: 1 } },
    create: { prefix, year, lastNumber: 1 },
  });

  const number = withYear ? sequence.lastNumber : sequence.lastNumber;
  const padded = String(number).padStart(6, "0");
  return withYear ? `${prefix}-${year}-${padded}` : `${prefix}-${padded}`;
}
