"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordStockMovement = recordStockMovement;
exports.receiveBatch = receiveBatch;
exports.consumeFifo = consumeFifo;
exports.adjustStock = adjustStock;
exports.getExpiringBatches = getExpiringBatches;
exports.getExpiredBatches = getExpiredBatches;
exports.listBatches = listBatches;
exports.getBatchDetails = getBatchDetails;
exports.updateBatchDetails = updateBatchDetails;
exports.listInventoryLosses = listInventoryLosses;
exports.writeOffBatch = writeOffBatch;
exports.adjustProductStock = adjustProductStock;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
async function applyProductStockDelta(tx, productId, delta) {
    const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
    });
    const newStock = new database_1.Prisma.Decimal(product.currentStock).add(delta);
    await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
    });
    return {
        previousQuantity: new database_1.Prisma.Decimal(product.currentStock),
        newQuantity: newStock,
    };
}
async function recordStockMovement(tx, params) {
    const affectsSellableStock = params.affectsSellableStock !== false;
    const { previousQuantity, newQuantity } = affectsSellableStock
        ? await applyProductStockDelta(tx, params.productId, params.quantity)
        : await (async () => {
            const product = await tx.product.findUniqueOrThrow({
                where: { id: params.productId },
            });
            const qty = new database_1.Prisma.Decimal(product.currentStock);
            return {
                previousQuantity: qty,
                newQuantity: qty,
            };
        })();
    return tx.stockMovement.create({
        data: {
            productId: params.productId,
            batchId: params.batchId,
            movementType: params.movementType,
            quantity: params.quantity,
            previousQuantity,
            newQuantity,
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            userId: params.userId,
            notes: params.notes,
        },
    });
}
// Receives a new purchase batch and increases inventory.
// Never overwrites existing stock quantities.
async function receiveBatch(tx, params) {
    const batch = await tx.productBatch.create({
        data: {
            productId: params.productId,
            supplierId: params.supplierId,
            batchCode: params.batchCode,
            quantityReceived: params.quantityReceived,
            remainingQuantity: params.quantityReceived,
            purchasePrice: params.purchasePrice,
            // Required by the current Prisma ProductBatch model.
            sellingPrice: 0,
            expiryDate: params.expiryDate,
            purchaseInvoiceNumber: params.purchaseInvoiceNumber,
            status: "ACTIVE",
        },
    });
    await recordStockMovement(tx, {
        productId: params.productId,
        batchId: batch.id,
        movementType: "PURCHASE",
        quantity: params.quantityReceived,
        referenceType: "PURCHASE",
        referenceId: params.referenceId,
        userId: params.userId,
    });
    return batch;
}
// FIFO consumption: oldest eligible batch first.
async function consumeFifo(tx, params) {
    let remaining = new database_1.Prisma.Decimal(params.quantity);
    if (remaining.lte(0)) {
        throw new shared_1.ValidationError("Sale quantity must be greater than zero.");
    }
    const batches = await tx.productBatch.findMany({
        where: {
            productId: params.productId,
            status: "ACTIVE",
            remainingQuantity: { gt: 0 },
        },
        orderBy: [{ purchaseDate: "asc" }, { createdAt: "asc" }],
    });
    const consumptions = [];
    for (const batch of batches) {
        if (remaining.lte(0))
            break;
        const available = new database_1.Prisma.Decimal(batch.remainingQuantity);
        const consumeQty = database_1.Prisma.Decimal.min(available, remaining);
        if (consumeQty.lte(0))
            continue;
        const newRemaining = available.sub(consumeQty);
        await tx.productBatch.update({
            where: { id: batch.id },
            data: {
                remainingQuantity: newRemaining,
                status: newRemaining.lte(0)
                    ? "DEPLETED"
                    : "ACTIVE",
            },
        });
        await recordStockMovement(tx, {
            productId: params.productId,
            batchId: batch.id,
            movementType: "SALE",
            quantity: consumeQty.negated(),
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            userId: params.userId,
        });
        consumptions.push({
            batchId: batch.id,
            quantityConsumed: consumeQty,
            unitCost: new database_1.Prisma.Decimal(batch.purchasePrice),
        });
        remaining = remaining.sub(consumeQty);
    }
    if (remaining.gt(0)) {
        throw new shared_1.InsufficientStockError(`Insufficient stock: ${remaining.toString()} unit(s) short of the requested quantity.`);
    }
    return consumptions;
}
// Manual inventory adjustment.
async function adjustStock(tx, params) {
    if (params.batchId) {
        const batch = await tx.productBatch.findUniqueOrThrow({
            where: { id: params.batchId },
        });
        const newRemaining = new database_1.Prisma.Decimal(batch.remainingQuantity).add(params.quantityDelta);
        if (newRemaining.lt(0)) {
            throw new shared_1.InsufficientStockError("Adjustment would make batch quantity negative.");
        }
        await tx.productBatch.update({
            where: { id: params.batchId },
            data: {
                remainingQuantity: newRemaining,
                status: params.movementType === "EXPIRY"
                    ? "EXPIRED"
                    : params.movementType === "DAMAGE"
                        ? "DAMAGED"
                        : batch.status,
            },
        });
    }
    return recordStockMovement(tx, {
        productId: params.productId,
        batchId: params.batchId,
        movementType: params.movementType,
        quantity: params.quantityDelta,
        referenceType: "MANUAL",
        userId: params.userId,
        notes: params.notes,
    });
}
async function getExpiringBatches(thresholds = [30, 14, 7, 3, 1]) {
    const now = new Date();
    const maxDate = new Date(now.getTime() +
        Math.max(...thresholds) * 86_400_000);
    const batches = await database_1.prisma.productBatch.findMany({
        where: {
            status: "ACTIVE",
            remainingQuantity: { gt: 0 },
            expiryDate: {
                not: null,
                lte: maxDate,
            },
        },
        include: {
            product: true,
            supplier: true,
            purchase: true,
        },
        orderBy: {
            expiryDate: "asc",
        },
    });
    return batches.map((batch) => {
        const daysRemaining = Math.ceil((batch.expiryDate.getTime() - now.getTime()) /
            86_400_000);
        const severity = daysRemaining < 0
            ? "EXPIRED"
            : daysRemaining <= 1
                ? "CRITICAL"
                : daysRemaining <= 3
                    ? "URGENT"
                    : daysRemaining <= 14
                        ? "WARNING"
                        : "NORMAL";
        return {
            ...batch,
            daysRemaining,
            severity,
        };
    });
}
async function getExpiredBatches() {
    return database_1.prisma.productBatch.findMany({
        where: {
            OR: [
                { status: "EXPIRED" },
                { expiryDate: { lt: new Date() } },
            ],
            remainingQuantity: { gt: 0 },
        },
        include: {
            product: true,
            supplier: true,
            purchase: true,
        },
    });
}
function batchExpiryInfo(expiryDate) {
    if (!expiryDate) {
        return {
            daysRemaining: null,
            severity: "NONE",
        };
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfExpiry = new Date(expiryDate);
    startOfExpiry.setHours(0, 0, 0, 0);
    const daysRemaining = Math.round((startOfExpiry.getTime() -
        startOfToday.getTime()) /
        86_400_000);
    const severity = daysRemaining < 0
        ? "EXPIRED"
        : daysRemaining <= 1
            ? "CRITICAL"
            : daysRemaining <= 3
                ? "URGENT"
                : daysRemaining <= 14
                    ? "WARNING"
                    : "NORMAL";
    return {
        daysRemaining,
        severity,
    };
}
// Full batch register backing the Inventory screen.
async function listBatches(filters = {}) {
    const batches = await database_1.prisma.productBatch.findMany({
        where: {
            ...(filters.productId
                ? { productId: filters.productId }
                : {}),
            ...(filters.supplierId
                ? { supplierId: filters.supplierId }
                : {}),
            ...(filters.purchaseId
                ? { purchaseId: filters.purchaseId }
                : {}),
        },
        include: {
            product: {
                include: {
                    unit: true,
                },
            },
            supplier: true,
            purchase: true,
        },
        orderBy: [
            { purchaseDate: "desc" },
            { createdAt: "desc" },
        ],
    });
    return batches.map((batch) => {
        const received = Number(batch.quantityReceived);
        const remaining = Number(batch.remainingQuantity);
        const returned = Number(batch.quantityReturned);
        const { daysRemaining, severity, } = batchExpiryInfo(batch.expiryDate);
        const derivedStatus = batch.status !== "ACTIVE"
            ? batch.status
            : severity === "EXPIRED"
                ? "EXPIRED"
                : remaining <= 0
                    ? "FULLY_SOLD"
                    : "ACTIVE";
        return {
            ...batch,
            quantitySold: received - remaining - returned,
            totalCost: Number(batch.purchasePrice) * received,
            daysRemaining,
            severity,
            derivedStatus,
        };
    });
}
async function getBatchDetails(batchId) {
    const batch = await database_1.prisma.productBatch.findUnique({
        where: { id: batchId },
        include: {
            product: {
                include: {
                    unit: true,
                },
            },
            supplier: true,
            purchase: true,
            supplierReturns: {
                orderBy: {
                    returnDate: "desc",
                },
            },
            stockMovements: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 50,
            },
        },
    });
    if (!batch) {
        throw new shared_1.NotFoundError("Batch not found.");
    }
    const received = Number(batch.quantityReceived);
    const remaining = Number(batch.remainingQuantity);
    const returned = Number(batch.quantityReturned);
    return {
        ...batch,
        quantitySold: received - remaining - returned,
        ...batchExpiryInfo(batch.expiryDate),
    };
}
/**
 * Corrects batch metadata only.
 * Identifiers and quantities remain immutable here.
 */
async function updateBatchDetails(session, batchId, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.INVENTORY_ADJUST);
    const before = await database_1.prisma.productBatch.findUnique({
        where: { id: batchId },
    });
    if (!before) {
        throw new shared_1.NotFoundError("Batch not found.");
    }
    function toDate(value, label) {
        if (value === undefined)
            return undefined;
        if (value === null || value === "") {
            return null;
        }
        const date = value instanceof Date
            ? value
            : new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new shared_1.ValidationError(`${label} is not a valid date.`);
        }
        return date;
    }
    const expiryDate = toDate(input.expiryDate, "Expiry date");
    const manufacturingDate = toDate(input.manufacturingDate, "Manufacturing date");
    if (expiryDate &&
        manufacturingDate &&
        manufacturingDate > expiryDate) {
        throw new shared_1.ValidationError("Manufacturing date cannot be after the expiry date.");
    }
    const updated = await database_1.prisma.productBatch.update({
        where: { id: batchId },
        data: {
            ...(expiryDate !== undefined
                ? { expiryDate }
                : {}),
            ...(manufacturingDate !== undefined
                ? { manufacturingDate }
                : {}),
            ...(input.notes !== undefined
                ? { notes: input.notes }
                : {}),
            ...(expiryDate !== undefined &&
                before.status === "EXPIRED" &&
                expiryDate &&
                expiryDate >= new Date()
                ? { status: "ACTIVE" }
                : {}),
        },
    });
    await (0, auditService_1.recordAuditLog)(session, {
        action: "UPDATE",
        module: "BATCH",
        recordId: batchId,
        previousValue: {
            expiryDate: before.expiryDate,
            manufacturingDate: before.manufacturingDate,
            notes: before.notes,
        },
        newValue: {
            expiryDate: updated.expiryDate,
            manufacturingDate: updated.manufacturingDate,
            notes: updated.notes,
        },
    });
    return {
        ...updated,
        ...batchExpiryInfo(updated.expiryDate),
    };
}
// Value of stock written off as damaged/expired.
async function listInventoryLosses(filters = {}) {
    const movements = await database_1.prisma.stockMovement.findMany({
        where: {
            referenceType: "INVENTORY_LOSS",
            ...(filters.from || filters.to
                ? {
                    createdAt: {
                        gte: filters.from,
                        lte: filters.to,
                    },
                }
                : {}),
        },
        include: {
            product: {
                include: {
                    unit: true,
                },
            },
            batch: {
                include: {
                    supplier: true,
                    purchase: true,
                },
            },
            user: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const items = movements.map((m) => {
        const quantity = new database_1.Prisma.Decimal(m.quantity).abs();
        const unitCost = new database_1.Prisma.Decimal(m.batch?.purchasePrice ?? 0);
        return {
            id: m.id,
            date: m.createdAt,
            reason: m.movementType,
            productName: m.product.name,
            sku: m.product.sku,
            unit: m.product.unit?.abbreviation ?? "",
            batchCode: m.batch?.batchCode ?? null,
            supplierName: m.batch?.supplier?.name ?? null,
            purchaseNumber: m.batch?.purchase?.purchaseNumber ?? null,
            quantity,
            unitCost,
            lossValue: quantity.mul(unitCost),
            notes: m.notes,
            recordedBy: m.user?.fullName ?? null,
        };
    });
    return {
        items,
        totalValue: items.reduce((sum, i) => sum.add(i.lossValue), new database_1.Prisma.Decimal(0)),
        totalQuantity: items.reduce((sum, i) => sum.add(i.quantity), new database_1.Prisma.Decimal(0)),
    };
}
// Writes stock off a specific batch as an inventory loss.
async function writeOffBatch(session, params) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.INVENTORY_ADJUST);
    const quantity = new database_1.Prisma.Decimal(params.quantity ?? 0);
    if (!quantity.isFinite() ||
        quantity.lte(0)) {
        throw new shared_1.ValidationError("Write-off quantity must be greater than zero.");
    }
    const result = await database_1.prisma.$transaction(async (tx) => {
        const batch = await tx.productBatch.findUnique({
            where: {
                id: params.batchId,
            },
        });
        if (!batch) {
            throw new shared_1.NotFoundError("Batch not found.");
        }
        const remaining = new database_1.Prisma.Decimal(batch.remainingQuantity);
        if (quantity.gt(remaining)) {
            throw new shared_1.InsufficientStockError(`Cannot write off ${quantity.toString()} unit(s) — only ${remaining.toString()} remain in this batch.`);
        }
        const newRemaining = remaining.sub(quantity);
        await tx.productBatch.update({
            where: {
                id: batch.id,
            },
            data: {
                remainingQuantity: newRemaining,
                status: newRemaining.lte(0)
                    ? params.reason === "EXPIRED"
                        ? "EXPIRED"
                        : "DAMAGED"
                    : batch.status,
            },
        });
        await recordStockMovement(tx, {
            productId: batch.productId,
            batchId: batch.id,
            movementType: params.reason === "EXPIRED"
                ? "EXPIRY"
                : "DAMAGE",
            quantity: quantity.negated(),
            referenceType: "INVENTORY_LOSS",
            referenceId: batch.id,
            userId: session.userId,
            notes: params.notes?.trim() ||
                `Batch ${batch.batchCode} written off as ${params.reason.toLowerCase()}.`,
        });
        return tx.productBatch.findUniqueOrThrow({
            where: {
                id: batch.id,
            },
        });
    });
    await (0, auditService_1.recordAuditLog)(session, {
        action: "WRITE_OFF",
        module: "INVENTORY",
        recordId: params.batchId,
        newValue: {
            quantity: params.quantity,
            reason: params.reason,
            notes: params.notes ?? null,
        },
    });
    return result;
}
// Manual stock correction from Products screen.
async function adjustProductStock(session, params) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.INVENTORY_ADJUST);
    const quantity = new database_1.Prisma.Decimal(params.quantity);
    if (!quantity.isFinite() ||
        quantity.lte(0)) {
        throw new shared_1.ValidationError("Adjustment quantity must be greater than zero.");
    }
    const notes = params.reason?.trim() ||
        "Manual stock adjustment.";
    const { before, updated } = await database_1.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: {
                id: params.productId,
            },
        });
        if (!product) {
            throw new shared_1.NotFoundError("Product not found.");
        }
        if (params.direction === "ADD") {
            const batch = await tx.productBatch.create({
                data: {
                    productId: product.id,
                    batchCode: "ADJUSTMENT",
                    quantityReceived: quantity,
                    remainingQuantity: quantity,
                    purchasePrice: product.purchasePrice,
                    // Required by the current Prisma ProductBatch model.
                    sellingPrice: product.sellingPrice,
                    expiryDate: product.expiryDate,
                    status: "ACTIVE",
                },
            });
            await recordStockMovement(tx, {
                productId: product.id,
                batchId: batch.id,
                movementType: "ADJUSTMENT",
                quantity,
                referenceType: "MANUAL",
                referenceId: product.id,
                userId: session.userId,
                notes,
            });
        }
        else {
            if (new database_1.Prisma.Decimal(product.currentStock).lt(quantity)) {
                throw new shared_1.InsufficientStockError("Cannot remove more than the current stock.");
            }
            let remaining = quantity;
            const batches = await tx.productBatch.findMany({
                where: {
                    productId: product.id,
                    status: "ACTIVE",
                    remainingQuantity: {
                        gt: 0,
                    },
                },
                orderBy: [
                    {
                        purchaseDate: "asc",
                    },
                    {
                        createdAt: "asc",
                    },
                ],
            });
            for (const batch of batches) {
                if (remaining.lte(0))
                    break;
                const take = database_1.Prisma.Decimal.min(new database_1.Prisma.Decimal(batch.remainingQuantity), remaining);
                const newRemaining = new database_1.Prisma.Decimal(batch.remainingQuantity).sub(take);
                await tx.productBatch.update({
                    where: {
                        id: batch.id,
                    },
                    data: {
                        remainingQuantity: newRemaining,
                        status: newRemaining.lte(0)
                            ? "DEPLETED"
                            : "ACTIVE",
                    },
                });
                await recordStockMovement(tx, {
                    productId: product.id,
                    batchId: batch.id,
                    movementType: "ADJUSTMENT",
                    quantity: take.negated(),
                    referenceType: "MANUAL",
                    referenceId: product.id,
                    userId: session.userId,
                    notes,
                });
                remaining =
                    remaining.sub(take);
            }
            // Stock that predates batch tracking has no batch to draw from.
            if (remaining.gt(0)) {
                await recordStockMovement(tx, {
                    productId: product.id,
                    movementType: "ADJUSTMENT",
                    quantity: remaining.negated(),
                    referenceType: "MANUAL",
                    referenceId: product.id,
                    userId: session.userId,
                    notes,
                });
            }
        }
        const updated = await tx.product.findUniqueOrThrow({
            where: {
                id: product.id,
            },
        });
        return {
            before: product,
            updated,
        };
    });
    // Audit runs outside the transaction.
    await (0, auditService_1.recordAuditLog)(session, {
        action: "ADJUST",
        module: "INVENTORY",
        recordId: updated.id,
        previousValue: {
            currentStock: before.currentStock,
        },
        newValue: {
            currentStock: updated.currentStock,
            direction: params.direction,
            quantity: params.quantity,
            notes,
        },
    });
    return updated;
}
