import { prisma, Prisma } from "@torki-bazar/database";
import { PERMISSIONS } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";

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

function startOfMonth(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date: Date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfYear(date: Date) {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfYear(date: Date) {
  const d = new Date(date);
  d.setMonth(11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
}

const zero = () => new Prisma.Decimal(0);

async function calculatePeriod(from: Date, to: Date) {
  const sales = await prisma.sale.findMany({
    where: {
      saleDate: {
        gte: from,
        lte: to,
      },
      status: "COMPLETED",
    },
    include: {
      items: true,
    },
  });

  const returns = await prisma.return.findMany({
    where: {
      returnDate: {
        gte: from,
        lte: to,
      },
    },
    include: {
      items: {
        include: {
          saleItem: true,
        },
      },
    },
  });

  const grossSales = sales.reduce(
    (sum, sale) => sum.add(sale.totalAmount),
    zero()
  );

  const grossCogs = sales.reduce(
    (sum, sale) => sum.add(sale.cogsAmount),
    zero()
  );

  const returnValue = returns.reduce(
    (sum, ret) =>
      sum.add(
        ret.items.reduce(
          (itemSum, item) => itemSum.add(item.refundAmount),
          zero()
        )
      ),
    zero()
  );

  const returnedCogs = returns.reduce(
    (sum, ret) =>
      sum.add(
        ret.items.reduce((itemSum, item) => {
          if (
            !item.saleItem ||
            !item.saleItem.quantity ||
            Number(item.saleItem.quantity) === 0
          ) {
            return itemSum;
          }

          const perUnitCogs = new Prisma.Decimal(
            item.saleItem.cogsTotal
          ).div(item.saleItem.quantity);

          return itemSum.add(perUnitCogs.mul(item.quantity));
        }, zero())
      ),
    zero()
  );

  const netSales = grossSales.sub(returnValue);
  const cogs = grossCogs.sub(returnedCogs);
  const grossProfit = netSales.sub(cogs);

  const expenses = await prisma.expense.findMany({
    where: {
      expenseDate: {
        gte: from,
        lte: to,
      },
      status: "RECORDED",
    },
    include: {
      category: true,
    },
  });

  const expenseBreakdown = new Map<string, Prisma.Decimal>();

  let salaryExpenses = zero();
  let inventoryLoss = zero();
  let otherExpenses = zero();

  for (const expense of expenses) {
    const amount = new Prisma.Decimal(expense.amount);
    const categoryName = expense.category?.name?.trim() ?? "";
    const category = categoryName.toLowerCase();

    expenseBreakdown.set(
      categoryName || "Uncategorized",
      (expenseBreakdown.get(categoryName || "Uncategorized") ?? zero()).add(
        amount
      )
    );

    if (
      category === "salaries" ||
      category === "salary" ||
      category.includes("payroll")
    ) {
      salaryExpenses = salaryExpenses.add(amount);
    } else if (
      category === "inventory loss" ||
      expense.paymentMethod === "INVENTORY_LOSS"
    ) {
      inventoryLoss = inventoryLoss.add(amount);
    } else {
      otherExpenses = otherExpenses.add(amount);
    }
  }

  const totalExpenses = salaryExpenses
    .add(inventoryLoss)
    .add(otherExpenses);

  const netProfit = grossProfit.sub(totalExpenses);

  const cashSales = sales
    .filter((sale) => sale.paymentMethod === "CASH")
    .reduce((sum, sale) => sum.add(sale.totalAmount), zero());

  const bkashSales = sales
    .filter((sale) => sale.paymentMethod === "BKASH")
    .reduce((sum, sale) => sum.add(sale.totalAmount), zero());

  const codCollected = sales
    .filter(
      (sale) =>
        sale.paymentMethod === "COD" &&
        sale.paymentStatus === "PAID" &&
        sale.codCollectedAt &&
        sale.codCollectedAt >= from &&
        sale.codCollectedAt <= to
    )
    .reduce((sum, sale) => sum.add(sale.totalAmount), zero());

  const supplierPayments = await prisma.supplierPayment.aggregate({
    where: {
      paymentDate: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const customerPayments = await prisma.customerPayment.aggregate({
    where: {
      paymentDate: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    from,
    to,
    grossSales,
    returns: returnValue,
    netSales,
    cogs,
    grossProfit,
    expenses: totalExpenses,
    salaryExpenses,
    inventoryLoss,
    otherExpenses,
    netProfit,
    cashSales,
    bkashSales,
    codCollected,
    supplierPayments: supplierPayments._sum.amount ?? zero(),
    customerPayments: customerPayments._sum.amount ?? zero(),
    expenseBreakdown: Array.from(expenseBreakdown.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
      })
    ),
  };
}

export async function getDailyReport(
  session: AuthSession,
  date: Date
) {
  assertPermission(session, PERMISSIONS.REPORTS_VIEW);

  const from = startOfDay(date);
  const to = endOfDay(date);

  return calculatePeriod(from, to);
}

export async function getMonthlyReport(
  session: AuthSession,
  date: Date
) {
  assertPermission(session, PERMISSIONS.REPORTS_VIEW);

  const from = startOfMonth(date);
  const to = endOfMonth(date);

  return calculatePeriod(from, to);
}

export async function getYearlyReport(
  session: AuthSession,
  date: Date
) {
  assertPermission(session, PERMISSIONS.REPORTS_VIEW);

  const from = startOfYear(date);
  const to = endOfYear(date);

  return calculatePeriod(from, to);
}
