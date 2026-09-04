-- Restore ProductBatch.sellingPrice required by the current Prisma schema.
ALTER TABLE "ProductBatch"
ADD COLUMN "sellingPrice" DECIMAL NOT NULL DEFAULT 0;
