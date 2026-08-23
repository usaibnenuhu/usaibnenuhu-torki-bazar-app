"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyClosing = generateDailyClosing;
exports.listDailyClosings = listDailyClosings;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
// Generates and persists the daily business closing report.
// Historical closings are immutable once created.
async function generateDailyClosing(session, closingDate) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.REPORTS_VIEW);
    const from = startOfDay(closingDate);
    const to = endOfDay(closingDate);
    const existing = await database_1.prisma.dailyClosing.findUnique({ where: { closingDate: from } });
    if (existing)
        throw new shared_1.DuplicateError(`A daily closing for ${from.toDateString()} already exists.`);
    const sales = await database_1.prisma.sale.findMany({
        where: { saleDate: { gte: from, lte: to }, status: "COMPLETED" },
        include: { items: true },
    });
    const totalSalesGross = sales.reduce((s, x) => s.add(x.totalAmount), new database_1.Prisma.Decimal(0));
    const cashSales = sales
        .filter((x) => x.paymentMethod === "CASH")
        .reduce((s, x) => s.add(x.totalAmount), new database_1.Prisma.Decimal(0));
    const bkashSales = sales
        .filter((x) => x.paymentMethod === "BKASH")
        .reduce((s, x) => s.add(x.totalAmount), new database_1.Prisma.Decimal(0));
    const codCollected = sales
        .filter((x) => x.paymentMethod === "COD" && x.paymentStatus === "PAID" && x.codCollectedAt && x.codCollectedAt >= from && x.codCollectedAt <= to)
        .reduce((s, x) => s.add(x.totalAmount), new database_1.Prisma.Decimal(0));
    const cogsGross = sales.reduce((s, x) => s.add(x.cogsAmount), new database_1.Prisma.Decimal(0));
    // Fetch returns to properly subtract returned revenue and proportional COGS
    const returns = await database_1.prisma.return.findMany({
        where: { returnDate: { gte: from, lte: to } },
        include: {
            items: {
                include: {
                    saleItem: true,
                },
            },
        },
    });
    const totalReturnsRefund = returns.reduce((sum, r) => sum.add(r.items.reduce((itemSum, item) => itemSum.add(new database_1.Prisma.Decimal(item.refundAmount)), new database_1.Prisma.Decimal(0))), new database_1.Prisma.Decimal(0));
    const returnedCogsTotal = returns.reduce((sum, r) => sum.add(r.items.reduce((itemSum, item) => {
        if (!item.saleItem || !item.saleItem.quantity || Number(item.saleItem.quantity) === 0) {
            return itemSum;
        }
        const itemCogsPerUnit = new database_1.Prisma.Decimal(item.saleItem.cogsTotal).div(item.saleItem.quantity);
        return itemSum.add(itemCogsPerUnit.mul(item.quantity));
    }, new database_1.Prisma.Decimal(0))), new database_1.Prisma.Decimal(0));
    const totalSales = totalSalesGross.sub(totalReturnsRefund);
    const cogs = cogsGross.sub(returnedCogsTotal);
    const grossProfit = totalSales.sub(cogs);
    // Fetch expenses, excluding heavy one-time monthly salary expenses from daily trading net result distortion
    const rawExpenses = await database_1.prisma.expense.findMany({
        where: { expenseDate: { gte: from, lte: to }, status: "RECORDED" },
        include: { category: true },
    });
    const filteredExpenses = rawExpenses.filter((ex) => {
        const text = `${ex.notes ?? ""} ${ex.category?.name ?? ""}`.toLowerCase();
        return !text.includes("salary") && !text.includes("payroll") && !text.includes("monthly");
    });
    const expensesTotal = filteredExpenses.reduce((sum, ex) => sum.add(new database_1.Prisma.Decimal(ex.amount)), new database_1.Prisma.Decimal(0));
    const supplierPayments = await database_1.prisma.supplierPayment.aggregate({
        where: { paymentDate: { gte: from, lte: to } },
        _sum: { amount: true },
    });
    const customerPayments = await database_1.prisma.customerPayment.aggregate({
        where: { paymentDate: { gte: from, lte: to } },
        _sum: { amount: true },
    });
    const netOperatingResult = grossProfit.sub(expensesTotal);
    const closing = await database_1.prisma.dailyClosing.create({
        data: {
            closingDate: from,
            totalSales,
            cashSales,
            bkashSales,
            codCollected,
            returns: totalReturnsRefund,
            expenses: expensesTotal,
            supplierPayments: supplierPayments._sum.amount ?? 0,
            customerPayments: customerPayments._sum.amount ?? 0,
            cogs,
            grossProfit,
            netOperatingResult,
            closedById: session.userId,
        },
    });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "DAILY_CLOSING", recordId: closing.id });
    return closing;
}
async function listDailyClosings() {
    return database_1.prisma.dailyClosing.findMany({ orderBy: { closingDate: "desc" } });
}
