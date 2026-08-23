"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomers = listCustomers;
exports.getCustomerProfile = getCustomerProfile;
exports.createCustomer = createCustomer;
exports.updateCustomer = updateCustomer;
exports.archiveCustomer = archiveCustomer;
exports.recordCustomerPayment = recordCustomerPayment;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
async function listCustomers(includeArchived = false) {
    const customers = await database_1.prisma.customer.findMany({
        where: includeArchived ? {} : { status: "ACTIVE" },
        include: { membership: true },
        orderBy: { name: "asc" },
    });
    const sales = await database_1.prisma.sale.findMany({
        where: { status: "COMPLETED", customerId: { not: null } },
        select: { id: true, customerId: true, totalAmount: true, paymentStatus: true },
    });
    const refunds = await database_1.prisma.return.groupBy({
        by: ["customerId"],
        where: { customerId: { not: null } },
        _sum: { totalRefund: true },
    });
    const payments = await database_1.prisma.customerPayment.findMany({ select: { customerId: true, saleId: true, amount: true } });
    // A sale is only receivable while it is unpaid — a PAID cash sale must never
    // land in Outstanding, and payments only offset the sale they belong to.
    const unpaidSaleIds = new Set(sales.filter((s) => s.paymentStatus !== "PAID").map((s) => s.id));
    const refundByCustomer = new Map(refunds.map((r) => [r.customerId, Number(r._sum.totalRefund ?? 0)]));
    return customers.map((c) => {
        const ownSales = sales.filter((s) => s.customerId === c.id);
        const grossSpending = ownSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const totalSpending = grossSpending - (refundByCustomer.get(c.id) ?? 0);
        const unpaidTotal = ownSales
            .filter((s) => s.paymentStatus !== "PAID")
            .reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const paidAgainstUnpaid = payments
            .filter((p) => p.customerId === c.id && (!p.saleId || unpaidSaleIds.has(p.saleId)))
            .reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            ...c,
            totalPurchases: ownSales.length,
            totalSpending,
            outstandingBalance: Math.max(0, unpaidTotal - paidAgainstUnpaid),
        };
    });
}
async function getCustomerProfile(customerId) {
    const customer = await database_1.prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            membership: true,
            sales: { orderBy: { saleDate: "desc" }, include: { items: true } },
            customerPayments: { orderBy: { paymentDate: "desc" } },
            returns: { orderBy: { returnDate: "desc" } },
        },
    });
    if (!customer)
        throw new shared_1.NotFoundError("Customer not found.");
    return customer;
}
async function createCustomer(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CUSTOMERS_MANAGE);
    const customer = await database_1.prisma.customer.create({ data: input });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "CUSTOMER", recordId: customer.id, newValue: customer });
    return customer;
}
async function updateCustomer(session, id, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CUSTOMERS_MANAGE);
    const before = await database_1.prisma.customer.findUnique({ where: { id } });
    if (!before)
        throw new shared_1.NotFoundError("Customer not found.");
    const customer = await database_1.prisma.customer.update({ where: { id }, data: input });
    await (0, auditService_1.recordAuditLog)(session, { action: "UPDATE", module: "CUSTOMER", recordId: id, previousValue: before, newValue: customer });
    return customer;
}
async function archiveCustomer(session, id, isArchived = true) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CUSTOMERS_MANAGE);
    const customer = await database_1.prisma.customer.update({ where: { id }, data: { status: isArchived ? "ARCHIVED" : "ACTIVE" } });
    await (0, auditService_1.recordAuditLog)(session, { action: isArchived ? "ARCHIVE" : "UNARCHIVE", module: "CUSTOMER", recordId: id });
    return customer;
}
// Records a customer payment against outstanding receivables (section 25).
async function recordCustomerPayment(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.CUSTOMER_PAYMENTS_MANAGE);
    if (input.amount <= 0)
        throw new shared_1.ValidationError("Payment amount must be greater than zero.");
    const payment = await database_1.prisma.customerPayment.create({
        data: {
            customerId: input.customerId,
            saleId: input.saleId,
            amount: input.amount,
            method: input.method,
            reference: input.reference,
            createdById: session.userId,
        },
    });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "CUSTOMER_PAYMENT", recordId: payment.id, newValue: payment });
    return payment;
}
