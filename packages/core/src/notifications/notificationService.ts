import { prisma } from "@torki-bazar/database";
import { getLowStockProducts } from "../catalog/productService";
import { getExpiringBatches } from "../inventory/inventoryService";

// Regenerates the notification feed from current business state. Safe to
// call frequently (e.g. on dashboard load) — skips duplicates for the same
// unread entity.
export async function refreshNotifications() {
  const [lowStock, expiring] = await Promise.all([getLowStockProducts(), getExpiringBatches()]);

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
    if (batch.severity === "NORMAL") continue;
    await upsertNotification({
      type: batch.severity === "EXPIRED" ? "EXPIRED" : "EXPIRING",
      title: batch.severity === "EXPIRED" ? "Product expired" : "Product expiring soon",
      message: `${batch.product.name} — batch ${batch.batchCode}, ${batch.remainingQuantity.toString()} unit(s), ${
        batch.daysRemaining
      } day(s) remaining.`,
      severity: batch.severity === "EXPIRED" ? "CRITICAL" : batch.severity === "CRITICAL" ? "URGENT" : "WARNING",
      relatedEntityType: "BATCH",
      relatedEntityId: batch.id,
    });
  }

  const codPending = await prisma.sale.findMany({
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

async function upsertNotification(input: {
  type: "LOW_STOCK" | "EXPIRING" | "EXPIRED" | "COD_PENDING" | "SUPPLIER_DUE" | "CUSTOMER_DUE" | "GENERAL";
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "URGENT" | "CRITICAL";
  relatedEntityType: string;
  relatedEntityId: string;
}) {
  const existing = await prisma.notification.findFirst({
    where: {
      type: input.type,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
      isRead: false,
    },
  });
  if (existing) {
    await prisma.notification.update({ where: { id: existing.id }, data: { message: input.message } });
  } else {
    await prisma.notification.create({ data: input });
  }
}

export async function listNotifications(onlyUnread = false) {
  return prisma.notification.findMany({
    where: onlyUnread ? { isRead: false } : {},
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}
