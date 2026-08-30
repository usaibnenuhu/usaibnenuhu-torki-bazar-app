from pathlib import Path
import shutil
from datetime import datetime

p = Path("packages/core/src/sync/syncService.ts")
if not p.exists():
    raise SystemExit("ERROR: syncService.ts not found")

s = p.read_text()

if "export async function pullRemoteChanges()" not in s:
    raise SystemExit("ERROR: pullRemoteChanges() not found")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = Path("backups") / f"syncService.before-final-bidirectional-pull-{stamp}.ts"
backup.parent.mkdir(exist_ok=True)
shutil.copy2(p, backup)
print(f"BACKUP: {backup}")

# ------------------------------------------------------------
# CUSTOMER PULL
# ------------------------------------------------------------
if "const remoteCustomers = await neonPrisma.customer.findMany" not in s:
    marker = '''  // ============================================================
  // CATEGORIES
  // ============================================================
'''

    block = '''  // ============================================================
  // CUSTOMERS
  // ============================================================

  const customerMap = new Map<string, string>();

  const remoteCustomers = await neonPrisma.customer.findMany({
    orderBy: { createdAt: "asc" },
  });

  for (const remote of remoteCustomers) {
    let existing = await prisma.customer.findUnique({
      where: { id: remote.id },
    });

    if (!existing && remote.phone) {
      existing = await prisma.customer.findFirst({
        where: { phone: remote.phone },
      });
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

'''

    if marker not in s:
        raise SystemExit("ERROR: CATEGORIES marker not found")

    s = s.replace(marker, block + marker, 1)
    print("OK: customer pull added")
else:
    print("Customer pull already exists")

# ------------------------------------------------------------
# CASH TRANSACTIONS PULL
# ------------------------------------------------------------
if "const remoteCashTransactions = await neonPrisma.cashTransaction.findMany" not in s:
    marker = '''  // ============================================================
  // SALES
  // IMPORTANT: pull sales before purchases only for the sale records;
'''

    block = '''  // ============================================================
  // CASH TRANSACTIONS
  // ============================================================

  const remoteCashTransactions =
    await neonPrisma.cashTransaction.findMany({
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

    const markerExists = await prisma.syncQueue.findFirst({
      where: {
        entityType: "CASH_TRANSACTION",
        entityId: remote.id,
      },
      select: { id: true },
    });

    if (!markerExists) {
      await prisma.syncQueue.create({
        data: {
          entityType: "CASH_TRANSACTION",
          entityId: remote.id,
          operationType: "PULL",
          payload: JSON.stringify({
            source: "NEON",
            remoteId: remote.id,
          }),
          syncStatus: "SYNCED",
          syncedAt: new Date(),
        },
      });
    }

    pulled++;
  }

'''

    if marker not in s:
        raise SystemExit("ERROR: SALES marker not found")

    s = s.replace(marker, block + marker, 1)
    print("OK: cash transaction pull added")
else:
    print("Cash pull already exists")

# ------------------------------------------------------------
# SALES PULL
# ------------------------------------------------------------
if "const remoteSales = await neonPrisma.sale.findMany" not in s:
    marker = '''  // ============================================================
  // PURCHASES
  // IMPORTANT: PURCHASES BEFORE BATCHES
  // ============================================================
'''

    block = '''  // ============================================================
  // SALES
  // ============================================================

  const remoteSales = await neonPrisma.sale.findMany({
    include: {
      items: {
        include: {
          batchConsumptions: true,
        },
      },
      customerPayments: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const saleMap = new Map<string, string>();
  const pendingRemoteSaleItems = remoteSales;

  for (const remote of remoteSales) {
    let user = await prisma.user.findUnique({
      where: { id: remote.createdById },
    });

    if (!user) {
      const remoteUser = await neonPrisma.user.findUnique({
        where: { id: remote.createdById },
      });

      if (remoteUser) {
        user = await prisma.user.findUnique({
          where: { username: remoteUser.username },
        });
      }
    }

    if (!user) {
      console.warn(
        `[pull] Skipping sale ${remote.saleNumber}: creator mapping missing`
      );
      continue;
    }

    const localCustomerId = remote.customerId
      ? customerMap.get(remote.customerId) ?? remote.customerId
      : null;

    if (localCustomerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: localCustomerId },
      });

      if (!customer) {
        console.warn(
          `[pull] Skipping sale ${remote.saleNumber}: customer mapping missing`
        );
        continue;
      }
    }

    let existing = await prisma.sale.findUnique({
      where: { id: remote.id },
    });

    if (!existing) {
      existing = await prisma.sale.findUnique({
        where: { saleNumber: remote.saleNumber },
      });
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
      codCollectedById: remote.codCollectedById
        ? (
            await prisma.user.findUnique({
              where: { id: remote.codCollectedById },
              select: { id: true },
            })
          )?.id ?? null
        : null,
      onlineOrderNumber: remote.onlineOrderNumber,
      createdById: user.id,
      createdAt: remote.createdAt,
    };

    if (existing) {
      await prisma.sale.update({
        where: { id: existing.id },
        data: saleData,
      });

      saleMap.set(remote.id, existing.id);
    } else {
      const created = await prisma.sale.create({
        data: {
          id: remote.id,
          ...saleData,
        },
      });

      saleMap.set(remote.id, created.id);
    }

    const alreadyMarked = await prisma.syncQueue.findFirst({
      where: {
        entityType: "SALE",
        entityId: saleMap.get(remote.id)!,
        syncStatus: "SYNCED",
      },
      select: { id: true },
    });

    if (!alreadyMarked) {
      await prisma.syncQueue.create({
        data: {
          entityType: "SALE",
          entityId: saleMap.get(remote.id)!,
          operationType: "PULL",
          payload: JSON.stringify({
            source: "NEON",
            remoteId: remote.id,
          }),
          syncStatus: "SYNCED",
          syncedAt: new Date(),
        },
      });
    }

    pulled++;
  }

'''

    if marker not in s:
        raise SystemExit("ERROR: PURCHASES marker not found")

    s = s.replace(marker, block + marker, 1)
    print("OK: sales pull added")
else:
    print("Sales pull already exists")

# ------------------------------------------------------------
# SALE ITEMS + BATCH CONSUMPTIONS + CUSTOMER PAYMENTS
# ------------------------------------------------------------
if "SALE ITEMS + BATCH CONSUMPTIONS" not in s:
    marker = '''  // ============================================================
  // PURCHASE ITEMS
  // ============================================================
'''

    block = '''  // ============================================================
  // SALE ITEMS + BATCH CONSUMPTIONS
  // ============================================================

  for (const remote of pendingRemoteSaleItems) {
    const localSaleId = saleMap.get(remote.id);

    if (!localSaleId) continue;

    for (const item of remote.items) {
      const localProductId =
        productMap.get(item.productId) ?? item.productId;

      const product = await prisma.product.findUnique({
        where: { id: localProductId },
      });

      if (!product) {
        console.warn(
          `[pull] Skipping sale item ${item.id}: product mapping missing`
        );
        continue;
      }

      const localSaleItem =
        await prisma.saleItem.upsert({
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
        const batch = await prisma.productBatch.findUnique({
          where: { id: consumption.batchId },
        });

        if (!batch) {
          console.warn(
            `[pull] Skipping sale batch consumption ${consumption.id}: batch missing`
          );
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
        const customer = await prisma.customer.findUnique({
          where: { id: localCustomerId },
        });

        if (!customer) continue;
      }

      let user = await prisma.user.findUnique({
        where: { id: payment.createdById },
      });

      if (!user) {
        const remoteUser = await neonPrisma.user.findUnique({
          where: { id: payment.createdById },
        });

        if (remoteUser) {
          user = await prisma.user.findUnique({
            where: { username: remoteUser.username },
          });
        }
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

'''

    if marker not in s:
        raise SystemExit("ERROR: PURCHASE ITEMS marker not found")

    s = s.replace(marker, block + marker, 1)
    print("OK: sale items/payment pull added")
else:
    print("Sale items pull already exists")

p.write_text(s)

print()
print("===== PATCH COMPLETE =====")
print("Cash pull:", "YES" if "remoteCashTransactions" in s else "NO")
print("Sales pull:", "YES" if "remoteSales" in s else "NO")
print("Customer pull:", "YES" if "remoteCustomers" in s else "NO")
print("Sale items pull:", "YES" if "SALE ITEMS + BATCH CONSUMPTIONS" in s else "NO")
