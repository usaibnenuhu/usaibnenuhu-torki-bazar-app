"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.archiveProduct = archiveProduct;
exports.deleteProduct = deleteProduct;
exports.searchProducts = searchProducts;
exports.findProductByBarcodeOrSku = findProductByBarcodeOrSku;
exports.getLowStockProducts = getLowStockProducts;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
const inventoryService_1 = require("../inventory/inventoryService");
const DISCRETE_UNIT_NAMES = [
    "piece",
    "pieces",
    "pc",
    "pcs",
    "pack",
    "packet",
    "box",
    "carton",
    "dozen",
    "bottle",
    "can",
    "bag",
];
async function assertValidPackSize(unitId, packSize) {
    if (packSize === null || packSize === undefined) {
        return;
    }
    if (!Number.isFinite(packSize) || packSize <= 0) {
        throw new shared_1.ValidationError("Pack size must be a number greater than zero.");
    }
    const unit = await database_1.prisma.unit.findUnique({
        where: { id: unitId },
    });
    if (!unit) {
        throw new shared_1.NotFoundError("Unit not found.");
    }
    const isDiscrete = DISCRETE_UNIT_NAMES.includes(unit.name.trim().toLowerCase());
    if (isDiscrete && !Number.isInteger(packSize)) {
        throw new shared_1.ValidationError(`Pack size for "${unit.name}" must be a whole number.`);
    }
}
function normalizeExpiry(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null || value === "") {
        return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new shared_1.ValidationError("Expiry date is not a valid date.");
    }
    return date;
}
function normalizeSku(sku) {
    if (sku === undefined) {
        return undefined;
    }
    const trimmed = (sku ?? "").trim();
    return trimmed === "" ? null : trimmed;
}
async function assertUniqueSkuBarcode(sku, barcode, excludeId) {
    if (sku) {
        const existingSku = await database_1.prisma.product.findFirst({
            where: {
                sku,
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
        });
        if (existingSku) {
            throw new shared_1.DuplicateError(`SKU "${sku}" is already used by another product.`);
        }
    }
    if (barcode) {
        const existingBarcode = await database_1.prisma.product.findFirst({
            where: {
                barcode,
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
        });
        if (existingBarcode) {
            throw new shared_1.DuplicateError(`Barcode "${barcode}" is already used by another product.`);
        }
    }
}
async function createProduct(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.PRODUCTS_MANAGE);
    const sku = normalizeSku(input.sku) ?? null;
    const barcode = input.barcode?.trim() || null;
    await assertUniqueSkuBarcode(sku, barcode);
    await assertValidPackSize(input.unitId, input.packSize);
    const openingStock = input.openingStock ?? 0;
    if (!Number.isFinite(openingStock) || openingStock < 0) {
        throw new shared_1.ValidationError("Opening stock cannot be negative.");
    }
    const purchasePrice = input.purchasePrice ?? 0;
    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
        throw new shared_1.ValidationError("Purchase price cannot be negative.");
    }
    /*
     * SELLING PRICE IS ALWAYS MANUAL.
     *
     * There is NO automatic 15% profit calculation.
     *
     * Example:
     * purchasePrice = 100
     * sellingPrice  = 107
     *
     * The selling price remains 107.
     */
    const sellingPrice = input.sellingPrice ?? 0;
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
        throw new shared_1.ValidationError("Selling price cannot be negative.");
    }
    const wholesalePrice = input.wholesalePrice ?? 0;
    if (!Number.isFinite(wholesalePrice) || wholesalePrice < 0) {
        throw new shared_1.ValidationError("Wholesale price cannot be negative.");
    }
    const minimumStock = input.minimumStock ?? 0;
    if (!Number.isFinite(minimumStock) || minimumStock < 0) {
        throw new shared_1.ValidationError("Minimum stock cannot be negative.");
    }
    const normalizedExpiry = normalizeExpiry(input.expiryDate);
    const product = await database_1.prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
            data: {
                name: input.name,
                categoryId: input.categoryId,
                subcategoryId: input.subcategoryId,
                brandId: input.brandId,
                sku,
                barcode,
                unitId: input.unitId,
                packSize: input.packSize ?? null,
                expiryDate: normalizedExpiry ?? null,
                purchasePrice,
                sellingPrice,
                wholesalePrice,
                minimumStock,
                description: input.description,
                imageUrl: input.imageUrl,
                defaultSupplierId: input.defaultSupplierId,
                currentStock: 0,
            },
        });
        if (openingStock > 0) {
            const batch = await tx.productBatch.create({
                data: {
                    productId: created.id,
                    batchCode: "OPENING",
                    quantityReceived: openingStock,
                    remainingQuantity: openingStock,
                    purchasePrice,
                    /*
                     * IMPORTANT:
                     * ProductBatch selling price is the same manually
                     * entered selling price used for the opening stock.
                     *
                     * There is NO automatic 15% calculation.
                     */
                    sellingPrice,
                    expiryDate: normalizedExpiry ?? null,
                    status: "ACTIVE",
                },
            });
            await (0, inventoryService_1.recordStockMovement)(tx, {
                productId: created.id,
                batchId: batch.id,
                movementType: "ADJUSTMENT",
                quantity: openingStock,
                referenceType: "OPENING_STOCK",
                referenceId: created.id,
                userId: session.userId,
                notes: "Opening stock entered on product creation.",
            });
        }
        return tx.product.findUniqueOrThrow({
            where: { id: created.id },
        });
    });
    await (0, auditService_1.recordAuditLog)(session, {
        action: "CREATE",
        module: "PRODUCT",
        recordId: product.id,
        newValue: product,
    });
    return product;
}
async function updateProduct(session, id, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.PRODUCTS_MANAGE);
    const before = await database_1.prisma.product.findUnique({
        where: { id },
    });
    if (!before) {
        throw new shared_1.NotFoundError("Product not found.");
    }
    const sku = normalizeSku(input.sku);
    if (sku !== undefined || input.barcode !== undefined) {
        await assertUniqueSkuBarcode(sku !== undefined ? sku : before.sku, input.barcode !== undefined
            ? input.barcode?.trim() || null
            : before.barcode, id);
    }
    if (input.packSize !== undefined) {
        await assertValidPackSize(input.unitId ?? before.unitId, input.packSize);
    }
    if (input.purchasePrice !== undefined &&
        (!Number.isFinite(input.purchasePrice) ||
            input.purchasePrice < 0)) {
        throw new shared_1.ValidationError("Purchase price cannot be negative.");
    }
    if (input.sellingPrice !== undefined &&
        (!Number.isFinite(input.sellingPrice) ||
            input.sellingPrice < 0)) {
        throw new shared_1.ValidationError("Selling price cannot be negative.");
    }
    if (input.wholesalePrice !== undefined &&
        (!Number.isFinite(input.wholesalePrice) ||
            input.wholesalePrice < 0)) {
        throw new shared_1.ValidationError("Wholesale price cannot be negative.");
    }
    if (input.minimumStock !== undefined &&
        (!Number.isFinite(input.minimumStock) ||
            input.minimumStock < 0)) {
        throw new shared_1.ValidationError("Minimum stock cannot be negative.");
    }
    /*
     * openingStock is NOT a Product database field.
     * It is only used when creating the product.
     *
     * Therefore we remove it before calling product.update().
     */
    const { openingStock: _openingStock, expiryDate, sku: _sku, barcode, ...rest } = input;
    const product = await database_1.prisma.product.update({
        where: { id },
        data: {
            ...rest,
            ...(sku !== undefined
                ? {
                    sku,
                }
                : {}),
            ...(barcode !== undefined
                ? {
                    barcode: barcode.trim() === ""
                        ? null
                        : barcode.trim(),
                }
                : {}),
            ...(expiryDate !== undefined
                ? {
                    expiryDate: normalizeExpiry(expiryDate),
                }
                : {}),
        },
    });
    await (0, auditService_1.recordAuditLog)(session, {
        action: "UPDATE",
        module: "PRODUCT",
        recordId: id,
        previousValue: before,
        newValue: product,
    });
    return product;
}
async function archiveProduct(session, id, isArchived = true) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.PRODUCTS_ARCHIVE);
    const product = await database_1.prisma.product.update({
        where: { id },
        data: {
            status: isArchived ? "ARCHIVED" : "ACTIVE",
        },
    });
    await (0, auditService_1.recordAuditLog)(session, {
        action: isArchived ? "ARCHIVE" : "UNARCHIVE",
        module: "PRODUCT",
        recordId: id,
    });
    return product;
}
async function deleteProduct(session, id) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.PRODUCTS_MANAGE);
    const product = await database_1.prisma.product.findUnique({
        where: { id },
        include: {
            saleItems: true,
            purchaseItems: true,
        },
    });
    if (!product) {
        throw new shared_1.NotFoundError("Product not found.");
    }
    if (product.saleItems.length > 0 ||
        product.purchaseItems.length > 0) {
        throw new shared_1.ValidationError("Cannot delete product with existing sales or purchases. Archive it instead.");
    }
    await database_1.prisma.$transaction(async (tx) => {
        await tx.productBatch.deleteMany({
            where: { productId: id },
        });
        await tx.product.delete({
            where: { id },
        });
    });
    await (0, auditService_1.recordAuditLog)(session, {
        action: "DELETE",
        module: "PRODUCT",
        recordId: id,
        previousValue: product,
    });
}
async function searchProducts(options = {}) {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 50;
    const where = {
        ...(options.categoryId
            ? { categoryId: options.categoryId }
            : {}),
        ...(options.brandId
            ? { brandId: options.brandId }
            : {}),
        status: options.status ?? "ACTIVE",
        ...(options.search
            ? {
                OR: [
                    {
                        name: {
                            contains: options.search,
                        },
                    },
                    {
                        sku: {
                            contains: options.search,
                        },
                    },
                    {
                        barcode: {
                            contains: options.search,
                        },
                    },
                ],
            }
            : {}),
    };
    const [items, total] = await Promise.all([
        database_1.prisma.product.findMany({
            where,
            include: {
                category: true,
                subcategory: true,
                brand: true,
                unit: true,
            },
            orderBy: {
                name: "asc",
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        database_1.prisma.product.count({
            where,
        }),
    ]);
    return {
        items,
        total,
        page,
        pageSize,
    };
}
async function findProductByBarcodeOrSku(code) {
    const trimmed = (code ?? "").trim();
    if (!trimmed) {
        throw new shared_1.ValidationError("Enter a barcode or SKU to search.");
    }
    const product = await database_1.prisma.product.findFirst({
        where: {
            OR: [
                {
                    barcode: trimmed,
                },
                {
                    sku: trimmed,
                },
            ],
            status: "ACTIVE",
        },
        include: {
            unit: true,
            batches: {
                where: {
                    status: "ACTIVE",
                    remainingQuantity: {
                        gt: 0,
                    },
                },
                /*
                 * Oldest active batch first.
                 *
                 * This matches FIFO inventory consumption and ensures
                 * the POS uses the selling price of the batch that will
                 * normally be consumed first.
                 */
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });
    if (!product) {
        throw new shared_1.NotFoundError(`No active product found for code "${trimmed}".`);
    }
    /*
     * ============================================================
     * POS SELLING PRICE
     * ============================================================
     *
     * The POS MUST use the selling price stored on the active batch.
     *
     * Example:
     *
     * Product:
     *   purchasePrice = 100
     *   sellingPrice  = 110
     *
     * Batch:
     *   purchasePrice = 102
     *   sellingPrice  = 115
     *
     * POS:
     *   Unit Price = 115
     *
     * There is NO automatic percentage calculation.
     * There is NO 15% markup.
     *
     * The batch selling price is manually entered during purchase.
     */
    const activeBatch = product.batches[0];
    const sellingPrice = activeBatch
        ? Number(activeBatch.sellingPrice)
        : Number(product.sellingPrice);
    /*
     * Return the product together with the exact batch information
     * being used for the POS price.
     */
    return {
        ...product,
        // This is the value the POS should use as Unit Price.
        sellingPrice,
        // Explicit batch information for the POS/inventory logic.
        activeBatchId: activeBatch?.id ?? null,
        batchSellingPrice: activeBatch
            ? Number(activeBatch.sellingPrice)
            : null,
    };
}
async function getLowStockProducts() {
    const products = await database_1.prisma.product.findMany({
        where: {
            status: "ACTIVE",
        },
    });
    return products.filter((product) => Number(product.currentStock) <=
        Number(product.minimumStock));
}
