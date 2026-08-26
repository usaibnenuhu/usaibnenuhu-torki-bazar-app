import { prisma } from "@torki-bazar/database";
import {
  PERMISSIONS,
  DuplicateError,
  NotFoundError,
  ValidationError,
} from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { recordStockMovement } from "../inventory/inventoryService";
import { enqueueSync } from "../sync/syncService";

export interface ProductInput {
  name: string;
  categoryId: string;
  subcategoryId?: string;
  brandId?: string;
  sku?: string;
  barcode?: string;
  unitId: string;
  packSize?: number | null;
  expiryDate?: Date | string | null;
  purchasePrice?: number;
  sellingPrice?: number;
  wholesalePrice?: number;
  minimumStock?: number;
  openingStock?: number;
  description?: string;
  imageUrl?: string;
  defaultSupplierId?: string;
}

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

async function assertValidPackSize(
  unitId: string,
  packSize: number | null | undefined
) {
  if (packSize === null || packSize === undefined) {
    return;
  }

  if (!Number.isFinite(packSize) || packSize <= 0) {
    throw new ValidationError(
      "Pack size must be a number greater than zero."
    );
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
  });

  if (!unit) {
    throw new NotFoundError("Unit not found.");
  }

  const isDiscrete = DISCRETE_UNIT_NAMES.includes(
    unit.name.trim().toLowerCase()
  );

  if (isDiscrete && !Number.isInteger(packSize)) {
    throw new ValidationError(
      `Pack size for "${unit.name}" must be a whole number.`
    );
  }
}

function normalizeExpiry(
  value: Date | string | null | undefined
): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationError("Expiry date is not a valid date.");
  }

  return date;
}

function normalizeSku(
  sku: string | null | undefined
): string | null | undefined {
  if (sku === undefined) {
    return undefined;
  }

  const trimmed = (sku ?? "").trim();

  return trimmed === "" ? null : trimmed;
}

async function assertUniqueSkuBarcode(
  sku: string | null | undefined,
  barcode: string | null | undefined,
  excludeId?: string
) {
  if (sku) {
    const existingSku = await prisma.product.findFirst({
      where: {
        sku,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existingSku) {
      throw new DuplicateError(
        `SKU "${sku}" is already used by another product.`
      );
    }
  }

  if (barcode) {
    const existingBarcode = await prisma.product.findFirst({
      where: {
        barcode,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existingBarcode) {
      throw new DuplicateError(
        `Barcode "${barcode}" is already used by another product.`
      );
    }
  }
}

export async function createProduct(
  session: AuthSession,
  input: ProductInput
) {
  assertPermission(session, PERMISSIONS.PRODUCTS_MANAGE);

  const sku = normalizeSku(input.sku) ?? null;
  const barcode = input.barcode?.trim() || null;

  await assertUniqueSkuBarcode(sku, barcode);

  await assertValidPackSize(input.unitId, input.packSize);

  const openingStock = input.openingStock ?? 0;

  if (!Number.isFinite(openingStock) || openingStock < 0) {
    throw new ValidationError("Opening stock cannot be negative.");
  }

  const purchasePrice = input.purchasePrice ?? 0;

  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
    throw new ValidationError("Purchase price cannot be negative.");
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
    throw new ValidationError("Selling price cannot be negative.");
  }

  const wholesalePrice = input.wholesalePrice ?? 0;

  if (!Number.isFinite(wholesalePrice) || wholesalePrice < 0) {
    throw new ValidationError("Wholesale price cannot be negative.");
  }

  const minimumStock = input.minimumStock ?? 0;

  if (!Number.isFinite(minimumStock) || minimumStock < 0) {
    throw new ValidationError("Minimum stock cannot be negative.");
  }

  const normalizedExpiry = normalizeExpiry(input.expiryDate);

  const product = await prisma.$transaction(async (tx) => {
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

      await recordStockMovement(tx, {
        productId: created.id,
        batchId: batch.id,
        movementType: "ADJUSTMENT",
        quantity: openingStock,
        referenceType: "OPENING_STOCK",
        referenceId: created.id,
        userId: session.userId,
        notes: "Opening stock entered on product creation.",
      });

      await enqueueSync(
        "PRODUCT",
        created.id,
        "CREATE",
        {
          name: created.name,
          categoryId: created.categoryId,
          subcategoryId: created.subcategoryId,
          brandId: created.brandId,
          sku: created.sku,
          barcode: created.barcode,
          unitId: created.unitId,
          packSize: created.packSize,
          expiryDate: created.expiryDate,
          purchasePrice: created.purchasePrice,
          sellingPrice: created.sellingPrice,
          wholesalePrice: created.wholesalePrice,
          minimumStock: created.minimumStock,
          currentStock: created.currentStock,
          description: created.description,
          imageUrl: created.imageUrl,
          status: created.status,
          defaultSupplierId: created.defaultSupplierId,
        },
        tx
      );
    }

    return tx.product.findUniqueOrThrow({
      where: { id: created.id },
    });
  });

  await recordAuditLog(session, {
    action: "CREATE",
    module: "PRODUCT",
    recordId: product.id,
    newValue: product,
  });

  return product;
}

export async function updateProduct(
  session: AuthSession,
  id: string,
  input: Partial<ProductInput>
) {
  assertPermission(session, PERMISSIONS.PRODUCTS_MANAGE);

  const before = await prisma.product.findUnique({
    where: { id },
  });

  if (!before) {
    throw new NotFoundError("Product not found.");
  }

  const sku = normalizeSku(input.sku);

  if (sku !== undefined || input.barcode !== undefined) {
    await assertUniqueSkuBarcode(
      sku !== undefined ? sku : before.sku,
      input.barcode !== undefined
        ? input.barcode?.trim() || null
        : before.barcode,
      id
    );
  }

  if (input.packSize !== undefined) {
    await assertValidPackSize(
      input.unitId ?? before.unitId,
      input.packSize
    );
  }

  if (
    input.purchasePrice !== undefined &&
    (!Number.isFinite(input.purchasePrice) ||
      input.purchasePrice < 0)
  ) {
    throw new ValidationError("Purchase price cannot be negative.");
  }

  if (
    input.sellingPrice !== undefined &&
    (!Number.isFinite(input.sellingPrice) ||
      input.sellingPrice < 0)
  ) {
    throw new ValidationError("Selling price cannot be negative.");
  }

  if (
    input.wholesalePrice !== undefined &&
    (!Number.isFinite(input.wholesalePrice) ||
      input.wholesalePrice < 0)
  ) {
    throw new ValidationError("Wholesale price cannot be negative.");
  }

  if (
    input.minimumStock !== undefined &&
    (!Number.isFinite(input.minimumStock) ||
      input.minimumStock < 0)
  ) {
    throw new ValidationError("Minimum stock cannot be negative.");
  }

  /*
   * openingStock is NOT a Product database field.
   * It is only used when creating the product.
   *
   * Therefore we remove it before calling product.update().
   */
  const {
    openingStock: _openingStock,
    expiryDate,
    sku: _sku,
    barcode,
    ...rest
  } = input;

  const product = await prisma.product.update({
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
            barcode:
              barcode.trim() === ""
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

  await enqueueSync(
    "PRODUCT",
    product.id,
    "UPDATE",
    {
      name: product.name,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      brandId: product.brandId,
      sku: product.sku,
      barcode: product.barcode,
      unitId: product.unitId,
      packSize: product.packSize,
      expiryDate: product.expiryDate,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      wholesalePrice: product.wholesalePrice,
      minimumStock: product.minimumStock,
      currentStock: product.currentStock,
      description: product.description,
      imageUrl: product.imageUrl,
      status: product.status,
      defaultSupplierId: product.defaultSupplierId,
    }
  );

  await recordAuditLog(session, {
    action: "UPDATE",
    module: "PRODUCT",
    recordId: id,
    previousValue: before,
    newValue: product,
  });

  return product;
}

export async function archiveProduct(
  session: AuthSession,
  id: string,
  isArchived = true
) {
  assertPermission(session, PERMISSIONS.PRODUCTS_ARCHIVE);

  const product = await prisma.product.update({
    where: { id },
    data: {
      status: isArchived ? "ARCHIVED" : "ACTIVE",
    },
  });

  await enqueueSync(
    "PRODUCT",
    product.id,
    "UPDATE",
    {
      name: product.name,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      brandId: product.brandId,
      sku: product.sku,
      barcode: product.barcode,
      unitId: product.unitId,
      packSize: product.packSize,
      expiryDate: product.expiryDate,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      wholesalePrice: product.wholesalePrice,
      minimumStock: product.minimumStock,
      currentStock: product.currentStock,
      description: product.description,
      imageUrl: product.imageUrl,
      status: product.status,
      defaultSupplierId: product.defaultSupplierId,
    }
  );

  await recordAuditLog(session, {
    action: isArchived ? "ARCHIVE" : "UNARCHIVE",
    module: "PRODUCT",
    recordId: id,
  });

  return product;
}

export async function deleteProduct(
  session: AuthSession,
  id: string
) {
  assertPermission(session, PERMISSIONS.PRODUCTS_MANAGE);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      saleItems: true,
      purchaseItems: true,
    },
  });

  if (!product) {
    throw new NotFoundError("Product not found.");
  }

  if (
    product.saleItems.length > 0 ||
    product.purchaseItems.length > 0
  ) {
    throw new ValidationError(
      "Cannot delete product with existing sales or purchases. Archive it instead."
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.productBatch.deleteMany({
      where: { productId: id },
    });

    await tx.product.delete({
      where: { id },
    });
  });

  await recordAuditLog(session, {
    action: "DELETE",
    module: "PRODUCT",
    recordId: id,
    previousValue: product,
  });
}

export interface ProductSearchOptions {
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: "ACTIVE" | "ARCHIVED";
  page?: number;
  pageSize?: number;
}

export async function searchProducts(
  options: ProductSearchOptions = {}
) {
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
    prisma.product.findMany({
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

    prisma.product.count({
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

export async function findProductByBarcodeOrSku(
  code: string
) {
  const trimmed = (code ?? "").trim();

  if (!trimmed) {
    throw new ValidationError(
      "Enter a barcode or SKU to search."
    );
  }

  const product = await prisma.product.findFirst({
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
    throw new NotFoundError(
      `No active product found for code "${trimmed}".`
    );
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

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
  });

  return products.filter(
    (product) =>
      Number(product.currentStock) <=
      Number(product.minimumStock)
  );
}