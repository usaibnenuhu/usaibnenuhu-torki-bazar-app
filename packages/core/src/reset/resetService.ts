import { prisma } from "@torki-bazar/database";
import { neonPrisma } from "@torki-bazar/database/dist/neonClient";
import bcrypt from "bcryptjs";
import {
  AuthenticationError,
  ValidationError,
  DEFAULT_UNITS,
  DEFAULT_EXPENSE_CATEGORIES,
} from "@torki-bazar/shared";
import type { AuthSession } from "../context";

export async function resetBusinessData(
  session: AuthSession,
  password: string,
  confirmation: string
): Promise<void> {
  if (!password) {
    throw new AuthenticationError("Administrator password is required.");
  }

  if (confirmation !== "RESET") {
    throw new ValidationError('Type "RESET" to confirm.');
  }

  // Verify the currently logged-in administrator's password.
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || !user.isActive) {
    throw new AuthenticationError();
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    throw new AuthenticationError("Administrator password is incorrect.");
  }

  /*
   * ============================================================
   * COMPLETE BUSINESS RESET
   * ============================================================
   *
   * Windows/local SQLite -> ZERO
   * Neon/cloud PostgreSQL -> ZERO
   *
   * Authentication is preserved:
   *   - Users
   *   - Roles
   *   - Permissions
   *   - Role permissions
   *
   * Everything belonging to the business is reset so the system
   * can start again from a completely clean state.
   */

  // ------------------------------------------------------------
  // LOCAL WINDOWS SQLITE
  // ------------------------------------------------------------

  await prisma.$transaction(
    async (tx) => {
    // Sync / backup / operational history
    await tx.syncQueue.deleteMany();
    await tx.backup.deleteMany();

    // Notifications / reports / audit history
    await tx.notification.deleteMany();
    await tx.dailyClosing.deleteMany();
    await tx.auditLog.deleteMany();
    await tx.loginAttempt.deleteMany();

    // Returns
    await tx.returnItem.deleteMany();
    await tx.return.deleteMany();

    // Sales / customer payments
    await tx.saleItemBatchConsumption.deleteMany();
    await tx.saleItem.deleteMany();
    await tx.customerPayment.deleteMany();
    await tx.sale.deleteMany();

    // Cash / bKash / Bank
    await tx.cashTransaction.deleteMany();
    await tx.bkashTransaction.deleteMany();
    await tx.bankTransaction.deleteMany();

    // Membership
    await tx.membership.deleteMany();

    // Supplier returns / payments
    await tx.supplierReturn.deleteMany();
    await tx.supplierPayment.deleteMany();

    // Purchases / inventory
    await tx.purchaseItem.deleteMany();
    await tx.productBatch.deleteMany();
    await tx.purchase.deleteMany();
    await tx.stockMovement.deleteMany();

    // Product catalog
    await tx.product.deleteMany();
    await tx.subcategory.deleteMany();
    await tx.category.deleteMany();
    await tx.brand.deleteMany();

    // Customers / suppliers
    await tx.customer.deleteMany();
    await tx.supplier.deleteMany();

    // Employees / salaries
    await tx.salary.deleteMany();
    await tx.employee.deleteMany();

    // Expenses + expense categories
    await tx.expense.deleteMany();

    // Start invoice numbering from the beginning.
    await tx.invoiceSequence.deleteMany();
    // Preserve setup data and restore missing defaults.
    for (const unit of DEFAULT_UNITS) {
      await tx.unit.upsert({
        where: { name: unit.name },
        update: {},
        create: unit,
      });
    }

    for (const name of DEFAULT_EXPENSE_CATEGORIES) {
      await tx.expenseCategory.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

  }, {
    maxWait: 120000,
    timeout: 120000,
  });

  // ------------------------------------------------------------
  // NEON CLOUD POSTGRESQL
  // ------------------------------------------------------------

  // Ensure the Neon connection is alive before starting the reset.
  // If the existing pool connection became stale, reconnect once.
  try {
    await neonPrisma.$connect();
  } catch (firstError) {
    console.warn(
      "[reset] Neon connection failed; reconnecting once:",
      firstError
    );

    try {
      await neonPrisma.$disconnect();
    } catch {
      // Ignore disconnect errors and attempt a fresh connection.
    }

    await neonPrisma.$connect();
  }

  await neonPrisma.$transaction(
    async (tx) => {
    // Sync / backup / operational history
    await tx.syncQueue.deleteMany();
    await tx.backup.deleteMany();

    // Notifications / reports / audit history
    await tx.notification.deleteMany();
    await tx.dailyClosing.deleteMany();
    await tx.auditLog.deleteMany();
    await tx.loginAttempt.deleteMany();

    // Returns
    await tx.returnItem.deleteMany();
    await tx.return.deleteMany();

    // Sales / customer payments
    await tx.saleItemBatchConsumption.deleteMany();
    await tx.saleItem.deleteMany();
    await tx.customerPayment.deleteMany();
    await tx.sale.deleteMany();

    // Cash / bKash / Bank
    await tx.cashTransaction.deleteMany();
    await tx.bkashTransaction.deleteMany();
    await tx.bankTransaction.deleteMany();

    // Membership
    await tx.membership.deleteMany();

    // Supplier returns / payments
    await tx.supplierReturn.deleteMany();
    await tx.supplierPayment.deleteMany();

    // Purchases / inventory
    await tx.purchaseItem.deleteMany();
    await tx.productBatch.deleteMany();
    await tx.purchase.deleteMany();
    await tx.stockMovement.deleteMany();

    // Product catalog
    await tx.product.deleteMany();
    await tx.subcategory.deleteMany();
    await tx.category.deleteMany();
    await tx.brand.deleteMany();

    // Customers / suppliers
    await tx.customer.deleteMany();
    await tx.supplier.deleteMany();

    // Employees / salaries
    await tx.salary.deleteMany();
    await tx.employee.deleteMany();

    // Expenses + expense categories
    await tx.expense.deleteMany();

    // Start invoice numbering from the beginning.
    await tx.invoiceSequence.deleteMany();
    // Preserve setup data and restore missing defaults.
    for (const unit of DEFAULT_UNITS) {
      await tx.unit.upsert({
        where: { name: unit.name },
        update: {},
        create: unit,
      });
    }

    for (const name of DEFAULT_EXPENSE_CATEGORIES) {
      await tx.expenseCategory.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

  }, {
    maxWait: 120000,
    timeout: 120000,
  });
}
