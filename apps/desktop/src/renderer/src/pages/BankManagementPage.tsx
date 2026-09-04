
import { useEffect, useMemo, useState } from "react";
import { call } from "../api/client";

type Account = "CASH" | "BKASH" | "BANK";

type BankTransaction = {
  id: string;
  type: string;
  amount: number | string;
  transactionDate: string;
  note?: string | null;
  reference?: string | null;
  transferId?: string | null;
  createdBy?: {
    fullName?: string | null;
  } | null;
};

const money = (value: number | string) =>
  `৳${Number(value).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const accountLabel = (account: Account) =>
  account === "CASH"
    ? "Cash"
    : account === "BKASH"
      ? "bKash"
      : "Bank";

export function BankManagementPage() {
  const [bankBalance, setBankBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [bkashBalance, setBkashBalance] = useState(0);
  const [transactions, setTransactions] =
    useState<BankTransaction[]>([]);

  const [from, setFrom] = useState<Account>("CASH");
  const [to, setTo] = useState<Account>("BANK");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");

  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const [
      bank,
      cash,
      bkash,
      rows,
    ] = await Promise.all([
      call<number>("bank:balance"),
      call<number>("cash:balance"),
      call<number>("bkash:balance"),
      call<BankTransaction[]>("bank:list"),
    ]);

    setBankBalance(Number(bank || 0));
    setCashBalance(Number(cash || 0));
    setBkashBalance(Number(bkash || 0));
    setTransactions(
      (rows || []).map((row) => ({
        ...row,
        amount: Number(row.amount),
      }))
    );
  }

  useEffect(() => {
    load().catch((error) => {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load fund balances."
      );
    });
  }, []);

  const balances = useMemo(
    () => ({
      CASH: cashBalance,
      BKASH: bkashBalance,
      BANK: bankBalance,
    }),
    [cashBalance, bkashBalance, bankBalance]
  );

  async function transfer() {
    const value = Number(amount);

    if (!value || value <= 0) {
      setMessage("Enter a valid transfer amount.");
      return;
    }

    if (from === to) {
      setMessage("Choose different source and destination accounts.");
      return;
    }

    if (value > balances[from]) {
      setMessage(
        `Insufficient ${accountLabel(from)} balance. Available ${money(
          balances[from]
        )}.`
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await call("bank:transfer", {
        from,
        to,
        amount: value,
        note:
          note.trim() ||
          `${accountLabel(from)} → ${accountLabel(to)}`,
        reference: reference.trim() || undefined,
      });

      setAmount("");
      setNote("");
      setReference("");
      setMessage(
        `${accountLabel(from)} → ${accountLabel(to)} transfer completed successfully.`
      );

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Transfer failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createBank(type: "DEPOSIT" | "WITHDRAWAL") {
    const value = Number(
      type === "DEPOSIT"
        ? depositAmount
        : withdrawAmount
    );

    if (!value || value <= 0) {
      setMessage("Enter a valid bank amount.");
      return;
    }

    if (
      type === "WITHDRAWAL" &&
      value > bankBalance
    ) {
      setMessage(
        `Insufficient Bank balance. Available ${money(bankBalance)}.`
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await call("bank:create", {
        type,
        amount: value,
        note:
          type === "DEPOSIT"
            ? depositNote.trim() || "Bank Deposit"
            : withdrawNote.trim() || "Bank Withdrawal",
      });

      setDepositAmount("");
      setDepositNote("");
      setWithdrawAmount("");
      setWithdrawNote("");

      setMessage(
        type === "DEPOSIT"
          ? "Bank deposit recorded."
          : "Bank withdrawal recorded."
      );

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Bank transaction failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      name: "Cash",
      value: cashBalance,
      icon: "💵",
      cls: "from-emerald-700 to-emerald-900",
    },
    {
      name: "bKash",
      value: bkashBalance,
      icon: "📱",
      cls: "from-pink-600 to-pink-800",
    },
    {
      name: "Bank",
      value: bankBalance,
      icon: "🏦",
      cls: "from-slate-800 to-slate-950",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-7 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              Fund Control Center
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Bank Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Move money safely between Bank, Cash and bKash while keeping
              every account balance and transfer history connected.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Available Bank Balance
            </p>
            <p className="mt-1 text-3xl font-black">
              {money(bankBalance)}
            </p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.name}
            className={`rounded-2xl bg-gradient-to-br ${card.cls} p-5 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-75">
                  Available {card.name}
                </p>
                <p className="mt-2 text-2xl font-black">
                  {money(card.value)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
            Connected Transfers
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Move Money Between Accounts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            One transfer creates both sides of the ledger automatically.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-slate-600">
              From
            </label>
            <select
              value={from}
              onChange={(e) =>
                setFrom(e.target.value as Account)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none focus:border-emerald-500"
            >
              <option value="CASH">💵 Cash</option>
              <option value="BKASH">📱 bKash</option>
              <option value="BANK">🏦 Bank</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Available: {money(balances[from])}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">
              To
            </label>
            <select
              value={to}
              onChange={(e) =>
                setTo(e.target.value as Account)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none focus:border-emerald-500"
            >
              <option value="BANK">🏦 Bank</option>
              <option value="CASH">💵 Cash</option>
              <option value="BKASH">📱 bKash</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Current: {money(balances[to])}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">
              Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">
              Reference
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Bank slip / transfer reference"
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600">
              Note
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional transfer note"
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              disabled={loading}
              onClick={transfer}
              className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : `${accountLabel(from)} → ${accountLabel(to)}`}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Cash → Bank", "CASH", "BANK"],
            ["bKash → Bank", "BKASH", "BANK"],
            ["Bank → Cash", "BANK", "CASH"],
            ["Bank → bKash", "BANK", "BKASH"],
          ].map(([label, source, destination]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setFrom(source as Account);
                setTo(destination as Account);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
            Bank In
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Deposit / Money In
          </h2>

          <input
            type="number"
            min="0"
            step="0.01"
            value={depositAmount}
            onChange={(e) =>
              setDepositAmount(e.target.value)
            }
            placeholder="Amount"
            className="mt-5 w-full rounded-xl border border-slate-200 p-3 text-sm"
          />

          <input
            value={depositNote}
            onChange={(e) =>
              setDepositNote(e.target.value)
            }
            placeholder="Note"
            className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm"
          />

          <button
            type="button"
            disabled={loading}
            onClick={() => createBank("DEPOSIT")}
            className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800"
          >
            Add Bank Deposit
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">
            Bank Out
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Bank Withdrawal
          </h2>

          <input
            type="number"
            min="0"
            step="0.01"
            value={withdrawAmount}
            onChange={(e) =>
              setWithdrawAmount(e.target.value)
            }
            placeholder="Amount"
            className="mt-5 w-full rounded-xl border border-slate-200 p-3 text-sm"
          />

          <input
            value={withdrawNote}
            onChange={(e) =>
              setWithdrawNote(e.target.value)
            }
            placeholder="Note"
            className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm"
          />

          <button
            type="button"
            disabled={loading}
            onClick={() => createBank("WITHDRAWAL")}
            className="mt-4 rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-700"
          >
            Withdraw From Bank
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Ledger
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            Bank Transaction History
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No bank transactions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Note</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Processed By</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => {
                  const incoming =
                    transaction.type === "BANK_IN" ||
                    transaction.type === "DEPOSIT";

                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap items-center rounded-full px-3 py-1 text-xs font-black ${
                            incoming
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {incoming ? "Money In" : "Money Out"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {transaction.reference || "—"}
                      </td>

                      <td className="min-w-[260px] px-6 py-4 text-slate-700">
                        {transaction.note || "—"}
                      </td>

                      <td
                        className={`whitespace-nowrap px-6 py-4 text-right font-black ${
                          incoming
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {incoming ? "+" : "-"}
                        {money(transaction.amount)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {transaction.createdBy?.fullName ||
                          "Admin"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
