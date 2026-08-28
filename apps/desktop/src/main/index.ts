import { app, BrowserWindow, dialog, shell } from "electron";
import path from "node:path";
import fs from "node:fs";

const isDev = !app.isPackaged;

function resolveDatabasePath(): string {
  const userDataDir = app.getPath("userData");

  fs.mkdirSync(userDataDir, {
    recursive: true,
  });

  return path.join(userDataDir, "torki-bazar.db");
}

function initializeProductionDatabase(): string {
  const databasePath = resolveDatabasePath();

  const templatePath = path.join(
    process.resourcesPath,
    "database",
    "torki-bazar-template.db"
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Production database template is missing: ${templatePath}`
    );
  }

  /*
   * A packaged Windows installation may already have created
   * torki-bazar.db before the database template was available.
   *
   * Do NOT blindly accept an existing database. Verify that it
   * contains the Prisma User table required for login.
   */

  if (fs.existsSync(databasePath)) {
    const header = Buffer.alloc(100);

    let hasValidSQLiteHeader = false;

    try {
      const fd = fs.openSync(databasePath, "r");

      try {
        fs.readSync(fd, header, 0, 100, 0);
      } finally {
        fs.closeSync(fd);
      }

      hasValidSQLiteHeader =
        header.subarray(0, 16).toString("utf8") ===
        "SQLite format 3\u0000";
    } catch (error) {
      console.error(
        "[main] Could not inspect existing database:",
        error
      );
    }

    if (hasValidSQLiteHeader) {
      /*
       * SQLite schema text is stored inside the database.
       * Check for the Prisma User table before accepting it.
       */
      let databaseText = "";

      try {
        databaseText = fs.readFileSync(
          databasePath,
          "latin1"
        );
      } catch (error) {
        console.error(
          "[main] Could not read existing database:",
          error
        );
      }

      const hasUserTable =
        databaseText.includes("CREATE TABLE User") ||
        databaseText.includes("CREATE TABLE \"User\"") ||
        databaseText.includes("CREATE TABLE main.User") ||
        databaseText.includes("CREATE TABLE \"main\".\"User\"");

      /*
       * Check sellingPrice specifically inside ProductBatch.
       *
       * Do not search the entire SQLite database for "sellingPrice",
       * because Product also has a sellingPrice column.
       */
      const productBatchTableMatch = databaseText.match(
        /CREATE TABLE\s+(?:"main"\.)?"ProductBatch"\s*\((.*?)\)\s*(?:;|$)/is
      );

      const hasProductBatchSellingPrice =
        !!productBatchTableMatch &&
        /"sellingPrice"\s+(?:DECIMAL|NUMERIC|REAL)/i.test(
          productBatchTableMatch[1]
        );

      if (hasUserTable && hasProductBatchSellingPrice) {
        console.log(
          `[main] Existing valid local database found: ${databasePath}`
        );

        return databasePath;
      }

      if (!hasUserTable) {
        console.warn(
          "[main] Existing local database is missing the User table."
        );
      }

      if (!hasProductBatchSellingPrice) {
        console.warn(
          "[main] Existing local database is missing ProductBatch.sellingPrice."
        );
      }
    } else {
      console.warn(
        "[main] Existing local database is not a valid SQLite database."
      );
    }

    /*
     * Keep the broken database as a backup before replacing it.
     */
    const backupPath =
      `${databasePath}.invalid-${Date.now()}`;

    try {
      fs.renameSync(
        databasePath,
        backupPath
      );

      console.log(
        `[main] Invalid database moved to: ${backupPath}`
      );
    } catch (error) {
      throw new Error(
        `Existing local database is invalid and could not be moved: ${String(error)}`
      );
    }
  }

  fs.copyFileSync(
    templatePath,
    databasePath
  );

  console.log(
    `[main] Initialized local database from template: ${databasePath}`
  );

  return databasePath;
}

function loadDevelopmentNeonUrl() {
  if (process.env.NEON_DATABASE_URL) return;

  const databaseEnvPath = path.resolve(
    __dirname,
    "../../../../apps/api/.env"
  );

  if (!fs.existsSync(databaseEnvPath)) return;

  const envFile = fs.readFileSync(databaseEnvPath, "utf8");

  const match = envFile.match(
    /^NEON_DATABASE_URL=(?:"([^"]+)"|'([^']+)'|([^\n]+))$/m
  );

  process.env.NEON_DATABASE_URL =
    match?.[1] ??
    match?.[2] ??
    match?.[3]?.trim();
}

async function bootstrap() {
  /*
   * Torki Bazar is offline-first.
   *
   * Both development and packaged Windows installations
   * use a local SQLite database.
   *
   * Neon is used by the sync engine for cloud synchronization.
   */

  const localDatabasePath = isDev
    ? path.resolve(
        __dirname,
        "../../../../packages/database/prisma/dev.db"
      )
    : initializeProductionDatabase();

  process.env.DATABASE_URL ||= `file:${localDatabasePath}`;

  if (isDev) {
    loadDevelopmentNeonUrl();

    if (!process.env.NEON_DATABASE_URL) {
      console.error("[main] NEON_DATABASE_URL is not configured.");

      dialog.showErrorBox(
        "Neon sync configuration missing",
        "NEON_DATABASE_URL could not be loaded.\n\nPlease configure it in apps/api/.env."
      );

      app.quit();
      return;
    }
  }

  process.env.NODE_ENV ||= isDev
    ? "development"
    : "production";

  console.log(
    `[main] Local SQLite configured: ${localDatabasePath}`
  );

  if (process.env.NEON_DATABASE_URL) {
    console.log("[main] Neon sync database configured.");
  } else {
    console.log(
      "[main] Neon URL is not exposed to the desktop process at startup."
    );
  }

  const { registerIpcHandlers } =
    await import("./ipc");

  registerIpcHandlers();

  createWindow();

  if (!isDev && process.platform === "win32") {
    setupAutoUpdater();
  }
}

async function setupAutoUpdater() {
  try {
    const { autoUpdater } =
      await import("electron-updater");

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("checking-for-update", () => {
      console.log("[updater] Checking for updates...");
    });

    autoUpdater.on("update-available", (info) => {
      console.log(
        `[updater] Update available: ${info.version}`
      );
    });

    autoUpdater.on("update-not-available", () => {
      console.log("[updater] Application is up to date.");
    });

    autoUpdater.on("download-progress", (progress) => {
      console.log(
        `[updater] Download progress: ${Math.round(
          progress.percent
        )}%`
      );
    });

    autoUpdater.on("update-downloaded", (info) => {
      console.log(
        `[updater] Update downloaded: ${info.version}. It will install when the application exits.`
      );
    });

    autoUpdater.on("error", (error) => {
      console.error("[updater] Update error:", error);
    });

    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error(
      "[updater] Failed to initialize updater:",
      error
    );
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#f4faf6",

    webPreferences: {
      preload: path.join(
        __dirname,
        "../preload/index.js"
      ),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);

    return {
      action: "deny",
    };
  });

  if (isDev) {
    win.webContents.on(
      "console-message",
      (
        _event,
        _level,
        message,
        line,
        sourceId
      ) => {
        console.log(
          `[renderer] ${message} (${sourceId}:${line})`
        );
      }
    );

    win.webContents.on(
      "preload-error",
      (
        _event,
        preloadPath,
        error
      ) => {
        console.error(
          `[preload-error] ${preloadPath}`,
          error
        );
      }
    );
  }

  if (
    isDev &&
    process.env["ELECTRON_RENDERER_URL"]
  ) {
    win.loadURL(
      process.env["ELECTRON_RENDERER_URL"]
    );
  } else {
    win.loadFile(
      path.join(
        __dirname,
        "../renderer/index.html"
      )
    );
  }
}

app.whenReady()
  .then(bootstrap)
  .catch((error) => {
    console.error(
      "[main] bootstrap failed",
      error
    );

    dialog.showErrorBox(
      "Torki Bazar failed to start",
      String(
        error?.stack ??
        error
      )
    );

    app.quit();
  });

app.on(
  "window-all-closed",
  () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }
);

app.on(
  "activate",
  () => {
    if (
      BrowserWindow.getAllWindows()
        .length === 0
    ) {
      createWindow();
    }
  }
);
