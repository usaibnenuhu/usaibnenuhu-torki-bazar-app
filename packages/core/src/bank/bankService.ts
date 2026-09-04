
import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, ValidationError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { enqueueSync } from "../sync/syncService";
import { randomUUID } from "crypto";

export type BankTransactionType =
  | "BANK_IN"
  | "BANK_OUT"
  | "DEPOSIT"
  | "WITHDRAWAL";

export type FundAccount = "CASH" | "BKASH" | "BANK";

export interface CreateBankTransactionInput {
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  transactionDate?: Date;
  note?: string;
  reference?: string;
}

export interface TransferFundsInput {
  from: FundAccount;
  to: FundAccount;
  amount: number;
  transactionDate?: Date;
  note?: string;
  reference?: string;
}

function isLegacyCash(note?: string | null) {
  const value = (note ?? "").trim();

  if (/^Sale\s+TB-SALE-/i.test(value)) return true;
  if (/^COD collection\s*-\s*Sale\s+TB-SALE-/i.test(value)) return true;
  if (/^Credit payment\s*-\s*Sale\s+TB-SALE-/i.test(value)) return true;
  if (/^Customer cash payment$/i.test(value)) return true;

  return false;
}

async function getBalance(tx: any, account: FundAccount): Promise<number> {
  if (account === "BANK") {
    const rows = await tx.bankTransaction.findMany({
      select: { type: true, amount: true },
    });

    return rows.reduce((balance: number, row: any) => {
      const amount = Number(row.amount);

      if (
        row.type === "BANK_IN" ||
        row.type === "DEPOSIT"
      ) {
        return balance + amount;
      }

      return balance - amount;
    }, 0);
  }

  if (account === "BKASH") {
    const rows = await tx.bkashTransaction.findMany({
      select: { type: true, amount: true },
    });

    return rows.reduce((balance: number, row: any) => {
      const amount = Number(row.amount);
      return row.type === "MANUAL_IN"
        ? balance + amount
        : balance - amount;
    }, 0);
  }

  const rows = await tx.cashTransaction.findMany({
    select: {
      type: true,
      amount: true,
      note: true,
    },
  });

  return rows.reduce((balance: number, row: any) => {
    if (isLegacyCash(row.note)) return balance;

    const amount = Number(row.amount);

    return row.type === "MANUAL_IN"
      ? balance + amount
      : balance - amount;
  }, 0);
}

async function queueBank(
  tx: any,
  transaction: any
) {
  await enqueueSync(
    "BANK_TRANSACTION",
    transaction.id,
    "CREATE",
    {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      reference: transaction.reference,
      transferId: transaction.transferId,
      createdById: transaction.createdById,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    },
    tx
  );
}

async function queueCash(
  tx: any,
  transaction: any
) {
  await enqueueSync(
    "CASH_TRANSACTION",
    transaction.id,
    "CREATE",
    transaction,
    tx
  );
}

async function queueBkash(
  tx: any,
  transaction: any
) {
  await enqueueSync(
    "BKASH_TRANSACTION",
    transaction.id,
    "CREATE",
    transaction,
    tx
  );
}

export async function createBankTransaction(
  session: AuthSession,
  input: CreateBankTransactionInput
) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);

  if (!input.amount || input.amount <= 0) {
    throw new ValidationError(
      "Bank transaction amount must be greater than zero."
    );
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.bankTransaction.create({
      data: {
        type: input.type === "DEPOSIT" ? "DEPOSIT" : "WITHDRAWAL",
        amount: input.amount,
        transactionDate: input.transactionDate ?? new Date(),
        note: input.note,
        reference: input.reference,
        createdById: session.userId,
      },
    });

    await queueBank(tx, transaction);

    await recordAuditLog(
      session,
      {
        action: "CREATE",
        module: "BANK_TRANSACTION",
        recordId: transaction.id,
        newValue: transaction,
      },
      tx
    );

    return transaction;
  });
}


export async function transferFunds(
  session: AuthSession,
  input: TransferFundsInput
) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);

  if (input.from === input.to) {
    throw new ValidationError(
      "Source and destination must be different."
    );
  }

  if (!input.amount || input.amount <= 0) {
    throw new ValidationError(
      "Transfer amount must be greater than zero."
    );
  }

  return prisma.$transaction(async (tx) => {
    const sourceBalance = await getBalance(tx, input.from);

    if (sourceBalance < input.amount) {
      throw new ValidationError(
        `Insufficient ${input.from.toLowerCase()} balance. Available: ৳${sourceBalance.toFixed(2)}`
      );
    }

    const transferId = randomUUID();
    const transactionDate = input.transactionDate ?? new Date();

    const note =
      input.note?.trim() ||
      `Transfer ${input.from} → ${input.to}`;

    const fullNote = `${note} [Transfer ${transferId}]`;

    let sourceTransaction: any;
    let destinationTransaction: any;

    // ---------------- SOURCE ----------------
    if (input.from === "CASH") {
      sourceTransaction = await tx.cashTransaction.create({
        data: {
          type: "MANUAL_OUT",
          amount: input.amount,
          transactionDate,
          note: fullNote,
          createdById: session.userId,
        },
      });
      await queueCash(tx, sourceTransaction);
    }

    if (input.from === "BKASH") {
      sourceTransaction = await tx.bkashTransaction.create({
        data: {
          type: "MANUAL_OUT",
          amount: input.amount,
          transactionDate,
          note: fullNote,
          createdById: session.userId,
        },
      });
      await queueBkash(tx, sourceTransaction);
    }

    if (input.from === "BANK") {
      sourceTransaction = await tx.bankTransaction.create({
        data: {
          type: "BANK_OUT",
          amount: input.amount,
          transactionDate,
          note: fullNote,
          reference: input.reference,
          transferId,
          createdById: session.userId,
        },
      });
      await queueBank(tx, sourceTransaction);
    }

    // ---------------- DESTINATION ----------------
    if (input.to === "CASH") {
      destinationTransaction = await tx.cashTransaction.create({
        data: {
          type: "MANUAL_IN",
          amount: input.amount,
          transactionDate,
          note: fullNote,
          createdById: session.userId,
        },
      });
      await queueCash(tx, destinationTransaction);
    }

    if (input.to === "BKASH") {
      destinationTransaction = await tx.bkashTransaction.create({
        data: {
          type: "MANUAL_IN",
          amount: input.amount,
          transactionDate,
          note: fullNote,
          createdById: session.userId,
        },
      });
      await queueBkash(tx, destinationTransaction);
    }

    if (input.to === "BANK") {
      destinationTransaction = await tx.bankTransaction.create({
        data: {
          type: "BANK_IN",
          amount: input.amount,
          transactionDate,
          note: fullNote,
          reference: input.reference,
          transferId,
          createdById: session.userId,
        },
      });
      await queueBank(tx, destinationTransaction);
    }

    await recordAuditLog(
      session,
      {
        action: "CREATE",
        module: "BANK_TRANSFER",
        recordId: transferId,
        newValue: {
          transferId,
          from: input.from,
          to: input.to,
          amount: input.amount,
          note,
          reference: input.reference,
          transactionDate,
        },
      },
      tx
    );

    return {
      transferId,
      from: input.from,
      to: input.to,
      amount: input.amount,
      sourceTransaction,
      destinationTransaction,
    };
  });
}

export async function listBankTransactions(
  session: AuthSession,
  from?: Date,
  to?: Date
) {
  assertPermission(session, PERMISSIONS.EXPENSES_VIEW);

  return prisma.bankTransaction.findMany({
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
    orderBy: {
      transactionDate: "desc",
    },
  });
}

export async function getBankBalance(session: AuthSession) {
  assertPermission(session, PERMISSIONS.EXPENSES_VIEW);

  return getBalance(prisma, "BANK");
}
