-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "transactionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "reference" TEXT,
    "transferId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankTransaction_createdById_fkey"
        FOREIGN KEY ("createdById")
        REFERENCES "User" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BankTransaction_transactionDate_idx"
ON "BankTransaction"("transactionDate");

-- CreateIndex
CREATE INDEX "BankTransaction_type_transactionDate_idx"
ON "BankTransaction"("type", "transactionDate");

-- CreateIndex
CREATE INDEX "BankTransaction_transferId_idx"
ON "BankTransaction"("transferId");
