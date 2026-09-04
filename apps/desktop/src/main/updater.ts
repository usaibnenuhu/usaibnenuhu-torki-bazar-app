import { app } from "electron";
import type { AppUpdater } from "electron-updater";

let updater: AppUpdater | null = null;
let checkPromise: Promise<UpdateState> | null = null;
let automaticInstallStarted = false;

const CHECK_TIMEOUT_MS = 20_000;

export type UpdateState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "downloading"; version?: string; percent: number }
  | { status: "downloaded"; version: string }
  | { status: "not-available"; version: string }
  | { status: "error"; message: string };

let updaterState: UpdateState = { status: "idle" };

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function getUpdater(): Promise<AppUpdater> {
  if (!app.isPackaged || process.platform !== "win32") {
    throw new Error(
      "Application updates are available only in the installed Windows version."
    );
  }

  if (!updater) {
    const mod = await import("electron-updater");

    updater =
      mod.autoUpdater ??
      (mod.default as typeof mod | undefined)?.autoUpdater ??
      null;

    if (!updater) {
      throw new Error(
        "electron-updater loaded, but autoUpdater is unavailable."
      );
    }

    /*
     * IMPORTANT:
     * Automatically download as soon as a newer release is detected.
     */
    updater.autoDownload = true;

    /*
     * Keep the installer active when the old application exits.
     * We also explicitly call quitAndInstall() after download.
     */
    updater.autoInstallOnAppQuit = true;

    updater.on("checking-for-update", () => {
      updaterState = {
        status: "checking",
      };

      console.log("[updater] Checking for updates...");
    });

    updater.on("update-available", (info) => {
      updaterState = {
        status: "available",
        version: info.version,
      };

      console.log(
        `[updater] Update available: ${info.version}`
      );
    });

    updater.on("update-not-available", (info) => {
      updaterState = {
        status: "not-available",
        version: info.version,
      };

      automaticInstallStarted = false;

      console.log(
        `[updater] Already up to date: ${info.version}`
      );
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

      console.log(
        `[updater] Download ${progress.percent.toFixed(1)}%`
      );
    });

    updater.on("update-downloaded", (info) => {
      updaterState = {
        status: "downloaded",
        version: info.version,
      };

      console.log(
        `[updater] Update downloaded and ready: ${info.version}`
      );

      if (automaticInstallStarted) {
        return;
      }

      automaticInstallStarted = true;

      /*
       * Let electron-updater finish writing the downloaded
       * installer before replacing the running application.
       */
      setTimeout(() => {
        try {
          console.log(
            "[updater] Automatically installing update..."
          );

          /*
           * v26.x syntax:
           * false = silent installer
           * true  = restart application after installation
           */
          updater?.quitAndInstall(false, true);
        } catch (error) {
          automaticInstallStarted = false;

          updaterState = {
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : String(error),
          };

          console.error(
            "[updater] automatic install failed:",
            error
          );
        }
      }, 300);
    });

    updater.on("error", (error) => {
      automaticInstallStarted = false;

      updaterState = {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : String(error),
      };

      console.error(
        "[updater] error:",
        error
      );
    });
  }

  return updater;
}

export async function checkForDesktopUpdate(): Promise<UpdateState> {
  if (checkPromise) {
    return checkPromise;
  }

  checkPromise = (async () => {
    try {
      const update = await getUpdater();

      updaterState = {
        status: "checking",
      };

      /*
       * Never allow the Settings page to remain on
       * "Checking..." forever.
       */
      const result = await withTimeout(
        update.checkForUpdates(),
        CHECK_TIMEOUT_MS,
        "Update check timed out. Please check your internet connection and try again."
      );

      if (!result?.updateInfo) {
        return updaterState;
      }

      /*
       * electron-updater normally fires the corresponding event,
       * but also set the state from the returned version so the
       * renderer cannot remain stuck in "checking".
       */
      const availableVersion =
        result.updateInfo.version;

      const currentVersion =
        app.getVersion();

      if (availableVersion !== currentVersion) {
        updaterState = {
          status: "available",
          version: availableVersion,
        };
      } else {
        updaterState = {
          status: "not-available",
          version: availableVersion,
        };
      }

      return updaterState;
    } catch (error) {
      updaterState = {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : String(error),
      };

      console.error(
        "[updater] check failed:",
        error
      );

      return updaterState;
    } finally {
      checkPromise = null;
    }
  })();

  return checkPromise;
}

export async function downloadDesktopUpdate(): Promise<UpdateState> {
  await getUpdater();

  /*
   * Downloads are automatic now.
   */
  if (
    updaterState.status === "downloaded" ||
    updaterState.status === "downloading"
  ) {
    return updaterState;
  }

  if (updaterState.status !== "available") {
    await checkForDesktopUpdate();
  }

  /*
   * autoDownload=true already started the download.
   * Do NOT call downloadUpdate() a second time.
   */
  return updaterState;
}

export async function installDesktopUpdate() {
  const update = await getUpdater();

  if (updaterState.status !== "downloaded") {
    throw new Error(
      "The update has not finished downloading yet."
    );
  }

  if (automaticInstallStarted) {
    return {
      ok: true,
    };
  }

  automaticInstallStarted = true;

  update.quitAndInstall(false, true);

  return {
    ok: true,
  };
}

export function getDesktopUpdateState() {
  return updaterState;
}

/*
 * AUTOMATIC STARTUP CHECK
 *
 * This is the important part:
 * the user does NOT have to open Settings and click
 * "Check for Updates".
 *
 * When the installed Windows application starts,
 * it checks for a newer release automatically.
 */
app.whenReady().then(() => {
  if (
    app.isPackaged &&
    process.platform === "win32"
  ) {
    console.log(
      `[updater] Automatic update system started. Current version: ${app.getVersion()}`
    );

    void checkForDesktopUpdate();
  }
});
