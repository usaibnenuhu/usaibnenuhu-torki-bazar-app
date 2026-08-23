"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBkashTransaction = createBkashTransaction;
exports.listBkashTransactions = listBkashTransactions;
exports.getBkashBalance = getBkashBalance;
exports.recordBkashSaleInflow = recordBkashSaleInflow;
exports.recordBkashReturnOutflow = recordBkashReturnOutflow;
exports.recordBkashExpenseOutflow = recordBkashExpenseOutflow;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
async function createBkashTransaction(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EXPENSES_MANAGE);
    if (input.amount <= 0) {
        throw new shared_1.ValidationError("bKash transaction amount must be greater than zero.");
    }
    const transaction = await database_1.prisma.bkashTransaction.create({
        data: {
            type: input.type,
            amount: input.amount,
            transactionDate: input.transactionDate ?? new Date(),
            note: input.note,
            createdById: session.userId,
        },
    });
    await (0, auditService_1.recordAuditLog)(session, {
        action: "CREATE",
        module: "BKASH_TRANSACTION",
        recordId: transaction.id,
        newValue: transaction,
    });
    return transaction;
}
async function listBkashTransactions(session, from, to) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EXPENSES_MANAGE);
    return database_1.prisma.bkashTransaction.findMany({
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
async function getBkashBalance(session) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EXPENSES_MANAGE);
    const transactions = await database_1.prisma.bkashTransaction.findMany({
        select: { type: true, amount: true },
    });
    return transactions.reduce((balance, tx) => {
        const amount = Number(tx.amount);
        if (tx.type === "MANUAL_IN")
            return balance + amount;
        if (tx.type === "MANUAL_OUT")
            return balance - amount;
        return balance;
    }, 0);
}
// 1. Automatic bKash Sale Inflow
async function recordBkashSaleInflow(tx, session, amount, saleNumber) {
    const transaction = await tx.bkashTransaction.create({
        data: {
            type: "MANUAL_IN",
            amount: amount,
            transactionDate: new Date(),
            note: `bKash Sale - ${saleNumber}`,
            createdById: session.userId,
        },
    });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "BKASH_TRANSACTION", recordId: transaction.id, newValue: transaction }, tx);
    return transaction;
}
// 2. Automatic bKash Return Outflow
async function recordBkashReturnOutflow(tx, session, amount, returnNumber) {
    const transaction = await tx.bkashTransaction.create({
        data: {
            type: "MANUAL_OUT",
            amount: amount,
            transactionDate: new Date(),
            note: `Customer refund - Return ${returnNumber} (bKash)`,
            createdById: session.userId,
        },
    });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "BKASH_TRANSACTION", recordId: transaction.id, newValue: transaction }, tx);
    return transaction;
}
// 3. Automatic bKash Expense Outflow
async function recordBkashExpenseOutflow(tx, session, amount, expenseNumber, description, expenseDate) {
    const transaction = await tx.bkashTransaction.create({
        data: {
            type: "MANUAL_OUT",
            amount: amount,
            transactionDate: expenseDate ?? new Date(),
            note: `Expense - ${expenseNumber}: ${description} (bKash)`,
            createdById: session.userId,
        },
    });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "BKASH_TRANSACTION", recordId: transaction.id, newValue: transaction }, tx);
    return transaction;
}
