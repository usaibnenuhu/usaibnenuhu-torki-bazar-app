import { useEffect, useMemo, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { Field, Input } from "../components/Form";
import { formatBDT, formatDate } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface Closing {
  id: string;
  closingDate: string;
  totalSales: string;
  cogs: string;
  grossProfit: string;
  expenses: string;
  netOperatingResult: string;
}

type RangeFilter = "all" | "7days" | "month" | "quarter" | "year" | "custom";
type GroupBy = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

interface GroupedRow {
  key: string;
  sampleDate: Date;
  sales: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  net: number;
  days: number;
}

const DASH = "—";

/* ----------------------------------------------------------------------- */
/*  DATE / GROUPING HELPERS (pure, presentational — no new API calls)       */
/* ----------------------------------------------------------------------- */

function toDate(value: string) {
  return new Date(value);
}

function quarterOf(d: Date) {
  return Math.floor(d.getMonth() / 3) + 1;
}

function startOfWeek(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function inRange(
  d: Date,
  range: RangeFilter,
  customFrom: string,
  customTo: string
) {
  if (range === "all") return true;

  const now = new Date();

  if (range === "7days") {
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);
    return d >= cutoff;
  }

  if (range === "month") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  }

  if (range === "quarter") {
    return (
      d.getFullYear() === now.getFullYear() &&
      quarterOf(d) === quarterOf(now)
    );
  }

  if (range === "year") {
    return d.getFullYear() === now.getFullYear();
  }

  if (range === "custom") {
    if (!customFrom || !customTo) return true;
    const from = new Date(customFrom);
    from.setHours(0, 0, 0, 0);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    return d >= from && d <= to;
  }

  return true;
}

function groupKey(d: Date, groupBy: GroupBy) {
  if (groupBy === "daily") return d.toISOString().slice(0, 10);
  if (groupBy === "weekly") return startOfWeek(d).toISOString().slice(0, 10);
  if (groupBy === "monthly")
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (groupBy === "quarterly") return `${d.getFullYear()}-Q${quarterOf(d)}`;
  return `${d.getFullYear()}`;
}

function groupLabel(d: Date, groupBy: GroupBy) {
  if (groupBy === "daily") {
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (groupBy === "weekly") {
    const start = startOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startLabel = start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    const endLabel = end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startLabel} – ${endLabel}`;
  }

  if (groupBy === "monthly") {
    return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }

  if (groupBy === "quarterly") {
    return `Q${quarterOf(d)} ${d.getFullYear()}`;
  }

  return `${d.getFullYear()}`;
}

function shortAxisLabel(d: Date, groupBy: GroupBy) {
  if (groupBy === "daily" || groupBy === "weekly") {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  if (groupBy === "monthly") {
    return d.toLocaleDateString("en-GB", { month: "short" });
  }
  if (groupBy === "quarterly") {
    return `Q${quarterOf(d)}`;
  }
  return `${d.getFullYear()}`;
}

/* ----------------------------------------------------------------------- */
/*  LINE-STYLE ICONS (presentational only)                                  */
/* ----------------------------------------------------------------------- */

function TrendIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <path d="M3 9h18" />
      <path d="M16 14h2" />
    </svg>
  );
}

function ExpenseIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h10" />
      <path d="M7 13h5" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M5 8l-3 6a3.5 3.5 0 0 0 6 0Z" />
      <path d="M19 8l-3 6a3.5 3.5 0 0 0 6 0Z" />
      <path d="M5 8h14" />
      <path d="M9 21h6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
      <path d="M7 5H4a3 3 0 0 0 3 5" />
      <path d="M17 5h3a3 3 0 0 1-3 5" />
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/*  KPI TILE                                                                 */
/* ----------------------------------------------------------------------- */

function KpiTile({
  label,
  value,
  sub,
  icon,
  tone,
  delay,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone: "green" | "blue" | "rose" | "violet" | "amber";
  delay: number;
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-sky-50 text-sky-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div
      className="kpi-tile group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 ${tones[tone].split(" ")[0]}`} />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const [closings, setClosings] = useState<Closing[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const push = useToastStore((s) => s.push);

  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("daily");

  async function load() {
    setClosings(await call<Closing[]>("reports:dailyClosing:list"));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGenerate() {
    try {
      await call("reports:dailyClosing:generate", { date });
      push("Daily closing generated successfully.", "success");
      load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to generate closing",
        "error"
      );
    }
  }

  /* -----------------------------------------------------------
     REPORT VIEW — derived entirely from `closings` above.
     No new backend calls; range/group are display-only filters.
     ----------------------------------------------------------- */

  const filteredClosings = useMemo(() => {
    return closings
      .filter((c) => inRange(toDate(c.closingDate), rangeFilter, customFrom, customTo))
      .sort((a, b) => toDate(b.closingDate).getTime() - toDate(a.closingDate).getTime());
  }, [closings, rangeFilter, customFrom, customTo]);

  const summary = useMemo(() => {
    const totals = filteredClosings.reduce(
      (acc, c) => {
        acc.sales += Number(c.totalSales || 0);
        acc.cogs += Number(c.cogs || 0);
        acc.grossProfit += Number(c.grossProfit || 0);
        acc.expenses += Number(c.expenses || 0);
        acc.net += Number(c.netOperatingResult || 0);
        return acc;
      },
      { sales: 0, cogs: 0, grossProfit: 0, expenses: 0, net: 0 }
    );

    const days = filteredClosings.length;
    const avgNet = days > 0 ? totals.net / days : 0;

    let bestDay: Closing | null = null;
    for (const c of filteredClosings) {
      if (!bestDay || Number(c.netOperatingResult) > Number(bestDay.netOperatingResult)) {
        bestDay = c;
      }
    }

    return { ...totals, days, avgNet, bestDay };
  }, [filteredClosings]);

  const groupedRows = useMemo<GroupedRow[]>(() => {
    const map = new Map<string, GroupedRow>();

    for (const c of filteredClosings) {
      const d = toDate(c.closingDate);
      const key = groupKey(d, groupBy);
      const existing = map.get(key);

      if (existing) {
        existing.sales += Number(c.totalSales || 0);
        existing.cogs += Number(c.cogs || 0);
        existing.grossProfit += Number(c.grossProfit || 0);
        existing.expenses += Number(c.expenses || 0);
        existing.net += Number(c.netOperatingResult || 0);
        existing.days += 1;
      } else {
        map.set(key, {
          key,
          sampleDate: d,
          sales: Number(c.totalSales || 0),
          cogs: Number(c.cogs || 0),
          grossProfit: Number(c.grossProfit || 0),
          expenses: Number(c.expenses || 0),
          net: Number(c.netOperatingResult || 0),
          days: 1,
        });
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => b.sampleDate.getTime() - a.sampleDate.getTime()
    );
  }, [filteredClosings, groupBy]);

  const chartRows = useMemo(() => {
    return [...groupedRows]
      .sort((a, b) => a.sampleDate.getTime() - b.sampleDate.getTime())
      .slice(-14);
  }, [groupedRows]);

  const chartMax = Math.max(1, ...chartRows.map((r) => Math.abs(r.net)), 1);

  const rangeLabel =
    rangeFilter === "all"
      ? "All Time"
      : rangeFilter === "7days"
      ? "Last 7 Days"
      : rangeFilter === "month"
      ? "This Month"
      : rangeFilter === "quarter"
      ? "This Quarter"
      : rangeFilter === "year"
      ? "This Year"
      : "Custom Range";

  return (
    <div className="reports-root min-h-full bg-slate-50/60 p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* =========================================================
            PAGE HEADER
        ========================================================= */}
        <div className="hero-panel relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10 sm:p-7">
          <div className="hero-mesh pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl animate-[float_12s_ease-in-out_infinite_reverse]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="reveal flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur-sm">
                📊
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="hero-title text-2xl font-bold tracking-tight sm:text-3xl">
                    Reports
                  </h1>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-100 backdrop-blur-sm">
                    {rangeLabel}
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80">
                  Business performance across daily, weekly, monthly,
                  quarterly and yearly views — built from your closing
                  history.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              className="reveal inline-flex h-10 items-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              style={{ animationDelay: "80ms" }}
            >
              <span className="text-base transition-transform duration-500 group-hover:rotate-180">↻</span>
              Refresh
            </button>
          </div>
        </div>

        {/* =========================================================
            FILTERS
        ========================================================= */}
        <div className="reveal" style={{ animationDelay: "120ms" }}>
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                <CalendarIcon />
                Report Range
              </p>
              <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {(
                  [
                    ["all", "All Time"],
                    ["7days", "Last 7 Days"],
                    ["month", "This Month"],
                    ["quarter", "This Quarter"],
                    ["year", "This Year"],
                    ["custom", "Custom"],
                  ] as const
                ).map(([key, text]) => (
                  <button
                    key={key}
                    onClick={() => setRangeFilter(key)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                      rangeFilter === key
                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>

              {rangeFilter === "custom" && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-xs">
                  <Field label="From">
                    <Input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                    />
                  </Field>
                  <Field label="To">
                    <Input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                    />
                  </Field>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                Group By
              </p>
              <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {(
                  [
                    ["daily", "Daily"],
                    ["weekly", "Weekly"],
                    ["monthly", "Monthly"],
                    ["quarterly", "Quarterly"],
                    ["yearly", "Yearly"],
                  ] as const
                ).map(([key, text]) => (
                  <button
                    key={key}
                    onClick={() => setGroupBy(key)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                      groupBy === key
                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
        </div>

        {/* =========================================================
            KPI SUMMARY
        ========================================================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiTile
            label="Total Sales"
            value={formatBDT(summary.sales)}
            sub={`${summary.days} day${summary.days === 1 ? "" : "s"} in range`}
            icon={<TrendIcon />}
            tone="green"
            delay={0}
          />
          <KpiTile
            label="Gross Profit"
            value={formatBDT(summary.grossProfit)}
            sub={`COGS: ${formatBDT(summary.cogs)}`}
            icon={<WalletIcon />}
            tone="blue"
            delay={40}
          />
          <KpiTile
            label="Total Expenses"
            value={formatBDT(summary.expenses)}
            sub="Operating costs"
            icon={<ExpenseIcon />}
            tone="rose"
            delay={80}
          />
          <KpiTile
            label="Net Result"
            value={formatBDT(summary.net)}
            sub={summary.net >= 0 ? "Profitable period" : "Loss for period"}
            icon={<ScaleIcon />}
            tone={summary.net >= 0 ? "green" : "rose"}
            delay={120}
          />
          <KpiTile
            label="Average Daily Net"
            value={formatBDT(summary.avgNet)}
            sub="Per closing"
            icon={<TrendIcon />}
            tone="violet"
            delay={160}
          />
          <KpiTile
            label="Best Day"
            value={summary.bestDay ? formatBDT(summary.bestDay.netOperatingResult) : DASH}
            sub={summary.bestDay ? formatDate(summary.bestDay.closingDate) : "No data yet"}
            icon={<TrophyIcon />}
            tone="amber"
            delay={200}
          />
        </div>

        {/* =========================================================
            TREND CHART
        ========================================================= */}
        <div className="reveal" style={{ animationDelay: "240ms" }}>
        <Card>
          <div className="mb-5 flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Net Result Trend
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)} view ·
                {" "}last {chartRows.length} period{chartRows.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400" />
                Profit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-rose-600 to-rose-400" />
                Loss
              </span>
            </div>
          </div>

          {chartRows.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">
              Not enough data yet to chart a trend.
            </div>
          ) : (
            <div className="flex h-52 items-end gap-2 sm:gap-3">
              {chartRows.map((r, i) => {
                const heightPct = Math.max(4, (Math.abs(r.net) / chartMax) * 100);
                const positive = r.net >= 0;

                return (
                  <div key={r.key} className="group/bar flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex h-40 w-full items-end justify-center">
                      <div
                        className={`chart-bar w-full max-w-[30px] rounded-t-lg transition-opacity duration-300 group-hover/bar:opacity-80 ${
                          positive
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                            : "bg-gradient-to-t from-rose-600 to-rose-400"
                        }`}
                        style={{
                          height: `${heightPct}%`,
                          animationDelay: `${i * 40}ms`,
                        }}
                        title={`${groupLabel(r.sampleDate, groupBy)}: ${formatBDT(r.net)}`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {shortAxisLabel(r.sampleDate, groupBy)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        </div>

        {/* =========================================================
            GENERATE CLOSING
        ========================================================= */}
        <div className="reveal" style={{ animationDelay: "280ms" }}>
        <Card>
          <div className="overflow-hidden">

            {/* Section heading */}
            <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  🧾
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Generate Daily Closing
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select a business date and generate its closing summary.
                  </p>
                </div>
              </div>

              <div className="hidden rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 sm:block">
                End-of-day report
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

              <div className="w-full sm:max-w-xs">
                <Field label="Closing date">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Field>
              </div>

              <div className="sm:pb-[1px]">
                <Button
                  onClick={handleGenerate}
                  className="transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="mr-2">✓</span>
                  Generate Closing
                </Button>
              </div>

            </div>
          </div>
        </Card>
        </div>

        {/* =========================================================
            REPORT TABLE
        ========================================================= */}
        <div className="reveal" style={{ animationDelay: "320ms" }}>
        <Card>
          <div className="overflow-hidden">

            {/* Table header */}
            <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                  📋
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Closing History
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {groupBy === "daily"
                      ? "Every generated daily closing in the selected range."
                      : `Rolled up by ${groupBy} period for the selected range.`}
                  </p>
                </div>
              </div>

              {/* Record count */}
              <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-2 lg:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />

                <span className="text-xs font-semibold text-slate-600">
                  {groupBy === "daily"
                    ? `${filteredClosings.length} ${filteredClosings.length === 1 ? "closing" : "closings"}`
                    : `${groupedRows.length} ${groupedRows.length === 1 ? "period" : "periods"}`}
                </span>
              </div>
            </div>

            {/* Data table */}
            <div className="overflow-x-auto">
              {groupBy === "daily" ? (
                <DataTable
                  rows={filteredClosings}
                  keyFor={(c) => c.id}
                  emptyMessage="No daily closings in this range yet."
                  columns={[
                    {
                      header: "Date",
                      accessor: (c) => (
                        <span className="font-semibold text-slate-800">
                          {formatDate(c.closingDate)}
                        </span>
                      ),
                    },
                    {
                      header: "Total Sales",
                      accessor: (c) => (
                        <span className="font-semibold tabular-nums text-slate-900">
                          {formatBDT(c.totalSales)}
                        </span>
                      ),
                    },
                    {
                      header: "COGS",
                      accessor: (c) => (
                        <span className="font-medium tabular-nums text-slate-600">
                          {formatBDT(c.cogs)}
                        </span>
                      ),
                    },
                    {
                      header: "Gross Profit",
                      accessor: (c) => (
                        <span className="font-semibold tabular-nums text-emerald-600">
                          {formatBDT(c.grossProfit)}
                        </span>
                      ),
                    },
                    {
                      header: "Expenses",
                      accessor: (c) => (
                        <span className="font-medium tabular-nums text-rose-600">
                          {formatBDT(c.expenses)}
                        </span>
                      ),
                    },
                    {
                      header: "Net Result",
                      accessor: (c) => {
                        const value = Number(c.netOperatingResult);
                        return (
                          <span
                            className={`font-bold tabular-nums ${
                              value >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {formatBDT(c.netOperatingResult)}
                          </span>
                        );
                      },
                    },
                  ]}
                />
              ) : (
                <DataTable
                  rows={groupedRows}
                  keyFor={(r) => r.key}
                  emptyMessage="No closings in this range yet."
                  columns={[
                    {
                      header: "Period",
                      accessor: (r) => (
                        <span className="font-semibold text-slate-800">
                          {groupLabel(r.sampleDate, groupBy)}
                        </span>
                      ),
                    },
                    {
                      header: "Days",
                      accessor: (r) => (
                        <span className="tabular-nums text-slate-500">{r.days}</span>
                      ),
                    },
                    {
                      header: "Total Sales",
                      accessor: (r) => (
                        <span className="font-semibold tabular-nums text-slate-900">
                          {formatBDT(r.sales)}
                        </span>
                      ),
                    },
                    {
                      header: "COGS",
                      accessor: (r) => (
                        <span className="font-medium tabular-nums text-slate-600">
                          {formatBDT(r.cogs)}
                        </span>
                      ),
                    },
                    {
                      header: "Gross Profit",
                      accessor: (r) => (
                        <span className="font-semibold tabular-nums text-emerald-600">
                          {formatBDT(r.grossProfit)}
                        </span>
                      ),
                    },
                    {
                      header: "Expenses",
                      accessor: (r) => (
                        <span className="font-medium tabular-nums text-rose-600">
                          {formatBDT(r.expenses)}
                        </span>
                      ),
                    },
                    {
                      header: "Net Result",
                      accessor: (r) => (
                        <span
                          className={`font-bold tabular-nums ${
                            r.net >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {formatBDT(r.net)}
                        </span>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </Card>
        </div>

      </div>

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
        .reveal, .kpi-tile {
          animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        .chart-bar {
          transform-origin: bottom;
          animation: growBar 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes growBar {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
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
          .hero-mesh, .reveal, .kpi-tile, .chart-bar, .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
