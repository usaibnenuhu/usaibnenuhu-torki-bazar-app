"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshNotifications = refreshNotifications;
exports.listNotifications = listNotifications;
exports.markNotificationRead = markNotificationRead;
const database_1 = require("@torki-bazar/database");
const productService_1 = require("../catalog/productService");
const inventoryService_1 = require("../inventory/inventoryService");
// Regenerates the notification feed from current business state. Safe to
// call frequently (e.g. on dashboard load) — skips duplicates for the same
// unread entity.
async function refreshNotifications() {
    const [lowStock, expiring] = await Promise.all([(0, productService_1.getLowStockProducts)(), (0, inventoryService_1.getExpiringBatches)()]);
    for (const product of lowStock) {
        await upsertNotification({
            type: "LOW_STOCK",
            title: "Low stock",
            message: `${product.name}${product.sku ? ` (SKU ${product.sku})` : ""} is at or below its minimum stock level.`,
            severity: "WARNING",
            relatedEntityType: "PRODUCT",
            relatedEntityId: product.id,
        });
    }
    for (const batch of expiring) {
        if (batch.severity === "NORMAL")
            continue;
        await upsertNotification({
            type: batch.severity === "EXPIRED" ? "EXPIRED" : "EXPIRING",
            title: batch.severity === "EXPIRED" ? "Product expired" : "Product expiring soon",
            message: `${batch.product.name} — batch ${batch.batchCode}, ${batch.remainingQuantity.toString()} unit(s), ${batch.daysRemaining} day(s) remaining.`,
            severity: batch.severity === "EXPIRED" ? "CRITICAL" : batch.severity === "CRITICAL" ? "URGENT" : "WARNING",
            relatedEntityType: "BATCH",
            relatedEntityId: batch.id,
        });
    }
    const codPending = await database_1.prisma.sale.findMany({
        where: { paymentMethod: "COD", paymentStatus: "COD_PENDING", status: "COMPLETED" },
    });
    for (const sale of codPending) {
        await upsertNotification({
            type: "COD_PENDING",
            title: "COD pending collection",
            message: `Order ${sale.saleNumber} — ৳${sale.totalAmount.toString()} awaiting cash collection.`,
            severity: "INFO",
            relatedEntityType: "SALE",
            relatedEntityId: sale.id,
        });
    }
}
async function upsertNotification(input) {
    const existing = await database_1.prisma.notification.findFirst({
        where: {
            type: input.type,
            relatedEntityType: input.relatedEntityType,
            relatedEntityId: input.relatedEntityId,
            isRead: false,
        },
    });
    if (existing) {
        await database_1.prisma.notification.update({ where: { id: existing.id }, data: { message: input.message } });
    }
    else {
        await database_1.prisma.notification.create({ data: input });
    }
}
async function listNotifications(onlyUnread = false) {
    return database_1.prisma.notification.findMany({
        where: onlyUnread ? { isRead: false } : {},
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 100,
    });
}
async function markNotificationRead(id) {
    return database_1.prisma.notification.update({ where: { id }, data: { isRead: true } });
}
