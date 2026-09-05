import { useEffect, useMemo, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { Field, Input, Select } from "../components/Form";
import { formatBDT, formatDate, formatDateTime } from "../utils/format";
import { useToastStore } from "../store/toastStore";
import logo from "../assets/torki-logo.png";

type ReportMode = "DAILY" | "MONTHLY" | "YEARLY";

interface Report {
  from: string;
  to: string;
  totalSales: string;
  grossSales?: string;
  returns: string;
  netSales?: string;
  cogs: string;
  grossProfit: string;
  salaryExpenses: string;
  inventoryLoss: string;
  otherExpenses: string;
  totalExpenses: string;
  netProfit: string;
  cashSales: string;
  bkashSales: string;
  codCollected: string;
  supplierPayments: string;
  customerPayments: string;
  expenseBreakdown: Array<{
    category: string;
    amount: string;
  }>;
}

interface Closing {
  id: string;
  closingDate: string;
  totalSales: string;
  cogs: string;
  grossProfit: string;
  expenses: string;
  netOperatingResult: string;
}

function money(value: unknown) {
  return formatBDT(Number(value ?? 0));
}

function number(value: unknown) {
  return Number(value ?? 0);
}

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function yearInput(date: Date) {
  return String(date.getFullYear());
}

function reportTitle(mode: ReportMode) {
  if (mode === "DAILY") return "Daily Business Report";
  if (mode === "MONTHLY") return "Monthly Business Report";
  return "Yearly Business Report";
}

function periodLabel(report: Report | null) {
  if (!report) return "";
  const from = new Date(report.from);
  const to = new Date(report.to);

  if (isoDate(from) === isoDate(to)) {
    return formatDate(from);
  }

  return `${formatDate(from)} — ${formatDate(to)}`;
}

function Kpi({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const toneClass = {
    default: "text-slate-900",
    success: "text-emerald-700",
    danger: "text-red-600",
    warning: "text-amber-600",
  }[tone];

  return (
    <Card className="h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-black ${toneClass}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className="h-9 w-9 rounded-xl bg-slate-50" />
      </div>
    </Card>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-black text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

function printReport(report: Report, mode: ReportMode) {
  const existing = document.getElementById("torki-bazar-print-report");
  if (existing) existing.remove();

  const rows = report.expenseBreakdown
    .map(
      (item) => `
        <tr>
          <td>${String(item.category)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</td>
          <td class="amount">${money(item.amount)}</td>
        </tr>
      `,
    )
    .join("");

  const printRoot = document.createElement("div");
  printRoot.id = "torki-bazar-print-report";

  printRoot.innerHTML = `
    <style>
      #torki-bazar-print-report {
        position: fixed;
        inset: 0;
        z-index: 999999;
        overflow: auto;
        background: #fff;
        color: #0f172a;
        padding: 32px;
        font-family: Arial, Helvetica, sans-serif;
      }

      #torki-bazar-print-report * {
        box-sizing: border-box;
      }

      #torki-bazar-print-report .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #0f766e;
        padding-bottom: 18px;
        margin-bottom: 24px;
      }

      #torki-bazar-print-report .brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      #torki-bazar-print-report .logo {
        width: 62px;
        height: 62px;
        object-fit: contain;
      }

      #torki-bazar-print-report h1 {
        margin: 0;
        font-size: 25px;
      }

      #torki-bazar-print-report h2 {
        margin: 24px 0 8px;
        font-size: 18px;
      }

      #torki-bazar-print-report p {
        margin: 4px 0;
        color: #64748b;
        font-size: 12px;
      }

      #torki-bazar-print-report .period {
        text-align: right;
        font-size: 13px;
        color: #475569;
      }

      #torki-bazar-print-report .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 22px;
      }

      #torki-bazar-print-report .metric {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 14px;
      }

      #torki-bazar-print-report .label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: #64748b;
        font-weight: bold;
      }

      #torki-bazar-print-report .value {
        margin-top: 7px;
        font-size: 19px;
        font-weight: bold;
      }

      #torki-bazar-print-report .positive {
        color: #047857;
      }

      #torki-bazar-print-report .negative {
        color: #dc2626;
      }

      #torki-bazar-print-report table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }

      #torki-bazar-print-report th,
      #torki-bazar-print-report td {
        border-bottom: 1px solid #e2e8f0;
        padding: 9px 8px;
        text-align: left;
      }

      #torki-bazar-print-report th {
        background: #f8fafc;
        font-weight: bold;
      }

      #torki-bazar-print-report .amount {
        text-align: right;
        font-weight: bold;
      }

      #torki-bazar-print-report .summary {
        margin-top: 24px;
        border: 2px solid #0f766e;
        border-radius: 10px;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #torki-bazar-print-report .summary strong {
        font-size: 20px;
      }

      #torki-bazar-print-report .footer {
        margin-top: 35px;
        padding-top: 14px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        color: #94a3b8;
        font-size: 10px;
      }

      @media print {
        body > *:not(#torki-bazar-print-report) {
          display: none !important;
        }

        #torki-bazar-print-report {
          position: static;
          inset: auto;
          overflow: visible;
          padding: 18mm;
        }

        @page {
          size: A4;
          margin: 0;
        }
      }
    </style>

    <div class="header">
      <div class="brand">
        <img class="logo" src="${logo}" alt="Torki Bazar" />
        <div>
          <h1>Torki Bazar</h1>
          <p>Torki Bazar, Gournadi, Barishail</p>
          <p>contact@torkibazar.com</p>
          <p>torkibazar.com</p>
        </div>
      </div>

      <div class="period">
        <strong>${reportTitle(mode)}</strong>
        <p>${periodLabel(report)}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
    </div>

    <div class="grid">
      <div class="metric">
        <div class="label">Sales</div>
        <div class="value">${money(report.totalSales)}</div>
      </div>

      <div class="metric">
        <div class="label">COGS</div>
        <div class="value">${money(report.cogs)}</div>
      </div>

      <div class="metric">
        <div class="label">Gross Profit</div>
        <div class="value positive">${money(report.grossProfit)}</div>
      </div>

      <div class="metric">
        <div class="label">Total Expenses</div>
        <div class="value">${money(report.totalExpenses)}</div>
      </div>

      <div class="metric">
        <div class="label">Salary</div>
        <div class="value">${money(report.salaryExpenses)}</div>
      </div>

      <div class="metric">
        <div class="label">Inventory Loss</div>
        <div class="value">${money(report.inventoryLoss)}</div>
      </div>

      <div class="metric">
        <div class="label">Other Expenses</div>
        <div class="value">${money(report.otherExpenses)}</div>
      </div>

      <div class="metric">
        <div class="label">Net Profit / Loss</div>
        <div class="value ${report.netProfit >= 0 ? "positive" : "negative"}">
          ${money(report.netProfit)}
        </div>
      </div>
    </div>

    <h2>Sales & Collections</h2>
    <table>
      <tbody>
        <tr>
          <td>Cash Sales</td>
          <td class="amount">${money(report.cashSales)}</td>
        </tr>
        <tr>
          <td>bKash Sales</td>
          <td class="amount">${money(report.bkashSales)}</td>
        </tr>
        <tr>
          <td>COD Collected</td>
          <td class="amount">${money(report.codCollected)}</td>
        </tr>
        <tr>
          <td>Returns</td>
          <td class="amount">${money(report.returns)}</td>
        </tr>
      </tbody>
    </table>

    <h2>Expense Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `
          <tr>
            <td colspan="2">No expenses recorded for this period.</td>
          </tr>
        `}
      </tbody>
    </table>

    <div class="summary">
      <span>Net Profit / Loss</span>
      <strong class="${report.netProfit >= 0 ? "positive" : "negative"}">
        ${money(report.netProfit)}
      </strong>
    </div>

    <div class="footer">
      Torki Bazar Retail Management System • Official Report
    </div>
  `;

  document.body.appendChild(printRoot);

  const cleanup = () => {
    printRoot.remove();
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    window.focus();
    window.print();
  }, 300);
}

export function ReportsPage() {
  const toast = useToastStore();

  const [mode, setMode] = useState<ReportMode>("DAILY");
  const [date, setDate] = useState(isoDate(new Date()));
  const [month, setMonth] = useState(monthInput(new Date()));
  const [year, setYear] = useState(yearInput(new Date()));

  const [report, setReport] = useState<Report | null>(null);
  const [closings, setClosings] = useState<Closing[]>([]);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedClosing, setSelectedClosing] = useState<Closing | null>(null);

  async function loadReport(selectedMode = mode) {
    setLoading(true);

    try {
      let data: Report;

      if (selectedMode === "DAILY") {
        data = await call<Report>("reports:daily", { date });
      } else if (selectedMode === "MONTHLY") {
        data = await call<Report>("reports:monthly", {
          date: `${month}-01`,
        });
      } else {
        data = await call<Report>("reports:yearly", {
          date: `${year}-01-01`,
        });
      }

      setReport(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }

  async function loadClosings() {
    try {
      const data = await call<Closing[]>("reports:dailyClosing:list");
      setClosings(data);
    } catch {
      setClosings([]);
    }
  }

  useEffect(() => {
    void loadReport();
  }, [mode, date, month, year]);

  useEffect(() => {
    void loadClosings();
  }, []);

  async function handleDailyClosing() {
    setClosing(true);

    try {
      await call<Closing>("reports:dailyClosing:generate", { date });
      await loadClosings();
      await loadReport("DAILY");

      toast.success(
        "Daily closing updated successfully. Re-closing the same date recalculates that day's closing.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Daily closing failed.");
    } finally {
      setClosing(false);
    }
  }

  const currentClosing = useMemo(() => {
    if (!report || mode !== "DAILY") return null;

    const selected = date;
    return (
      closings.find(
        (item) => isoDate(new Date(item.closingDate)) === selected,
      ) ?? null
    );
  }, [closings, date, mode, report]);

  const expenseTotal = number(report?.totalExpenses);
  const grossProfit = number(report?.grossProfit);
  const netProfit = number(report?.netProfit);

  return (
    <div className="space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <img src={logo} alt="Torki Bazar" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                Torki Bazar
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">
                Business Reports
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Sales, profit, expenses and period closing
              </p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-bold">Torki Bazar, Gournadi, Barishail</p>
            <p className="mt-1 text-xs text-slate-400">
              contact@torkibazar.com · torkibazar.com
            </p>
          </div>
        </div>
      </section>

      <Card className="!p-2">
        <div className="grid grid-cols-3 gap-2">
          {(["DAILY", "MONTHLY", "YEARLY"] as ReportMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                mode === item
                  ? "bg-emerald-700 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {item === "DAILY"
                ? "Daily"
                : item === "MONTHLY"
                  ? "Monthly"
                  : "Yearly"}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-2">
            {mode === "DAILY" && (
              <Field label="Report Date">
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </Field>
            )}

            {mode === "MONTHLY" && (
              <Field label="Report Month">
                <Input
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                />
              </Field>
            )}

            {mode === "YEARLY" && (
              <Field label="Report Year">
                <Select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                >
                  {Array.from({ length: 10 }, (_, index) => {
                    const value = String(new Date().getFullYear() - index);
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </Select>
              </Field>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => report && printReport(report, mode)}
              disabled={!report || loading}
            >
              Print Report
            </Button>

            <Button
              onClick={() => void loadReport()}
              disabled={loading}
            >
              {loading ? "Loading…" : "Refresh Report"}
            </Button>

            {mode === "DAILY" && (
              <Button
                onClick={() => void handleDailyClosing()}
                disabled={closing || loading}
                className="bg-emerald-800 hover:bg-emerald-900"
              >
                {closing
                  ? "Closing…"
                  : currentClosing
                    ? "Update Daily Closing"
                    : "Daily Closing"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {loading && (
        <Card>
          <div className="flex items-center justify-center py-14">
            <div className="text-sm font-bold text-slate-400">
              Preparing {reportTitle(mode).toLowerCase()}…
            </div>
          </div>
        </Card>
      )}

      {!loading && report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="Total Sales"
              value={money(report.totalSales)}
              sub={periodLabel(report)}
            />
            <Kpi
              label="COGS"
              value={money(report.cogs)}
              sub="Cost of goods sold"
            />
            <Kpi
              label={mode === "DAILY" ? "Profit From Sales" : "Gross Profit"}
              value={money(report.grossProfit)}
              sub="Sales minus COGS"
              tone={grossProfit >= 0 ? "success" : "danger"}
            />
            <Kpi
              label="Total Expenses"
              value={money(report.totalExpenses)}
              sub="Salary + inventory loss + other"
              tone={expenseTotal > 0 ? "warning" : "default"}
            />
          </div>

          <Card className="overflow-hidden !p-0">
            <div className="bg-gradient-to-r from-emerald-50 to-white p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                    {mode === "DAILY"
                      ? "Daily Trading Result"
                      : "Period Closing Result"}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">
                    {mode === "DAILY"
                      ? "Profit from today's sales"
                      : "Net profit / loss for this period"}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {mode === "DAILY"
                      ? "Daily sales profit is shown separately from expenses. A monthly salary or other expense does not turn a profitable trading day into a loss day."
                      : "This period includes all recorded expenses, including salaries and inventory loss, so the final result reflects the complete period economics."}
                  </p>
                </div>

                <div
                  className={`rounded-2xl px-6 py-4 text-right ${
                    (mode === "DAILY" ? grossProfit : netProfit) >= 0
                      ? "bg-emerald-100"
                      : "bg-red-100"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {mode === "DAILY" ? "Sales Profit" : "Net Result"}
                  </p>
                  <p
                    className={`mt-1 text-3xl font-black ${
                      (mode === "DAILY" ? grossProfit : netProfit) >= 0
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {money(mode === "DAILY" ? report.grossProfit : report.netProfit)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <SectionTitle
                title="Sales & Collections"
                subtitle="How sales and money collections were recorded."
              />

              <div className="divide-y divide-slate-100">
                {[
                  ["Cash Sales", report.cashSales],
                  ["bKash Sales", report.bkashSales],
                  ["COD Collected", report.codCollected],
                  ["Returns", report.returns],
                  ["Supplier Payments", report.supplierPayments],
                  ["Customer Payments", report.customerPayments],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-sm font-medium text-slate-600">
                      {label}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {money(value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionTitle
                title="Expense Breakdown"
                subtitle="Every recorded expense is counted once."
              />

              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-600">
                    Salaries
                  </span>
                  <span className="font-black text-slate-900">
                    {money(report.salaryExpenses)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-600">
                    Inventory Loss
                  </span>
                  <span className="font-black text-slate-900">
                    {money(report.inventoryLoss)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-600">
                    Other Expenses
                  </span>
                  <span className="font-black text-slate-900">
                    {money(report.otherExpenses)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <span className="text-sm font-black text-slate-800">
                    Total Expenses
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {money(report.totalExpenses)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <SectionTitle
              title="Expense Categories"
              subtitle="Detailed category-level breakdown for this period."
            />

            <DataTable
              columns={[
                {
                  header: "Category",
                  accessor: (row) => (
                    <span className="font-semibold">{row.category}</span>
                  ),
                },
                {
                  header: "Amount",
                  className: "text-right font-black",
                  accessor: (row) => money(row.amount),
                },
              ]}
              rows={report.expenseBreakdown}
              keyFor={(row) => row.category}
              emptyMessage="No expenses recorded for this period."
            />
          </Card>
        </>
      )}

      {mode === "DAILY" && (
        <Card>
          <button
            type="button"
            onClick={() => setHistoryOpen((value) => !value)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <h2 className="text-base font-black text-slate-900">
                Daily Closing History
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Click to view previous daily closing records.
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
              {historyOpen ? "Hide" : "Show"}
            </span>
          </button>

          {historyOpen && (
            <div className="mt-5">
              <DataTable
                columns={[
                  {
                    header: "Date",
                    accessor: (row) => formatDate(new Date(row.closingDate)),
                  },
                  {
                    header: "Sales",
                    accessor: (row) => money(row.totalSales),
                  },
                  {
                    header: "COGS",
                    accessor: (row) => money(row.cogs),
                  },
                  {
                    header: "Sales Profit",
                    accessor: (row) => (
                      <span className="font-black text-emerald-700">
                        {money(row.grossProfit)}
                      </span>
                    ),
                  },
                  {
                    header: "Expenses",
                    accessor: (row) => money(row.expenses),
                  },
                  {
                    header: "Closing Result",
                    accessor: (row) => (
                      <span
                        className={`font-black ${
                          number(row.netOperatingResult) >= 0
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {money(row.netOperatingResult)}
                      </span>
                    ),
                  },
                  {
                    header: "Action",
                    accessor: (row) => (
                      <Button
                        variant="ghost"
                        className="px-2"
                        onClick={(event) => {
                          event.stopPropagation();
                          const selected = new Date(row.closingDate);
                          setSelectedClosing(row);
                          setDate(isoDate(selected));
                          setMode("DAILY");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        View
                      </Button>
                    ),
                  },
                ]}
                rows={closings}
                keyFor={(row) => row.id}
                emptyMessage="No daily closings recorded yet."
              />
            </div>
          )}
        </Card>
      )}

      {selectedClosing && mode === "DAILY" && (
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                Daily Closing Detail
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                {formatDate(new Date(selectedClosing.closingDate))}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Detailed saved closing record for this date.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => report && printReport(report, "DAILY")}
                disabled={!report}
              >
                Print Closing Report
              </Button>

              <Button
                variant="ghost"
                onClick={() => setSelectedClosing(null)}
              >
                Close
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Total Sales", selectedClosing.totalSales],
              ["COGS", selectedClosing.cogs],
              ["Sales Profit", selectedClosing.grossProfit],
              ["Daily Expenses", selectedClosing.expenses],
              ["Closing Result", selectedClosing.netOperatingResult],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                  {label}
                </div>
                <div className="mt-2 text-xl font-black text-slate-900">
                  {money(value)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-900">
              Saved Daily Closing
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              Re-closing this same date updates this record instead of creating
              a duplicate closing.
            </p>
          </div>
        </Card>
      )}

      <Card className="bg-slate-50">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Accounting note
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Daily profit and period net profit are intentionally different
              measurements.
            </p>
          </div>
          <p className="max-w-xl text-xs leading-5 text-slate-500">
            Daily shows sales profit separately from operating expenses.
            Monthly and yearly results subtract salaries, rent/other expenses,
            and inventory loss from gross profit. Inventory loss is an
            accounting expense and does not create a second cash, bank, or
            bKash deduction.
          </p>
        </div>
      </Card>

      <div className="text-center text-[11px] text-slate-400">
        Last report period: {report ? periodLabel(report) : "—"}
        {report && ` · Generated ${formatDateTime(new Date())}`}
      </div>
    </div>
  );
}
