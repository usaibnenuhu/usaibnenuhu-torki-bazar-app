import { prisma, Prisma } from "@torki-bazar/database";
import {
  PERMISSIONS,
  INVOICE_PREFIXES,
  ValidationError,
  NotFoundError,
} from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { nextInvoiceNumber } from "../invoicing/invoiceNumberService";
import { recordStockMovement } from "../inventory/inventoryService";
import { recordBkashSaleInflow } from "../bKash/bkashService";

export const SUPPLIER_RETURN_REASONS = [
  "DAMAGED",
  "DEFECTIVE",
  "WRONG_PRODUCT",
  "WRONG_QUANTITY",
  "EXPIRED",
  "NEAR_EXPIRY",
  "SUPPLIER_REQUEST",
  "QUALITY_ISSUE",
  "OTHER",
] as const;

export interface CreateSupplierReturnInput {
  purchaseId: string;
  batchId: string;
  quantity: number;
  reason: string;
  notes?: string;
  returnDate?: Date | string;

  /** Expected supplier credit. Defaults to quantity x original purchase cost. */
  returnValue?: number | null;

  /** CREDIT offsets future purchases; CASH_REFUND is money returned by supplier. */
  settlementType?: "CREDIT" | "CASH_REFUND";

  /** Payment method for cash refund: CASH or BKASH */
  paymentMethod?: string;
}

/**
 * Units that may still be sent back to the supplier from a batch.
 */
export async function getReturnableQuantity(batchId: string) {
  const batch = await prisma.productBatch.findUnique({
    where: { id: batchId },
    include: {
      product: true,
      supplier: true,
      purchase: true,
    },
  });

  if (!batch) {
    throw new NotFoundError("Batch not found.");
  }

  const received = new Prisma.Decimal(batch.quantityReceived);
  const remaining = new Prisma.Decimal(batch.remainingQuantity);
  const returned = new Prisma.Decimal(batch.quantityReturned);

  return {
    batch,
    quantityPurchased: received,
    quantityRemaining: remaining,
    quantityReturned: returned,
    quantitySold: received.sub(remaining).sub(returned),
    maxReturnable: remaining,
  };
}

export async function createSupplierReturn(
  session: AuthSession,
  input: CreateSupplierReturnInput
) {
  assertPermission(session, PERMISSIONS.PURCHASES_CREATE);

  const quantity = new Prisma.Decimal(input.quantity ?? 0);

  if (!quantity.isFinite() || quantity.lte(0)) {
    throw new ValidationError(
      "Return quantity must be greater than zero."
    );
  }

  if (!input.reason?.trim()) {
    throw new ValidationError(
      "A return reason is required."
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: {
        id: input.purchaseId,
      },
    });

    if (!purchase) {
      throw new NotFoundError(
        "Original purchase not found."
      );
    }

    if (purchase.status === "VOID") {
      throw new ValidationError(
        "Cannot return items from a voided purchase."
      );
    }

    const batch = await tx.productBatch.findUnique({
      where: {
        id: input.batchId,
      },
    });

    if (!batch) {
      throw new NotFoundError(
        "Batch not found."
      );
    }

    const purchaseItem = await tx.purchaseItem.findFirst({
      where: {
        purchaseId: purchase.id,
        batchId: batch.id,
      },
    });

    if (!purchaseItem) {
      throw new ValidationError(
        "This batch does not belong to the selected purchase."
      );
    }

    const remaining = new Prisma.Decimal(
      batch.remainingQuantity
    );

    if (quantity.gt(remaining)) {
      throw new ValidationError(
        `Cannot return ${quantity.toString()} unit(s) — only ${remaining.toString()} remain available in this batch.`
      );
    }

    const returnNumber = await nextInvoiceNumber(
      tx as unknown as typeof prisma,
      INVOICE_PREFIXES.SUPPLIER_RETURN,
      {
        withYear: false,
      }
    );

    const unitCost = new Prisma.Decimal(
      purchaseItem.unitCost
    );

    const returnValue =
      input.returnValue === undefined ||
      input.returnValue === null
        ? unitCost.mul(quantity)
        : new Prisma.Decimal(input.returnValue);

    if (!returnValue.isFinite() || returnValue.lt(0)) {
      throw new ValidationError(
        "Supplier credit cannot be negative."
      );
    }

    const settlementType =
      input.settlementType === "CASH_REFUND"
        ? "CASH_REFUND"
        : "CREDIT";

    const paymentMethod = input.paymentMethod ?? "CASH";

    const transactionDate = input.returnDate
      ? new Date(input.returnDate)
      : new Date();

    if (Number.isNaN(transactionDate.getTime())) {
      throw new ValidationError(
        "Invalid return date."
      );
    }

    const newRemaining = remaining.sub(quantity);

    /*
     * ============================================================
     * CREATE SUPPLIER RETURN
     * ============================================================
     */

    const supplierReturn =
      await tx.supplierReturn.create({
        data: {
          returnNumber,
          supplierId: purchase.supplierId,
          purchaseId: purchase.id,
          productId: batch.productId,
          batchId: batch.id,
          quantity,
          unitCost,
          returnValue,
          returnDate: transactionDate,
          reason: input.reason.trim(),
          notes: input.notes?.trim() || null,
          settlementType,
          status: "COMPLETED",
          createdById: session.userId,
        },
      });

    /*
     * ============================================================
     * CASH / BKASH REFUND
     * ============================================================
     */

    if (
      settlementType === "CASH_REFUND" &&
      returnValue.gt(0)
    ) {
      if (paymentMethod.toUpperCase() === "BKASH") {
        await recordBkashSaleInflow(
          tx,
          session,
          Number(returnValue),
          `Supplier cash refund (bKash) - ${returnNumber}`
        );
      } else {
        await tx.cashTransaction.create({
          data: {
            type: "MANUAL_IN",
            amount: returnValue,
            transactionDate,
            note: `Supplier cash refund - ${returnNumber}`,
            createdById: session.userId,
          },
        });
      }
    }

    /*
     * ============================================================
     * UPDATE STOCK
     * ============================================================
     */

    await tx.productBatch.update({
      where: {
        id: batch.id,
      },
      data: {
        remainingQuantity: newRemaining,

        quantityReturned: new Prisma.Decimal(
          batch.quantityReturned
        ).add(quantity),

        status: newRemaining.lte(0)
          ? "FULLY_RETURNED"
          : batch.status,
      },
    });

    /*
     * ============================================================
     * STOCK MOVEMENT
     * ============================================================
     */

    await recordStockMovement(tx, {
      productId: batch.productId,
      batchId: batch.id,
      movementType: "ADJUSTMENT",
      quantity: quantity.negated(),
      referenceType: "SUPPLIER_RETURN",
      referenceId: supplierReturn.id,
      userId: session.userId,
      notes: `Returned to supplier on ${returnNumber}`,
    });

    return supplierReturn;
  });

  /*
   * ============================================================
   * AUDIT LOG
   * ============================================================
   */

  await recordAuditLog(session, {
    action: "CREATE",
    module: "SUPPLIER_RETURN",
    recordId: created.id,
    newValue: created,
  });

  return created;
}

/**
 * Cancelling a supplier return restores the stock.
 *
 * If the original return was CASH_REFUND, the original cash
 * increase is reversed with a MANUAL_OUT transaction.
 */
export async function cancelSupplierReturn(
  session: AuthSession,
  returnId: string,
  reason: string
) {
  assertPermission(
    session,
    PERMISSIONS.PURCHASES_VOID
  );

  if (!reason?.trim()) {
    throw new ValidationError(
      "A cancellation reason is required."
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing =
      await tx.supplierReturn.findUnique({
        where: {
          id: returnId,
        },
      });

    if (!existing) {
      throw new NotFoundError(
        "Supplier return not found."
      );
    }

    if (existing.status === "CANCELLED") {
      throw new ValidationError(
        "This supplier return is already cancelled."
      );
    }

    const batch =
      await tx.productBatch.findUniqueOrThrow({
        where: {
          id: existing.batchId,
        },
      });

    const quantity = new Prisma.Decimal(
      existing.quantity
    );

    /*
     * ============================================================
     * REVERSE CASH / BKASH REFUND
     * ============================================================
     */

    if (
      existing.settlementType === "CASH_REFUND" &&
      new Prisma.Decimal(
        existing.returnValue
      ).gt(0)
    ) {
      // Check if it was recorded in cash or bKash by checking recent transactions or notes
      const cashTx = await tx.cashTransaction.findFirst({
        where: { note: { contains: existing.returnNumber } },
      });

      if (cashTx) {
        await tx.cashTransaction.create({
          data: {
            type: "MANUAL_OUT",
            amount: existing.returnValue,
            transactionDate: new Date(),
            note: `Reverse supplier cash refund - ${existing.returnNumber}`,
            createdById: session.userId,
          },
        });
      } else {
        // If not in cash, record as bKash manual out
        await tx.bkashTransaction.create({
          data: {
            type: "MANUAL_OUT",
            amount: existing.returnValue,
            transactionDate: new Date(),
            note: `Reverse supplier cash refund (bKash) - ${existing.returnNumber}`,
            createdById: session.userId,
          },
        });
      }
    }

    /*
     * ============================================================
     * RESTORE STOCK
     * ============================================================
     */

    await tx.productBatch.update({
      where: {
        id: batch.id,
      },
      data: {
        remainingQuantity: new Prisma.Decimal(
          batch.remainingQuantity
        ).add(quantity),

        quantityReturned: new Prisma.Decimal(
          batch.quantityReturned
        ).sub(quantity),

        status:
          batch.status === "FULLY_RETURNED"
            ? "ACTIVE"
            : batch.status,
      },
    });

    /*
     * ============================================================
     * STOCK MOVEMENT
     * ============================================================
     */

    await recordStockMovement(tx, {
      productId: existing.productId,
      batchId: existing.batchId,
      movementType: "ADJUSTMENT",
      quantity,
      referenceType: "SUPPLIER_RETURN_CANCEL",
      referenceId: existing.id,
      userId: session.userId,
      notes: `Supplier return ${existing.returnNumber} cancelled: ${reason}`,
    });

    /*
     * ============================================================
     * MARK RETURN AS CANCELLED
     * ============================================================
     */

    return tx.supplierReturn.update({
      where: {
        id: returnId,
      },
      data: {
        status: "CANCELLED",
        cancelReason: reason.trim(),
      },
    });
  });

  await recordAuditLog(session, {
    action: "CANCEL",
    module: "SUPPLIER_RETURN",
    recordId: returnId,
    newValue: {
      reason,
    },
  });

  return result;
}

export async function listSupplierReturns(
  filters: {
    supplierId?: string;
    purchaseId?: string;
  } = {}
) {
  return prisma.supplierReturn.findMany({
    where: {
      ...(filters.supplierId
        ? {
            supplierId: filters.supplierId,
          }
        : {}),

      ...(filters.purchaseId
        ? {
            purchaseId: filters.purchaseId,
          }
        : {}),
    },

    include: {
      supplier: true,
      purchase: true,
      product: true,
      batch: true,
    },

    orderBy: {
      returnDate: "desc",
    },
  });
}

// Accepts the internal id or public return number (SR-000001).
export async function getSupplierReturnDetails(
  idOrNumber: string
) {
  const key = (idOrNumber ?? "").trim();

  if (!key) {
    throw new NotFoundError(
      "Supplier return not found."
    );
  }

  const record =
    await prisma.supplierReturn.findFirst({
      where: {
        OR: [
          {
            id: key,
          },
          {
            returnNumber: key,
          },
        ],
      },

      include: {
        supplier: true,
        purchase: true,
        product: true,
        batch: true,
        createdBy: true,
      },
    });

  if (!record) {
    throw new NotFoundError(
      "Supplier return not found."
    );
  }

  const received = new Prisma.Decimal(
    record.batch.quantityReceived
  );

  const remaining = new Prisma.Decimal(
    record.batch.remainingQuantity
  );

  const returned = new Prisma.Decimal(
    record.batch.quantityReturned
  );

  return {
    ...record,

    quantityPurchased: received,

    quantitySold: received
      .sub(remaining)
      .sub(returned),

    quantityReturnedTotal: returned,

    quantityAvailable: remaining,
  };
}
