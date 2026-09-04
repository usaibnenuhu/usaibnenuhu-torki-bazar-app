import { useEffect, useRef, useState } from "react";
import torkiLogo from "../assets/torki-logo.png";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Field, Input, Select } from "../components/Form";
import { formatBDT } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  sellingPrice: string | number;
  currentStock: string | number;
  unit: { abbreviation: string };
}

interface CartLine {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  membership?: { membershipNumber: string } | null;
}

// WooCommerce references are always shown with a single leading #.
function withOrderHash(raw: string) {
  const value = raw.replace(/^#+/, "").trimStart();
  return value ? `#${value}` : "";
}

/* ============================================================
   POS SOUND SYSTEM
============================================================ */

let posAudioContext: AudioContext | null = null;

function getPosAudioContext() {
  if (!posAudioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return null;

    posAudioContext = new AudioContextClass();
  }

  if (posAudioContext.state === "suspended") {
    posAudioContext.resume().catch(() => {});
  }

  return posAudioContext;
}

/*
  Short commercial supermarket-style
  barcode scanner confirmation beep.
*/
function playScanSound() {
  const ctx = getPosAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";

  oscillator.frequency.setValueAtTime(
    1050,
    now
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    1450,
    now + 0.045
  );

  gain.gain.setValueAtTime(
    0.0001,
    now
  );

  gain.gain.exponentialRampToValueAtTime(
    0.16,
    now + 0.008
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.09
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

/*
  Error sound for invalid barcode/SKU
  or failed checkout.
*/
function playErrorSound() {
  const ctx = getPosAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "square";

  oscillator.frequency.setValueAtTime(
    260,
    now
  );

  oscillator.frequency.setValueAtTime(
    190,
    now + 0.1
  );

  gain.gain.setValueAtTime(
    0.0001,
    now
  );

  gain.gain.exponentialRampToValueAtTime(
    0.12,
    now + 0.01
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.18
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

/*
  Pleasant checkout success sound.
  Three notes:
  Ding → Ding → DING
*/
function playSuccessSound() {
  const ctx = getPosAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const notes = [
    {
      frequency: 523.25,
      start: 0,
      duration: 0.12,
    },
    {
      frequency: 659.25,
      start: 0.09,
      duration: 0.12,
    },
    {
      frequency: 783.99,
      start: 0.18,
      duration: 0.22,
    },
  ];

  notes.forEach((note) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      note.frequency,
      now + note.start
    );

    const start =
      now + note.start;

    const end =
      start + note.duration;

    gain.gain.setValueAtTime(
      0.0001,
      start
    );

    gain.gain.exponentialRampToValueAtTime(
      0.14,
      start + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      end
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });
}

/* ============================================================
   ICONS
============================================================ */

function ScanIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 8v8" />
      <path d="M10 8v8" />
      <path d="M13 8v8" />
      <path d="M17 8v8" />
    </svg>
  );
}

function CartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
    </svg>
  );
}

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function PhoneIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z" />
    </svg>
  );
}

function CreditCardIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
    </svg>
  );
}

function TagIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3.4 13.4a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7a2 2 0 0 1 0 2.8Z" />
      <circle cx="8" cy="8" r="1.2" />
    </svg>
  );
}

function TrashIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="m6 7 1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function PlusIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MinusIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ReceiptIcon({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5L4 21V5a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function SparkleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
      <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    </svg>
  );
}

/* ============================================================
   SMALL UI COMPONENTS
============================================================ */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-900">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-0.5 text-[11px] text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          emphasis
            ? "text-sm font-semibold text-slate-800"
            : "text-xs text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          emphasis
            ? "text-xl font-black tracking-tight text-emerald-700"
            : "text-xs font-semibold text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   POS PAGE
============================================================ */

export function PosPage() {
  // ============================================================
  // POS THERMAL RECEIPT
  // ============================================================

  const [latestSaleNumber, setLatestSaleNumber] = useState("");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [receiptPrinting, setReceiptPrinting] = useState(false);

  async function logoToDataUrl(): Promise<string> {
    const response = await fetch(torkiLogo);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unable to load receipt logo."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Unable to load receipt logo."));
      };

      reader.readAsDataURL(blob);
    });
  }

  async function printSaleReceipt(saleNumber: string) {
    const lookup = saleNumber.trim();

    if (!lookup) {
      push("Enter a sale number to print.", "error");
      return;
    }

    setReceiptPrinting(true);

    try {
      const sale = await call<any>("sales:get", {
        id: lookup,
      });

      const logoDataUrl = await logoToDataUrl();

      await call("receipt:print", {
        saleNumber: sale.saleNumber,
        saleDate: sale.saleDate,
        customer: sale.customer,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        subtotal: sale.subtotal,
        discount: sale.discount,
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
        onlineOrderNumber: sale.onlineOrderNumber,
        createdBy: sale.createdBy,
        items: sale.items,
        logoDataUrl,
      });

      setLatestSaleNumber(sale.saleNumber);
      setReceiptSearch(sale.saleNumber);

      push("Receipt sent to the POS printer.", "success");
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Unable to print receipt.",
        "error"
      );
    } finally {
      setReceiptPrinting(false);
    }
  }


  const [code, setCode] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [membershipDiscountPercent, setMembershipDiscountPercent] = useState(0);
  const [onlineOrderNumber, setOnlineOrderNumber] =
    useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<"CASH" | "BKASH" | "COD" | "CREDIT">(
      "CASH"
    );
  const [overallDiscount, setOverallDiscount] =
    useState("0");
  const [processing, setProcessing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const push = useToastStore((s) => s.push);

  useEffect(() => {
    call<Customer[]>("customers:list")
      .then(setCustomers)
      .catch(() => {});

    inputRef.current?.focus();
  }, []);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim()) return;

    try {
      const product = await call<Product>(
        "products:findByCode",
        {
          code: code.trim(),
        }
      );

      // Extract resolved unit price safely (handles Decimal/string/number)
      const resolvedPrice = Number(product.sellingPrice) || 0;

      setCart((prev) => {
        const existing = prev.find(
          (l) => l.product.id === product.id
        );

        if (existing) {
          return prev.map((l) =>
            l.product.id === product.id
              ? {
                  ...l,
                  quantity: l.quantity + 1,
                  // If unit price was previously 0, update it with the resolved batch price
                  unitPrice: l.unitPrice === 0 ? resolvedPrice : l.unitPrice,
                }
              : l
          );
        }

        return [
          ...prev,
          {
            product,
            quantity: 1,
            unitPrice: resolvedPrice,
            discount: 0,
          },
        ];
      });

      // 🔊 Product successfully added
      playScanSound();

      setCode("");
    } catch (err) {
      // 🔊 Product scan error
      playErrorSound();

      push(
        err instanceof Error
          ? err.message
          : "Product not found",
        "error"
      );

      setCode("");
    }
  }

  function updateLine(
    productId: string,
    patch: Partial<CartLine>
  ) {
    setCart((prev) =>
      prev.map((l) =>
        l.product.id === productId
          ? { ...l, ...patch }
          : l
      )
    );
  }

  function removeLine(productId: string) {
    setCart((prev) =>
      prev.filter(
        (l) => l.product.id !== productId
      )
    );
  }

  const subtotal = cart.reduce(
    (sum, l) =>
      sum +
      l.quantity * l.unitPrice -
      l.discount,
    0
  );

  const membershipDiscountAmount =
    Math.max(
      0,
      subtotal *
        Number(membershipDiscountPercent || 0) /
        100
    );

  const total = Math.max(
    0,
    subtotal -
      membershipDiscountAmount -
      Number(overallDiscount || 0)
  );

  async function loadMembership(code: string) {
    const value = code.trim();

    if (!value) {
      setMembershipNumber("");
      setMembershipDiscountPercent(0);
      return;
    }

    try {
      const membership = await call<any>(
        "membership:find",
        { code: value }
      );

      const memberCustomer = membership.customer;

      setMembershipNumber(
        membership.membershipNumber
      );

      setMembershipDiscountPercent(
        Number(membership.discountPercent ?? 0)
      );

      if (memberCustomer) {
        setCustomerId(memberCustomer.id);
        setCustomerName(
          memberCustomer.name ?? ""
        );
        setMobileNumber(
          memberCustomer.phone ?? ""
        );
      }
    } catch {
      setMembershipDiscountPercent(0);
      push(
        "Membership not found.",
        "error"
      );
    }
  }

  function selectCustomer(id: string) {
    setCustomerId(id);

    const customer = customers.find(
      (c) => c.id === id
    );

    setCustomerName(
      customer?.name ?? ""
    );

    setMobileNumber(
      customer?.phone ?? ""
    );

    const number =
      customer?.membership
        ?.membershipNumber ?? "";

    setMembershipNumber(number);
    setMembershipDiscountPercent(0);

    if (number) {
      void loadMembership(number);
    }
  }

  async function resolveCustomerFromMobile(
    rawPhone: string
  ) {
    const phone = rawPhone
      .replace(/[^\d+]/g, "")
      .trim();

    if (!phone) return;

    const customer = customers.find(
      (c) =>
        (c.phone ?? "")
          .replace(/[^\d+]/g, "")
          .trim() === phone
    );

    if (customer) {
      selectCustomer(customer.id);
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) return;

    const missing = !customerName.trim()
      ? "Customer Name"
      : !mobileNumber.trim()
        ? "Mobile Number"
        : !onlineOrderNumber.trim()
          ? "Online Order Number"
          : null;

    if (missing) {
      // 🔊 Validation error
      playErrorSound();

      push(
        `${missing} is required to complete the sale.`,
        "error"
      );

      return;
    }

    setProcessing(true);

    try {
      const createdSale = await call<any>("sales:create", {
        customerId:
          customerId || undefined,

        customerName:
          customerName.trim(),

        customerPhone:
          mobileNumber.trim(),

        membershipNumber:
          membershipNumber.trim() ||
          undefined,

        paymentMethod,

        overallDiscount:
          Number(
            overallDiscount || 0
          ),

        onlineOrderNumber:
          onlineOrderNumber.trim(),

        items: cart.map((l) => ({
          productId:
            l.product.id,

          quantity:
            l.quantity,

          unitPrice:
            l.unitPrice,

          discount:
            l.discount,
        })),
      });

      push(
        "Sale completed.",
        "success"
      );

      // 🔊 Successful completed sale
      playSuccessSound();

      // Automatically print the completed sale as an 80mm POS receipt.
      try {
        const saleNumber = createdSale?.saleNumber;

        if (saleNumber) {
          setLatestSaleNumber(saleNumber);
          setReceiptSearch(saleNumber);

          // Reload the completed sale so the receipt always has
          // the full customer, product/item, and sale details.
          const receiptSale = await call<any>("sales:get", {
            id: saleNumber,
          });

          const logoDataUrl = await logoToDataUrl();

          await call("receipt:print", {
            saleNumber: receiptSale.saleNumber,
            saleDate: receiptSale.saleDate,
            customer: receiptSale.customer,
            customerName: receiptSale.customerName,
            customerPhone: receiptSale.customerPhone,
            subtotal: receiptSale.subtotal,
            discount: receiptSale.discount,
            totalAmount: receiptSale.totalAmount,
            paymentMethod: receiptSale.paymentMethod,
            paymentStatus: receiptSale.paymentStatus,
            onlineOrderNumber: receiptSale.onlineOrderNumber,
            createdBy: receiptSale.createdBy,
            items: receiptSale.items,
            logoDataUrl,
          });
        }
      } catch (printError) {
        console.error("[POS RECEIPT]", printError);

        push(
          printError instanceof Error
            ? `Sale completed, but receipt printing failed: ${printError.message}`
            : "Sale completed, but receipt printing failed.",
          "error"
        );
      }

      setCart([]);

      setOverallDiscount("0");
      setMembershipDiscountPercent(0);

      selectCustomer("");

      setOnlineOrderNumber("");

      inputRef.current?.focus();
    } catch (err) {
      // 🔊 Checkout error
      playErrorSound();

      push(
        err instanceof Error
          ? err.message
          : "Checkout failed",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div
      className="
        min-h-[calc(100vh-70px)]
        bg-[#f4f7f5]
        px-4 py-4
        lg:px-5
        xl:px-6
      "
    >
      <div className="mx-auto max-w-[1600px]">

        {/* ======================================================
            POS HEADER
        ====================================================== */}

        <div
          className="
            relative mb-4 overflow-hidden rounded-[24px]
            bg-gradient-to-r from-[#064e3b]
            via-[#08784f]
            to-[#0a9665]
            px-5 py-4
            text-white
            shadow-[0_15px_40px_rgba(6,78,59,0.18)]
          "
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-2xl border border-white/15
                  bg-white/10
                  shadow-inner
                  backdrop-blur
                "
              >
                <CartIcon size={22} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight">
                    Point of Sale
                  </h1>

                  <span
                    className="
                      rounded-full border border-emerald-200/20
                      bg-emerald-300/10
                      px-2 py-0.5
                      text-[9px] font-bold uppercase
                      tracking-wider text-emerald-100
                    "
                  >
                    Live
                  </span>
                </div>

                <p className="mt-0.5 text-[11px] text-emerald-100/75">
                  Fast checkout · Barcode & SKU scanning
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-semibold text-emerald-50 backdrop-blur sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              Ready for sale
            </div>
          </div>
        </div>

        {/* ======================================================
            MAIN POS LAYOUT
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_390px]">

          {/* ====================================================
              LEFT — CART AREA
          ==================================================== */}

          <div className="min-w-0 space-y-4">

            {/* SCANNER */}
            <section
              className="
                relative overflow-hidden rounded-[22px]
                border border-slate-200/80
                bg-white
                p-4
                shadow-sm
                transition-all duration-300
                hover:shadow-md
              "
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-50 blur-3xl" />

              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <ScanIcon />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Add product
                      </h2>

                      <p className="text-[10px] text-slate-400">
                        Scan barcode or enter SKU
                      </p>
                    </div>
                  </div>

                  <div className="hidden rounded-lg bg-slate-50 px-2.5 py-1.5 text-[9px] font-semibold text-slate-400 sm:block">
                    Press Enter ↵
                  </div>
                </div>

                <form
                  onSubmit={handleScan}
                  className="flex gap-2"
                >
                  <div className="relative min-w-0 flex-1">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <ScanIcon size={18} />
                    </div>

                    <Input
                      ref={inputRef}
                      autoFocus
                      placeholder="Scan barcode or enter SKU…"
                      value={code}
                      onChange={(e) =>
                        setCode(
                          e.target.value
                        )
                      }
                      className="
                        h-12 w-full
                        rounded-xl
                        border-slate-200
                        pl-10
                        text-sm
                        font-medium
                        shadow-sm
                        transition-all
                        focus:border-emerald-500
                        focus:ring-4
                        focus:ring-emerald-500/10
                      "
                    />
                  </div>

                  <Button
                    type="submit"
                    className="
                      h-12
                      min-w-[86px]
                      rounded-xl
                      bg-emerald-600
                      px-5
                      font-bold
                      shadow-[0_8px_20px_rgba(5,150,105,0.18)]
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-emerald-700
                      hover:shadow-lg
                    "
                  >
                    <span className="flex items-center justify-center gap-2">
                      <PlusIcon />
                      Add
                    </span>
                  </Button>
                </form>
              </div>
            </section>

            {/* CART */}
            <section
              className="
                overflow-hidden rounded-[22px]
                border border-slate-200/80
                bg-white
                shadow-sm
              "
            >
              <div
                className="
                  flex items-center justify-between
                  border-b border-slate-100
                  bg-gradient-to-r from-slate-50
                  to-white
                  px-4 py-3
                "
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <CartIcon size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Current cart
                    </h2>

                    <p className="text-[10px] text-slate-400">
                      {cart.length}{" "}
                      {cart.length === 1
                        ? "product"
                        : "products"}{" "}
                      added
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                  {cart.reduce(
                    (sum, l) =>
                      sum + l.quantity,
                    0
                  )}{" "}
                  items
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Product
                        </th>

                        <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          SKU
                        </th>

                        <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Qty
                        </th>

                        <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Unit price
                        </th>

                        <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Discount
                        </th>

                        <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Subtotal
                        </th>

                        <th className="w-12" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {cart.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-14 text-center"
                          >
                            <div className="mx-auto flex max-w-xs flex-col items-center">
                              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                                <CartIcon size={25} />
                              </div>

                              <p className="text-sm font-bold text-slate-500">
                                Your cart is empty
                              </p>

                              <p className="mt-1 text-[11px] text-slate-400">
                                Scan a barcode or enter a SKU above to add a product.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}

                      {cart.map((l) => (
                        <tr
                          key={l.product.id}
                          className="
                            group
                            transition-colors
                            hover:bg-emerald-50/30
                          "
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-700">
                                {l.product.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-800">
                                  {l.product.name}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Stock: <span className="font-semibold text-emerald-600">{Number(l.product.currentStock)} {l.product.unit?.abbreviation || "units"}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
                              {l.product.sku}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="mx-auto flex w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                              <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                                onClick={() =>
                                  updateLine(
                                    l.product.id,
                                    {
                                      quantity:
                                        Math.max(
                                          1,
                                          l.quantity - 1
                                        ),
                                    }
                                  )
                                }
                              >
                                <MinusIcon />
                              </button>

                              <input
                                type="number"
                                min={1}
                                className="h-8 w-12 border-x border-slate-200 bg-transparent text-center text-xs font-bold text-slate-800 outline-none"
                                value={l.quantity}
                                onChange={(e) =>
                                  updateLine(
                                    l.product.id,
                                    {
                                      quantity:
                                        Number(
                                          e.target.value
                                        ),
                                    }
                                  )
                                }
                              />

                              <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                onClick={() =>
                                  updateLine(
                                    l.product.id,
                                    {
                                      quantity:
                                        l.quantity + 1,
                                    }
                                  )
                                }
                              >
                                <PlusIcon />
                              </button>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-right">
                            <input
                              type="number"
                              min={0}
                              className="
                                w-24 rounded-lg
                                border border-slate-200
                                bg-slate-50/50
                                px-2 py-2
                                text-right text-xs font-semibold
                                outline-none
                                transition-all
                                focus:border-emerald-400
                                focus:bg-white
                                focus:ring-2
                                focus:ring-emerald-500/10
                              "
                              value={l.unitPrice}
                              onChange={(e) =>
                                updateLine(
                                  l.product.id,
                                  {
                                    unitPrice:
                                      Number(
                                        e.target.value
                                      ),
                                  }
                                )
                              }
                            />
                          </td>

                          <td className="px-3 py-3 text-right">
                            <input
                              type="number"
                              min={0}
                              className="
                                w-20 rounded-lg
                                border border-slate-200
                                bg-slate-50/50
                                px-2 py-2
                                text-right text-xs font-semibold
                                outline-none
                                transition-all
                                focus:border-emerald-400
                                focus:bg-white
                                focus:ring-2
                                focus:ring-emerald-500/10
                              "
                              value={l.discount}
                              onChange={(e) =>
                                updateLine(
                                  l.product.id,
                                  {
                                    discount:
                                      Number(
                                        e.target.value
                                      ),
                                  }
                                )
                              }
                            />
                          </td>

                          <td className="px-3 py-3 text-right">
                            <span className="text-sm font-black text-slate-900">
                              {formatBDT(
                                l.quantity *
                                  l.unitPrice -
                                  l.discount
                              )}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <button
                              type="button"
                              className="
                                flex h-8 w-8 items-center
                                justify-center rounded-lg
                                text-slate-300
                                transition-all
                                hover:bg-red-50
                                hover:text-red-500
                              "
                              onClick={() =>
                                removeLine(
                                  l.product.id
                                )
                              }
                            >
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cart */}
              <div className="divide-y divide-slate-100 md:hidden">
                {cart.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                      <CartIcon size={25} />
                    </div>

                    <p className="text-sm font-bold text-slate-500">
                      Cart is empty
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Scan a product to begin.
                    </p>
                  </div>
                )}

                {cart.map((l) => (
                  <div
                    key={l.product.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-black text-emerald-700">
                          {l.product.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {l.product.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Stock: <span className="font-semibold text-emerald-600">{Number(l.product.currentStock)} {l.product.unit?.abbreviation || "units"}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-slate-300 hover:text-red-500"
                        onClick={() =>
                          removeLine(
                            l.product.id
                          )
                        }
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div>
                        <p className="mb-1 text-[9px] font-semibold uppercase text-slate-400">
                          Qty
                        </p>

                        <input
                          type="number"
                          min={1}
                          className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold"
                          value={l.quantity}
                          onChange={(e) =>
                            updateLine(
                              l.product.id,
                              {
                                quantity:
                                  Number(
                                    e.target.value
                                  ),
                              }
                            )
                          }
                        />
                      </div>

                      <div>
                        <p className="mb-1 text-[9px] font-semibold uppercase text-slate-400">
                          Price
                        </p>

                        <input
                          type="number"
                          min={0}
                          className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold"
                          value={l.unitPrice}
                          onChange={(e) =>
                            updateLine(
                              l.product.id,
                              {
                                unitPrice:
                                  Number(
                                    e.target.value
                                  ),
                              }
                            )
                          }
                        />
                      </div>

                      <div>
                        <p className="mb-1 text-[9px] font-semibold uppercase text-slate-400">
                          Discount
                        </p>

                        <input
                          type="number"
                          min={0}
                          className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold"
                          value={l.discount}
                          onChange={(e) =>
                            updateLine(
                              l.product.id,
                              {
                                discount:
                                  Number(
                                    e.target.value
                                  ),
                              }
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-[10px] text-slate-400">
                        Line total
                      </span>

                      <span className="text-sm font-black text-emerald-700">
                        {formatBDT(
                          l.quantity *
                            l.unitPrice -
                            l.discount
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ====================================================
              RIGHT — CHECKOUT
          ==================================================== */}

          <aside className="min-w-0">
            <section
              className="
                overflow-hidden rounded-[24px]
                border border-slate-200/80
                bg-white
                shadow-[0_10px_30px_rgba(15,23,42,0.06)]
                xl:sticky xl:top-4
              "
            >
              {/* Checkout header */}
              <div
                className="
                  relative overflow-hidden
                  bg-gradient-to-br
                  from-[#064e3b]
                  to-[#087c54]
                  px-5 py-4
                  text-white
                "
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                      Checkout
                    </p>

                    <h2 className="mt-1 text-lg font-black">
                      Complete sale
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                    <ReceiptIcon />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">

                {/* CUSTOMER */}
                <div>
                  <SectionHeader
                    icon={<UserIcon />}
                    title="Customer"
                    subtitle="Customer information"
                  />

                  <div className="space-y-3">
                    <Field label="Customer">
                      <Select
                        value={customerId}
                        onChange={(e) =>
                          selectCustomer(
                            e.target.value
                          )
                        }
                        className="h-10 rounded-xl text-xs"
                      >
                        <option value="">
                          Walk-in customer
                        </option>

                        {customers.map((c) => (
                          <option
                            key={c.id}
                            value={c.id}
                          >
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <Field label="Customer name *">
                        <div className="relative">
                          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <UserIcon size={15} />
                          </div>

                          <Input
                            required
                            value={customerName}
                            onChange={(e) =>
                              setCustomerName(
                                e.target.value
                              )
                            }
                            className="h-10 rounded-xl pl-9 text-xs"
                          />
                        </div>
                      </Field>

                      <Field label="Mobile number *">
                        <div className="relative">
                          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <PhoneIcon size={15} />
                          </div>

                          <Input
                            required
                            value={mobileNumber}
                            onChange={(e) =>
                              setMobileNumber(
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              void resolveCustomerFromMobile(
                                mobileNumber
                              )
                            }
                            className="h-10 rounded-xl pl-9 text-xs"
                          />
                        </div>
                      </Field>
                    </div>

                    <Field label="Membership number">
                      <Input
                        value={membershipNumber}
                        onChange={(e) => {
                          setMembershipNumber(
                            e.target.value
                          );
                          setMembershipDiscountPercent(0);
                        }}
                        onBlur={() =>
                          void loadMembership(
                            membershipNumber
                          )
                        }
                        className="h-10 rounded-xl text-xs"
                      />
                    </Field>
                  </div>
                </div>

                {/* ORDER */}
                <div className="border-t border-slate-100 pt-4">
                  <SectionHeader
                    icon={<TagIcon />}
                    title="Order details"
                    subtitle="WooCommerce reference"
                  />

                  <Field label="Online order number *">
                    <Input
                      required
                      placeholder="WooCommerce order reference"
                      value={onlineOrderNumber}
                      onChange={(e) =>
                        setOnlineOrderNumber(
                          withOrderHash(
                            e.target.value
                          )
                        )
                      }
                      className="h-10 rounded-xl text-xs"
                    />
                  </Field>
                </div>

                {/* PAYMENT */}
                <div className="border-t border-slate-100 pt-4">
                  <SectionHeader
                    icon={<CreditCardIcon />}
                    title="Payment"
                    subtitle="Select payment method"
                  />

                  <Field label="Payment method">
                    <Select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value as
                            | "CASH"
                            | "BKASH"
                            | "COD"
                            | "CREDIT"
                        )
                      }
                      className="h-10 rounded-xl text-xs"
                    >
                      <option value="CASH">
                        Cash
                      </option>

                      <option value="BKASH">
                        bKash
                      </option>

                      <option value="COD">
                        Cash on Delivery
                      </option>

                      <option value="CREDIT">
                        Credit / Due
                      </option>
                    </Select>
                  </Field>
                </div>

                {/* DISCOUNT */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                        <TagIcon size={15} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Overall discount
                        </p>

                        <p className="text-[9px] text-slate-400">
                          Applied to the full sale
                        </p>
                      </div>
                    </div>

                    <Input
                      type="number"
                      min={0}
                      value={overallDiscount}
                      onChange={(e) =>
                        setOverallDiscount(
                          e.target.value
                        )
                      }
                      className="h-9 w-24 rounded-lg text-right text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* TOTAL */}
                <div
                  className="
                    rounded-2xl
                    border border-emerald-100
                    bg-gradient-to-br
                    from-emerald-50
                    to-white
                    p-4
                  "
                >
                  <div className="space-y-2">
                    <SummaryRow
                      label="Subtotal"
                      value={formatBDT(
                        subtotal
                      )}
                    />

                    {membershipDiscountAmount > 0 && (
                      <SummaryRow
                        label={`Membership discount (${membershipDiscountPercent}%)`}
                        value={`- ${formatBDT(
                          membershipDiscountAmount
                        )}`}
                      />
                    )}

                    <SummaryRow
                      label="Overall discount"
                      value={`- ${formatBDT(
                        Number(
                          overallDiscount || 0
                        )
                      )}`}
                    />

                    <div className="my-2 border-t border-emerald-100" />

                    <SummaryRow
                      label="Total"
                      value={formatBDT(total)}
                      emphasis
                    />
                  </div>
                </div>

                {/* COMPLETE SALE */}
                <button
                  type="button"
                  disabled={
                    cart.length === 0 ||
                    processing
                  }
                  onClick={handleCheckout}
                  className="
                    group relative w-full
                    overflow-hidden
                    rounded-2xl
                    bg-gradient-to-r
                    from-[#059669]
                    to-[#087c54]
                    px-5 py-4
                    text-white
                    shadow-[0_12px_28px_rgba(5,150,105,0.22)]
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:shadow-[0_18px_35px_rgba(5,150,105,0.28)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    disabled:hover:translate-y-0
                  "
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-100">
                        {processing
                          ? "Please wait"
                          : "Ready to process"}
                      </p>

                      <p className="mt-0.5 text-base font-black">
                        {processing
                          ? "Processing…"
                          : "Complete Sale"}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      {processing ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <ArrowRightIcon />
                      )}
                    </div>
                  </div>
                </button>

                {/* EMPTY CART HINT */}
                {cart.length === 0 && (
                  <div className="flex items-center justify-center gap-2 text-center text-[10px] text-slate-400">
                    <SparkleIcon size={13} />
                    Scan a product to start the sale
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>

        {/* ========================================================
            POS RECEIPT / REPRINT
        ======================================================== */}
        <section className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <span className="text-base leading-none">🖨</span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    POS Receipt
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Print or reprint a completed sale on the thermal POS printer
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  value={receiptSearch}
                  onChange={(e) =>
                    setReceiptSearch(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void printSaleReceipt(receiptSearch);
                    }
                  }}
                  placeholder="Sale number"
                  aria-label="Sale number"
                  className="
                    h-10 w-full rounded-xl border border-slate-200
                    bg-slate-50 px-3 text-sm font-semibold text-slate-800
                    outline-none transition
                    placeholder:text-slate-400
                    focus:border-emerald-500 focus:bg-white
                    focus:ring-2 focus:ring-emerald-100
                    sm:w-52
                  "
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  void printSaleReceipt(
                    receiptSearch || latestSaleNumber
                  );
                }}
                disabled={
                  receiptPrinting ||
                  !(receiptSearch || latestSaleNumber)
                }
                className="
                  inline-flex h-10 items-center justify-center gap-2
                  rounded-xl bg-emerald-700 px-4
                  text-xs font-black text-white
                  shadow-sm transition
                  hover:bg-emerald-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {receiptPrinting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Printing...
                  </>
                ) : (
                  <>
                    <span className="text-sm leading-none">🖨</span>
                    Print Receipt
                  </>
                )}
              </button>
            </div>
          </div>

          {latestSaleNumber && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Latest completed sale
              </span>

              <button
                type="button"
                onClick={() => {
                  setReceiptSearch(latestSaleNumber);
                }}
                className="
                  rounded-lg bg-slate-100 px-2.5 py-1
                  font-mono text-[11px] font-bold text-slate-700
                  transition hover:bg-emerald-50 hover:text-emerald-700
                "
              >
                {latestSaleNumber}
              </button>
            </div>
          )}
        </section>

        {/* FOOTER STATUS */}
        <div className="mt-3 hidden items-center justify-between px-1 text-[9px] text-slate-400 lg:flex">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="font-bold tracking-[0.14em]">
              TORKI BAZAR POS
            </span>
          </div>

          <span>
            Scan → Add → Checkout → Complete Sale
          </span>

          <span>
            {cart.length} cart line
            {cart.length === 1
              ? ""
              : "s"}
          </span>
        </div>
      </div>

      {/* ========================================================
          ANIMATIONS
      ======================================================== */}

      <style>
        {`
          @keyframes posFadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .pos-animate {
            animation: posFadeIn .35s ease-out;
          }
        `}
      </style>
    </div>
  );
}
