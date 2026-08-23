"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("node:path");
const shared = require("@torki-bazar/shared");
const core = require("@torki-bazar/core");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const core__namespace = /* @__PURE__ */ _interopNamespaceDefault(core);
let currentSession = null;
function getSession() {
  return currentSession;
}
function setSession(session) {
  currentSession = session;
}
function requireSession() {
  if (!currentSession) {
    throw new Error("Not authenticated.");
  }
  return currentSession;
}
function serialize(value) {
  if (value === null || value === void 0) return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((v) => serialize(v));
  if (typeof value === "object") {
    const maybeDecimal = value;
    if (typeof maybeDecimal.toFixed === "function" && typeof maybeDecimal.toNumber === "function") {
      return value.toString();
    }
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serialize(val);
    }
    return result;
  }
  return value;
}
function handle(channel, fn) {
  electron.ipcMain.handle(channel, async (_event, payload) => {
    try {
      const data = await fn(payload);
      return {
        ok: true,
        data: serialize(data)
      };
    } catch (error) {
      if (error instanceof shared.AppError) {
        return {
          ok: false,
          code: error.code,
          message: error.message
        };
      }
      console.error(`[IPC:${channel}]`, error);
      return {
        ok: false,
        code: "UNKNOWN",
        message: "Something went wrong. Please try again."
      };
    }
  });
}
function registerIpcHandlers() {
  handle("app:paths", async () => {
    const url = process.env.DATABASE_URL ?? "";
    const dbFilePath = url.startsWith("file:") ? path.resolve(url.slice("file:".length)) : url;
    const backupsDir = path.join(
      electron.app.getPath("userData"),
      "backups"
    );
    return {
      dbFilePath,
      backupsDir
    };
  });
  handle(
    "auth:login",
    async ({ username, password }) => {
      const session = await core__namespace.login(
        username,
        password
      );
      setSession(session);
      return session;
    }
  );
  handle("auth:logout", async () => {
    const session = getSession();
    if (session) {
      await core__namespace.logout(session);
    }
    setSession(null);
  });
  handle(
    "auth:me",
    async () => getSession()
  );
  handle(
    "auth:changePassword",
    async ({
      currentPassword,
      newPassword
    }) => core__namespace.changePassword(
      requireSession(),
      currentPassword,
      newPassword
    )
  );
  handle(
    "users:list",
    async () => core__namespace.listUsers(requireSession())
  );
  handle(
    "users:create",
    async (input) => core__namespace.createUser(
      requireSession(),
      input
    )
  );
  handle(
    "users:update",
    async ({ id, ...input }) => core__namespace.updateUser(
      requireSession(),
      id,
      input
    )
  );
  handle(
    "users:setActive",
    async ({ id, isActive }) => core__namespace.setUserActive(
      requireSession(),
      id,
      isActive
    )
  );
  handle(
    "users:resetPassword",
    async ({ id, newPassword }) => core__namespace.resetUserPassword(
      requireSession(),
      id,
      newPassword
    )
  );
  handle(
    "roles:list",
    async () => core__namespace.listRoles()
  );
  handle(
    "catalog:categories:list",
    async ({ includeArchived } = {}) => core__namespace.listCategories(includeArchived)
  );
  handle(
    "catalog:categories:create",
    async ({ name, description }) => core__namespace.createCategory(
      requireSession(),
      name,
      description
    )
  );
  handle(
    "catalog:categories:update",
    async ({ id, ...data }) => core__namespace.updateCategory(
      requireSession(),
      id,
      data
    )
  );
  handle(
    "catalog:categories:delete",
    async ({ id }) => core__namespace.deleteCategory(
      requireSession(),
      id
    )
  );
  handle(
    "catalog:categories:archive",
    async ({ id, isArchived }) => core__namespace.archiveCategory(
      requireSession(),
      id,
      isArchived
    )
  );
  handle(
    "catalog:subcategories:create",
    async ({ categoryId, name }) => core__namespace.createSubcategory(
      requireSession(),
      categoryId,
      name
    )
  );
  handle(
    "catalog:subcategories:delete",
    async ({ id }) => core__namespace.deleteSubcategory(
      requireSession(),
      id
    )
  );
  handle(
    "catalog:subcategories:archive",
    async ({ id, isArchived }) => core__namespace.archiveSubcategory(
      requireSession(),
      id,
      isArchived
    )
  );
  handle(
    "catalog:brands:list",
    async ({ includeArchived } = {}) => core__namespace.listBrands(includeArchived)
  );
  handle(
    "catalog:brands:create",
    async ({ name }) => core__namespace.createBrand(
      requireSession(),
      name
    )
  );
  handle(
    "catalog:units:list",
    async ({ includeArchived } = {}) => core__namespace.listUnits(includeArchived)
  );
  handle(
    "catalog:units:create",
    async ({ name, abbreviation }) => core__namespace.createUnit(
      requireSession(),
      name,
      abbreviation
    )
  );
  handle(
    "products:search",
    async (options) => core__namespace.searchProducts(options ?? {})
  );
  handle(
    "products:create",
    async (input) => core__namespace.createProduct(
      requireSession(),
      input
    )
  );
  handle(
    "products:update",
    async ({ id, ...input }) => core__namespace.updateProduct(
      requireSession(),
      id,
      input
    )
  );
  handle(
    "products:archive",
    async ({ id, isArchived }) => core__namespace.archiveProduct(
      requireSession(),
      id,
      isArchived
    )
  );
  handle(
    "products:findByCode",
    async ({ code }) => core__namespace.findProductByBarcodeOrSku(code)
  );
  handle(
    "products:lowStock",
    async () => core__namespace.getLowStockProducts()
  );
  handle(
    "inventory:expiringBatches",
    async () => core__namespace.getExpiringBatches()
  );
  handle(
    "inventory:expiredBatches",
    async () => core__namespace.getExpiredBatches()
  );
  handle(
    "inventory:adjustStock",
    async (input) => core__namespace.adjustProductStock(
      requireSession(),
      input
    )
  );
  handle(
    "inventory:batches",
    async (filters) => core__namespace.listBatches(filters ?? {})
  );
  handle(
    "inventory:batch",
    async ({ id }) => core__namespace.getBatchDetails(id)
  );
  handle(
    "inventory:updateBatch",
    async ({ id, ...input }) => core__namespace.updateBatchDetails(
      requireSession(),
      id,
      input
    )
  );
  handle(
    "inventory:writeOffBatch",
    async (input) => core__namespace.writeOffBatch(
      requireSession(),
      input
    )
  );
  handle(
    "inventory:losses",
    async (filters) => core__namespace.listInventoryLosses(
      filters ?? {}
    )
  );
  handle(
    "suppliers:list",
    async ({ includeArchived } = {}) => core__namespace.listSuppliers(includeArchived)
  );
  handle(
    "suppliers:profile",
    async ({ id }) => core__namespace.getSupplierProfile(id)
  );
  handle(
    "suppliers:create",
    async (input) => core__namespace.createSupplier(
      requireSession(),
      input
    )
  );
  handle(
    "suppliers:update",
    async ({ id, ...input }) => core__namespace.updateSupplier(
      requireSession(),
      id,
      input
    )
  );
  handle(
    "suppliers:archive",
    async ({ id, isArchived }) => core__namespace.archiveSupplier(
      requireSession(),
      id,
      isArchived
    )
  );
  handle(
    "suppliers:outstanding",
    async ({ id }) => core__namespace.getSupplierOutstanding(id)
  );
  handle(
    "supplierReturns:list",
    async (filters) => core__namespace.listSupplierReturns(
      filters ?? {}
    )
  );
  handle(
    "supplierReturns:get",
    async ({ id }) => core__namespace.getSupplierReturnDetails(id)
  );
  handle(
    "supplierReturns:returnable",
    async ({ batchId }) => core__namespace.getReturnableQuantity(batchId)
  );
  handle(
    "supplierReturns:create",
    async (input) => core__namespace.createSupplierReturn(
      requireSession(),
      input
    )
  );
  handle(
    "supplierReturns:cancel",
    async ({ id, reason }) => core__namespace.cancelSupplierReturn(
      requireSession(),
      id,
      reason
    )
  );
  handle(
    "purchases:create",
    async (input) => core__namespace.createPurchase(
      requireSession(),
      input
    )
  );
  handle(
    "purchases:list",
    async (filters) => core__namespace.listPurchases(
      filters ?? {}
    )
  );
  handle(
    "purchases:get",
    async ({ id }) => core__namespace.getPurchaseWithDetails(id)
  );
  handle(
    "purchases:recordPayment",
    async (input) => core__namespace.recordSupplierPayment(
      requireSession(),
      input
    )
  );
  handle(
    "purchases:void",
    async ({ id, reason }) => core__namespace.voidPurchase(
      requireSession(),
      id,
      reason
    )
  );
  handle(
    "customers:list",
    async ({ includeArchived } = {}) => core__namespace.listCustomers(includeArchived)
  );
  handle(
    "customers:profile",
    async ({ id }) => core__namespace.getCustomerProfile(id)
  );
  handle(
    "customers:create",
    async (input) => core__namespace.createCustomer(
      requireSession(),
      input
    )
  );
  handle(
    "customers:update",
    async ({ id, ...input }) => core__namespace.updateCustomer(
      requireSession(),
      id,
      input
    )
  );
  handle(
    "customers:archive",
    async ({ id, isArchived }) => core__namespace.archiveCustomer(
      requireSession(),
      id,
      isArchived
    )
  );
  handle(
    "customers:recordPayment",
    async (input) => core__namespace.recordCustomerPayment(
      requireSession(),
      input
    )
  );
  handle(
    "membership:issue",
    async (input) => core__namespace.issueMembership(
      requireSession(),
      input
    )
  );
  handle(
    "membership:find",
    async ({ code }) => core__namespace.findMembership(code)
  );
  handle(
    "membership:reprint",
    async ({ id }) => core__namespace.reprintMembership(
      requireSession(),
      id
    )
  );
  handle(
    "membership:suspend",
    async ({ id }) => core__namespace.suspendMembership(
      requireSession(),
      id
    )
  );
  handle(
    "sales:create",
    async (input) => core__namespace.createSale(
      requireSession(),
      input
    )
  );
  handle(
    "sales:markCodCollected",
    async ({ id, ...input }) => core__namespace.markCodCollected(
      requireSession(),
      id,
      input
    )
  );
  handle(
    "sales:collectCreditPayment",
    async ({ id, ...input }) => core__namespace.collectCreditPayment(
      requireSession(),
      id
    )
  );
  handle(
    "sales:void",
    async ({ id, reason }) => core__namespace.voidSale(
      requireSession(),
      id,
      reason
    )
  );
  handle(
    "sales:get",
    async ({ id }) => core__namespace.getSaleWithDetails(id)
  );
  handle(
    "sales:list",
    async (filters) => core__namespace.listSales(filters ?? {})
  );
  handle(
    "returns:create",
    async (input) => core__namespace.createReturn(
      requireSession(),
      input
    )
  );
  handle(
    "returns:list",
    async () => core__namespace.listReturns()
  );
  handle(
    "employees:list",
    async ({ includeInactive } = {}) => core__namespace.listEmployees(includeInactive)
  );
  handle(
    "employees:create",
    async (input) => core__namespace.createEmployee(
      requireSession(),
      input
    )
  );
  handle(
    "employees:update",
    async ({ id, ...input }) => core__namespace.updateEmployee(
      requireSession(),
      id,
      input
    )
  );
  handle(
    "employees:setStatus",
    async ({ id, status }) => core__namespace.setEmployeeStatus(
      requireSession(),
      id,
      status
    )
  );
  handle(
    "salaries:pay",
    async (input) => core__namespace.paySalary(
      requireSession(),
      input
    )
  );
  handle(
    "salaries:list",
    async ({ employeeId } = {}) => core__namespace.listSalaries(employeeId)
  );
  handle(
    "expenses:categories:list",
    async ({ includeArchived } = {}) => core__namespace.listExpenseCategories(
      includeArchived
    )
  );
  handle(
    "expenses:categories:create",
    async ({ name }) => core__namespace.createExpenseCategory(
      requireSession(),
      name
    )
  );
  handle(
    "expenses:create",
    async (input) => core__namespace.createExpense(
      requireSession(),
      input
    )
  );
  handle(
    "expenses:void",
    async ({ id, reason }) => core__namespace.voidExpense(
      requireSession(),
      id,
      reason
    )
  );
  handle(
    "expenses:list",
    async (filters) => core__namespace.listExpenses(
      filters ?? {}
    )
  );
  handle(
    "dashboard:summary",
    async (payload) => {
      const from = payload?.from ? new Date(payload.from) : void 0;
      const to = payload?.to ? new Date(payload.to) : void 0;
      return core__namespace.getDashboardSummary(
        from,
        to
      );
    }
  );
  handle(
    "dashboard:salesTrend",
    async ({ days } = {}) => core__namespace.getSalesTrend(days)
  );
  handle(
    "dashboard:topProducts",
    async ({
      limit,
      from,
      to
    } = {}) => core__namespace.getTopProducts(
      limit,
      from ? new Date(from) : void 0,
      to ? new Date(to) : void 0
    )
  );
  handle(
    "reports:dailyClosing:generate",
    async ({ date }) => core__namespace.generateDailyClosing(
      requireSession(),
      new Date(date)
    )
  );
  handle(
    "reports:dailyClosing:list",
    async () => core__namespace.listDailyClosings()
  );
  handle(
    "notifications:list",
    async ({ onlyUnread } = {}) => core__namespace.listNotifications(
      onlyUnread
    )
  );
  handle(
    "notifications:markRead",
    async ({ id }) => core__namespace.markNotificationRead(id)
  );
  handle(
    "notifications:refresh",
    async () => core__namespace.refreshNotifications()
  );
  handle(
    "system:reset",
    async ({
      password,
      confirmation
    }) => core__namespace.resetBusinessData(
      requireSession(),
      password,
      confirmation
    )
  );
  handle(
    "backup:list",
    async () => core__namespace.listBackups()
  );
  handle(
    "backup:create",
    async ({
      dbFilePath,
      backupsDir,
      notes
    }) => core__namespace.createBackup(
      requireSession(),
      dbFilePath,
      backupsDir,
      notes
    )
  );
  handle(
    "backup:restore",
    async ({
      backupId,
      dbFilePath
    }) => core__namespace.restoreBackup(
      requireSession(),
      backupId,
      dbFilePath
    )
  );
  handle(
    "sync:status",
    async () => core__namespace.getSyncStatus()
  );
  handle(
    "sync:pendingCount",
    async () => core__namespace.getPendingSyncCount()
  );
  handle(
    "sync:run",
    async () => core__namespace.syncPendingChanges()
  );
  handle(
    "cash:create",
    async (input) => core__namespace.createCashTransaction(
      requireSession(),
      input
    )
  );
  handle(
    "cash:list",
    async (filters = {}) => core__namespace.listCashTransactions(
      requireSession(),
      filters.from ? new Date(filters.from) : void 0,
      filters.to ? new Date(filters.to) : void 0
    )
  );
  handle(
    "cash:balance",
    async () => core__namespace.getCashBalance(
      requireSession()
    )
  );
  handle(
    "bkash:create",
    async (input) => core__namespace.createBkashTransaction(
      requireSession(),
      input
    )
  );
  handle(
    "bkash:list",
    async (filters = {}) => core__namespace.listBkashTransactions(
      requireSession(),
      filters.from ? new Date(filters.from) : void 0,
      filters.to ? new Date(filters.to) : void 0
    )
  );
  handle(
    "bkash:balance",
    async () => core__namespace.getBkashBalance(
      requireSession()
    )
  );
}
exports.registerIpcHandlers = registerIpcHandlers;
