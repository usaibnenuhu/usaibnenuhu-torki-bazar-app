import { create } from "zustand";

type Lang = "en" | "bn";

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  n: (num: number | string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    pos: "POS",
    sales: "Sales",
    products: "Products",
    categories: "Categories",
    inventory: "Inventory",
    suppliers: "Suppliers",
    supplierReturns: "Supplier Returns",
    purchases: "Purchases",
    customers: "Customers",
    membership: "Membership",
    returns: "Returns",
    employees: "Employees",
    expensesLabel: "Expenses",
    cashManagement: "Cash Management",
    reports: "Reports",
    notifications: "Notifications",
    settings: "Settings & Backup",
    liveOperationsCenter: "Live Operations Center",
    welcomeBack: "Welcome back, Torki Bazar",
    heroSubtitle: "Real-time performance metrics, inventory health, and revenue analytics — refined for the day ahead.",
    filterPeriod: "Filter Period",
    today: "Today",
    last7Days: "Last 7 Days",
    thisMonth: "This Month",
    thisQuarter: "This Quarter",
    thisYear: "This Year",
    customRange: "Custom Range",
    fromDate: "From Date",
    toDate: "To Date",
    activeMode: "Active mode",
    coreRevenue: "Core Revenue",
    salesAndProfitOverview: "Sales & Profit Overview",
    totalRevenueSales: "TOTAL REVENUE / SALES",
    accumulatedForToday: "Accumulated for today",
    verifiedPosTransactions: "Verified POS transactions",
    grossProfitYield: "Gross Profit Yield",
    grossProfitMargin: "GROSS PROFIT MARGIN",
    netReturnAfterCogs: "Net return after deducting COGS",
    cogs: "COGS",
    fullyTracked: "100% Fully Tracked",
    ledgerAndAccounts: "Ledger & Accounts",
    financialBreakdowns: "Financial Breakdowns",
    supplierPayables: "Supplier Payables",
    customerReceivables: "Customer Receivables",
    codPending: "COD Pending",
    inventoryExpenses: "Inventory Expenses",
    directory: "Directory",
    customerAndSupplierBase: "Customer & Supplier Base",
    totalCustomers: "Total Customers",
    activeMembers: "Active Members",
    activeSuppliers: "Active Suppliers",
    stockActions: "Stock Actions",
    attentionRequired: "Attention Required",
    urgentAlerts: "Urgent Alert",
    lowStockWarning: "Low Stock Warning",
    productsBelowThreshold: "products below safety threshold",
    expiringSoon: "Expiring Soon",
    batchesNearingExpiry: "batches nearing expiry date",
    expiredBatches: "Expired Batches",
    batchesAlreadyExpired: "batches already expired",
    systemHealth: "System Health",
    operationalStatus: "Operational Status",
    allSystemsOptimal: "All Systems Optimal",
    retailManagementSystem: "Retail Management System & POS Core",
    displayingMetricsFor: "Displaying metrics for",
  },

  bn: {
    dashboard: "ড্যাশবোর্ড",
    pos: "পিওএস",
    sales: "বিক্রয়",
    products: "পণ্য",
    categories: "ক্যাটেগরি",
    inventory: "ইনভেন্টরি",
    suppliers: "সরবরাহকারী",
    supplierReturns: "সরবরাহকারী ফেরত",
    purchases: "ক্রয়",
    customers: "গ্রাহক",
    membership: "সদস্যপদ",
    returns: "ফেরত",
    employees: "কর্মচারী",
    expensesLabel: "খরচ",
    cashManagement: "ক্যাশ ম্যানেজমেন্ট",
    reports: "রিপোর্ট",
    notifications: "নোটিফিকেশন",
    settings: "সেটিংস ও ব্যাকআপ",
    liveOperationsCenter: "লাইভ অপারেশনস সেন্টার",
    welcomeBack: "স্বাগতম, তর্কি বাজার",
    heroSubtitle: "রিয়েল-টাইম পারফরম্যান্স মেট্রিক্স, ইনভেন্টরি স্বাস্থ্য এবং রেভিনিউ অ্যানালিটিক্স।",
    filterPeriod: "ফিল্টার সময়কাল",
    today: "আজ",
    last7Days: "গত ৭ দিন",
    thisMonth: "এই মাস",
    thisQuarter: "এই ত্রৈমাসিক",
    thisYear: "এই বছর",
    customRange: "কাস্টম রেঞ্জ",
    fromDate: "শুরুর তারিখ",
    toDate: "শেষ তারিখ",
    activeMode: "সক্রিয় মোড",
    coreRevenue: "মূল রেভিনিউ",
    salesAndProfitOverview: "বিক্রয় ও লাভ ওভারভিউ",
    totalRevenueSales: "মোট রেভিনিউ / বিক্রয়",
    accumulatedForToday: "আজকের জন্য জমা হয়েছে",
    verifiedPosTransactions: "যাচাইকৃত পিওএস লেনদেন",
    grossProfitYield: "মোট লাভ ফলন",
    grossProfitMargin: "মোট লাভ মার্জিন",
    netReturnAfterCogs: "সিওজিএস বাদ দেওয়ার পর নিট রিটার্ন",
    cogs: "সিওজিএস",
    fullyTracked: "১০০% সম্পূর্ণ ট্র্যাক করা হয়েছে",
    ledgerAndAccounts: "লেজার ও অ্যাকাউন্টস",
    financialBreakdowns: "আর্থিক বিবরণ",
    supplierPayables: "সরবরাহকারী পাওনা",
    customerReceivables: "গ্রাহক পাওনা",
    codPending: "সিওডি অপেক্ষমাণ",
    inventoryExpenses: "ইনভেন্টরি খরচ",
    directory: "ডিরেক্টরি",
    customerAndSupplierBase: "গ্রাহক ও সরবরাহকারী বেস",
    totalCustomers: "মোট গ্রাহক",
    activeMembers: "সক্রিয় সদস্য",
    activeSuppliers: "সক্রিয় সরবরাহকারী",
    stockActions: "স্টক অ্যাকশন",
    attentionRequired: "মনোযোগ প্রয়োজন",
    urgentAlerts: "জরুরি সতর্কতা",
    lowStockWarning: "কম স্টক সতর্কতা",
    productsBelowThreshold: "নিরাপদ সীমার নিচে পণ্য",
    expiringSoon: "শীঘ্রই মেয়াদোত্তীর্ণ হবে",
    batchesNearingExpiry: "মেয়াদ শেষের কাছাকাছি ব্যাচ",
    expiredBatches: "মেয়াদোত্তীর্ণ ব্যাচ",
    batchesAlreadyExpired: "ইতিমধ্যে মেয়াদোত্তীর্ণ ব্যাচ",
    systemHealth: "সিস্টেম স্বাস্থ্য",
    operationalStatus: "অপারেটিং স্ট্যাটাস",
    allSystemsOptimal: "সমস্ত সিস্টেম অপ্টিমাল",
    retailManagementSystem: "রিটেল ম্যানেজমেন্ট সিস্টেম এবং POS কোর",
    displayingMetricsFor: "মেট্রিক্স প্রদর্শিত হচ্ছে:",
  },
};

const bnDigits: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  lang: "en",

  setLang: (lang) => set({ lang }),

  toggleLang: () =>
    set({
      lang: get().lang === "en" ? "bn" : "en",
    }),

  t: (key) => {
    const currentLang = get().lang;
    return translations[currentLang]?.[key] || key;
  },

  n: (num) => {
    if (num === undefined || num === null) return "";

    const str = String(num);

    if (get().lang !== "bn") return str;

    // Replaces all English digits with Bangla digits while preserving currency signs and commas
    return str.replace(
      /[0-9]/g,
      (digit) => bnDigits[digit] || digit
    );
  },
}));