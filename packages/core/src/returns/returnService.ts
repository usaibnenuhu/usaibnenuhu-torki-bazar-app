import { prisma, Prisma } from "@torki-bazar/database";
import { PERMISSIONS, INVOICE_PREFIXES, ValidationError, NotFoundError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { nextInvoiceNumber } from "../invoicing/invoiceNumberService";
import { recordStockMovement } from "../inventory/inventoryService";
import { recordBkashReturnOutflow } from "../bKash/bkashService";
import { enqueueSync } from "../sync/syncService";

export interface ReturnItemInput {
  saleItemId: string;
  quantity: number;
  condition: "RESELLABLE" | "DAMAGED" | "EXPIRED";
  reason?: string;
}

export interface CreateReturnInput {
  saleId: string;
  items: ReturnItemInput[];
  reason?: string;
}

export async function createReturn(session: AuthSession, input: CreateReturnInput) {
  assertPermission(session, PERMISSIONS.RETURNS_CREATE);
  if (input.items.length === 0) throw new ValidationError("A return must contain at least one item.");

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({ where: { id: input.saleId } });
    if (!sale) throw new NotFoundError("Original sale not found.");

    const returnNumber = await nextInvoiceNumber(tx as unknown as typeof prisma, INVOICE_PREFIXES.RETURN);
    let totalRefund = new Prisma.Decimal(0);

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
        throw new NotFoundError("Sale item not found on this sale.");
      }

      const alreadyReturned = saleItem.returnItems.reduce((sum, r) => sum.add(r.quantity), new Prisma.Decimal(0));
      const maxReturnable = new Prisma.Decimal(saleItem.quantity).sub(alreadyReturned);
      const qty = new Prisma.Decimal(item.quantity);
      if (qty.lte(0) || qty.gt(maxReturnable)) {
        throw new ValidationError(
          `Cannot return ${qty.toString()} unit(s) — only ${maxReturnable.toString()} remain returnable for this item.`
        );
      }

      const unitPrice = new Prisma.Decimal(saleItem.unitPrice);
      const refundAmount = unitPrice.mul(qty);
      totalRefund = totalRefund.add(refundAmount);

      let targetBatchId: string | undefined;

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
              unitCost: new Prisma.Decimal(0),
            }];
          }
        }

        for (const consumption of consumptionsToUse) {
          if (remainingToRestore.lte(0)) break;
          const restoreQty = Prisma.Decimal.min(consumption.quantityConsumed, remainingToRestore);
          if (restoreQty.lte(0)) continue;
          
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
                remainingQuantity: new Prisma.Decimal(batch.remainingQuantity).add(restoreQty),
                status: "ACTIVE",
              },
            });

            await recordStockMovement(tx, {
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
          } else {
            // Absolute fallback if no batch table exists at all for product
            await recordStockMovement(tx, {
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
      } else {
        await recordStockMovement(tx, {
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
        await recordBkashReturnOutflow(
          tx,
          session,
          Number(totalRefund),
          returnNumber
        );
      } else {
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

    await recordAuditLog(
      session,
      { action: "CREATE", module: "RETURN", recordId: returnRecord.id, newValue: { returnNumber, totalRefund } },
      tx
    );

    // ------------------------------------------------------------
    // CUSTOMER RETURN -> ELECTRON -> NEON SYNC
    //
    // Queue the complete return after the return header and all
    // ReturnItems have been created inside the same transaction.
    // ------------------------------------------------------------
    await enqueueSync(
      "RETURN",
      returnRecord.id,
      "CREATE",
      { id: returnRecord.id },
      tx
    );

    return updatedReturn;
  }, {
    maxWait: 10000,
    timeout: 30000,
  });
}

export async function listReturns() {
  return prisma.return.findMany({
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
