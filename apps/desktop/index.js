"use strict";
const electron = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const isDev = !electron.app.isPackaged;
function loadNeonDatabaseUrl() {
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
    )
  ];
  for (const configPath of candidates) {
    if (!fs.existsSync(configPath)) {
      continue;
    }
    try {
      const raw = fs.readFileSync(configPath, "utf8").trim();
      if (configPath.endsWith(".json")) {
        const config = JSON.parse(raw);
        if (typeof config.NEON_DATABASE_URL === "string" && config.NEON_DATABASE_URL.trim()) {
          process.env.NEON_DATABASE_URL = config.NEON_DATABASE_URL.trim();
          return;
        }
      }
      const match = raw.match(
        /^NEON_DATABASE_URL=(?:"([^"]+)"|'([^']+)'|([^\n]+))$/m
      );
      const value = match?.[1] ?? match?.[2] ?? match?.[3]?.trim();
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
function resolveDatabasePath() {
  const userDataDir = electron.app.getPath("userData");
  fs.mkdirSync(userDataDir, {
    recursive: true
  });
  return path.join(
    userDataDir,
    "torki-bazar.db"
  );
}
function initializeProductionDatabase() {
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
  return databasePath;
}
async function bootstrap() {
  const localDatabasePath = isDev ? path.resolve(
    __dirname,
    "../../../../packages/database/prisma/dev.db"
  ) : initializeProductionDatabase();
  process.env.DATABASE_URL = `file:${localDatabasePath}`;
  loadNeonDatabaseUrl();
  if (!process.env.NEON_DATABASE_URL) {
    console.error(
      "[main] NEON_DATABASE_URL is not configured."
    );
    electron.dialog.showErrorBox(
      "Cloud synchronization configuration missing",
      "Torki Bazar could not find its Neon cloud database configuration.\n\nPlease reinstall the current Torki Bazar installer."
    );
    electron.app.quit();
    return;
  }
  process.env.NODE_ENV ||= isDev ? "development" : "production";
  console.log(
    `[main] Local SQLite configured: ${localDatabasePath}`
  );
  console.log(
    "[main] Neon cloud database configured."
  );
  const { registerIpcHandlers } = await Promise.resolve().then(() => require("./chunks/ipc-CBbPBnKM.js"));
  registerIpcHandlers();
  createWindow();
}
function createWindow() {
  const win = new electron.BrowserWindow({
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
      sandbox: true
    }
  });
  win.once(
    "ready-to-show",
    () => {
      win.show();
    }
  );
  win.webContents.setWindowOpenHandler(
    ({ url }) => {
      electron.shell.openExternal(url);
      return {
        action: "deny"
      };
    }
  );
  if (isDev) {
    win.webContents.on(
      "console-message",
      (_event, _level, message, line, sourceId) => {
        console.log(
          `[renderer] ${message} (${sourceId}:${line})`
        );
      }
    );
    win.webContents.on(
      "preload-error",
      (_event, preloadPath, error) => {
        console.error(
          `[preload-error] ${preloadPath}`,
          error
        );
      }
    );
  }
  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
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
electron.app.whenReady().then(bootstrap).catch((error) => {
  console.error(
    "[main] bootstrap failed",
    error
  );
  electron.dialog.showErrorBox(
    "Torki Bazar failed to start",
    String(
      error?.stack ?? error
    )
  );
  electron.app.quit();
});
electron.app.on(
  "window-all-closed",
  () => {
    if (process.platform !== "darwin") {
      electron.app.quit();
    }
  }
);
electron.app.on(
  "activate",
  () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  }
);
