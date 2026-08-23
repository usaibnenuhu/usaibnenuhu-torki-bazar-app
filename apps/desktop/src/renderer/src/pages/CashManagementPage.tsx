import { useCallback, useEffect, useState } from "react";
import { useLanguageStore } from "../store/languageStore";
import { call } from "../api/client";

type CashTransaction = {
  id: number;
  type: "MANUAL_IN" | "MANUAL_OUT";
  amount: number;
  transactionDate: string;
  note?: string | null;
  createdAt?: string;
};

type CashForm = {
  amount: string;
  note: string;
  date: string;
};

function today() {
  return new Date().toISOString().split("T")[0];
}

export function CashManagementPage() {
  const { lang, n } = useLanguageStore();

  const isBangla = lang === "bn";

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);

  const [addForm, setAddForm] = useState<CashForm>({
    amount: "",
    note: "",
    date: today(),
  });

  const [withdrawForm, setWithdrawForm] = useState<CashForm>({
    amount: "",
    note: "",
    date: today(),
  });

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");

  /*
   * ============================================================
   * LOAD CASH DATA
   * ============================================================
   */

  const loadCashData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [currentBalance, history] = await Promise.all([
        call<number>("cash:balance"),
        call<CashTransaction[]>("cash:list"),
      ]);

      setBalance(Number(currentBalance) || 0);

      const normalized = (history ?? []).map((item) => ({
        ...item,
        amount: Number(item.amount) || 0,
      }));

      setTransactions(normalized);
    } catch (err) {
      console.error("Failed to load cash data:", err);

      setError(
        err instanceof Error
          ? err.message
          : isBangla
          ? "ক্যাশ তথ্য লোড করা যায়নি।"
          : "Unable to load cash information."
      );
    } finally {
      setLoading(false);
    }
  }, [isBangla]);

  useEffect(() => {
    void loadCashData();
  }, [loadCashData]);

  /*
   * ============================================================
   * DATE FORMAT
   * ============================================================
   */

  function formatDate(date: string) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      isBangla ? "bn-BD" : "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /*
   * ============================================================
   * ADD MONEY
   * ============================================================
   */

  async function addMoney() {
    const value = Number(addForm.amount);

    if (!Number.isFinite(value) || value <= 0) {
      setError(
        isBangla
          ? "দয়া করে সঠিক টাকার পরিমাণ লিখুন।"
          : "Please enter a valid amount."
      );
      return;
    }

    try {
      setAdding(true);
      setError("");

      await call("cash:create", {
        type: "MANUAL_IN",
        amount: value,
        transactionDate: new Date(
          `${addForm.date}T00:00:00`
        ),
        note: addForm.note.trim() || undefined,
      });

      setAddForm({
        amount: "",
        note: "",
        date: today(),
      });

      await loadCashData();
    } catch (err) {
      console.error("Failed to add cash:", err);

      setError(
        err instanceof Error
          ? err.message
          : isBangla
          ? "ক্যাশ যোগ করা যায়নি।"
          : "Unable to add cash."
      );
    } finally {
      setAdding(false);
    }
  }

  /*
   * ============================================================
   * WITHDRAW MONEY
   * ============================================================
   */

  async function withdrawMoney() {
    const value = Number(withdrawForm.amount);

    if (!Number.isFinite(value) || value <= 0) {
      setError(
        isBangla
          ? "দয়া করে সঠিক টাকার পরিমাণ লিখুন।"
          : "Please enter a valid amount."
      );
      return;
    }

    if (value > balance) {
      setError(
        isBangla
          ? "আপনার Available Cash-এর চেয়ে বেশি টাকা উত্তোলন করা যাবে না।"
          : "You cannot withdraw more than your available cash."
      );
      return;
    }

    try {
      setWithdrawing(true);
      setError("");

      await call("cash:create", {
        type: "MANUAL_OUT",
        amount: value,
        transactionDate: new Date(
          `${withdrawForm.date}T00:00:00`
        ),
        note: withdrawForm.note.trim() || undefined,
      });

      setWithdrawForm({
        amount: "",
        note: "",
        date: today(),
      });

      await loadCashData();
    } catch (err) {
      console.error("Failed to withdraw cash:", err);

      setError(
        err instanceof Error
          ? err.message
          : isBangla
          ? "ক্যাশ উত্তোলন করা যায়নি।"
          : "Unable to withdraw cash."
      );
    } finally {
      setWithdrawing(false);
    }
  }

  /*
   * ============================================================
   * SUMMARY
   * ============================================================
   */

  const totalAdded = transactions
    .filter((item) => item.type === "MANUAL_IN")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalWithdrawn = transactions
    .filter((item) => item.type === "MANUAL_OUT")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="min-h-full bg-brand-50">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-7 text-white shadow-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />

          <div className="absolute -bottom-24 right-32 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                {isBangla
                  ? "ক্যাশ ও ফান্ড ম্যানেজমেন্ট"
                  : "Cash & Fund Management"}
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Cash Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-100">
                {isBangla
                  ? "আপনার ব্যবসার হাতে থাকা ক্যাশ, যোগ এবং উত্তোলনের সম্পূর্ণ হিসাব পরিচালনা করুন।"
                  : "Manage your business cash, additions, withdrawals, and transaction history from one place."}
              </p>
            </div>

            <div className="min-w-[250px] rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">
                  Available Cash
                </p>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-xl">
                  💰
                </div>
              </div>

              <p className="mt-3 text-4xl font-bold tracking-tight">
                ৳{n(balance.toFixed(2))}
              </p>

              <p className="mt-1 text-xs text-brand-200">
                {isBangla
                  ? "বর্তমান ব্যবসায়িক ক্যাশ"
                  : "Current business cash balance"}
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            <span className="text-lg">⚠️</span>

            <div>
              <p className="font-semibold">
                {isBangla
                  ? "লেনদেন করা যায়নি"
                  : "Transaction failed"}
              </p>

              <p className="mt-0.5">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* ======================================================
            SUMMARY
        ======================================================= */}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Available */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Available Cash
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ৳{n(balance.toFixed(2))}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {isBangla
                    ? "বর্তমান ব্যালেন্স"
                    : "Current balance"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                💰
              </div>
            </div>
          </div>

          {/* Total Added */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {isBangla ? "মোট যোগ" : "Total Added"}
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ৳{n(totalAdded.toFixed(2))}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {isBangla
                    ? "ক্যাশে মোট যোগ হয়েছে"
                    : "Total cash added"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                ↗
              </div>
            </div>
          </div>

          {/* Total Withdrawn */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {isBangla
                    ? "মোট উত্তোলন"
                    : "Total Withdrawn"}
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ৳{n(totalWithdrawn.toFixed(2))}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {isBangla
                    ? "ক্যাশ থেকে মোট উত্তোলন"
                    : "Total cash withdrawn"}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                ↙
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            ACTION AREA
        ======================================================= */}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Cash Transactions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isBangla
                ? "ক্যাশ যোগ অথবা উত্তোলনের মাধ্যমে আপনার ব্যালেন্স আপডেট করুন।"
                : "Add or withdraw money to update your available cash balance."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* ==================================================
                ADD MONEY
            =================================================== */}

            <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
              <div className="border-b border-emerald-100 bg-emerald-50/60 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-sm">
                    +
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {isBangla
                        ? "ক্যাশ যোগ করুন"
                        : "Add Money"}
                    </h3>

                    <p className="mt-0.5 text-sm text-gray-500">
                      {isBangla
                        ? "ব্যাংক বা ব্যবসায়িক ফান্ড থেকে ক্যাশ যোগ করুন"
                        : "Add cash from bank or business funds"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">

                {/* Amount */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {isBangla ? "টাকার পরিমাণ" : "Amount"}
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">
                      ৳
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={addForm.amount}
                      onChange={(e) =>
                        setAddForm((current) => ({
                          ...current,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      disabled={adding}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-4 text-lg font-semibold text-gray-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Date */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {isBangla ? "তারিখ" : "Date"}
                  </label>

                  <input
                    type="date"
                    value={addForm.date}
                    onChange={(e) =>
                      setAddForm((current) => ({
                        ...current,
                        date: e.target.value,
                      }))
                    }
                    disabled={adding}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Note */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {isBangla ? "নোট" : "Note"}

                    <span className="ml-1 font-normal text-gray-400">
                      ({isBangla ? "ঐচ্ছিক" : "Optional"})
                    </span>
                  </label>

                  <input
                    type="text"
                    value={addForm.note}
                    onChange={(e) =>
                      setAddForm((current) => ({
                        ...current,
                        note: e.target.value,
                      }))
                    }
                    placeholder={
                      isBangla
                        ? "যেমন: ব্যবসায়িক ফান্ড"
                        : "e.g. Business fund"
                    }
                    disabled={adding}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="button"
                  onClick={addMoney}
                  disabled={adding || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-lg">+</span>

                  {adding
                    ? isBangla
                      ? "যোগ হচ্ছে..."
                      : "Adding..."
                    : isBangla
                    ? "ক্যাশ যোগ করুন"
                    : "Add Money"}
                </button>
              </div>
            </div>

            {/* ==================================================
                WITHDRAW MONEY
            =================================================== */}

            <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
              <div className="border-b border-red-100 bg-red-50/60 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-xl text-white shadow-sm">
                    −
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {isBangla
                        ? "ক্যাশ উত্তোলন করুন"
                        : "Withdraw Money"}
                    </h3>

                    <p className="mt-0.5 text-sm text-gray-500">
                      {isBangla
                        ? "ব্যবসা থেকে ক্যাশ উত্তোলন করুন"
                        : "Withdraw cash from the business"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">

                {/* Amount */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {isBangla ? "টাকার পরিমাণ" : "Amount"}
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">
                      ৳
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={withdrawForm.amount}
                      onChange={(e) =>
                        setWithdrawForm((current) => ({
                          ...current,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      disabled={withdrawing}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-4 text-lg font-semibold text-gray-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Date */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {isBangla ? "তারিখ" : "Date"}
                  </label>

                  <input
                    type="date"
                    value={withdrawForm.date}
                    onChange={(e) =>
                      setWithdrawForm((current) => ({
                        ...current,
                        date: e.target.value,
                      }))
                    }
                    disabled={withdrawing}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Note */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {isBangla ? "নোট" : "Note"}

                    <span className="ml-1 font-normal text-gray-400">
                      ({isBangla ? "ঐচ্ছিক" : "Optional"})
                    </span>
                  </label>

                  <input
                    type="text"
                    value={withdrawForm.note}
                    onChange={(e) =>
                      setWithdrawForm((current) => ({
                        ...current,
                        note: e.target.value,
                      }))
                    }
                    placeholder={
                      isBangla
                        ? "যেমন: ব্যক্তিগত উত্তোলন"
                        : "e.g. Personal withdrawal"
                    }
                    disabled={withdrawing}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="button"
                  onClick={withdrawMoney}
                  disabled={withdrawing || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-lg">−</span>

                  {withdrawing
                    ? isBangla
                      ? "উত্তোলন হচ্ছে..."
                      : "Withdrawing..."
                    : isBangla
                    ? "ক্যাশ উত্তোলন করুন"
                    : "Withdraw Money"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            CASH HISTORY
        ======================================================= */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-gray-900">
                Cash History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isBangla
                  ? "আপনার সকল ক্যাশ যোগ ও উত্তোলনের রেকর্ড"
                  : "Complete history of cash additions and withdrawals"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
              {loading
                ? isBangla
                  ? "লোড হচ্ছে..."
                  : "Loading..."
                : `${n(transactions.length)} ${
                    isBangla ? "টি লেনদেন" : "transactions"
                  }`}
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />

              <p className="mt-4 text-sm text-gray-500">
                {isBangla
                  ? "ক্যাশ তথ্য লোড হচ্ছে..."
                  : "Loading cash information..."}
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                💰
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                {isBangla
                  ? "এখনও কোনো ক্যাশ লেনদেন নেই"
                  : "No cash transactions yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                {isBangla
                  ? "উপরের Add Money অথবা Withdraw Money ব্যবহার করে আপনার প্রথম ক্যাশ লেনদেন তৈরি করুন।"
                  : "Use Add Money or Withdraw Money above to create your first cash transaction."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">

                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      {isBangla ? "লেনদেন" : "Transaction"}
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      {isBangla ? "তারিখ" : "Date"}
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      {isBangla ? "নোট" : "Note"}
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      {isBangla ? "পরিমাণ" : "Amount"}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction) => {
                    const isIncome =
                      transaction.type === "MANUAL_IN";

                    return (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-gray-50/80"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                                isIncome
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {isIncome ? "↗" : "↙"}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-900">
                                {isIncome
                                  ? isBangla
                                    ? "ম্যানুয়াল ক্যাশ যোগ"
                                    : "Manual Add"
                                  : isBangla
                                  ? "ম্যানুয়াল ক্যাশ উত্তোলন"
                                  : "Manual Withdrawal"}
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  isIncome
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {isIncome
                                  ? isBangla
                                    ? "ক্যাশ ইন"
                                    : "Cash In"
                                  : isBangla
                                  ? "ক্যাশ আউট"
                                  : "Cash Out"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>📅</span>

                            {formatDate(
                              transaction.transactionDate
                            )}
                          </div>
                        </td>

                        <td className="max-w-xs px-6 py-4">
                          <p className="truncate text-sm text-gray-500">
                            {transaction.note ||
                              (isBangla
                                ? "কোনো নোট নেই"
                                : "No note")}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <p
                            className={`text-sm font-bold ${
                              isIncome
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {isIncome ? "+" : "-"}৳
                            {n(
                              Number(
                                transaction.amount
                              ).toFixed(2)
                            )}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ======================================================
            FOOTER
        ======================================================= */}

        <div className="flex items-center justify-center gap-2 pb-4 text-xs text-gray-400">
          <span>🔒</span>

          <span>
            {isBangla
              ? "ক্যাশ ম্যানেজমেন্ট সিস্টেম"
              : "Cash Management System"}
          </span>
        </div>
      </div>
    </div>
  );
}