-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SupplierReturn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returnNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "unitCost" DECIMAL NOT NULL,
    "returnValue" DECIMAL NOT NULL,
    "returnDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "settlementType" TEXT NOT NULL DEFAULT 'CREDIT',
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "cancelReason" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplierReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierReturn_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierReturn_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierReturn_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProductBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SupplierReturn" ("batchId", "cancelReason", "createdAt", "createdById", "id", "notes", "productId", "purchaseId", "quantity", "reason", "returnDate", "returnNumber", "returnValue", "status", "supplierId", "unitCost", "updatedAt") SELECT "batchId", "cancelReason", "createdAt", "createdById", "id", "notes", "productId", "purchaseId", "quantity", "reason", "returnDate", "returnNumber", "returnValue", "status", "supplierId", "unitCost", "updatedAt" FROM "SupplierReturn";
DROP TABLE "SupplierReturn";
ALTER TABLE "new_SupplierReturn" RENAME TO "SupplierReturn";
CREATE UNIQUE INDEX "SupplierReturn_returnNumber_key" ON "SupplierReturn"("returnNumber");
CREATE INDEX "SupplierReturn_supplierId_idx" ON "SupplierReturn"("supplierId");
CREATE INDEX "SupplierReturn_purchaseId_idx" ON "SupplierReturn"("purchaseId");
CREATE INDEX "SupplierReturn_batchId_idx" ON "SupplierReturn"("batchId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
