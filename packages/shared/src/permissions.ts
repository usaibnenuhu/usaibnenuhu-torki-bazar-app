// Granular permission codes. Owner/Admin is granted every permission below.
// Manager is granted a restricted operational subset (see MANAGER_PERMISSIONS).
// Managers must never receive *.delete or *.void permissions for financial
// history (sales, purchases, expenses, inventory, employees, users, settings).

export const PERMISSIONS = {
  // Users & security
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
  SETTINGS_MANAGE: "settings.manage",
  AUDIT_LOG_VIEW: "audit.view",
  BACKUP_MANAGE: "backup.manage",

  // Products & catalog
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_MANAGE: "products.manage",
  PRODUCTS_ARCHIVE: "products.archive",
  CATEGORIES_MANAGE: "categories.manage",

  // Inventory
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_ADJUST: "inventory.adjust",

  // Suppliers & purchases
  SUPPLIERS_VIEW: "suppliers.view",
  SUPPLIERS_MANAGE: "suppliers.manage",
  PURCHASES_VIEW: "purchases.view",
  PURCHASES_CREATE: "purchases.create",
  PURCHASES_VOID: "purchases.void",
  SUPPLIER_PAYMENTS_MANAGE: "supplier_payments.manage",

  // Customers & membership
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_MANAGE: "customers.manage",
  MEMBERSHIP_MANAGE: "membership.manage",
  CUSTOMER_PAYMENTS_MANAGE: "customer_payments.manage",

  // POS / Sales
  POS_USE: "pos.use",
  SALES_VIEW: "sales.view",
  SALES_VOID: "sales.void",
  COD_COLLECT: "cod.collect",

  // Returns
  RETURNS_CREATE: "returns.create",
  RETURNS_VIEW: "returns.view",

  // Employees & salary
  EMPLOYEES_VIEW: "employees.view",
  EMPLOYEES_MANAGE: "employees.manage",
  SALARIES_MANAGE: "salaries.manage",

  // Expenses
  EXPENSES_VIEW: "expenses.view",
  EXPENSES_MANAGE: "expenses.manage",
  EXPENSES_VOID: "expenses.void",

  // Invoices & reports
  INVOICES_GENERATE: "invoices.generate",
  REPORTS_VIEW: "reports.view",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionCode[] = Object.values(PERMISSIONS);

// Manager: normal daily operations, no destructive/financial-history actions.
export const MANAGER_PERMISSIONS: PermissionCode[] = [
  PERMISSIONS.PRODUCTS_VIEW,
  PERMISSIONS.INVENTORY_VIEW,
  PERMISSIONS.SUPPLIERS_VIEW,
  PERMISSIONS.PURCHASES_VIEW,
  PERMISSIONS.PURCHASES_CREATE,
  PERMISSIONS.CUSTOMERS_VIEW,
  PERMISSIONS.CUSTOMERS_MANAGE,
  PERMISSIONS.MEMBERSHIP_MANAGE,
  PERMISSIONS.CUSTOMER_PAYMENTS_MANAGE,
  PERMISSIONS.POS_USE,
  PERMISSIONS.SALES_VIEW,
  PERMISSIONS.COD_COLLECT,
  PERMISSIONS.RETURNS_CREATE,
  PERMISSIONS.RETURNS_VIEW,
  PERMISSIONS.EMPLOYEES_VIEW,
  PERMISSIONS.EXPENSES_VIEW,
  PERMISSIONS.INVOICES_GENERATE,
  PERMISSIONS.REPORTS_VIEW,
];
