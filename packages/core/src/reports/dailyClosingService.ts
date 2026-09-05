import { prisma, Prisma } from "@torki-bazar/database";
import { PERMISSIONS } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Generates and persists the daily business closing report.
// Re-closing the same date recalculates and updates the existing closing.
export async function generateDailyClosing(session: AuthSession, closingDate: Date) {
  assertPermission(session, PERMISSIONS.REPORTS_VIEW);
  const from = startOfDay(closingDate);
  const to = endOfDay(closingDate);

  const sales = await prisma.sale.findMany({
    where: { saleDate: { gte: from, lte: to }, status: "COMPLETED" },
    include: { items: true },
  });

  const totalSalesGross = sales.reduce((s, x) => s.add(x.totalAmount), new Prisma.Decimal(0));
  const cashSales = sales
    .filter((x) => x.paymentMethod === "CASH")
    .reduce((s, x) => s.add(x.totalAmount), new Prisma.Decimal(0));
  const bkashSales = sales
    .filter((x) => x.paymentMethod === "BKASH")
    .reduce((s, x) => s.add(x.totalAmount), new Prisma.Decimal(0));
  const codCollected = sales
    .filter((x) => x.paymentMethod === "COD" && x.paymentStatus === "PAID" && x.codCollectedAt && x.codCollectedAt >= from && x.codCollectedAt <= to)
    .reduce((s, x) => s.add(x.totalAmount), new Prisma.Decimal(0));
  
  const cogsGross = sales.reduce((s, x) => s.add(x.cogsAmount), new Prisma.Decimal(0));

  // Fetch returns to properly subtract returned revenue and proportional COGS
  const returns = await prisma.return.findMany({
    where: { returnDate: { gte: from, lte: to } },
    include: {
      items: {
        include: {
          saleItem: true,
        },
      },
    },
  });

  const totalReturnsRefund = returns.reduce(
    (sum, r) =>
      sum.add(
        r.items.reduce((itemSum, item) => itemSum.add(new Prisma.Decimal(item.refundAmount)), new Prisma.Decimal(0))
      ),
    new Prisma.Decimal(0)
  );

  const returnedCogsTotal = returns.reduce(
    (sum, r) =>
      sum.add(
        r.items.reduce((itemSum, item) => {
          if (!item.saleItem || !item.saleItem.quantity || Number(item.saleItem.quantity) === 0) {
            return itemSum;
          }
          const itemCogsPerUnit = new Prisma.Decimal(item.saleItem.cogsTotal).div(item.saleItem.quantity);
          return itemSum.add(itemCogsPerUnit.mul(item.quantity));
        }, new Prisma.Decimal(0))
      ),
    new Prisma.Decimal(0)
  );

  const totalSales = totalSalesGross.sub(totalReturnsRefund);
  const cogs = cogsGross.sub(returnedCogsTotal);
  const grossProfit = totalSales.sub(cogs);

  // Fetch expenses, excluding heavy one-time monthly salary expenses from daily trading net result distortion
  const rawExpenses = await prisma.expense.findMany({
    where: { expenseDate: { gte: from, lte: to }, status: "RECORDED" },
    include: { category: true },
  });

  const filteredExpenses = rawExpenses.filter((ex) => {
    const text = `${ex.notes ?? ""} ${ex.category?.name ?? ""}`.toLowerCase();
    return !text.includes("salary") && !text.includes("payroll") && !text.includes("monthly");
  });

  const expensesTotal = filteredExpenses.reduce(
    (sum, ex) => sum.add(new Prisma.Decimal(ex.amount)),
    new Prisma.Decimal(0)
  );

  const supplierPayments = await prisma.supplierPayment.aggregate({
    where: { paymentDate: { gte: from, lte: to } },
    _sum: { amount: true },
  });
  const customerPayments = await prisma.customerPayment.aggregate({
    where: { paymentDate: { gte: from, lte: to } },
    _sum: { amount: true },
  });

  const netOperatingResult = grossProfit.sub(expensesTotal);

  const closing = await prisma.dailyClosing.upsert({
    where: { closingDate: from },
    create: {
      closingDate: from,
      totalSales,
      cashSales,
      bkashSales,
      codCollected,
      returns: totalReturnsRefund,
      expenses: expensesTotal,
      supplierPayments: supplierPayments._sum.amount ?? 0,
      customerPayments: customerPayments._sum.amount ?? 0,
      cogs,
      grossProfit,
      netOperatingResult,
      closedById: session.userId,
    },
    update: {
      totalSales,
      cashSales,
      bkashSales,
      codCollected,
      returns: totalReturnsRefund,
      expenses: expensesTotal,
      supplierPayments: supplierPayments._sum.amount ?? 0,
      customerPayments: customerPayments._sum.amount ?? 0,
      cogs,
      grossProfit,
      netOperatingResult,
      closedById: session.userId,
    },
  });

  await recordAuditLog(session, {
    action: "UPDATE",
    module: "DAILY_CLOSING",
    recordId: closing.id,
  });
  return closing;
}

export async function listDailyClosings() {
  return prisma.dailyClosing.findMany({ orderBy: { closingDate: "desc" } });
}
