"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhone = normalizePhone;
exports.createSale = createSale;
exports.markCodCollected = markCodCollected;
exports.collectCreditPayment = collectCreditPayment;
exports.reconcileCashTransactions = reconcileCashTransactions;
exports.voidSale = voidSale;
exports.getSaleWithDetails = getSaleWithDetails;
exports.listSales = listSales;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
const invoiceNumberService_1 = require("../invoicing/invoiceNumberService");
const inventoryService_1 = require("../inventory/inventoryService");
const bkashService_1 = require("../bKash/bkashService");
function generateUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x"
            ? r
            : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function normalizePhone(raw) {
    const cleaned = (raw ?? "").replace(/[^\d+]/g, "");
    return cleaned || undefined;
}
async function resolveCustomerId(tx, input) {
    if (input.customerId) {
        return input.customerId;
    }
    const phone = normalizePhone(input.customerPhone);
    if (!phone) {
        return undefined;
    }
    const exact = await tx.customer.findUnique({
        where: {
            phone,
        },
    });
    if (exact) {
        return exact.id;
    }
    const candidates = await tx.customer.findMany({
        where: {
            phone: {
                not: null,
            },
        },
        select: {
            id: true,
            phone: true,
        },
    });
    const match = candidates.find((c) => normalizePhone(c.phone) === phone);
    if (match) {
        return match.id;
    }
    const created = await tx.customer.create({
        data: {
            name: input.customerName?.trim() ||
                phone,
            phone,
        },
    });
    return created.id;
}
/**
 * Create an automatic cash transaction only once.
 * Strictly checks by note to completely prevent duplicate entries.
 */
async function createCashTransactionOnce(tx, input) {
    const existing = await tx.cashTransaction.findFirst({
        where: {
            note: input.note,
        },
    });
    if (existing) {
        return existing;
    }
    return tx.cashTransaction.create({
        data: {
            type: input.type,
            amount: input.amount,
            transactionDate: input.transactionDate,
            note: input.note,
            createdById: input.createdById,
        },
    });
}
async function createSale(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.POS_USE);
    if (input.items.length === 0) {
        throw new shared_1.ValidationError("A sale must contain at least one item.");
    }
    if (input.paymentMethod === "CREDIT" &&
        !input.customerId) {
        throw new shared_1.ValidationError("A customer must be selected for credit sales.");
    }
    return database_1.prisma.$transaction(async (tx) => {
        const customerId = await resolveCustomerId(tx, input);
        const saleId = generateUuid();
        const saleNumber = await (0, invoiceNumberService_1.nextInvoiceNumber)(tx, shared_1.INVOICE_PREFIXES.SALE);
        let subtotal = new database_1.Prisma.Decimal(0);
        let cogsAmount = new database_1.Prisma.Decimal(0);
        const itemRecords = [];
        for (const item of input.items) {
            if (item.quantity <= 0) {
                throw new shared_1.ValidationError("Item quantity must be greater than zero.");
            }
            const lineSubtotal = new database_1.Prisma.Decimal(item.unitPrice)
                .mul(item.quantity)
                .sub(item.discount ?? 0);
            subtotal =
                subtotal.add(lineSubtotal);
            const consumptions = await (0, inventoryService_1.consumeFifo)(tx, {
                productId: item.productId,
                quantity: item.quantity,
                userId: session.userId,
                referenceType: "SALE",
                referenceId: saleId,
            });
            const cogsTotal = consumptions.reduce((sum, c) => sum.add(c.quantityConsumed.mul(c.unitCost)), new database_1.Prisma.Decimal(0));
            cogsAmount =
                cogsAmount.add(cogsTotal);
            itemRecords.push({
                data: {
                    saleId: "",
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount ?? 0,
                    subtotal: lineSubtotal,
                    cogsTotal,
                },
                consumptions,
            });
        }
        const overallDiscount = new database_1.Prisma.Decimal(input.overallDiscount ?? 0);
        const totalAmount = subtotal.sub(overallDiscount);
        let paymentStatus;
        let paidAmount = new database_1.Prisma.Decimal(0);
        if (input.paymentMethod === "COD") {
            paymentStatus =
                "COD_PENDING";
        }
        else if (input.paymentMethod === "CREDIT") {
            paidAmount =
                new database_1.Prisma.Decimal(input.paidAmount ?? 0);
            const due = totalAmount.sub(paidAmount);
            paymentStatus =
                due.lte(0)
                    ? "PAID"
                    : paidAmount.gt(0)
                        ? "PARTIAL"
                        : "DUE";
        }
        else {
            paidAmount =
                totalAmount;
            paymentStatus =
                "PAID";
        }
        const sale = await tx.sale.create({
            data: {
                id: saleId,
                saleNumber,
                customerId,
                subtotal,
                discount: overallDiscount,
                totalAmount,
                cogsAmount,
                paymentMethod: input.paymentMethod,
                paymentStatus,
                onlineOrderNumber: input.onlineOrderNumber,
                createdById: session.userId,
            },
        });
        for (const record of itemRecords) {
            const saleItem = await tx.saleItem.create({
                data: {
                    ...record.data,
                    saleId: sale.id,
                },
            });
            for (const consumption of record.consumptions) {
                await tx.saleItemBatchConsumption.create({
                    data: {
                        saleItemId: saleItem.id,
                        batchId: consumption.batchId,
                        quantityConsumed: consumption.quantityConsumed,
                        unitCost: consumption.unitCost,
                    },
                });
            }
        }
        if (input.paymentMethod ===
            "CREDIT" &&
            paidAmount.gt(0) &&
            customerId) {
            await tx.customerPayment.create({
                data: {
                    customerId,
                    saleId: sale.id,
                    amount: paidAmount,
                    method: "CASH",
                    createdById: session.userId,
                },
            });
            await createCashTransactionOnce(tx, {
                type: "MANUAL_IN",
                amount: paidAmount,
                transactionDate: sale.saleDate,
                note: `Credit payment - ${sale.saleNumber}`,
                createdById: session.userId,
            });
        }
        if (input.paymentMethod ===
            "CASH" &&
            totalAmount.gt(0)) {
            await createCashTransactionOnce(tx, {
                type: "MANUAL_IN",
                amount: totalAmount,
                transactionDate: sale.saleDate,
                note: `Cash sale - ${sale.saleNumber}`,
                createdById: session.userId,
            });
        }
        if (input.paymentMethod ===
            "BKASH" &&
            totalAmount.gt(0)) {
            await (0, bkashService_1.recordBkashSaleInflow)(tx, session, Number(totalAmount), sale.saleNumber);
        }
        await (0, auditService_1.recordAuditLog)(session, {
            action: "CREATE",
            module: "SALE",
            recordId: sale.id,
            newValue: {
                saleNumber,
                totalAmount,
                cogsAmount,
            },
        }, tx);
        return sale;
    });
}
// ============================================================
// COD COLLECTION
// ============================================================
async function markCodCollected(session, saleId, input = {}) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.COD_COLLECT);
    return database_1.prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
            where: {
                id: saleId,
            },
        });
        if (!sale) {
            throw new shared_1.NotFoundError("Sale not found.");
        }
        if (sale.paymentMethod !==
            "COD" ||
            sale.paymentStatus !==
                "COD_PENDING") {
            throw new shared_1.ValidationError("This sale is not a pending COD order.");
        }
        const collectionDate = new Date();
        const updated = await tx.sale.update({
            where: {
                id: saleId,
            },
            data: {
                paymentStatus: "PAID",
                codCollectedAt: collectionDate,
                codCollectedById: session.userId,
            },
        });
        if (sale.customerId) {
            const existingPayment = await tx.customerPayment.findFirst({
                where: {
                    saleId,
                    method: "COD",
                },
            });
            if (!existingPayment) {
                await tx.customerPayment.create({
                    data: {
                        customerId: sale.customerId,
                        saleId,
                        amount: sale.totalAmount,
                        method: "COD",
                        reference: input.reference,
                        createdById: session.userId,
                    },
                });
            }
        }
        await createCashTransactionOnce(tx, {
            type: "MANUAL_IN",
            amount: sale.totalAmount,
            transactionDate: collectionDate,
            note: `COD collection - ${sale.saleNumber}`,
            createdById: session.userId,
        });
        await (0, auditService_1.recordAuditLog)(session, {
            action: "COD_COLLECTED",
            module: "SALE",
            recordId: saleId,
        }, tx);
        return updated;
    });
}
// ============================================================
// CREDIT PAYMENT COLLECTION
// ============================================================
async function collectCreditPayment(session, saleId) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.POS_USE);
    return database_1.prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
            where: {
                id: saleId,
            },
        });
        if (!sale) {
            throw new shared_1.NotFoundError("Sale not found.");
        }
        if (sale.status === "VOID") {
            throw new shared_1.ValidationError("This sale has been voided and cannot receive payment.");
        }
        if (sale.paymentMethod !==
            "CREDIT") {
            throw new shared_1.ValidationError("This sale is not a credit sale.");
        }
        if (!sale.customerId) {
            throw new shared_1.ValidationError("This credit sale has no customer.");
        }
        const paymentTotals = await tx.customerPayment.aggregate({
            where: {
                saleId: sale.id,
            },
            _sum: {
                amount: true,
            },
        });
        const alreadyPaid = new database_1.Prisma.Decimal(paymentTotals
            ._sum.amount ?? 0);
        const outstanding = new database_1.Prisma.Decimal(sale.totalAmount).sub(alreadyPaid);
        if (outstanding.lte(0)) {
            throw new shared_1.ValidationError("This credit sale has already been fully paid.");
        }
        const payment = await tx.customerPayment.create({
            data: {
                customerId: sale.customerId,
                saleId: sale.id,
                amount: outstanding,
                method: "CASH",
                createdById: session.userId,
            },
        });
        await createCashTransactionOnce(tx, {
            type: "MANUAL_IN",
            amount: outstanding,
            transactionDate: payment.createdAt,
            note: `Credit payment - ${sale.saleNumber}`,
            createdById: session.userId,
        });
        const updated = await tx.sale.update({
            where: {
                id: sale.id,
            },
            data: {
                paymentStatus: "PAID",
            },
        });
        await (0, auditService_1.recordAuditLog)(session, {
            action: "CREDIT_PAYMENT_COLLECTED",
            module: "SALE",
            recordId: sale.id,
            newValue: {
                amount: outstanding,
                saleNumber: sale.saleNumber,
            },
        }, tx);
        return updated;
    });
}
// ============================================================
// CASH MANAGEMENT RECONCILIATION
// ============================================================
async function reconcileCashTransactions(session, from, to) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.EXPENSES_MANAGE);
    const sales = await database_1.prisma.sale.findMany({
        where: {
            status: "COMPLETED",
            ...(from || to
                ? {
                    saleDate: {
                        ...(from
                            ? { gte: from }
                            : {}),
                        ...(to
                            ? { lte: to }
                            : {}),
                    },
                }
                : {}),
        },
        orderBy: {
            saleDate: "asc",
        },
    });
    if (sales.length === 0) {
        return {
            checked: 0,
            created: 0,
        };
    }
    const saleIds = sales.map((sale) => sale.id);
    const customerPayments = await database_1.prisma.customerPayment.findMany({
        where: {
            saleId: {
                in: saleIds,
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    const paymentsBySale = new Map();
    for (const payment of customerPayments) {
        if (!payment.saleId) {
            continue;
        }
        const existing = paymentsBySale.get(payment.saleId) ?? [];
        existing.push(payment);
        paymentsBySale.set(payment.saleId, existing);
    }
    let created = 0;
    for (const sale of sales) {
        if (sale.paymentMethod === "CASH" &&
            sale.paymentStatus === "PAID" &&
            sale.totalAmount.gt(0)) {
            const note = `Cash sale - ${sale.saleNumber}`;
            const existing = await database_1.prisma.cashTransaction.findFirst({
                where: {
                    type: "MANUAL_IN",
                    amount: sale.totalAmount,
                    note,
                },
            });
            if (!existing) {
                await database_1.prisma.cashTransaction.create({
                    data: {
                        type: "MANUAL_IN",
                        amount: sale.totalAmount,
                        transactionDate: sale.saleDate,
                        note,
                        createdById: sale.createdById ??
                            session.userId,
                    },
                });
                created++;
            }
        }
        if (sale.paymentMethod === "COD" &&
            sale.paymentStatus === "PAID" &&
            sale.totalAmount.gt(0)) {
            const note = `COD collection - ${sale.saleNumber}`;
            const existing = await database_1.prisma.cashTransaction.findFirst({
                where: {
                    type: "MANUAL_IN",
                    amount: sale.totalAmount,
                    note,
                },
            });
            if (!existing) {
                await database_1.prisma.cashTransaction.create({
                    data: {
                        type: "MANUAL_IN",
                        amount: sale.totalAmount,
                        transactionDate: sale.codCollectedAt ??
                            sale.saleDate,
                        note,
                        createdById: sale.codCollectedById ??
                            sale.createdById ??
                            session.userId,
                    },
                });
                created++;
            }
        }
        if (sale.paymentMethod === "CREDIT") {
            const payments = paymentsBySale.get(sale.id) ?? [];
            for (const payment of payments) {
                if (payment.amount.lte(0)) {
                    continue;
                }
                if (payment.method !== "CASH" &&
                    payment.method !== "COD") {
                    continue;
                }
                const note = payment.method === "COD"
                    ? `COD collection - ${sale.saleNumber}`
                    : `Credit payment - ${sale.saleNumber}`;
                const existing = await database_1.prisma.cashTransaction.findFirst({
                    where: {
                        type: "MANUAL_IN",
                        amount: payment.amount,
                        note,
                        transactionDate: payment.createdAt,
                    },
                });
                if (!existing) {
                    await database_1.prisma.cashTransaction.create({
                        data: {
                            type: "MANUAL_IN",
                            amount: payment.amount,
                            transactionDate: payment.createdAt,
                            note,
                            createdById: payment.createdById ??
                                sale.createdById ??
                                session.userId,
                        },
                    });
                    created++;
                }
            }
        }
    }
    return {
        checked: sales.length,
        created,
    };
}
// ============================================================
// VOID SALE
// ============================================================
async function voidSale(session, saleId, reason) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.SALES_VOID);
    return database_1.prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({
            where: {
                id: saleId,
            },
            include: {
                items: {
                    include: {
                        batchConsumptions: true,
                    },
                },
            },
        });
        if (!sale) {
            throw new shared_1.NotFoundError("Sale not found.");
        }
        if (sale.status === "VOID") {
            throw new shared_1.ValidationError("This sale is already voided.");
        }
        for (const item of sale.items) {
            for (const consumption of item.batchConsumptions) {
                const batch = await tx.productBatch.findUniqueOrThrow({
                    where: {
                        id: consumption.batchId,
                    },
                });
                const newRemaining = new database_1.Prisma.Decimal(batch.remainingQuantity).add(consumption.quantityConsumed);
                await tx.productBatch.update({
                    where: {
                        id: consumption.batchId,
                    },
                    data: {
                        remainingQuantity: newRemaining,
                        status: "ACTIVE",
                    },
                });
                await (0, inventoryService_1.recordStockMovement)(tx, {
                    productId: item.productId,
                    batchId: consumption.batchId,
                    movementType: "ADJUSTMENT",
                    quantity: consumption.quantityConsumed,
                    referenceType: "SALE_VOID",
                    referenceId: saleId,
                    userId: session.userId,
                    notes: `Sale ${sale.saleNumber} voided: ${reason}`,
                });
            }
        }
        const updated = await tx.sale.update({
            where: {
                id: saleId,
            },
            data: {
                status: "VOID",
                voidReason: reason,
            },
        });
        await (0, auditService_1.recordAuditLog)(session, {
            action: "VOID",
            module: "SALE",
            recordId: saleId,
            newValue: {
                reason,
            },
        }, tx);
        return updated;
    });
}
// ============================================================
// GET SALE
// ============================================================
async function getSaleWithDetails(lookup) {
    const key = (lookup ?? "").trim();
    if (!key) {
        throw new shared_1.NotFoundError("Sale not found.");
    }
    const orderRef = key.replace(/^#+/, "");
    const phone = normalizePhone(key);
    const sale = await database_1.prisma.sale.findFirst({
        where: {
            OR: [
                {
                    id: key,
                },
                {
                    saleNumber: key,
                },
                {
                    onlineOrderNumber: key,
                },
                {
                    onlineOrderNumber: `#${orderRef}`,
                },
                {
                    onlineOrderNumber: orderRef,
                },
                ...(phone
                    ? [
                        {
                            customer: {
                                phone,
                            },
                        },
                    ]
                    : []),
            ],
        },
        include: {
            customer: true,
            items: {
                include: {
                    product: true,
                },
            },
            createdBy: true,
        },
        orderBy: {
            saleDate: "desc",
        },
    });
    if (!sale) {
        throw new shared_1.NotFoundError("Sale not found.");
    }
    return sale;
}
// ============================================================
// LIST SALES
// ============================================================
async function listSales(filters = {}) {
    return database_1.prisma.sale.findMany({
        where: {
            ...(filters.from ||
                filters.to
                ? {
                    saleDate: {
                        gte: filters.from,
                        lte: filters.to,
                    },
                }
                : {}),
            ...(filters.paymentStatus
                ? {
                    paymentStatus: filters.paymentStatus,
                }
                : {}),
        },
        include: {
            customer: true,
        },
        orderBy: {
            saleDate: "desc",
        },
        take: 100,
    });
}
