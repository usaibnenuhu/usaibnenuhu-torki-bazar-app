import { useEffect, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { Field, Input, Select } from "../components/Form";
import { Modal } from "../components/Modal";
import { formatBDT, formatDate } from "../utils/format";
import { useToastStore } from "../store/toastStore";
import logo from "../assets/torki-bazar-logo.png";

interface Supplier {
  id: string;
  name: string;
  outstandingPayable?: number;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
}

interface ItemRow {
  productId: string;
  batchCode: string;
  quantity: string;
  purchaseCost: string;
  sellingCost: string;
  expiryDate: string;
}

interface PurchaseRow {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplierId: string;
  invoiceNumber: string | null;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  paymentStatus: string;
  paidTotal: number;
  outstandingAmount: number;
  creditApplied: number;
  derivedPaymentStatus: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  supplier: {
    name: string;
  };
}

interface PurchaseDetails extends PurchaseRow {
  supplier: {
    id: string;
    name: string;
    phone: string;
    company: string | null;
  };

  items: {
    id: string;
    quantity: string;
    unitCost: string;
    total: string;
    quantityInStock: number;
    quantityReturned: number;

    product: {
      name: string;
      sku: string | null;
      barcode: string | null;
    };

    batch: {
      id: string;
      batchCode: string;
      expiryDate: string | null;
      purchaseDate: string;

      /*
       * FIX:
       * The batch selling price is now returned
       * and displayed by the Purchase page.
       */
      sellingPrice: string | number;
    } | null;
  }[];

  payments: {
    id: string;
    paymentNumber: string | null;
    paymentDate: string;
    amount: string;
    method: string;
  }[];

  supplierReturns: {
    id: string;
    returnNumber: string;
    quantity: string;
    returnValue: string;
    status: string;
    product: {
      name: string;
    };
  }[];
}

const DASH = "—";

const emptyRow: ItemRow = {
  productId: "",
  batchCode: "",
  quantity: "1",
  purchaseCost: "0",
  sellingCost: "0",
  expiryDate: "",
};

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [details, setDetails] =
    useState<PurchaseDetails | null>(null);

  const [printingPurchase, setPrintingPurchase] =
    useState<PurchaseDetails | null>(null);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [supplierId, setSupplierId] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState("");

  const [paidAmount, setPaidAmount] =
    useState("0");

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [rows, setRows] =
    useState<ItemRow[]>([{ ...emptyRow }]);

  const [saving, setSaving] =
    useState(false);

  const [payTarget, setPayTarget] =
    useState<PurchaseRow | null>(null);

  const [payForm, setPayForm] = useState({
    amount: "",
    method: "CASH",
    reference: "",
    notes: "",
  });

  const [paymentIdempotencyKey, setPaymentIdempotencyKey] =
    useState("");

  const push =
    useToastStore((s) => s.push);

  async function loadPurchases() {
    setLoading(true);

    try {
      setPurchases(
        await call<PurchaseRow[]>(
          "purchases:list"
        )
      );
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to load purchases",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPurchases();

    call<Supplier[]>("suppliers:list")
      .then(setSuppliers)
      .catch(() => {});

    call<{ items: Product[] }>(
      "products:search",
      {}
    )
      .then((r) => setProducts(r.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!printingPurchase) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 150);

    return () =>
      window.clearTimeout(timer);
  }, [printingPurchase]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintingPurchase(null);
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );

    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
    };
  }, []);

  function updateRow(
    index: number,
    patch: Partial<ItemRow>
  ) {
    setRows((currentRows) =>
      currentRows.map((row, i) =>
        i === index
          ? {
              ...row,
              ...patch,
            }
          : row
      )
    );
  }

  const total = rows.reduce(
    (sum, row) =>
      sum +
      Number(row.quantity || 0) *
        Number(row.purchaseCost || 0),
    0
  );

  async function openDetails(
    idOrNumber: string
  ) {
    try {
      const result =
        await call<PurchaseDetails>(
          "purchases:get",
          {
            id: idOrNumber,
          }
        );

      setDetails(result);
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Purchase not found",
        "error"
      );
    }
  }

  async function handlePrintPurchase(
    id: string
  ) {
    try {
      const purchase =
        await call<PurchaseDetails>(
          "purchases:get",
          {
            id,
          }
        );

      setPrintingPurchase(purchase);
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Unable to prepare purchase for printing",
        "error"
      );
    }
  }

  async function handlePurchasePayment(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!payTarget) {
      return;
    }

    setSaving(true);

    try {
      await call(
        "purchases:recordPayment",
        {
          supplierId:
            payTarget.supplierId,

          purchaseId:
            payTarget.id,

          amount:
            Number(payForm.amount),

          method:
            payForm.method,

          idempotencyKey:
            paymentIdempotencyKey,

          reference:
            payForm.reference ||
            undefined,

          notes:
            payForm.notes ||
            undefined,
        }
      );

      push(
        "Payment recorded.",
        "success"
      );

      setPayTarget(null);

      loadPurchases();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to record payment",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!supplierId) {
      push(
        "Please select a supplier.",
        "error"
      );
      return;
    }

    const invalidRow = rows.find(
      (row) =>
        !row.productId ||
        Number(row.quantity) <= 0 ||
        Number(row.purchaseCost) < 0 ||
        Number(row.sellingCost) < 0
    );

    if (invalidRow) {
      push(
        "Please complete every purchase item correctly.",
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      await call(
        "purchases:create",
        {
          supplierId,

          invoiceNumber:
            invoiceNumber ||
            undefined,

          purchaseDate:
            purchaseDate ||
            undefined,

          paidAmount:
            Number(paidAmount),

          paymentMethod,

          items: rows.map((row) => ({
            productId:
              row.productId,

            batchCode:
              row.batchCode ||
              `BATCH-${Date.now()}`,

            quantity:
              Number(row.quantity),

            unitCost:
              Number(row.purchaseCost),

            /*
             * FIX:
             * Send the manually entered selling
             * cost to the backend.
             *
             * Example:
             * Purchase Cost = 100
             * Selling Cost  = 120
             *
             * sellingPrice = 120
             */
            sellingPrice:
              Number(row.sellingCost),

            expiryDate:
              row.expiryDate
                ? new Date(
                    row.expiryDate
                  )
                : undefined,
          })),
        }
      );

      push(
        "Purchase recorded and inventory updated.",
        "success"
      );

      setModalOpen(false);

      setRows([
        {
          ...emptyRow,
        },
      ]);

      setSupplierId("");

      setInvoiceNumber("");

      setPurchaseDate("");

      setPaidAmount("0");

      setPaymentMethod("CASH");

      await loadPurchases();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to record purchase",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Purchases
            </h1>

            <p className="text-sm text-slate-500">
              Record cash or credit purchases
              from suppliers.
            </p>
          </div>

          <Button
            onClick={() =>
              setModalOpen(true)
            }
          >
            + New Purchase
          </Button>
        </div>

        <Card>
          <DataTable
            loading={loading}
            rows={purchases}
            keyFor={(p) => p.id}
            emptyMessage='No purchases yet. Use "New Purchase" to receive stock.'
            columns={[
              {
                header: "Purchase #",
                accessor: (p) => (
                  <span className="font-medium">
                    {p.purchaseNumber}
                  </span>
                ),
              },

              {
                header: "Date",
                accessor: (p) =>
                  formatDate(
                    p.purchaseDate
                  ),
              },

              {
                header: "Supplier",
                accessor: (p) =>
                  p.supplier?.name ??
                  DASH,
              },

              {
                header: "Invoice #",
                accessor: (p) =>
                  p.invoiceNumber ||
                  DASH,
              },

              {
                header: "Items",
                accessor: (p) =>
                  p.totalItems,
              },

              {
                header: "Qty",
                accessor: (p) =>
                  p.totalQuantity,
              },

              {
                header: "Total",
                accessor: (p) =>
                  formatBDT(
                    p.totalAmount
                  ),
              },

              {
                header: "Paid",
                accessor: (p) =>
                  formatBDT(
                    p.paidTotal
                  ),
              },

              {
                header: "Credit Applied",
                accessor: (p) =>
                  p.creditApplied > 0 ? (
                    <span className="text-brand-600">
                      {formatBDT(
                        p.creditApplied
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {DASH}
                    </span>
                  ),
              },

              {
                header: "Outstanding",
                accessor: (p) => (
                  <span
                    className={
                      p.outstandingAmount >
                      0
                        ? "font-semibold text-red-600"
                        : "text-slate-500"
                    }
                  >
                    {formatBDT(
                      p.outstandingAmount
                    )}
                  </span>
                ),
              },

              {
                header: "Status",
                accessor: (p) =>
                  `${p.derivedPaymentStatus}${
                    p.status ===
                    "VOID"
                      ? " · VOID"
                      : ""
                  }`,
              },

              {
                header: "Actions",
                accessor: (p) => (
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                      onClick={() =>
                        openDetails(
                          p.id
                        )
                      }
                    >
                      View
                    </Button>

                    <Button
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                      onClick={() =>
                        handlePrintPurchase(
                          p.id
                        )
                      }
                    >
                      Print
                    </Button>

                    {p.outstandingAmount >
                      0 &&
                      p.status !==
                        "VOID" && (
                        <Button
                          variant="secondary"
                          className="px-2 py-1 text-xs"
                          onClick={() => {
                            setPayForm({
                              amount:
                                String(
                                  p.outstandingAmount
                                ),
                              method:
                                "CASH",
                              reference:
                                "",
                              notes:
                                "",
                            });

                            setPaymentIdempotencyKey(
                              crypto.randomUUID()
                            );

                            setPayTarget(
                              p
                            );
                          }}
                        >
                          Payment
                        </Button>
                      )}
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* =========================
            PURCHASE DETAILS
        ========================== */}

        <Modal
          open={!!details}
          wide
          title={
            details
              ? `Purchase ${details.purchaseNumber}`
              : "Purchase"
          }
          onClose={() =>
            setDetails(null)
          }
        >
          {details && (
            <div className="space-y-5 text-sm">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3">
                <Detail
                  label="Purchase number"
                  value={
                    details.purchaseNumber
                  }
                />

                <Detail
                  label="Purchase date"
                  value={formatDate(
                    details.purchaseDate
                  )}
                />

                <Detail
                  label="Supplier"
                  value={
                    details.supplier
                      ?.name ?? DASH
                  }
                />

                <Detail
                  label="Supplier phone"
                  value={
                    details.supplier
                      ?.phone ?? DASH
                  }
                />

                <Detail
                  label="Supplier invoice #"
                  value={
                    details.invoiceNumber ||
                    DASH
                  }
                />

                <Detail
                  label="Payment status"
                  value={`${details.derivedPaymentStatus} · ${details.status}`}
                />
              </dl>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-1 pr-4">
                        Product
                      </th>

                      <th className="py-1 pr-4">
                        SKU
                      </th>

                      <th className="py-1 pr-4">
                        Barcode
                      </th>

                      <th className="py-1 pr-4">
                        Batch
                      </th>

                      <th className="py-1 pr-4">
                        Purchased
                      </th>

                      <th className="py-1 pr-4">
                        In stock
                      </th>

                      <th className="py-1 pr-4">
                        Returned
                      </th>

                      <th className="py-1 pr-4">
                        Purchase Cost
                      </th>

                      <th className="py-1 pr-4">
                        Selling Cost
                      </th>

                      <th className="py-1 pr-4">
                        Total
                      </th>

                      <th className="py-1">
                        Expiry
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {details.items.map(
                      (item) => (
                        <tr
                          key={item.id}
                        >
                          <td className="py-1 pr-4">
                            {
                              item
                                .product
                                .name
                            }
                          </td>

                          <td className="py-1 pr-4 text-slate-500">
                            {item.product
                              .sku ||
                              DASH}
                          </td>

                          <td className="py-1 pr-4 text-slate-500">
                            {item.product
                              .barcode ||
                              DASH}
                          </td>

                          <td className="py-1 pr-4">
                            {item.batch
                              ?.batchCode ??
                              DASH}
                          </td>

                          <td className="py-1 pr-4">
                            {Number(
                              item.quantity
                            )}
                          </td>

                          <td className="py-1 pr-4">
                            {
                              item.quantityInStock
                            }
                          </td>

                          <td className="py-1 pr-4">
                            {
                              item.quantityReturned
                            }
                          </td>

                          <td className="py-1 pr-4">
                            {formatBDT(
                              item.unitCost
                            )}
                          </td>

                          {/* FIX:
                              Show the actual batch selling price */}
                          <td className="py-1 pr-4 font-medium text-brand-600">
                            {formatBDT(
                              item.batch
                                ?.sellingPrice ??
                                0
                            )}
                          </td>

                          <td className="py-1 pr-4">
                            {formatBDT(
                              item.total
                            )}
                          </td>

                          <td className="py-1">
                            {item.batch
                              ?.expiryDate
                              ? formatDate(
                                  item
                                    .batch
                                    .expiryDate
                                )
                              : DASH}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-slate-100 pt-3 md:grid-cols-4">
                <Detail
                  label="Total purchase"
                  value={formatBDT(
                    details.totalAmount
                  )}
                />

                <Detail
                  label="Paid"
                  value={formatBDT(
                    details.paidTotal
                  )}
                />

                <Detail
                  label="Credit applied"
                  value={formatBDT(
                    details.creditApplied
                  )}
                />

                <Detail
                  label="Outstanding"
                  value={formatBDT(
                    details.outstandingAmount
                  )}
                />

                <Detail
                  label="Returned to supplier"
                  value={formatBDT(
                    details.supplierReturns
                      .filter(
                        (r) =>
                          r.status ===
                          "COMPLETED"
                      )
                      .reduce(
                        (
                          sum,
                          r
                        ) =>
                          sum +
                          Number(
                            r.returnValue
                          ),
                        0
                      )
                  )}
                />
              </dl>

              {details.payments
                .length > 0 && (
                <div>
                  <p className="mb-2 font-medium text-slate-700">
                    Payments
                  </p>

                  <DataTable
                    rows={
                      details.payments
                    }
                    keyFor={(p) =>
                      p.id
                    }
                    emptyMessage="No payments."
                    columns={[
                      {
                        header:
                          "Payment #",
                        accessor:
                          (p) =>
                            p.paymentNumber ||
                            DASH,
                      },

                      {
                        header:
                          "Date",
                        accessor:
                          (p) =>
                            formatDate(
                              p.paymentDate
                            ),
                      },

                      {
                        header:
                          "Amount",
                        accessor:
                          (p) =>
                            formatBDT(
                              p.amount
                            ),
                      },

                      {
                        header:
                          "Method",
                        accessor:
                          (p) =>
                            p.method,
                      },
                    ]}
                  />
                </div>
              )}

              {details
                .supplierReturns
                .length > 0 && (
                <div>
                  <p className="mb-2 font-medium text-slate-700">
                    Supplier returns from this purchase
                  </p>

                  <DataTable
                    rows={
                      details.supplierReturns
                    }
                    keyFor={(r) =>
                      r.id
                    }
                    emptyMessage="No returns."
                    columns={[
                      {
                        header:
                          "Return #",
                        accessor:
                          (r) =>
                            r.returnNumber,
                      },

                      {
                        header:
                          "Product",
                        accessor:
                          (r) =>
                            r.product
                              ?.name ??
                            DASH,
                      },

                      {
                        header:
                          "Qty",
                        accessor:
                          (r) =>
                            Number(
                              r.quantity
                            ),
                      },

                      {
                        header:
                          "Value",
                        accessor:
                          (r) =>
                            formatBDT(
                              r.returnValue
                            ),
                      },

                      {
                        header:
                          "Status",
                        accessor:
                          (r) =>
                            r.status,
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* =========================
            SUPPLIER PAYMENT MODAL
        ========================== */}

        <Modal
          open={!!payTarget}
          title={
            payTarget
              ? `Payment for ${payTarget.purchaseNumber}`
              : "Payment"
          }
          onClose={() =>
            setPayTarget(null)
          }
        >
          {payTarget && (
            <form
              onSubmit={
                handlePurchasePayment
              }
              className="space-y-4"
            >
              <Field label="Outstanding on this purchase">
                <Input
                  readOnly
                  value={formatBDT(
                    payTarget.outstandingAmount
                  )}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Payment amount">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={
                      payForm.amount
                    }
                    onChange={(e) =>
                      setPayForm({
                        ...payForm,
                        amount:
                          e.target
                            .value,
                      })
                    }
                  />
                </Field>

                <Field label="Method">
                  <Select
                    value={
                      payForm.method
                    }
                    onChange={(e) =>
                      setPayForm({
                        ...payForm,
                        method:
                          e.target
                            .value,
                      })
                    }
                  >
                    <option value="CASH">
                      Cash
                    </option>

                    <option value="BANK">
                      Bank transfer
                    </option>

                    <option value="BKASH">
                      bKash
                    </option>

                    <option value="OTHER">
                      Other
                    </option>
                  </Select>
                </Field>
              </div>

              <Field label="Reference">
                <Input
                  value={
                    payForm.reference
                  }
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      reference:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Notes">
                <Input
                  value={
                    payForm.notes
                  }
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      notes:
                        e.target.value,
                    })
                  }
                />
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={saving}
              >
                {saving ? "Recording..." : "Record Payment"}
              </Button>
            </form>
          )}
        </Modal>

        {/* =========================
            NEW PURCHASE MODAL
        ========================== */}

        <Modal
          open={modalOpen}
          title="New Purchase"
          onClose={() =>
            setModalOpen(false)
          }
          wide
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 gap-4">
              <Field label="Supplier">
                <Select
                  required
                  value={supplierId}
                  onChange={(e) =>
                    setSupplierId(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select…
                  </option>

                  {suppliers.map(
                    (supplier) => (
                      <option
                        key={
                          supplier.id
                        }
                        value={
                          supplier.id
                        }
                      >
                        {supplier.name}
                      </option>
                    )
                  )}
                </Select>
              </Field>

              <Field label="Supplier invoice number">
                <Input
                  value={
                    invoiceNumber
                  }
                  onChange={(e) =>
                    setInvoiceNumber(
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Purchase date">
                <Input
                  type="date"
                  value={
                    purchaseDate
                  }
                  onChange={(e) =>
                    setPurchaseDate(
                      e.target.value
                    )
                  }
                />
              </Field>
            </div>

            <div className="space-y-3">
              {rows.map(
                (row, i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-lg border border-slate-100 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Item {i + 1}
                      </p>

                      <button
                        type="button"
                        className="text-red-500"
                        aria-label="Remove item"
                        onClick={() =>
                          setRows(
                            (currentRows) =>
                              currentRows.filter(
                                (
                                  _,
                                  index
                                ) =>
                                  index !==
                                  i
                              )
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 md:col-span-4">
                        <Field label="Product">
                          <Select
                            value={
                              row.productId
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                i,
                                {
                                  productId:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                            required
                          >
                            <option value="">
                              Select…
                            </option>

                            {products.map(
                              (
                                product
                              ) => (
                                <option
                                  key={
                                    product.id
                                  }
                                  value={
                                    product.id
                                  }
                                >
                                  {
                                    product.name
                                  }

                                  {product.sku
                                    ? ` (${product.sku})`
                                    : ""}
                                </option>
                              )
                            )}
                          </Select>
                        </Field>
                      </div>

                      <div className="col-span-12 md:col-span-3">
                        <Field label="Batch code">
                          <Input
                            placeholder="Auto-generated if left empty"
                            value={
                              row.batchCode
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                i,
                                {
                                  batchCode:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </Field>
                      </div>

                      <div className="col-span-6 md:col-span-2">
                        <Field label="Expiry date">
                          <Input
                            type="date"
                            value={
                              row.expiryDate
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                i,
                                {
                                  expiryDate:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </Field>
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <Field label="Quantity">
                          <Input
                            type="number"
                            min={1}
                            placeholder="0"
                            value={
                              row.quantity
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                i,
                                {
                                  quantity:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </Field>
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <Field label="Purchase cost">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            placeholder="0"
                            value={
                              row.purchaseCost
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                i,
                                {
                                  purchaseCost:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </Field>
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <Field label="Selling cost">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            placeholder="0"
                            value={
                              row.sellingCost
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                i,
                                {
                                  /*
                                   * FIX:
                                   * Keep the manually
                                   * entered selling cost.
                                   */
                                  sellingCost:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                          />
                        </Field>
                      </div>

                      <div className="col-span-12 flex items-end md:col-span-6">
                        <p className="text-sm text-slate-500">
                          Line total:{" "}
                          <span className="font-medium text-slate-700">
                            {formatBDT(
                              Number(
                                row.quantity ||
                                  0
                              ) *
                                Number(
                                  row.purchaseCost ||
                                    0
                                )
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}

              <button
                type="button"
                className="text-sm text-brand-600 hover:underline"
                onClick={() =>
                  setRows(
                    (currentRows) => [
                      ...currentRows,
                      {
                        ...emptyRow,
                      },
                    ]
                  )
                }
              >
                + Add item
              </button>
            </div>

            <div className="grid grid-cols-3 items-end gap-4 rounded-lg bg-brand-50 px-4 py-3">
              <span className="text-sm text-slate-600">
                Purchase total:{" "}
                {formatBDT(total)}
              </span>

              <Field label="Paid amount">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={
                    paidAmount
                  }
                  onChange={(e) =>
                    setPaidAmount(
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Payment method">
                <Select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                >
                  <option value="CASH">
                    Cash
                  </option>

                  <option value="BANK">
                    Bank transfer
                  </option>

                  <option value="BKASH">
                    bKash
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </Select>
              </Field>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : "Save Purchase"}
            </Button>
          </form>
        </Modal>
      </div>

      {/* =========================
          PRINT PURCHASE
      ========================== */}

      {printingPurchase && (
        <div className="purchase-print-sheet">
          <div className="purchase-print-page">
            <div className="purchase-print-header">
              <div className="purchase-print-brand">
                <img
                  src={logo}
                  alt="Torki Bazar"
                  className="purchase-print-logo"
                />

                <div>
                  <div className="purchase-print-company">
                    TORKI BAZAR
                  </div>

                  <div className="purchase-print-address">
                    Torki Bandar,
                    Gournadi,
                    Barishal
                  </div>

                  <div className="purchase-print-email">
                    E-mail:
                    contact@torkibazar
                  </div>
                </div>
              </div>

              <div className="purchase-print-title">
                <div className="purchase-print-small-title">
                  PURCHASE
                </div>

                <div className="purchase-print-number">
                  {
                    printingPurchase.purchaseNumber
                  }
                </div>

                <div className="purchase-print-date">
                  {formatDate(
                    printingPurchase.purchaseDate
                  )}
                </div>
              </div>
            </div>

            <div className="purchase-print-line" />

            <div className="purchase-print-info">
              <div className="purchase-print-info-block">
                <div className="purchase-print-section-title">
                  SUPPLIER
                </div>

                <div className="purchase-print-info-row">
                  <span>Name</span>

                  <strong>
                    {
                      printingPurchase
                        .supplier
                        ?.name
                    }
                  </strong>
                </div>

                <div className="purchase-print-info-row">
                  <span>Company</span>

                  <span>
                    {printingPurchase
                      .supplier
                      ?.company ||
                      DASH}
                  </span>
                </div>

                <div className="purchase-print-info-row">
                  <span>Phone</span>

                  <span>
                    {printingPurchase
                      .supplier
                      ?.phone ||
                      DASH}
                  </span>
                </div>
              </div>

              <div className="purchase-print-info-block">
                <div className="purchase-print-section-title">
                  PURCHASE DETAILS
                </div>

                <div className="purchase-print-info-row">
                  <span>Invoice</span>

                  <span>
                    {printingPurchase
                      .invoiceNumber ||
                      DASH}
                  </span>
                </div>

                <div className="purchase-print-info-row">
                  <span>Payment</span>

                  <strong>
                    {
                      printingPurchase.derivedPaymentStatus
                    }
                  </strong>
                </div>

                <div className="purchase-print-info-row">
                  <span>Status</span>

                  <span>
                    {
                      printingPurchase.status
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="purchase-print-section-title purchase-print-items-title">
              ITEMS
            </div>

            <table className="purchase-print-table">
              <thead>
                <tr>
                  <th className="col-no">
                    #
                  </th>

                  <th className="col-product">
                    Product
                  </th>

                  <th className="col-sku">
                    SKU
                  </th>

                  <th className="col-batch">
                    Batch
                  </th>

                  <th className="col-qty">
                    Qty
                  </th>

                  <th className="col-cost">
                    Purchase Cost
                  </th>

                  <th className="col-selling">
                    Selling Cost
                  </th>

                  <th className="col-total">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {printingPurchase.items.map(
                  (item, index) => (
                    <tr key={item.id}>
                      <td className="text-center">
                        {index + 1}
                      </td>

                      <td>
                        {
                          item.product
                            .name
                        }
                      </td>

                      <td>
                        {item.product
                          .sku ||
                          DASH}
                      </td>

                      <td>
                        {item.batch
                          ?.batchCode ||
                          DASH}
                      </td>

                      <td className="text-right">
                        {Number(
                          item.quantity
                        )}
                      </td>

                      <td className="text-right">
                        {formatBDT(
                          item.unitCost
                        )}
                      </td>

                      {/* FIX:
                          Print actual selling price */}
                      <td className="text-right">
                        {formatBDT(
                          item.batch
                            ?.sellingPrice ??
                            0
                        )}
                      </td>

                      <td className="text-right">
                        {formatBDT(
                          item.total
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div className="purchase-print-bottom">
              <div className="purchase-print-payment-history">
                <div className="purchase-print-section-title">
                  PAYMENT HISTORY
                </div>

                {printingPurchase
                  .payments.length >
                0 ? (
                  <table className="purchase-print-payment-table">
                    <thead>
                      <tr>
                        <th>
                          Payment #
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Method
                        </th>

                        <th className="text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {printingPurchase.payments.map(
                        (
                          payment
                        ) => (
                          <tr
                            key={
                              payment.id
                            }
                          >
                            <td>
                              {payment.paymentNumber ||
                                DASH}
                            </td>

                            <td>
                              {formatDate(
                                payment.paymentDate
                              )}
                            </td>

                            <td>
                              {
                                payment.method
                              }
                            </td>

                            <td className="text-right">
                              {formatBDT(
                                payment.amount
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="purchase-print-empty">
                    No payments
                    recorded.
                  </div>
                )}
              </div>

              <div className="purchase-print-summary">
                <div className="purchase-print-summary-row">
                  <span>
                    Purchase Total
                  </span>

                  <strong>
                    {formatBDT(
                      printingPurchase.totalAmount
                    )}
                  </strong>
                </div>

                <div className="purchase-print-summary-row">
                  <span>
                    Paid
                  </span>

                  <strong className="green">
                    {formatBDT(
                      printingPurchase.paidTotal
                    )}
                  </strong>
                </div>

                <div className="purchase-print-summary-row">
                  <span>
                    Credit Applied
                  </span>

                  <strong>
                    {formatBDT(
                      printingPurchase.creditApplied
                    )}
                  </strong>
                </div>

                <div className="purchase-print-summary-row outstanding">
                  <span>
                    Outstanding
                  </span>

                  <strong>
                    {formatBDT(
                      printingPurchase.outstandingAmount
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {printingPurchase
              .supplierReturns
              .length > 0 && (
              <div className="purchase-print-returns">
                <div className="purchase-print-section-title">
                  SUPPLIER RETURNS
                </div>

                <table className="purchase-print-payment-table">
                  <thead>
                    <tr>
                      <th>
                        Return #
                      </th>

                      <th>
                        Product
                      </th>

                      <th>
                        Qty
                      </th>

                      <th>
                        Value
                      </th>

                      <th>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {printingPurchase.supplierReturns.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            {
                              item.returnNumber
                            }
                          </td>

                          <td>
                            {
                              item
                                .product
                                ?.name
                            }
                          </td>

                          <td>
                            {Number(
                              item.quantity
                            )}
                          </td>

                          <td>
                            {formatBDT(
                              item.returnValue
                            )}
                          </td>

                          <td>
                            {
                              item.status
                            }
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="purchase-print-footer">
              <div>
                TORKI BAZAR
              </div>

              <div>
                Torki Bandar,
                Gournadi,
                Barishal
              </div>

              <div>
                contact@torkibazar
              </div>

              <div className="purchase-print-footer-number">
                Purchase:{" "}
                {
                  printingPurchase.purchaseNumber
                }
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .purchase-print-sheet {
          display: none;
        }

        @page {
          size: A4 portrait;
          margin: 7mm;
        }

        @media print {
          html,
          body {
            width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .purchase-print-sheet,
          .purchase-print-sheet * {
            visibility: visible !important;
          }

          .purchase-print-sheet {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 196mm !important;
            max-width: 196mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .purchase-print-page {
            width: 196mm !important;
            max-width: 196mm !important;
            min-height: 282mm;
            max-height: 282mm;
            box-sizing: border-box !important;
            padding: 4mm 5mm 3mm 5mm;
            margin: 0 !important;
            background: #ffffff;
            color: #111827;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            font-size: 8.5pt;
            line-height: 1.2;
            overflow: hidden !important;
          }

          .purchase-print-header {
            display: flex;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            align-items: flex-start;
            justify-content: space-between;
            gap: 6mm;
          }

          .purchase-print-brand {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 1 1 auto;
            overflow: hidden;
          }

          .purchase-print-logo {
            width: 22mm;
            height: 22mm;
            object-fit: contain;
            display: block;
            flex: 0 0 22mm;
            margin-right: 4mm;
          }

          .purchase-print-company {
            font-size: 16pt;
            font-weight: 800;
            letter-spacing: 0.5px;
            line-height: 1.05;
            color: #166534;
          }

          .purchase-print-address,
          .purchase-print-email {
            margin-top: 1.2mm;
            color: #4b5563;
            font-size: 8pt;
          }

          .purchase-print-title {
            flex: 0 0 55mm;
            width: 55mm;
            min-width: 55mm;
            text-align: right;
            padding-top: 1mm;
            box-sizing: border-box;
            overflow: hidden;
          }

          .purchase-print-small-title {
            font-size: 7.5pt;
            font-weight: 700;
            letter-spacing: 1.3px;
            color: #6b7280;
          }

          .purchase-print-number {
            margin-top: 1mm;
            font-size: 13pt;
            font-weight: 800;
            color: #111827;
            white-space: nowrap;
          }

          .purchase-print-date {
            margin-top: 1.5mm;
            font-size: 8pt;
            color: #6b7280;
          }

          .purchase-print-line {
            width: 100%;
            max-width: 100%;
            height: 0.35mm;
            background: #1f2937;
            margin: 3mm 0;
            box-sizing: border-box;
          }

          .purchase-print-info {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              minmax(0, 1fr);
            column-gap: 8mm;
            width: 100%;
            max-width: 100%;
            margin-bottom: 3mm;
            box-sizing: border-box;
          }

          .purchase-print-info-block {
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
          }

          .purchase-print-section-title {
            font-size: 7pt;
            font-weight: 800;
            letter-spacing: 1px;
            color: #6b7280;
            margin-bottom: 1.5mm;
          }

          .purchase-print-info-row {
            display: flex;
            justify-content: space-between;
            gap: 3mm;
            width: 100%;
            max-width: 100%;
            border-bottom: 0.2mm solid #e5e7eb;
            padding: 1.2mm 0;
            box-sizing: border-box;
          }

          .purchase-print-info-row span:first-child {
            color: #6b7280;
            flex: 0 0 23mm;
          }

          .purchase-print-info-row span:last-child,
          .purchase-print-info-row strong {
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: right;
          }

          .purchase-print-items-title {
            margin-top: 1mm;
          }

          .purchase-print-table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse;
            table-layout: fixed !important;
            font-size: 7.2pt;
            box-sizing: border-box;
          }

          .purchase-print-table th,
          .purchase-print-table td {
            border-bottom: 0.2mm solid #d1d5db;
            padding: 1.3mm 1mm;
            vertical-align: middle;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
          }

          .purchase-print-table thead th {
            border-top: 0.3mm solid #374151;
            border-bottom: 0.3mm solid #374151;
            color: #374151;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 6.4pt;
            letter-spacing: 0.2px;
          }

          .purchase-print-table .col-no {
            width: 4%;
            text-align: center;
          }

          .purchase-print-table .col-product {
            width: 24%;
          }

          .purchase-print-table .col-sku {
            width: 9%;
          }

          .purchase-print-table .col-batch {
            width: 18%;
          }

          .purchase-print-table .col-qty {
            width: 7%;
            text-align: right;
          }

          .purchase-print-table .col-cost {
            width: 13%;
            text-align: right;
          }

          .purchase-print-table .col-selling {
            width: 13%;
            text-align: right;
          }

          .purchase-print-table .col-total {
            width: 12%;
            text-align: right;
          }

          .purchase-print-table tbody tr:last-child td {
            border-bottom: 0.3mm solid #374151;
          }

          .text-right {
            text-align: right !important;
          }

          .text-center {
            text-align: center !important;
          }

          .purchase-print-bottom {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              62mm;
            gap: 7mm;
            width: 100%;
            max-width: 100%;
            margin-top: 4mm;
            align-items: start;
            box-sizing: border-box;
          }

          .purchase-print-payment-history {
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
          }

          .purchase-print-payment-table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 7.2pt;
            box-sizing: border-box;
          }

          .purchase-print-payment-table th,
          .purchase-print-payment-table td {
            padding: 1.3mm 1mm;
            border-bottom: 0.2mm solid #e5e7eb;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
          }

          .purchase-print-payment-table th {
            color: #6b7280;
            font-size: 6.6pt;
            text-transform: uppercase;
            font-weight: 800;
          }

          .purchase-print-payment-table th:last-child,
          .purchase-print-payment-table td:last-child {
            text-align: right;
          }

          .purchase-print-summary {
            width: 62mm;
            max-width: 62mm;
            min-width: 0;
            border-top: 0.3mm solid #374151;
            box-sizing: border-box;
          }

          .purchase-print-summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 3mm;
            width: 100%;
            padding: 1.8mm 0;
            border-bottom: 0.2mm solid #e5e7eb;
            font-size: 8pt;
            box-sizing: border-box;
          }

          .purchase-print-summary-row span {
            color: #6b7280;
            min-width: 0;
          }

          .purchase-print-summary-row strong {
            color: #111827;
            white-space: nowrap;
            flex-shrink: 0;
          }

          .purchase-print-summary-row .green,
          .purchase-print-summary-row strong.green {
            color: #15803d;
          }

          .purchase-print-summary-row.outstanding {
            border-top: 0.3mm solid #9ca3af;
            margin-top: 1mm;
            padding-top: 2mm;
          }

          .purchase-print-summary-row.outstanding span,
          .purchase-print-summary-row.outstanding strong {
            color: #dc2626;
            font-weight: 800;
          }

          .purchase-print-returns {
            width: 100%;
            max-width: 100%;
            margin-top: 4mm;
            page-break-inside: avoid;
            break-inside: avoid;
            overflow: hidden;
          }

          .purchase-print-footer {
            width: 100%;
            max-width: 100%;
            border-top: 0.25mm solid #d1d5db;
            margin-top: 5mm;
            padding-top: 2.5mm;
            text-align: center;
            color: #6b7280;
            font-size: 6.8pt;
            line-height: 1.4;
            box-sizing: border-box;
          }

          .purchase-print-footer-number {
            margin-top: 1mm;
            color: #9ca3af;
          }

          .purchase-print-empty {
            color: #9ca3af;
            padding: 2mm 0;
            font-size: 7pt;
          }

          .purchase-print-table,
          .purchase-print-payment-table,
          .purchase-print-info,
          .purchase-print-bottom,
          .purchase-print-returns {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </>
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
    <div>
      <dt className="text-slate-500">
        {label}
      </dt>

      <dd className="font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}