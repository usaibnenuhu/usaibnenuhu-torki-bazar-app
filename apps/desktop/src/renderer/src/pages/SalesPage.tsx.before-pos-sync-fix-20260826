import { useEffect, useState, type FormEvent } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { formatBDT, formatDateTime } from "../utils/format";
import { useToastStore } from "../store/toastStore";

import logo from "../assets/torki-logo.png";

interface Sale {
  id: string;
  saleNumber: string;
  saleDate: string;
  subtotal?: string;
  discount?: string;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  onlineOrderNumber?: string | null;

  customer?: {
    name: string;
    phone?: string | null;
  } | null;

  items?: {
    id: string;
    quantity: string;
    unitPrice: string;
    discount: string;
    subtotal: string;

    product: {
      name: string;
      sku?: string | null;
    };
  }[];
}

const DASH = "—";

/* ----------------------------------------------------------------------- */
/*  LINE-STYLE ICONS (presentational only)                                  */
/* ----------------------------------------------------------------------- */

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6 15h4" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2v-19Z" />
      <path d="M8.5 8h7" />
      <path d="M8.5 12h7" />
      <path d="M8.5 16h4" />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="2" />
      <path d="M6 17v4h12v-4" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2 3 2 3 .6 3 2-1.3 2.5-3 2.5-3-1.1-3-2.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/*  BADGES (presentational only — same underlying values, styled)           */
/* ----------------------------------------------------------------------- */

function PaymentBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    COD: "bg-amber-100 text-amber-800 ring-amber-200",
    CASH: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    CREDIT: "bg-violet-100 text-violet-800 ring-violet-200",
  };
  const cls = styles[method] ?? "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`}>
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const isGood = normalized === "PAID" || normalized === "COMPLETED";
  const isPending = normalized.includes("PENDING") || normalized === "DUE";

  const cls = isGood
    ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
    : isPending
    ? "bg-rose-100 text-rose-800 ring-rose-200"
    : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isGood ? "bg-emerald-500" : isPending ? "bg-rose-500 animate-pulse" : "bg-slate-400"}`} />
      {status}
    </span>
  );
}

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [lookupId, setLookupId] = useState("");
  const [found, setFound] = useState<Sale | null>(null);

  const push = useToastStore((s) => s.push);

  async function load() {
    try {
      const data = await call<Sale[]>("sales:list");
      setSales(data);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load sales",
        "error"
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function showDetails(idOrNumber: string) {
    const value = idOrNumber.trim();

    if (!value) {
      push(
        "Please enter a sale number, mobile number, or order number.",
        "error"
      );
      return;
    }

    try {
      const sale = await call<Sale>("sales:get", {
        id: value,
      });

      setLookupId(sale.saleNumber);
      setFound(sale);
    } catch (err) {
      setFound(null);

      push(
        err instanceof Error ? err.message : "Sale not found",
        "error"
      );
    }
  }

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    await showDetails(lookupId);
  }

  /*
   * ============================================================
   * EXISTING COD COLLECTION
   * DO NOT CHANGE
   * ============================================================
   */
  async function handleCollect(saleId: string) {
    try {
      await call("sales:markCodCollected", {
        id: saleId,
      });

      push(
        "Cash collected — payment marked as PAID.",
        "success"
      );

      await load();

      const updatedSale = await call<Sale>("sales:get", {
        id: saleId,
      });

      setFound(updatedSale);
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to mark COD collected",
        "error"
      );
    }
  }

  /*
   * ============================================================
   * NEW CREDIT PAYMENT COLLECTION
   * ============================================================
   */
  async function handleCollectCreditPayment(saleId: string) {
    try {
      await call("sales:collectCreditPayment", {
        id: saleId,
      });

      push(
        "Credit payment collected — payment marked as PAID.",
        "success"
      );

      await load();

      const updatedSale = await call<Sale>("sales:get", {
        id: saleId,
      });

      setFound(updatedSale);
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to collect credit payment",
        "error"
      );
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="sales-root space-y-6">

      {/* =========================================================
          PAGE TITLE
      ========================================================== */}
      <div className="print:hidden reveal">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
          Retail Ledger
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
          Sales
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
          Search by sale number, customer mobile number, or
          WooCommerce order reference to view, print, or collect
          outstanding payments.
        </p>
      </div>

      {/* =========================================================
          SEARCH
      ========================================================== */}
      <div className="print:hidden reveal" style={{ animationDelay: "60ms" }}>
        <Card className="search-card relative overflow-hidden !border-emerald-100/70 !bg-white/90 !p-5 shadow-[0_10px_30px_-12px_rgba(6,78,59,0.18)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-emerald-100/50 blur-3xl" />

          <form
            onSubmit={handleLookup}
            className="relative flex flex-col gap-2.5 sm:flex-row"
          >
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3.5 text-sm shadow-sm outline-none transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Sale number, mobile number, or WooCommerce order (e.g. #12345)"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
              />
            </div>

            <Button type="submit" className="!rounded-2xl !px-6 !shadow-md transition-transform duration-300 hover:!-translate-y-0.5 active:!translate-y-0">
              <span className="flex items-center gap-2">
                <SearchIcon />
                Find
              </span>
            </Button>
          </form>
        </Card>
      </div>

      {/* =========================================================
          SCREEN PREVIEW
      ========================================================== */}
      {found && (
        <div className="print:hidden animate-[fadeIn_.45s_cubic-bezier(0.16,1,0.3,1)]">
          <Card className="preview-card mx-auto w-full max-w-3xl overflow-hidden !p-0 shadow-[0_25px_60px_-20px_rgba(4,82,59,0.35)]">

            {/* =====================================================
                PREVIEW HEADER
            ====================================================== */}
            <div className="preview-header relative overflow-hidden px-6 py-6 text-white sm:px-8">
              <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/95 p-2 shadow-lg">
                    <img
                      src={logo}
                      alt="Torki Bazar Logo"
                      className="h-12 w-12 object-contain"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-black tracking-tight">
                      Torki Bazar
                    </h2>
                    <p className="text-sm font-medium text-emerald-200">
                      Fast Delivery · Online Grocery Shop
                    </p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
                    Sale
                  </p>
                  <p className="mt-1 font-mono text-lg font-black">
                    {found.saleNumber}
                  </p>
                  <p className="mt-1 text-xs text-emerald-100/80">
                    {formatDateTime(found.saleDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                MINI SALE INFORMATION
            ====================================================== */}
            <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8">

              {/* CUSTOMER */}
              <div className="info-tile group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition-transform duration-300 group-hover:scale-110">
                    <UserIcon />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Customer
                  </p>
                </div>
                <p className="mt-3 font-bold text-slate-900">
                  {found.customer?.name ?? "Walk-in Customer"}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {found.customer?.phone || DASH}
                </p>
              </div>

              {/* PAYMENT */}
              <div className="info-tile group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-transform duration-300 group-hover:scale-110">
                    <CardIcon />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Payment
                  </p>
                </div>
                <div className="mt-3">
                  <PaymentBadge method={found.paymentMethod} />
                </div>
                <div className="mt-2">
                  <StatusBadge status={found.paymentStatus} />
                </div>
              </div>

              {/* TOTAL */}
              <div className="total-tile relative overflow-hidden rounded-2xl border border-emerald-200/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-300/20 blur-2xl" />
                <p className="relative text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                  Total
                </p>
                <p className="relative mt-2 text-2xl font-black tabular-nums text-emerald-800">
                  {formatBDT(found.totalAmount)}
                </p>
                <p className="relative mt-0.5 text-sm text-emerald-700/70">
                  {found.items?.length ?? 0} item
                  {(found.items?.length ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* =====================================================
                ORDER INFORMATION
            ====================================================== */}
            <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    WooCommerce Order
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-800">
                    {found.onlineOrderNumber || DASH}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-semibold text-slate-400">
                    Sale Status
                  </p>
                  <div className="mt-1.5 sm:flex sm:justify-end">
                    <StatusBadge status={found.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                ACTION BUTTONS
            ====================================================== */}
            <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">

              {/* =================================================
                  EXISTING COD COLLECTION
              ================================================== */}
              {found.paymentMethod === "COD" &&
                found.paymentStatus === "COD_PENDING" && (
                  <Button
                    onClick={() => handleCollect(found.id)}
                    className="!rounded-xl transition-transform duration-300 hover:!-translate-y-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <CashIcon />
                      Mark Cash Collected
                    </span>
                  </Button>
                )}

              {/* =================================================
                  NEW CREDIT COLLECTION
              ================================================== */}
              {found.paymentMethod === "CREDIT" &&
                found.paymentStatus === "DUE" && (
                  <Button
                    onClick={() =>
                      handleCollectCreditPayment(found.id)
                    }
                    className="!rounded-xl transition-transform duration-300 hover:!-translate-y-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <CashIcon />
                      Collect Credit Payment
                    </span>
                  </Button>
                )}

              {/* =================================================
                  PRINT RECEIPT
              ================================================== */}
              <Button
                variant="secondary"
                onClick={handlePrint}
                className="!rounded-xl transition-transform duration-300 hover:!-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  <PrinterIcon />
                  Print Receipt
                </span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================
          FULL PRINT RECEIPT
      ========================================================== */}
      {found && (
        <div
          id="sale-print-area"
          className="hidden print:block"
        >
          <div className="mx-auto w-full max-w-[190mm] bg-white text-slate-900">

            {/* =====================================================
                RECEIPT HEADER
            ====================================================== */}
            <div className="border-b-2 border-slate-800 pb-5">
              <div className="flex items-start justify-between">

                {/* LOGO + BUSINESS */}
                <div className="flex items-center gap-4">
                  <img
                    src={logo}
                    alt="Torki Bazar Logo"
                    className="h-20 w-20 object-contain"
                  />

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Torki Bazar
                    </h1>
                    <p className="mt-0.5 text-sm font-medium">
                      Fast Delivery · Online Grocery Shop
                    </p>
                    <div className="mt-2 text-[11px] leading-5 text-slate-600">
                      <p>Torki Bandar, Gournadi, Barishal</p>
                      <p>E-mail: contact@torkibazar.com</p>
                      <p>Website: torkibazar.com</p>
                    </div>
                  </div>
                </div>

                {/* RECEIPT INFO */}
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Sales Receipt
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {found.saleNumber}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {formatDateTime(found.saleDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                CUSTOMER / PAYMENT
            ====================================================== */}
            <div className="grid grid-cols-2 gap-8 border-b border-slate-300 py-5">

              {/* CUSTOMER */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Customer
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {found.customer?.name ?? "Walk-in Customer"}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Mobile: {found.customer?.phone || DASH}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  WooCommerce Order:{" "}
                  {found.onlineOrderNumber || DASH}
                </p>
              </div>

              {/* PAYMENT */}
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Payment
                </p>
                <p className="mt-2 text-sm font-semibold uppercase">
                  {found.paymentMethod}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Status: {found.paymentStatus}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Sale: {found.status}
                </p>
              </div>
            </div>

            {/* =====================================================
                ITEMS
            ====================================================== */}
            <div className="py-5">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y border-slate-300 bg-slate-50">
                    <th className="px-3 py-3 text-left font-bold uppercase">Item</th>
                    <th className="px-2 py-3 text-left font-bold uppercase">SKU</th>
                    <th className="px-2 py-3 text-center font-bold uppercase">Qty</th>
                    <th className="px-2 py-3 text-right font-bold uppercase">Unit Price</th>
                    <th className="px-2 py-3 text-right font-bold uppercase">Discount</th>
                    <th className="px-3 py-3 text-right font-bold uppercase">Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {found.items && found.items.length > 0 ? (
                    found.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200">
                        <td className="px-3 py-3 font-medium">{item.product.name}</td>
                        <td className="px-2 py-3 text-slate-600">{item.product.sku || DASH}</td>
                        <td className="px-2 py-3 text-center">{Number(item.quantity)}</td>
                        <td className="px-2 py-3 text-right">{formatBDT(item.unitPrice)}</td>
                        <td className="px-2 py-3 text-right">{formatBDT(item.discount)}</td>
                        <td className="px-3 py-3 text-right font-semibold">{formatBDT(item.subtotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                        No item details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ===================================================
                  TOTALS
              ==================================================== */}
              <div className="mt-6 flex justify-end">
                <div className="w-80">
                  <div className="space-y-2 border-b border-slate-300 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span>{found.subtotal ? formatBDT(found.subtotal) : DASH}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Discount</span>
                      <span>{found.discount ? formatBDT(found.discount) : DASH}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold">{formatBDT(found.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                PROFESSIONAL THANK YOU FOOTER
            ====================================================== */}
            <div className="mt-8 border-t-2 border-slate-800 pt-6 text-center">
              <p className="text-base font-bold">
                Thank you for shopping with Torki Bazar!
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                We appreciate your business and look forward
                to serving you again.
              </p>
              <p className="mt-3 text-[11px] leading-5 text-slate-500">
                Torki Bandar, Gournadi, Barishal
                <br />
                contact@torkibazar.com · torkibazar.com
              </p>
              <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400">
                Computer Generated Sales Receipt
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SALES LIST
      ========================================================== */}
      <div className="print:hidden reveal" style={{ animationDelay: "120ms" }}>
        <Card className="!overflow-hidden !p-0">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ReceiptIcon />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                  Ledger
                </p>
                <h2 className="text-sm font-black text-slate-900">Recent Sales</h2>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              {sales.length} record{sales.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="sales-table px-1 py-1">
            <DataTable
              rows={sales}
              keyFor={(s) => s.id}
              emptyMessage="Complete a sale from the POS page to see it listed here."

              columns={[
                {
                  header: "Sale #",
                  accessor: (s) => (
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {s.saleNumber}
                    </span>
                  ),
                },

                {
                  header: "Date",
                  accessor: (s) => (
                    <span className="text-slate-500">{formatDateTime(s.saleDate)}</span>
                  ),
                },

                {
                  header: "Customer",
                  accessor: (s) => (
                    <span className="font-semibold text-slate-800">
                      {s.customer?.name ?? "Walk-in"}
                    </span>
                  ),
                },

                {
                  header: "Mobile",
                  accessor: (s) => s.customer?.phone || DASH,
                },

                {
                  header: "Total",
                  accessor: (s) => (
                    <span className="font-bold tabular-nums text-slate-900">
                      {formatBDT(s.totalAmount)}
                    </span>
                  ),
                },

                {
                  header: "Payment",
                  accessor: (s) => <PaymentBadge method={s.paymentMethod} />,
                },

                {
                  header: "Status",
                  accessor: (s) => <StatusBadge status={s.paymentStatus} />,
                },

                {
                  header: "",
                  accessor: (s) => (
                    <button
                      type="button"
                      className="group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold text-emerald-700 transition-all duration-300 hover:gap-1.5 hover:bg-emerald-50"
                      onClick={() => showDetails(s.id)}
                    >
                      View
                      <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                        <ArrowIcon />
                      </span>
                    </button>
                  ),
                },
              ]}
            />
          </div>
        </Card>
      </div>

      {/* =========================================================
          PREMIUM SCREEN ANIMATIONS (screen only — never printed)
      ========================================================== */}
      <style>{`
        .preview-header {
          background: linear-gradient(120deg, #032a1d 0%, #054e38 45%, #07704f 100%);
        }
        .total-tile {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }
        .reveal {
          animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .animate-pulse { animation: none !important; }
        }
      `}</style>

      {/* =========================================================
          PRINT CSS
      ========================================================== */}
      <style>{`
        @media print {

          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden;
          }

          #sale-print-area,
          #sale-print-area * {
            visibility: visible;
          }

          #sale-print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          #sale-print-area table {
            page-break-inside: auto;
          }

          #sale-print-area tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          #sale-print-area .print-no-break {
            page-break-inside: avoid;
          }

        }
      `}</style>

    </div>
  );
}
