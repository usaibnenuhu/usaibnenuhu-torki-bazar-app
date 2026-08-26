import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { call } from "../api/client";
import { useToastStore } from "../store/toastStore";
import { useLanguageStore } from "../store/languageStore";

const NAV_ITEMS = [
  { to: "/", labelKey: "dashboard", icon: "📊", end: true },
  { to: "/pos", labelKey: "pos", icon: "🧾" },
  { to: "/sales", labelKey: "sales", icon: "💵" },
  { to: "/products", labelKey: "products", icon: "📦" },
  { to: "/categories", labelKey: "categories", icon: "🗂️" },
  { to: "/inventory", labelKey: "inventory", icon: "📈" },
  { to: "/suppliers", labelKey: "suppliers", icon: "🚚" },
  { to: "/supplier-returns", labelKey: "supplierReturns", icon: "📤" },
  { to: "/purchases", labelKey: "purchases", icon: "🛒" },
  { to: "/customers", labelKey: "customers", icon: "👥" },
  { to: "/membership", labelKey: "membership", icon: "💳" },
  { to: "/returns", labelKey: "returns", icon: "↩️" },
  { to: "/employees", labelKey: "employees", icon: "🧑‍💼" },
  { to: "/expenses", labelKey: "expensesLabel", icon: "🧮" },
  { to: "/cash-management", labelKey: "cashManagement", icon: "💰" },
  { to: "/bkash-management", labelKey: "bkashManagement", icon: "📱" },
  { to: "/reports", labelKey: "reports", icon: "📑" },
  { to: "/notifications", labelKey: "notifications", icon: "🔔" },
  { to: "/settings", labelKey: "settings", icon: "⚙️" },
];

type SyncStatus = {
  pending: number;
  failed: number;
  lastSyncedAt: string | null;
  isSyncing: boolean;
};

export function Layout() {
  const { session, setSession } = useAuthStore();
  const { lang, toggleLang, t } = useLanguageStore();
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    failed: 0,
    lastSyncedAt: null,
    isSyncing: false,
  });

  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    async function loadUnreadNotifications() {
      try {
        await call("notifications:refresh");

        const notifications = await call<{ id: string }[]>(
          "notifications:list",
          { onlyUnread: true }
        );

        setUnread(notifications.length);
      } catch {
        setUnread(0);
      }
    }

    loadUnreadNotifications();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSyncStatus() {
      try {
        const status = await call<SyncStatus>("sync:status");

        if (!cancelled) {
          setSyncStatus(status);
        }
      } catch {
        // Keep application running if sync status cannot be loaded.
      }
    }

    loadSyncStatus();

    const interval = window.setInterval(
      loadSyncStatus,
      10000
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function openMobileMenu() {
    setMobileMenuOpen(true);
  }

  async function handleSyncNow() {
    if (syncLoading) return;

    setSyncLoading(true);

    try {
      const result = await call<{
        pulled?: number;
        synced: number;
        failed: number;
        pending: number;
        error?: string | null;
      }>("sync:run");

      const status = await call<SyncStatus>("sync:status");

      setSyncStatus(status);

      if (result.error) {
        console.error("NEON -> ELECTRON:", result.error);

        push(
          `Neon → Electron failed: ${result.error}`,
          "error"
        );
      } else if (result.failed > 0) {
        push(
          `Sync completed with ${result.failed} failed change(s).`,
          "error"
        );
      } else if (result.synced > 0) {
        push(
          `Successfully synced ${result.synced} change(s) to Neon.`,
          "success"
        );
      } else if (result.pending === 0) {
        push(
          "Everything is already synced.",
          "success"
        );
      } else {
        push(
          `${result.pending} change(s) are still waiting to sync.`,
          "info"
        );
      }
    } catch (error) {
      console.error("Sync failed:", error);

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error("SYNC ERROR:", message);

      push(
        `Sync failed: ${message}`,
        "error"
      );
    } finally {
      setSyncLoading(false);
    }
  }

  async function handleLogout() {
    await call("auth:logout").catch(() => {});

    setSession(null);
    closeMobileMenu();
    navigate("/login");

    push(
      "You have been logged out.",
      "info"
    );
  }

  const hasFailed = syncStatus.failed > 0;
  const hasPending = syncStatus.pending > 0;

  const syncLabel = hasFailed
    ? "Sync Error"
    : hasPending
      ? "Pending"
      : "Synced";

  const syncIcon = hasFailed
    ? "🔴"
    : hasPending
      ? "🟠"
      : "🟢";

  return (
    <div className="relative flex h-[100dvh] w-full min-w-0 overflow-hidden bg-brand-50">

      {/* ============================================================
          MOBILE BACKDROP
          ============================================================ */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* ============================================================
          SIDEBAR
          Desktop: permanent
          Mobile: slide-in drawer
          ============================================================ */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-[100]",
          "flex w-[280px] flex-shrink-0 flex-col",
          "bg-brand-900 text-brand-50",
          "shadow-2xl",
          "transition-transform duration-300 ease-out",
          "md:relative md:z-20 md:w-64 md:translate-x-0 md:shadow-none",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >

        {/* SIDEBAR HEADER */}
        <div className="flex min-h-[76px] items-center justify-between border-b border-brand-800 px-5">

          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-wide">
              TORKI BAZAR
            </p>

            <p className="truncate text-[11px] text-brand-300">
              {t("retailManagementSystem")}
            </p>
          </div>

          <div className="flex items-center gap-2">

            {/* Mobile close */}
            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-xl text-brand-100 transition hover:bg-brand-700 active:scale-95 md:hidden"
              aria-label="Close menu"
            >
              ×
            </button>

            {/* Language */}
            <button
              type="button"
              onClick={toggleLang}
              className="rounded-lg bg-brand-800 px-2.5 py-1.5 text-[11px] font-bold text-brand-100 shadow-sm transition hover:bg-brand-700"
              title="Switch Language"
            >
              {lang === "en" ? "বাংলা" : "English"}
            </button>

          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">

          <div className="space-y-1">

            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "flex min-h-[42px] items-center justify-between",
                    "gap-2 rounded-xl px-3 py-2.5",
                    "text-sm font-medium",
                    "transition-all duration-150",
                    "active:scale-[0.98]",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-brand-100 hover:bg-brand-800",
                  ].join(" ")
                }
              >
                <span className="flex min-w-0 items-center gap-3">

                  <span className="flex w-6 flex-shrink-0 items-center justify-center text-base">
                    {item.icon}
                  </span>

                  <span className="truncate">
                    {item.to === "/bkash-management"
                      ? "bKash Management"
                      : t(item.labelKey) || item.labelKey}
                  </span>

                </span>

                {item.to === "/notifications" &&
                  unread > 0 && (
                    <span className="flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
              </NavLink>
            ))}

          </div>
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="border-t border-brand-800 px-4 py-4">

          {/* SYNC */}
          <div className="mb-4 rounded-xl bg-brand-800/70 p-3">

            <div className="flex items-center justify-between gap-2">

              <div className="min-w-0">

                <p className="text-[10px] font-bold tracking-wide text-brand-300">
                  DATABASE SYNC
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {syncIcon} {syncLabel}
                </p>

                {hasPending && (
                  <p className="mt-0.5 text-xs text-brand-300">
                    {syncStatus.pending} pending
                  </p>
                )}

                {hasFailed && (
                  <p className="mt-0.5 text-xs text-red-300">
                    {syncStatus.failed} failed
                  </p>
                )}

              </div>

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={syncLoading}
                className="flex-shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                title="Synchronize"
              >
                {syncLoading ? "..." : "🔄 Sync"}
              </button>

            </div>

            {syncStatus.lastSyncedAt && (
              <p className="mt-2 truncate text-[9px] text-brand-400">
                Last sync:{" "}
                {new Date(
                  syncStatus.lastSyncedAt
                ).toLocaleString()}
              </p>
            )}

          </div>

          <p className="truncate text-xs font-semibold text-brand-100">
            {session?.fullName}
          </p>

          <p className="truncate text-[11px] text-brand-300">
            {session?.roleName}
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 text-xs text-brand-300 underline transition hover:text-white"
          >
            Log out
          </button>

        </div>
      </aside>

      {/* ============================================================
          MAIN APPLICATION AREA
          ============================================================ */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ==========================================================
            MOBILE TOP APP BAR
            ALWAYS FIXED / ALWAYS VISIBLE
            ========================================================== */}
        <header
          className="fixed left-0 right-0 top-0 z-[80] flex h-16 flex-shrink-0 items-center border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur-md md:hidden"
        >

          {/* HAMBURGER - ALWAYS LEFT */}
          <button
            type="button"
            onClick={openMobileMenu}
            className="mr-3 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-2xl leading-none text-white shadow-md transition-all hover:bg-brand-500 active:scale-95"
            aria-label="Open navigation menu"
            title="Menu"
          >
            <span className="block -mt-0.5">☰</span>
          </button>

          {/* APP BRAND */}
          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-black tracking-wide text-brand-900">
              TORKI BAZAR
            </p>

            <p className="truncate text-[10px] font-medium text-slate-500">
              {session?.fullName || "Retail Management System"}
            </p>

          </div>

          {/* LANGUAGE */}
          <button
            type="button"
            onClick={toggleLang}
            className="ml-2 flex-shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm active:scale-95"
          >
            {lang === "en" ? "বাংলা" : "EN"}
          </button>

        </header>

        {/* ==========================================================
            CONTENT
            Mobile:
              - starts below fixed header
              - horizontal scrolling allowed
              - vertical scrolling allowed
              - NO page zoom
            Desktop:
              - normal application scrolling
            ========================================================== */}
        <main
          className={[
            "min-h-0 min-w-0 flex-1",
            "overflow-auto",
            "bg-brand-50",
            "overscroll-contain",
            "touch-pan-x touch-pan-y",
            "pt-16 md:pt-0",
          ].join(" ")}
        >

          <div
            className={[
              "min-h-full min-w-0",
              "p-3 sm:p-4 md:p-6",
              "md:min-w-0",
            ].join(" ")}
          >
            <Outlet />
          </div>

        </main>

      </div>
    </div>
  );
}
