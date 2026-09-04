import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { Field, Input, Select } from "../components/Form";
import { Modal } from "../components/Modal";
import { formatBDT, formatDate } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface Batch {
  id: string;
  batchCode: string;
  purchaseDate: string;
  manufacturingDate: string | null;
  quantityReceived: string;
  remainingQuantity: string;
  quantityReturned: string;
  quantitySold?: number;
  purchasePrice: string;
  totalCost?: number;
  expiryDate: string | null;
  notes: string | null;
  status: string;
  derivedStatus?: string;
  daysRemaining?: number | null;
  severity?: string;
  product: { name: string; sku: string | null; unit?: { abbreviation: string } };
  supplier?: { name: string } | null;
  purchase?: { purchaseNumber: string } | null;
  purchaseId?: string | null;
}

const SUPPLIER_RETURN_REASONS = [
  "EXPIRED",
  "NEAR_EXPIRY",
  "DAMAGED",
  "DEFECTIVE",
  "QUALITY_ISSUE",
  "OTHER",
];

const readableReason = (value: string) =>
  value.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

const DASH = "—";

const severityColor: Record<string, string> = {
  EXPIRED: "text-red-600 font-semibold",
  CRITICAL: "text-red-500 font-semibold",
  URGENT: "text-amber-600 font-semibold",
  WARNING: "text-amber-500",
  NORMAL: "text-slate-500",
  NONE: "text-slate-400",
};

export function InventoryPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [expiring, setExpiring] = useState<Batch[]>([]);
  const [expired, setExpired] = useState<Batch[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [editForm, setEditForm] = useState({
    expiryDate: "",
    manufacturingDate: "",
    notes: "",
  });
  const [handling, setHandling] = useState<Batch | null>(null);
  const [handleForm, setHandleForm] = useState({
    action: "RETURN" as "RETURN" | "DISCARD",
    quantity: "",
    reason: "EXPIRED",
    creditAmount: "",
    settlementType: "CREDIT" as "CREDIT" | "CASH_REFUND",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") ?? "all";
  const push = useToastStore((s) => s.push);

  async function load() {
    setLoading(true);
    try {
      const [all, soon, gone, low] = await Promise.all([
        call<Batch[]>("inventory:batches"),
        call<Batch[]>("inventory:expiringBatches"),
        call<Batch[]>("inventory:expiredBatches"),
        call<any[]>("products:lowStock"),
      ]);

      setBatches(all);
      setExpiring(soon);
      setExpired(gone);
      setLowStock(low);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load inventory",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toDateInput(value: string | null) {
    return value ? new Date(value).toISOString().slice(0, 10) : "";
  }

  function openEdit(b: Batch) {
    setEditForm({
      expiryDate: toDateInput(b.expiryDate),
      manufacturingDate: toDateInput(b.manufacturingDate),
      notes: b.notes ?? "",
    });
    setEditing(b);
  }

  const visibleBatches = useMemo(() => {
    if (view === "expiring") {
      const ids = new Set(expiring.map((b) => b.id));
      return batches.filter((b) => ids.has(b.id));
    }

    if (view === "expired") {
      const ids = new Set(expired.map((b) => b.id));
      return batches.filter(
        (b) => ids.has(b.id) || b.derivedStatus === "EXPIRED"
      );
    }

    return batches;
  }, [batches, expiring, expired, view]);

  const needsHandling = (b: Batch) =>
    Number(b.remainingQuantity) > 0 &&
    (b.severity === "EXPIRED" ||
      b.severity === "CRITICAL" ||
      b.severity === "URGENT" ||
      b.severity === "WARNING");

  function openHandle(b: Batch) {
    setHandleForm({
      action: b.purchaseId ? "RETURN" : "DISCARD",
      quantity: String(Number(b.remainingQuantity)),
      reason: b.severity === "EXPIRED" ? "EXPIRED" : "NEAR_EXPIRY",
      creditAmount: "",
      settlementType: "CREDIT",
      notes: "",
    });

    setHandling(b);
  }

  async function handleBatchAction(e: React.FormEvent) {
    e.preventDefault();

    if (!handling) return;

    const quantity = Number(handleForm.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      push("Quantity must be greater than zero.", "error");
      return;
    }

    if (quantity > Number(handling.remainingQuantity)) {
      push(
        `Only ${Number(handling.remainingQuantity)} unit(s) remain in this batch.`,
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      if (handleForm.action === "RETURN") {
        if (!handling.purchaseId) {
          push(
            "This batch has no linked purchase, so it cannot be returned to a supplier.",
            "error"
          );
          return;
        }

        await call("supplierReturns:create", {
          purchaseId: handling.purchaseId,
          batchId: handling.id,
          quantity,
          reason: handleForm.reason,
          notes: handleForm.notes || undefined,
          settlementType: handleForm.settlementType,
          returnValue:
            handleForm.creditAmount === ""
              ? undefined
              : Number(handleForm.creditAmount),
        });

        push(
          "Returned to supplier — stock and payable updated.",
          "success"
        );
      } else {
        await call("inventory:writeOffBatch", {
          batchId: handling.id,
          quantity,
          reason:
            handleForm.reason === "EXPIRED" ? "EXPIRED" : "DAMAGED",
          notes: handleForm.notes || undefined,
        });

        push(
          "Recorded as inventory loss — stock updated.",
          "success"
        );
      }

      setHandling(null);
      await load();
      call("notifications:refresh").catch(() => {});
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to handle batch",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();

    if (!editing) return;

    setSaving(true);

    try {
      await call("inventory:updateBatch", {
        id: editing.id,
        expiryDate: editForm.expiryDate || null,
        manufacturingDate: editForm.manufacturingDate || null,
        notes: editForm.notes || null,
      });

      push("Batch updated.", "success");
      setEditing(null);

      await load();

      call("notifications:refresh").catch(() => {});
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to update batch",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  /* -----------------------------------------------------------
     PREMIUM UI HELPERS
     ----------------------------------------------------------- */

  const totalUnits = batches.reduce(
    (sum, b) => sum + Number(b.remainingQuantity || 0),
    0
  );

  const totalReceived = batches.reduce(
    (sum, b) => sum + Number(b.quantityReceived || 0),
    0
  );

  const totalSold = batches.reduce(
    (sum, b) => sum + Number(b.quantitySold || 0),
    0
  );

  const inventoryValue = batches.reduce(
    (sum, b) =>
      sum +
      Number(b.remainingQuantity || 0) *
        Number(b.purchasePrice || 0),
    0
  );

  const getStatusStyle = (status?: string) => {
    const value = String(status ?? "").toUpperCase();

    if (value === "EXPIRED") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (value === "CRITICAL") {
      return "bg-red-50 text-red-600 border-red-200";
    }

    if (value === "URGENT") {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }

    if (value === "WARNING") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const getStatusDot = (status?: string) => {
    const value = String(status ?? "").toUpperCase();

    if (value === "EXPIRED" || value === "CRITICAL") {
      return "bg-red-500";
    }

    if (value === "URGENT" || value === "WARNING") {
      return "bg-amber-500";
    }

    return "bg-emerald-500";
  };

  const getDaysBadge = (b: Batch) => {
    if (b.daysRemaining === null || b.daysRemaining === undefined) {
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {DASH}
        </span>
      );
    }

    const days = Number(b.daysRemaining);

    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-200">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {Math.abs(days)}d overdue
        </span>
      );
    }

    if (days <= 7) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
          {days}d left
        </span>
      );
    }

    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {days}d left
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {days}d left
      </span>
    );
  };

  return (
    <div className="min-h-full space-y-7 pb-10">

      {/* =====================================================
          HERO
         ===================================================== */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              Live Inventory
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Inventory
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Complete batch visibility with stock levels, supplier
              traceability, expiry monitoring and inventory health.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              📦
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Active batches
              </p>
              <p className="text-xl font-bold text-slate-900">
                {batches.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          KPI CARDS
         ===================================================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Stock on Hand
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {totalUnits.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Total remaining units
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg">
              📦
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inventory Value
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {formatBDT(inventoryValue)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Based on remaining stock
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              ৳
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-50 transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Expiring Soon
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {expiring.length}
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Needs attention
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-lg">
              ⏳
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-red-50 transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Expired
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {expired.length}
              </p>
              <p className="mt-1 text-xs text-red-600">
                Excluded from selling
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-lg">
              ⚠️
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN INVENTORY
         ===================================================== */}
      <Card>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {view === "expiring"
                  ? "Expiring Soon Batches"
                  : view === "expired"
                  ? "Expired Batches"
                  : "All Batches"}
              </h2>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                {visibleBatches.length}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Monitor stock movement and batch-level traceability.
            </p>
          </div>

          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(
              [
                ["all", "All"],
                ["expiring", "Expiring Soon"],
                ["expired", "Expired"],
              ] as const
            ).map(([key, text]) => (
              <button
                key={key}
                onClick={() =>
                  setSearchParams(key === "all" ? {} : { view: key })
                }
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  view === key
                    ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <DataTable
            loading={loading}
            rows={visibleBatches}
            keyFor={(b) => b.id}
            emptyMessage={
              view === "all"
                ? "No batches yet. Receive stock from Purchases to create one."
                : "No batches in this view."
            }
            columns={[
              {
                header: "Product",
                accessor: (b) => (
                  <div className="min-w-[180px]">
                    <div className="font-bold text-slate-800">
                      {b.product.name}
                    </div>
                    {b.product.unit?.abbreviation && (
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        Unit: {b.product.unit.abbreviation}
                      </div>
                    )}
                  </div>
                ),
              },

              {
                header: "SKU",
                accessor: (b) => (
                  <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                    {b.product.sku || DASH}
                  </span>
                ),
              },

              {
                header: "Batch",
                accessor: (b) => (
                  <span className="font-mono text-xs font-bold text-brand-700">
                    {b.batchCode}
                  </span>
                ),
              },

              {
                header: "Supplier",
                accessor: (b) => (
                  <span className="font-medium text-slate-600">
                    {b.supplier?.name ?? DASH}
                  </span>
                ),
              },

              {
                header: "Purchase #",
                accessor: (b) => (
                  <span className="font-mono text-xs text-slate-500">
                    {b.purchase?.purchaseNumber ?? DASH}
                  </span>
                ),
              },

              {
                header: "Purchase Date",
                accessor: (b) => (
                  <span className="whitespace-nowrap text-sm text-slate-500">
                    {formatDate(b.purchaseDate)}
                  </span>
                ),
              },

              {
                header: "Received",
                accessor: (b) => (
                  <span className="font-semibold text-slate-700">
                    {Number(b.quantityReceived)}
                  </span>
                ),
              },

              {
                header: "Remaining",
                accessor: (b) => (
                  <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-brand-50 px-2.5 py-1 font-bold text-brand-700">
                    {Number(b.remainingQuantity)}
                  </span>
                ),
              },

              {
                header: "Sold",
                accessor: (b) => (
                  <span className="font-medium text-slate-600">
                    {b.quantitySold ?? DASH}
                  </span>
                ),
              },

              {
                header: "Returned",
                accessor: (b) => (
                  <span className="font-medium text-slate-600">
                    {Number(b.quantityReturned)}
                  </span>
                ),
              },

              {
                header: "Unit Cost",
                accessor: (b) => (
                  <span className="font-semibold text-slate-700">
                    {formatBDT(b.purchasePrice)}
                  </span>
                ),
              },

              {
                header: "Expiry",
                accessor: (b) => (
                  <span
                    className={
                      b.expiryDate
                        ? "whitespace-nowrap font-medium text-slate-600"
                        : "text-slate-400"
                    }
                  >
                    {b.expiryDate ? formatDate(b.expiryDate) : DASH}
                  </span>
                ),
              },

              {
                header: "Days Left",
                accessor: (b) => getDaysBadge(b),
              },

              {
                header: "Status",
                accessor: (b) => {
                  const status = b.derivedStatus ?? b.status;

                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusStyle(
                        b.severity ?? status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                          b.severity ?? status
                        )}`}
                      />
                      {status}
                    </span>
                  );
                },
              },

              {
                header: "Actions",
                accessor: (b) => (
                  <div className="flex min-w-[150px] flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-transform duration-200 hover:-translate-y-0.5"
                      onClick={() => openEdit(b)}
                    >
                      Edit
                    </Button>

                    {needsHandling(b) && (
                      <Button
                        variant="secondary"
                        className="rounded-lg border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-amber-100"
                        onClick={() => openHandle(b)}
                      >
                        Handle
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Card>

      {/* =====================================================
          EXPIRING
         ===================================================== */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                ⏳
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Expiring Soon
                </h2>
                <p className="text-xs text-slate-400">
                  Batches inside the expiry alert window
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
            {expiring.length} batches
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-amber-100">
          <DataTable
            rows={expiring}
            keyFor={(b) => b.id}
            emptyMessage="Nothing expiring within the alert window."
            columns={[
              {
                header: "Product",
                accessor: (b) => (
                  <span className="font-bold text-slate-800">
                    {b.product.name}
                  </span>
                ),
              },
              {
                header: "Batch",
                accessor: (b) => (
                  <span className="font-mono text-xs font-bold text-brand-700">
                    {b.batchCode}
                  </span>
                ),
              },
              {
                header: "Supplier",
                accessor: (b) => b.supplier?.name ?? DASH,
              },
              {
                header: "Purchase Date",
                accessor: (b) => formatDate(b.purchaseDate),
              },
              {
                header: "Quantity",
                accessor: (b) => (
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-700">
                    {Number(b.remainingQuantity)}
                  </span>
                ),
              },
              {
                header: "Expiry",
                accessor: (b) => (
                  <span className="font-semibold text-slate-700">
                    {b.expiryDate ? formatDate(b.expiryDate) : DASH}
                  </span>
                ),
              },
              {
                header: "Days Remaining",
                accessor: (b) => getDaysBadge(b),
              },
            ]}
          />
        </div>
      </Card>

      {/* =====================================================
          EXPIRED
         ===================================================== */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg">
                ⚠️
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Expired Stock
                </h2>
                <p className="text-xs text-slate-400">
                  Excluded from sellable stock
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
            {expired.length} batches
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-red-100">
          <DataTable
            rows={expired}
            keyFor={(b) => b.id}
            emptyMessage="No expired batches."
            columns={[
              {
                header: "Product",
                accessor: (b) => (
                  <span className="font-bold text-slate-800">
                    {b.product.name}
                  </span>
                ),
              },
              {
                header: "Batch",
                accessor: (b) => (
                  <span className="font-mono text-xs font-bold text-red-600">
                    {b.batchCode}
                  </span>
                ),
              },
              {
                header: "Supplier",
                accessor: (b) => b.supplier?.name ?? DASH,
              },
              {
                header: "Purchase Date",
                accessor: (b) => formatDate(b.purchaseDate),
              },
              {
                header: "Quantity",
                accessor: (b) => (
                  <span className="rounded-lg bg-red-50 px-2.5 py-1 font-bold text-red-700">
                    {Number(b.remainingQuantity)}
                  </span>
                ),
              },
              {
                header: "Expiry",
                accessor: (b) => (
                  <span className="font-semibold text-red-600">
                    {b.expiryDate ? formatDate(b.expiryDate) : DASH}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </Card>

      {/* =====================================================
          LOW STOCK
         ===================================================== */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
                📉
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Low Stock
                </h2>
                <p className="text-xs text-slate-400">
                  Products approaching minimum stock levels
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
            {lowStock.length} products
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-orange-100">
          <DataTable
            rows={lowStock}
            keyFor={(p) => p.id}
            emptyMessage="All products are above their minimum stock level."
            columns={[
              {
                header: "Product",
                accessor: (p) => (
                  <span className="font-bold text-slate-800">
                    {p.name}
                  </span>
                ),
              },
              {
                header: "SKU",
                accessor: (p) => (
                  <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                    {p.sku || DASH}
                  </span>
                ),
              },
              {
                header: "Current Stock",
                accessor: (p) => (
                  <span className="inline-flex rounded-lg bg-orange-50 px-3 py-1 font-bold text-orange-700">
                    {Number(p.currentStock)}
                  </span>
                ),
              },
              {
                header: "Minimum Stock",
                accessor: (p) => (
                  <span className="font-semibold text-slate-600">
                    {Number(p.minimumStock)}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </Card>

      {/* =====================================================
          EDIT BATCH MODAL
         ===================================================== */}
      <Modal
        open={!!editing}
        title={editing ? `Edit Batch ${editing.batchCode}` : "Edit Batch"}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <form onSubmit={handleEdit} className="space-y-5">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Product
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {editing.product.name}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Supplier
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {editing.supplier?.name ?? DASH}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Purchase
                  </dt>
                  <dd className="mt-1 font-mono text-xs font-bold text-brand-700">
                    {editing.purchase?.purchaseNumber ?? DASH}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Remaining
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {Number(editing.remainingQuantity)}
                  </dd>
                </div>

              </dl>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Manufacturing date">
                <Input
                  type="date"
                  value={editForm.manufacturingDate}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      manufacturingDate: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Expiry date">
                <Input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      expiryDate: e.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <Field label="Batch notes">
              <Input
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    notes: e.target.value,
                  })
                }
              />
            </Field>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-700">
              Batch, product, purchase links and quantities are protected.
              Only dates and notes can be corrected.
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-3 font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Batch"}
            </Button>
          </form>
        )}
      </Modal>

      {/* =====================================================
          HANDLE BATCH MODAL
         ===================================================== */}
      <Modal
        open={!!handling}
        title={
          handling
            ? `Handle Batch ${handling.batchCode}`
            : "Handle Batch"
        }
        onClose={() => setHandling(null)}
      >
        {handling && (
          <form
            onSubmit={handleBatchAction}
            className="space-y-5"
          >

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Product
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {handling.product.name}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Supplier
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {handling.supplier?.name ?? DASH}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Expiry
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {handling.expiryDate
                      ? formatDate(handling.expiryDate)
                      : DASH}

                    {handling.daysRemaining !== null &&
                    handling.daysRemaining !== undefined
                      ? ` (${handling.daysRemaining} days)`
                      : ""}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Remaining
                  </dt>
                  <dd className="mt-1 font-bold text-brand-700">
                    {Number(handling.remainingQuantity)}
                  </dd>
                </div>

              </dl>
            </div>

            <Field label="What should happen to this stock?">
              <Select
                value={handleForm.action}
                onChange={(e) =>
                  setHandleForm({
                    ...handleForm,
                    action: e.target.value as
                      | "RETURN"
                      | "DISCARD",
                  })
                }
              >
                <option
                  value="RETURN"
                  disabled={!handling.purchaseId}
                >
                  Return to Supplier
                  {!handling.purchaseId
                    ? " (no linked purchase)"
                    : ""}
                </option>

                <option value="DISCARD">
                  Discard / Damaged (inventory loss)
                </option>
              </Select>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Quantity">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  max={Number(handling.remainingQuantity)}
                  required
                  value={handleForm.quantity}
                  onChange={(e) =>
                    setHandleForm({
                      ...handleForm,
                      quantity: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Reason">
                <Select
                  value={handleForm.reason}
                  onChange={(e) =>
                    setHandleForm({
                      ...handleForm,
                      reason: e.target.value,
                    })
                  }
                >
                  {(handleForm.action === "RETURN"
                    ? SUPPLIER_RETURN_REASONS
                    : ["EXPIRED", "DAMAGED"]
                  ).map((r) => (
                    <option key={r} value={r}>
                      {readableReason(r)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {handleForm.action === "RETURN" && (
              <>
                <Field label="How is the supplier settling it?">
                  <Select
                    value={handleForm.settlementType}
                    onChange={(e) =>
                      setHandleForm({
                        ...handleForm,
                        settlementType: e.target.value as
                          | "CREDIT"
                          | "CASH_REFUND",
                      })
                    }
                  >
                    <option value="CREDIT">
                      Supplier Credit (applied to future purchases)
                    </option>

                    <option value="CASH_REFUND">
                      Cash Refund (money received back)
                    </option>
                  </Select>
                </Field>

                <Field
                  label={
                    handleForm.settlementType === "CASH_REFUND"
                      ? "Refund amount (optional)"
                      : "Credit amount (optional)"
                  }
                >
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder={`Leave empty to use the original cost (${formatBDT(
                      Number(handling.purchasePrice) *
                        Number(handleForm.quantity || 0)
                    )})`}
                    value={handleForm.creditAmount}
                    onChange={(e) =>
                      setHandleForm({
                        ...handleForm,
                        creditAmount: e.target.value,
                      })
                    }
                  />
                </Field>
              </>
            )}

            <Field label="Notes">
              <Input
                value={handleForm.notes}
                onChange={(e) =>
                  setHandleForm({
                    ...handleForm,
                    notes: e.target.value,
                  })
                }
              />
            </Field>

            <div
              className={`rounded-xl border p-3 text-xs leading-5 ${
                handleForm.action === "RETURN"
                  ? "border-blue-100 bg-blue-50 text-blue-700"
                  : "border-red-100 bg-red-50 text-red-700"
              }`}
            >
              {handleForm.action === "RETURN"
                ? handleForm.settlementType === "CASH_REFUND"
                  ? "The quantity leaves stock and the refund is recorded as money received — the supplier payable is unchanged."
                  : "The quantity leaves stock and the value is held as supplier credit, applied automatically to what you owe and to future purchases."
                : "The quantity leaves stock and is recorded as an inventory loss — it is not posted to Expenses."}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-3 font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : handleForm.action === "RETURN"
                ? "Return to Supplier"
                : "Record Inventory Loss"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}