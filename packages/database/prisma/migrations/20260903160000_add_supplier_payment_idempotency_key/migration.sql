-- Add idempotency protection for supplier payments.
ALTER TABLE "SupplierPayment"
ADD COLUMN "idempotencyKey" TEXT;

-- Prevent duplicate supplier payment requests.
CREATE UNIQUE INDEX "SupplierPayment_idempotencyKey_key"
ON "SupplierPayment"("idempotencyKey");
