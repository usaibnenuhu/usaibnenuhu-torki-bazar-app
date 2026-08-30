// Invoice/reference numbering prefixes. New prefixes can be added without
// any schema change — the InvoiceSequence table stores counters dynamically.
export const INVOICE_PREFIXES = {
  SALE: "TB-SALE",
  PURCHASE: "TB-PUR",
  RETURN: "TB-RET",
  EXPENSE: "TB-EXP",
  PAYMENT: "TB-PAY",
  MEMBERSHIP: "TB-MEM",
  SUPPLIER_PAYMENT: "SP",
  SUPPLIER_RETURN: "SR",
} as const;

export type InvoicePrefix = (typeof INVOICE_PREFIXES)[keyof typeof INVOICE_PREFIXES];

export const EXPIRY_ALERT_THRESHOLDS_DAYS = [30, 14, 7, 3, 1] as const;

export const DEFAULT_UNITS = [
  { name: "Piece", abbreviation: "pc" },
  { name: "Kilogram", abbreviation: "kg" },
  { name: "Gram", abbreviation: "g" },
  { name: "Liter", abbreviation: "L" },
  { name: "Milliliter", abbreviation: "ml" },
  { name: "Pack", abbreviation: "pack" },
  { name: "Box", abbreviation: "box" },
  { name: "Bottle", abbreviation: "btl" },
  { name: "Carton", abbreviation: "ctn" },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Salaries",
  "Electricity",
  "Water",
  "Internet",
  "Rent",
  "Transport",
  "Maintenance",
  "Packaging",
  "Marketing",
  "Office",
  "Other",
];
