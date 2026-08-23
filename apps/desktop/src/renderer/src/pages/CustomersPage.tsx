import { useEffect, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { Field, Input } from "../components/Form";
import { Modal } from "../components/Modal";
import { formatBDT } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  totalSpending: string | number;
  outstandingBalance: number;
  membership?: { membershipNumber: string } | null;
  status: string;
}

interface CustomerForm {
  name: string;
  phone: string;
  address: string;
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [form, setForm] = useState<CustomerForm>({
    name: "",
    phone: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);

  const push = useToastStore((s) => s.push);

  async function load() {
    try {
      const data = await call<Customer[]>("customers:list");
      setCustomers(data);
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to load customers",
        "error"
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      phone: "",
      address: "",
    });

    setEditingCustomer(null);
  }

  function openCreateModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);

    setForm({
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      push("Customer name is required.", "error");
      return;
    }

    setSaving(true);

    try {
      if (editingCustomer) {
        /*
         * Existing backend update operation.
         * No customer business logic is changed here.
         */
        await call("customers:update", {
          id: editingCustomer.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        });

        push("Customer updated successfully.", "success");
      } else {
        await call("customers:create", {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        });

        push("Customer created.", "success");
      }

      setModalOpen(false);
      resetForm();

      await load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : editingCustomer
            ? "Failed to update customer"
            : "Failed to create customer",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status?.toUpperCase() === "ACTIVE"
  ).length;

  const totalSpending = customers.reduce(
    (sum, customer) => sum + Number(customer.totalSpending || 0),
    0
  );

  const totalOutstanding = customers.reduce(
    (sum, customer) => sum + Number(customer.outstandingBalance || 0),
    0
  );

  return (
    <div className="customers-root min-h-full space-y-6 bg-slate-50/60 p-1">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="hero-panel relative overflow-hidden rounded-3xl p-6 shadow-xl shadow-emerald-900/10">

        {/* Decorative background */}
        <div className="hero-mesh pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl animate-[float_11s_ease-in-out_infinite_reverse]" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="reveal">
            <div className="mb-2 flex items-center gap-2 text-emerald-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-200" />
                </span>
                Customer Management
              </span>
            </div>

            <h1 className="hero-title text-3xl font-bold tracking-tight md:text-4xl">
              Customers
            </h1>

            <p className="mt-1 max-w-xl text-sm text-emerald-50/80">
              Manage customers, memberships, spending and receivables from
              one place.
            </p>
          </div>

          {/* FIXED GREEN BUTTON */}
          <button
            type="button"
            onClick={openCreateModal}
            className="reveal group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl active:translate-y-0"
            style={{ animationDelay: "80ms" }}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-lg leading-none text-emerald-700 transition-all duration-300 group-hover:rotate-90 group-hover:bg-emerald-200">
              +
            </span>

            New Customer
          </button>
        </div>
      </div>

      {/* =========================================================
          SUMMARY CARDS
      ========================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Customers */}
        <div
          className="summary-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
          style={{ animationDelay: "0ms" }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-50 blur-2xl transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Customers
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {totalCustomers}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Registered customers
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div
          className="summary-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          style={{ animationDelay: "60ms" }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 blur-2xl transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Customers
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {activeCustomers}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Currently active
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Spending */}
        <div
          className="summary-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
          style={{ animationDelay: "120ms" }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-violet-50 blur-2xl transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Customer Spending
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatBDT(totalSpending)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Total customer purchases
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:scale-110">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18" />
                <path d="M7 15h3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <div
          className="summary-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
          style={{ animationDelay: "180ms" }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-red-50 blur-2xl transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Outstanding
              </p>

              <p
                className={`mt-2 text-2xl font-bold tracking-tight tabular-nums ${
                  totalOutstanding > 0
                    ? "text-red-600"
                    : "text-slate-900"
                }`}
              >
                {formatBDT(totalOutstanding)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Customer receivables
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500 transition-transform duration-300 group-hover:scale-110">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18" />
                <path d="M7 15h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          CUSTOMER DIRECTORY
      ========================================================= */}
      <div className="reveal" style={{ animationDelay: "220ms" }}>
      <Card>
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customer Directory
                </h2>

                <p className="text-xs text-slate-500">
                  {totalCustomers} customer
                  {totalCustomers === 1 ? "" : "s"} registered
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live customer data
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            rows={customers}
            keyFor={(c) => c.id}
            emptyMessage="No customers yet."
            columns={[
              {
                header: "Customer",
                accessor: (c) => (
                  <div className="group/row flex items-center gap-3 py-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100 transition-transform duration-300 group-hover/row:scale-105">
                      {c.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {c.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        Customer
                      </p>
                    </div>
                  </div>
                ),
              },

              {
                header: "Phone",
                accessor: (c) => (
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 15.9z" />
                      </svg>
                    </span>

                    {c.phone || "—"}
                  </div>
                ),
              },

              {
                header: "Membership",
                accessor: (c) =>
                  c.membership?.membershipNumber ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">
                      <span>♛</span>
                      {c.membership.membershipNumber}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  ),
              },

              {
                header: "Total Spending",
                accessor: (c) => (
                  <span className="font-semibold tabular-nums text-slate-800">
                    {formatBDT(c.totalSpending)}
                  </span>
                ),
              },

              {
                header: "Outstanding",
                accessor: (c) => (
                  <span
                    className={
                      c.outstandingBalance > 0
                        ? "font-bold tabular-nums text-red-600"
                        : "font-medium tabular-nums text-slate-600"
                    }
                  >
                    {formatBDT(c.outstandingBalance)}
                  </span>
                ),
              },

              {
                header: "Status",
                accessor: (c) => (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                      c.status?.toUpperCase() === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.status?.toUpperCase() === "ACTIVE"
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-slate-400"
                      }`}
                    />

                    {c.status}
                  </span>
                ),
              },

              {
                header: "Action",
                accessor: (c) => (
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    Edit
                  </button>
                ),
              },
            ]}
          />
        </div>
      </Card>
      </div>

      {/* =========================================================
          CREATE / EDIT CUSTOMER MODAL
      ========================================================= */}
      <Modal
        open={modalOpen}
        title={editingCustomer ? "Edit Customer" : "New Customer"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Modal heading */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                {editingCustomer ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6" />
                    <path d="M22 11h-6" />
                  </svg>
                )}
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  {editingCustomer
                    ? "Update customer information"
                    : "Create a new customer"}
                </p>

                <p className="text-xs text-slate-500">
                  Customer details can be updated later.
                </p>
              </div>
            </div>
          </div>

          <Field label="Name">
            <Input
              required
              value={form.name}
              placeholder="Enter customer name"
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Phone">
            <Input
              value={form.phone}
              placeholder="Enter phone number"
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Address">
            <Input
              value={form.address}
              placeholder="Enter customer address"
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Cancel
            </button>

            <Button
              type="submit"
              disabled={saving}
              className="flex-1 !bg-emerald-600 !text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:!-translate-y-0.5 hover:!bg-emerald-700"
            >
              {saving
                ? "Saving..."
                : editingCustomer
                  ? "Update Customer"
                  : "Save Customer"}
            </Button>
          </div>
        </form>
      </Modal>

      <style>{`
        .hero-panel {
          background: linear-gradient(120deg, #059669 0%, #047857 45%, #14532d 100%);
        }
        .hero-mesh {
          background-image:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.12), transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(16,185,129,0.18), transparent 40%);
          background-size: 200% 200%;
          animation: meshShift 14s ease-in-out infinite;
        }
        .hero-title {
          background: linear-gradient(90deg, #ffffff 0%, #e6fff4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .reveal, .summary-card {
          animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10px, 12px) scale(1.05); }
        }
        @keyframes meshShift {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-mesh, .reveal, .summary-card, .animate-pulse, .animate-ping {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
