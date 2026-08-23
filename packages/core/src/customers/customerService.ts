import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, NotFoundError, ValidationError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";

export async function listCustomers(includeArchived = false) {
  const customers = await prisma.customer.findMany({
    where: includeArchived ? {} : { status: "ACTIVE" },
    include: { membership: true },
    orderBy: { name: "asc" },
  });

  const sales = await prisma.sale.findMany({
    where: { status: "COMPLETED", customerId: { not: null } },
    select: { id: true, customerId: true, totalAmount: true, paymentStatus: true },
  });
  const refunds = await prisma.return.groupBy({
    by: ["customerId"],
    where: { customerId: { not: null } },
    _sum: { totalRefund: true },
  });
  const payments = await prisma.customerPayment.findMany({ select: { customerId: true, saleId: true, amount: true } });

  // A sale is only receivable while it is unpaid — a PAID cash sale must never
  // land in Outstanding, and payments only offset the sale they belong to.
  const unpaidSaleIds = new Set(sales.filter((s) => s.paymentStatus !== "PAID").map((s) => s.id));
  const refundByCustomer = new Map(refunds.map((r) => [r.customerId, Number(r._sum.totalRefund ?? 0)]));

  return customers.map((c) => {
    const ownSales = sales.filter((s) => s.customerId === c.id);
    const grossSpending = ownSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const totalSpending = grossSpending - (refundByCustomer.get(c.id) ?? 0);
    const unpaidTotal = ownSales
      .filter((s) => s.paymentStatus !== "PAID")
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const paidAgainstUnpaid = payments
      .filter((p) => p.customerId === c.id && (!p.saleId || unpaidSaleIds.has(p.saleId)))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      ...c,
      totalPurchases: ownSales.length,
      totalSpending,
      outstandingBalance: Math.max(0, unpaidTotal - paidAgainstUnpaid),
    };
  });
}

export async function getCustomerProfile(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      membership: true,
      sales: { orderBy: { saleDate: "desc" }, include: { items: true } },
      customerPayments: { orderBy: { paymentDate: "desc" } },
      returns: { orderBy: { returnDate: "desc" } },
    },
  });
  if (!customer) throw new NotFoundError("Customer not found.");
  return customer;
}

export async function createCustomer(
  session: AuthSession,
  input: { name: string; phone?: string; address?: string }
) {
  assertPermission(session, PERMISSIONS.CUSTOMERS_MANAGE);
  const customer = await prisma.customer.create({ data: input });
  await recordAuditLog(session, { action: "CREATE", module: "CUSTOMER", recordId: customer.id, newValue: customer });
  return customer;
}

export async function updateCustomer(
  session: AuthSession,
  id: string,
  input: Partial<{ name: string; phone?: string; address?: string }>
) {
  assertPermission(session, PERMISSIONS.CUSTOMERS_MANAGE);
  const before = await prisma.customer.findUnique({ where: { id } });
  if (!before) throw new NotFoundError("Customer not found.");
  const customer = await prisma.customer.update({ where: { id }, data: input });
  await recordAuditLog(session, { action: "UPDATE", module: "CUSTOMER", recordId: id, previousValue: before, newValue: customer });
  return customer;
}

export async function archiveCustomer(session: AuthSession, id: string, isArchived = true) {
  assertPermission(session, PERMISSIONS.CUSTOMERS_MANAGE);
  const customer = await prisma.customer.update({ where: { id }, data: { status: isArchived ? "ARCHIVED" : "ACTIVE" } });
  await recordAuditLog(session, { action: isArchived ? "ARCHIVE" : "UNARCHIVE", module: "CUSTOMER", recordId: id });
  return customer;
}

// Records a customer payment against outstanding receivables (section 25).
export async function recordCustomerPayment(
  session: AuthSession,
  input: { customerId: string; saleId?: string; amount: number; method: string; reference?: string }
) {
  assertPermission(session, PERMISSIONS.CUSTOMER_PAYMENTS_MANAGE);
  if (input.amount <= 0) throw new ValidationError("Payment amount must be greater than zero.");
  const payment = await prisma.customerPayment.create({
    data: {
      customerId: input.customerId,
      saleId: input.saleId,
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      createdById: session.userId,
    },
  });
  await recordAuditLog(session, { action: "CREATE", module: "CUSTOMER_PAYMENT", recordId: payment.id, newValue: payment });
  return payment;
}
