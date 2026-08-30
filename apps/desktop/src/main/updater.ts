import { app } from "electron";
import type { AppUpdater } from "electron-updater";

let updater: AppUpdater | null = null;

export type UpdateState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "downloading"; version?: string; percent: number }
  | { status: "downloaded"; version: string }
  | { status: "not-available"; version: string }
  | { status: "error"; message: string };

let updaterState: UpdateState = { status: "idle" };

async function getUpdater(): Promise<AppUpdater> {
  if (!app.isPackaged || process.platform !== "win32") {
    throw new Error(
      "Application updates are available only in the installed Windows version."
    );
  }

  if (!updater) {
    const mod = await import("electron-updater");
    updater = mod.autoUpdater;

    updater.autoDownload = false;
    updater.autoInstallOnAppQuit = false;

    updater.on("checking-for-update", () => {
      updaterState = { status: "checking" };
    });

    updater.on("update-available", (info) => {
      updaterState = {
        status: "available",
        version: info.version,
      };
    });

    updater.on("update-not-available", (info) => {
      updaterState = {
        status: "not-available",
        version: info.version,
      };
    });

    updater.on("download-progress", (progress) => {
      const version =
        updaterState.status === "available" ||
        updaterState.status === "downloading"
          ? updaterState.version
          : undefined;

      updaterState = {
        status: "downloading",
        version,
        percent: Math.round(progress.percent),
      };
    });

    updater.on("update-downloaded", (info) => {
      updaterState = {
        status: "downloaded",
        version: info.version,
      };
    });

    updater.on("error", (error) => {
      updaterState = {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      };
    });
  }

  return updater;
}

export async function checkForDesktopUpdate() {
  try {
    const update = await getUpdater();

    updaterState = { status: "checking" };

    const result = await update.checkForUpdates();

    if (!result?.updateInfo) {
      return updaterState;
    }

    return updaterState;
  } catch (error) {
    updaterState = {
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };

    return updaterState;
  }
}

export async function downloadDesktopUpdate() {
  const update = await getUpdater();

  if (updaterState.status !== "available") {
    await checkForDesktopUpdate();
  }

  if (updaterState.status !== "available") {
    return updaterState;
  }

  updaterState = {
    status: "downloading",
    version: updaterState.version,
    percent: 0,
  };

  await update.downloadUpdate();

  return updaterState;
}

export async function installDesktopUpdate() {
  const update = await getUpdater();

  if (updaterState.status !== "downloaded") {
    throw new Error("The update has not finished downloading yet.");
  }

  update.quitAndInstall(false, true);

  return { ok: true };
}

export function getDesktopUpdateState() {
  return updaterState;
}
