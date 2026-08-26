import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { call } from "../api/client";
import { formatBDT } from "../utils/format";
import { useLanguageStore } from "../store/languageStore";

interface DashboardSummary {
  todaysSales: string;
  todaysGrossProfit: string;
  todaysCogs: string;
  todaysExpenses: string;
  supplierPayables: string;
  inventoryLossTotal: string;
  inventoryLossCount: number;
  todaysInventoryLoss: string;
  customerReceivables: number;
  codPendingAmount: string;
  codPendingCount: number;
  lowStockCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  totalCustomers: number;
  totalMembers: number;
  totalSuppliers: number;
}

type DateFilter =
  | "today"
  | "7days"
  | "month"
  | "quarter"
  | "year"
  | "custom";

// Track last hover sound time globally to ensure single-trigger playback per card
let lastHoverTime = 0;

function playSound(type: "click" | "hover" | "select") {
  try {
    const nowTime = Date.now();
    if (type === "hover" && nowTime - lastHoverTime < 250) {
      return; // Strict debounce preventing double audio triggers on nested elements
    }
    if (type === "hover") {
      lastHoverTime = nowTime;
    }

    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "hover") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.03);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === "select") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // AudioContext blocked or not supported
  }
}

function Icon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/[0.03] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${className}`}>
      {children}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M3 17l6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="15" rx="3" />
      <path d="M3 9h18" />
      <path d="M16 14h2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ExpenseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h10" />
      <path d="M7 13h5" />
      <path d="M7 17h3" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 21V5l8-3 8 3v16" />
      <path d="M8 9h1" />
      <path d="M15 9h1" />
      <path d="M8 13h1" />
      <path d="M15 13h1" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  );
}

function ProfitRing({ percent }: { percent: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <svg viewBox="0 0 130 130" className="h-28 w-28 -rotate-90 drop-shadow-sm">
      <circle cx="65" cy="65" r={radius} fill="none" stroke="#e7efe9" strokeWidth="11" />
      <circle
        cx="65"
        cy="65"
        r={radius}
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="ring-progress"
      />
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#04724d" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#c9a24b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MiniStat({
  label,
  value,
  icon,
  tone = "green",
  onClick,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "green" | "blue" | "orange" | "red" | "purple" | "pink" | "yellow";
  onClick?: () => void;
  delay?: number;
}) {
  const tones = {
    green: "bg-emerald-100/80 text-emerald-700",
    blue: "bg-sky-100/80 text-sky-700",
    orange: "bg-amber-100/80 text-amber-700",
    red: "bg-rose-100/80 text-rose-700",
    purple: "bg-violet-100/80 text-violet-700",
    pink: "bg-pink-100/80 text-pink-700",
    yellow: "bg-amber-100/80 text-amber-700",
  };

  const valueTones = {
    green: "text-emerald-700 font-black",
    blue: "text-slate-900",
    orange: "text-slate-900",
    red: "text-rose-600 font-black",
    purple: "text-slate-900",
    pink: "text-pink-700 font-black",
    yellow: "text-amber-600 font-black",
  };

  return (
    <div
      onMouseEnter={() => playSound("hover")}
      onClick={() => {
        playSound("click");
        onClick?.();
      }}
      style={{ animationDelay: `${delay}ms` }}
      className={`
        stat-card
        group relative overflow-hidden rounded-[22px] border border-slate-200/70
        bg-white/85 p-4 shadow-[0_1px_2px_rgba(15,31,23,0.04)] backdrop-blur-xl
        transition-all duration-500 ease-out
        hover:-translate-y-1.5 hover:border-emerald-300/60 hover:shadow-[0_18px_38px_-12px_rgba(6,78,59,0.28)]
        ${onClick ? "cursor-pointer hover:bg-emerald-50/40" : ""}
      `}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] scale-x-0 bg-gradient-to-r from-emerald-500 via-emerald-300 to-amber-400 transition-transform duration-500 origin-left group-hover:scale-x-100" />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 transition-colors group-hover:text-emerald-700 truncate">
            {label}
          </p>
          <p className={`mt-2 text-xl font-black tracking-tight tabular-nums truncate ${valueTones[tone]}`}>
            {value}
          </p>
        </div>
        <Icon className={tones[tone]}>{icon}</Icon>
      </div>
    </div>
  );
}

function AlertCard({
  title,
  value,
  subtitle,
  tone,
  onClick,
  delay = 0,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: "yellow" | "orange" | "red";
  onClick?: () => void;
  delay?: number;
}) {
  const styles = {
    yellow: {
      card: "border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-yellow-50/40 hover:from-amber-100 hover:to-yellow-100/70",
      icon: "bg-amber-200/80 text-amber-800",
      value: "text-amber-950",
      arrow: "text-amber-600",
      dot: "bg-amber-400",
    },
    orange: {
      card: "border-orange-200/80 bg-gradient-to-r from-orange-50/90 to-amber-50/40 hover:from-orange-100 hover:to-amber-100/70",
      icon: "bg-orange-200/80 text-orange-800",
      value: "text-orange-950",
      arrow: "text-orange-600",
      dot: "bg-orange-400",
    },
    red: {
      card: "border-rose-200/80 bg-gradient-to-r from-rose-50/90 to-red-50/40 hover:from-rose-100 hover:to-red-100/70",
      icon: "bg-rose-200/80 text-rose-800",
      value: "text-rose-950",
      arrow: "text-rose-600",
      dot: "bg-rose-400",
    },
  };

  const style = styles[tone];
  const isUrgent = Number(value) > 0;

  return (
    <button
      type="button"
      onMouseEnter={() => playSound("hover")}
      onClick={() => {
        playSound("click");
        onClick?.();
      }}
      style={{ animationDelay: `${delay}ms` }}
      className={`alert-card group relative flex w-full items-center justify-between overflow-hidden rounded-[22px] border p-4 text-left shadow-sm backdrop-blur-md transition-all duration-400 ease-out hover:-translate-y-1 hover:shadow-lg ${style.card}`}
    >
      {isUrgent && <span className={`absolute right-4 top-4 h-2 w-2 rounded-full ${style.dot} animate-ping`} />}
      {isUrgent && <span className={`absolute right-4 top-4 h-2 w-2 rounded-full ${style.dot}`} />}

      <div className="flex min-w-0 items-center gap-3.5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${style.icon}`}>
          {tone === "yellow" && <BoxIcon />}
          {tone === "orange" && <ClockIcon />}
          {tone === "red" && <AlertIcon />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-700">{title}</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className={`text-2xl font-black tabular-nums ${style.value}`}>{value}</span>
            <span className="truncate text-[11px] font-medium text-slate-500">{subtitle}</span>
          </div>
        </div>
      </div>
      <span className={`ml-3 rounded-full bg-white/70 p-2 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white ${style.arrow}`}>
        <ArrowIcon />
      </span>
    </button>
  );
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(filter: DateFilter) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (filter === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "7days") {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(quarterStartMonth + 3, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
  }

  return {
    from: formatDateForApi(start),
    to: formatDateForApi(end),
  };
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [bkashBalance, setBkashBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const navigate = useNavigate();
  const { t, n } = useLanguageStore();

  const dateRange = useMemo(() => {
    if (dateFilter === "custom") {
      return { from: customFrom, to: customTo };
    }
    return getDateRange(dateFilter);
  }, [dateFilter, customFrom, customTo]);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const [data, balance, bkashData] = await Promise.all([
        call<DashboardSummary>("dashboard:summary", dateRange),
        call<number>("cash:balance").catch(() => 0),
        call<number>("bkash:balance").catch(() => 0),
      ]);

      setSummary(data);
      setCashBalance(Number(balance) || 0);
      setBkashBalance(Number(bkashData) || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (dateFilter === "custom" && (!customFrom || !customTo)) {
      return;
    }
    loadDashboard();
  }, [dateFilter, customFrom, customTo]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-[#f2f7f2] via-[#eaf2ea] to-[#e4eee4] px-4 py-6 lg:px-6 xl:px-8 flex flex-col justify-between">
        <div className="mx-auto flex max-w-[1600px] w-full flex-col gap-5">
          <div className="skeleton-shimmer h-40 w-full rounded-[28px]" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="skeleton-shimmer h-52 rounded-[26px]" />
            <div className="skeleton-shimmer h-52 rounded-[26px]" />
          </div>
        </div>
        <footer className="py-6 text-center text-xs font-semibold text-slate-500">
          © 2026 Torki Bazar. All rights reserved. Designed & Developed by Nuhu Sikder.
        </footer>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="m-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-lg">
        <p className="font-bold">Unable to load dashboard</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const filterLabel =
    dateFilter === "today" ? t("today") || "Today"
    : dateFilter === "7days" ? t("last7Days") || "Last 7 Days"
    : dateFilter === "month" ? t("thisMonth") || "This Month"
    : dateFilter === "quarter" ? t("thisQuarter") || "This Quarter"
    : dateFilter === "year" ? t("thisYear") || "This Year"
    : t("customRange") || "Custom Range";

  const grossProfit = Number(summary.todaysGrossProfit) || 0;
  const sales = Number(summary.todaysSales) || 0;
  const profitPercent = sales > 0 ? Math.min(100, Math.max(0, (grossProfit / sales) * 100)) : 0;

  return (
    <div className="dashboard-root min-h-[calc(100vh-70px)] bg-gradient-to-br from-[#f2f7f2] via-[#eaf2ea] to-[#e4eee4] px-4 py-5 lg:px-6 lg:py-6 xl:px-8 flex flex-col justify-between">
      <div className="mx-auto flex max-w-[1600px] w-full flex-col gap-5">

        {/* HERO BANNER */}
        <section className="hero-panel relative overflow-hidden rounded-[28px] px-7 py-7 text-white shadow-[0_25px_60px_-15px_rgba(3,51,36,0.45)]">
          <div className="hero-mesh" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">
                  {t("liveOperationsCenter") || "Live Operations Center"}
                </span>
                <span className="text-amber-300"><SparkIcon /></span>
              </div>
              <h1 className="hero-title text-3xl font-black tracking-tight sm:text-[2.6rem]">
                {t("welcomeBack") || "Welcome back, Torki Bazar"}
              </h1>
              <p className="mt-1.5 max-w-md text-xs font-medium text-emerald-100/80 sm:text-sm">
                {t("heroSubtitle") || "Real-time performance metrics, inventory health, and revenue analytics."}
              </p>
            </div>

            {/* DATE FILTER PICKER */}
            <div className="w-full rounded-[22px] border border-white/15 bg-white/[0.08] p-4 shadow-lg backdrop-blur-xl lg:w-auto lg:min-w-[280px]">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-emerald-100">
                  <CalendarIcon />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em]">
                    {t("filterPeriod") || "Filter Period"}
                  </span>
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    playSound("select");
                    setDateFilter(e.target.value as DateFilter);
                  }}
                  className="min-w-[160px] cursor-pointer rounded-xl border border-white/20 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-md outline-none"
                >
                  <option value="today">{t("today") || "Today"}</option>
                  <option value="7days">{t("last7Days") || "Last 7 Days"}</option>
                  <option value="month">{t("thisMonth") || "This Month"}</option>
                  <option value="quarter">{t("thisQuarter") || "This Quarter"}</option>
                  <option value="year">{t("thisYear") || "This Year"}</option>
                  <option value="custom">{t("customRange") || "Custom Range"}</option>
                </select>
              </div>

              {dateFilter === "custom" && (
                <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => {
                      playSound("click");
                      setCustomFrom(e.target.value);
                    }}
                    className="w-full rounded-xl border border-white/20 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => {
                      playSound("click");
                      setCustomTo(e.target.value);
                    }}
                    className="w-full rounded-xl border border-white/20 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PRIMARY PERFORMANCE METRICS */}
        <section>
          <div className="mb-3 px-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">
              {t("coreRevenue") || "Core Revenue"}
            </p>
            <h2 className="text-lg font-black text-slate-900">
              {t("salesAndProfitOverview") || "Sales & Profit Overview"} ({filterLabel})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            {/* SALES CARD */}
            <div className="sales-card group relative overflow-hidden rounded-[26px] p-6 text-white shadow-xl">
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">
                      {t("totalRevenueSales") || "TOTAL REVENUE / SALES"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/15 p-2.5 backdrop-blur-md">
                    <TrendIcon />
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-4xl font-black tracking-tight tabular-nums sm:text-5xl">
                    {n(formatBDT(summary.todaysSales))}
                  </p>
                </div>
              </div>
            </div>

            {/* GROSS PROFIT CARD */}
            <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-6 backdrop-blur-xl shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {t("grossProfitMargin") || "GROSS PROFIT MARGIN"}
                </p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 shadow-sm">
                  {n(profitPercent.toFixed(1))}%
                </span>
              </div>
              <div className="mt-2 flex items-center gap-5">
                <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                  <ProfitRing percent={profitPercent} />
                  <div className="absolute flex flex-col items-center">
                    <WalletIcon />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight text-slate-900 tabular-nums">
                    {n(formatBDT(summary.todaysGrossProfit))}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {t("cogs") || "COGS"}: {n(formatBDT(summary.todaysCogs))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINANCIAL & OPERATIONS GRID */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-5">
            <section>
              <div className="mb-3 px-1">
                <h2 className="text-lg font-black text-slate-900">
                  {t("financialBreakdowns") || "Financial Breakdowns"}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
                <MiniStat
                  label={t("availableCash") || "Available Cash"}
                  value={n(formatBDT(cashBalance))}
                  tone="green"
                  icon={<WalletIcon />}
                  onClick={() => navigate("/cash-management")}
                />
                <MiniStat
                  label="bKash"
                  value={n(formatBDT(bkashBalance))}
                  tone="pink"
                  icon={<PhoneIcon />}
                  onClick={() => navigate("/bkash-management")}
                />
                <MiniStat label={t("cogs") || "COGS"} value={n(formatBDT(summary.todaysCogs))} tone="blue" icon={<WalletIcon />} />
                <MiniStat
                  label={t("expenses") || "Expenses"}
                  value={n(formatBDT(summary.todaysExpenses))}
                  tone="red"
                  icon={<ExpenseIcon />}
                  onClick={() => navigate("/expenses")}
                />
                <MiniStat
                  label={t("supplierPayables") || "Supplier Payables (Due)"}
                  value={n(formatBDT(summary.supplierPayables))}
                  tone="red"
                  icon={<BuildingIcon />}
                  onClick={() => navigate("/purchases")}
                />
                <MiniStat
                  label={t("customerReceivables") || "Customer Receivables (Credit)"}
                  value={n(formatBDT(summary.customerReceivables))}
                  tone="red"
                  icon={<UsersIcon />}
                  onClick={() => navigate("/sales")}
                />
                <MiniStat
                  label={t("codPending") || "COD Pending"}
                  value={n(formatBDT(summary.codPendingAmount))}
                  tone="yellow"
                  icon={<WalletIcon />}
                  onClick={() => navigate("/sales")}
                />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN - ALERTS */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-black text-slate-900">
                {t("attentionRequired") || "Attention Required"}
              </h2>
            </div>
            <div className="space-y-3.5">
              <AlertCard title={t("lowStockWarning") || "Low Stock Warning"} value={n(summary.lowStockCount)} subtitle="products below safety threshold" tone="yellow" onClick={() => navigate("/inventory?view=lowstock")} />
              <AlertCard title={t("expiringSoon") || "Expiring Soon"} value={n(summary.expiringSoonCount)} subtitle="batches nearing expiry date" tone="orange" onClick={() => navigate("/inventory?view=expiring")} />
              <AlertCard title={t("expiredBatches") || "Expired Batches"} value={n(summary.expiredCount)} subtitle="batches already expired" tone="red" onClick={() => navigate("/inventory?view=expired")} />
            </div>
          </section>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="mt-8 py-4 text-center text-xs font-semibold text-slate-500 tracking-wide border-t border-slate-200/60">
        © 2026 Torki Bazar. All rights reserved. Designed & Developed by Nuhu.
      </footer>

      <style>{`
        .hero-panel { background: linear-gradient(120deg, #032a1d 0%, #054e38 45%, #07704f 100%); }
        .sales-card { background: linear-gradient(135deg, #04523b 0%, #066e4d 55%, #0a8f61 100%); }
      `}</style>
    </div>
  );
}
