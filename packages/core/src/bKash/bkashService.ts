import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, ValidationError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { enqueueSync } from "../sync/syncService";

export interface CreateBkashTransactionInput {
  type: "MANUAL_IN" | "MANUAL_OUT";
  amount: number;
  transactionDate?: Date;
  note?: string;
}

export async function createBkashTransaction(
  session: AuthSession,
  input: CreateBkashTransactionInput
) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);

  if (input.amount <= 0) {
    throw new ValidationError("bKash transaction amount must be greater than zero.");
  }

  const transaction = await prisma.bkashTransaction.create({
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
    module: "BKASH_TRANSACTION",
    recordId: transaction.id,
    newValue: transaction,
  });

  await enqueueSync(
    "BKASH_TRANSACTION",
    transaction.id,
    "CREATE",
    transaction
  );

  return transaction;
}

export async function listBkashTransactions(
  session: AuthSession,
  from?: Date,
  to?: Date
) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);

  return prisma.bkashTransaction.findMany({
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
    include: { createdBy: true },
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function getBkashBalance(session: AuthSession) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);

  const transactions = await prisma.bkashTransaction.findMany({
    select: { type: true, amount: true },
  });

  return transactions.reduce((balance, tx) => {
    const amount = Number(tx.amount);
    if (tx.type === "MANUAL_IN") return balance + amount;
    if (tx.type === "MANUAL_OUT") return balance - amount;
    return balance;
  }, 0);
}

// 1. Automatic bKash Sale Inflow
export async function recordBkashSaleInflow(
  tx: any,
  session: AuthSession,
  amount: number,
  saleNumber: string
) {
  const transaction = await tx.bkashTransaction.create({
    data: {
      type: "MANUAL_IN",
      amount: amount,
      transactionDate: new Date(),
      note: `bKash Sale - ${saleNumber}`,
      createdById: session.userId,
    },
  });
  await recordAuditLog(session, { action: "CREATE", module: "BKASH_TRANSACTION", recordId: transaction.id, newValue: transaction }, tx);
  await enqueueSync(
    "BKASH_TRANSACTION",
    transaction.id,
    "CREATE",
    transaction,
    tx
  );
  return transaction;
}

// 2. Automatic bKash Return Outflow
export async function recordBkashReturnOutflow(
  tx: any,
  session: AuthSession,
  amount: number,
  returnNumber: string
) {
  const transaction = await tx.bkashTransaction.create({
    data: {
      type: "MANUAL_OUT",
      amount: amount,
      transactionDate: new Date(),
      note: `Customer refund - Return ${returnNumber} (bKash)`,
      createdById: session.userId,
    },
  });
  await recordAuditLog(session, { action: "CREATE", module: "BKASH_TRANSACTION", recordId: transaction.id, newValue: transaction }, tx);
  await enqueueSync(
    "BKASH_TRANSACTION",
    transaction.id,
    "CREATE",
    transaction,
    tx
  );
  return transaction;
}

// 3. Automatic bKash Expense Outflow
export async function recordBkashExpenseOutflow(
  tx: any,
  session: AuthSession,
  amount: number,
  expenseNumber: string,
  description: string,
  expenseDate?: Date
) {
  const transaction = await tx.bkashTransaction.create({
    data: {
      type: "MANUAL_OUT",
      amount: amount,
      transactionDate: expenseDate ?? new Date(),
      note: `Expense - ${expenseNumber}: ${description} (bKash)`,
      createdById: session.userId,
    },
  });
  await recordAuditLog(session, { action: "CREATE", module: "BKASH_TRANSACTION", recordId: transaction.id, newValue: transaction }, tx);
  await enqueueSync(
    "BKASH_TRANSACTION",
    transaction.id,
    "CREATE",
    transaction,
    tx
  );
  return transaction;
}
