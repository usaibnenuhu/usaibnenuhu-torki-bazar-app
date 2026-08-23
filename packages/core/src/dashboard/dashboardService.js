"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = getDashboardSummary;
exports.getSalesTrend = getSalesTrend;
exports.getTopProducts = getTopProducts;
const database_1 = require("@torki-bazar/database");
const productService_1 = require("../catalog/productService");
const inventoryService_1 = require("../inventory/inventoryService");
const supplierService_1 = require("../suppliers/supplierService");
function startOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
function normalizeDashboardDate(date) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}
async function getDashboardSummary(customFrom, customTo) {
    const from = customFrom
        ? startOfDay(normalizeDashboardDate(customFrom))
        : startOfDay();
    const to = customTo
        ? endOfDay(normalizeDashboardDate(customTo))
        : endOfDay();
    const todaysSales = await database_1.prisma.sale.findMany({
        where: {
            saleDate: {
                gte: from,
                lte: to,
            },
            status: "COMPLETED",
            AND: [
                {
                    OR: [
                        { paymentMethod: { not: "COD" } },
                        { paymentMethod: "COD", paymentStatus: { not: "COD_PENDING" } },
                    ],
                },
                {
                    OR: [
                        { paymentMethod: { not: "CREDIT" } },
                        { paymentMethod: "CREDIT", paymentStatus: { notIn: ["DUE", "PARTIAL"] } },
                    ],
                },
            ],
        },
        include: {
            items: true,
        },
    });
    const todaysSalesTotal = todaysSales.reduce((sum, s) => sum.add(s.totalAmount), new database_1.Prisma.Decimal(0));
    const todaysCogs = todaysSales.reduce((sum, s) => sum.add(s.cogsAmount), new database_1.Prisma.Decimal(0));
    const todaysReturns = await database_1.prisma.return.findMany({
        where: {
            returnDate: {
                gte: from,
                lte: to,
            },
        },
        include: {
            items: {
                include: {
                    saleItem: true,
                },
            },
        },
    });
    const todaysReturnsTotal = todaysReturns.reduce((sum, r) => sum.add(r.items.reduce((itemSum, item) => itemSum.add(new database_1.Prisma.Decimal(item.refundAmount)), new database_1.Prisma.Decimal(0))), new database_1.Prisma.Decimal(0));
    // Proportional COGS deduction for returned items matching product purchase prices
    const returnedCogsTotal = todaysReturns.reduce((sum, r) => sum.add(r.items.reduce((itemSum, item) => {
        if (!item.saleItem || !item.saleItem.quantity || Number(item.saleItem.quantity) === 0) {
            return itemSum;
        }
        const itemCogsPerUnit = new database_1.Prisma.Decimal(item.saleItem.cogsTotal).div(item.saleItem.quantity);
        return itemSum.add(itemCogsPerUnit.mul(item.quantity));
    }, new database_1.Prisma.Decimal(0))), new database_1.Prisma.Decimal(0));
    const netSalesTotal = todaysSalesTotal.sub(todaysReturnsTotal);
    const netCogs = todaysCogs.sub(returnedCogsTotal);
    const todaysGrossProfit = netSalesTotal.sub(netCogs);
    const todaysExpenses = await database_1.prisma.expense.aggregate({
        where: {
            expenseDate: {
                gte: from,
                lte: to,
            },
            status: "RECORDED",
        },
        _sum: { amount: true },
    });
    const supplierPayables = (await (0, supplierService_1.listSuppliers)(true)).reduce((sum, s) => sum + s.outstandingPayable, 0);
    const inventoryLosses = await (0, inventoryService_1.listInventoryLosses)();
    const todaysInventoryLosses = await (0, inventoryService_1.listInventoryLosses)({ from, to });
    // Perfectly synchronized with customerService.ts outstanding balance calculation
    const allSales = await database_1.prisma.sale.findMany({
        where: { status: "COMPLETED", customerId: { not: null } },
        select: { id: true, customerId: true, totalAmount: true, paymentStatus: true },
    });
    const allPayments = await database_1.prisma.customerPayment.findMany({
        select: { customerId: true, saleId: true, amount: true },
    });
    const unpaidSaleIds = new Set(allSales.filter((s) => s.paymentStatus !== "PAID").map((s) => s.id));
    const totalReceivables = allSales.reduce((sum, s) => {
        const unpaidTotal = allSales
            .filter((sale) => sale.paymentStatus !== "PAID")
            .reduce((acc, sale) => acc + Number(sale.totalAmount), 0);
        const paidAgainstUnpaid = allPayments
            .filter((p) => (!p.saleId || unpaidSaleIds.has(p.saleId)))
            .reduce((acc, p) => acc + Number(p.amount), 0);
        return Math.max(0, unpaidTotal - paidAgainstUnpaid);
    }, 0);
    // Alternative cleaner sum using individual customer outstanding calculation logic:
    const customerIds = Array.from(new Set(allSales.map((s) => s.customerId).filter(Boolean)));
    let calculatedReceivables = 0;
    for (const cid of customerIds) {
        const ownSales = allSales.filter((s) => s.customerId === cid);
        const unpaidTotal = ownSales
            .filter((s) => s.paymentStatus !== "PAID")
            .reduce((acc, s) => acc + Number(s.totalAmount), 0);
        const paidAgainstUnpaid = allPayments
            .filter((p) => p.customerId === cid && (!p.saleId || unpaidSaleIds.has(p.saleId)))
            .reduce((acc, p) => acc + Number(p.amount), 0);
        calculatedReceivables += Math.max(0, unpaidTotal - paidAgainstUnpaid);
    }
    const codPending = await database_1.prisma.sale.aggregate({
        where: {
            paymentMethod: "COD",
            paymentStatus: "COD_PENDING",
            status: "COMPLETED",
        },
        _sum: { totalAmount: true },
        _count: true,
    });
    const [lowStock, expiringSoon, expired, totalCustomers, totalMembers, totalSuppliers,] = await Promise.all([
        (0, productService_1.getLowStockProducts)(),
        (0, inventoryService_1.getExpiringBatches)(),
        (0, inventoryService_1.getExpiredBatches)(),
        database_1.prisma.customer.count({ where: { status: "ACTIVE" } }),
        database_1.prisma.membership.count({ where: { status: "ACTIVE" } }),
        database_1.prisma.supplier.count({ where: { status: "ACTIVE" } }),
    ]);
    return {
        todaysSales: netSalesTotal,
        todaysGrossProfit,
        todaysCogs: netCogs,
        todaysExpenses: todaysExpenses._sum.amount ?? new database_1.Prisma.Decimal(0),
        supplierPayables,
        inventoryLossTotal: inventoryLosses.totalValue,
        inventoryLossCount: inventoryLosses.items.length,
        todaysInventoryLoss: todaysInventoryLosses.totalValue,
        customerReceivables: calculatedReceivables,
        codPendingAmount: codPending._sum.totalAmount ?? new database_1.Prisma.Decimal(0),
        codPendingCount: codPending._count,
        lowStockCount: lowStock.length,
        expiringSoonCount: expiringSoon.length,
        expiredCount: expired.length,
        totalCustomers,
        totalMembers,
        totalSuppliers,
    };
}
async function getSalesTrend(days = 30) {
    const from = startOfDay(new Date(Date.now() - days * 86_400_000));
    const sales = await database_1.prisma.sale.findMany({
        where: {
            saleDate: { gte: from },
            status: "COMPLETED",
            AND: [
                {
                    OR: [
                        { paymentMethod: { not: "COD" } },
                        { paymentMethod: "COD", paymentStatus: { not: "COD_PENDING" } },
                    ],
                },
                {
                    OR: [
                        { paymentMethod: { not: "CREDIT" } },
                        { paymentMethod: "CREDIT", paymentStatus: { notIn: ["DUE", "PARTIAL"] } },
                    ],
                },
            ],
        },
        select: {
            id: true,
            saleDate: true,
            totalAmount: true,
            cogsAmount: true,
        },
    });
    const returns = await database_1.prisma.return.findMany({
        where: {
            returnDate: { gte: from },
        },
        include: {
            items: {
                include: {
                    saleItem: true,
                },
            },
        },
    });
    const returnsByDay = new Map();
    for (const ret of returns) {
        const key = ret.returnDate.toISOString().slice(0, 10);
        const retTotal = ret.items.reduce((sum, item) => sum.add(new database_1.Prisma.Decimal(item.refundAmount)), new database_1.Prisma.Decimal(0));
        const retCogs = ret.items.reduce((sum, item) => {
            if (!item.saleItem || !item.saleItem.quantity || Number(item.saleItem.quantity) === 0) {
                return sum;
            }
            const itemCogsPerUnit = new database_1.Prisma.Decimal(item.saleItem.cogsTotal).div(item.saleItem.quantity);
            return sum.add(itemCogsPerUnit.mul(item.quantity));
        }, new database_1.Prisma.Decimal(0));
        const existing = returnsByDay.get(key) ?? {
            revenue: new database_1.Prisma.Decimal(0),
            cogs: new database_1.Prisma.Decimal(0),
        };
        returnsByDay.set(key, {
            revenue: existing.revenue.add(retTotal),
            cogs: existing.cogs.add(retCogs),
        });
    }
    const byDay = new Map();
    for (const sale of sales) {
        const key = sale.saleDate.toISOString().slice(0, 10);
        const entry = byDay.get(key) ?? {
            sales: new database_1.Prisma.Decimal(0),
            profit: new database_1.Prisma.Decimal(0),
        };
        entry.sales = entry.sales.add(sale.totalAmount);
        entry.profit = entry.profit.add(new database_1.Prisma.Decimal(sale.totalAmount).sub(sale.cogsAmount));
        byDay.set(key, entry);
    }
    for (const [key, retVal] of returnsByDay.entries()) {
        const entry = byDay.get(key);
        if (entry) {
            entry.sales = entry.sales.sub(retVal.revenue);
            entry.profit = entry.profit.sub(retVal.revenue).add(retVal.cogs);
        }
    }
    return Array.from(byDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({
        date,
        sales: v.sales,
        profit: v.profit,
    }));
}
async function getTopProducts(limit = 10, from, to) {
    const items = await database_1.prisma.saleItem.findMany({
        where: {
            sale: {
                status: "COMPLETED",
                AND: [
                    {
                        OR: [
                            { paymentMethod: { not: "COD" } },
                            { paymentMethod: "COD", paymentStatus: { not: "COD_PENDING" } },
                        ],
                    },
                    {
                        OR: [
                            { paymentMethod: { not: "CREDIT" } },
                            { paymentMethod: "CREDIT", paymentStatus: { notIn: ["DUE", "PARTIAL"] } },
                        ],
                    },
                ],
                ...(from || to
                    ? { saleDate: { gte: from, lte: to } }
                    : {}),
            },
        },
        include: { product: true },
    });
    const byProduct = new Map();
    for (const item of items) {
        const entry = byProduct.get(item.productId) ?? {
            name: item.product.name,
            quantitySold: new database_1.Prisma.Decimal(0),
            revenue: new database_1.Prisma.Decimal(0),
            cogs: new database_1.Prisma.Decimal(0),
        };
        entry.quantitySold = entry.quantitySold.add(item.quantity);
        entry.revenue = entry.revenue.add(item.subtotal);
        entry.cogs = entry.cogs.add(item.cogsTotal);
        byProduct.set(item.productId, entry);
    }
    return Array.from(byProduct.entries())
        .map(([productId, v]) => ({
        productId,
        ...v,
        grossProfit: v.revenue.sub(v.cogs),
    }))
        .sort((a, b) => Number(b.revenue.sub(a.revenue)))
        .slice(0, limit);
}
