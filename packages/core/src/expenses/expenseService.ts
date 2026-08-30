import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, INVOICE_PREFIXES, ValidationError, NotFoundError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { nextInvoiceNumber } from "../invoicing/invoiceNumberService";
import { recordExpenseCashOutflow } from "../cash/cashService";
import { recordBkashExpenseOutflow } from "../bKash/bkashService";
import { enqueueSync } from "../sync/syncService";

export async function listExpenseCategories(includeArchived = false) {
  return prisma.expenseCategory.findMany({ where: includeArchived ? {} : { isArchived: false }, orderBy: { name: "asc" } });
}

export async function createExpenseCategory(session: AuthSession, name: string) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);
  const category = await prisma.expenseCategory.upsert({ where: { name }, update: {}, create: { name } });
  await recordAuditLog(session, { action: "CREATE", module: "EXPENSE_CATEGORY", recordId: category.id, newValue: category });
  return category;
}

export interface CreateExpenseInput {
  categoryId: string;
  description: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  expenseDate?: Date;
}

export async function createExpense(session: AuthSession, input: CreateExpenseInput) {
  assertPermission(session, PERMISSIONS.EXPENSES_MANAGE);
  if (input.amount <= 0) throw new ValidationError("Expense amount must be greater than zero.");

  return prisma.$transaction(async (tx) => {
    const expenseNumber = await nextInvoiceNumber(tx as unknown as typeof prisma, INVOICE_PREFIXES.EXPENSE);
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
      await recordBkashExpenseOutflow(
        tx,
        session,
        input.amount,
        expenseNumber,
        input.description,
        input.expenseDate ?? new Date()
      );
    } else {
      await recordExpenseCashOutflow(
        tx,
        session,
        input.amount,
        expenseNumber,
        input.description,
        input.expenseDate ?? new Date()
      );
    }

    await enqueueSync(
      "EXPENSE",
      expense.id,
      "CREATE",
      { id: expense.id },
      tx
    );

    await recordAuditLog(session, { action: "CREATE", module: "EXPENSE", recordId: expense.id, newValue: expense }, tx);
    return expense;
  });
}

// Managers cannot delete expenses — void preserves the historical record
export async function voidExpense(session: AuthSession, id: string, reason: string) {
  assertPermission(session, PERMISSIONS.EXPENSES_VOID);
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new NotFoundError("Expense not found.");
  const updated = await prisma.expense.update({ where: { id }, data: { status: "VOID", notes: `${expense.notes ?? ""}\nVOIDED: ${reason}`.trim() } });
  await recordAuditLog(session, { action: "VOID", module: "EXPENSE", recordId: id, newValue: { reason } });
  return updated;
}

export async function listExpenses(filters: { categoryId?: string; from?: Date; to?: Date } = {}) {
  return prisma.expense.findMany({
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
