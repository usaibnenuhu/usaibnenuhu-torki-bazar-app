import { useEffect, useMemo, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { Field, Input, Select } from "../components/Form";
import { Modal } from "../components/Modal";
import { formatBDT, formatDate, formatDateTime } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface Supplier {
  id: string;
  name: string;
  company?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;

  totalPurchases: number;
  totalPaid: number;
  totalReturned: number;
  creditFromReturns: number;
  cashRefunds: number;
  outstandingPayable: number;
  availableCredit: number;
}

interface SupplierProfile extends Supplier {
  summary: {
    totalPurchases: number;
    totalPaid: number;
    totalReturned: number;
    creditFromReturns: number;
    cashRefunds: number;
    outstandingPayable: number;
    availableCredit: number;

    purchaseCount: number;
    lastPurchaseDate: string | null;
    lastPurchaseNumber: string | null;

    paymentCount: number;
    lastPaymentDate: string | null;

    returnCount: number;
    returnedQuantity: number;
    lastReturnDate: string | null;
  };

  purchases: {
    id: string;
    purchaseNumber: string;
    purchaseDate: string;
    totalAmount: string;
    paidAmount: string;
    dueAmount: string;
    paymentStatus: string;
    status: string;
  }[];

  supplierPayments: {
    id: string;
    paymentNumber: string | null;
    paymentDate: string;
    amount: string;
    method: string;
    reference: string | null;
    notes: string | null;
    previousOutstanding: string | null;
    remainingOutstanding: string | null;
  }[];

  supplierReturns: {
    id: string;
    returnNumber: string;
    returnDate: string;
    quantity: string;
    returnValue: string;
    reason: string;
    status: string;
    product: { name: string };
    purchase: { purchaseNumber: string };
  }[];
}

const DASH = "—";

const emptyForm = {
  name: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  status: "ACTIVE",
};

type Tab = "OVERVIEW" | "PURCHASES" | "PAYMENTS" | "RETURNS";

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "S";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function supplierStatus(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "ACTIVE") {
    return {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dot: "bg-emerald-500",
    };
  }

  if (normalized === "ARCHIVED") {
    return {
      label: "Archived",
      className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
      dot: "bg-slate-400",
    };
  }

  return {
    label: status,
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  };
}

function paymentStatus(status: string) {
  const value = status.toUpperCase();

  if (value.includes("PAID")) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (value.includes("PARTIAL")) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  if (value.includes("DUE") || value.includes("UNPAID")) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = supplierStatus(status);

  return (
    <Badge className={meta.className}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </Badge>
  );
}

function FinancialCard({
  title,
  value,
  subtitle,
  icon,
  tone = "slate",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  tone?: "slate" | "green" | "red" | "blue" | "amber";
}) {
  const tones = {
    slate: {
      box: "bg-slate-50 text-slate-700",
      value: "text-slate-900",
    },
    green: {
      box: "bg-emerald-50 text-emerald-700",
      value: "text-emerald-700",
    },
    red: {
      box: "bg-red-50 text-red-700",
      value: "text-red-600",
    },
    blue: {
      box: "bg-blue-50 text-blue-700",
      value: "text-blue-700",
    },
    amber: {
      box: "bg-amber-50 text-amber-700",
      value: "text-amber-700",
    },
  };

  const selected = tones[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className={`mt-2 text-2xl font-bold tracking-tight ${selected.value}`}>
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${selected.box}`}
        >
          {icon}
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-slate-50 opacity-50 transition-transform duration-300 group-hover:scale-150" />
    </div>
  );
}

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("OVERVIEW");

  const [payTarget, setPayTarget] = useState<Supplier | null>(null);

  const [payForm, setPayForm] = useState({
    amount: "",
    method: "CASH",
    reference: "",
    notes: "",
    paymentDate: "",
  });

  const [paymentIdempotencyKey, setPaymentIdempotencyKey] = useState("");

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const push = useToastStore((s) => s.push);

  async function load() {
    setLoading(true);

    try {
      const result = await call<Supplier[]>("suppliers:list");
      setSuppliers(result);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load suppliers",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !query ||
        supplier.name.toLowerCase().includes(query) ||
        (supplier.company ?? "").toLowerCase().includes(query) ||
        supplier.phone.toLowerCase().includes(query) ||
        (supplier.email ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        supplier.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  const dashboard = useMemo(() => {
    return {
      suppliers: suppliers.length,

      active: suppliers.filter(
        (s) => s.status.toUpperCase() === "ACTIVE"
      ).length,

      purchases: suppliers.reduce(
        (sum, s) => sum + Number(s.totalPurchases || 0),
        0
      ),

      paid: suppliers.reduce(
        (sum, s) => sum + Number(s.totalPaid || 0),
        0
      ),

      outstanding: suppliers.reduce(
        (sum, s) => sum + Number(s.outstandingPayable || 0),
        0
      ),

      credit: suppliers.reduce(
        (sum, s) => sum + Number(s.availableCredit || 0),
        0
      ),
    };
  }, [suppliers]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditingId(supplier.id);

    setForm({
      name: supplier.name,
      company: supplier.company ?? "",
      phone: supplier.phone,
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      notes: supplier.notes ?? "",
      status: supplier.status,
    });

    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      push("Supplier name is required.", "error");
      return;
    }

    if (!form.phone.trim()) {
      push("Phone number is required.", "error");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      company: form.company.trim() || null,
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status,
    };

    try {
      if (editingId) {
        await call("suppliers:update", {
          id: editingId,
          ...payload,
        });

        push("Supplier updated successfully.", "success");
      } else {
        await call("suppliers:create", payload);

        push("Supplier created successfully.", "success");
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to save supplier",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function openProfile(
    id: string,
    initialTab: Tab = "OVERVIEW"
  ) {
    setTab(initialTab);
    setProfileLoading(true);

    try {
      const result = await call<SupplierProfile>("suppliers:profile", {
        id,
      });

      setProfile(result);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load supplier",
        "error"
      );
    } finally {
      setProfileLoading(false);
    }
  }

  function openPayment(supplier: Supplier) {
    setPayForm({
      amount: "",
      method: "CASH",
      reference: "",
      notes: "",
      paymentDate: "",
    });

    setPaymentIdempotencyKey(crypto.randomUUID());
    setPayTarget(supplier);
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();

    if (!payTarget) return;

    const amount = Number(payForm.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      push("Payment amount must be greater than zero.", "error");
      return;
    }

    if (
      payTarget.outstandingPayable > 0 &&
      amount > Number(payTarget.outstandingPayable)
    ) {
      push("Payment cannot exceed the outstanding payable.", "error");
      return;
    }

    setSaving(true);

    try {
      await call("purchases:recordPayment", {
        supplierId: payTarget.id,
        amount,
        method: payForm.method,
        idempotencyKey: paymentIdempotencyKey,
        reference: payForm.reference || undefined,
        notes: payForm.notes || undefined,
        paymentDate: payForm.paymentDate || undefined,
      });

      push("Payment recorded successfully.", "success");

      const supplierId = payTarget.id;

      setPayTarget(null);

      await load();

      if (profile?.id === supplierId) {
        await openProfile(supplierId, "PAYMENTS");
      }
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to record payment",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full space-y-6 bg-slate-50/40 p-1">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500" />

            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              Procurement
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Suppliers
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage supplier relationships, purchases, payments and outstanding
            balances.
          </p>
        </div>

        <Button onClick={openCreate}>+ New Supplier</Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialCard
          title="Suppliers"
          value={String(dashboard.suppliers)}
          subtitle={`${dashboard.active} active suppliers`}
          icon="👥"
          tone="blue"
        />

        <FinancialCard
          title="Total Purchases"
          value={formatBDT(dashboard.purchases)}
          subtitle="Lifetime supplier purchases"
          icon="🧾"
          tone="slate"
        />

        <FinancialCard
          title="Outstanding"
          value={formatBDT(dashboard.outstanding)}
          subtitle="Amount currently payable"
          icon="⚠"
          tone={dashboard.outstanding > 0 ? "red" : "green"}
        />

        <FinancialCard
          title="Available Credit"
          value={formatBDT(dashboard.credit)}
          subtitle="Credit available from returns"
          icon="✓"
          tone="green"
        />
      </div>

      {/* MAIN CARD */}
      <Card>
        {/* TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Supplier Directory
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {filteredSuppliers.length} supplier
              {filteredSuppliers.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <Input
                className="w-full pl-9 sm:w-72"
                placeholder="Search supplier, company, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              className="sm:w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>
        </div>

        {/* SUPPLIER TABLE */}
        <div className="mt-5">
          <DataTable
            loading={loading}
            rows={filteredSuppliers}
            keyFor={(s) => s.id}
            emptyMessage={
              search || statusFilter !== "ALL"
                ? "No suppliers match your filters."
                : "No suppliers yet. Create your first supplier."
            }
            columns={[
              {
                header: "Supplier",
                accessor: (s) => (
                  <div className="flex min-w-[210px] items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm">
                      {initials(s.name)}
                    </div>

                    <div className="min-w-0">
                      <button
                        className="block max-w-[180px] truncate text-left font-semibold text-slate-800 transition hover:text-brand-600"
                        onClick={() => openProfile(s.id)}
                      >
                        {s.name}
                      </button>

                      <p className="max-w-[180px] truncate text-xs text-slate-400">
                        {s.company || "Independent supplier"}
                      </p>
                    </div>
                  </div>
                ),
              },

              {
                header: "Contact",
                accessor: (s) => (
                  <div className="min-w-[130px]">
                    <p className="font-medium text-slate-700">{s.phone}</p>

                    {s.email && (
                      <p className="max-w-[170px] truncate text-xs text-slate-400">
                        {s.email}
                      </p>
                    )}
                  </div>
                ),
              },

              {
                header: "Purchases",
                accessor: (s) => (
                  <span className="font-semibold text-slate-800">
                    {formatBDT(s.totalPurchases)}
                  </span>
                ),
              },

              {
                header: "Paid",
                accessor: (s) => (
                  <span className="font-medium text-emerald-600">
                    {formatBDT(s.totalPaid)}
                  </span>
                ),
              },

              {
                header: "Payable",
                accessor: (s) => (
                  <span
                    className={
                      s.outstandingPayable > 0
                        ? "font-bold text-red-600"
                        : "font-medium text-slate-400"
                    }
                  >
                    {formatBDT(s.outstandingPayable)}
                  </span>
                ),
              },

              {
                header: "Credit",
                accessor: (s) => (
                  <span
                    className={
                      s.availableCredit > 0
                        ? "font-semibold text-brand-600"
                        : "text-slate-400"
                    }
                  >
                    {formatBDT(s.availableCredit)}
                  </span>
                ),
              },

              {
                header: "Status",
                accessor: (s) => <StatusBadge status={s.status} />,
              },

              {
                header: "Actions",
                accessor: (s) => (
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Button
                      variant="secondary"
                      className="px-2.5 py-1.5 text-xs"
                      onClick={() => openProfile(s.id)}
                    >
                      View
                    </Button>

                    <Button
                      variant="secondary"
                      className="px-2.5 py-1.5 text-xs"
                      onClick={() => openEdit(s)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="secondary"
                      className="px-2.5 py-1.5 text-xs"
                      onClick={() => openPayment(s)}
                    >
                      Pay
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={modalOpen}
        wide
        title={editingId ? "Edit Supplier" : "Add New Supplier"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">
                {editingId ? "✎" : "+"}
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  {editingId
                    ? "Update supplier information"
                    : "Create supplier profile"}
                </p>

                <p className="text-xs text-slate-500">
                  Keep supplier contact and business information up to date.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Supplier name">
              <Input
                required
                autoFocus
                placeholder="e.g. Rahman Traders"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Company">
              <Input
                placeholder="Company name"
                value={form.company}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company: e.target.value,
                  })
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Phone">
              <Input
                required
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                placeholder="supplier@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
            </Field>
          </div>

          <Field label="Address">
            <Input
              placeholder="Supplier business address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Notes">
            <Input
              placeholder="Optional notes about this supplier"
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
            />
          </Field>

          {editingId && (
            <Field label="Supplier status">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>
          )}

          <div className="flex gap-3 border-t border-slate-100 pt-5">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Create Supplier"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* PAYMENT MODAL */}
      <Modal
        open={!!payTarget}
        title={payTarget ? `Payment — ${payTarget.name}` : "Supplier Payment"}
        onClose={() => setPayTarget(null)}
      >
        {payTarget && (
          <form onSubmit={handlePayment} className="space-y-5">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                Outstanding payable
              </p>

              <p className="mt-1 text-2xl font-bold text-red-700">
                {formatBDT(payTarget.outstandingPayable)}
              </p>

              <p className="mt-1 text-xs text-red-500">
                Record the amount paid to this supplier.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Supplier">
                <Input readOnly value={payTarget.name} />
              </Field>

              <Field label="Payment amount">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={payForm.amount}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      amount: e.target.value,
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Payment date">
                <Input
                  type="date"
                  value={payForm.paymentDate}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      paymentDate: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Payment method">
                <Select
                  value={payForm.method}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      method: e.target.value,
                    })
                  }
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank transfer</option>
                  <option value="BKASH">bKash</option>
                  <option value="OTHER">Other</option>
                </Select>
              </Field>
            </div>

            <Field label="Reference number">
              <Input
                placeholder="Transaction/reference number"
                value={payForm.reference}
                onChange={(e) =>
                  setPayForm({
                    ...payForm,
                    reference: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Notes">
              <Input
                placeholder="Optional payment note"
                value={payForm.notes}
                onChange={(e) =>
                  setPayForm({
                    ...payForm,
                    notes: e.target.value,
                  })
                }
              />
            </Field>

            <div className="flex gap-3 border-t border-slate-100 pt-5">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setPayTarget(null)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1"
                disabled={saving}
              >
                {saving ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* SUPPLIER PROFILE */}
      <Modal
        open={!!profile}
        wide
        title=""
        onClose={() => setProfile(null)}
      >
        {profile && (
          <div className="relative">
            {/* PROFILE HERO */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-6 text-white">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/20 backdrop-blur">
                    {initials(profile.name)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold">
                        {profile.name}
                      </h2>

                      <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
                        {supplierStatus(profile.status).label}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-300">
                      {profile.company || "Independent supplier"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-300">
                      <span>☎ {profile.phone}</span>

                      {profile.email && (
                        <span>✉ {profile.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setProfile(null);
                    openEdit(profile);
                  }}
                >
                  Edit Supplier
                </Button>
              </div>
            </div>

            {/* PROFILE KPI */}
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat
                label="Purchases"
                value={formatBDT(profile.summary.totalPurchases)}
                tone="blue"
              />

              <MiniStat
                label="Paid"
                value={formatBDT(profile.summary.totalPaid)}
                tone="green"
              />

              <MiniStat
                label="Outstanding"
                value={formatBDT(profile.summary.outstandingPayable)}
                tone="red"
              />

              <MiniStat
                label="Credit"
                value={formatBDT(profile.summary.availableCredit)}
                tone="amber"
              />
            </div>

            {/* TABS */}
            <div className="mt-6 border-b border-slate-200">
              <div className="flex gap-1 overflow-x-auto">
                {(
                  [
                    ["OVERVIEW", "Overview"],
                    ["PURCHASES", "Purchases"],
                    ["PAYMENTS", "Payments"],
                    ["RETURNS", "Returns"],
                  ] as [Tab, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTab(value)}
                    className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${
                      tab === value
                        ? "text-brand-600"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {label}

                    {tab === value && (
                      <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* LOADING */}
            {profileLoading && (
              <div className="flex min-h-[240px] items-center justify-center">
                <div className="text-sm text-slate-500">
                  Loading supplier...
                </div>
              </div>
            )}

            {!profileLoading && (
              <div className="pt-5">
                {/* OVERVIEW */}
                {tab === "OVERVIEW" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <ProfileSection title="Supplier Information">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <Detail
                            label="Supplier ID"
                            value={profile.id}
                          />

                          <Detail
                            label="Status"
                            value={profile.status}
                          />

                          <Detail
                            label="Name"
                            value={profile.name}
                          />

                          <Detail
                            label="Company"
                            value={profile.company || DASH}
                          />

                          <Detail
                            label="Phone"
                            value={profile.phone}
                          />

                          <Detail
                            label="Email"
                            value={profile.email || DASH}
                          />

                          <Detail
                            label="Address"
                            value={profile.address || DASH}
                          />

                          <Detail
                            label="Created"
                            value={formatDate(profile.createdAt)}
                          />
                        </div>
                      </ProfileSection>

                      <ProfileSection title="Account Summary">
                        <div className="space-y-3">
                          <SummaryRow
                            label="Total purchases"
                            value={formatBDT(
                              profile.summary.totalPurchases
                            )}
                          />

                          <SummaryRow
                            label="Total paid"
                            value={formatBDT(
                              profile.summary.totalPaid
                            )}
                            valueClass="text-emerald-600"
                          />

                          <SummaryRow
                            label="Total returned"
                            value={formatBDT(
                              profile.summary.totalReturned
                            )}
                          />

                          <SummaryRow
                            label="Credit from returns"
                            value={formatBDT(
                              profile.summary.creditFromReturns
                            )}
                            valueClass="text-brand-600"
                          />

                          <SummaryRow
                            label="Cash refunds"
                            value={formatBDT(
                              profile.summary.cashRefunds
                            )}
                          />

                          <SummaryRow
                            label="Outstanding payable"
                            value={formatBDT(
                              profile.summary.outstandingPayable
                            )}
                            valueClass={
                              profile.summary.outstandingPayable > 0
                                ? "text-red-600"
                                : "text-slate-500"
                            }
                          />
                        </div>
                      </ProfileSection>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <ActivityStat
                        label="Purchases"
                        value={String(
                          profile.summary.purchaseCount
                        )}
                        detail={
                          profile.summary.lastPurchaseDate
                            ? formatDate(
                                profile.summary.lastPurchaseDate
                              )
                            : "No activity"
                        }
                      />

                      <ActivityStat
                        label="Payments"
                        value={String(
                          profile.summary.paymentCount
                        )}
                        detail={
                          profile.summary.lastPaymentDate
                            ? formatDate(
                                profile.summary.lastPaymentDate
                              )
                            : "No activity"
                        }
                      />

                      <ActivityStat
                        label="Returns"
                        value={String(
                          profile.summary.returnCount
                        )}
                        detail={`${profile.summary.returnedQuantity} items returned`}
                      />

                      <ActivityStat
                        label="Last return"
                        value={
                          profile.summary.lastReturnDate
                            ? formatDate(
                                profile.summary.lastReturnDate
                              )
                            : DASH
                        }
                        detail="Latest activity"
                      />
                    </div>

                    {profile.notes && (
                      <ProfileSection title="Notes">
                        <p className="text-sm leading-6 text-slate-600">
                          {profile.notes}
                        </p>
                      </ProfileSection>
                    )}
                  </div>
                )}

                {/* PURCHASES */}
                {tab === "PURCHASES" && (
                  <DataTable
                    rows={profile.purchases}
                    keyFor={(p) => p.id}
                    emptyMessage="No purchases recorded for this supplier."
                    columns={[
                      {
                        header: "Purchase",
                        accessor: (p) => (
                          <span className="font-semibold text-slate-800">
                            {p.purchaseNumber}
                          </span>
                        ),
                      },

                      {
                        header: "Date",
                        accessor: (p) =>
                          formatDate(p.purchaseDate),
                      },

                      {
                        header: "Total",
                        accessor: (p) =>
                          formatBDT(p.totalAmount),
                      },

                      {
                        header: "Paid",
                        accessor: (p) => (
                          <span className="text-emerald-600">
                            {formatBDT(p.paidAmount)}
                          </span>
                        ),
                      },

                      {
                        header: "Outstanding",
                        accessor: (p) => (
                          <span
                            className={
                              Number(p.dueAmount) > 0
                                ? "font-semibold text-red-600"
                                : "text-slate-400"
                            }
                          >
                            {formatBDT(p.dueAmount)}
                          </span>
                        ),
                      },

                      {
                        header: "Payment",
                        accessor: (p) => (
                          <Badge
                            className={paymentStatus(
                              p.paymentStatus
                            )}
                          >
                            {p.paymentStatus}
                          </Badge>
                        ),
                      },

                      {
                        header: "Status",
                        accessor: (p) => p.status,
                      },
                    ]}
                  />
                )}

                {/* PAYMENTS */}
                {tab === "PAYMENTS" && (
                  <DataTable
                    rows={profile.supplierPayments}
                    keyFor={(p) => p.id}
                    emptyMessage="No payments recorded for this supplier."
                    columns={[
                      {
                        header: "Payment",
                        accessor: (p) => (
                          <span className="font-semibold">
                            {p.paymentNumber || DASH}
                          </span>
                        ),
                      },

                      {
                        header: "Date",
                        accessor: (p) =>
                          formatDateTime(p.paymentDate),
                      },

                      {
                        header: "Amount",
                        accessor: (p) => (
                          <span className="font-bold text-emerald-600">
                            {formatBDT(p.amount)}
                          </span>
                        ),
                      },

                      {
                        header: "Method",
                        accessor: (p) => (
                          <Badge className="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                            {p.method}
                          </Badge>
                        ),
                      },

                      {
                        header: "Reference",
                        accessor: (p) =>
                          p.reference || DASH,
                      },

                      {
                        header: "Previous",
                        accessor: (p) =>
                          p.previousOutstanding
                            ? formatBDT(
                                p.previousOutstanding
                              )
                            : DASH,
                      },

                      {
                        header: "Remaining",
                        accessor: (p) =>
                          p.remainingOutstanding
                            ? formatBDT(
                                p.remainingOutstanding
                              )
                            : DASH,
                      },
                    ]}
                  />
                )}

                {/* RETURNS */}
                {tab === "RETURNS" && (
                  <DataTable
                    rows={profile.supplierReturns}
                    keyFor={(r) => r.id}
                    emptyMessage="Nothing has been returned to this supplier."
                    columns={[
                      {
                        header: "Return",
                        accessor: (r) => (
                          <span className="font-semibold">
                            {r.returnNumber}
                          </span>
                        ),
                      },

                      {
                        header: "Date",
                        accessor: (r) =>
                          formatDate(r.returnDate),
                      },

                      {
                        header: "Purchase",
                        accessor: (r) =>
                          r.purchase?.purchaseNumber || DASH,
                      },

                      {
                        header: "Product",
                        accessor: (r) =>
                          r.product?.name || DASH,
                      },

                      {
                        header: "Qty",
                        accessor: (r) =>
                          Number(r.quantity),
                      },

                      {
                        header: "Value",
                        accessor: (r) => (
                          <span className="font-semibold text-brand-600">
                            {formatBDT(r.returnValue)}
                          </span>
                        ),
                      },

                      {
                        header: "Reason",
                        accessor: (r) => r.reason,
                      },

                      {
                        header: "Status",
                        accessor: (r) => (
                          <Badge
                            className={paymentStatus(r.status)}
                          >
                            {r.status}
                          </Badge>
                        ),
                      },
                    ]}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small UI components                                                        */
/* -------------------------------------------------------------------------- */

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "green" | "red" | "amber";
}) {
  const classes = {
    blue: "border-blue-100 bg-blue-50/60 text-blue-700",
    green: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    red: "border-red-100 bg-red-50/60 text-red-700",
    amber: "border-amber-100 bg-amber-50/60 text-amber-700",
  };

  return (
    <div className={`rounded-2xl border p-4 ${classes[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-slate-800">
        {title}
      </h3>

      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  valueClass = "text-slate-800",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>

      <span className={`text-sm font-bold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function ActivityStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 truncate text-xs text-slate-400">
        {detail}
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
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>

      <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </dd>
    </div>
  );
}
