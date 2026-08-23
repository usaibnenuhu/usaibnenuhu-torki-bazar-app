import { prisma, Prisma } from "@torki-bazar/database";
import { PERMISSIONS, ValidationError, NotFoundError } from "@torki-bazar/shared";
import { INVOICE_PREFIXES } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { nextInvoiceNumber } from "../invoicing/invoiceNumberService";
import { receiveBatch, adjustStock } from "../inventory/inventoryService";
import { getSupplierOutstanding } from "../suppliers/supplierService";
import { recordBkashExpenseOutflow } from "../bKash/bkashService";

export interface PurchaseItemInput {
  productId: string;
  batchCode: string;
  quantity: number;
  unitCost: number;
  sellingPrice?: number;
  expiryDate?: Date | null;
  manufacturingDate?: Date | null;
}

export interface CreatePurchaseInput {
  supplierId: string;
  invoiceNumber?: string;
  purchaseDate?: Date | string;
  items: PurchaseItemInput[];
  paidAmount: number;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Helper to calculate current cash balance from cashTransaction (Single Source of Truth).
 */
async function getCurrentCashBalance(): Promise<number> {
  const transactions = await prisma.cashTransaction.findMany({
    select: { type: true, amount: true, note: true },
  });

  return transactions.reduce((balance, tx) => {
    const amount = Number(tx.amount);

    if (tx.type === "MANUAL_IN") {
      return balance + amount;
    }

    if (tx.type === "MANUAL_OUT") {
      return balance - amount;
    }

    return balance;
  }, 0);
}

/**
 * Helper to calculate current bKash balance from bkashTransaction.
 */
async function getCurrentBkashBalance(): Promise<number> {
  const transactions = await prisma.bkashTransaction.findMany({
    select: { type: true, amount: true },
  });

  return transactions.reduce((balance, tx) => {
    const amount = Number(tx.amount);

    if (tx.type === "MANUAL_IN") {
      return balance + amount;
    }

    if (tx.type === "MANUAL_OUT") {
      return balance - amount;
    }

    return balance;
  }, 0);
}

// Purchases increase inventory and, for credit purchases, create a supplier
// payable. Everything happens inside one transaction.
export async function createPurchase(
  session: AuthSession,
  input: CreatePurchaseInput
) {
  assertPermission(session, PERMISSIONS.PURCHASES_CREATE);

  if (input.items.length === 0) {
    throw new ValidationError(
      "A purchase must contain at least one item."
    );
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: input.supplierId },
  });

  if (!supplier) {
    throw new NotFoundError("Supplier not found.");
  }

  for (const item of input.items) {
    if (!item.productId) {
      throw new ValidationError(
        "Every purchase line must have a product."
      );
    }

    if (!(item.quantity > 0)) {
      throw new ValidationError(
        "Purchase quantity must be greater than zero."
      );
    }

    if (!(item.unitCost >= 0)) {
      throw new ValidationError(
        "Unit cost cannot be negative."
      );
    }

    /*
     * SELLING PRICE
     *
     * Selling price is manually entered on the Purchase page.
     *
     * It is optional because the existing purchase flow allows
     * the field to be empty.
     *
     * When provided, it MUST be saved to ProductBatch.sellingPrice.
     *
     * There is NO automatic 15% calculation here.
     */
    if (
      item.sellingPrice !== undefined &&
      (!Number.isFinite(item.sellingPrice) ||
        item.sellingPrice < 0)
    ) {
      throw new ValidationError(
        "Selling price cannot be negative."
      );
    }
  }

  const totalAmount = input.items.reduce(
    (sum, item) =>
      sum + item.quantity * item.unitCost,
    0
  );

  const paidAmount = Math.min(
    Math.max(input.paidAmount ?? 0, 0),
    totalAmount
  );

  const paymentMethod =
    input.paymentMethod ?? "CASH";

  // If paying with cash, verify that there is enough available cash in the drawer
  if (paidAmount > 0 && paymentMethod === "CASH") {
    const availableCash =
      await getCurrentCashBalance();

    if (paidAmount > availableCash) {
      throw new ValidationError(
        `Insufficient cash balance. Available cash is ৳${availableCash.toFixed(
          2
        )}, but you are trying to pay ৳${paidAmount.toFixed(
          2
        )}. Please add money to Cash Management first.`
      );
    }
  }

  // If paying with bKash, verify that there is enough available bKash balance
  if (
    paidAmount > 0 &&
    paymentMethod.toUpperCase() === "BKASH"
  ) {
    const availableBkash =
      await getCurrentBkashBalance();

    if (paidAmount > availableBkash) {
      throw new ValidationError(
        `Insufficient bKash balance. Available bKash balance is ৳${availableBkash.toFixed(
          2
        )}, but you are trying to pay ৳${paidAmount.toFixed(
          2
        )}. Please reduce the paid amount or add funds to bKash first.`
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    const purchaseNumber =
      await nextInvoiceNumber(
        tx as unknown as typeof prisma,
        INVOICE_PREFIXES.PURCHASE
      );

    const dueAmount =
      totalAmount - paidAmount;

    const paymentStatus =
      dueAmount <= 0
        ? "PAID"
        : paidAmount > 0
        ? "PARTIAL"
        : "DUE";

    const purchaseDate = input.purchaseDate
      ? new Date(input.purchaseDate)
      : new Date();

    if (Number.isNaN(purchaseDate.getTime())) {
      throw new ValidationError(
        "Purchase date is not a valid date."
      );
    }

    const purchase =
      await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierId: input.supplierId,
          invoiceNumber: input.invoiceNumber,
          purchaseDate,
          totalAmount,
          paidAmount,
          dueAmount,
          paymentStatus,
          createdById: session.userId,
        },
      });

    for (const item of input.items) {
      const batch = await receiveBatch(tx, {
        productId: item.productId,
        supplierId: input.supplierId,
        batchCode: item.batchCode,
        quantityReceived: item.quantity,
        purchasePrice: item.unitCost,
        expiryDate: item.expiryDate ?? null,
        purchaseInvoiceNumber:
          input.invoiceNumber,
        userId: session.userId,
        referenceId: purchase.id,
      });

      /*
       * ============================================================
       * SAVE MANUALLY ENTERED SELLING PRICE
       * ============================================================
       *
       * The Purchase page has a Selling Cost field.
       *
       * That value must belong to this specific purchase batch.
       *
       * Example:
       *
       * Purchase Cost: 100
       * Selling Cost: 115
       *
       * ProductBatch:
       *   purchasePrice = 100
       *   sellingPrice  = 115
       *
       * This means the POS can later use 115 as the unit selling
       * price for this batch.
       *
       * IMPORTANT:
       * We do NOT calculate:
       *
       * purchasePrice * 1.15
       *
       * The entered value is used exactly as entered.
       */
      if (item.sellingPrice !== undefined) {
        await tx.productBatch.update({
          where: { id: batch.id },
          data: {
            sellingPrice: item.sellingPrice,
          },
        });
      }

      await tx.productBatch.update({
        where: { id: batch.id },
        data: {
          purchaseId: purchase.id,
          purchaseDate,
          manufacturingDate:
            item.manufacturingDate ?? null,
        } as any,
      });

      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          productId: item.productId,
          batchId: batch.id,
          quantity: item.quantity,
          unitCost: item.unitCost,
          total:
            item.quantity * item.unitCost,
        },
      });
    }

    if (paidAmount > 0) {
      const paymentNumber =
        await nextInvoiceNumber(
          tx as unknown as typeof prisma,
          INVOICE_PREFIXES.SUPPLIER_PAYMENT,
          { withYear: false }
        );

      await tx.supplierPayment.create({
        data: {
          paymentNumber,
          supplierId: input.supplierId,
          purchaseId: purchase.id,
          amount: paidAmount,
          method: paymentMethod,
          notes:
            "Paid at the time of purchase.",
          previousOutstanding: totalAmount,
          remainingOutstanding: dueAmount,
          createdById: session.userId,
        },
      });

      // Automatically subtract paid amount from Cash Management if paid via cash
      if (paymentMethod === "CASH") {
        await tx.cashTransaction.create({
          data: {
            type: "MANUAL_OUT",
            amount: paidAmount,
            transactionDate: purchaseDate,
            note: `Purchase payment - ${purchaseNumber}`,
            createdById: session.userId,
          },
        });
      }

      // Automatically record bKash outflow if paid via bKash
      if (
        paymentMethod.toUpperCase() === "BKASH"
      ) {
        await recordBkashExpenseOutflow(
          tx,
          session,
          paidAmount,
          purchaseNumber,
          `Purchase payment to supplier`,
          purchaseDate
        );
      }
    }

    await recordAuditLog(
      {
        userId: session.userId,
        username: session.username,
        roleName: session.roleName,
      },
      {
        action: "CREATE",
        module: "PURCHASE",
        recordId: purchase.id,
        newValue: {
          purchaseNumber,
          totalAmount,
        },
      },
      tx
    );

    return purchase;
  });
}

async function purchaseBalances(
  supplierIds: string[]
) {
  const balances = new Map<
    string,
    {
      paidTotal: number;
      outstandingAmount: number;
      creditApplied: number;
      derivedPaymentStatus: string;
    }
  >();

  if (supplierIds.length === 0) {
    return balances;
  }

  const [
    purchases,
    payments,
    returns,
  ] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        supplierId: {
          in: supplierIds,
        },
      },
      select: {
        id: true,
        supplierId: true,
        totalAmount: true,
        status: true,
      },
      orderBy: [
        { purchaseDate: "asc" },
        { createdAt: "asc" },
      ],
    }),

    prisma.supplierPayment.findMany({
      where: {
        supplierId: {
          in: supplierIds,
        },
      },
      select: {
        supplierId: true,
        purchaseId: true,
        amount: true,
      },
    }),

    prisma.supplierReturn.groupBy({
      by: ["purchaseId"],
      where: {
        supplierId: {
          in: supplierIds,
        },
        status: "COMPLETED",
        settlementType: {
          not: "CASH_REFUND",
        },
      },
      _sum: {
        returnValue: true,
      },
    }),
  ]);

  const creditBySupplier =
    new Map<string, number>();

  for (const r of returns) {
    const purchase = purchases.find(
      (p) => p.id === r.purchaseId
    );

    if (!purchase) {
      continue;
    }

    creditBySupplier.set(
      purchase.supplierId,
      (creditBySupplier.get(
        purchase.supplierId
      ) ?? 0) +
        Number(
          r._sum.returnValue ?? 0
        )
    );
  }

  const directByPurchase =
    new Map<string, number>();

  const unallocatedBySupplier =
    new Map<string, number>();

  for (const payment of payments) {
    if (payment.purchaseId) {
      directByPurchase.set(
        payment.purchaseId,
        (directByPurchase.get(
          payment.purchaseId
        ) ?? 0) +
          Number(payment.amount)
      );
    } else {
      unallocatedBySupplier.set(
        payment.supplierId,
        (unallocatedBySupplier.get(
          payment.supplierId
        ) ?? 0) +
          Number(payment.amount)
      );
    }
  }

  for (const purchase of purchases) {
    const total = Number(
      purchase.totalAmount
    );

    const direct =
      directByPurchase.get(
        purchase.id
      ) ?? 0;

    let outstanding =
      purchase.status === "VOID"
        ? 0
        : Math.max(
            0,
            total - direct
          );

    let paid = Math.min(
      direct,
      total
    );

    let creditApplied = 0;

    if (outstanding > 0) {
      const pool =
        unallocatedBySupplier.get(
          purchase.supplierId
        ) ?? 0;

      const applied = Math.min(
        pool,
        outstanding
      );

      unallocatedBySupplier.set(
        purchase.supplierId,
        pool - applied
      );

      outstanding -= applied;
      paid += applied;
    }

    if (outstanding > 0) {
      const pool =
        creditBySupplier.get(
          purchase.supplierId
        ) ?? 0;

      const applied = Math.min(
        pool,
        outstanding
      );

      creditBySupplier.set(
        purchase.supplierId,
        pool - applied
      );

      outstanding -= applied;
      creditApplied = applied;
    }

    balances.set(purchase.id, {
      paidTotal: paid,
      outstandingAmount:
        outstanding,
      creditApplied,
      derivedPaymentStatus:
        outstanding <= 0
          ? "PAID"
          : paid > 0 ||
            creditApplied > 0
          ? "PARTIAL"
          : "DUE",
    });
  }

  return balances;
}

export async function listPurchases(
  filters: { supplierId?: string } = {}
) {
  const purchases =
    await prisma.purchase.findMany({
      where: {
        ...(filters.supplierId
          ? {
              supplierId:
                filters.supplierId,
            }
          : {}),
      },
      include: {
        supplier: true,
        items: true,
      },
      orderBy: {
        purchaseDate: "desc",
      },
    });

  const balances =
    await purchaseBalances([
      ...new Set(
        purchases.map(
          (p) => p.supplierId
        )
      ),
    ]);

  return purchases.map((p) => {
    const balance =
      balances.get(p.id);

    return {
      ...p,
      totalItems:
        p.items.length,
      totalQuantity:
        p.items.reduce(
          (sum, i) =>
            sum +
            Number(i.quantity),
          0
        ),
      paidTotal:
        balance?.paidTotal ??
        Number(p.paidAmount),
      outstandingAmount:
        balance?.outstandingAmount ??
        Number(p.dueAmount),
      creditApplied:
        balance?.creditApplied ??
        0,
      derivedPaymentStatus:
        balance?.derivedPaymentStatus ??
        p.paymentStatus,
    };
  });
}

export async function getPurchaseWithDetails(
  idOrNumber: string
) {
  const key =
    (idOrNumber ?? "").trim();

  if (!key) {
    throw new NotFoundError(
      "Purchase not found."
    );
  }

  const purchase =
    await prisma.purchase.findFirst({
      where: {
        OR: [
          { id: key },
          {
            purchaseNumber: key,
          },
        ],
      },
      include: {
        supplier: true,
        createdBy: true,

        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },

        supplierReturns: {
          orderBy: {
            returnDate: "desc",
          },
          include: {
            product: true,
            batch: true,
          },
        },

        items: {
          include: {
            product: true,
            batch: true,
          },
        },
      },
    });

  if (!purchase) {
    throw new NotFoundError(
      "Purchase not found."
    );
  }

  const returnedByBatch =
    new Map<string, number>();

  let totalReturnValue = 0;

  for (const r of purchase.supplierReturns) {
    if (r.status !== "COMPLETED") {
      continue;
    }

    returnedByBatch.set(
      r.batchId,
      (returnedByBatch.get(
        r.batchId
      ) ?? 0) +
        Number(r.quantity)
    );

    totalReturnValue +=
      Number(r.returnValue);
  }

  const balance =
    (
      await purchaseBalances([
        purchase.supplierId,
      ])
    ).get(purchase.id);

  return {
    ...purchase,

    totalReturnValue,

    paidTotal:
      balance?.paidTotal ??
      Number(purchase.paidAmount),

    outstandingAmount:
      balance?.outstandingAmount ??
      Number(purchase.dueAmount),

    creditApplied:
      balance?.creditApplied ??
      0,

    derivedPaymentStatus:
      balance?.derivedPaymentStatus ??
      purchase.paymentStatus,

    items: purchase.items.map(
      (item) => ({
        ...item,

        quantityInStock:
          item.batch
            ? Number(
                item.batch
                  .remainingQuantity
              )
            : 0,

        quantityReturned:
          item.batchId
            ? returnedByBatch.get(
                item.batchId
              ) ?? 0
            : 0,
      })
    ),
  };
}

export async function recordSupplierPayment(
  session: AuthSession,
  input: {
    supplierId: string;
    purchaseId?: string;
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
    paymentDate?: Date | string;
  }
) {
  assertPermission(
    session,
    PERMISSIONS.SUPPLIER_PAYMENTS_MANAGE
  );

  if (input.amount <= 0) {
    throw new ValidationError(
      "Payment amount must be greater than zero."
    );
  }

  const outstanding =
    await getSupplierOutstanding(
      input.supplierId
    );

  if (input.amount > outstanding) {
    throw new ValidationError(
      `Payment exceeds the outstanding payable of ${outstanding.toFixed(
        2
      )}. Advance payments are not supported.`
    );
  }

  // Verify cash balance if paying supplier via cash
  if (input.method === "CASH") {
    const availableCash =
      await getCurrentCashBalance();

    if (input.amount > availableCash) {
      throw new ValidationError(
        `Insufficient cash balance. Available cash is ৳${availableCash.toFixed(
          2
        )}, but you are trying to pay ৳${input.amount.toFixed(
          2
        )}.`
      );
    }
  }

  // Verify bKash balance if paying supplier via bKash
  if (
    input.method.toUpperCase() ===
    "BKASH"
  ) {
    const availableBkash =
      await getCurrentBkashBalance();

    if (input.amount > availableBkash) {
      throw new ValidationError(
        `Insufficient bKash balance. Available bKash balance is ৳${availableBkash.toFixed(
          2
        )}, but you are trying to pay ৳${input.amount.toFixed(
          2
        )}.`
      );
    }
  }

  return prisma.$transaction(
    async (tx) => {
      const paymentNumber =
        await nextInvoiceNumber(
          tx as unknown as typeof prisma,
          INVOICE_PREFIXES.SUPPLIER_PAYMENT,
          {
            withYear: false,
          }
        );

      const paymentDate =
        input.paymentDate
          ? new Date(input.paymentDate)
          : new Date();

      const payment =
        await tx.supplierPayment.create({
          data: {
            paymentNumber,
            supplierId:
              input.supplierId,
            purchaseId:
              input.purchaseId,
            amount: input.amount,
            method: input.method,
            reference:
              input.reference,
            notes: input.notes,
            paymentDate,
            previousOutstanding:
              outstanding,
            remainingOutstanding:
              outstanding -
              input.amount,
            createdById:
              session.userId,
          },
        });

      let purchaseNumberForNote =
        paymentNumber;

      if (input.purchaseId) {
        const purchase =
          await tx.purchase.findUniqueOrThrow(
            {
              where: {
                id: input.purchaseId,
              },
            }
          );

        purchaseNumberForNote =
          purchase.purchaseNumber;

        const newPaid =
          new Prisma.Decimal(
            purchase.paidAmount
          ).add(input.amount);

        const newDue =
          new Prisma.Decimal(
            purchase.totalAmount
          ).sub(newPaid);

        await tx.purchase.update({
          where: {
            id: input.purchaseId,
          },
          data: {
            paidAmount: newPaid,

            dueAmount: newDue.lt(
              0
            )
              ? 0
              : newDue,

            paymentStatus:
              newDue.lte(0)
                ? "PAID"
                : newPaid.gt(0)
                ? "PARTIAL"
                : "DUE",
          },
        });
      }

      if (input.method === "CASH") {
        await tx.cashTransaction.create(
          {
            data: {
              type: "MANUAL_OUT",
              amount: input.amount,
              transactionDate:
                paymentDate,
              note: `Supplier payment - ${paymentNumber}`,
              createdById:
                session.userId,
            },
          }
        );
      }

      if (
        input.method.toUpperCase() ===
        "BKASH"
      ) {
        await recordBkashExpenseOutflow(
          tx,
          session,
          input.amount,
          purchaseNumberForNote,
          `Supplier payment via bKash`,
          paymentDate
        );
      }

      await recordAuditLog(
        session,
        {
          action: "CREATE",
          module:
            "SUPPLIER_PAYMENT",
          recordId: payment.id,
          newValue: payment,
        },
        tx
      );

      return payment;
    }
  );
}

export async function voidPurchase(
  session: AuthSession,
  purchaseId: string,
  reason: string
) {
  assertPermission(
    session,
    PERMISSIONS.PURCHASES_VOID
  );

  return prisma.$transaction(
    async (tx) => {
      const purchase =
        await tx.purchase.findUnique({
          where: {
            id: purchaseId,
          },
          include: {
            items: true,
          },
        });

      if (!purchase) {
        throw new NotFoundError(
          "Purchase not found."
        );
      }

      if (purchase.status === "VOID") {
        throw new ValidationError(
          "This purchase is already voided."
        );
      }

      for (const item of purchase.items) {
        if (!item.batchId) {
          continue;
        }

        const batch =
          await tx.productBatch.findUnique(
            {
              where: {
                id: item.batchId,
              },
            }
          );

        if (!batch) {
          continue;
        }

        await adjustStock(tx, {
          productId:
            item.productId,
          batchId:
            item.batchId,
          quantityDelta:
            new Prisma.Decimal(
              batch.remainingQuantity
            ).negated(),
          movementType:
            "ADJUSTMENT",
          userId:
            session.userId,
          notes: `Purchase ${purchase.purchaseNumber} voided: ${reason}`,
        });
      }

      const updated =
        await tx.purchase.update({
          where: {
            id: purchaseId,
          },
          data: {
            status: "VOID",
            voidReason: reason,
          },
        });

      await recordAuditLog(
        session,
        {
          action: "VOID",
          module: "PURCHASE",
          recordId: purchaseId,
          newValue: {
            reason,
          },
        },
        tx
      );

      return updated;
    }
  );
}