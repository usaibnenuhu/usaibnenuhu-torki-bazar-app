import { useEffect, useMemo, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Field, Input, Select } from "../components/Form";
import { Modal } from "../components/Modal";
import { formatBDT, formatDate } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface Supplier {
  id: string;
  name: string;
  phone?: string;
}

interface PurchaseRow {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplierId: string;
  status: string;
}

interface PurchaseDetails extends PurchaseRow {
  items: {
    id: string;
    batchId: string | null;
    unitCost: string;
    quantity: string;
    quantityInStock: number;
    quantityReturned: number;
    product: {
      name: string;
      sku: string | null;
    };
    batch: {
      id: string;
      batchCode: string;
      remainingQuantity: string;
    } | null;
  }[];
}

interface SupplierReturnRow {
  id: string;
  returnNumber: string;
  returnDate: string;
  quantity: string;
  unitCost: string;
  returnValue: string;
  reason: string;
  notes: string | null;
  settlementType: string;
  status: string;
  supplier: {
    name: string;
    phone: string;
  };
  purchase: {
    purchaseNumber: string;
    purchaseDate: string;
  };
  product: {
    name: string;
    sku: string | null;
    barcode: string | null;
  };
  batch: {
    batchCode: string;
  };
}

interface SupplierReturnDetails extends SupplierReturnRow {
  quantityPurchased: string;
  quantitySold: string;
  quantityReturnedTotal: string;
  quantityAvailable: string;
}

const REASONS = [
  "DAMAGED",
  "DEFECTIVE",
  "WRONG_PRODUCT",
  "WRONG_QUANTITY",
  "EXPIRED",
  "NEAR_EXPIRY",
  "SUPPLIER_REQUEST",
  "QUALITY_ISSUE",
  "OTHER",
];

const DASH = "—";

const label = (value: string) =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

export function SupplierReturnsPage() {
  const [returns, setReturns] = useState<SupplierReturnRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [details, setDetails] = useState<SupplierReturnDetails | null>(null);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [settlementFilter, setSettlementFilter] = useState("ALL");

  const [form, setForm] = useState({
    supplierId: "",
    purchaseId: "",
    batchId: "",
    quantity: "",
    reason: "DAMAGED",
    settlementType: "CREDIT",
    paymentMethod: "CASH",
    notes: "",
    returnDate: "",
  });

  const [purchaseDetails,
    setPurchaseDetails] =
    useState<PurchaseDetails | null>(null);

  const push = useToastStore((s) => s.push);

  async function load() {
    setLoading(true);

    try {
      setReturns(
        await call<SupplierReturnRow[]>("supplierReturns:list")
      );
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to load supplier returns",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    call<Supplier[]>("suppliers:list")
      .then(setSuppliers)
      .catch(() => {});

    call<PurchaseRow[]>("purchases:list")
      .then(setPurchases)
      .catch(() => {});
  }, []);

  /*
   * ------------------------------------------------------------
   * FILTERED RETURNS
   * ------------------------------------------------------------
   */

  const filteredReturns = useMemo(() => {
    const q = search.trim().toLowerCase();

    return returns.filter((r) => {
      const matchesSearch =
        !q ||
        r.returnNumber.toLowerCase().includes(q) ||
        r.supplier?.name?.toLowerCase().includes(q) ||
        r.product?.name?.toLowerCase().includes(q) ||
        r.product?.sku?.toLowerCase().includes(q) ||
        r.batch?.batchCode?.toLowerCase().includes(q) ||
        r.purchase?.purchaseNumber?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || r.status === statusFilter;

      const matchesSettlement =
        settlementFilter === "ALL" ||
        r.settlementType === settlementFilter;

      return matchesSearch && matchesStatus && matchesSettlement;
    });
  }, [returns, search, statusFilter, settlementFilter]);

  /*
   * ------------------------------------------------------------
   * SUMMARY
   * ------------------------------------------------------------
   */

  const summary = useMemo(() => {
    const completed = returns.filter(
      (r) => r.status === "COMPLETED"
    );

    const cancelled = returns.filter(
      (r) => r.status === "CANCELLED"
    );

    const returnedValue = completed.reduce(
      (sum, r) => sum + Number(r.returnValue || 0),
      0
    );

    const returnedQuantity = completed.reduce(
      (sum, r) => sum + Number(r.quantity || 0),
      0
    );

    const supplierCredit = completed
      .filter((r) => r.settlementType === "CREDIT")
      .reduce((sum, r) => sum + Number(r.returnValue || 0), 0);

    const cashRefund = completed
      .filter((r) => r.settlementType === "CASH_REFUND")
      .reduce((sum, r) => sum + Number(r.returnValue || 0), 0);

    return {
      total: returns.length,
      completed: completed.length,
      cancelled: cancelled.length,
      returnedValue,
      returnedQuantity,
      supplierCredit,
      cashRefund,
    };
  }, [returns]);

  /*
   * ------------------------------------------------------------
   * CREATE RETURN
   * ------------------------------------------------------------
   */

  const supplierPurchases = purchases.filter(
    (p) =>
      p.supplierId === form.supplierId &&
      p.status !== "VOID"
  );

  const selectedItem = purchaseDetails?.items.find(
    (i) => i.batchId === form.batchId
  );

  const maxReturnable = selectedItem?.quantityInStock ?? 0;

  async function selectPurchase(purchaseId: string) {
    setForm((f) => ({
      ...f,
      purchaseId,
      batchId: "",
      quantity: "",
    }));

    setPurchaseDetails(null);

    if (!purchaseId) return;

    try {
      setPurchaseDetails(
        await call<PurchaseDetails>("purchases:get", {
          id: purchaseId,
        })
      );
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to load purchase",
        "error"
      );
    }
  }

  function openCreate() {
    setForm({
      supplierId: "",
      purchaseId: "",
      batchId: "",
      quantity: "",
      reason: "DAMAGED",
      settlementType: "CREDIT",
      paymentMethod: "CASH",
      notes: "",
      returnDate: "",
    });

    setPurchaseDetails(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const quantity = Number(form.quantity);

    if (!form.supplierId) {
      push("Select a supplier.", "error");
      return;
    }

    if (!form.purchaseId) {
      push("Select the original purchase.", "error");
      return;
    }

    if (!form.batchId) {
      push("Select the batch being returned.", "error");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      push(
        "Return quantity must be greater than zero.",
        "error"
      );
      return;
    }

    if (quantity > maxReturnable) {
      push(
        `Only ${maxReturnable} unit(s) remain available in this batch.`,
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      await call("supplierReturns:create", {
        purchaseId: form.purchaseId,
        batchId: form.batchId,
        quantity,
        reason: form.reason,
        settlementType: form.settlementType,
        paymentMethod: form.settlementType === "CASH_REFUND" ? form.paymentMethod : undefined,
        notes: form.notes || undefined,
        returnDate: form.returnDate || undefined,
      });

      push(
        "Supplier return recorded — inventory and payable updated.",
        "success"
      );

      setModalOpen(false);

      setForm({
        supplierId: "",
        purchaseId: "",
        batchId: "",
        quantity: "",
        reason: "DAMAGED",
        settlementType: "CREDIT",
        paymentMethod: "CASH",
        notes: "",
        returnDate: "",
      });

      setPurchaseDetails(null);

      load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to record supplier return",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ------------------------------------------------------------
   * DETAILS
   * ------------------------------------------------------------
   */

  async function openDetails(id: string) {
    try {
      setDetails(
        await call<SupplierReturnDetails>(
          "supplierReturns:get",
          { id }
        )
      );
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Supplier return not found",
        "error"
      );
    }
  }

  /*
   * ------------------------------------------------------------
   * CANCEL
   * ------------------------------------------------------------
   */

  async function handleCancel(row: SupplierReturnRow) {
    const reason = window.prompt(
      `Cancel ${row.returnNumber}? Stock and payable will be restored. Reason:`
    );

    if (!reason) return;

    try {
      await call("supplierReturns:cancel", {
        id: row.id,
        reason,
      });

      push("Supplier return cancelled.", "success");

      load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to cancel supplier return",
        "error"
      );
    }
  }

  /*
   * ------------------------------------------------------------
   * UI
   * ------------------------------------------------------------
   */

  return (
    <div className="min-w-0 w-full space-y-5 overflow-x-hidden pb-8">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-600">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Inventory Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Supplier Returns
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage stock returned to suppliers, supplier credits,
            cash refunds, and return history.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            onClick={load}
            disabled={loading}
          >
            ↻ Refresh
          </Button>

          <Button onClick={openCreate}>
            + New Supplier Return
          </Button>
        </div>
      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          label="Total Returns"
          value={String(summary.total)}
          helper={`${summary.completed} completed · ${summary.cancelled} cancelled`}
          icon="↩"
        />

        <SummaryCard
          label="Returned Value"
          value={formatBDT(summary.returnedValue)}
          helper={`${summary.returnedQuantity} total units returned`}
          icon="৳"
        />

        <SummaryCard
          label="Supplier Credit"
          value={formatBDT(summary.supplierCredit)}
          helper="Credit applied to supplier balance"
          icon="→"
          tone="purple"
        />

        <SummaryCard
          label="Cash Refund"
          value={formatBDT(summary.cashRefund)}
          helper="Money received from suppliers"
          icon="৳"
          tone="blue"
        />
      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <Card>
        <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_190px] lg:items-end">

          <Field label="Search">
            <Input
              placeholder="Search return number, supplier, product, SKU, batch..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </Field>

          <Field label="Status">
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </Field>

          <Field label="Settlement">
            <Select
              value={settlementFilter}
              onChange={(e) =>
                setSettlementFilter(e.target.value)
              }
            >
              <option value="ALL">All Settlements</option>
              <option value="CREDIT">Supplier Credit</option>
              <option value="CASH_REFUND">Cash Refund</option>
            </Select>
          </Field>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredReturns.length}
            </span>{" "}
            of {returns.length} supplier returns
          </p>

          {(search ||
            statusFilter !== "ALL" ||
            settlementFilter !== "ALL") && (
            <button
              type="button"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setSettlementFilter("ALL");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* ======================================================
          RETURNS
      ====================================================== */}

      <Card className="overflow-hidden p-0">

        {/* Desktop header */}
        <div className="hidden border-b border-slate-100 bg-slate-50 px-5 py-3 xl:grid xl:grid-cols-[1.2fr_1.25fr_1.25fr_1.1fr_90px_120px_130px_90px] xl:gap-4">

          <TableHeader text="Return" />
          <TableHeader text="Supplier" />
          <TableHeader text="Product" />
          <TableHeader text="Purchase" />
          <TableHeader text="Qty" />
          <TableHeader text="Value" />
          <TableHeader text="Settlement" />
          <TableHeader text="Status" />
        </div>

        {loading ? (
          <LoadingRows />
        ) : filteredReturns.length === 0 ? (
          <EmptyState
            search={!!search}
            onCreate={openCreate}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReturns.map((r) => (
              <ReturnRow
                key={r.id}
                row={r}
                onView={() => openDetails(r.id)}
                onCancel={() => handleCancel(r)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* ======================================================
          CREATE MODAL
      ====================================================== */}

      <Modal
        open={modalOpen}
        title="New Supplier Return"
        onClose={() => setModalOpen(false)}
        wide
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-800">
              Return source
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <Field label="Supplier">
                <Select
                  required
                  value={form.supplierId}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      supplierId: e.target.value,
                      purchaseId: "",
                      batchId: "",
                      quantity: "",
                    });

                    setPurchaseDetails(null);
                  }}
                >
                  <option value="">
                    Select supplier...
                  </option>

                  {suppliers.map((s) => (
                    <option
                      key={s.id}
                      value={s.id}
                    >
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Original purchase">
                <Select
                  required
                  value={form.purchaseId}
                  onChange={(e) =>
                    selectPurchase(e.target.value)
                  }
                  disabled={!form.supplierId}
                >
                  <option value="">
                    {form.supplierId
                      ? "Select purchase..."
                      : "Select supplier first"}
                  </option>

                  {supplierPurchases.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.purchaseNumber} ·{" "}
                      {formatDate(p.purchaseDate)}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Return date">
                <Input
                  type="date"
                  value={form.returnDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      returnDate: e.target.value,
                    })
                  }
                />
              </Field>
            </div>
          </div>

          <Field label="Product / batch">
            <Select
              required
              value={form.batchId}
              onChange={(e) =>
                setForm({
                  ...form,
                  batchId: e.target.value,
                  quantity: "",
                })
              }
              disabled={!purchaseDetails}
            >
              <option value="">
                {purchaseDetails
                  ? "Select product / batch..."
                  : "Choose a purchase first"}
              </option>

              {purchaseDetails?.items
                .filter((i) => i.batchId)
                .map((i) => (
                  <option
                    key={i.batchId!}
                    value={i.batchId!}
                  >
                    {i.product.name} ·{" "}
                    {i.batch?.batchCode} ·{" "}
                    {i.quantityInStock} available
                  </option>
                ))}
            </Select>
          </Field>

          {selectedItem && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniInfo
                label="Purchased"
                value={String(
                  Number(selectedItem.quantity)
                )}
              />

              <MiniInfo
                label="Sold"
                value={String(
                  Number(selectedItem.quantity) -
                    selectedItem.quantityInStock -
                    selectedItem.quantityReturned
                )}
              />

              <MiniInfo
                label="Already Returned"
                value={String(
                  selectedItem.quantityReturned
                )}
              />

              <MiniInfo
                label="Available"
                value={String(
                  selectedItem.quantityInStock
                )}
                highlight
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label={`Return quantity${
                selectedItem
                  ? ` · max ${maxReturnable}`
                  : ""
              }`}
            >
              <Input
                type="number"
                min={0}
                step="any"
                max={maxReturnable || undefined}
                required
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Reason">
              <Select
                required
                value={form.reason}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reason: e.target.value,
                  })
                }
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {label(r)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Settlement">
              <Select
                value={form.settlementType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    settlementType: e.target.value,
                  })
                }
              >
                <option value="CREDIT">
                  Supplier Credit — applied to future purchases
                </option>

                <option value="CASH_REFUND">
                  Cash Refund — money received back
                </option>
              </Select>
            </Field>

            {form.settlementType === "CASH_REFUND" && (
              <Field label="Refund Payment Method">
                <Select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <option value="CASH">Cash</option>
                  <option value="BKASH">bKash</option>
                </Select>
              </Field>
            )}
          </div>

          <Field label="Notes">
            <Input
              placeholder="Optional notes about this return..."
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
            />
          </Field>

          {selectedItem &&
            Number(form.quantity) > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-slate-500">
                      Return value
                    </p>

                    <p className="text-xl font-semibold text-slate-900">
                      {formatBDT(
                        Number(form.quantity) *
                          Number(
                            selectedItem.unitCost
                          )
                      )}
                    </p>
                  </div>

                  <p className="max-w-md text-xs leading-5 text-slate-500">
                    {form.settlementType ===
                    "CASH_REFUND"
                      ? `Recorded as a cash refund received via ${form.paymentMethod}. Supplier payable remains unchanged.`
                      : "Recorded as supplier credit and applied against the supplier balance and future purchases."}
                  </p>
                </div>
              </div>
            )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Record Supplier Return"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      <Modal
        open={!!details}
        wide
        title={
          details
            ? `Supplier Return ${details.returnNumber}`
            : "Supplier Return"
        }
        onClose={() => setDetails(null)}
      >
        {details && (
          <div className="space-y-5">

            {/* Status banner */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Return
                </p>

                <p className="text-lg font-semibold text-slate-900">
                  {details.returnNumber}
                </p>

                <p className="text-sm text-slate-500">
                  {formatDate(details.returnDate)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={details.status} />

                <SettlementBadge
                  settlementType={
                    details.settlementType
                  }
                />
              </div>
            </div>

            {/* Supplier / purchase */}
            <Section title="Supplier & Purchase">
              <InfoGrid>
                <Detail
                  label="Supplier"
                  value={
                    details.supplier?.name ?? DASH
                  }
                />

                <Detail
                  label="Supplier phone"
                  value={
                    details.supplier?.phone ?? DASH
                  }
                />

                <Detail
                  label="Purchase number"
                  value={
                    details.purchase
                      ?.purchaseNumber ?? DASH
                  }
                />

                <Detail
                  label="Purchase date"
                  value={
                    details.purchase
                      ? formatDate(
                          details.purchase.purchaseDate
                        )
                      : DASH
                  }
                />
              </InfoGrid>
            </Section>

            {/* Product */}
            <Section title="Returned Item">
              <InfoGrid>
                <Detail
                  label="Product"
                  value={
                    details.product?.name ?? DASH
                  }
                />

                <Detail
                  label="SKU"
                  value={
                    details.product?.sku || DASH
                  }
                />

                <Detail
                  label="Barcode"
                  value={
                    details.product?.barcode || DASH
                  }
                />

                <Detail
                  label="Batch"
                  value={
                    details.batch?.batchCode ?? DASH
                  }
                />
              </InfoGrid>
            </Section>

            {/* Quantity */}
            <Section title="Inventory">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MiniInfo
                  label="Purchased"
                  value={String(
                    Number(
                      details.quantityPurchased
                    )
                  )}
                />

                <MiniInfo
                  label="Sold"
                  value={String(
                    Number(details.quantitySold)
                  )}
                />

                <MiniInfo
                  label="Returned Total"
                  value={String(
                    Number(
                      details.quantityReturnedTotal
                    )
                  )}
                />

                <MiniInfo
                  label="Currently Available"
                  value={String(
                    Number(
                      details.quantityAvailable
                    )
                  )}
                  highlight
                />
              </div>
            </Section>

            {/* Financial */}
            <Section title="Financial Details">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FinancialBox
                  label="Unit Cost"
                  value={formatBDT(details.unitCost)}
                />

                <FinancialBox
                  label="Quantity Returned"
                  value={String(
                    Number(details.quantity)
                  )}
                />

                <FinancialBox
                  label="Return Value"
                  value={formatBDT(
                    details.returnValue
                  )}
                  strong
                />
              </div>
            </Section>

            {/* Reason */}
            <Section title="Return Information">
              <InfoGrid>
                <Detail
                  label="Settlement"
                  value={
                    details.settlementType ===
                    "CASH_REFUND"
                      ? "Cash Refund"
                      : "Supplier Credit"
                  }
                />

                <Detail
                  label="Reason"
                  value={label(details.reason)}
                />

                <Detail
                  label="Notes"
                  value={details.notes || DASH}
                />
              </InfoGrid>
            </Section>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   RETURN ROW
============================================================ */

function ReturnRow({
  row,
  onView,
  onCancel,
}: {
  row: SupplierReturnRow;
  onView: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="group min-w-0 px-4 py-4 transition hover:bg-slate-50 sm:px-5">

      {/* Desktop */}
      <div className="hidden xl:grid xl:grid-cols-[1.2fr_1.25fr_1.25fr_1.1fr_90px_120px_130px_90px] xl:items-center xl:gap-4">

        {/* Return */}
        <div className="min-w-0">
          <button
            type="button"
            onClick={onView}
            className="block max-w-full truncate text-sm font-semibold text-slate-900 hover:text-brand-600"
          >
            {row.returnNumber}
          </button>

          <p className="mt-0.5 truncate text-xs text-slate-400">
            {formatDate(row.returnDate)}
          </p>
        </div>

        {/* Supplier */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {row.supplier?.name ?? DASH}
          </p>

          <p className="truncate text-xs text-slate-400">
            {row.supplier?.phone || DASH}
          </p>
        </div>

        {/* Product */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {row.product?.name ?? DASH}
          </p>

          <p className="truncate text-xs text-slate-400">
            {row.product?.sku
              ? `SKU ${row.product.sku}`
              : "No SKU"}
          </p>
        </div>

        {/* Purchase */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">
            {row.purchase?.purchaseNumber ?? DASH}
          </p>

          <p className="truncate text-xs text-slate-400">
            Batch {row.batch?.batchCode ?? DASH}
          </p>
        </div>

        {/* Qty */}
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {Number(row.quantity)}
          </p>

          <p className="text-xs text-slate-400">
            units
          </p>
        </div>

        {/* Value */}
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {formatBDT(row.returnValue)}
          </p>

          <p className="text-xs text-slate-400">
            @ {formatBDT(row.unitCost)}
          </p>
        </div>

        {/* Settlement */}
        <div>
          <SettlementBadge
            settlementType={
              row.settlementType
            }
          />
        </div>

        {/* Status */}
        <div>
          <StatusBadge status={row.status} />
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="xl:hidden">

        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onView}
              className="truncate text-sm font-semibold text-slate-900 hover:text-brand-600"
            >
              {row.returnNumber}
            </button>

            <p className="mt-0.5 text-xs text-slate-400">
              {formatDate(row.returnDate)}
            </p>
          </div>

          <div className="flex shrink-0 gap-1.5">
            <StatusBadge status={row.status} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">

          <MobileDetail
            label="Supplier"
            value={row.supplier?.name ?? DASH}
          />

          <MobileDetail
            label="Product"
            value={row.product?.name ?? DASH}
          />

          <MobileDetail
            label="Purchase"
            value={
              row.purchase?.purchaseNumber ?? DASH
            }
          />

          <MobileDetail
            label="Batch"
            value={
              row.batch?.batchCode ?? DASH
            }
          />

          <MobileDetail
            label="Quantity"
            value={`${Number(row.quantity)} units`}
          />

          <MobileDetail
            label="Value"
            value={formatBDT(row.returnValue)}
          />

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Settlement
            </p>

            <div className="mt-1">
              <SettlementBadge
                settlementType={
                  row.settlementType
                }
              />
            </div>
          </div>

          <MobileDetail
            label="Reason"
            value={label(row.reason)}
          />

          <MobileDetail
            label="SKU"
            value={row.product?.sku || DASH}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={onView}
          >
            View Details
          </Button>

          {row.status === "COMPLETED" && (
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={onCancel}
            >
              Cancel Return
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  label,
  value,
  helper,
  icon,
  tone = "green",
}: {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone?: "green" | "purple" | "blue";
}) {
  const iconClass =
    tone === "purple"
      ? "bg-purple-50 text-purple-600"
      : tone === "blue"
        ? "bg-blue-50 text-blue-600"
        : "bg-brand-50 text-brand-600";

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {helper}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function TableHeader({ text }: { text: string }) {
  return (
    <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {text}
    </div>
  );
}

function MobileDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function MiniInfo({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border px-3 py-3 ${
        highlight
          ? "border-brand-100 bg-brand-50"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-semibold ${
          highlight
            ? "text-brand-700"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FinancialBox({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? "text-xl font-semibold text-slate-900"
            : "text-lg font-semibold text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>

      <dd className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function InfoGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </dl>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        {title}
      </h3>

      {children}
    </section>
  );
}

/* ============================================================
   BADGES
============================================================ */

function SettlementBadge({
  settlementType,
}: {
  settlementType: string;
}) {
  const isCash =
    settlementType === "CASH_REFUND";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${
        isCash
          ? "border-blue-100 bg-blue-50 text-blue-700"
          : "border-purple-100 bg-purple-50 text-purple-700"
      }`}
    >
      <span className="shrink-0">
        {isCash ? "৳" : "↗"}
      </span>

      <span className="truncate">
        {isCash
          ? "Cash Refund"
          : "Supplier Credit"}
      </span>
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const completed = status === "COMPLETED";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${
        completed
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          completed
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {label(status)}
    </span>
  );
}

/* ============================================================
   LOADING / EMPTY
============================================================ */

function LoadingRows() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse px-5 py-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  search,
  onCreate,
}: {
  search: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
        ↩
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-800">
        {search
          ? "No returns found"
          : "No supplier returns yet"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {search
          ? "Try changing your search or filters."
          : "Supplier returns will appear here once stock is returned to a supplier."}
      </p>

      {!search && (
        <div className="mt-4">
          <Button onClick={onCreate}>
            + New Supplier Return
          </Button>
        </div>
      )}
    </div>
  );
}
