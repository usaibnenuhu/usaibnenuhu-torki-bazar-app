import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, ValidationError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";

export interface CreateCashTransactionInput {
  type: "MANUAL_IN" | "MANUAL_OUT";
  amount: number;
  transactionDate?: Date;
  note?: string;
}

/**
 * Create a genuine manual cash transaction.
 *
 * Automatic cash entries created by saleService.ts
 * are also stored in cashTransaction.
 *
 * Therefore cashTransaction is the SINGLE SOURCE OF TRUTH
 * for Cash Management.
 */
export async function createCashTransaction(
  session: AuthSession,
  input: CreateCashTransactionInput
) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);

  if (input.amount <= 0) {
    throw new ValidationError(
      "Cash transaction amount must be greater than zero."
    );
  }

  if (!["MANUAL_IN", "MANUAL_OUT"].includes(input.type)) {
    throw new ValidationError("Invalid cash transaction type.");
  }

  const transaction = await prisma.cashTransaction.create({
    data: {
      type: input.type,
      amount: input.amount,
      transactionDate: input.transactionDate ?? new Date(),
      note: input.note,
      createdById: session.userId,
    },
  });

  await recordAuditLog(session, {
    action: "CREATE",
    module: "CASH_TRANSACTION",
    recordId: transaction.id,
    newValue: transaction,
  });

  return transaction;
}

/**
 * Old versions of the application created automatic
 * sale/payment rows in cashTransaction.
 *
 * Keep filtering these old rows so that historical
 * duplicate/legacy data does not appear in Cash Management.
 *
 * Current saleService.ts entries such as:
 *
 *   Cash sale - TB-SALE-...
 *   COD collection - TB-SALE-...
 *   Credit payment - TB-SALE-...
 *
 * are REAL cashTransaction records and must NOT be filtered.
 */
function isLegacyAutomaticCashTransaction(
  note?: string | null
) {
  const value = (note ?? "").trim();

  if (!value) {
    return false;
  }

  // Old format:
  // Sale TB-SALE-...
  if (/^Sale\s+TB-SALE-/i.test(value)) {
    return true;
  }

  // Old format:
  // COD collection - Sale TB-SALE-...
  if (
    /^COD collection\s*-\s*Sale\s+TB-SALE-/i.test(value)
  ) {
    return true;
  }

  // Old format:
  // Credit payment - Sale TB-SALE-...
  if (
    /^Credit payment\s*-\s*Sale\s+TB-SALE-/i.test(value)
  ) {
    return true;
  }

  // Old generic automatic payment row.
  if (/^Customer cash payment$/i.test(value)) {
    return true;
  }

  return false;
}

/**
 * List Cash Management transactions.
 *
 * IMPORTANT:
 *
 * We DO NOT query Sale and CustomerPayment here.
 *
 * saleService.ts already creates cashTransaction rows for:
 *
 *   CASH sale
 *   COD collection
 *   CREDIT payment
 *
 * If we also convert Sale/CustomerPayment into cash entries
 * here, the same cash event appears twice.
 *
 * Therefore:
 *
 *       cashTransaction = SINGLE SOURCE OF TRUTH
 */
export async function listCashTransactions(
  session: AuthSession,
  from?: Date,
  to?: Date
) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);

  const transactions =
    await prisma.cashTransaction.findMany({
      where: {
        ...(from || to
          ? {
              transactionDate: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },

      include: {
        createdBy: true,
      },

      orderBy: [
        {
          transactionDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

  /**
   * Only remove OLD legacy automatic rows.
   *
   * Current automatic entries created by saleService.ts
   * remain visible.
   */
  return transactions.filter(
    (transaction) =>
      !isLegacyAutomaticCashTransaction(
        transaction.note
      )
  );
}

/**
 * Calculate current cash balance.
 *
 * IMPORTANT:
 *
 * Do NOT calculate this from:
 *
 *   Sale
 *   CustomerPayment
 *
 * because those records have already been converted into
 * cashTransaction by saleService.ts.
 *
 * Calculating them again would double-count cash.
 */
export async function getCashBalance(
  session: AuthSession
) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);

  const transactions =
    await prisma.cashTransaction.findMany({
      select: {
        type: true,
        amount: true,
        note: true,
      },
    });

  const balance = transactions.reduce(
    (currentBalance, transaction) => {
      /**
       * Ignore old legacy automatic rows.
       */
      if (
        isLegacyAutomaticCashTransaction(
          transaction.note
        )
      ) {
        return currentBalance;
      }

      const amount =
        Number(transaction.amount);

      if (transaction.type === "MANUAL_IN") {
        return currentBalance + amount;
      }

      if (transaction.type === "MANUAL_OUT") {
        return currentBalance - amount;
      }

      return currentBalance;
    },
    0
  );

  return balance;
}

/**
 * Automatically record an expense cash outflow from inside database transactions.
 */
export async function recordExpenseCashOutflow(
  tx: any,
  session: AuthSession,
  amount: number,
  expenseNumber: string,
  description: string,
  expenseDate?: Date
) {
  const transaction = await tx.cashTransaction.create({
    data: {
      type: "MANUAL_OUT",
      amount: amount,
      transactionDate: expenseDate ?? new Date(),
      note: `Expense - ${expenseNumber}: ${description}`,
      createdById: session.userId,
    },
  });

  await recordAuditLog(
    session,
    {
      action: "CREATE",
      module: "CASH_TRANSACTION",
      recordId: transaction.id,
      newValue: transaction,
    },
    tx
  );
  return transaction;
}
