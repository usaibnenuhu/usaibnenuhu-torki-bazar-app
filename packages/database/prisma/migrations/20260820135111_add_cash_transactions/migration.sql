-- CreateTable
CREATE TABLE "CashTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "transactionDate" DATETIME NOT NULL,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CashTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CashTransaction_transactionDate_idx" ON "CashTransaction"("transactionDate");

-- CreateIndex
CREATE INDEX "CashTransaction_type_transactionDate_idx" ON "CashTransaction"("type", "transactionDate");
