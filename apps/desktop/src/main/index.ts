import { app, BrowserWindow, dialog, shell } from "electron";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const isDev = !app.isPackaged;

/**
 * Local SQLite database path.
 *
 * This is kept only for development/fallback purposes.
 * Production will use DATABASE_URL from the environment.
 */

function loadNeonDatabaseUrl(): void {
  if (process.env.NEON_DATABASE_URL) {
    return;
  }

  const candidates = [
    // Packaged Windows installer:
    path.join(process.resourcesPath, "neon-config.json"),

    // Development:
    path.resolve(
      __dirname,
      "../../../../apps/api/.env"
    ),

    path.resolve(
      __dirname,
      "../../../../packages/database/.env"
    ),
  ];

  for (const configPath of candidates) {
    if (!fs.existsSync(configPath)) {
      continue;
    }

    try {
      const raw = fs.readFileSync(configPath, "utf8").trim();

      // JSON configuration used by packaged production builds.
      if (configPath.endsWith(".json")) {
        const config = JSON.parse(raw);

        if (
          typeof config.NEON_DATABASE_URL === "string" &&
          config.NEON_DATABASE_URL.trim()
        ) {
          process.env.NEON_DATABASE_URL =
            config.NEON_DATABASE_URL.trim();

          return;
        }
      }

      // .env configuration used during development.
      const match = raw.match(
        /^NEON_DATABASE_URL=(?:"([^"]+)"|'([^']+)'|([^\n]+))$/m
      );

      const value =
        match?.[1] ??
        match?.[2] ??
        match?.[3]?.trim();

      if (value) {
        process.env.NEON_DATABASE_URL = value;
        return;
      }
    } catch (error) {
      console.error(
        `[main] Failed to load Neon configuration from ${configPath}:`,
        error
      );
    }
  }
}

function resolveDatabasePath(): string {
  const userDataDir = app.getPath("userData");

  fs.mkdirSync(userDataDir, {
    recursive: true,
  });

  return path.join(
    userDataDir,
    "torki-bazar.db"
  );
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

  if (!fs.existsSync(databasePath)) {
    fs.copyFileSync(
      templatePath,
      databasePath
    );

    console.log(
      `[main] Created local database from template: ${databasePath}`
    );

    return databasePath;
  }

  console.log(
    `[main] Existing local database found: ${databasePath}`
  );

  /*
   * IMPORTANT:
   * Existing Windows installations may contain an older SQLite
   * schema. The template database is only used when the database
   * does not exist, so existing installations must be migrated.
   *
   * The actual Prisma migration runs during bootstrap after
   * DATABASE_URL has been configured.
   */
  return databasePath;
}

async function bootstrap() {
  /*
   * TORKI BAZAR DATABASE ARCHITECTURE
   *
   * Local application data:
   *   SQLite
   *
   * Shared cloud data:
   *   Neon PostgreSQL
   *
   * Sync:
   *   SQLite -> Neon
   *   Neon   -> SQLite
   */

  const localDatabasePath = isDev
    ? path.resolve(
        __dirname,
        "../../../../packages/database/prisma/dev.db"
      )
    : initializeProductionDatabase();

  /*
   * Prisma/core MUST always use the local SQLite database.
   */
  /*
   * IMPORTANT:
   * The desktop application has TWO Prisma databases:
   *
   *   DATABASE_URL       -> local SQLite
   *   NEON_DATABASE_URL  -> shared cloud PostgreSQL
   *
   * Configure both BEFORE importing @torki-bazar/core.
   */
  process.env.DATABASE_URL = `file:${localDatabasePath}`;

  /*
   * IMPORTANT:
   * Older Windows installations may have a ProductBatch table
   * created before sellingPrice was added to the Prisma schema.
   *
   * Check and repair the existing SQLite schema before importing
   * IPC/core code that queries ProductBatch.
   *
   * This migration is additive only:
   *   - existing data is preserved
   *   - existing database is NOT replaced
   *   - sellingPrice defaults to 0
   *   - batch selling price 0 continues to fall back to Product
   *     selling price according to the existing business logic
   */
  try {
    const { prisma } =
      await import("@torki-bazar/database");

    const columns =
      await prisma.$queryRawUnsafe<Array<{ name: string }>>(
        `PRAGMA table_info("ProductBatch")`
      );

    const hasSellingPrice =
      columns.some(
        (column) => column.name === "sellingPrice"
      );

    if (!hasSellingPrice) {
      console.log(
        "[main] ProductBatch.sellingPrice is missing. Applying SQLite migration..."
      );

      await prisma.$executeRawUnsafe(
        `ALTER TABLE "ProductBatch" ADD COLUMN "sellingPrice" DECIMAL NOT NULL DEFAULT 0`
      );

      console.log(
        "[main] SQLite migration complete: ProductBatch.sellingPrice added."
      );
    } else {
      console.log(
        "[main] SQLite schema OK: ProductBatch.sellingPrice exists."
      );
    }
  } catch (error) {
    console.error(
      "[main] Failed to migrate local SQLite database:",
      error
    );

    throw error;
  }

  /*
   * Load the cloud database configuration before importing core.
   * Packaged Windows loads resources/neon-config.json.
   */
  loadNeonDatabaseUrl();

  if (!process.env.NEON_DATABASE_URL) {
    console.error(
      "[main] NEON_DATABASE_URL is not configured."
    );

    dialog.showErrorBox(
      "Cloud synchronization configuration missing",
      "Torki Bazar could not find its Neon cloud database configuration.\n\nPlease reinstall the current Torki Bazar installer."
    );

    app.quit();
    return;
  }

  process.env.NODE_ENV ||= isDev
    ? "development"
    : "production";

  console.log(
    `[main] Local SQLite configured: ${localDatabasePath}`
  );

  console.log(
    "[main] Neon cloud database configured."
  );

  /*
   * IMPORTANT:
   * IPC/core is imported only after BOTH database URLs
   * and NODE_ENV have been configured.
   */
  const { ensureLocalSchema } =
    await import("./ensureLocalSchema");

  await ensureLocalSchema();

  const { registerIpcHandlers } =
    await import("./ipc");

  registerIpcHandlers();

  createWindow();

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

  /*
   * Wait until the renderer is ready before showing
   * the window.
   */
  win.once(
    "ready-to-show",
    () => {
      win.show();
    }
  );

  /*
   * Open external links in the user's default browser.
   */
  win.webContents.setWindowOpenHandler(
    ({ url }) => {
      shell.openExternal(url);

      return {
        action: "deny",
      };
    }
  );

  /*
   * Development diagnostics.
   *
   * These are intentionally enabled only during
   * development.
   */
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

  /*
   * Development:
   *
   * electron-vite gives us ELECTRON_RENDERER_URL.
   *
   * Production:
   *
   * Load the bundled renderer HTML.
   */
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

/*
 * Start Electron only after Electron itself is ready.
 */
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

/*
 * macOS:
 * Keep the application running while the app is
 * still active.
 */
app.on(
  "window-all-closed",
  () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }
);

/*
 * macOS:
 * Re-create the window when the dock icon is clicked
 * and no windows are currently open.
 */
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