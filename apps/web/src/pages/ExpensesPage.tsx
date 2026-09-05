import { useEffect, useState, type FormEvent } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { formatBDT, formatDateTime } from "../utils/format";
import { useToastStore } from "../store/toastStore";

import logo from "../assets/torki-logo.png";

interface ExpenseCategory {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  expenseNumber: string;
  expenseDate: string;
  amount: string;
  paymentMethod: string;
  description: string;
  reference?: string | null;
  notes?: string | null;
  status: string;
  category: {
    name: string;
  };
  createdBy?: {
    name: string;
  } | null;
}

interface InventoryLoss {
  id: string;
  date: string;
  reason: string;
  productName: string;
  sku: string;
  unit: string;
  batchCode?: string | null;
  supplierName?: string | null;
  purchaseNumber?: string | null;
  quantity: string;
  unitCost: string;
  lossValue: string;
  notes?: string | null;
  recordedBy?: string | null;
}

interface InventoryLossResponse {
  items: InventoryLoss[];
  totalValue: string;
  totalQuantity: string;
}

const DASH = "—";

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="2" />
      <path d="M6 17v4h12v-4" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2v-19Z" />
      <path d="M8.5 8h7" />
      <path d="M8.5 12h7" />
      <path d="M8.5 16h4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [inventoryLosses, setInventoryLosses] = useState<InventoryLoss[]>([]);
  const [inventoryLossTotalValue, setInventoryLossTotalValue] = useState("0");
  const [inventoryLossTotalQuantity, setInventoryLossTotalQuantity] = useState("0");
  const [activeSection, setActiveSection] =
    useState<"EXPENSES" | "INVENTORY_LOSS">("EXPENSES");
  const [lookupNumber, setLookupNumber] = useState("");
  const [found, setFound] = useState<Expense | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [reference, setReference] = useState("");

  const push = useToastStore((s) => s.push);

  async function load() {
    try {
      const [expData, catData, lossData] = await Promise.all([
        call<Expense[]>("expenses:list"),
        call<ExpenseCategory[]>("expenses:categories:list"),
        call<InventoryLossResponse>("inventory:losses"),
      ]);
      setExpenses(expData);
      setCategories(catData);
      setInventoryLosses(lossData.items);
      setInventoryLossTotalValue(String(lossData.totalValue ?? "0"));
      setInventoryLossTotalQuantity(String(lossData.totalQuantity ?? "0"));
      if (catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].id);
      }
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to load expenses", "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateExpense(e: FormEvent) {
    e.preventDefault();
    try {
      const numAmount = parseFloat(amount);
      if (!categoryId) throw new Error("Please select an expense category.");
      if (isNaN(numAmount) || numAmount <= 0) throw new Error("Please enter a valid amount.");
      if (!description.trim()) throw new Error("Please enter a description.");

      await call("expenses:create", {
        categoryId,
        amount: numAmount,
        description: description.trim(),
        paymentMethod,
        reference: reference.trim() || undefined,
      });

      push(
        paymentMethod === "BANK"
          ? "Expense recorded successfully — bank balance deducted from Bank Management."
          : paymentMethod === "BKASH"
            ? "Expense recorded successfully — bKash balance deducted."
            : "Expense recorded successfully — cash deducted from management.",
        "success"
      );
      setShowAddModal(false);
      setAmount("");
      setDescription("");
      setReference("");
      await load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to record expense", "error");
    }
  }

  function handleLookup(e: FormEvent) {
    e.preventDefault();
    const value = lookupNumber.trim().toLowerCase();
    if (!value) {
      push("Please enter an expense number.", "error");
      return;
    }

    const match = expenses.find((exp) => exp.expenseNumber.toLowerCase().includes(value));
    if (match) {
      setFound(match);
      setLookupNumber(match.expenseNumber);
    } else {
      setFound(null);
      push("Expense not found", "error");
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="expenses-root space-y-6">
      {/* PAGE HEADER */}
      <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between reveal">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Financial Ledger</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Expenses</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
            Track operating expenses, view vouchers, and print official expense receipts.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} className="!rounded-2xl !px-5 !shadow-md">
          <span className="flex items-center gap-2">
            <PlusIcon />
            Record Expense
          </span>
        </Button>
      </div>

      {/* EXPENSES / INVENTORY LOSS TABS */}
      <div className="print:hidden reveal" style={{ animationDelay: "40ms" }}>
        <Card className="!p-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveSection("EXPENSES")}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                activeSection === "EXPENSES"
                  ? "bg-emerald-700 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Expenses History
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("INVENTORY_LOSS")}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                activeSection === "INVENTORY_LOSS"
                  ? "bg-emerald-700 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Inventory Loss
            </button>
          </div>
        </Card>
      </div>

      {activeSection === "EXPENSES" && (
        <>
          {/* SEARCH LOOKUP */}
      <div className="print:hidden reveal" style={{ animationDelay: "60ms" }}>
        <Card className="search-card relative overflow-hidden !border-emerald-100/70 !bg-white/90 !p-5 shadow-[0_10px_30px_-12px_rgba(6,78,59,0.18)] backdrop-blur-xl">
          <form onSubmit={handleLookup} className="relative flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3.5 text-sm shadow-sm outline-none transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Search expense number (e.g. TB-EXP-2026-000001)"
                value={lookupNumber}
                onChange={(e) => setLookupNumber(e.target.value)}
              />
            </div>
            <Button type="submit" className="!rounded-2xl !px-6 !shadow-md">
              <span className="flex items-center gap-2">
                <SearchIcon />
                Find Voucher
              </span>
            </Button>
          </form>
        </Card>
      </div>

      {/* SCREEN PREVIEW */}
      {found && (
        <div className="print:hidden animate-[fadeIn_.45s_cubic-bezier(0.16,1,0.3,1)]">
          <Card className="preview-card mx-auto w-full max-w-3xl overflow-hidden !p-0 shadow-[0_25px_60px_-20px_rgba(4,82,59,0.35)]">
            <div className="preview-header relative overflow-hidden px-6 py-6 text-white sm:px-8 bg-gradient-to-br from-[#032a1d] via-[#054e38] to-[#07704f]">
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/95 p-2 shadow-lg">
                    <img src={logo} alt="Torki Bazar Logo" className="h-12 w-12 object-contain" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Torki Bazar</h2>
                    <p className="text-sm font-medium text-emerald-200">Official Expense Record</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Reference #</p>
                  <p className="mt-1 font-mono text-lg font-black">{found.expenseNumber}</p>
                  <p className="mt-1 text-xs text-emerald-100/80">{formatDateTime(found.expenseDate)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Category</p>
                <p className="mt-3 font-bold text-slate-900">{found.category.name}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Payment Method</p>
                <p className="mt-3 font-bold uppercase text-slate-900">{found.paymentMethod}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Amount Paid</p>
                <p className="mt-2 text-2xl font-black tabular-nums text-emerald-800">{formatBDT(found.amount)}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
              <p className="text-xs font-semibold text-slate-400">Description / Note</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{found.description || DASH}</p>
              {found.reference && (
                <p className="mt-2 text-xs text-slate-500">Reference: {found.reference}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">
              <Button variant="secondary" onClick={handlePrint} className="!rounded-xl">
                <span className="flex items-center gap-2">
                  <PrinterIcon />
                  Print Expense Document
                </span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* FULL PRINT RECEIPT AREA */}
      {found && (
        <div id="expense-print-area" className="hidden print:block">
          <div className="mx-auto w-full max-w-[190mm] bg-white text-slate-900 p-8">
            <div className="border-b-2 border-slate-800 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={logo} alt="Torki Bazar Logo" className="h-16 w-16 object-contain" />
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Torki Bazar</h1>
                    <p className="mt-0.5 text-xs font-medium text-slate-600">Fast Delivery · Online Grocery Shop</p>
                    <div className="mt-1.5 text-[10px] leading-4 text-slate-500">
                      <p>Torki Bandar, Gournadi, Barishal</p>
                      <p>contact@torkibazar.com · torkibazar.com</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base font-bold">{found.expenseNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(found.expenseDate)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-b border-slate-200 py-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Expense Particulars</p>
                <p className="mt-2 text-sm font-semibold">Category: {found.category.name}</p>
                <p className="mt-1 text-xs text-slate-600">Description: {found.description}</p>
                <p className="mt-1 text-xs text-slate-600">Reference: {found.reference || DASH}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Transaction Info</p>
                <p className="mt-2 text-sm font-semibold uppercase">Method: {found.paymentMethod}</p>
                <p className="mt-1 text-xs text-slate-600">Processed By: {found.createdBy?.name || "Admin"}</p>
              </div>
            </div>

            <div className="py-6">
              <div className="flex items-center justify-between border-b border-slate-300 pb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-700">Total Disbursement</span>
                <span className="text-2xl font-bold">{formatBDT(found.amount)}</span>
              </div>
            </div>

            <div className="mt-16 border-t border-slate-300 pt-6 text-center">
              <p className="text-xs font-semibold text-slate-600">Authorized Financial Outflow Record · Torki Bazar Management</p>
              <p className="mt-1 text-[10px] text-slate-400">System generated administrative document</p>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSES LIST TABLE */}
      <div className="print:hidden reveal" style={{ animationDelay: "120ms" }}>
        <Card className="!overflow-hidden !p-0">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ReceiptIcon />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Ledger</p>
                <h2 className="text-sm font-black text-slate-900">Recorded Expenses</h2>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              {expenses.length} record{expenses.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="expenses-table px-1 py-1">
            <DataTable
              rows={expenses}
              keyFor={(e) => e.id}
              emptyMessage="No operating expenses recorded yet."
              columns={[
                {
                  header: "Expense #",
                  accessor: (e) => <span className="font-mono text-xs font-bold text-slate-700">{e.expenseNumber}</span>,
                },
                {
                  header: "Date",
                  accessor: (e) => <span className="text-slate-500">{formatDateTime(e.expenseDate)}</span>,
                },
                {
                  header: "Category",
                  accessor: (e) => <span className="font-semibold text-slate-800">{e.category.name}</span>,
                },
                {
                  header: "Description",
                  accessor: (e) => <span className="text-slate-600">{e.description}</span>,
                },
                {
                  header: "Amount",
                  accessor: (e) => <span className="font-bold tabular-nums text-slate-900">{formatBDT(e.amount)}</span>,
                },
                {
                  header: "Payment",
                  accessor: (e) => <span className="uppercase text-xs font-bold text-slate-700">{e.paymentMethod}</span>,
                },
                {
                  header: "",
                  accessor: (e) => (
                    <button
                      type="button"
                      className="group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold text-emerald-700 transition-all duration-300 hover:gap-1.5 hover:bg-emerald-50"
                      onClick={() => setFound(e)}
                    >
                      View & Print
                      <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                        <ArrowIcon />
                      </span>
                    </button>
                  ),
                },
              ]}
            />
          </div>
        </Card>
      </div>

        </>
      )}

      {/* INVENTORY LOSS HISTORY */}
      {activeSection === "INVENTORY_LOSS" && (
        <div
          className="print:hidden reveal space-y-4"
          style={{ animationDelay: "100ms" }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total Quantity Lost
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {inventoryLossTotalQuantity}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Damaged and expired stock
              </div>
            </Card>

            <Card>
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total Loss Value
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {formatBDT(inventoryLossTotalValue)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Based on batch purchase cost
              </div>
            </Card>
          </div>

          <Card>
            <div className="mb-4">
              <h2 className="text-lg font-black text-slate-900">
                Inventory Loss History
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Stock written off as damaged or expired. This is a read-only
                history; no second expense is created here.
              </p>
            </div>

            <DataTable
              columns={[
                {
                  key: "date",
                  header: "Date",
                  accessor: (item: InventoryLoss) =>
                    formatDateTime(item.date),
                },
                {
                  key: "product",
                  header: "Product",
                  accessor: (item: InventoryLoss) => (
                    <div>
                      <div className="font-semibold text-slate-900">
                        {item.productName}
                      </div>
                      <div className="text-xs text-slate-500">
                        SKU: {item.sku || DASH}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "batch",
                  header: "Batch",
                  accessor: (item: InventoryLoss) =>
                    item.batchCode || DASH,
                },
                {
                  key: "reason",
                  header: "Reason",
                  accessor: (item: InventoryLoss) => (
                    <span className="font-bold">
                      {item.reason}
                    </span>
                  ),
                },
                {
                  key: "quantity",
                  header: "Quantity",
                  accessor: (item: InventoryLoss) =>
                    `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`,
                },
                {
                  key: "unitCost",
                  header: "Unit Cost",
                  accessor: (item: InventoryLoss) =>
                    formatBDT(item.unitCost),
                },
                {
                  key: "lossValue",
                  header: "Loss Value",
                  accessor: (item: InventoryLoss) => (
                    <span className="font-bold">
                      {formatBDT(item.lossValue)}
                    </span>
                  ),
                },
              ]}
              rows={inventoryLosses}
              keyFor={(item) => item.id}
              emptyMessage="No inventory losses recorded."
            />
          </Card>

          <Card>
            <div className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">
                Accounting note:
              </span>{" "}
              Each inventory write-off creates one Inventory Loss expense
              record for reporting, but it does not deduct Cash, Bank, or
              bKash. Do not record the same loss again as a normal expense.
            </div>
          </Card>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-[fadeIn_.25s_cubic-bezier(0.16,1,0.3,1)]">
            <h2 className="text-lg font-black text-slate-900">Record Operating Expense</h2>
            <p className="mt-1 text-xs text-slate-500">The selected payment method will be used to record this financial outflow.</p>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Category</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Amount (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Description</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500"
                  placeholder="e.g. Electricity bill, Office supplies"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Payment Method</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Reference (Optional)</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500"
                    placeholder="Invoice # or Ref"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)} className="!rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="!rounded-xl">
                  Save & Record Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .reveal {
          animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          #expense-print-area, #expense-print-area * { visibility: visible; }
          #expense-print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
