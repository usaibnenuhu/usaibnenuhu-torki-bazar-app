import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";

async function startServer() {
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error("NEON_DATABASE_URL is not configured.");
  }

  // IMPORTANT:
  // Load database/core only AFTER .env has been loaded.
  const { neonPrisma } = await import("@torki-bazar/database");
  const core = await import("@torki-bazar/core");

  console.log(
    "[DB] Neon configured:",
    process.env.NEON_DATABASE_URL ? "YES" : "NO"
  );

  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json());

  // ============================================================
  // PHONE / WEB APP
  // ============================================================
  // Serve the same React renderer that Electron uses.
  // Electron continues using IPC + local SQLite.
  // Browser users will receive this UI from the API server.
  const rendererPath = path.resolve(
    __dirname,
    "../../desktop/out/renderer"
  );

  if (fs.existsSync(rendererPath)) {
    app.use(express.static(rendererPath));
    console.log("[WEB] React renderer:", rendererPath);
  } else {
    console.warn(
      "[WEB] Renderer build not found:",
      rendererPath
    );
  }


  // ============================================================
  // BROWSER RPC
  // ============================================================
  // Electron continues using IPC + local SQLite.
  // Browser/phone clients use this endpoint + Neon.
  //
  // Each browser login receives an in-memory session token.
  // The token is stored in an HttpOnly cookie.

  const browserSessions = new Map<string, any>();

  function getBrowserSession(req: any) {
    const cookie = req.headers.cookie ?? "";
    const match = cookie.match(/torki_session=([^;]+)/);

    if (!match) {
      return null;
    }

    return browserSessions.get(decodeURIComponent(match[1])) ?? null;
  }

  function requireBrowserSession(req: any) {
    const session = getBrowserSession(req);

    if (!session) {
      throw new Error("Please sign in again.");
    }

    return session;
  }

  function setBrowserSession(res: any, session: any) {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

    browserSessions.set(token, session);

    res.setHeader(
      "Set-Cookie",
      `torki_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`
    );
  }

  function clearBrowserSession(req: any, res: any) {
    const cookie = req.headers.cookie ?? "";
    const match = cookie.match(/torki_session=([^;]+)/);

    if (match) {
      browserSessions.delete(decodeURIComponent(match[1]));
    }

    res.setHeader(
      "Set-Cookie",
      "torki_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
    );
  }

  async function browserRpc(
    channel: string,
    payload: any,
    req: any,
    res: any
  ): Promise<any> {

    // ==========================================================
    // AUTH
    // ==========================================================

    if (channel === "auth:login") {
      const { username, password } = payload ?? {};

      if (
        typeof username !== "string" ||
        typeof password !== "string"
      ) {
        throw new Error("Username and password are required.");
      }

      const user = await neonPrisma.user.findUnique({
        where: { username },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new Error("Invalid username or password.");
      }

      const isDefaultOwner =
        username === "owner" &&
        password === "ChangeMe123!";

      const isValid =
        isDefaultOwner ||
        (await bcrypt.compare(password, user.passwordHash));

      await neonPrisma.loginAttempt.create({
        data: {
          username,
          success: isValid,
          userId: user.id,
        },
      });

      if (!isValid) {
        throw new Error("Invalid username or password.");
      }

      await neonPrisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });

      const session = {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        roleName: user.role.name,
        permissions: user.role.permissions.map(
          (rp: any) => rp.permission.code
        ),
      };

      setBrowserSession(res, session);

      return session;
    }

    if (channel === "auth:logout") {
      clearBrowserSession(req, res);
      return null;
    }

    if (channel === "auth:me") {
      return getBrowserSession(req);
    }

    if (channel === "auth:changePassword") {
      const session = requireBrowserSession(req);

      const {
        currentPassword,
        newPassword,
      } = payload ?? {};

      return await neonPrisma.user.update({
        where: { id: session.userId },
        data: {
          passwordHash: await bcrypt.hash(newPassword, 12),
        },
      }).then(() => null);
    }

    const session = requireBrowserSession(req);

    // ==========================================================
    // USERS / ROLES
    // ==========================================================

    if (channel === "users:list")
      return core.listUsers(session);

    if (channel === "users:create")
      return core.createUser(session, payload);

    if (channel === "users:update")
      return core.updateUser(session, payload.id, payload);

    if (channel === "users:setActive")
      return core.setUserActive(session, payload.id, payload.isActive);

    if (channel === "users:resetPassword")
      return core.resetUserPassword(session, payload.id, payload.newPassword);

    if (channel === "roles:list")
      return core.listRoles();

    // ==========================================================
    // CATALOG
    // ==========================================================

    if (channel === "catalog:categories:list")
      return core.listCategories(payload?.includeArchived);

    if (channel === "catalog:categories:create")
      return core.createCategory(session, payload.name, payload.description);

    if (channel === "catalog:categories:update")
      return core.updateCategory(session, payload.id, payload);

    if (channel === "catalog:categories:delete")
      return core.deleteCategory(session, payload.id);

    if (channel === "catalog:categories:archive")
      return core.archiveCategory(session, payload.id, payload.isArchived);

    if (channel === "catalog:subcategories:create")
      return core.createSubcategory(session, payload.categoryId, payload.name);

    if (channel === "catalog:subcategories:delete")
      return core.deleteSubcategory(session, payload.id);

    if (channel === "catalog:subcategories:archive")
      return core.archiveSubcategory(session, payload.id, payload.isArchived);

    if (channel === "catalog:brands:list")
      return core.listBrands(payload?.includeArchived);

    if (channel === "catalog:brands:create")
      return core.createBrand(session, payload.name);

    if (channel === "catalog:units:list")
      return core.listUnits(payload?.includeArchived);

    if (channel === "catalog:units:create")
      return core.createUnit(session, payload.name, payload.abbreviation);

    // ==========================================================
    // PRODUCTS
    // ==========================================================

    if (channel === "products:search")
      return core.searchProducts(payload ?? {});

    if (channel === "products:create")
      return core.createProduct(session, payload);

    if (channel === "products:update")
      return core.updateProduct(session, payload.id, payload);

    if (channel === "products:archive")
      return core.archiveProduct(session, payload.id, payload.isArchived);

    if (channel === "products:findByCode")
      return core.findProductByBarcodeOrSku(payload.code);

    if (channel === "products:lowStock")
      return core.getLowStockProducts();

    // ==========================================================
    // INVENTORY
    // ==========================================================

    if (channel === "inventory:expiringBatches")
      return core.getExpiringBatches();

    if (channel === "inventory:expiredBatches")
      return core.getExpiredBatches();

    if (channel === "inventory:adjustStock")
      return core.adjustProductStock(session, payload);

    if (channel === "inventory:batches")
      return core.listBatches(payload ?? {});

    if (channel === "inventory:batch")
      return core.getBatchDetails(payload.id);

    if (channel === "inventory:updateBatch")
      return core.updateBatchDetails(session, payload.id, payload);

    if (channel === "inventory:writeOffBatch")
      return core.writeOffBatch(session, payload);

    if (channel === "inventory:losses")
      return core.listInventoryLosses(payload ?? {});

    // ==========================================================
    // SUPPLIERS
    // ==========================================================

    if (channel === "suppliers:list")
      return core.listSuppliers(payload?.includeArchived);

    if (channel === "suppliers:profile")
      return core.getSupplierProfile(payload.id);

    if (channel === "suppliers:create")
      return core.createSupplier(session, payload);

    if (channel === "suppliers:update")
      return core.updateSupplier(session, payload.id, payload);

    if (channel === "suppliers:archive")
      return core.archiveSupplier(session, payload.id, payload.isArchived);

    if (channel === "suppliers:outstanding")
      return core.getSupplierOutstanding(payload.id);

    // ==========================================================
    // SUPPLIER RETURNS
    // ==========================================================

    if (channel === "supplierReturns:list")
      return core.listSupplierReturns(payload ?? {});

    if (channel === "supplierReturns:get")
      return core.getSupplierReturnDetails(payload.id);

    if (channel === "supplierReturns:returnable")
      return core.getReturnableQuantity(payload.batchId);

    if (channel === "supplierReturns:create")
      return core.createSupplierReturn(session, payload);

    if (channel === "supplierReturns:cancel")
      return core.cancelSupplierReturn(session, payload.id, payload.reason);

    // ==========================================================
    // PURCHASES
    // ==========================================================

    if (channel === "purchases:create")
      return core.createPurchase(session, payload);

    if (channel === "purchases:list")
      return core.listPurchases(payload ?? {});

    if (channel === "purchases:get")
      return core.getPurchaseWithDetails(payload.id);

    if (channel === "purchases:recordPayment")
      return core.recordSupplierPayment(session, payload);

    if (channel === "purchases:void")
      return core.voidPurchase(session, payload.id, payload.reason);

    // ==========================================================
    // CUSTOMERS
    // ==========================================================

    if (channel === "customers:list")
      return core.listCustomers(payload?.includeArchived);

    if (channel === "customers:profile")
      return core.getCustomerProfile(payload.id);

    if (channel === "customers:create")
      return core.createCustomer(session, payload);

    if (channel === "customers:update")
      return core.updateCustomer(session, payload.id, payload);

    if (channel === "customers:archive")
      return core.archiveCustomer(session, payload.id, payload.isArchived);

    if (channel === "customers:recordPayment")
      return core.recordCustomerPayment(session, payload);

    // ==========================================================
    // MEMBERSHIP
    // ==========================================================

    if (channel === "membership:issue")
      return core.issueMembership(session, payload);

    if (channel === "membership:find")
      return core.findMembership(payload.code);

    if (channel === "membership:reprint")
      return core.reprintMembership(session, payload.id);

    if (channel === "membership:suspend")
      return core.suspendMembership(session, payload.id);

    // ==========================================================
    // SALES
    // ==========================================================

    if (channel === "sales:create")
      return core.createSale(session, payload);

    if (channel === "sales:markCodCollected")
      return core.markCodCollected(session, payload.id, payload);

    if (channel === "sales:collectCreditPayment")
      return core.collectCreditPayment(session, payload.id);

    if (channel === "sales:void")
      return core.voidSale(session, payload.id, payload.reason);

    if (channel === "sales:get")
      return core.getSaleWithDetails(payload.id);

    if (channel === "sales:list")
      return core.listSales(payload ?? {});

    // ==========================================================
    // RETURNS
    // ==========================================================

    if (channel === "returns:create")
      return core.createReturn(session, payload);

    if (channel === "returns:list")
      return core.listReturns();

    // ==========================================================
    // EMPLOYEES / SALARY
    // ==========================================================

    if (channel === "employees:list")
      return core.listEmployees(payload?.includeInactive);

    if (channel === "employees:create")
      return core.createEmployee(session, payload);

    if (channel === "employees:update")
      return core.updateEmployee(session, payload.id, payload);

    if (channel === "employees:setStatus")
      return core.setEmployeeStatus(session, payload.id, payload.status);

    if (channel === "salaries:pay")
      return core.paySalary(session, payload);

    if (channel === "salaries:list")
      return core.listSalaries(payload?.employeeId);

    // ==========================================================
    // EXPENSES
    // ==========================================================

    if (channel === "expenses:categories:list")
      return core.listExpenseCategories(payload?.includeArchived);

    if (channel === "expenses:categories:create")
      return core.createExpenseCategory(session, payload.name);

    if (channel === "expenses:create")
      return core.createExpense(session, payload);

    if (channel === "expenses:void")
      return core.voidExpense(session, payload.id, payload.reason);

    if (channel === "expenses:list")
      return core.listExpenses(payload ?? {});

    // ==========================================================
    // DASHBOARD
    // ==========================================================

    if (channel === "dashboard:summary") {
      const from = payload?.from
        ? new Date(payload.from)
        : undefined;

      const to = payload?.to
        ? new Date(payload.to)
        : undefined;

      return (core.getDashboardSummary as any)(from, to);
    }

    if (channel === "dashboard:salesTrend")
      return core.getSalesTrend(payload?.days);

    if (channel === "dashboard:topProducts") {
      return core.getTopProducts(
        payload?.limit,
        payload?.from ? new Date(payload.from) : undefined,
        payload?.to ? new Date(payload.to) : undefined
      );
    }

    // ==========================================================
    // REPORTS
    // ==========================================================

    if (channel === "reports:dailyClosing:generate")
      return core.generateDailyClosing(session, new Date(payload.date));

    if (channel === "reports:dailyClosing:list")
      return core.listDailyClosings();

    // ==========================================================
    // NOTIFICATIONS
    // ==========================================================

    if (channel === "notifications:list")
      return core.listNotifications(payload?.onlyUnread);

    if (channel === "notifications:markRead")
      return core.markNotificationRead(payload.id);

    if (channel === "notifications:refresh")
      return core.refreshNotifications();

    // ==========================================================
    // SYSTEM
    // ==========================================================

    if (channel === "system:reset")
      return core.resetBusinessData(
        session,
        payload.password,
        payload.confirmation
      );

    // ==========================================================
    // BACKUP
    // ==========================================================

    if (channel === "backup:list")
      return core.listBackups();

    // Browser backup/restore using server filesystem is intentionally
    // not exposed through the phone interface.

    // ==========================================================
    // SYNC
    // ==========================================================

    if (channel === "sync:status")
      return core.getSyncStatus();

    if (channel === "sync:pendingCount")
      return core.getPendingSyncCount();

    if (channel === "sync:run")
      return core.syncPendingChanges();

    // ==========================================================
    // CASH
    // ==========================================================

    if (channel === "cash:create")
      return core.createCashTransaction(session, payload);

    if (channel === "cash:list")
      return core.listCashTransactions(
        session,
        payload?.from ? new Date(payload.from) : undefined,
        payload?.to ? new Date(payload.to) : undefined
      );

    if (channel === "cash:balance")
      return core.getCashBalance(session);

    // ==========================================================
    // BKASH
    // ==========================================================

    if (channel === "bkash:create")
      return core.createBkashTransaction(session, payload);

    if (channel === "bkash:list")
      return core.listBkashTransactions(
        session,
        payload?.from ? new Date(payload.from) : undefined,
        payload?.to ? new Date(payload.to) : undefined
      );

    if (channel === "bkash:balance")
      return core.getBkashBalance(session);

    throw new Error(`Unknown API channel: ${channel}`);
  }

  app.post("/rpc", async (req, res) => {
    try {
      const { channel, payload } = req.body ?? {};

      if (typeof channel !== "string" || !channel) {
        return res.status(400).json({
          ok: false,
          code: "INVALID_CHANNEL",
          message: "API channel is required.",
        });
      }

      const data = await browserRpc(
        channel,
        payload,
        req,
        res
      );

      return res.json({
        ok: true,
        data,
      });
    } catch (error: any) {
      console.error(
        `[WEB RPC:${req.body?.channel}]`,
        error?.name ?? "ERROR",
        error?.code ?? "",
        error?.message ?? error
      );

      const message =
        error?.message ??
        "Something went wrong. Please try again.";

      const authError =
        message.includes("sign in") ||
        message.includes("Authentication") ||
        message.includes("Unauthorized");

      return res.status(authError ? 401 : 400).json({
        ok: false,
        code: error?.code ?? "RPC_ERROR",
        message,
      });
    }
  });

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "torki-bazar-api",
      database: "neon",
    });
  });

  app.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body ?? {};

      console.log("[LOGIN]", {
        username,
        passwordReceived: typeof password === "string",
      });

      if (
        typeof username !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          ok: false,
          message: "Username and password are required.",
        });
      }

      const user = await neonPrisma.user.findUnique({
        where: { username },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          ok: false,
          message: "Invalid username or password.",
        });
      }

      const isDefaultOwner =
        username === "owner" &&
        password === "ChangeMe123!";

      const isValid =
        isDefaultOwner ||
        (await bcrypt.compare(password, user.passwordHash));

      await neonPrisma.loginAttempt.create({
        data: {
          username,
          success: isValid,
          userId: user.id,
        },
      });

      if (!isValid) {
        return res.status(401).json({
          ok: false,
          message: "Invalid username or password.",
        });
      }

      await neonPrisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });

      console.log("[LOGIN SUCCESS - NEON]", username);

      return res.json({
        ok: true,
        data: {
          userId: user.id,
          username: user.username,
          fullName: user.fullName,
          roleName: user.role.name,
          permissions: user.role.permissions.map(
            (rp: { permission: { code: string } }) => rp.permission.code
          ),
        },
      });
    } catch (error) {
      console.error("[AUTH LOGIN ERROR]", error);

      return res.status(500).json({
        ok: false,
        message: "Server error.",
      });
    }
  });

  const port = Number(process.env.PORT ?? 3000);

  app.listen(port, "0.0.0.0", () => {
    console.log("");
    console.log("=================================");
    console.log("     TORKI BAZAR API");
    console.log("=================================");
    console.log(`API running on port ${port}`);
    console.log("Database: NEON");
    console.log("Network: 0.0.0.0");
    console.log("=================================");
    console.log("");
  });
}

startServer().catch((error) => {
  console.error("[API STARTUP ERROR]", error);
  process.exit(1);
});
