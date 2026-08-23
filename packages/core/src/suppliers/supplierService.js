"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSettlement = computeSettlement;
exports.listSuppliers = listSuppliers;
exports.getSupplierProfile = getSupplierProfile;
exports.getSupplierOutstanding = getSupplierOutstanding;
exports.getSupplierSettlement = getSupplierSettlement;
exports.createSupplier = createSupplier;
exports.updateSupplier = updateSupplier;
exports.archiveSupplier = archiveSupplier;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
// Payable is always derived from transactions so no screen can disagree. Only
// CREDIT returns offset it — a CASH_REFUND return is money back in hand. Credit
// beyond what is owed is carried as availableCredit rather than a negative payable.
async function payableTotals() {
    const [purchases, returns, payments] = await Promise.all([
        database_1.prisma.purchase.groupBy({
            by: ["supplierId"],
            where: { status: "COMPLETED" },
            _sum: { totalAmount: true },
            _count: true,
        }),
        database_1.prisma.supplierReturn.groupBy({
            by: ["supplierId", "settlementType"],
            where: { status: "COMPLETED" },
            _sum: { returnValue: true, quantity: true },
            _count: true,
        }),
        database_1.prisma.supplierPayment.groupBy({ by: ["supplierId"], _sum: { amount: true }, _count: true }),
    ]);
    const credits = new Map();
    const refunds = new Map();
    const returnedValue = new Map();
    const returnCount = new Map();
    for (const row of returns) {
        const value = Number(row._sum.returnValue ?? 0);
        returnedValue.set(row.supplierId, (returnedValue.get(row.supplierId) ?? 0) + value);
        returnCount.set(row.supplierId, (returnCount.get(row.supplierId) ?? 0) + row._count);
        const bucket = row.settlementType === "CASH_REFUND" ? refunds : credits;
        bucket.set(row.supplierId, (bucket.get(row.supplierId) ?? 0) + value);
    }
    return {
        purchases: new Map(purchases.map((t) => [t.supplierId, t])),
        payments: new Map(payments.map((t) => [t.supplierId, t])),
        credits,
        refunds,
        returnedValue,
        returnCount,
    };
}
function computeSettlement(totalPurchases, totalPaid, totalCredit) {
    const net = totalPurchases - totalPaid - totalCredit;
    return { outstandingPayable: Math.max(0, net), availableCredit: Math.max(0, -net) };
}
async function listSuppliers(includeArchived = false) {
    const suppliers = await database_1.prisma.supplier.findMany({
        where: includeArchived ? {} : { status: "ACTIVE" },
        orderBy: { name: "asc" },
    });
    const totals = await payableTotals();
    return suppliers.map((s) => {
        const totalPurchases = Number(totals.purchases.get(s.id)?._sum.totalAmount ?? 0);
        const totalPaid = Number(totals.payments.get(s.id)?._sum.amount ?? 0);
        const creditFromReturns = totals.credits.get(s.id) ?? 0;
        const { outstandingPayable, availableCredit } = computeSettlement(totalPurchases, totalPaid, creditFromReturns);
        return {
            ...s,
            purchaseCount: totals.purchases.get(s.id)?._count ?? 0,
            returnCount: totals.returnCount.get(s.id) ?? 0,
            totalPurchases,
            totalReturned: totals.returnedValue.get(s.id) ?? 0,
            creditFromReturns,
            cashRefunds: totals.refunds.get(s.id) ?? 0,
            totalPaid,
            outstandingPayable,
            availableCredit,
        };
    });
}
async function getSupplierProfile(supplierId) {
    const supplier = await database_1.prisma.supplier.findUnique({
        where: { id: supplierId },
        include: {
            purchases: { orderBy: { purchaseDate: "desc" }, include: { items: { include: { product: true } } } },
            supplierPayments: { orderBy: { paymentDate: "desc" } },
            supplierReturns: {
                orderBy: { returnDate: "desc" },
                include: { product: true, purchase: true, batch: true },
            },
        },
    });
    if (!supplier)
        throw new shared_1.NotFoundError("Supplier not found.");
    const completedPurchases = supplier.purchases.filter((p) => p.status === "COMPLETED");
    const completedReturns = supplier.supplierReturns.filter((r) => r.status === "COMPLETED");
    const totalPurchases = completedPurchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
    const totalReturned = completedReturns.reduce((sum, r) => sum + Number(r.returnValue), 0);
    const creditFromReturns = completedReturns
        .filter((r) => r.settlementType !== "CASH_REFUND")
        .reduce((sum, r) => sum + Number(r.returnValue), 0);
    const totalPaid = supplier.supplierPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const { outstandingPayable, availableCredit } = computeSettlement(totalPurchases, totalPaid, creditFromReturns);
    return {
        ...supplier,
        summary: {
            totalPurchases,
            totalPaid,
            totalReturned,
            creditFromReturns,
            cashRefunds: totalReturned - creditFromReturns,
            outstandingPayable,
            availableCredit,
            purchaseCount: completedPurchases.length,
            lastPurchaseDate: completedPurchases[0]?.purchaseDate ?? null,
            lastPurchaseNumber: completedPurchases[0]?.purchaseNumber ?? null,
            paymentCount: supplier.supplierPayments.length,
            lastPaymentDate: supplier.supplierPayments[0]?.paymentDate ?? null,
            returnCount: completedReturns.length,
            returnedQuantity: completedReturns.reduce((sum, r) => sum + Number(r.quantity), 0),
            lastReturnDate: completedReturns[0]?.returnDate ?? null,
        },
    };
}
async function getSupplierOutstanding(supplierId) {
    return (await getSupplierSettlement(supplierId)).outstandingPayable;
}
async function getSupplierSettlement(supplierId) {
    const [purchases, credits, payments] = await Promise.all([
        database_1.prisma.purchase.aggregate({ where: { supplierId, status: "COMPLETED" }, _sum: { totalAmount: true } }),
        database_1.prisma.supplierReturn.aggregate({
            where: { supplierId, status: "COMPLETED", settlementType: { not: "CASH_REFUND" } },
            _sum: { returnValue: true },
        }),
        database_1.prisma.supplierPayment.aggregate({ where: { supplierId }, _sum: { amount: true } }),
    ]);
    return computeSettlement(Number(purchases._sum.totalAmount ?? 0), Number(payments._sum.amount ?? 0), Number(credits._sum.returnValue ?? 0));
}
async function createSupplier(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.SUPPLIERS_MANAGE);
    if (!input.name?.trim())
        throw new shared_1.ValidationError("Supplier name is required.");
    if (!input.phone?.trim())
        throw new shared_1.ValidationError("Supplier phone number is required.");
    const supplier = await database_1.prisma.supplier.create({ data: { ...input, name: input.name.trim(), phone: input.phone.trim() } });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "SUPPLIER", recordId: supplier.id, newValue: supplier });
    return supplier;
}
async function updateSupplier(session, id, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.SUPPLIERS_MANAGE);
    const before = await database_1.prisma.supplier.findUnique({ where: { id } });
    if (!before)
        throw new shared_1.NotFoundError("Supplier not found.");
    if (input.name !== undefined && !input.name.trim())
        throw new shared_1.ValidationError("Supplier name is required.");
    if (input.phone !== undefined && !input.phone.trim())
        throw new shared_1.ValidationError("Supplier phone number is required.");
    const supplier = await database_1.prisma.supplier.update({ where: { id }, data: input });
    await (0, auditService_1.recordAuditLog)(session, { action: "UPDATE", module: "SUPPLIER", recordId: id, previousValue: before, newValue: supplier });
    return supplier;
}
async function archiveSupplier(session, id, isArchived = true) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.SUPPLIERS_MANAGE);
    const supplier = await database_1.prisma.supplier.update({ where: { id }, data: { status: isArchived ? "ARCHIVED" : "ACTIVE" } });
    await (0, auditService_1.recordAuditLog)(session, { action: isArchived ? "ARCHIVE" : "UNARCHIVE", module: "SUPPLIER", recordId: id });
    return supplier;
}
