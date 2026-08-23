import { prisma } from "@torki-bazar/database";
import bcrypt from "bcryptjs";
import { AuthenticationError, ValidationError } from "@torki-bazar/shared";
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
   * IMPORTANT:
   * Delete transactional business data and catalog setup when reset is triggered.
   */

  await prisma.$transaction(async (tx) => {
    // Sync / backup / operational history
    await tx.syncQueue.deleteMany();
    await tx.backup.deleteMany();

    // Notifications / reports
    await tx.notification.deleteMany();
    await tx.dailyClosing.deleteMany();

    // Returns
    await tx.returnItem.deleteMany();
    await tx.return.deleteMany();

    // Sales & Cash Management & bKash Management
    await tx.saleItemBatchConsumption.deleteMany();
    await tx.saleItem.deleteMany();
    await tx.customerPayment.deleteMany();
    await tx.sale.deleteMany();
    
    // Clear Cash Management and bKash Management transactions so balances reset to 0
    await tx.cashTransaction.deleteMany();
    await tx.bkashTransaction.deleteMany();

    // Membership
    await tx.membership.deleteMany();

    // Supplier returns
    await tx.supplierReturn.deleteMany();

    // Purchases / supplier payments
    await tx.supplierPayment.deleteMany();
    await tx.purchaseItem.deleteMany();
    await tx.productBatch.deleteMany();
    await tx.purchase.deleteMany();

    // Inventory
    await tx.stockMovement.deleteMany();

    // Products
    await tx.product.deleteMany();

    // Categories & Subcategories
    await tx.subcategory.deleteMany();
    await tx.category.deleteMany();

    // Customers / suppliers
    await tx.customer.deleteMany();
    await tx.supplier.deleteMany();

    // Employees / salaries
    await tx.salary.deleteMany();
    await tx.employee.deleteMany();

    // Expenses (clears individual expense records, but PRESERVES Expense Categories)
    await tx.expense.deleteMany();
  });
}
