"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listExpenseCategories = listExpenseCategories;
exports.createExpenseCategory = createExpenseCategory;
exports.createExpense = createExpense;
exports.voidExpense = voidExpense;
exports.listExpenses = listExpenses;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
const invoiceNumberService_1 = require("../invoicing/invoiceNumberService");
const cashService_1 = require("../cash/cashService");
const bkashService_1 = require("../bKash/bkashService");
async function listExpenseCategories(includeArchived = false) {
    return database_1.prisma.expenseCategory.findMany({ where: includeArchived ? {} : { isArchived: false }, orderBy: { name: "asc" } });
}
async function createExpenseCategory(session, name) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EXPENSES_MANAGE);
    const category = await database_1.prisma.expenseCategory.upsert({ where: { name }, update: {}, create: { name } });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "EXPENSE_CATEGORY", recordId: category.id, newValue: category });
    return category;
}
async function createExpense(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EXPENSES_MANAGE);
    if (input.amount <= 0)
        throw new shared_1.ValidationError("Expense amount must be greater than zero.");
    return database_1.prisma.$transaction(async (tx) => {
        const expenseNumber = await (0, invoiceNumberService_1.nextInvoiceNumber)(tx, shared_1.INVOICE_PREFIXES.EXPENSE);
        const expense = await tx.expense.create({
            data: {
                expenseNumber,
                categoryId: input.categoryId,
                description: input.description,
                amount: input.amount,
                paymentMethod: input.paymentMethod,
                reference: input.reference,
                notes: input.notes,
                expenseDate: input.expenseDate ?? new Date(),
                createdById: session.userId,
            },
        });
        // Automatically route outflow based on payment method
        if (input.paymentMethod.toUpperCase() === "BKASH") {
            await (0, bkashService_1.recordBkashExpenseOutflow)(tx, session, input.amount, expenseNumber, input.description, input.expenseDate ?? new Date());
        }
        else {
            await (0, cashService_1.recordExpenseCashOutflow)(tx, session, input.amount, expenseNumber, input.description, input.expenseDate ?? new Date());
        }
        await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "EXPENSE", recordId: expense.id, newValue: expense }, tx);
        return expense;
    });
}
// Managers cannot delete expenses — void preserves the historical record
async function voidExpense(session, id, reason) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EXPENSES_VOID);
    const expense = await database_1.prisma.expense.findUnique({ where: { id } });
    if (!expense)
        throw new shared_1.NotFoundError("Expense not found.");
    const updated = await database_1.prisma.expense.update({ where: { id }, data: { status: "VOID", notes: `${expense.notes ?? ""}\nVOIDED: ${reason}`.trim() } });
    await (0, auditService_1.recordAuditLog)(session, { action: "VOID", module: "EXPENSE", recordId: id, newValue: { reason } });
    return updated;
}
async function listExpenses(filters = {}) {
    return database_1.prisma.expense.findMany({
        where: {
            status: "RECORDED",
            ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
            ...(filters.from || filters.to
                ? { expenseDate: { gte: filters.from, lte: filters.to } }
                : {}),
        },
        include: { category: true, createdBy: true },
        orderBy: { expenseDate: "desc" },
    });
}
