/*
  Warnings:

  - A unique constraint covering the columns `[paymentNumber]` on the table `SupplierPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN "notes" TEXT;

-- AlterTable
ALTER TABLE "SupplierPayment" ADD COLUMN "paymentNumber" TEXT;
ALTER TABLE "SupplierPayment" ADD COLUMN "previousOutstanding" DECIMAL;
ALTER TABLE "SupplierPayment" ADD COLUMN "remainingOutstanding" DECIMAL;

-- CreateTable
CREATE TABLE "SupplierReturn" (
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "supplierId" TEXT,
    "purchaseId" TEXT,
    "batchCode" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "manufacturingDate" DATETIME,
    "quantityReceived" DECIMAL NOT NULL,
    "remainingQuantity" DECIMAL NOT NULL,
    "quantityReturned" DECIMAL NOT NULL DEFAULT 0,
    "purchasePrice" DECIMAL NOT NULL,
    "expiryDate" DATETIME,
    "purchaseInvoiceNumber" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductBatch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductBatch_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductBatch" ("batchCode", "createdAt", "expiryDate", "id", "productId", "purchaseDate", "purchaseInvoiceNumber", "purchasePrice", "quantityReceived", "remainingQuantity", "status", "supplierId") SELECT "batchCode", "createdAt", "expiryDate", "id", "productId", "purchaseDate", "purchaseInvoiceNumber", "purchasePrice", "quantityReceived", "remainingQuantity", "status", "supplierId" FROM "ProductBatch";
DROP TABLE "ProductBatch";
ALTER TABLE "new_ProductBatch" RENAME TO "ProductBatch";
CREATE INDEX "ProductBatch_productId_status_idx" ON "ProductBatch"("productId", "status");
CREATE INDEX "ProductBatch_expiryDate_idx" ON "ProductBatch"("expiryDate");
CREATE INDEX "ProductBatch_productId_purchaseDate_idx" ON "ProductBatch"("productId", "purchaseDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SupplierReturn_returnNumber_key" ON "SupplierReturn"("returnNumber");

-- CreateIndex
CREATE INDEX "SupplierReturn_supplierId_idx" ON "SupplierReturn"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierReturn_purchaseId_idx" ON "SupplierReturn"("purchaseId");

-- CreateIndex
CREATE INDEX "SupplierReturn_batchId_idx" ON "SupplierReturn"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierPayment_paymentNumber_key" ON "SupplierPayment"("paymentNumber");
