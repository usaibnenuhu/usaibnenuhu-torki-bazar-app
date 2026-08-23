"use strict";
const electron = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const isDev = !electron.app.isPackaged;
async function bootstrap() {
  if (isDev) {
    process.env.DATABASE_URL ||= `file:${path.resolve(
      __dirname,
      "../../../../packages/database/prisma/dev.db"
    )}`;
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
        process.env.NEON_DATABASE_URL = match?.[1] ?? match?.[2] ?? match?.[3]?.trim();
      }
    }
    if (!process.env.NEON_DATABASE_URL) {
      console.error(
        "[main] NEON_DATABASE_URL is not configured."
      );
      electron.dialog.showErrorBox(
        "Neon sync configuration missing",
        "NEON_DATABASE_URL could not be loaded.\n\nPlease configure it in packages/database/.env."
      );
      electron.app.quit();
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
      electron.dialog.showErrorBox(
        "Database configuration missing",
        "DATABASE_URL is not configured for the production application.\n\nPlease configure the production database connection before starting Torki Bazar."
      );
      electron.app.quit();
      return;
    }
    console.log(
      "[main] Production database configured."
    );
  }
  process.env.NODE_ENV ||= isDev ? "development" : "production";
  const { registerIpcHandlers } = await Promise.resolve().then(() => require("./chunks/ipc-BrBm3_Qm.js"));
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
