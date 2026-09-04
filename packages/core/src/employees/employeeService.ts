import { prisma, Prisma } from "@torki-bazar/database";
import { PERMISSIONS, INVOICE_PREFIXES, DuplicateError, NotFoundError, ValidationError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { nextInvoiceNumber } from "../invoicing/invoiceNumberService";

export async function listEmployees(includeInactive = false) {
  return prisma.employee.findMany({
    where: includeInactive ? {} : { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });
}

export async function createEmployee(
  session: AuthSession,
  input: { name: string; phone: string; address?: string; position: string; joiningDate?: Date; baseSalary: number; notes?: string }
) {
  assertPermission(session, PERMISSIONS.EMPLOYEES_MANAGE);
  const employee = await prisma.employee.create({ data: input });
  await recordAuditLog(session, { action: "CREATE", module: "EMPLOYEE", recordId: employee.id, newValue: employee });
  return employee;
}

export async function updateEmployee(
  session: AuthSession,
  id: string,
  input: Partial<{ name: string; phone: string; address?: string; position: string; baseSalary: number; notes?: string }>
) {
  assertPermission(session, PERMISSIONS.EMPLOYEES_MANAGE);
  const before = await prisma.employee.findUnique({ where: { id } });
  if (!before) throw new NotFoundError("Employee not found.");
  const employee = await prisma.employee.update({ where: { id }, data: input });
  await recordAuditLog(session, { action: "UPDATE", module: "EMPLOYEE", recordId: id, previousValue: before, newValue: employee });
  return employee;
}

export async function setEmployeeStatus(session: AuthSession, id: string, status: "ACTIVE" | "INACTIVE") {
  assertPermission(session, PERMISSIONS.EMPLOYEES_MANAGE);
  const employee = await prisma.employee.update({ where: { id }, data: { status } });
  await recordAuditLog(session, { action: "UPDATE_STATUS", module: "EMPLOYEE", recordId: id, newValue: { status } });
  return employee;
}

export async function paySalary(
  session: AuthSession,
  input: {
    employeeId: string;
    salaryMonth: string; // "YYYY-MM"
    bonus?: number;
    deduction?: number;
    paymentMethod: string;
    reference?: string;
  }
) {
  assertPermission(session, PERMISSIONS.SALARIES_MANAGE);
  const employee = await prisma.employee.findUnique({ where: { id: input.employeeId } });
  if (!employee) throw new NotFoundError("Employee not found.");

  const existing = await prisma.salary.findUnique({
    where: { employeeId_salaryMonth: { employeeId: input.employeeId, salaryMonth: input.salaryMonth } },
  });
  if (existing) throw new DuplicateError(`Salary for ${input.salaryMonth} has already been recorded for this employee.`);

  const baseSalary = new Prisma.Decimal(employee.baseSalary);
  const bonus = new Prisma.Decimal(input.bonus ?? 0);
  const deduction = new Prisma.Decimal(input.deduction ?? 0);
  const netSalary = baseSalary.add(bonus).sub(deduction);
  const numericNetSalary = Number(netSalary);

  if (numericNetSalary <= 0) throw new ValidationError("Net salary must be greater than zero.");

  // Check current cash balance before allowing payment
  const cashTransactions = await prisma.cashTransaction.findMany({
    select: { type: true, amount: true },
  });

  const currentCashBalance = cashTransactions.reduce((acc, tx) => {
    const val = Number(tx.amount);
    if (tx.type === "MANUAL_IN") return acc + val;
    if (tx.type === "MANUAL_OUT") return acc - val;
    return acc;
  }, 0);

  if (numericNetSalary > currentCashBalance) {
    throw new ValidationError(`Insufficient available cash. Current cash balance is ৳${currentCashBalance.toFixed(2)}, but net salary requires ৳${numericNetSalary.toFixed(2)}.`);
  }

  return prisma.$transaction(async (tx) => {
    const salariesCategory = await tx.expenseCategory.upsert({
      where: { name: "Salaries" },
      update: {},
      create: { name: "Salaries" },
    });

    const salary = await tx.salary.create({
      data: {
        employeeId: input.employeeId,
        salaryMonth: input.salaryMonth,
        baseSalary,
        bonus,
        deduction,
        netSalary,
        paymentStatus: "PAID",
        paymentDate: new Date(),
        paymentMethod: input.paymentMethod,
        reference: input.reference,
        createdById: session.userId,
      },
    });

    const expenseNumber = await nextInvoiceNumber(tx as unknown as typeof prisma, INVOICE_PREFIXES.EXPENSE);
    const description = `Salary payment — ${employee.name} (${input.salaryMonth})`;

    // 1. Create the expense record
    await tx.expense.create({
      data: {
        expenseNumber,
        categoryId: salariesCategory.id,
        description,
        amount: numericNetSalary,
        paymentMethod: input.paymentMethod,
        reference: input.reference,
        expenseDate: new Date(),
        createdById: session.userId,
      },
    });

    // 2. Automatically record cash outflow so it subtracts from Cash Management
    const cashOutflow = await tx.cashTransaction.create({
      data: {
        type: "MANUAL_OUT",
        amount: numericNetSalary,
        transactionDate: new Date(),
        note: `Expense - ${expenseNumber}: ${description}`,
        createdById: session.userId,
      },
    });

    await recordAuditLog(session, { action: "CREATE", module: "SALARY", recordId: salary.id, newValue: salary }, tx);
    await recordAuditLog(session, { action: "CREATE", module: "CASH_TRANSACTION", recordId: cashOutflow.id, newValue: cashOutflow }, tx);

    return salary;
  });
}

export async function listSalaries(employeeId?: string) {
  return prisma.salary.findMany({
    where: employeeId ? { employeeId } : {},
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });
}
