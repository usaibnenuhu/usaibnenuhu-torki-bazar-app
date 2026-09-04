import { ipcMain, app } from "electron";
import path from "node:path";
import { AppError } from "@torki-bazar/shared";
import * as core from "@torki-bazar/core";
import { getSession, requireSession, setSession } from "./session";
import { serialize } from "./serialize";
import { printPosReceipt } from "./receiptPrinter";
import {
  checkForDesktopUpdate,
  downloadDesktopUpdate,
  installDesktopUpdate,
  getDesktopUpdateState,
} from "./updater";

type Handler = (payload: any) => Promise<unknown>;

function handle(channel: string, fn: Handler) {
  ipcMain.handle(channel, async (_event, payload) => {
    try {
      const data = await fn(payload);
      return {
        ok: true as const,
        data: serialize(data),
      };
    } catch (error) {
      if (error instanceof AppError) {
        return {
          ok: false as const,
          code: error.code,
          message: error.message,
        };
      }

      console.error(`[IPC:${channel}]`, error);

      return {
        ok: false as const,
        code: "UNKNOWN",
        message:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  });
}

export function registerIpcHandlers() {
  handle(
    "receipt:print",
    async (input) => printPosReceipt(input)
  );

  // ============================================================
  // APPLICATION UPDATES
  // ============================================================

  handle(
    "app:update:version",
    async () => ({
      version: app.getVersion(),
    })
  );

  handle(
    "app:update:check",
    async () => {
      return checkForDesktopUpdate();
    }
  );

  handle(
    "app:update:download",
    async () => {
      return downloadDesktopUpdate();
    }
  );

  handle(
    "app:update:install",
    async () => {
      return installDesktopUpdate();
    }
  );

  handle(
    "app:update:state",
    async () => {
      return getDesktopUpdateState();
    }
  );

  // ============================================================
  // APP PATHS
  // ============================================================

  handle("app:paths", async () => {
    const url = process.env.DATABASE_URL ?? "";

    const dbFilePath = url.startsWith("file:")
      ? path.resolve(url.slice("file:".length))
      : url;

    const backupsDir = path.join(
      app.getPath("userData"),
      "backups"
    );

    return {
      dbFilePath,
      backupsDir,
    };
  });

  // ============================================================
  // AUTH
  // ============================================================

  handle(
    "auth:login",
    async ({ username, password }) => {
      const session = await core.login(
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
      await core.logout(session);
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
      newPassword,
    }) =>
      core.changePassword(
        requireSession(),
        currentPassword,
        newPassword
      )
  );

  // ============================================================
  // USERS & ROLES
  // ============================================================

  handle(
    "users:list",
    async () =>
      core.listUsers(requireSession())
  );

  handle(
    "users:create",
    async (input) =>
      core.createUser(
        requireSession(),
        input
      )
  );

  handle(
    "users:update",
    async ({ id, ...input }) =>
      core.updateUser(
        requireSession(),
        id,
        input
      )
  );

  handle(
    "users:setActive",
    async ({ id, isActive }) =>
      core.setUserActive(
        requireSession(),
        id,
        isActive
      )
  );

  handle(
    "users:resetPassword",
    async ({ id, newPassword }) =>
      core.resetUserPassword(
        requireSession(),
        id,
        newPassword
      )
  );

  handle(
    "roles:list",
    async () => core.listRoles()
  );

  // ============================================================
  // CATALOG
  // ============================================================

  handle(
    "catalog:categories:list",
    async ({ includeArchived } = {}) =>
      core.listCategories(includeArchived)
  );

  handle(
    "catalog:categories:create",
    async ({ name, description }) =>
      core.createCategory(
        requireSession(),
        name,
        description
      )
  );

  handle(
    "catalog:categories:update",
    async ({ id, ...data }) =>
      core.updateCategory(
        requireSession(),
        id,
        data
      )
  );

  // ============================================================
  // CATEGORY DELETE
  // ============================================================
  // This handler connects the Categories page
  // "catalog:categories:delete" call to the existing
  // core.deleteCategory() function.
  //
  // No core/database logic is changed here.

  handle(
    "catalog:categories:delete",
    async ({ id }) =>
      core.deleteCategory(
        requireSession(),
        id
      )
  );

  handle(
    "catalog:categories:archive",
    async ({ id, isArchived }) =>
      core.archiveCategory(
        requireSession(),
        id,
        isArchived
      )
  );

  handle(
    "catalog:subcategories:create",
    async ({ categoryId, name }) =>
      core.createSubcategory(
        requireSession(),
        categoryId,
        name
      )
  );

  handle(
    "catalog:subcategories:delete",
    async ({ id }) =>
      core.deleteSubcategory(
        requireSession(),
        id
      )
  );

  handle(
    "catalog:subcategories:archive",
    async ({ id, isArchived }) =>
      core.archiveSubcategory(
        requireSession(),
        id,
        isArchived
      )
  );

  handle(
    "catalog:brands:list",
    async ({ includeArchived } = {}) =>
      core.listBrands(includeArchived)
  );

  handle(
    "catalog:brands:create",
    async ({ name }) =>
      core.createBrand(
        requireSession(),
        name
      )
  );

  handle(
    "catalog:units:list",
    async ({ includeArchived } = {}) =>
      core.listUnits(includeArchived)
  );

  handle(
    "catalog:units:create",
    async ({ name, abbreviation }) =>
      core.createUnit(
        requireSession(),
        name,
        abbreviation
      )
  );

  // ============================================================
  // PRODUCTS
  // ============================================================

  handle(
    "products:search",
    async (options) =>
      core.searchProducts(options ?? {})
  );

  handle(
    "products:create",
    async (input) =>
      core.createProduct(
        requireSession(),
        input
      )
  );

  handle(
    "products:update",
    async ({ id, ...input }) =>
      core.updateProduct(
        requireSession(),
        id,
        input
      )
  );

  handle(
    "products:archive",
    async ({ id, isArchived }) =>
      core.archiveProduct(
        requireSession(),
        id,
        isArchived
      )
  );

  handle(
    "products:findByCode",
    async ({ code }) =>
      core.findProductByBarcodeOrSku(code)
  );

  handle(
    "products:lowStock",
    async () =>
      core.getLowStockProducts()
  );

  // ============================================================
  // INVENTORY
  // ============================================================

  handle(
    "inventory:expiringBatches",
    async () =>
      core.getExpiringBatches()
  );

  handle(
    "inventory:expiredBatches",
    async () =>
      core.getExpiredBatches()
  );

  handle(
    "inventory:adjustStock",
    async (input) =>
      core.adjustProductStock(
        requireSession(),
        input
      )
  );

  handle(
    "inventory:batches",
    async (filters) =>
      core.listBatches(filters ?? {})
  );

  handle(
    "inventory:batch",
    async ({ id }) =>
      core.getBatchDetails(id)
  );

  handle(
    "inventory:updateBatch",
    async ({ id, ...input }) =>
      core.updateBatchDetails(
        requireSession(),
        id,
        input
      )
  );

  handle(
    "inventory:writeOffBatch",
    async (input) =>
      core.writeOffBatch(
        requireSession(),
        input
      )
  );

  handle(
    "inventory:losses",
    async (filters) =>
      core.listInventoryLosses(
        filters ?? {}
      )
  );

  // ============================================================
  // SUPPLIERS
  // ============================================================

  handle(
    "suppliers:list",
    async ({ includeArchived } = {}) =>
      core.listSuppliers(includeArchived)
  );

  handle(
    "suppliers:profile",
    async ({ id }) =>
      core.getSupplierProfile(id)
  );

  handle(
    "suppliers:create",
    async (input) =>
      core.createSupplier(
        requireSession(),
        input
      )
  );

  handle(
    "suppliers:update",
    async ({ id, ...input }) =>
      core.updateSupplier(
        requireSession(),
        id,
        input
      )
  );

  handle(
    "suppliers:archive",
    async ({ id, isArchived }) =>
      core.archiveSupplier(
        requireSession(),
        id,
        isArchived
      )
  );

  handle(
    "suppliers:outstanding",
    async ({ id }) =>
      core.getSupplierOutstanding(id)
  );

  // ============================================================
  // SUPPLIER RETURNS
  // ============================================================

  handle(
    "supplierReturns:list",
    async (filters) =>
      core.listSupplierReturns(
        filters ?? {}
      )
  );

  handle(
    "supplierReturns:get",
    async ({ id }) =>
      core.getSupplierReturnDetails(id)
  );

  handle(
    "supplierReturns:returnable",
    async ({ batchId }) =>
      core.getReturnableQuantity(batchId)
  );

  handle(
    "supplierReturns:create",
    async (input) =>
      core.createSupplierReturn(
        requireSession(),
        input
      )
  );

  handle(
    "supplierReturns:cancel",
    async ({ id, reason }) =>
      core.cancelSupplierReturn(
        requireSession(),
        id,
        reason
      )
  );

  // ============================================================
  // PURCHASES
  // ============================================================

  handle(
    "purchases:create",
    async (input) =>
      core.createPurchase(
        requireSession(),
        input
      )
  );

  handle(
    "purchases:list",
    async (filters) =>
      core.listPurchases(
        filters ?? {}
      )
  );

  handle(
    "purchases:get",
    async ({ id }) =>
      core.getPurchaseWithDetails(id)
  );

  handle(
    "purchases:recordPayment",
    async (input) =>
      core.recordSupplierPayment(
        requireSession(),
        input
      )
  );

  handle(
    "purchases:void",
    async ({ id, reason }) =>
      core.voidPurchase(
        requireSession(),
        id,
        reason
      )
  );

  // ============================================================
  // CUSTOMERS
  // ============================================================

  handle(
    "customers:list",
    async ({ includeArchived } = {}) =>
      core.listCustomers(includeArchived)
  );

  handle(
    "customers:profile",
    async ({ id }) =>
      core.getCustomerProfile(id)
  );

  handle(
    "customers:create",
    async (input) =>
      core.createCustomer(
        requireSession(),
        input
      )
  );

  handle(
    "customers:update",
    async ({ id, ...input }) =>
      core.updateCustomer(
        requireSession(),
        id,
        input
      )
  );

  handle(
    "customers:archive",
    async ({ id, isArchived }) =>
      core.archiveCustomer(
        requireSession(),
        id,
        isArchived
      )
  );

  handle(
    "customers:recordPayment",
    async (input) =>
      core.recordCustomerPayment(
        requireSession(),
        input
      )
  );

  // ============================================================
  // MEMBERSHIP
  // ============================================================

  handle(
    "membership:issue",
    async (input) =>
      core.issueMembership(
        requireSession(),
        input
      )
  );

  handle(
    "membership:list",
    async () =>
      core.listMemberships(
        requireSession()
      )
  );

  handle(
    "membership:update",
    async ({ id, ...input }) =>
      core.updateMembership(
        requireSession(),
        id,
        input
      )
  );

  handle(
    "membership:delete",
    async ({ id }) =>
      core.deleteMembership(
        requireSession(),
        id
      )
  );

  handle(
    "membership:find",
    async ({ code }) =>
      core.findMembership(code)
  );

  handle(
    "membership:reprint",
    async ({ id }) =>
      core.reprintMembership(
        requireSession(),
        id
      )
  );

  handle(
    "membership:suspend",
    async ({ id }) =>
      core.suspendMembership(
        requireSession(),
        id
      )
  );

  // ============================================================
  // SALES / POS
  // ============================================================

  handle(
    "sales:create",
    async (input) =>
      core.createSale(
        requireSession(),
        input
      )
  );

  handle(
    "sales:markCodCollected",
    async ({ id, ...input }) =>
      core.markCodCollected(
        requireSession(),
        id,
        input
      )
  );

  // ============================================================
  // CREDIT PAYMENT COLLECTION
  // ============================================================

  handle(
    "sales:collectCreditPayment",
    async ({ id, ...input }) =>
      core.collectCreditPayment(
        requireSession(),
        id
      )
  );

  handle(
    "sales:void",
    async ({ id, reason }) =>
      core.voidSale(
        requireSession(),
        id,
        reason
      )
  );

  handle(
    "sales:get",
    async ({ id }) =>
      core.getSaleWithDetails(id)
  );

  handle(
    "sales:list",
    async (filters) =>
      core.listSales(filters ?? {})
  );

  // ============================================================
  // RETURNS
  // ============================================================

  handle(
    "returns:create",
    async (input) =>
      core.createReturn(
        requireSession(),
        input
      )
  );

  handle(
    "returns:list",
    async () =>
      core.listReturns()
  );

  // ============================================================
  // EMPLOYEES & SALARY
  // ============================================================

  handle(
    "employees:list",
    async ({ includeInactive } = {}) =>
      core.listEmployees(includeInactive)
  );

  handle(
    "employees:create",
    async (input) =>
      core.createEmployee(
        requireSession(),
        input
      )
  );

  handle(
    "employees:update",
    async ({ id, ...input }) =>
      core.updateEmployee(
        requireSession(),
        id,
        input
      )
  );

  handle(
    "employees:setStatus",
    async ({ id, status }) =>
      core.setEmployeeStatus(
        requireSession(),
        id,
        status
      )
  );

  handle(
    "salaries:pay",
    async (input) =>
      core.paySalary(
        requireSession(),
        input
      )
  );

  handle(
    "salaries:list",
    async ({ employeeId } = {}) =>
      core.listSalaries(employeeId)
  );

  // ============================================================
  // EXPENSES
  // ============================================================

  handle(
    "expenses:categories:list",
    async ({ includeArchived } = {}) =>
      core.listExpenseCategories(
        includeArchived
      )
  );

  handle(
    "expenses:categories:create",
    async ({ name }) =>
      core.createExpenseCategory(
        requireSession(),
        name
      )
  );

  handle(
    "expenses:create",
    async (input) =>
      core.createExpense(
        requireSession(),
        input
      )
  );

  handle(
    "expenses:void",
    async ({ id, reason }) =>
      core.voidExpense(
        requireSession(),
        id,
        reason
      )
  );

  handle(
    "expenses:list",
    async (filters) =>
      core.listExpenses(
        filters ?? {}
      )
  );

  // ============================================================
  // DASHBOARD & REPORTS
  // ============================================================

  handle(
    "dashboard:summary",
    async (payload) => {
      const from = payload?.from
        ? new Date(payload.from)
        : undefined;

      const to = payload?.to
        ? new Date(payload.to)
        : undefined;

      return (core.getDashboardSummary as any)(
        from,
        to
      );
    }
  );

  handle(
    "dashboard:salesTrend",
    async ({ days } = {}) =>
      core.getSalesTrend(days)
  );

  handle(
    "dashboard:topProducts",
    async ({
      limit,
      from,
      to,
    } = {}) =>
      core.getTopProducts(
        limit,
        from
          ? new Date(from)
          : undefined,
        to
          ? new Date(to)
          : undefined
      )
  );

  handle(
    "reports:dailyClosing:generate",
    async ({ date }) =>
      core.generateDailyClosing(
        requireSession(),
        new Date(date)
      )
  );

  handle(
    "reports:dailyClosing:list",
    async () =>
      core.listDailyClosings()
  );

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  handle(
    "notifications:list",
    async ({ onlyUnread } = {}) =>
      core.listNotifications(
        onlyUnread
      )
  );

  handle(
    "notifications:markRead",
    async ({ id }) =>
      core.markNotificationRead(id)
  );

  handle(
    "notifications:refresh",
    async () =>
      core.refreshNotifications()
  );

  // ============================================================
  // SYSTEM RESET
  // ============================================================

  handle(
    "system:reset",
    async ({
      password,
      confirmation,
    }) =>
      core.resetBusinessData(
        requireSession(),
        password,
        confirmation
      )
  );

  // ============================================================
  // BACKUP
  // ============================================================

  handle(
    "backup:list",
    async () =>
      core.listBackups()
  );

  handle(
    "backup:create",
    async ({
      dbFilePath,
      backupsDir,
      notes,
    }) =>
      core.createBackup(
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
      dbFilePath,
    }) =>
      core.restoreBackup(
        requireSession(),
        backupId,
        dbFilePath
      )
  );

  // ============================================================
  // SYNC STATUS
  // ============================================================

  handle(
    "sync:status",
    async () =>
      core.getSyncStatus()
  );

  handle(
    "sync:pendingCount",
    async () =>
      core.getPendingSyncCount()
  );

  handle(
    "sync:run",
    async () => {
      try {
        // Electron/SQLite -> Neon
        // PRODUCTION ARCHITECTURE:
        // Windows local SQLite -> Neon ONLY.
        //
        // Never pull Neon data back into the Windows/Mac local DB.
        // The online portal is a read-only view of Neon.
        const pushed = await core.syncPendingChanges();

        return {
          ...pushed,
          pulled: 0,
          error: null,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.stack || error.message
            : String(error);

        console.error("SYNC ERROR:", message);

        return {
          pulled: 0,
          synced: 0,
          failed: 1,
          pending: 0,
          error: message,
        };
      }
    }
  );

  // ============================================================
  // CASH MANAGEMENT
  // ============================================================

  handle(
    "cash:create",
    async (input) =>
      core.createCashTransaction(
        requireSession(),
        input
      )
  );

  handle(
    "cash:list",
    async (filters = {}) =>
      core.listCashTransactions(
        requireSession(),
        filters.from
          ? new Date(filters.from)
          : undefined,
        filters.to
          ? new Date(filters.to)
          : undefined
      )
  );

  handle(
    "cash:balance",
    async () =>
      core.getCashBalance(
        requireSession()
      )
  );

  // ============================================================
  // BANK MANAGEMENT
  // ============================================================

  handle(
    "bank:create",
    async (input) =>
      core.createBankTransaction(
        requireSession(),
        input
      )
  );

  handle(
    "bank:list",
    async (filters = {}) =>
      core.listBankTransactions(
        requireSession(),
        filters.from ? new Date(filters.from) : undefined,
        filters.to ? new Date(filters.to) : undefined
      )
  );

  handle(
    "bank:balance",
    async () =>
      core.getBankBalance(
        requireSession()
      )
  );

  // ============================================================
  // bKASH MANAGEMENT
  // ============================================================

  handle(
    "bkash:create",
    async (input) =>
      core.createBkashTransaction(
        requireSession(),
        input
      )
  );

  handle(
    "bkash:list",
    async (filters = {}) =>
      core.listBkashTransactions(
        requireSession(),
        filters.from
          ? new Date(filters.from)
          : undefined,
        filters.to
          ? new Date(filters.to)
          : undefined
      )
  );

  handle(
    "bkash:balance",
    async () =>
      core.getBkashBalance(
        requireSession()
      )
  );

  // ============================================================
  // BANK MANAGEMENT
  // ============================================================

  

  

  

  handle(
    "bank:transfer",
    async (input) =>
      core.transferFunds(
        requireSession(),
        input
      )
  );

}
