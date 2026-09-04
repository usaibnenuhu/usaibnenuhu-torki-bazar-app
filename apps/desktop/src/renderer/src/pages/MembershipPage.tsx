import { useEffect, useMemo, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { useToastStore } from "../store/toastStore";

interface Customer {
  id: string;
  name: string;
  phone?: string;
}

interface Membership {
  id: string;
  membershipNumber: string;
  customerId: string;
  tier: string;
  discountPercent: number | string;
  issueDate: string;
  expiryDate?: string | null;
  status: string;
  qrCodeData?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-4 3-6 7-6s6.2 2 7 6" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 11a8 8 0 0 0-14.8-4" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.8 4" />
      <path d="M20 20v-5h-5" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m3 7 4.2 4L12 5l4.8 6L21 7l-2 12H5L3 7Z" />
      <path d="M5 19h14" />
    </svg>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "No expiry";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatus(member: Membership) {
  if (
    member.expiryDate &&
    new Date(member.expiryDate).getTime() < Date.now() &&
    member.status === "ACTIVE"
  ) {
    return "EXPIRED";
  }

  return member.status?.toUpperCase() || "ACTIVE";
}

function statusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "SUSPENDED":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "EXPIRED":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

export function MembershipPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [issueOpen, setIssueOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [phoneSearch, setPhoneSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [tier, setTier] = useState("STANDARD");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [expiryDate, setExpiryDate] = useState("");

  const [editTier, setEditTier] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const push = useToastStore((s) => s.push);

  async function loadData(preferredId?: string) {
    setLoading(true);

    try {
      const [memberData, customerData] = await Promise.all([
        call<Membership[]>("membership:list"),
        call<Customer[]>("customers:list"),
      ]);

      const sorted = [...(memberData ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setMemberships(sorted);
      setCustomers(customerData ?? []);

      if (sorted.length) {
        const nextId =
          preferredId && sorted.some((m) => m.id === preferredId)
            ? preferredId
            : selectedId && sorted.some((m) => m.id === selectedId)
              ? selectedId
              : sorted[0].id;

        setSelectedId(nextId);
      } else {
        setSelectedId("");
      }
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load memberships.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredMemberships = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return memberships;

    return memberships.filter((member) => {
      const name = member.customer?.name?.toLowerCase() ?? "";
      const phone = member.customer?.phone?.toLowerCase() ?? "";
      const number = member.membershipNumber?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        phone.includes(query) ||
        number.includes(query)
      );
    });
  }, [memberships, search]);

  const selected = memberships.find((member) => member.id === selectedId);

  const customerMatches = useMemo(() => {
    const query = phoneSearch.trim();

    if (!query) return [];

    return customers.filter((customer) =>
      customer.phone?.replace(/\D/g, "").includes(query.replace(/\D/g, ""))
    );
  }, [customers, phoneSearch]);

  const activeCount = memberships.filter(
    (member) => getStatus(member) === "ACTIVE"
  ).length;

  const suspendedCount = memberships.filter(
    (member) => getStatus(member) === "SUSPENDED"
  ).length;

  const expiredCount = memberships.filter(
    (member) => getStatus(member) === "EXPIRED"
  ).length;

  function openIssue() {
    setPhoneSearch("");
    setCustomerId("");
    setTier("STANDARD");
    setDiscountPercent("0");
    setExpiryDate("");
    setIssueOpen(true);
  }

  function openEdit(member: Membership) {
    setEditTier(member.tier || "STANDARD");
    setEditDiscount(String(Number(member.discountPercent ?? 0)));
    setEditExpiry(
      member.expiryDate
        ? new Date(member.expiryDate).toISOString().slice(0, 10)
        : ""
    );
    setEditStatus(member.status || "ACTIVE");
    setEditOpen(true);
  }

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();

    if (!customerId) {
      push("Please select a customer.", "error");
      return;
    }

    try {
      const membership = await call<Membership>("membership:issue", {
        customerId,
        tier,
        discountPercent: Number(discountPercent || 0),
        expiryDate: expiryDate
          ? new Date(`${expiryDate}T23:59:59`).toISOString()
          : null,
      });

      push("Membership created successfully.", "success");
      setIssueOpen(false);
      await loadData(membership.id);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to issue membership.",
        "error"
      );
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!selected) return;

    try {
      const updated = await call<Membership>("membership:update", {
        id: selected.id,
        tier: editTier,
        discountPercent: Number(editDiscount || 0),
        expiryDate: editExpiry
          ? new Date(`${editExpiry}T23:59:59`).toISOString()
          : null,
        status: editStatus,
      });

      push("Membership details updated.", "success");
      setEditOpen(false);
      await loadData(updated.id);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to update membership.",
        "error"
      );
    }
  }

  async function handleSuspend() {
    if (!selected) return;

    try {
      const updated = await call<Membership>("membership:suspend", {
        id: selected.id,
      });

      push("Membership suspended.", "success");
      await loadData(updated.id);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to suspend membership.",
        "error"
      );
    }
  }

  async function handleDelete() {
    if (!selected) return;

    const status = getStatus(selected);

    if (status === "ACTIVE") {
      push("Only inactive memberships can be deleted.", "error");
      return;
    }

    if (
      !window.confirm(
        `Delete membership ${selected.membershipNumber} for ${selected.customer?.name ?? "this customer"}?`
      )
    ) {
      return;
    }

    try {
      await call("membership:delete", { id: selected.id });

      push("Membership deleted.", "success");

      const remaining = memberships.filter(
        (member) => member.id !== selected.id
      );

      setMemberships(remaining);
      setSelectedId(remaining[0]?.id ?? "");
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to delete membership.",
        "error"
      );
    }
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-800 p-6 text-white shadow-xl shadow-brand-900/10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl animate-[float_12s_ease-in-out_infinite_reverse]" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-200">
              <CrownIcon />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">
                Customer Loyalty
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Membership
            </h1>

            <p className="mt-1 max-w-xl text-sm text-brand-100/80">
              Manage loyalty members, fixed discounts, membership status and
              customer benefits from one place.
            </p>
          </div>

          <Button
            onClick={openIssue}
            className="!rounded-xl !bg-white !px-5 !py-3 !font-bold !text-brand-800 shadow-lg shadow-black/10 transition-all duration-300 hover:!-translate-y-0.5 hover:!bg-emerald-50"
          >
            <span className="text-lg">+</span>
            New Membership
          </Button>
        </div>

        <div className="relative mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold">{memberships.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Active
            </p>
            <p className="mt-1 text-2xl font-bold">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Inactive
            </p>
            <p className="mt-1 text-2xl font-bold">
              {suspendedCount + expiredCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main split view */}
      <div className="grid min-h-[590px] gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        {/* History */}
        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Member History</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Newest memberships appear first
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadData(selectedId)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-600 hover:rotate-180"
                title="Refresh"
              >
                <RefreshIcon />
              </button>
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, mobile or member number..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all duration-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="max-h-[510px] overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[78px] animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : filteredMemberships.length ? (
              filteredMemberships.map((member) => {
                const status = getStatus(member);
                const selectedRow = member.id === selectedId;

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedId(member.id)}
                    className={`group mb-1 w-full rounded-2xl border p-3 text-left transition-all duration-300 ${
                      selectedRow
                        ? "border-emerald-200 bg-emerald-50/80 shadow-sm"
                        : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100 transition-transform duration-300 group-hover:scale-105 ${
                          selectedRow ? "scale-105" : ""
                        }`}
                      >
                        {(member.customer?.name || "?")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {member.customer?.name || "Unknown customer"}
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ring-1 ${statusClasses(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs font-medium text-emerald-700">
                          {member.membershipNumber}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {member.customer?.phone || "No mobile number"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <UserIcon />
                </div>
                <p className="mt-4 font-semibold text-slate-700">
                  No memberships found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Issue a membership to start building customer history.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Details */}
        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          {selected ? (
            <div className="animate-[fadeIn_.35s_cubic-bezier(0.16,1,0.3,1)]">
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-brand-50 p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-brand-700 text-xl font-bold text-white shadow-lg shadow-emerald-600/20">
                      {(selected.customer?.name || "?")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Membership Profile
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        {selected.customer?.name || "Unknown customer"}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {selected.customer?.phone || "No mobile number"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusClasses(
                      getStatus(selected)
                    )}`}
                  >
                    {getStatus(selected)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Membership Number
                    </p>
                    <p className="mt-2 text-lg font-bold tracking-wide text-emerald-700">
                      {selected.membershipNumber}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Use this number at checkout
                    </p>
                  </div>

                  <div className="group rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Fixed Discount
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">
                      {Number(selected.discountPercent ?? 0)}%
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600/70">
                      Automatically applied at POS
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Membership Tier
                      </p>
                      <p className="mt-1.5 font-semibold text-slate-800">
                        {selected.tier || "STANDARD"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Issued
                      </p>
                      <p className="mt-1.5 font-semibold text-slate-800">
                        {formatDate(selected.issueDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Expiry
                      </p>
                      <p className="mt-1.5 font-semibold text-slate-800">
                        {formatDate(selected.expiryDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <CrownIcon />
                    </div>

                    <div>
                      <p className="font-bold text-slate-800">
                        Membership benefits
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        This customer's membership number or mobile number can
                        be used at POS to identify the member and automatically
                        apply the fixed discount.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(selected)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <EditIcon />
                    Edit Details
                  </button>

                  {getStatus(selected) === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => void handleSuspend()}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-100"
                    >
                      Suspend Membership
                    </button>
                  )}

                  {getStatus(selected) !== "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => void handleDelete()}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100"
                    >
                      <TrashIcon />
                      Delete Inactive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[590px] items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CrownIcon />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-800">
                  Select a membership
                </h2>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Select a member from the history panel to view and manage
                  their membership details.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Issue membership */}
      <Modal
        open={issueOpen}
        title="Create New Membership"
        onClose={() => setIssueOpen(false)}
      >
        <form onSubmit={handleIssue} className="space-y-5">
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-800">
              Select the customer
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-700/70">
              Search by mobile number. The membership number will be generated
              automatically.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Mobile Number
            </label>

            <input
              type="tel"
              autoFocus
              value={phoneSearch}
              onChange={(e) => {
                setPhoneSearch(e.target.value);
                setCustomerId("");
              }}
              placeholder="Enter customer mobile number"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {phoneSearch && !customerId && (
            <div className="max-h-44 space-y-2 overflow-y-auto">
              {customerMatches.length ? (
                customerMatches.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => setCustomerId(customer.id)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700 transition-transform group-hover:scale-105">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {customer.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {customer.phone || "No mobile"}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  No customer found.
                </p>
              )}
            </div>
          )}

          {customerId && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              ✓ Customer selected
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Membership Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Fixed Discount %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Expiry Date <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <Button
            type="submit"
            className="w-full !rounded-xl !bg-emerald-600 !py-3 !font-bold !text-white shadow-lg shadow-emerald-600/20 hover:!bg-emerald-700"
            disabled={!customerId}
          >
            Create Membership
          </Button>
        </form>
      </Modal>

      {/* Edit membership */}
      <Modal
        open={editOpen}
        title="Edit Membership Details"
        onClose={() => setEditOpen(false)}
      >
        {selected && (
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Member
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {selected.customer?.name || "Unknown customer"}
              </p>
              <p className="mt-0.5 text-xs font-medium text-emerald-700">
                {selected.membershipNumber}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Membership Tier
              </label>
              <select
                value={editTier}
                onChange={(e) => setEditTier(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Fixed Discount %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Expiry Date
              </label>
              <input
                type="date"
                value={editExpiry}
                onChange={(e) => setEditExpiry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <Button
              type="submit"
              className="w-full !rounded-xl !bg-emerald-600 !py-3 !font-bold !text-white shadow-lg shadow-emerald-600/20 hover:!bg-emerald-700"
            >
              Save Membership
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
