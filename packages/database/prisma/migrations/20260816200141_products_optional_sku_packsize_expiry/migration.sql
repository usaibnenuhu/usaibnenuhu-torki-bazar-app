-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "brandId" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "unitId" TEXT NOT NULL,
    "packSize" DECIMAL,
    "expiryDate" DATETIME,
    "purchasePrice" DECIMAL NOT NULL DEFAULT 0,
    "sellingPrice" DECIMAL NOT NULL,
    "wholesalePrice" DECIMAL,
    "minimumStock" DECIMAL NOT NULL DEFAULT 0,
    "currentStock" DECIMAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "defaultSupplierId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_defaultSupplierId_fkey" FOREIGN KEY ("defaultSupplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("barcode", "brandId", "categoryId", "createdAt", "currentStock", "defaultSupplierId", "description", "id", "imageUrl", "minimumStock", "name", "purchasePrice", "sellingPrice", "sku", "status", "subcategoryId", "unitId", "updatedAt", "wholesalePrice") SELECT "barcode", "brandId", "categoryId", "createdAt", "currentStock", "defaultSupplierId", "description", "id", "imageUrl", "minimumStock", "name", "purchasePrice", "sellingPrice", "sku", "status", "subcategoryId", "unitId", "updatedAt", "wholesalePrice" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_status_idx" ON "Product"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
