import { prisma } from "@torki-bazar/database";
import { neonPrisma } from "@torki-bazar/database/dist/neonClient";

export type SyncStatus =
  | "PENDING"
  | "SYNCING"
  | "SYNCED"
  | "FAILED";

const BATCH_SIZE = 50;

export async function getSyncStatus() {
  const [pending, failed, lastSynced] = await Promise.all([
    prisma.syncQueue.count({
      where: { syncStatus: "PENDING" },
    }),

    prisma.syncQueue.count({
      where: { syncStatus: "FAILED" },
    }),

    prisma.syncQueue.findFirst({
      where: {
        syncStatus: "SYNCED",
        syncedAt: { not: null },
      },
      orderBy: {
        syncedAt: "desc",
      },
      select: {
        syncedAt: true,
      },
    }),
  ]);

  return {
    pending,
    failed,
    lastSyncedAt: lastSynced?.syncedAt ?? null,
    isSyncing: false,
  };
}

export async function getPendingSyncCount() {
  return prisma.syncQueue.count({
    where: {
      syncStatus: {
        in: ["PENDING", "FAILED"],
      },
    },
  });
}

export async function enqueueSync(
  entityType: string,
  entityId: string,
  operationType: string,
  payload: unknown,
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
) {
  const client = tx ?? prisma;

  return client.syncQueue.create({
    data: {
      entityType,
      entityId,
      operationType,
      payload: JSON.stringify(payload),
      syncStatus: "PENDING",
    },
  });
}


async function syncCustomer(customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error(`Customer ${customerId} not found locally.`);

  let existing = await neonPrisma.customer.findUnique({ where: { id: customer.id } });
  if (!existing && customer.phone) {
    existing = await neonPrisma.customer.findFirst({ where: { phone: customer.phone } });
  }

  if (existing) {
    await neonPrisma.customer.update({
      where: { id: existing.id },
      data: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        updatedAt: customer.updatedAt,
      },
    });
    return existing.id;
  }

  const created = await neonPrisma.customer.create({
    data: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    },
  });

  return created.id;
}


async function syncSupplier(supplierId: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) {
    throw new Error(`Supplier ${supplierId} not found locally.`);
  }

  const existing = await neonPrisma.supplier.findUnique({
    where: { id: supplier.id },
  });

  if (existing) {
    await neonPrisma.supplier.update({
      where: { id: existing.id },
      data: {
        name: supplier.name,
        company: supplier.company,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        notes: supplier.notes,
        status: supplier.status,
        updatedAt: supplier.updatedAt,
      },
    });
    return;
  }

  await neonPrisma.supplier.create({
    data: {
      id: supplier.id,
      name: supplier.name,
      company: supplier.company,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      notes: supplier.notes,
      status: supplier.status,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    },
  });
}

async function syncProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error(`Product ${productId} not found locally.`);
  }

  /*
   * IMPORTANT:
   * Local PC IDs and Neon IDs for master data may be different.
   *
   * Therefore we resolve parent records by their unique business
   * identity (name / category + name), then use the Neon IDs
   * when syncing the Product.
   */

  // ------------------------------------------------------------
  // CATEGORY
  // ------------------------------------------------------------

  const category = await prisma.category.findUnique({
    where: { id: product.categoryId },
  });

  if (!category) {
    throw new Error(
      `Category ${product.categoryId} for product ${product.id} not found locally.`
    );
  }

  let neonCategory = await neonPrisma.category.findUnique({
    where: { name: category.name },
  });

  if (neonCategory) {
    neonCategory = await neonPrisma.category.update({
      where: { id: neonCategory.id },
      data: {
        description: category.description,
        isArchived: category.isArchived,
        updatedAt: category.updatedAt,
      },
    });
  } else {
    neonCategory = await neonPrisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        isArchived: category.isArchived,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  }

  const neonCategoryId = neonCategory.id;

  // ------------------------------------------------------------
  // UNIT
  // ------------------------------------------------------------

  const unit = await prisma.unit.findUnique({
    where: { id: product.unitId },
  });

  if (!unit) {
    throw new Error(
      `Unit ${product.unitId} for product ${product.id} not found locally.`
    );
  }

  let neonUnit = await neonPrisma.unit.findUnique({
    where: { name: unit.name },
  });

  if (neonUnit) {
    neonUnit = await neonPrisma.unit.update({
      where: { id: neonUnit.id },
      data: {
        abbreviation: unit.abbreviation,
        isArchived: unit.isArchived,
      },
    });
  } else {
    neonUnit = await neonPrisma.unit.create({
      data: {
        id: unit.id,
        name: unit.name,
        abbreviation: unit.abbreviation,
        isArchived: unit.isArchived,
      },
    });
  }

  const neonUnitId = neonUnit.id;

  // ------------------------------------------------------------
  // SUBCATEGORY
  // ------------------------------------------------------------

  let neonSubcategoryId: string | null = null;

  if (product.subcategoryId) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: product.subcategoryId },
    });

    if (!subcategory) {
      throw new Error(
        `Subcategory ${product.subcategoryId} for product ${product.id} not found locally.`
      );
    }

    let neonSubcategory = await neonPrisma.subcategory.findUnique({
      where: {
        categoryId_name: {
          categoryId: neonCategoryId,
          name: subcategory.name,
        },
      },
    });

    if (neonSubcategory) {
      neonSubcategory = await neonPrisma.subcategory.update({
        where: { id: neonSubcategory.id },
        data: {
          isArchived: subcategory.isArchived,
          updatedAt: subcategory.updatedAt,
        },
      });
    } else {
      neonSubcategory = await neonPrisma.subcategory.create({
        data: {
          id: subcategory.id,
          categoryId: neonCategoryId,
          name: subcategory.name,
          isArchived: subcategory.isArchived,
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
        },
      });
    }

    neonSubcategoryId = neonSubcategory.id;
  }

  // ------------------------------------------------------------
  // BRAND
  // ------------------------------------------------------------

  let neonBrandId: string | null = null;

  if (product.brandId) {
    const brand = await prisma.brand.findUnique({
      where: { id: product.brandId },
    });

    if (!brand) {
      throw new Error(
        `Brand ${product.brandId} for product ${product.id} not found locally.`
      );
    }

    let neonBrand = await neonPrisma.brand.findUnique({
      where: { name: brand.name },
    });

    if (neonBrand) {
      neonBrand = await neonPrisma.brand.update({
        where: { id: neonBrand.id },
        data: {
          isArchived: brand.isArchived,
        },
      });
    } else {
      neonBrand = await neonPrisma.brand.create({
        data: {
          id: brand.id,
          name: brand.name,
          isArchived: brand.isArchived,
        },
      });
    }

    neonBrandId = neonBrand.id;
  }

  // ------------------------------------------------------------
  // DEFAULT SUPPLIER
  // ------------------------------------------------------------

  let neonDefaultSupplierId: string | null = null;

  if (product.defaultSupplierId) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: product.defaultSupplierId },
    });

    if (!supplier) {
      throw new Error(
        `Supplier ${product.defaultSupplierId} for product ${product.id} not found locally.`
      );
    }

    /*
     * Supplier does not have a unique name in the schema.
     * First try the same ID. If it doesn't exist, try phone.
     */
    let neonSupplier = await neonPrisma.supplier.findUnique({
      where: { id: supplier.id },
    });

    if (!neonSupplier) {
      neonSupplier = await neonPrisma.supplier.findFirst({
        where: { phone: supplier.phone },
      });
    }

    if (neonSupplier) {
      neonSupplier = await neonPrisma.supplier.update({
        where: { id: neonSupplier.id },
        data: {
          name: supplier.name,
          company: supplier.company,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          notes: supplier.notes,
          status: supplier.status,
          updatedAt: supplier.updatedAt,
        },
      });
    } else {
      neonSupplier = await neonPrisma.supplier.create({
        data: {
          id: supplier.id,
          name: supplier.name,
          company: supplier.company,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          notes: supplier.notes,
          status: supplier.status,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt,
        },
      });
    }

    neonDefaultSupplierId = neonSupplier.id;
  }

  // ------------------------------------------------------------
  // PRODUCT
  // ------------------------------------------------------------

  /*
   * Local and Neon product IDs may be different.
   *
   * Resolve the existing Neon product using the strongest available
   * business identity first:
   *   1. SKU
   *   2. Barcode
   *   3. Local ID
   *
   * This prevents duplicate products when the local PC and Neon
   * databases were created independently.
   */
  let neonProduct = await neonPrisma.product.findUnique({
    where: { id: product.id },
  });

  if (!neonProduct && product.sku) {
    neonProduct = await neonPrisma.product.findUnique({
      where: { sku: product.sku },
    });
  }

  if (!neonProduct && product.barcode) {
    neonProduct = await neonPrisma.product.findUnique({
      where: { barcode: product.barcode },
    });
  }

  if (neonProduct) {
    await neonPrisma.product.update({
      where: { id: neonProduct.id },

      data: {
        name: product.name,
        imageUrl: product.imageUrl,

        categoryId: neonCategoryId,
        subcategoryId: neonSubcategoryId,
        brandId: neonBrandId,

        sku: product.sku,
        barcode: product.barcode,

        unitId: neonUnitId,

        packSize: product.packSize,
        expiryDate: product.expiryDate,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        wholesalePrice: product.wholesalePrice,
        minimumStock: product.minimumStock,
        currentStock: product.currentStock,
        description: product.description,
        status: product.status,

        defaultSupplierId: neonDefaultSupplierId,

        updatedAt: product.updatedAt,
      },
    });

    return;
  }

  await neonPrisma.product.create({
    data: {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,

      categoryId: neonCategoryId,
      subcategoryId: neonSubcategoryId,
      brandId: neonBrandId,

      sku: product.sku,
      barcode: product.barcode,

      unitId: neonUnitId,

      packSize: product.packSize,
      expiryDate: product.expiryDate,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      wholesalePrice: product.wholesalePrice,
      minimumStock: product.minimumStock,
      currentStock: product.currentStock,
      description: product.description,
      status: product.status,

      defaultSupplierId: neonDefaultSupplierId,

      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    },
  });
}

async function ensureNeonRole(roleId: string): Promise<string> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error(`Role ${roleId} not found locally.`);
  }

  let neonRole = await neonPrisma.role.findUnique({
    where: { id: role.id },
  });

  if (!neonRole) {
    neonRole = await neonPrisma.role.findUnique({
      where: { name: role.name },
    });
  }

  if (neonRole) {
    neonRole = await neonPrisma.role.update({
      where: { id: neonRole.id },
      data: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        updatedAt: role.updatedAt,
      },
    });

    return neonRole.id;
  }

  const created = await neonPrisma.role.create({
    data: {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    },
  });

  return created.id;
}

async function ensureNeonUser(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User ${userId} not found locally.`);
  }

  const neonRoleId = await ensureNeonRole(user.roleId);

  let neonUser = await neonPrisma.user.findUnique({
    where: { id: user.id },
  });

  if (!neonUser) {
    neonUser = await neonPrisma.user.findUnique({
      where: { username: user.username },
    });
  }

  if (neonUser) {
    neonUser = await neonPrisma.user.update({
      where: { id: neonUser.id },
      data: {
        username: user.username,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
        phone: user.phone,
        roleId: neonRoleId,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        updatedAt: user.updatedAt,
      },
    });

    return neonUser.id;
  }

  const created = await neonPrisma.user.create({
    data: {
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      phone: user.phone,
      roleId: neonRoleId,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });

  return created.id;
}

async function ensureNeonSupplier(
  supplierId: string
): Promise<string> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) {
    throw new Error(`Supplier ${supplierId} not found locally.`);
  }

  let neonSupplier = await neonPrisma.supplier.findUnique({
    where: { id: supplier.id },
  });

  if (!neonSupplier && supplier.phone) {
    neonSupplier = await neonPrisma.supplier.findFirst({
      where: { phone: supplier.phone },
    });
  }

  if (!neonSupplier) {
    neonSupplier = await neonPrisma.supplier.findFirst({
      where: { name: supplier.name },
    });
  }

  if (neonSupplier) {
    neonSupplier = await neonPrisma.supplier.update({
      where: { id: neonSupplier.id },
      data: {
        name: supplier.name,
        company: supplier.company,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        notes: supplier.notes,
        status: supplier.status,
        updatedAt: supplier.updatedAt,
      },
    });

    return neonSupplier.id;
  }

  const created = await neonPrisma.supplier.create({
    data: {
      id: supplier.id,
      name: supplier.name,
      company: supplier.company,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      notes: supplier.notes,
      status: supplier.status,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    },
  });

  return created.id;
}

async function ensureNeonPurchase(
  purchaseId: string
): Promise<string> {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      items: true,
    },
  });

  if (!purchase) {
    throw new Error(
      `Purchase ${purchaseId} not found locally.`
    );
  }

  const neonSupplierId = await ensureNeonSupplier(
    purchase.supplierId
  );

  const neonCreatedById = await ensureNeonUser(
    purchase.createdById
  );

  let neonPurchase = await neonPrisma.purchase.findUnique({
    where: { id: purchase.id },
  });

  if (!neonPurchase) {
    neonPurchase = await neonPrisma.purchase.findUnique({
      where: {
        purchaseNumber: purchase.purchaseNumber,
      },
    });
  }

  if (neonPurchase) {
    neonPurchase = await neonPrisma.purchase.update({
      where: { id: neonPurchase.id },
      data: {
        purchaseNumber: purchase.purchaseNumber,
        supplierId: neonSupplierId,
        invoiceNumber: purchase.invoiceNumber,
        purchaseDate: purchase.purchaseDate,
        totalAmount: purchase.totalAmount,
        paidAmount: purchase.paidAmount,
        dueAmount: purchase.dueAmount,
        paymentStatus: purchase.paymentStatus,
        status: purchase.status,
        voidReason: purchase.voidReason,
        createdById: neonCreatedById,
        createdAt: purchase.createdAt,
      },
    });

    return neonPurchase.id;
  }

  const created = await neonPrisma.purchase.create({
    data: {
      id: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      supplierId: neonSupplierId,
      invoiceNumber: purchase.invoiceNumber,
      purchaseDate: purchase.purchaseDate,
      totalAmount: purchase.totalAmount,
      paidAmount: purchase.paidAmount,
      dueAmount: purchase.dueAmount,
      paymentStatus: purchase.paymentStatus,
      status: purchase.status,
      voidReason: purchase.voidReason,
      createdById: neonCreatedById,
      createdAt: purchase.createdAt,
    },
  });

  return created.id;
}

async function syncPurchase(purchaseId: string) {
  await ensureNeonPurchase(purchaseId);
  await syncPurchaseItems(purchaseId);
}

async function syncPurchaseItems(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { items: true },
  });

  if (!purchase) {
    throw new Error(`Purchase ${purchaseId} not found locally.`);
  }

  // IMPORTANT:
  // Local and Neon purchase IDs may differ.
  // Always resolve the actual Neon purchase ID before
  // syncing PurchaseItems.
  const neonPurchaseId = await ensureNeonPurchase(purchase.id);

  for (const item of purchase.items) {
    await syncProduct(item.productId);

    let neonBatchId: string | null = null;

    if (item.batchId) {
      // The purchase item references this batch, so make sure
      // the batch exists in Neon before creating/updating the item.
      await syncProductBatch(item.batchId);

      const neonBatch = await neonPrisma.productBatch.findUnique({
        where: { id: item.batchId },
        select: { id: true },
      });

      neonBatchId = neonBatch?.id ?? null;
    }

    await neonPrisma.purchaseItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        purchaseId: neonPurchaseId,
        productId: item.productId,
        batchId: neonBatchId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        total: item.total,
      },
      update: {
        purchaseId: neonPurchaseId,
        productId: item.productId,
        batchId: neonBatchId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        total: item.total,
      },
    });
  }
}

async function syncSupplierPayment(paymentId: string) {
  const payment = await prisma.supplierPayment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error(`SupplierPayment ${paymentId} not found locally.`);
  }

  const neonSupplierId = await ensureNeonSupplier(payment.supplierId);
  const neonCreatedById = await ensureNeonUser(payment.createdById);

  let neonPurchaseId: string | null = null;

  if (payment.purchaseId) {
    neonPurchaseId = await ensureNeonPurchase(payment.purchaseId);
  }

  await neonPrisma.supplierPayment.upsert({
    where: { id: payment.id },

    create: {
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      supplierId: neonSupplierId,
      purchaseId: neonPurchaseId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      notes: payment.notes,
      previousOutstanding: payment.previousOutstanding,
      remainingOutstanding: payment.remainingOutstanding,
      createdById: neonCreatedById,
      createdAt: payment.createdAt,
    },

    update: {
      paymentNumber: payment.paymentNumber,
      supplierId: neonSupplierId,
      purchaseId: neonPurchaseId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      notes: payment.notes,
      previousOutstanding: payment.previousOutstanding,
      remainingOutstanding: payment.remainingOutstanding,
      createdById: neonCreatedById,
      createdAt: payment.createdAt,
    },
  });
}

/**
 * Push one local customer Return from Electron -> Neon.
 *
 * Customer returns were already being created locally and queued as
 * RETURN records, but the queue dispatcher had no RETURN handler.
 *
 * This function is idempotent and also repairs the older returns that
 * were created before RETURN synchronization was wired correctly.
 */
async function syncReturn(returnId: string) {
  const returnRecord = await prisma.return.findUnique({
    where: { id: returnId },
    include: {
      items: true,
    },
  });

  if (!returnRecord) {
    throw new Error(`Return ${returnId} not found locally.`);
  }

  /*
   * The return references a sale and its SaleItems.
   * Make absolutely sure the corresponding sale exists in Neon first.
   *
   * syncSale() is idempotent and preserves the local SaleItem IDs,
   * which means ReturnItem.saleItemId can safely reference them.
   */
  await syncSale(returnRecord.saleId);

  const neonSale = await neonPrisma.sale.findFirst({
    where: {
      OR: [
        { id: returnRecord.saleId },
        {
          saleNumber: (
            await prisma.sale.findUnique({
              where: { id: returnRecord.saleId },
              select: { saleNumber: true },
            })
          )?.saleNumber ?? "",
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!neonSale) {
    throw new Error(
      `Sale for return ${returnRecord.returnNumber} could not be mapped to Neon.`
    );
  }

  /*
   * Customer ID may differ between Electron and Neon.
   */
  let neonCustomerId: string | null = null;

  if (returnRecord.customerId) {
    neonCustomerId = await syncCustomer(returnRecord.customerId);
  }

  /*
   * The creator/user ID may also differ between Electron and Neon.
   */
  const neonCreatedById = await ensureNeonUser(
    returnRecord.createdById
  );

  /*
   * Upsert the Return header.
   */
  await neonPrisma.return.upsert({
    where: {
      id: returnRecord.id,
    },

    create: {
      id: returnRecord.id,
      returnNumber: returnRecord.returnNumber,
      saleId: neonSale.id,
      customerId: neonCustomerId,
      returnDate: returnRecord.returnDate,
      totalRefund: returnRecord.totalRefund,
      reason: returnRecord.reason,
      createdById: neonCreatedById,
      createdAt: returnRecord.createdAt,
    },

    update: {
      returnNumber: returnRecord.returnNumber,
      saleId: neonSale.id,
      customerId: neonCustomerId,
      returnDate: returnRecord.returnDate,
      totalRefund: returnRecord.totalRefund,
      reason: returnRecord.reason,
      createdById: neonCreatedById,
    },
  });

  /*
   * ReturnItems use the same IDs as the local records.
   *
   * Product IDs can differ, so resolve the actual Neon product ID.
   */
  for (const item of returnRecord.items) {
    await syncProduct(item.productId);

    const localProduct = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!localProduct) {
      throw new Error(
        `Product ${item.productId} for return ${returnRecord.returnNumber} not found locally.`
      );
    }

    let neonProduct = await neonPrisma.product.findUnique({
      where: { id: localProduct.id },
    });

    if (!neonProduct && localProduct.sku) {
      neonProduct = await neonPrisma.product.findUnique({
        where: { sku: localProduct.sku },
      });
    }

    if (!neonProduct && localProduct.barcode) {
      neonProduct = await neonPrisma.product.findUnique({
        where: { barcode: localProduct.barcode },
      });
    }

    if (!neonProduct) {
      throw new Error(
        `Product ${localProduct.name} for return ${returnRecord.returnNumber} could not be mapped to Neon.`
      );
    }

    /*
     * ReturnItem.saleItemId is preserved by syncSale().
     * Verify the SaleItem exists in Neon before inserting the ReturnItem.
     */
    const neonSaleItem = await neonPrisma.saleItem.findUnique({
      where: {
        id: item.saleItemId,
      },
      select: {
        id: true,
      },
    });

    if (!neonSaleItem) {
      throw new Error(
        `SaleItem ${item.saleItemId} for return ${returnRecord.returnNumber} is missing in Neon.`
      );
    }

    /*
     * targetBatchId is optional.
     * Only use it if that batch exists in Neon.
     */
    let neonTargetBatchId: string | null = null;

    if (item.targetBatchId) {
      const neonBatch = await neonPrisma.productBatch.findUnique({
        where: {
          id: item.targetBatchId,
        },
        select: {
          id: true,
        },
      });

      if (neonBatch) {
        neonTargetBatchId = neonBatch.id;
      }
    }

    await neonPrisma.returnItem.upsert({
      where: {
        id: item.id,
      },

      create: {
        id: item.id,
        returnId: returnRecord.id,
        saleItemId: neonSaleItem.id,
        productId: neonProduct.id,
        quantity: item.quantity,
        condition: item.condition,
        refundAmount: item.refundAmount,
        targetBatchId: neonTargetBatchId,
      },

      update: {
        returnId: returnRecord.id,
        saleItemId: neonSaleItem.id,
        productId: neonProduct.id,
        quantity: item.quantity,
        condition: item.condition,
        refundAmount: item.refundAmount,
        targetBatchId: neonTargetBatchId,
      },
    });
  }

  console.log(
    `[sync] RETURN ${returnRecord.returnNumber} -> Neon OK`
  );
}


/**
 * Reconcile every local customer Return with the sync queue.
 *
 * This repairs old returns that were created before RETURN synchronization
 * was correctly wired.
 */
async function enqueueMissingReturns() {
  const [returns, queuedReturns] = await Promise.all([
    prisma.return.findMany({
      select: {
        id: true,
      },
    }),

    prisma.syncQueue.findMany({
      where: {
        entityType: "RETURN",
        syncStatus: {
          in: ["PENDING", "FAILED", "SYNCED"],
        },
      },
      select: {
        entityId: true,
      },
    }),
  ]);

  const queuedIds = new Set(
    queuedReturns.map((item) => item.entityId)
  );

  let created = 0;

  for (const returnRecord of returns) {
    if (queuedIds.has(returnRecord.id)) {
      continue;
    }

    await enqueueSync(
      "RETURN",
      returnRecord.id,
      "CREATE",
      { id: returnRecord.id }
    );

    created++;
  }

  if (created > 0) {
    console.log(
      `[sync] Reconciled ${created} customer return(s) for Neon synchronization.`
    );
  }

  return created;
}

async function syncSupplierReturn(returnId: string) {
  const supplierReturn = await prisma.supplierReturn.findUnique({
    where: { id: returnId },
  });

  if (!supplierReturn) {
    throw new Error(
      `SupplierReturn ${returnId} not found locally.`
    );
  }

  const neonSupplierId = await ensureNeonSupplier(
    supplierReturn.supplierId
  );

  const neonPurchaseId = await ensureNeonPurchase(
    supplierReturn.purchaseId
  );

  await syncProduct(supplierReturn.productId);
  await syncProductBatch(supplierReturn.batchId);

  const neonCreatedById = await ensureNeonUser(
    supplierReturn.createdById
  );

  await neonPrisma.supplierReturn.upsert({
    where: {
      id: supplierReturn.id,
    },

    create: {
      id: supplierReturn.id,
      returnNumber: supplierReturn.returnNumber,
      supplierId: neonSupplierId,
      purchaseId: neonPurchaseId,
      productId: supplierReturn.productId,
      batchId: supplierReturn.batchId,
      quantity: supplierReturn.quantity,
      unitCost: supplierReturn.unitCost,
      returnValue: supplierReturn.returnValue,
      returnDate: supplierReturn.returnDate,
      reason: supplierReturn.reason,
      notes: supplierReturn.notes,
      settlementType: supplierReturn.settlementType,
      status: supplierReturn.status,
      cancelReason: supplierReturn.cancelReason,
      createdById: neonCreatedById,
      createdAt: supplierReturn.createdAt,
      updatedAt: supplierReturn.updatedAt,
    },

    update: {
      returnNumber: supplierReturn.returnNumber,
      supplierId: neonSupplierId,
      purchaseId: neonPurchaseId,
      productId: supplierReturn.productId,
      batchId: supplierReturn.batchId,
      quantity: supplierReturn.quantity,
      unitCost: supplierReturn.unitCost,
      returnValue: supplierReturn.returnValue,
      returnDate: supplierReturn.returnDate,
      reason: supplierReturn.reason,
      notes: supplierReturn.notes,
      settlementType: supplierReturn.settlementType,
      status: supplierReturn.status,
      cancelReason: supplierReturn.cancelReason,
      createdById: neonCreatedById,
      createdAt: supplierReturn.createdAt,
      updatedAt: supplierReturn.updatedAt,
    },
  });
}

async function syncProductBatch(batchId: string) {
  const batch = await prisma.productBatch.findUnique({
    where: { id: batchId },
  });

  if (!batch) {
    throw new Error(
      `ProductBatch ${batchId} not found locally.`
    );
  }

  await syncProduct(batch.productId);

  let neonSupplierId: string | null = null;

  if (batch.supplierId) {
    neonSupplierId = await ensureNeonSupplier(
      batch.supplierId
    );
  }

  let neonPurchaseId: string | null = null;

  if (batch.purchaseId) {
    neonPurchaseId = await ensureNeonPurchase(
      batch.purchaseId
    );
  }

  await neonPrisma.productBatch.upsert({
    where: { id: batch.id },

    create: {
      id: batch.id,
      productId: batch.productId,
      supplierId: neonSupplierId,
      purchaseId: neonPurchaseId,
      batchCode: batch.batchCode,
      purchaseDate: batch.purchaseDate,
      manufacturingDate: batch.manufacturingDate,
      quantityReceived: batch.quantityReceived,
      remainingQuantity: batch.remainingQuantity,
      quantityReturned: batch.quantityReturned,
      purchasePrice: batch.purchasePrice,
      sellingPrice: batch.sellingPrice,
      expiryDate: batch.expiryDate,
      purchaseInvoiceNumber: batch.purchaseInvoiceNumber,
      notes: batch.notes,
      status: batch.status,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    },

    update: {
      productId: batch.productId,
      supplierId: neonSupplierId,
      purchaseId: neonPurchaseId,
      batchCode: batch.batchCode,
      purchaseDate: batch.purchaseDate,
      manufacturingDate: batch.manufacturingDate,
      quantityReceived: batch.quantityReceived,
      remainingQuantity: batch.remainingQuantity,
      quantityReturned: batch.quantityReturned,
      purchasePrice: batch.purchasePrice,
      sellingPrice: batch.sellingPrice,
      expiryDate: batch.expiryDate,
      purchaseInvoiceNumber: batch.purchaseInvoiceNumber,
      notes: batch.notes,
      status: batch.status,
      updatedAt: batch.updatedAt,
    },
  });
}

async function syncStockMovement(movementId: string) {
  const movement = await prisma.stockMovement.findUnique({
    where: { id: movementId },
  });

  if (!movement) {
    throw new Error(
      `StockMovement ${movementId} not found locally.`
    );
  }

  await syncProduct(movement.productId);

  if (movement.batchId) {
    await syncProductBatch(movement.batchId);
  }

  const neonUserId = await ensureNeonUser(
    movement.userId
  );

  await neonPrisma.stockMovement.upsert({
    where: { id: movement.id },

    create: {
      id: movement.id,
      productId: movement.productId,
      batchId: movement.batchId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      userId: neonUserId,
      notes: movement.notes,
      createdAt: movement.createdAt,
    },

    update: {
      productId: movement.productId,
      batchId: movement.batchId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      userId: neonUserId,
      notes: movement.notes,
      createdAt: movement.createdAt,
    },
  });
}

async function syncBkashTransaction(transactionId: string) {
  const transaction = await prisma.bkashTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error(
      `BkashTransaction ${transactionId} not found locally.`
    );
  }

  const neonCreatedById = await ensureNeonUser(
    transaction.createdById
  );

  await neonPrisma.bkashTransaction.upsert({
    where: { id: transaction.id },

    create: {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      createdById: neonCreatedById,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    },

    update: {
      type: transaction.type,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      createdById: neonCreatedById,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    },
  });
}

async function syncCashTransaction(transactionId: string) {
  const transaction = await prisma.cashTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error(
      `CashTransaction ${transactionId} not found locally.`
    );
  }

  const neonCreatedById = await ensureNeonUser(
    transaction.createdById
  );

  await neonPrisma.cashTransaction.upsert({
    where: { id: transaction.id },

    create: {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      createdById: neonCreatedById,
      createdAt: transaction.createdAt,
    },

    update: {
      type: transaction.type,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      createdById: neonCreatedById,
      createdAt: transaction.createdAt,
    },
  });
}

    
/**
 * Push one local Sale from Electron -> Neon.
 *
 * Sales may have been created locally before SALE synchronization
 * existed, so this function is deliberately idempotent.
 */
async function syncSale(saleId: string) {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      items: { include: { batchConsumptions: true } },
      customerPayments: true,
    },
  });

  if (!sale) throw new Error(`Sale ${saleId} not found locally.`);

  const neonCreatedById = await ensureNeonUser(sale.createdById);

  let neonCustomerId: string | null = null;
  if (sale.customerId) {
    neonCustomerId = await syncCustomer(sale.customerId);
  }

  const neonProductIds = new Map<string, string>();
  for (const item of sale.items) {
    await syncProduct(item.productId);
    const localProduct = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!localProduct) throw new Error(`Product ${item.productId} not found locally.`);
    let neonProduct = await neonPrisma.product.findUnique({ where: { id: localProduct.id } });
    if (!neonProduct && localProduct.sku) {
      neonProduct = await neonPrisma.product.findUnique({ where: { sku: localProduct.sku } });
    }
    if (!neonProduct && localProduct.barcode) {
      neonProduct = await neonPrisma.product.findUnique({ where: { barcode: localProduct.barcode } });
    }
    if (!neonProduct) throw new Error(`Product ${localProduct.name} could not be mapped to Neon.`);
    neonProductIds.set(localProduct.id, neonProduct.id);
  }

  let existing = await neonPrisma.sale.findUnique({ where: { id: sale.id } });
  if (!existing) existing = await neonPrisma.sale.findUnique({ where: { saleNumber: sale.saleNumber } });

  const saleData = {
    saleNumber: sale.saleNumber,
    customerId: neonCustomerId,
    saleDate: sale.saleDate,
    subtotal: sale.subtotal,
    discount: sale.discount,
    totalAmount: sale.totalAmount,
    cogsAmount: sale.cogsAmount,
    paymentMethod: sale.paymentMethod,
    paymentStatus: sale.paymentStatus,
    status: sale.status,
    voidReason: sale.voidReason,
    codCollectedAt: sale.codCollectedAt,
    codCollectedById: sale.codCollectedById ? await ensureNeonUser(sale.codCollectedById) : null,
    onlineOrderNumber: sale.onlineOrderNumber,
    createdById: neonCreatedById,
    createdAt: sale.createdAt,
  };

  const neonSale = existing
    ? await neonPrisma.sale.update({ where: { id: existing.id }, data: saleData })
    : await neonPrisma.sale.create({ data: { id: sale.id, ...saleData } });

  for (const item of sale.items) {
    const neonProductId = neonProductIds.get(item.productId)!;
    const neonItem = await neonPrisma.saleItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        saleId: neonSale.id,
        productId: neonProductId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        cogsTotal: item.cogsTotal,
      },
      update: {
        saleId: neonSale.id,
        productId: neonProductId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        cogsTotal: item.cogsTotal,
      },
    });

    for (const consumption of item.batchConsumptions) {
      const neonBatch = await neonPrisma.productBatch.findUnique({ where: { id: consumption.batchId } });
      if (!neonBatch) {
        console.warn(`[sync] Skipping missing Neon batch ${consumption.batchId} for sale ${sale.saleNumber}`);
        continue;
      }
      await neonPrisma.saleItemBatchConsumption.upsert({
        where: { id: consumption.id },
        create: {
          id: consumption.id,
          saleItemId: neonItem.id,
          batchId: neonBatch.id,
          quantityConsumed: consumption.quantityConsumed,
          unitCost: consumption.unitCost,
        },
        update: {
          saleItemId: neonItem.id,
          batchId: neonBatch.id,
          quantityConsumed: consumption.quantityConsumed,
          unitCost: consumption.unitCost,
        },
      });
    }
  }

  for (const payment of sale.customerPayments) {
    const paymentCustomer = payment.customerId ? await prisma.customer.findUnique({ where: { id: payment.customerId } }) : null;
    let paymentNeonCustomerId = neonCustomerId;
    if (paymentCustomer) {
      await syncCustomer(paymentCustomer.id);
      let c = await neonPrisma.customer.findUnique({ where: { id: paymentCustomer.id } });
      if (!c && paymentCustomer.phone) c = await neonPrisma.customer.findFirst({ where: { phone: paymentCustomer.phone } });
      paymentNeonCustomerId = c?.id ?? paymentNeonCustomerId;
    }
    await neonPrisma.customerPayment.upsert({
      where: { id: payment.id },
      create: {
        id: payment.id,
        customerId: paymentNeonCustomerId,
        saleId: neonSale.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        method: payment.method,
        reference: payment.reference,
        createdById: await ensureNeonUser(payment.createdById),
        createdAt: payment.createdAt,
      },
      update: {
        customerId: paymentNeonCustomerId,
        saleId: neonSale.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        method: payment.method,
        reference: payment.reference,
        createdById: await ensureNeonUser(payment.createdById),
      },
    });
  }
}


async function syncExpense(expenseId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense) {
    throw new Error(`Expense ${expenseId} not found locally.`);
  }

  // Ensure the user who created the expense exists in Neon.
  // Expense.createdById has a foreign-key constraint to User.id.
  const createdBy = await prisma.user.findUnique({
    where: { id: expense.createdById },
  });

  if (!createdBy) {
    throw new Error(
      `Expense creator ${expense.createdById} not found locally.`
    );
  }

  let existingNeonUser = await neonPrisma.user.findUnique({
    where: { id: createdBy.id },
  });

  if (!existingNeonUser) {
    // User.roleId also references Role, so ensure the role exists first.
    const localRole = await prisma.role.findUnique({
      where: { id: createdBy.roleId },
    });

    if (!localRole) {
      throw new Error(
        `Expense creator role ${createdBy.roleId} not found locally.`
      );
    }

    let existingNeonRole = await neonPrisma.role.findUnique({
      where: { id: localRole.id },
    });

    if (!existingNeonRole) {
      existingNeonRole = await neonPrisma.role.findUnique({
        where: { name: localRole.name },
      });
    }

    if (!existingNeonRole) {
      existingNeonRole = await neonPrisma.role.create({
        data: {
          id: localRole.id,
          name: localRole.name,
          description: localRole.description,
        },
      });
    }

    existingNeonUser = await neonPrisma.user.findUnique({
      where: { username: createdBy.username },
    });

    if (!existingNeonUser) {
      existingNeonUser = await neonPrisma.user.create({
        data: {
          id: createdBy.id,
          username: createdBy.username,
          passwordHash: createdBy.passwordHash,
          fullName: createdBy.fullName,
          phone: createdBy.phone,
          roleId: existingNeonRole.id,
          isActive: createdBy.isActive,
          lastLoginAt: createdBy.lastLoginAt,
          createdAt: createdBy.createdAt,
          updatedAt: createdBy.updatedAt,
        },
      });
    }
  }

  // Ensure the referenced category exists in Neon.
  const category = await prisma.expenseCategory.findUnique({
    where: { id: expense.categoryId },
  });

  if (!category) {
    throw new Error(
      `Expense category ${expense.categoryId} not found locally.`
    );
  }

  let existingCategory = await neonPrisma.expenseCategory.findUnique({
    where: { id: category.id },
  });

  /*
   * The category may already exist in Neon with the same name
   * but a different ID. Reuse that Neon category instead of
   * attempting another INSERT and hitting the unique name constraint.
   */
  if (!existingCategory) {
    existingCategory = await neonPrisma.expenseCategory.findUnique({
      where: { name: category.name },
    });
  }

  if (!existingCategory) {
    existingCategory = await neonPrisma.expenseCategory.create({
      data: {
        id: category.id,
        name: category.name,
        isArchived: category.isArchived,
      },
    });
  }

  const existing = await neonPrisma.expense.findUnique({
    where: { id: expense.id },
  });

  /*
   * IMPORTANT:
   * The local Electron user ID may differ from the Neon user ID.
   * Always use the actual Neon user's ID for the foreign key.
   */
  const neonCreatedById = existingNeonUser?.id ?? createdBy.id;

  const data = {
    expenseNumber: expense.expenseNumber,
    categoryId: existingCategory.id,
    description: expense.description,
    amount: expense.amount,
    expenseDate: expense.expenseDate,
    paymentMethod: expense.paymentMethod,
    reference: expense.reference,
    notes: expense.notes,
    status: expense.status,
    createdById: neonCreatedById,
    createdAt: expense.createdAt,
  };

  if (existing) {
    await neonPrisma.expense.update({
      where: { id: expense.id },
      data,
    });
    return;
  }

  await neonPrisma.expense.create({
    data: {
      id: expense.id,
      ...data,
    },
  });
}

async function syncQueueItem(item: {
  entityType: string;
  entityId: string;
  operationType: string;
}) {
  switch (item.entityType) {
    case "CUSTOMER":
      await syncCustomer(item.entityId);
      return;

    case "SUPPLIER":
      await syncSupplier(item.entityId);
      return;

    case "SUPPLIER_PAYMENT":
      await syncSupplierPayment(item.entityId);
      return;

    case "BKASH_TRANSACTION":
      await syncBkashTransaction(item.entityId);
      return;

    case "CASH_TRANSACTION":
      await syncCashTransaction(item.entityId);
      return;

    case "EXPENSE":
      await syncExpense(item.entityId);
      return;

    case "RETURN":
      await syncReturn(item.entityId);
      break;

    case "SUPPLIER_RETURN":
      await syncSupplierReturn(item.entityId);
      return;

    case "PURCHASE":
      await syncPurchase(item.entityId);
      return;

    case "PRODUCT":
      await syncProduct(item.entityId);
      return;

    case "SALE":
      await syncSale(item.entityId);
      return;

    case "PRODUCT_BATCH":
      await syncProductBatch(item.entityId);
      return;

    case "STOCK_MOVEMENT":
      await syncStockMovement(item.entityId);
      return;

    default:
      throw new Error(
        `Unsupported sync entity type: ${item.entityType}`
      );
  }
}


/**
 * Ensure every local Product has a syncQueue entry.
 *
 * This makes PRODUCT synchronization reliable even when a product
 * was created/updated through a code path that did not enqueue sync.
 *
 * The actual product is always loaded from the local database by
 * syncProduct(), so the queue payload only needs the product ID.
 */
    
/**
 * Ensure every local Sale has a syncQueue entry.
 *
 * This repairs historical Electron sales that were created before
 * permanent SALE synchronization existed.
 */
async function enqueueMissingSales() {
  /*
   * Reconcile every local Electron/POS sale with Neon.
   *
   * A sale is considered synchronized only when the corresponding
   * Neon sale exists. Existing queue records are not trusted because
   * older records may have failed or become stale.
   */
  const sales = await prisma.sale.findMany({
    select: {
      id: true,
      saleNumber: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let created = 0;

  for (const sale of sales) {
    const existingNeonSale = await neonPrisma.sale.findFirst({
      where: {
        OR: [
          { id: sale.id },
          { saleNumber: sale.saleNumber },
        ],
      },
      select: {
        id: true,
      },
    });

    /*
     * The sale already exists in Neon.
     */
    if (existingNeonSale) {
      continue;
    }

    /*
     * Remove stale pending/failed queue records so this sale gets
     * a clean synchronization attempt.
     */
    await prisma.syncQueue.deleteMany({
      where: {
        entityType: "SALE",
        entityId: sale.id,
        syncStatus: {
          in: ["PENDING", "FAILED"],
        },
      },
    });

    await enqueueSync(
      "SALE",
      sale.id,
      "CREATE",
      {
        id: sale.id,
      }
    );

    created++;
  }

  if (created > 0) {
    console.log(
      `[sync] Reconciled ${created} POS sale(s) for Neon synchronization.`
    );
  }

  return created;
}

async function enqueueMissingProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const queuedProducts = await prisma.syncQueue.findMany({
    where: {
      entityType: "PRODUCT",
      syncStatus: "SYNCED",
      syncedAt: { not: null },
    },
    select: {
      entityId: true,
      syncedAt: true,
    },
    orderBy: {
      syncedAt: "desc",
    },
  });

  const lastSynced = new Map<string, Date>();

  for (const item of queuedProducts) {
    if (!lastSynced.has(item.entityId) && item.syncedAt) {
      lastSynced.set(item.entityId, item.syncedAt);
    }
  }

  const missing = products.filter((product) => {
    const syncedAt = lastSynced.get(product.id);

    // Never synced -> queue it.
    if (!syncedAt) return true;

    // Product was modified after its last successful sync -> queue it.
    return product.updatedAt > syncedAt;
  });

  if (missing.length === 0) {
    return 0;
  }

  await prisma.syncQueue.createMany({
    data: missing.map((product) => ({
      entityType: "PRODUCT",
      entityId: product.id,
      operationType: "UPDATE",
      payload: JSON.stringify({ id: product.id }),
      syncStatus: "PENDING",
    })),
  });

  return missing.length;
}

/**
 * Ensure every local Purchase has a syncQueue entry.
 *
 * Some purchase creation/update paths did not explicitly call
 * enqueueSync(). This reconciliation makes sure historical and
 * newly-created purchases are also synchronized to Neon.
 *
 * The actual purchase and its items are loaded from the local
 * database by syncPurchase(), so the queue payload only needs
 * the purchase ID.
 */
async function enqueueMissingPurchases() {
  const [purchases, queuedPurchases] =
    await Promise.all([
      prisma.purchase.findMany({
        select: {
          id: true,
        },
      }),

      prisma.syncQueue.findMany({
        where: {
          entityType: "PURCHASE",
        },
        select: {
          entityId: true,
        },
      }),
    ]);

  const queuedIds = new Set(
    queuedPurchases.map((item) => item.entityId)
  );

  let created = 0;

  for (const purchase of purchases) {
    if (queuedIds.has(purchase.id)) {
      continue;
    }

    await enqueueSync(
      "PURCHASE",
      purchase.id,
      "CREATE",
      {
        id: purchase.id,
      }
    );

    created++;
  }

  return created;
}


/**
 * Ensure every local CashTransaction has a syncQueue entry.
 *
 * Cash transactions are created from many different services
 * (sales, purchases, returns, supplier payments, expenses, salary,
 * manual cash entries, etc.). Some older code paths did not call
 * enqueueSync() directly.
 *
 * This reconciliation makes cash sync reliable for BOTH:
 *   1. existing historical local cash transactions
 *   2. newly-created cash transactions
 *
 * The actual transaction is always loaded from the local database
 * by syncCashTransaction(), so the queue payload itself is only
 * metadata.
 */

async function enqueueMissingExpenses() {
  /*
   * NETWORK-SAFE RECONCILIATION
   *
   * This function runs during every sync cycle.
   * It MUST NOT contact Neon.
   *
   * If the internet/Neon is temporarily unavailable, the sync button
   * must still be able to run and leave the records in the local queue.
   *
   * The actual Neon existence check is performed later when the queued
   * EXPENSE is processed.
   */
  const [expenses, queuedExpenses] = await Promise.all([
    prisma.expense.findMany({
      select: {
        id: true,
      },
    }),

    prisma.syncQueue.findMany({
      where: {
        entityType: "EXPENSE",
        syncStatus: {
          in: ["PENDING", "FAILED", "SYNCED"],
        },
      },
      select: {
        entityId: true,
      },
    }),
  ]);

  const queuedIds = new Set(
    queuedExpenses.map((item) => item.entityId)
  );

  let created = 0;

  for (const expense of expenses) {
    if (queuedIds.has(expense.id)) {
      continue;
    }

    await enqueueSync(
      "EXPENSE",
      expense.id,
      "CREATE",
      { id: expense.id }
    );

    created++;
  }

  if (created > 0) {
    console.log(
      `[sync] Reconciled ${created} expense(s) locally for Neon synchronization.`
    );
  }

  return created;
}

async function enqueueMissingCashTransactions() {
  const [cashTransactions, queuedCashTransactions] =
    await Promise.all([
      prisma.cashTransaction.findMany({
        select: {
          id: true,
        },
      }),

      prisma.syncQueue.findMany({
        where: {
          entityType: "CASH_TRANSACTION",
        },
        select: {
          entityId: true,
        },
      }),
    ]);

  const queuedIds = new Set(
    queuedCashTransactions.map((item) => item.entityId)
  );

  let created = 0;

  for (const transaction of cashTransactions) {
    if (queuedIds.has(transaction.id)) {
      continue;
    }

    await enqueueSync(
      "CASH_TRANSACTION",
      transaction.id,
      "CREATE",
      {
        id: transaction.id,
      }
    );

    created++;
  }

  return created;
}


/**
 * Ensure every local SupplierPayment has a syncQueue entry.
 *
 * This catches historical supplier payments that were created before
 * their syncQueue entry existed, as well as any payment created by a
 * code path that failed to enqueue synchronization.
 */
async function enqueueMissingSupplierPayments() {
  const [payments, queuedPayments] =
    await Promise.all([
      prisma.supplierPayment.findMany({
        select: {
          id: true,
        },
      }),

      prisma.syncQueue.findMany({
        where: {
          entityType: "SUPPLIER_PAYMENT",
        },
        select: {
          entityId: true,
        },
      }),
    ]);

  const queuedIds = new Set(
    queuedPayments.map((item) => item.entityId)
  );

  let created = 0;

  for (const payment of payments) {
    if (queuedIds.has(payment.id)) {
      continue;
    }

    await enqueueSync(
      "SUPPLIER_PAYMENT",
      payment.id,
      "CREATE",
      {
        id: payment.id,
      }
    );

    created++;
  }

  return created;
}


/**
 * PULL: Neon -> local SQLite
 *
 * IMPORTANT:
 * Records pulled from Neon are written directly to the local database.
 * They are deliberately NOT added to syncQueue.
 *
 * Therefore:
 *
 *     Neon -> SQLite
 *
 * does NOT become:
 *
 *     Neon -> SQLite -> Neon -> SQLite
 */
export async function pullRemoteChanges() {
  let pulled = 0;

  // ============================================================
  // SUPPLIERS
  // ============================================================

  const remoteSuppliers = await neonPrisma.supplier.findMany();

  for (const remote of remoteSuppliers) {
    const existing = await prisma.supplier.findFirst({
      where: {
        OR: [
          { id: remote.id },
          { phone: remote.phone },
        ],
      },
    });

    if (existing) {
      await prisma.supplier.update({
        where: { id: existing.id },
        data: {
          name: remote.name,
          company: remote.company,
          phone: remote.phone,
          email: remote.email,
          address: remote.address,
          notes: remote.notes,
          status: remote.status,
          updatedAt: remote.updatedAt,
        },
      });
    } else {
      await prisma.supplier.create({
        data: {
          id: remote.id,
          name: remote.name,
          company: remote.company,
          phone: remote.phone,
          email: remote.email,
          address: remote.address,
          notes: remote.notes,
          status: remote.status,
          createdAt: remote.createdAt,
          updatedAt: remote.updatedAt,
        },
      });
    }
  }

  // ============================================================
  // CUSTOMERS
  // ============================================================

  const customerMap = new Map<string, string>();
  const remoteCustomers = await neonPrisma.customer.findMany({ orderBy: { createdAt: "asc" } });

  for (const remote of remoteCustomers) {
    let existing = await prisma.customer.findUnique({ where: { id: remote.id } });
    if (!existing && remote.phone) {
      existing = await prisma.customer.findFirst({ where: { phone: remote.phone } });
    }

    if (existing) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: remote.name,
          phone: remote.phone,
          address: remote.address,
          status: remote.status,
          updatedAt: remote.updatedAt,
        },
      });
      customerMap.set(remote.id, existing.id);
    } else {
      const created = await prisma.customer.create({
        data: {
          id: remote.id,
          name: remote.name,
          phone: remote.phone,
          address: remote.address,
          status: remote.status,
          createdAt: remote.createdAt,
          updatedAt: remote.updatedAt,
        },
      });
      customerMap.set(remote.id, created.id);
    }
  }

  // ============================================================
  // CATEGORIES
  // ============================================================

  const categoryMap = new Map<string, string>();

  const remoteCategories = await neonPrisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });

  for (const remote of remoteCategories) {
    const existing = await prisma.category.findUnique({
      where: { name: remote.name },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: {
          description: remote.description,
          isArchived: remote.isArchived,
          updatedAt: remote.updatedAt,
        },
      });

      categoryMap.set(remote.id, existing.id);
    } else {
      const created = await prisma.category.create({
        data: {
          id: remote.id,
          name: remote.name,
          description: remote.description,
          isArchived: remote.isArchived,
          createdAt: remote.createdAt,
          updatedAt: remote.updatedAt,
        },
      });

      categoryMap.set(remote.id, created.id);
    }
  }

  // ============================================================
  // SUBCATEGORIES
  // ============================================================

  const subcategoryMap = new Map<string, string>();

  const remoteSubcategories =
    await neonPrisma.subcategory.findMany({
      orderBy: { createdAt: "asc" },
    });

  for (const remote of remoteSubcategories) {
    const localCategoryId = categoryMap.get(remote.categoryId);

    if (!localCategoryId) {
      console.warn(
        `[pull] Skipping subcategory ${remote.id}: category mapping missing`
      );
      continue;
    }

    const existing = await prisma.subcategory.findUnique({
      where: {
        categoryId_name: {
          categoryId: localCategoryId,
          name: remote.name,
        },
      },
    });

    if (existing) {
      await prisma.subcategory.update({
        where: { id: existing.id },
        data: {
          isArchived: remote.isArchived,
          updatedAt: remote.updatedAt,
        },
      });

      subcategoryMap.set(remote.id, existing.id);
    } else {
      const created = await prisma.subcategory.create({
        data: {
          id: remote.id,
          categoryId: localCategoryId,
          name: remote.name,
          isArchived: remote.isArchived,
          createdAt: remote.createdAt,
          updatedAt: remote.updatedAt,
        },
      });

      subcategoryMap.set(remote.id, created.id);
    }
  }

  // ============================================================
  // BRANDS
  // ============================================================

  const brandMap = new Map<string, string>();

  const remoteBrands = await neonPrisma.brand.findMany();

  for (const remote of remoteBrands) {
    const existing = await prisma.brand.findUnique({
      where: { name: remote.name },
    });

    if (existing) {
      await prisma.brand.update({
        where: { id: existing.id },
        data: {
          isArchived: remote.isArchived,
        },
      });

      brandMap.set(remote.id, existing.id);
    } else {
      const created = await prisma.brand.create({
        data: {
          id: remote.id,
          name: remote.name,
          isArchived: remote.isArchived,
        },
      });

      brandMap.set(remote.id, created.id);
    }
  }

  // ============================================================
  // UNITS
  // ============================================================

  const unitMap = new Map<string, string>();

  const remoteUnits = await neonPrisma.unit.findMany();

  for (const remote of remoteUnits) {
    const existing = await prisma.unit.findUnique({
      where: { name: remote.name },
    });

    if (existing) {
      await prisma.unit.update({
        where: { id: existing.id },
        data: {
          abbreviation: remote.abbreviation,
          isArchived: remote.isArchived,
        },
      });

      unitMap.set(remote.id, existing.id);
    } else {
      const created = await prisma.unit.create({
        data: {
          id: remote.id,
          name: remote.name,
          abbreviation: remote.abbreviation,
          isArchived: remote.isArchived,
        },
      });

      unitMap.set(remote.id, created.id);
    }
  }

  // ============================================================
  // PRODUCTS
  // IMPORTANT:
  // Neon and Electron may have different product IDs.
  // Reconcile using:
  //   1. barcode
  //   2. SKU
  //   3. ID
  //
  // Then keep Neon ID -> Electron ID in productMap.
  // ============================================================

  const productMap = new Map<string, string>();

  const remoteProducts = await neonPrisma.product.findMany({
    orderBy: { createdAt: "asc" },
  });

  for (const remote of remoteProducts) {
    const categoryId = categoryMap.get(remote.categoryId);
    const unitId = unitMap.get(remote.unitId);

    if (!categoryId || !unitId) {
      console.warn(
        `[pull] Skipping product ${remote.id}: category/unit mapping missing`
      );
      continue;
    }

    const subcategoryId = remote.subcategoryId
      ? subcategoryMap.get(remote.subcategoryId) ?? null
      : null;

    const brandId = remote.brandId
      ? brandMap.get(remote.brandId) ?? null
      : null;

    let supplierId: string | null = null;

    if (remote.defaultSupplierId) {
      const localSupplier = await prisma.supplier.findUnique({
        where: { id: remote.defaultSupplierId },
      });

      if (localSupplier) {
        supplierId = localSupplier.id;
      } else {
        const remoteSupplier = await neonPrisma.supplier.findUnique({
          where: { id: remote.defaultSupplierId },
        });

        if (remoteSupplier) {
          const matchedSupplier = await prisma.supplier.findFirst({
            where: { phone: remoteSupplier.phone },
          });

          if (matchedSupplier) {
            supplierId = matchedSupplier.id;
          }
        }
      }
    }

    // ------------------------------------------------------------
    // Resolve local product identity.
    //
    // Barcode/SKU are business identifiers and must take priority
    // over the database ID because Neon and Electron can have
    // different IDs for the same product.
    // ------------------------------------------------------------

    const existingById = await prisma.product.findUnique({
      where: { id: remote.id },
    });

    const existingByBarcode = remote.barcode
      ? await prisma.product.findUnique({
          where: { barcode: remote.barcode },
        })
      : null;

    const existingBySku = remote.sku
      ? await prisma.product.findUnique({
          where: { sku: remote.sku },
        })
      : null;

    // Barcode and SKU pointing to different local products means
    // the local database contains an actual identity conflict.
    if (
      existingByBarcode &&
      existingBySku &&
      existingByBarcode.id !== existingBySku.id
    ) {
      throw new Error(
        `Product identity conflict: Neon product "${remote.name}" ` +
        `(${remote.id}) has barcode "${remote.barcode}" mapped to ` +
        `Electron product ${existingByBarcode.id}, while SKU ` +
        `"${remote.sku}" is mapped to Electron product ${existingBySku.id}.`
      );
    }

    // IMPORTANT:
    // Prefer barcode, then SKU, then ID.
    const existing =
      existingByBarcode ??
      existingBySku ??
      existingById ??
      null;

    const data = {
      name: remote.name,
      imageUrl: remote.imageUrl,
      categoryId,
      subcategoryId,
      brandId,
      sku: remote.sku,
      barcode: remote.barcode,
      unitId,
      packSize: remote.packSize,
      expiryDate: remote.expiryDate,
      purchasePrice: remote.purchasePrice,
      sellingPrice: remote.sellingPrice,
      wholesalePrice: remote.wholesalePrice,
      minimumStock: remote.minimumStock,
      currentStock: remote.currentStock,
      description: remote.description,
      status: remote.status,
      defaultSupplierId: supplierId,
      updatedAt: remote.updatedAt,
    };

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data,
      });

      productMap.set(remote.id, existing.id);

      console.log(
        `[pull] Product mapped Neon ${remote.id} -> Electron ${existing.id}` +
        `${remote.barcode ? ` barcode=${remote.barcode}` : ""}`
      );
    } else {
      await prisma.product.create({
        data: {
          id: remote.id,
          ...data,
          createdAt: remote.createdAt,
        },
      });

      productMap.set(remote.id, remote.id);

      console.log(
        `[pull] Product created ${remote.id}` +
        `${remote.barcode ? ` barcode=${remote.barcode}` : ""}`
      );
    }
  }

  // ============================================================
  // USERS
  // ============================================================

  const remoteUsers = await neonPrisma.user.findMany();

  for (const remote of remoteUsers) {
    const existing = await prisma.user.findUnique({
      where: { id: remote.id },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          username: remote.username,
          passwordHash: remote.passwordHash,
          fullName: remote.fullName,
          phone: remote.phone,
          isActive: remote.isActive,
          lastLoginAt: remote.lastLoginAt,
          updatedAt: remote.updatedAt,
        },
      });
    }
  }

  // ============================================================
  // CASH TRANSACTIONS
  // IMPORTANT: Neon can contain cash entries created by the online POS.
  // Electron previously only PUSHED cash transactions to Neon, but did
  // not PULL remote cash transactions back into SQLite. That made the
  // Electron cash balance smaller than the online balance.
  //
  // Pulled rows are written directly and marked as PULL/SYNCED so the
  // local reconciliation does not enqueue them again.
  // ============================================================

  const remoteCashTransactions = await neonPrisma.cashTransaction.findMany({
    orderBy: { createdAt: "asc" },
  });

  for (const remote of remoteCashTransactions) {
    let localCreatedById: string | null = null;

    const localUserById = await prisma.user.findUnique({
      where: { id: remote.createdById },
      select: { id: true },
    });

    if (localUserById) {
      localCreatedById = localUserById.id;
    } else {
      const remoteUser = await neonPrisma.user.findUnique({
        where: { id: remote.createdById },
        select: { username: true },
      });

      if (remoteUser) {
        const localUserByUsername = await prisma.user.findUnique({
          where: { username: remoteUser.username },
          select: { id: true },
        });

        if (localUserByUsername) {
          localCreatedById = localUserByUsername.id;
        }
      }
    }

    if (!localCreatedById) {
      console.warn(
        `[pull] Skipping cash transaction ${remote.id}: creator mapping missing`
      );
      continue;
    }

    await prisma.cashTransaction.upsert({
      where: { id: remote.id },
      create: {
        id: remote.id,
        type: remote.type,
        amount: remote.amount,
        transactionDate: remote.transactionDate,
        note: remote.note,
        createdById: localCreatedById,
        createdAt: remote.createdAt,
      },
      update: {
        type: remote.type,
        amount: remote.amount,
        transactionDate: remote.transactionDate,
        note: remote.note,
        createdById: localCreatedById,
        createdAt: remote.createdAt,
      },
    });

    const existingPullMarker = await prisma.syncQueue.findFirst({
      where: {
        entityType: "CASH_TRANSACTION",
        entityId: remote.id,
      },
      select: { id: true },
    });

    if (!existingPullMarker) {
      await prisma.syncQueue.create({
        data: {
          entityType: "CASH_TRANSACTION",
          entityId: remote.id,
          operationType: "PULL",
          payload: JSON.stringify({ source: "NEON", remoteId: remote.id }),
          syncStatus: "SYNCED",
          syncedAt: new Date(),
        },
      });
    }

    pulled++;
  }

  // ============================================================
  // SALES
  // IMPORTANT: pull sales before purchases only for the sale records;
  // sale items/batch consumptions are completed after batches exist.
  // ============================================================

  const remoteSales = await neonPrisma.sale.findMany({
    include: {
      items: { include: { batchConsumptions: true } },
      customerPayments: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const saleMap = new Map<string, string>();
  const pendingRemoteSaleItems = remoteSales;

  for (const remote of remoteSales) {
    let user = await prisma.user.findUnique({ where: { id: remote.createdById } });
    if (!user) {
      const remoteUser = await neonPrisma.user.findUnique({ where: { id: remote.createdById } });
      if (remoteUser) user = await prisma.user.findUnique({ where: { username: remoteUser.username } });
    }
    if (!user) {
      console.warn(`[pull] Skipping sale ${remote.saleNumber}: creator mapping missing`);
      continue;
    }

    const localCustomerId = remote.customerId
      ? customerMap.get(remote.customerId) ?? remote.customerId
      : null;

    if (localCustomerId) {
      const customer = await prisma.customer.findUnique({ where: { id: localCustomerId } });
      if (!customer) {
        console.warn(`[pull] Skipping sale ${remote.saleNumber}: customer mapping missing`);
        continue;
      }
    }

    let existing = await prisma.sale.findUnique({ where: { id: remote.id } });
    if (!existing) existing = await prisma.sale.findUnique({ where: { saleNumber: remote.saleNumber } });

    // Resolve the COD collector from Neon to the LOCAL Electron user.
    // Never copy a Neon user ID directly into the local database.
    let localCodCollectedById: string | null = null;

    if (remote.codCollectedById) {
      let codUser = await prisma.user.findUnique({
        where: { id: remote.codCollectedById },
      });

      if (!codUser) {
        const remoteCodUser = await neonPrisma.user.findUnique({
          where: { id: remote.codCollectedById },
        });

        if (remoteCodUser) {
          codUser = await prisma.user.findUnique({
            where: { username: remoteCodUser.username },
          });
        }
      }

      if (codUser) {
        localCodCollectedById = codUser.id;
      } else {
        console.warn(
          `[pull] COD collector ${remote.codCollectedById} could not be mapped locally for sale ${remote.saleNumber}; saving null.`
        );
      }
    }

    const saleData = {
      saleNumber: remote.saleNumber,
      customerId: localCustomerId,
      saleDate: remote.saleDate,
      subtotal: remote.subtotal,
      discount: remote.discount,
      totalAmount: remote.totalAmount,
      cogsAmount: remote.cogsAmount,
      paymentMethod: remote.paymentMethod,
      paymentStatus: remote.paymentStatus,
      status: remote.status,
      voidReason: remote.voidReason,
      codCollectedAt: remote.codCollectedAt,
      codCollectedById: localCodCollectedById,
      onlineOrderNumber: remote.onlineOrderNumber,
      createdById: user.id,
      createdAt: remote.createdAt,
    };

    if (existing) {
      await prisma.sale.update({ where: { id: existing.id }, data: saleData });
      saleMap.set(remote.id, existing.id);
    } else {
      const created = await prisma.sale.create({ data: { id: remote.id, ...saleData } });
      saleMap.set(remote.id, created.id);
    }

    // Mark the remote sale as already synchronized locally so the
    // reconciliation pass never re-queues it for Electron -> Neon.
    const alreadyMarked = await prisma.syncQueue.findFirst({
      where: { entityType: "SALE", entityId: saleMap.get(remote.id)!, syncStatus: "SYNCED" },
    });
    if (!alreadyMarked) {
      await prisma.syncQueue.create({
        data: {
          entityType: "SALE",
          entityId: saleMap.get(remote.id)!,
          operationType: "PULL",
          payload: JSON.stringify({ source: "NEON", remoteId: remote.id }),
          syncStatus: "SYNCED",
          syncedAt: new Date(),
        },
      });
    }

    pulled++;
  }

  // ============================================================
  // PURCHASES
  // IMPORTANT: PURCHASES BEFORE BATCHES
  // ============================================================

  const remotePurchases = await neonPrisma.purchase.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // IMPORTANT:
  // Neon purchase IDs and Electron purchase IDs can be different.
  // We reconcile by:
  //   1. ID
  //   2. purchaseNumber
  //
  // Then every dependent record (batches/items) uses the LOCAL ID.
  const purchaseMap = new Map<string, string>();

  for (const remote of remotePurchases) {
    let supplier = await prisma.supplier.findUnique({
      where: { id: remote.supplierId },
    });

    if (!supplier) {
      const remoteSupplier =
        await neonPrisma.supplier.findUnique({
          where: { id: remote.supplierId },
        });

      if (remoteSupplier) {
        supplier = await prisma.supplier.findFirst({
          where: {
            phone: remoteSupplier.phone,
          },
        });
      }
    }

    let user = await prisma.user.findUnique({
      where: { id: remote.createdById },
    });

    if (!user) {
      const remoteUser = await neonPrisma.user.findUnique({
        where: { id: remote.createdById },
      });

      if (remoteUser) {
        user = await prisma.user.findUnique({
          where: {
            username: remoteUser.username,
          },
        });
      }
    }

    if (!supplier || !user) {
      console.warn(
        `[pull] Skipping purchase ${remote.purchaseNumber}: supplier/user mapping missing`
      );
      continue;
    }

    /*
     * IMPORTANT:
     * Do NOT use upsert(where: { id: remote.id }).
     *
     * A purchase may already exist locally with the same
     * purchaseNumber but a different ID.
     */

    let existingPurchase = await prisma.purchase.findUnique({
      where: { id: remote.id },
    });

    if (!existingPurchase) {
      existingPurchase = await prisma.purchase.findUnique({
        where: {
          purchaseNumber: remote.purchaseNumber,
        },
      });
    }

    const purchaseData = {
      purchaseNumber: remote.purchaseNumber,
      supplierId: supplier.id,
      invoiceNumber: remote.invoiceNumber,
      purchaseDate: remote.purchaseDate,
      totalAmount: remote.totalAmount,
      paidAmount: remote.paidAmount,
      dueAmount: remote.dueAmount,
      paymentStatus: remote.paymentStatus,
      status: remote.status,
      voidReason: remote.voidReason,
      createdById: user.id,
    };

    if (existingPurchase) {
      await prisma.purchase.update({
        where: {
          id: existingPurchase.id,
        },
        data: purchaseData,
      });

      // Neon ID -> LOCAL Electron ID
      purchaseMap.set(remote.id, existingPurchase.id);

      console.log(
        `[pull] Purchase reconciled: Neon ${remote.id} -> Electron ${existingPurchase.id} (${remote.purchaseNumber})`
      );
    } else {
      const createdPurchase = await prisma.purchase.create({
        data: {
          id: remote.id,
          ...purchaseData,
          createdAt: remote.createdAt,
        },
      });

      purchaseMap.set(remote.id, createdPurchase.id);

      console.log(
        `[pull] Purchase created: ${remote.id} (${remote.purchaseNumber})`
      );
    }

    pulled++;
  }

  // ============================================================
  // PRODUCT BATCHES
  // IMPORTANT: AFTER PURCHASES
  // ============================================================

  const remoteBatches =
    await neonPrisma.productBatch.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

  for (const remote of remoteBatches) {
    // Resolve Neon product ID to the actual Electron product ID.
    const localProductId =
      productMap.get(remote.productId) ?? remote.productId;

    const product = await prisma.product.findUnique({
      where: { id: localProductId },
    });

    if (!product) {
      console.warn(
        `[pull] Skipping batch ${remote.id}: product mapping missing ` +
        `(Neon product ${remote.productId})`
      );
      continue;
    }

    // IMPORTANT:
    // ProductBatch.purchaseId must use the LOCAL Electron purchase ID.
    // Never use remote.purchaseId directly.
    const localPurchaseId = remote.purchaseId
      ? purchaseMap.get(remote.purchaseId) ?? null
      : null;

    if (remote.purchaseId && !localPurchaseId) {
      console.warn(
        `[pull] Skipping batch ${remote.id}: purchase mapping missing for Neon purchase ${remote.purchaseId}`
      );
      continue;
    }

    let supplierId = remote.supplierId;

    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });

      if (!supplier) {
        supplierId = null;
      }
    }

    await prisma.productBatch.upsert({
      where: { id: remote.id },
      create: {
        id: remote.id,
        productId: product.id,
        supplierId,
        purchaseId: localPurchaseId,
        batchCode: remote.batchCode,
        purchaseDate: remote.purchaseDate,
        manufacturingDate: remote.manufacturingDate,
        quantityReceived: remote.quantityReceived,
        remainingQuantity: remote.remainingQuantity,
        quantityReturned: remote.quantityReturned,
        purchasePrice: remote.purchasePrice,
        expiryDate: remote.expiryDate,
        purchaseInvoiceNumber: remote.purchaseInvoiceNumber,
        notes: remote.notes,
        status: remote.status,
        createdAt: remote.createdAt,
        updatedAt: remote.updatedAt,
        sellingPrice: remote.sellingPrice,
      },
      update: {
        productId: product.id,
        supplierId,
        purchaseId: localPurchaseId,
        batchCode: remote.batchCode,
        purchaseDate: remote.purchaseDate,
        manufacturingDate: remote.manufacturingDate,
        quantityReceived: remote.quantityReceived,
        remainingQuantity: remote.remainingQuantity,
        quantityReturned: remote.quantityReturned,
        purchasePrice: remote.purchasePrice,
        expiryDate: remote.expiryDate,
        purchaseInvoiceNumber: remote.purchaseInvoiceNumber,
        notes: remote.notes,
        status: remote.status,
        updatedAt: remote.updatedAt,
        sellingPrice: remote.sellingPrice,
      },
    });
  }

  // ============================================================
  // SALE ITEMS + BATCH CONSUMPTIONS
  // ============================================================

  for (const remote of pendingRemoteSaleItems) {
    const localSaleId = saleMap.get(remote.id);
    if (!localSaleId) continue;

    for (const item of remote.items) {
      const localProductId = productMap.get(item.productId) ?? item.productId;
      const product = await prisma.product.findUnique({ where: { id: localProductId } });
      if (!product) {
        console.warn(`[pull] Skipping sale item ${item.id}: product mapping missing`);
        continue;
      }

      const localSaleItem = await prisma.saleItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          saleId: localSaleId,
          productId: product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          subtotal: item.subtotal,
          cogsTotal: item.cogsTotal,
        },
        update: {
          saleId: localSaleId,
          productId: product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          subtotal: item.subtotal,
          cogsTotal: item.cogsTotal,
        },
      });

      for (const consumption of item.batchConsumptions) {
        const batch = await prisma.productBatch.findUnique({ where: { id: consumption.batchId } });
        if (!batch) {
          console.warn(`[pull] Skipping sale batch consumption ${consumption.id}: batch missing`);
          continue;
        }
        await prisma.saleItemBatchConsumption.upsert({
          where: { id: consumption.id },
          create: {
            id: consumption.id,
            saleItemId: localSaleItem.id,
            batchId: batch.id,
            quantityConsumed: consumption.quantityConsumed,
            unitCost: consumption.unitCost,
          },
          update: {
            saleItemId: localSaleItem.id,
            batchId: batch.id,
            quantityConsumed: consumption.quantityConsumed,
            unitCost: consumption.unitCost,
          },
        });
      }
    }

    for (const payment of remote.customerPayments) {
      const localCustomerId = payment.customerId
        ? customerMap.get(payment.customerId) ?? payment.customerId
        : null;
      if (localCustomerId) {
        const customer = await prisma.customer.findUnique({ where: { id: localCustomerId } });
        if (!customer) continue;
      }
      let user = await prisma.user.findUnique({ where: { id: payment.createdById } });
      if (!user) {
        const remoteUser = await neonPrisma.user.findUnique({ where: { id: payment.createdById } });
        if (remoteUser) user = await prisma.user.findUnique({ where: { username: remoteUser.username } });
      }
      if (!user) continue;

      await prisma.customerPayment.upsert({
        where: { id: payment.id },
        create: {
          id: payment.id,
          customerId: localCustomerId,
          saleId: localSaleId,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          method: payment.method,
          reference: payment.reference,
          createdById: user.id,
          createdAt: payment.createdAt,
        },
        update: {
          customerId: localCustomerId,
          saleId: localSaleId,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          method: payment.method,
          reference: payment.reference,
          createdById: user.id,
        },
      });
    }
  }

  // ============================================================
  // PURCHASE ITEMS
  // ============================================================

  for (const remote of remotePurchases) {
    // IMPORTANT:
    // Use the reconciled LOCAL Electron purchase ID.
    const localPurchaseId = purchaseMap.get(remote.id);

    if (!localPurchaseId) {
      console.warn(
        `[pull] Skipping purchase items for ${remote.purchaseNumber}: purchase mapping missing`
      );
      continue;
    }

    for (const item of remote.items) {
      // Purchase items come from Neon and may contain the Neon
      // product ID. Resolve it to the actual Electron product ID.
      const localProductId =
        productMap.get(item.productId) ?? item.productId;

      const product = await prisma.product.findUnique({
        where: { id: localProductId },
      });

      if (!product) {
        console.warn(
          `[pull] Skipping purchase item ${item.id}: product mapping missing ` +
          `(Neon product ${item.productId})`
        );
        continue;
      }

      let batchId: string | null = null;

      if (item.batchId) {
        const batch = await prisma.productBatch.findUnique({
          where: { id: item.batchId },
        });

        if (!batch) {
          console.warn(
            `[pull] Skipping purchase item ${item.id}: batch missing`
          );
          continue;
        }

        batchId = batch.id;
      }

      await prisma.purchaseItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          purchaseId: localPurchaseId,
          productId: product.id,
          batchId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          total: item.total,
        },
        update: {
          purchaseId: localPurchaseId,
          productId: product.id,
          batchId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          total: item.total,
        },
      });
    }
  }


  // ============================================================
  // NEON -> ELECTRON CUSTOMER RETURN PULL
  //
  // Customer returns can be created from the online portal.
  // They must also appear in the Electron SQLite database.
  //
  // This is intentionally idempotent:
  // - existing returns are updated
  // - missing returns are created
  // - ReturnItems are upserted
  // - pulled returns are marked SYNCED so they are NOT pushed
  // back to Neon again.
  // ============================================================

  const remoteReturns = await neonPrisma.return.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  for (const remote of remoteReturns) {
    // ----------------------------------------------------------
    // Resolve the LOCAL sale.
    // ----------------------------------------------------------
    let localSale = await prisma.sale.findUnique({
      where: { id: remote.saleId },
    });

    if (!localSale) {
      const remoteSale = await neonPrisma.sale.findUnique({
        where: { id: remote.saleId },
        select: { saleNumber: true },
      });

      if (remoteSale) {
        localSale = await prisma.sale.findUnique({
          where: { saleNumber: remoteSale.saleNumber },
        });
      }
    }

    if (!localSale) {
      console.warn(
        `[pull] Skipping return ${remote.returnNumber}: sale mapping missing`
      );
      continue;
    }

    // ----------------------------------------------------------
    // Resolve LOCAL customer.
    // ----------------------------------------------------------
    let localCustomerId: string | null = null;

    if (remote.customerId) {
      let localCustomer = await prisma.customer.findUnique({
        where: { id: remote.customerId },
      });

      if (!localCustomer) {
        const remoteCustomer = await neonPrisma.customer.findUnique({
          where: { id: remote.customerId },
        });

        if (remoteCustomer?.phone) {
          localCustomer = await prisma.customer.findFirst({
            where: { phone: remoteCustomer.phone },
          });
        }
      }

      if (localCustomer) {
        localCustomerId = localCustomer.id;
      }
    }

    // ----------------------------------------------------------
    // Resolve LOCAL creator/user.
    // ----------------------------------------------------------
    let localCreatedBy = await prisma.user.findUnique({
      where: { id: remote.createdById },
    });

    if (!localCreatedBy) {
      const remoteUser = await neonPrisma.user.findUnique({
        where: { id: remote.createdById },
      });

      if (remoteUser) {
        localCreatedBy = await prisma.user.findUnique({
          where: { username: remoteUser.username },
        });
      }
    }

    if (!localCreatedBy) {
      console.warn(
        `[pull] Skipping return ${remote.returnNumber}: creator mapping missing`
      );
      continue;
    }

    // ----------------------------------------------------------
    // Upsert RETURN header.
    // Match by ID first, then by returnNumber.
    // ----------------------------------------------------------
    let localReturn = await prisma.return.findUnique({
      where: { id: remote.id },
    });

    if (!localReturn) {
      localReturn = await prisma.return.findUnique({
        where: { returnNumber: remote.returnNumber },
      });
    }

    if (localReturn) {
      localReturn = await prisma.return.update({
        where: { id: localReturn.id },
        data: {
          returnNumber: remote.returnNumber,
          saleId: localSale.id,
          customerId: localCustomerId,
          returnDate: remote.returnDate,
          totalRefund: remote.totalRefund,
          reason: remote.reason,
          createdById: localCreatedBy.id,
          createdAt: remote.createdAt,
        },
      });
    } else {
      localReturn = await prisma.return.create({
        data: {
          id: remote.id,
          returnNumber: remote.returnNumber,
          saleId: localSale.id,
          customerId: localCustomerId,
          returnDate: remote.returnDate,
          totalRefund: remote.totalRefund,
          reason: remote.reason,
          createdById: localCreatedBy.id,
          createdAt: remote.createdAt,
        },
      });
    }

    // ----------------------------------------------------------
    // Pull every ReturnItem.
    // ----------------------------------------------------------
    for (const remoteItem of remote.items) {
      // Product mapping.
      let localProduct = await prisma.product.findUnique({
        where: { id: remoteItem.productId },
      });

      if (!localProduct) {
        const remoteProduct = await neonPrisma.product.findUnique({
          where: { id: remoteItem.productId },
          select: {
            id: true,
            name: true,
          },
        });

        if (remoteProduct) {
          localProduct = await prisma.product.findFirst({
            where: { name: remoteProduct.name },
          });
        }
      }

      if (!localProduct) {
        console.warn(
          `[pull] Skipping ReturnItem ${remoteItem.id}: product mapping missing`
        );
        continue;
      }

      // SaleItem should normally have the same ID because sale pulling
      // preserves the remote SaleItem ID. Fall back to product + sale.
      let localSaleItem = await prisma.saleItem.findUnique({
        where: { id: remoteItem.saleItemId },
      });

      if (!localSaleItem) {
        localSaleItem = await prisma.saleItem.findFirst({
          where: {
            saleId: localSale.id,
            productId: localProduct.id,
          },
          orderBy: {
            id: "asc",
          },
        });
      }

      if (!localSaleItem) {
        console.warn(
          `[pull] Skipping ReturnItem ${remoteItem.id}: sale item mapping missing`
        );
        continue;
      }

      // targetBatchId is optional. Only use it if that batch exists locally.
      let localTargetBatchId: string | null = null;

      if (remoteItem.targetBatchId) {
        const localBatch = await prisma.productBatch.findUnique({
          where: { id: remoteItem.targetBatchId },
          select: { id: true },
        });

        if (localBatch) {
          localTargetBatchId = localBatch.id;
        }
      }

      await prisma.returnItem.upsert({
        where: {
          id: remoteItem.id,
        },
        create: {
          id: remoteItem.id,
          returnId: localReturn.id,
          saleItemId: localSaleItem.id,
          productId: localProduct.id,
          quantity: remoteItem.quantity,
          condition: remoteItem.condition,
          refundAmount: remoteItem.refundAmount,
          targetBatchId: localTargetBatchId,
        },
        update: {
          returnId: localReturn.id,
          saleItemId: localSaleItem.id,
          productId: localProduct.id,
          quantity: remoteItem.quantity,
          condition: remoteItem.condition,
          refundAmount: remoteItem.refundAmount,
          targetBatchId: localTargetBatchId,
        },
      });
    }

    // ----------------------------------------------------------
    // Prevent the pulled return from being sent back to Neon.
    // ----------------------------------------------------------
    await prisma.syncQueue.deleteMany({
      where: {
        entityType: "RETURN",
        entityId: localReturn.id,
        syncStatus: {
          in: ["PENDING", "FAILED"],
        },
      },
    });

    await prisma.syncQueue.upsert({
      where: {
        id: `pull-return-${localReturn.id}`,
      },
      create: {
        id: `pull-return-${localReturn.id}`,
        entityType: "RETURN",
        entityId: localReturn.id,
        operationType: "PULL",
        payload: JSON.stringify({
          id: localReturn.id,
          source: "NEON",
        }),
        syncStatus: "SYNCED",
        syncedAt: new Date(),
      },
      update: {
        syncStatus: "SYNCED",
        syncedAt: new Date(),
        errorMessage: null,
      },
    });

    pulled++;

    console.log(
      `[pull] RETURN ${remote.returnNumber} -> Electron OK`
    );
  }

  return {
    pulled,
  };
}


/**
 * Reconcile bKash transactions from Neon -> Electron.
 *
 * IMPORTANT:
 * syncBkashTransaction() handles Electron -> Neon only.
 * This reconciliation handles the opposite direction so that a
 * transaction created online (for example a supplier cash refund)
 * cannot leave the two bKash ledgers permanently different.
 *
 * The operation is idempotent:
 * - existing local transaction IDs are updated, never duplicated
 * - missing Neon transactions are inserted locally
 * - remote user IDs are mapped to local users by username
 */
async function reconcileNeonBkashTransactions() {
  const remoteTransactions = await neonPrisma.bkashTransaction.findMany({
    orderBy: {
      transactionDate: "asc",
    },
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const remote of remoteTransactions) {
    /*
     * The local database can have different user IDs from Neon.
     * Resolve the Neon creator to the corresponding local user.
     */
    let localUser = await prisma.user.findUnique({
      where: { id: remote.createdById },
    });

    if (!localUser) {
      const remoteUser = await neonPrisma.user.findUnique({
        where: { id: remote.createdById },
        select: {
          username: true,
        },
      });

      if (remoteUser?.username) {
        localUser = await prisma.user.findUnique({
          where: {
            username: remoteUser.username,
          },
        });
      }
    }

    if (!localUser) {
      console.warn(
        `[sync] Cannot pull bKash transaction ${remote.id}: ` +
        `local creator user could not be resolved.`
      );
      skipped++;
      continue;
    }

    const existing = await prisma.bkashTransaction.findUnique({
      where: {
        id: remote.id,
      },
    });

    if (existing) {
      /*
       * Keep the local ledger identical to Neon for the same
       * transaction ID. Do not create a second transaction.
       */
      await prisma.bkashTransaction.update({
        where: {
          id: remote.id,
        },
        data: {
          type: remote.type,
          amount: remote.amount,
          transactionDate: remote.transactionDate,
          note: remote.note,
          createdById: localUser.id,
          createdAt: remote.createdAt,
          updatedAt: remote.updatedAt,
        },
      });

      updated++;
      continue;
    }

    /*
     * Missing locally -> create it with the SAME transaction ID.
     * This is what repairs the existing SR-000001 +৳500 refund.
     */
    await prisma.bkashTransaction.create({
      data: {
        id: remote.id,
        type: remote.type,
        amount: remote.amount,
        transactionDate: remote.transactionDate,
        note: remote.note,
        createdById: localUser.id,
        createdAt: remote.createdAt,
        updatedAt: remote.updatedAt,
      },
    });

    /*
     * Mark the pulled transaction as synchronized locally so the
     * normal Electron -> Neon queue does not try to push it back.
     */
    await prisma.syncQueue.deleteMany({
      where: {
        entityType: "BKASH_TRANSACTION",
        entityId: remote.id,
        syncStatus: {
          in: ["PENDING", "FAILED"],
        },
      },
    });

    await prisma.syncQueue.create({
      data: {
        entityType: "BKASH_TRANSACTION",
        entityId: remote.id,
        operationType: "PULL",
        payload: JSON.stringify({
          id: remote.id,
          source: "NEON",
        }),
        syncStatus: "SYNCED",
        syncedAt: new Date(),
      },
    });

    created++;
  }

  if (created || updated || skipped) {
    console.log(
      `[sync] bKash reconciliation: ` +
      `${created} created locally, ${updated} updated, ${skipped} skipped.`
    );
  }

  return {
    created,
    updated,
    skipped,
  };
}

export async function syncPendingChanges() {
  /*
   * Reconcile the Neon bKash ledger first.
   *
   * This prevents legitimate online transactions such as supplier
   * refund cash-ins from being absent from the Electron balance.
   */
  try {
    await reconcileNeonBkashTransactions();
  } catch (error) {
    console.warn(
      "[sync] Neon -> Electron bKash reconciliation failed:",
      error
    );
  }

  /*
   * POS -> Neon synchronization.
   *
   * Always reconcile local sales first, then drain the queue.
   * A single failed item must never prevent the remaining POS data
   * from reaching Neon.
   */
  // Sales reconciliation performs remote Neon lookups. A temporary
  // Neon connection failure must not crash the entire sync cycle.
  try {
    await enqueueMissingSales();
  } catch (error) {
    console.warn(
      "[sync] Sales reconciliation skipped because Neon is temporarily unavailable:",
      error
    );
  }

  await enqueueMissingProducts();
  await enqueueMissingPurchases();
  await enqueueMissingExpenses();
  await enqueueMissingReturns();
  await enqueueMissingCashTransactions();
  await enqueueMissingSupplierPayments();

  let synced = 0;
  let failed = 0;

  /*
   * Drain multiple batches so a large number of POS sales can be
   * synchronized in the same sync cycle.
   */
  for (let pass = 0; pass < 20; pass++) {
    const items = await prisma.syncQueue.findMany({
      where: {
        syncStatus: {
          in: ["PENDING", "FAILED"],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: BATCH_SIZE,
    });

    if (items.length === 0) {
      break;
    }

    for (const item of items) {
      try {
        await prisma.syncQueue.update({
          where: { id: item.id },
          data: {
            syncStatus: "SYNCING",
            errorMessage: null,
          },
        });

        await syncQueueItem(item);

        await prisma.syncQueue.update({
          where: { id: item.id },
          data: {
            syncStatus: "SYNCED",
            syncedAt: new Date(),
            errorMessage: null,
          },
        });

        synced++;

        console.log(
          `[sync] ${item.entityType} ${item.entityId} -> Neon OK`
        );
      } catch (error) {
        failed++;

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        await prisma.syncQueue.update({
          where: { id: item.id },
          data: {
            syncStatus: "FAILED",
            errorMessage: message,
          },
        });

        console.error(
          `[sync] ${item.entityType} ${item.entityId} -> Neon FAILED: ${message}`
        );
      }
    }

    /*
     * If this batch contained only failed records, don't spin forever.
     */
    if (items.every(async () => false)) {
      break;
    }
  }

  const pending = await prisma.syncQueue.count({
    where: {
      syncStatus: {
        in: ["PENDING", "FAILED", "SYNCING"],
      },
    },
  });

  console.log(
    `[sync] completed: synced=${synced}, failed=${failed}, pending=${pending}`
  );

  return {
    synced,
    failed,
    pending,
  };
}
