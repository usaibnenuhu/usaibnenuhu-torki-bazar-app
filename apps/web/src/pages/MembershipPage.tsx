import { useEffect, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Field, Input } from "../components/Form";
import { Modal } from "../components/Modal";
import { useToastStore } from "../store/toastStore";

interface Customer {
  id: string;
  name: string;
  phone?: string;
}

export function MembershipPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [found, setFound] = useState<any>(null);
  const push = useToastStore((s) => s.push);

  useEffect(() => {
    call<Customer[]>("customers:list").then(setCustomers).catch(() => {});
  }, []);

  const matches = customers.filter(
    (c) => phoneSearch && c.phone?.includes(phoneSearch)
  );

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    try {
      await call("membership:issue", { customerId });
      push("Membership card issued.", "success");
      setModalOpen(false);
      setCustomerId("");
      setPhoneSearch("");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to issue membership", "error");
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    try {
      setFound(await call("membership:find", { code: searchCode }));
    } catch (err) {
      setFound(null);
      push(err instanceof Error ? err.message : "Membership not found", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Membership</h1>
          <p className="text-sm text-slate-500">Issue and look up customer membership cards.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Issue Membership</Button>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-slate-800">Find membership</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Membership ID or QR code"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>

        {found && (
          <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-lg font-semibold">{found.customer?.name}</p>
            <p>Member ID: {found.membershipNumber}</p>
            <p>Phone: {found.customer?.phone ?? "—"}</p>
            <p>Status: {found.status}</p>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title="Issue Membership Card"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleIssue} className="space-y-4">
          <Field label="Search Customer by Mobile Number">
            <Input
              type="tel"
              placeholder="Enter mobile number"
              value={phoneSearch}
              onChange={(e) => {
                setPhoneSearch(e.target.value);
                setCustomerId("");
              }}
            />
          </Field>

          {phoneSearch && !customerId && (
            <div className="space-y-2">
              {matches.length ? (
                matches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCustomerId(c.id)}
                    className="w-full rounded-lg border p-3 text-left hover:bg-slate-50"
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-slate-500">{c.phone}</div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">No customer found.</p>
              )}
            </div>
          )}

          {customerId && (
            <p className="rounded-lg bg-green-50 p-3 text-sm">
              Customer selected ✓
            </p>
          )}

          <Button type="submit" className="w-full" disabled={!customerId}>
            Issue Card
          </Button>
        </form>
      </Modal>
    </div>
  );
}