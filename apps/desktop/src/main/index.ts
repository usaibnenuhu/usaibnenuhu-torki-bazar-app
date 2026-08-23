import { app, BrowserWindow, dialog, shell } from "electron";
import path from "node:path";
import fs from "node:fs";

const isDev = !app.isPackaged;

/**
 * Local SQLite database path.
 *
 * This is kept only for development/fallback purposes.
 * Production will use DATABASE_URL from the environment.
 */
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

async function bootstrap() {
  /*
   * DATABASE CONFIGURATION
   *
   * DEVELOPMENT:
   * Electron uses the project's local SQLite database:
   *
   * packages/database/prisma/dev.db
   *
   * PRODUCTION:
   * Electron MUST receive DATABASE_URL from the
   * environment. This will be your Neon PostgreSQL
   * connection.
   *
   * We intentionally do NOT hard-code the Neon
   * username/password in this source file.
   */

  if (isDev) {
    process.env.DATABASE_URL ||= `file:${path.resolve(
      __dirname,
      "../../../../packages/database/prisma/dev.db"
    )}`;

    /*
     * Load the Neon connection string during development.
     *
     * The local SQLite database remains the primary/local DB.
     * NEON_DATABASE_URL is used only by the sync engine to
     * upload pending changes to Neon.
     */
    if (!process.env.NEON_DATABASE_URL) {
      const databaseEnvPath = path.resolve(
        __dirname,
        "../../../../apps/api/.env"
      );

      if (fs.existsSync(databaseEnvPath)) {
        const envFile = fs.readFileSync(
          databaseEnvPath,
          "utf8"
        );

        const match = envFile.match(
          /^NEON_DATABASE_URL=(?:"([^"]+)"|'([^']+)'|([^\n]+))$/m
        );

        process.env.NEON_DATABASE_URL =
          match?.[1] ??
          match?.[2] ??
          match?.[3]?.trim();
      }
    }

    if (!process.env.NEON_DATABASE_URL) {
      console.error(
        "[main] NEON_DATABASE_URL is not configured."
      );

      dialog.showErrorBox(
        "Neon sync configuration missing",
        "NEON_DATABASE_URL could not be loaded.\n\nPlease configure it in packages/database/.env."
      );

      app.quit();
      return;
    }

    console.log(
      "[main] Local SQLite configured."
    );

    console.log(
      "[main] Neon sync database configured."
    );
  } else {
    if (!process.env.DATABASE_URL) {
      console.error(
        "[main] DATABASE_URL is not configured."
      );

      dialog.showErrorBox(
        "Database configuration missing",
        "DATABASE_URL is not configured for the production application.\n\nPlease configure the production database connection before starting Torki Bazar."
      );

      app.quit();
      return;
    }

    console.log(
      "[main] Production database configured."
    );
  }

  /*
   * Set NODE_ENV before importing the database/core
   * layer because Prisma is initialized there.
   */
  process.env.NODE_ENV ||= isDev
    ? "development"
    : "production";

  /*
   * IMPORTANT:
   *
   * Do not import ./ipc at the top of this file.
   *
   * We intentionally import it only AFTER DATABASE_URL
   * has been configured.
   *
   * This guarantees that the PrismaClient singleton
   * sees the correct DATABASE_URL when it is created.
   */
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