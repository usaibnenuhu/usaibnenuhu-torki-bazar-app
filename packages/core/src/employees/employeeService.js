"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEmployees = listEmployees;
exports.createEmployee = createEmployee;
exports.updateEmployee = updateEmployee;
exports.setEmployeeStatus = setEmployeeStatus;
exports.paySalary = paySalary;
exports.listSalaries = listSalaries;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
const invoiceNumberService_1 = require("../invoicing/invoiceNumberService");
async function listEmployees(includeInactive = false) {
    return database_1.prisma.employee.findMany({
        where: includeInactive ? {} : { status: "ACTIVE" },
        orderBy: { name: "asc" },
    });
}
async function createEmployee(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EMPLOYEES_MANAGE);
    const employee = await database_1.prisma.employee.create({ data: input });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "EMPLOYEE", recordId: employee.id, newValue: employee });
    return employee;
}
async function updateEmployee(session, id, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EMPLOYEES_MANAGE);
    const before = await database_1.prisma.employee.findUnique({ where: { id } });
    if (!before)
        throw new shared_1.NotFoundError("Employee not found.");
    const employee = await database_1.prisma.employee.update({ where: { id }, data: input });
    await (0, auditService_1.recordAuditLog)(session, { action: "UPDATE", module: "EMPLOYEE", recordId: id, previousValue: before, newValue: employee });
    return employee;
}
async function setEmployeeStatus(session, id, status) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EMPLOYEES_MANAGE);
    const employee = await database_1.prisma.employee.update({ where: { id }, data: { status } });
    await (0, auditService_1.recordAuditLog)(session, { action: "UPDATE_STATUS", module: "EMPLOYEE", recordId: id, newValue: { status } });
    return employee;
}
async function paySalary(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.SALARIES_MANAGE);
    const employee = await database_1.prisma.employee.findUnique({ where: { id: input.employeeId } });
    if (!employee)
        throw new shared_1.NotFoundError("Employee not found.");
    const existing = await database_1.prisma.salary.findUnique({
        where: { employeeId_salaryMonth: { employeeId: input.employeeId, salaryMonth: input.salaryMonth } },
    });
    if (existing)
        throw new shared_1.DuplicateError(`Salary for ${input.salaryMonth} has already been recorded for this employee.`);
    const baseSalary = new database_1.Prisma.Decimal(employee.baseSalary);
    const bonus = new database_1.Prisma.Decimal(input.bonus ?? 0);
    const deduction = new database_1.Prisma.Decimal(input.deduction ?? 0);
    const netSalary = baseSalary.add(bonus).sub(deduction);
    const numericNetSalary = Number(netSalary);
    if (numericNetSalary <= 0)
        throw new shared_1.ValidationError("Net salary must be greater than zero.");
    // Check current cash balance before allowing payment
    const cashTransactions = await database_1.prisma.cashTransaction.findMany({
        select: { type: true, amount: true },
    });
    const currentCashBalance = cashTransactions.reduce((acc, tx) => {
        const val = Number(tx.amount);
        if (tx.type === "MANUAL_IN")
            return acc + val;
        if (tx.type === "MANUAL_OUT")
            return acc - val;
        return acc;
    }, 0);
    if (numericNetSalary > currentCashBalance) {
        throw new shared_1.ValidationError(`Insufficient available cash. Current cash balance is ৳${currentCashBalance.toFixed(2)}, but net salary requires ৳${numericNetSalary.toFixed(2)}.`);
    }
    return database_1.prisma.$transaction(async (tx) => {
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
        const expenseNumber = await (0, invoiceNumberService_1.nextInvoiceNumber)(tx, shared_1.INVOICE_PREFIXES.EXPENSE);
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
        await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "SALARY", recordId: salary.id, newValue: salary }, tx);
        await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "CASH_TRANSACTION", recordId: cashOutflow.id, newValue: cashOutflow }, tx);
        return salary;
    });
}
async function listSalaries(employeeId) {
    return database_1.prisma.salary.findMany({
        where: employeeId ? { employeeId } : {},
        include: { employee: true },
        orderBy: { createdAt: "desc" },
    });
}
