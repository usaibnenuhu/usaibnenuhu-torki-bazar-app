"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturn = createReturn;
exports.listReturns = listReturns;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
const invoiceNumberService_1 = require("../invoicing/invoiceNumberService");
const inventoryService_1 = require("../inventory/inventoryService");
const bkashService_1 = require("../bKash/bkashService");
async function createReturn(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.RETURNS_CREATE);
    if (input.items.length === 0)
        throw new shared_1.ValidationError("A return must contain at least one item.");
    return database_1.prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findUnique({ where: { id: input.saleId } });
        if (!sale)
            throw new shared_1.NotFoundError("Original sale not found.");
        const returnNumber = await (0, invoiceNumberService_1.nextInvoiceNumber)(tx, shared_1.INVOICE_PREFIXES.RETURN);
        let totalRefund = new database_1.Prisma.Decimal(0);
        const returnRecord = await tx.return.create({
            data: {
                returnNumber,
                saleId: input.saleId,
                customerId: sale.customerId,
                reason: input.reason,
                totalRefund: 0,
                createdById: session.userId,
            },
        });
        for (const item of input.items) {
            const saleItem = await tx.saleItem.findUnique({
                where: { id: item.saleItemId },
                include: { batchConsumptions: true, returnItems: true },
            });
            if (!saleItem || saleItem.saleId !== input.saleId) {
                throw new shared_1.NotFoundError("Sale item not found on this sale.");
            }
            const alreadyReturned = saleItem.returnItems.reduce((sum, r) => sum.add(r.quantity), new database_1.Prisma.Decimal(0));
            const maxReturnable = new database_1.Prisma.Decimal(saleItem.quantity).sub(alreadyReturned);
            const qty = new database_1.Prisma.Decimal(item.quantity);
            if (qty.lte(0) || qty.gt(maxReturnable)) {
                throw new shared_1.ValidationError(`Cannot return ${qty.toString()} unit(s) — only ${maxReturnable.toString()} remain returnable for this item.`);
            }
            const unitPrice = new database_1.Prisma.Decimal(saleItem.unitPrice);
            const refundAmount = unitPrice.mul(qty);
            totalRefund = totalRefund.add(refundAmount);
            let targetBatchId;
            if (item.condition === "RESELLABLE") {
                let remainingToRestore = qty;
                // Fallback: If sale item has no batch consumptions, find any active batch for this product
                let consumptionsToUse = saleItem.batchConsumptions;
                if (consumptionsToUse.length === 0) {
                    const fallbackBatch = await tx.productBatch.findFirst({
                        where: { productId: saleItem.productId },
                        orderBy: { createdAt: "desc" },
                    });
                    if (fallbackBatch) {
                        consumptionsToUse = [{
                                id: "fallback",
                                saleItemId: saleItem.id,
                                batchId: fallbackBatch.id,
                                quantityConsumed: qty,
                                unitCost: new database_1.Prisma.Decimal(0),
                            }];
                    }
                }
                for (const consumption of consumptionsToUse) {
                    if (remainingToRestore.lte(0))
                        break;
                    const restoreQty = database_1.Prisma.Decimal.min(consumption.quantityConsumed, remainingToRestore);
                    if (restoreQty.lte(0))
                        continue;
                    let batch = await tx.productBatch.findUnique({ where: { id: consumption.batchId } });
                    // If specific batch id doesn't exist anymore, get the latest active batch for the product
                    if (!batch) {
                        batch = await tx.productBatch.findFirst({
                            where: { productId: saleItem.productId },
                            orderBy: { createdAt: "desc" },
                        });
                    }
                    if (batch) {
                        await tx.productBatch.update({
                            where: { id: batch.id },
                            data: {
                                remainingQuantity: new database_1.Prisma.Decimal(batch.remainingQuantity).add(restoreQty),
                                status: "ACTIVE",
                            },
                        });
                        await (0, inventoryService_1.recordStockMovement)(tx, {
                            productId: saleItem.productId,
                            batchId: batch.id,
                            movementType: "RETURN_RESELLABLE",
                            quantity: restoreQty,
                            referenceType: "RETURN",
                            referenceId: returnRecord.id,
                            userId: session.userId,
                            affectsSellableStock: true,
                        });
                        targetBatchId = batch.id;
                    }
                    else {
                        // Absolute fallback if no batch table exists at all for product
                        await (0, inventoryService_1.recordStockMovement)(tx, {
                            productId: saleItem.productId,
                            movementType: "RETURN_RESELLABLE",
                            quantity: restoreQty,
                            referenceType: "RETURN",
                            referenceId: returnRecord.id,
                            userId: session.userId,
                            affectsSellableStock: true,
                        });
                    }
                    remainingToRestore = remainingToRestore.sub(restoreQty);
                }
            }
            else {
                await (0, inventoryService_1.recordStockMovement)(tx, {
                    productId: saleItem.productId,
                    movementType: item.condition === "DAMAGED" ? "RETURN_DAMAGED" : "RETURN_EXPIRED",
                    quantity: qty,
                    referenceType: "RETURN",
                    referenceId: returnRecord.id,
                    userId: session.userId,
                    affectsSellableStock: false,
                });
            }
            await tx.returnItem.create({
                data: {
                    returnId: returnRecord.id,
                    saleItemId: item.saleItemId,
                    productId: saleItem.productId,
                    quantity: qty,
                    condition: item.condition,
                    refundAmount,
                    targetBatchId,
                },
            });
        }
        const updatedReturn = await tx.return.update({ where: { id: returnRecord.id }, data: { totalRefund } });
        if (totalRefund.gt(0)) {
            if (sale.paymentMethod === "BKASH") {
                await (0, bkashService_1.recordBkashReturnOutflow)(tx, session, Number(totalRefund), returnNumber);
            }
            else {
                await tx.cashTransaction.create({
                    data: {
                        type: "MANUAL_OUT",
                        amount: totalRefund,
                        transactionDate: new Date(),
                        note: `Customer refund - Return ${returnNumber}`,
                        createdById: session.userId,
                    },
                });
            }
        }
        await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "RETURN", recordId: returnRecord.id, newValue: { returnNumber, totalRefund } }, tx);
        return updatedReturn;
    });
}
async function listReturns() {
    return database_1.prisma.return.findMany({
        include: {
            sale: {
                include: {
                    customer: true,
                },
            },
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            returnDate: "desc",
        },
    });
}
