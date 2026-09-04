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


async function syncCustomer(customerId: string): Promise<string> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error(`Customer ${customerId} not found locally.`);
  }

  // First prefer the stable local/Neon ID.
  const existingById = await neonPrisma.customer.findUnique({
    where: { id: customer.id },
  });

  if (existingById) {
    await neonPrisma.customer.update({
      where: { id: existingById.id },
      data: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        updatedAt: customer.updatedAt,
      },
    });

    return existingById.id;
  }

  // If the ID does not exist in Neon, reuse an existing customer
  // with the same unique phone number instead of creating a duplicate.
  if (customer.phone) {
    const existingByPhone = await neonPrisma.customer.findUnique({
      where: { phone: customer.phone },
    });

    if (existingByPhone) {
      await neonPrisma.customer.update({
        where: { id: existingByPhone.id },
        data: {
          name: customer.name,
          address: customer.address,
          status: customer.status,
          updatedAt: customer.updatedAt,
        },
      });

      console.log(
        `[sync] Customer reconciled by phone: Electron ${customer.id} -> Neon ${existingByPhone.id} (${customer.phone})`
      );

      return existingByPhone.id;
    }
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


async function syncMembership(membershipId: string) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  });

  if (!membership) {
    throw new Error(`Membership ${membershipId} not found locally.`);
  }

  /*
   * Membership belongs to a Customer.
   *
   * IMPORTANT:
   * Local SQLite IDs and Neon IDs can differ, so always use the
   * customer ID returned by syncCustomer() for the Neon membership.
   */
  const neonCustomerId = await syncCustomer(membership.customerId);

  /*
   * Reconcile an existing Neon membership using every stable identity
   * available to us.
   *
   * Order:
   *   1. exact ID
   *   2. membership number
   *   3. customer ID
   *
   * customerId is UNIQUE in the Membership table, so checking it is
   * essential before attempting a create.
   */
  let existing = await neonPrisma.membership.findUnique({
    where: { id: membership.id },
  });

  if (!existing) {
    existing = await neonPrisma.membership.findUnique({
      where: {
        membershipNumber: membership.membershipNumber,
      },
    });

    if (existing) {
      console.log(
        `[sync] Membership reconciled by number: ` +
        `Electron ${membership.id} -> Neon ${existing.id} ` +
        `(${membership.membershipNumber})`
      );
    }
  }

  if (!existing) {
    existing = await neonPrisma.membership.findUnique({
      where: {
        customerId: neonCustomerId,
      },
    });

    if (existing) {
      console.log(
        `[sync] Membership reconciled by customer: ` +
        `Electron ${membership.id} -> Neon ${existing.id} ` +
        `(customer ${neonCustomerId})`
      );
    }
  }

  const membershipData = {
    membershipNumber: membership.membershipNumber,
    customerId: neonCustomerId,
    tier: membership.tier,
    discountPercent: membership.discountPercent,
    issueDate: membership.issueDate,
    expiryDate: membership.expiryDate,
    status: membership.status,
    qrCodeData: membership.qrCodeData,
    updatedAt: membership.updatedAt,
  };

  /*
   * Existing Neon membership:
   * update the actual Neon row we reconciled above.
   */
  if (existing) {
    await neonPrisma.membership.update({
      where: { id: existing.id },
      data: membershipData,
    });

    return;
  }

  /*
   * No existing membership found by any stable identity.
   * This is a genuinely new membership, so create it with the
   * local ID while preserving the Neon customer relationship.
   */
  await neonPrisma.membership.create({
    data: {
      id: membership.id,
      ...membershipData,
      createdAt: membership.createdAt,
    },
  });
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

    return neonProduct.id;
  }

  const created = await neonPrisma.product.create({
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
    const neonProductId = await syncProduct(item.productId);

    let neonBatchId: string | null = null;

    if (item.batchId) {
      // The purchase item references this batch, so make sure
      // the batch exists in Neon before creating/updating the item.
      neonBatchId = await syncProductBatch(item.batchId);
    }

    await neonPrisma.purchaseItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        purchaseId: neonPurchaseId,
        productId: neonProductId,
        batchId: neonBatchId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        total: item.total,
      },
      update: {
        purchaseId: neonPurchaseId,
        productId: neonProductId,
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

  const neonProductId = await syncProduct(
    supplierReturn.productId
  );

  const neonBatchId = await syncProductBatch(
    supplierReturn.batchId
  );

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
      productId: neonProductId,
      batchId: neonBatchId,
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
      productId: neonProductId,
      batchId: neonBatchId,
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

  const neonProductId = await syncProduct(
    batch.productId
  );

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
      productId: neonProductId,
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
      productId: neonProductId,
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

  const neonBatch = await neonPrisma.productBatch.findFirst({
    where: {
      OR: [
        { id: batch.id },
        {
          productId: neonProductId,
          batchCode: batch.batchCode,
        },
      ],
    },
    select: { id: true },
  });

  if (!neonBatch) {
    throw new Error(
      `ProductBatch ${batch.batchCode} was not found in Neon after synchronization.`
    );
  }

  return neonBatch.id;
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

  const neonProductId = await syncProduct(
    movement.productId
  );

  let neonBatchId: string | null = null;

  if (movement.batchId) {
    neonBatchId = await syncProductBatch(
      movement.batchId
    );
  }

  const neonUserId = await ensureNeonUser(
    movement.userId
  );

  await neonPrisma.stockMovement.upsert({
    where: { id: movement.id },

    create: {
      id: movement.id,
      productId: neonProductId,
      batchId: neonBatchId,
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
      productId: neonProductId,
      batchId: neonBatchId,
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


async function syncBankTransaction(transactionId: string) {
  const transaction = await prisma.bankTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error(
      `BankTransaction ${transactionId} not found locally.`
    );
  }

  const neonCreatedById = await ensureNeonUser(
    transaction.createdById
  );

  await neonPrisma.bankTransaction.upsert({
    where: {
      id: transaction.id,
    },
    create: {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      reference: transaction.reference,
      transferId: transaction.transferId,
      createdById: neonCreatedById,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    },
    update: {
      type: transaction.type,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      note: transaction.note,
      reference: transaction.reference,
      transferId: transaction.transferId,
      createdById: neonCreatedById,
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
      items: true,
      customerPayments: true,
    },
  });

  if (!sale) {
    throw new Error(`Sale ${saleId} not found locally.`);
  }

  // Make sure the cashier/user exists in Neon.
  const neonCreatedById = await ensureNeonUser(
    sale.createdById
  );

  // Make sure the customer exists in Neon and resolve
  // the actual Neon customer ID when IDs differ.
  let neonCustomerId: string | null = null;

  if (sale.customerId) {
    neonCustomerId = await syncCustomer(sale.customerId);
  }

  // Make sure every product referenced by the sale exists in Neon
  // and resolve the actual Neon Product ID.
  const neonProductIds = new Map<string, string>();

  for (const item of sale.items) {
    const neonProductId = await syncProduct(item.productId);
    neonProductIds.set(item.productId, neonProductId);
  }

  /*
   * Do not blindly upsert by ID.
   *
   * A sale may already exist in Neon under the same saleNumber
   * but with a different database ID.
   */
  let existing = await neonPrisma.sale.findUnique({
    where: { id: sale.id },
  });

  if (!existing) {
    existing = await neonPrisma.sale.findUnique({
      where: { saleNumber: sale.saleNumber },
    });
  }

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
    codCollectedById: sale.codCollectedById
      ? await ensureNeonUser(sale.codCollectedById)
      : null,
    onlineOrderNumber: sale.onlineOrderNumber,
    createdById: neonCreatedById,
    createdAt: sale.createdAt,
  };

  if (existing) {
    await neonPrisma.sale.update({
      where: { id: existing.id },
      data: saleData,
    });

    console.log(
      `[sync] Sale reconciled: Electron ${sale.id} -> Neon ${existing.id} (${sale.saleNumber})`
    );
  } else {
    await neonPrisma.sale.create({
      data: {
        id: sale.id,
        ...saleData,
      },
    });

    console.log(
      `[sync] Sale created in Neon: ${sale.saleNumber}`
    );
  }

  const neonSale = await neonPrisma.sale.findFirst({
    where: {
      saleNumber: sale.saleNumber,
    },
  });

  if (!neonSale) {
    throw new Error(
      `Sale ${sale.saleNumber} was not found in Neon after synchronization.`
    );
  }

  /*
   * Synchronize sale items.
   *
   * Delete/recreate is intentionally avoided because item IDs are
   * stable and upsert makes repeated synchronization safe.
   */
  for (const item of sale.items) {
    await neonPrisma.saleItem.upsert({
      where: {
        id: item.id,
      },
      create: {
        id: item.id,
        saleId: neonSale.id,
        productId: neonProductIds.get(item.productId)!,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        cogsTotal: item.cogsTotal,
      },
      update: {
        saleId: neonSale.id,
        productId: neonProductIds.get(item.productId)!,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
        cogsTotal: item.cogsTotal,
      },
    });
  }

  /*
   * Customer payments belong to the sale.
   * Sync them as well so credit/payment history is preserved.
   */
  for (const payment of sale.customerPayments) {
    const neonPaymentCreatedById = await ensureNeonUser(
      payment.createdById
    );

    let neonPaymentCustomerId = neonCustomerId;

    if (payment.customerId) {
      neonPaymentCustomerId = await syncCustomer(payment.customerId);
    }

    await neonPrisma.customerPayment.upsert({
      where: {
        id: payment.id,
      },
      create: {
        id: payment.id,
        customerId: neonPaymentCustomerId!,
        saleId: neonSale.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        method: payment.method,
        reference: payment.reference,
        createdById: neonPaymentCreatedById,
        createdAt: payment.createdAt,
      },
      update: {
        customerId: neonPaymentCustomerId!,
        saleId: neonSale.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        method: payment.method,
        reference: payment.reference,
        createdById: neonPaymentCreatedById,
      },
    });
  }
  return neonSale.id;
}


/**
 * Push one local Expense from Electron -> Neon.
 *
 * The local Windows/SQLite database is the source of truth.
 * ExpenseCategory is resolved by ID first, then by name, so an
 * existing Neon category with the same name is reused safely.
 */

/**
 * Push one local Customer Return from Electron -> Neon.
 *
 * A Return contains ReturnItems, so the complete return and all
 * of its items are synchronized together. Related Sale, Customer,
 * Product, SaleItem and target ProductBatch records are ensured
 * in Neon before the ReturnItems are written.
 */
async function syncReturn(returnId: string) {
  const customerReturn = await prisma.return.findUnique({
    where: { id: returnId },
    include: {
      items: true,
    },
  });

  if (!customerReturn) {
    throw new Error(
      `Return ${returnId} not found locally.`
    );
  }

  // Ensure the cashier/user exists in Neon.
  const neonCreatedById = await ensureNeonUser(
    customerReturn.createdById
  );

  // The Return belongs to a Sale.
  // Resolve the actual Neon Sale ID because local and Neon IDs
  // may differ.
  const neonSaleId = await syncSale(
    customerReturn.saleId
  );

  // Customer is optional.
  let neonCustomerId: string | null = null;

  if (customerReturn.customerId) {
    neonCustomerId = await syncCustomer(
      customerReturn.customerId
    );
  }

  // Ensure every referenced product/batch exists in Neon
  // and resolve their actual Neon IDs.
  const neonProductIds = new Map<string, string>();
  const neonBatchIds = new Map<string, string>();

  for (const item of customerReturn.items) {
    const neonProductId = await syncProduct(item.productId);
    neonProductIds.set(item.productId, neonProductId);

    if (item.targetBatchId) {
      const neonBatchId = await syncProductBatch(
        item.targetBatchId
      );
      neonBatchIds.set(item.targetBatchId, neonBatchId);
    }
  }

  // Upsert the Return itself.
  await neonPrisma.return.upsert({
    where: {
      id: customerReturn.id,
    },

    create: {
      id: customerReturn.id,
      returnNumber: customerReturn.returnNumber,
      saleId: neonSaleId,
      customerId: neonCustomerId,
      returnDate: customerReturn.returnDate,
      totalRefund: customerReturn.totalRefund,
      reason: customerReturn.reason,
      createdById: neonCreatedById,
      createdAt: customerReturn.createdAt,
    },

    update: {
      returnNumber: customerReturn.returnNumber,
      saleId: neonSaleId,
      customerId: neonCustomerId,
      returnDate: customerReturn.returnDate,
      totalRefund: customerReturn.totalRefund,
      reason: customerReturn.reason,
      createdById: neonCreatedById,
      createdAt: customerReturn.createdAt,
    },
  });

  // Synchronize every ReturnItem.
  for (const item of customerReturn.items) {
    await neonPrisma.returnItem.upsert({
      where: {
        id: item.id,
      },

      create: {
        id: item.id,
        returnId: customerReturn.id,
        saleItemId: item.saleItemId,
        productId: neonProductIds.get(item.productId)!,
        quantity: item.quantity,
        condition: item.condition,
        refundAmount: item.refundAmount,
        targetBatchId: item.targetBatchId
          ? neonBatchIds.get(item.targetBatchId) ?? null
          : null,
      },

      update: {
        returnId: customerReturn.id,
        saleItemId: item.saleItemId,
        productId: neonProductIds.get(item.productId)!,
        quantity: item.quantity,
        condition: item.condition,
        refundAmount: item.refundAmount,
        targetBatchId: item.targetBatchId
          ? neonBatchIds.get(item.targetBatchId) ?? null
          : null,
      },
    });
  }

  console.log(
    `[sync] Customer Return synchronized: ${customerReturn.returnNumber}`
  );
}

async function syncExpense(expenseId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      category: true,
    },
  });

  if (!expense) {
    throw new Error(`Expense ${expenseId} not found locally.`);
  }

  const neonCreatedById = await ensureNeonUser(
    expense.createdById
  );

  /*
   * Resolve the category in Neon.
   *
   * Prefer the same ID. If Neon already has the same category name
   * under another ID, reuse that category instead of creating a
   * duplicate category.
   */
  let neonCategory = await neonPrisma.expenseCategory.findUnique({
    where: {
      id: expense.categoryId,
    },
  });

  if (!neonCategory) {
    neonCategory = await neonPrisma.expenseCategory.findUnique({
      where: {
        name: expense.category.name,
      },
    });
  }

  if (!neonCategory) {
    neonCategory = await neonPrisma.expenseCategory.create({
      data: {
        id: expense.categoryId,
        name: expense.category.name,
        isArchived: expense.category.isArchived,
      },
    });
  } else if (
    neonCategory.name !== expense.category.name ||
    neonCategory.isArchived !== expense.category.isArchived
  ) {
    neonCategory = await neonPrisma.expenseCategory.update({
      where: {
        id: neonCategory.id,
      },
      data: {
        name: expense.category.name,
        isArchived: expense.category.isArchived,
      },
    });
  }

  /*
   * Expense number is unique in Neon. Reconcile by ID first and
   * then by expenseNumber, exactly like the Sale reconciliation.
   */
  let existing = await neonPrisma.expense.findUnique({
    where: {
      id: expense.id,
    },
  });

  if (!existing) {
    existing = await neonPrisma.expense.findUnique({
      where: {
        expenseNumber: expense.expenseNumber,
      },
    });
  }

  const expenseData = {
    expenseNumber: expense.expenseNumber,
    categoryId: neonCategory.id,
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
      where: {
        id: existing.id,
      },
      data: expenseData,
    });

    console.log(
      `[sync] Expense reconciled: Electron ${expense.id} -> Neon ${existing.id} (${expense.expenseNumber})`
    );
  } else {
    await neonPrisma.expense.create({
      data: {
        id: expense.id,
        ...expenseData,
      },
    });

    console.log(
      `[sync] Expense created in Neon: ${expense.expenseNumber}`
    );
  }
}

async function syncCustomerPayment(paymentId: string) {
  const payment = await prisma.customerPayment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error(`Customer payment ${paymentId} not found locally.`);
  }

  // Resolve the local customer to the actual Neon customer ID.
  const neonCustomerId = await syncCustomer(payment.customerId);

  // Resolve the local user to the actual Neon user ID.
  const neonCreatedById = await ensureNeonUser(payment.createdById);

  // A payment may optionally belong to a sale.
  // Sync the sale first so the Neon foreign-key relationship is valid.
  let neonSaleId: string | null = null;

  if (payment.saleId) {
    await syncSale(payment.saleId);

    const localSale = await prisma.sale.findUnique({
      where: { id: payment.saleId },
    });

    if (!localSale) {
      throw new Error(`Sale ${payment.saleId} not found locally.`);
    }

    const neonSale = await neonPrisma.sale.findUnique({
      where: { saleNumber: localSale.saleNumber },
      select: { id: true },
    });

    if (!neonSale) {
      throw new Error(
        `Sale ${payment.saleId} was not found in Neon after synchronization.`
      );
    }

    neonSaleId = neonSale.id;
  }

  await neonPrisma.customerPayment.upsert({
    where: {
      id: payment.id,
    },
    create: {
      id: payment.id,
      customerId: neonCustomerId,
      saleId: neonSaleId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      createdById: neonCreatedById,
      createdAt: payment.createdAt,
    },
    update: {
      customerId: neonCustomerId,
      saleId: neonSaleId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      method: payment.method,
      reference: payment.reference,
      createdById: neonCreatedById,
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

    case "MEMBERSHIP":
      await syncMembership(item.entityId);
      return;

    case "CUSTOMER_PAYMENT":
      await syncCustomerPayment(item.entityId);
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

    case "BANK_TRANSACTION":
      await syncBankTransaction(item.entityId);
      return;

    case "CASH_TRANSACTION":
      await syncCashTransaction(item.entityId);
      return;

    case "SUPPLIER_RETURN":
      await syncSupplierReturn(item.entityId);
      return;

    case "RETURN":
      await syncReturn(item.entityId);
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

    case "EXPENSE":
      await syncExpense(item.entityId);
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
/**
 * Ensure every local Membership has a syncQueue entry.
 *
 * This catches memberships created or updated through paths that
 * did not explicitly enqueue synchronization.
 */
async function enqueueMissingMemberships() {
  const [memberships, queuedMemberships] =
    await Promise.all([
      prisma.membership.findMany({
        select: {
          id: true,
          updatedAt: true,
        },
      }),

      prisma.syncQueue.findMany({
        where: {
          entityType: "MEMBERSHIP",
        },
        select: {
          id: true,
          entityId: true,
          syncStatus: true,
          syncedAt: true,
        },
      }),
    ]);

  const queuedById = new Map(
    queuedMemberships.map((item) => [
      item.entityId,
      item,
    ])
  );

  let created = 0;

  for (const membership of memberships) {
    const queued = queuedById.get(membership.id);

    if (!queued) {
      await enqueueSync(
        "MEMBERSHIP",
        membership.id,
        "CREATE",
        { id: membership.id }
      );

      created++;
      continue;
    }

    if (
      queued.syncStatus === "SYNCED" &&
      queued.syncedAt &&
      membership.updatedAt > queued.syncedAt
    ) {
      await enqueueSync(
        "MEMBERSHIP",
        membership.id,
        "UPDATE",
        { id: membership.id }
      );

      created++;
    } else if (queued.syncStatus === "FAILED") {
      /*
       * Recover the existing failed queue item instead of creating another
       * queue row for the same membership.
       *
       * This is important because SyncQueue has no unique constraint on
       * entityType/entityId. Creating another row here causes historical
       * FAILED rows to accumulate and makes the UI report failures even
       * after the membership has been repaired successfully.
       */
      await prisma.syncQueue.update({
        where: { id: queued.id },
        data: {
          operationType: "UPDATE",
          payload: JSON.stringify({ id: membership.id }),
          syncStatus: "PENDING",
          retryCount: 0,
          errorMessage: null,
          syncedAt: null,
        },
      });

      created++;
    }
  }

  return created;
}

async function enqueueMissingSales() {
  const [sales, queuedSales] = await Promise.all([
    prisma.sale.findMany({
      select: {
        id: true,
      },
    }),

    prisma.syncQueue.findMany({
      where: {
        entityType: "SALE",
      },
      select: {
        entityId: true,
      },
    }),
  ]);

  const queuedIds = new Set(
    queuedSales.map((item) => item.entityId)
  );

  let created = 0;

  for (const sale of sales) {
    if (queuedIds.has(sale.id)) {
      continue;
    }

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
      `[sync] Queued ${created} missing Electron sale(s) for Neon synchronization.`
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
/**
 * Ensure every local CustomerPayment is covered by its parent Sale sync.
 *
 * CustomerPayment records are synchronized by syncSale(), so we enqueue
 * the parent Sale rather than creating a separate payment sync path.
 */
async function enqueueMissingCustomerPayments() {
  /*
   * CustomerPayment records belonging to a Sale are synchronized as part
   * of syncSale(). Therefore reconciliation only needs to discover sales
   * that have NEVER had a SALE queue entry.
   *
   * IMPORTANT:
   * Do not check only PENDING/SYNCING/FAILED here. A SYNCED historical
   * queue row is proof that this sale has already been synchronized.
   * Recreating an UPSERT row on every Sync click caused the false
   * "Successfully synced 4 change(s)" message.
   */
  const payments = await prisma.customerPayment.findMany({
    where: {
      saleId: {
        not: null,
      },
    },
    select: {
      saleId: true,
    },
  });

  const saleIds = [
    ...new Set(
      payments
        .map((payment) => payment.saleId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (saleIds.length === 0) {
    return 0;
  }

  const existing = await prisma.syncQueue.findMany({
    where: {
      entityType: "SALE",
      entityId: {
        in: saleIds,
      },
    },
    select: {
      entityId: true,
    },
  });

  const existingIds = new Set(
    existing.map((item) => item.entityId)
  );

  const missing = saleIds.filter(
    (saleId) => !existingIds.has(saleId)
  );

  if (missing.length === 0) {
    return 0;
  }

  await prisma.syncQueue.createMany({
    data: missing.map((saleId) => ({
      entityType: "SALE",
      entityId: saleId,
      operationType: "UPSERT",
      payload: JSON.stringify({ saleId }),
      syncStatus: "PENDING",
    })),
  });

  console.log(
    `[sync] Enqueued ${missing.length} Sale(s) for CustomerPayment reconciliation`
  );

  return missing.length;
}


/**
 * Ensure every local SupplierReturn has a syncQueue entry.
 *
 * Supplier returns are created/updated locally in Electron.
 * Reconciliation guarantees historical and newly-created returns
 * are pushed to Neon even when their original code path did not
 * explicitly create a syncQueue entry.
 */

/**
 * Ensure every local Customer Return has a syncQueue entry.
 *
 * This repairs historical returns and also catches returns created
 * through code paths that did not explicitly call enqueueSync().
 */
async function enqueueMissingReturns() {
  const returns = await prisma.return.findMany({
    select: {
      id: true,
    },
  });

  const queuedReturns = await prisma.syncQueue.findMany({
    where: {
      entityType: "RETURN",
    },
    select: {
      entityId: true,
    },
  });

  const queuedIds = new Set(
    queuedReturns.map((item) => item.entityId)
  );

  const missing = returns.filter(
    (customerReturn) => !queuedIds.has(customerReturn.id)
  );

  if (missing.length === 0) {
    return 0;
  }

  await prisma.syncQueue.createMany({
    data: missing.map((customerReturn) => ({
      entityType: "RETURN",
      entityId: customerReturn.id,
      operationType: "UPSERT",
      payload: JSON.stringify({
        id: customerReturn.id,
      }),
      syncStatus: "PENDING",
    })),
  });

  console.log(
    `[sync] Queued ${missing.length} Customer Return(s) for Neon synchronization.`
  );

  return missing.length;
}

async function enqueueMissingSupplierReturns() {
  const returns = await prisma.supplierReturn.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const queuedReturns = await prisma.syncQueue.findMany({
    where: {
      entityType: "SUPPLIER_RETURN",
      syncStatus: "SYNCED",
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

  for (const item of queuedReturns) {
    if (!lastSynced.has(item.entityId) && item.syncedAt) {
      lastSynced.set(item.entityId, item.syncedAt);
    }
  }

  const activeReturns = await prisma.syncQueue.findMany({
    where: {
      entityType: "SUPPLIER_RETURN",
      syncStatus: {
        in: ["PENDING", "SYNCING", "FAILED"],
      },
    },
    select: {
      entityId: true,
    },
  });

  const activeIds = new Set(
    activeReturns.map((item) => item.entityId)
  );

  const missing = returns.filter((supplierReturn) => {
    if (activeIds.has(supplierReturn.id)) {
      return false;
    }

    const syncedAt = lastSynced.get(supplierReturn.id);

    // Never synchronized.
    if (!syncedAt) {
      return true;
    }

    // Return was modified after its last successful sync.
    return supplierReturn.updatedAt > syncedAt;
  });

  if (missing.length === 0) {
    return 0;
  }

  await prisma.syncQueue.createMany({
    data: missing.map((supplierReturn) => ({
      entityType: "SUPPLIER_RETURN",
      entityId: supplierReturn.id,
      operationType: "UPSERT",
      payload: JSON.stringify({
        id: supplierReturn.id,
      }),
      syncStatus: "PENDING",
    })),
  });

  console.log(
    `[sync] Queued ${missing.length} SupplierReturn(s) for Neon synchronization.`
  );

  return missing.length;
}

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

/**
 * Ensure every local Expense has a syncQueue entry.
 *
 * This repairs historical expenses that were created before
 * permanent Expense synchronization existed and also catches
 * expenses created through code paths that did not explicitly
 * call enqueueSync().
 *
 * Expenses are read from the LOCAL SQLite database only.
 */
async function enqueueMissingExpenses() {
  const expenses = await prisma.expense.findMany({
    select: {
      id: true,
    },
  });

  const queuedExpenses = await prisma.syncQueue.findMany({
    where: {
      entityType: "EXPENSE",
      syncStatus: "SYNCED",
    },
    select: {
      entityId: true,
    },
  });

  const syncedIds = new Set(
    queuedExpenses.map((item) => item.entityId)
  );

  const pendingOrFailed = await prisma.syncQueue.findMany({
    where: {
      entityType: "EXPENSE",
      syncStatus: {
        in: ["PENDING", "SYNCING", "FAILED"],
      },
    },
    select: {
      entityId: true,
    },
  });

  const activeIds = new Set(
    pendingOrFailed.map((item) => item.entityId)
  );

  const missing = expenses.filter((expense) => {
    // Already synchronized and no active retry is required.
    if (syncedIds.has(expense.id)) {
      return false;
    }

    // Already queued for synchronization.
    if (activeIds.has(expense.id)) {
      return false;
    }

    // Never synchronized.
    return true;
  });

  if (missing.length === 0) {
    return 0;
  }

  await prisma.syncQueue.createMany({
    data: missing.map((expense) => ({
      entityType: "EXPENSE",
      entityId: expense.id,
      operationType: "UPSERT",
      payload: JSON.stringify({
        id: expense.id,
      }),
      syncStatus: "PENDING",
    })),
  });

  console.log(
    `[sync] Queued ${missing.length} missing/changed Expense(s) for Neon synchronization.`
  );

  return missing.length;
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
    } else {
      /*
       * Fresh Windows installations may not yet contain
       * the users that already exist in Neon.
       *
       * Pull the role first and create the user locally.
       */
        /*
         * Resolve remote user role safely.
         *
         * Electron and Neon can have different Role IDs.
         * Role.name is UNIQUE, so never create a role before
         * checking the local role by name.
         */
        let localRole = await prisma.role.findUnique({
          where: { id: remote.roleId },
        });

        if (!localRole) {
          const remoteRole = await neonPrisma.role.findUnique({
            where: { id: remote.roleId },
            include: {
              permissions: true,
            },
          });

          if (remoteRole) {
            /*
             * The ID may differ between Neon and Electron.
             * Reuse an existing local role with the same name.
             */
            localRole = await prisma.role.findUnique({
              where: { name: remoteRole.name },
            });

            if (localRole) {
              localRole = await prisma.role.update({
                where: { id: localRole.id },
                data: {
                  description: remoteRole.description,
                  isSystem: remoteRole.isSystem,
                },
              });

              console.log(
                `[pull] Role reconciled by name: ${remoteRole.name}`
              );
            } else {
              /*
               * Neither ID nor name exists locally.
               * Safe to create the role with the Neon ID.
               */
              localRole = await prisma.role.create({
                data: {
                  id: remoteRole.id,
                  name: remoteRole.name,
                  description: remoteRole.description,
                  isSystem: remoteRole.isSystem,
                },
              });

              console.log(
                `[pull] Role created locally: ${remoteRole.name}`
              );
            }

            /*
             * Ensure remote permissions exist locally and are
             * attached to the resolved LOCAL role ID.
             */
            for (const remotePermission of remoteRole.permissions) {
              const permission = await neonPrisma.permission.findUnique({
                where: { id: remotePermission.permissionId },
              });

              if (!permission) continue;

              /*
               * Neon and Electron can have different Permission IDs.
               * Permission.code is UNIQUE, so reconcile permissions by CODE
               * and always use the LOCAL permission ID for RolePermission.
               */
              let localPermission = await prisma.permission.findUnique({
                where: { code: permission.code },
              });

              if (localPermission) {
                localPermission = await prisma.permission.update({
                  where: { id: localPermission.id },
                  data: {
                    module: permission.module,
                    description: permission.description,
                  },
                });

                console.log(
                  `[pull] Permission reconciled by code: ${permission.code}`
                );
              } else {
                localPermission = await prisma.permission.findUnique({
                  where: { id: permission.id },
                });

                if (localPermission) {
                  localPermission = await prisma.permission.update({
                    where: { id: localPermission.id },
                    data: {
                      code: permission.code,
                      module: permission.module,
                      description: permission.description,
                    },
                  });

                  console.log(
                    `[pull] Permission reconciled by ID: ${permission.code}`
                  );
                } else {
                  localPermission = await prisma.permission.create({
                    data: {
                      id: permission.id,
                      code: permission.code,
                      module: permission.module,
                      description: permission.description,
                    },
                  });

                  console.log(
                    `[pull] Permission created locally: ${permission.code}`
                  );
                }
              }

              await prisma.rolePermission.upsert({
                where: {
                  roleId_permissionId: {
                    roleId: localRole.id,
                    permissionId: localPermission.id,
                  },
                },
                create: {
                  roleId: localRole.id,
                  permissionId: localPermission.id,
                },
                update: {},
              });

            }
          }
        }
      if (!localRole) {
        console.warn(
          `[pull] Skipping user ${remote.username}: role mapping missing`
        );
        continue;
      }

/*
       * Neon and Electron can have different User IDs.
       * Username is UNIQUE, so reconcile by remote ID first,
       * then by username. If the username already exists locally,
       * preserve the LOCAL user ID.
       */
      let localUser = await prisma.user.findUnique({
        where: { id: remote.id },
      });

      if (!localUser) {
        localUser = await prisma.user.findUnique({
          where: { username: remote.username },
        });
      }

      if (localUser) {
        await prisma.user.update({
          where: { id: localUser.id },
          data: {
            username: remote.username,
            passwordHash: remote.passwordHash,
            fullName: remote.fullName,
            phone: remote.phone,
            roleId: localRole.id,
            isActive: remote.isActive,
            lastLoginAt: remote.lastLoginAt,
            updatedAt: remote.updatedAt,
          },
        });

        console.log(
          `[pull] User reconciled: ${remote.username}`
        );
      } else {
        await prisma.user.create({
          data: {
            id: remote.id,
            username: remote.username,
            passwordHash: remote.passwordHash,
            fullName: remote.fullName,
            phone: remote.phone,
            roleId: localRole.id,
            isActive: remote.isActive,
            lastLoginAt: remote.lastLoginAt,
            createdAt: remote.createdAt,
            updatedAt: remote.updatedAt,
          },
        });

        console.log(
          `[pull] User created locally: ${remote.username}`
        );
      }
    }
  }

  // ============================================================
  // MEMBERSHIPS
  // IMPORTANT: Customers must exist locally before memberships.
  // Memberships are reconciled by ID, membership number, or customer.
  // ============================================================

  const remoteMemberships =
    await neonPrisma.membership.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

  for (const remote of remoteMemberships) {
    // Resolve the Neon customer to the actual local customer.
    let localCustomer = await prisma.customer.findUnique({
      where: {
        id: remote.customerId,
      },
    });

    if (!localCustomer) {
      const remoteCustomer =
        await neonPrisma.customer.findUnique({
          where: {
            id: remote.customerId,
          },
        });

      if (remoteCustomer) {
        localCustomer = await prisma.customer.findFirst({
          where: {
            phone: remoteCustomer.phone,
          },
        });
      }
    }

    if (!localCustomer) {
      console.warn(
        `[pull] Skipping membership ${remote.membershipNumber}: customer mapping missing`
      );
      continue;
    }

    // Prefer ID, then membership number, then customer.
    let existingMembership =
      await prisma.membership.findUnique({
        where: {
          id: remote.id,
        },
      });

    if (!existingMembership) {
      existingMembership =
        await prisma.membership.findUnique({
          where: {
            membershipNumber:
              remote.membershipNumber,
          },
        });
    }

    if (!existingMembership) {
      existingMembership =
        await prisma.membership.findUnique({
          where: {
            customerId: localCustomer.id,
          },
        });
    }

    const membershipData = {
      membershipNumber: remote.membershipNumber,
      customerId: localCustomer.id,
      tier: remote.tier,
      discountPercent: remote.discountPercent,
      issueDate: remote.issueDate,
      expiryDate: remote.expiryDate,
      status: remote.status,
      qrCodeData: remote.qrCodeData,
      updatedAt: remote.updatedAt,
    };

    if (existingMembership) {
      await prisma.membership.update({
        where: {
          id: existingMembership.id,
        },
        data: membershipData,
      });

      console.log(
        `[pull] Membership reconciled: Neon ${remote.id} -> Electron ${existingMembership.id} (${remote.membershipNumber})`
      );
    } else {
      await prisma.membership.create({
        data: {
          id: remote.id,
          ...membershipData,
          createdAt: remote.createdAt,
        },
      });

      console.log(
        `[pull] Membership created locally: ${remote.membershipNumber}`
      );
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

  return {
    pulled,
  };
}

export async function syncPendingChanges() {
  // Reconcile Membership records before processing the queue.
  // This catches memberships created or updated without an
  // explicit syncQueue entry.
  await enqueueMissingMemberships();

  // Reconcile ALL local Electron sales before processing the queue.
  // This repairs historical sales that were created before SALE
  // synchronization existed.
  await enqueueMissingSales();

  // Reconcile Product records before processing the queue.
  // This catches products created/updated by paths that did not
  // explicitly create a syncQueue entry.
  await enqueueMissingProducts();

  // Reconcile Customer Return records before processing the queue.
  // This catches historical and newly-created customer returns.
  await enqueueMissingReturns();

  // Reconcile SupplierReturn records before processing the queue.
  // This catches historical and newly-created supplier returns.
  await enqueueMissingSupplierReturns();

  // Reconcile Purchase records before processing the queue.
  // This catches historical purchases and purchases created by
  // code paths that did not explicitly call enqueueSync().
  await enqueueMissingPurchases();

  // Reconcile CashTransaction records before processing the queue.
  // This catches cash records created by older/newer service paths
  // that did not explicitly call enqueueSync().
  await enqueueMissingCashTransactions();

  // Reconcile Expense records before processing the queue.
  // This catches historical and newly-created expenses that did
  // not explicitly create a syncQueue entry.
  await enqueueMissingExpenses();

  // Reconcile historical supplier payments before processing the queue.
  await enqueueMissingSupplierPayments();

  // Reconcile CustomerPayments through their parent Sales.
  // syncSale() already synchronizes the complete payment history.
  await enqueueMissingCustomerPayments();

  const MAX_SYNC_RETRIES = 5;

  const items = await prisma.syncQueue.findMany({
    where: {
      OR: [
        {
          syncStatus: "PENDING",
        },
        {
          syncStatus: "FAILED",
          retryCount: {
            lt: MAX_SYNC_RETRIES,
          },
        },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
    take: BATCH_SIZE,
  });

  if (items.length === 0) {
    return {
      synced: 0,
      failed: 0,
      pending: 0,
    };
  }

  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await prisma.syncQueue.update({
        where: {
          id: item.id,
        },
        data: {
          syncStatus: "SYNCING",
          errorMessage: null,
        },
      });

      await syncQueueItem(item);

      /*
       * The sync function reconciles the complete current state of the
       * entity in Neon. Therefore, once this entity succeeds, any older
       * queue entries for the same entity are obsolete attempts rather
       * than outstanding work.
       *
       * Keep the queue rows for history, but mark all of them SYNCED so
       * stale FAILED rows cannot remain permanently visible in the
       * Sync panel.
       */
      const syncedAt = new Date();

      await prisma.syncQueue.updateMany({
        where: {
          entityType: item.entityType,
          entityId: item.entityId,
        },
        data: {
          syncStatus: "SYNCED",
          syncedAt,
          errorMessage: null,
          retryCount: 0,
        },
      });

      synced++;
    } catch (error) {
      failed++;

      await prisma.syncQueue.update({
        where: {
          id: item.id,
        },
        data: {
          syncStatus: "FAILED",
          errorMessage:
            error instanceof Error
              ? error.message
              : String(error),
          retryCount: {
            increment: 1,
          },
        },
      });
    }
  }

  const pending = await prisma.syncQueue.count({
    where: {
      syncStatus: "PENDING",
    },
  });

  return {
    synced,
    failed,
    pending,
  };
}
