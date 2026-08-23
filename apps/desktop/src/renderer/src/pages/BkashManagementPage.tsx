import { useEffect, useState, type FormEvent } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { formatBDT, formatDateTime } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface BkashTransaction {
  id: string;
  type: string; // "MANUAL_IN" | "MANUAL_OUT"
  amount: string;
  transactionDate: string;
  note?: string | null;
  createdBy: {
    fullName: string;
  };
}

const DASH = "—";

export function BkashManagementPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<BkashTransaction[]>([]);
  
  const [addAmount, setAddAmount] = useState("");
  const [addNote, setAddNote] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");

  const push = useToastStore((s) => s.push);

  async function loadData() {
    try {
      const [balData, txData] = await Promise.all([
        call<number>("bkash:balance"),
        call<BkashTransaction[]>("bkash:list"),
      ]);
      setBalance(balData);
      setTransactions(txData);
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to load bKash data", "error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddMoney(e: FormEvent) {
    e.preventDefault();
    try {
      const amt = parseFloat(addAmount);
      if (isNaN(amt) || amt <= 0) throw new Error("Enter a valid amount.");

      await call("bkash:create", {
        type: "MANUAL_IN",
        amount: amt,
        note: addNote.trim() || "Manual bKash Add",
      });

      push("bKash funds added successfully.", "success");
      setAddAmount("");
      setAddNote("");
      await loadData();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to add funds", "error");
    }
  }

  async function handleWithdrawMoney(e: FormEvent) {
    e.preventDefault();
    try {
      const amt = parseFloat(withdrawAmount);
      if (isNaN(amt) || amt <= 0) throw new Error("Enter a valid amount.");
      if (amt > balance) throw new Error("Insufficient bKash balance.");

      await call("bkash:create", {
        type: "MANUAL_OUT",
        amount: amt,
        note: withdrawNote.trim() || "Manual bKash Withdrawal",
      });

      push("bKash funds withdrawn successfully.", "success");
      setWithdrawAmount("");
      setWithdrawNote("");
      await loadData();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to withdraw funds", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-700">Digital Fund Management</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">bKash Management</h1>
        <p className="mt-1.5 text-sm text-slate-500">Manage digital bKash funds, additions, withdrawals, and transaction history.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="!bg-gradient-to-br from-pink-900 to-pink-700 !text-white p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-pink-200">Available bKash Balance</p>
          <p className="mt-2 text-3xl font-black">{formatBDT(balance)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h3 className="text-base font-bold text-slate-900">Add bKash Funds</h3>
          <form onSubmit={handleAddMoney} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600">Amount (৳)</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-pink-500"
                placeholder="0.00"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Note (Optional)</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-pink-500"
                placeholder="e.g. Deposit from bank"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
              />
            </div>
            <Button type="submit" className="!rounded-xl !bg-pink-700 hover:!bg-pink-800">Add bKash Funds</Button>
          </form>
        </Card>

        <Card>
          <h3 className="text-base font-bold text-slate-900">Withdraw bKash Funds</h3>
          <form onSubmit={handleWithdrawMoney} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600">Amount (৳)</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-rose-500"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Note (Optional)</label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-rose-500"
                placeholder="e.g. Personal withdrawal"
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
              />
            </div>
            <Button type="submit" className="!rounded-xl !bg-rose-600 hover:!bg-rose-700">Withdraw bKash Funds</Button>
          </form>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <h2 className="text-sm font-black text-slate-900">bKash Transaction History</h2>
        </div>
        <DataTable
          rows={transactions}
          keyFor={(t) => t.id}
          emptyMessage="No bKash transactions recorded yet."
          columns={[
            {
              header: "Type",
              accessor: (t) => (
                <span className={`font-bold text-xs px-2.5 py-1 rounded-full ${t.type === "MANUAL_IN" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  {t.type === "MANUAL_IN" ? "Cash In" : "Cash Out"}
                </span>
              ),
            },
            {
              header: "Date",
              accessor: (t) => formatDateTime(t.transactionDate),
            },
            {
              header: "Note",
              accessor: (t) => t.note || DASH,
            },
            {
              header: "Amount",
              accessor: (t) => (
                <span className={`font-bold ${t.type === "MANUAL_IN" ? "text-emerald-700" : "text-rose-700"}`}>
                  {t.type === "MANUAL_IN" ? "+" : "-"}{formatBDT(t.amount)}
                </span>
              ),
            },
            {
              header: "Processed By",
              accessor: (t) => t.createdBy?.fullName || "Admin",
            },
          ]}
        />
      </Card>
    </div>
  );
}
