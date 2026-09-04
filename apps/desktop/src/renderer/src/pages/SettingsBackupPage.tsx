import { useEffect, useState } from "react";
import { call } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DataTable } from "../components/DataTable";
import { Field, Input } from "../components/Form";
import { formatDateTime } from "../utils/format";
import { useToastStore } from "../store/toastStore";

interface Backup {
  id: string;
  filePath: string;
  fileSizeBytes: number;
  createdAt: string;
  createdBy: {
    fullName: string;
  };
}

export function SettingsBackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Reset business data
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetting, setResetting] = useState(false);

  // Application updates
  const [appVersion, setAppVersion] = useState("...");
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "latest" | "available" | "downloading" | "downloaded" | "installing" | "error"
  >("idle");

  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState(0);



  const push = useToastStore((s) => s.push);


  async function loadAppVersion() {
    try {
      const result = await call<{ version: string }>(
        "app:update:version"
      );
      setAppVersion(result.version);
    } catch {
      setAppVersion("Unknown");
    }
  }

  async function checkForUpdates() {
    setUpdateStatus("checking");
    setDownloadPercent(0);

    try {
      const result = await call<{
        status: string;
        version: string;
        availableVersion?: string | null;
        message?: string;
      }>("app:update:check");

      setAppVersion(result.version);

      if (result.status === "available") {
        setAvailableVersion(result.availableVersion ?? null);
        setUpdateStatus("downloading");
        return;
      }

      if (result.status === "not-available") {
        setAvailableVersion(null);
        setUpdateStatus("latest");
        push("You are using the latest version.", "success");
        return;
      }

      if (result.status === "dev") {
        setUpdateStatus("latest");
        push(
          "Update checking is available in the installed app.",
          "success"
        );
        return;
      }

      setUpdateStatus("error");
      push(
        result.message ?? "Unable to check for updates.",
        "error"
      );
    } catch (err) {
      setUpdateStatus("error");
      push(
        err instanceof Error
          ? err.message
          : "Unable to check for updates.",
        "error"
      );
    }
  }

  useEffect(() => {
    if (
      updateStatus !== "checking" &&
      updateStatus !== "available" &&
      updateStatus !== "downloading" &&
      updateStatus !== "downloaded" &&
      updateStatus !== "installing"
    ) {
      return;
    }

    let stopped = false;

    async function pollUpdateState() {
      try {
        const result = await call<{
          status: string;
          version?: string;
          percent?: number;
          message?: string;
        }>("app:update:state");

        if (stopped) return;

        if (result.status === "checking") {
          setUpdateStatus("checking");
          return;
        }

        if (result.status === "available") {
          setAvailableVersion(result.version ?? null);
          setUpdateStatus("downloading");
          return;
        }

        if (result.status === "downloading") {
          setUpdateStatus("downloading");
          setDownloadPercent(
            Math.max(
              0,
              Math.min(
                100,
                Math.round(result.percent ?? 0)
              )
            )
          );
          return;
        }

        if (result.status === "downloaded") {
          setAvailableVersion(result.version ?? null);
          setDownloadPercent(100);
          setUpdateStatus("downloaded");
          return;
        }

        if (result.status === "error") {
          setUpdateStatus("error");
          push(
            result.message ?? "Update failed.",
            "error"
          );
        }
      } catch {
        // Ignore transient polling failures.
      }
    }

    void pollUpdateState();

    const timer = window.setInterval(
      pollUpdateState,
      500
    );

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [updateStatus, push]);

  // Updates download and install automatically after a newer release is found.
  // The main process handles the actual download and automatic installation.

  async function load() {
    try {
      const data = await call<Backup[]>("backup:list");
      setBackups(data);
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to load backups.",
        "error"
      );
    }
  }

  useEffect(() => {
    load();
    loadAppVersion();
  }, []);

  // ============================================================
  // BACKUP
  // ============================================================

  async function handleBackup() {
    try {
      const { dbFilePath, backupsDir } = await call<{
        dbFilePath: string;
        backupsDir: string;
      }>("app:paths");

      await call("backup:create", {
        dbFilePath,
        backupsDir,
      });

      push("Backup created successfully.", "success");

      await load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Backup failed.",
        "error"
      );
    }
  }

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  async function handleChangePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      await call("auth:changePassword", {
        currentPassword,
        newPassword,
      });

      push("Password updated successfully.", "success");

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Failed to change password.",
        "error"
      );
    }
  }

  // ============================================================
  // RESET MODAL
  // ============================================================

  function openResetModal() {
    setResetPassword("");
    setResetConfirm("");
    setResetting(false);
    setShowResetModal(true);
  }

  function closeResetModal() {
    if (resetting) return;

    setResetPassword("");
    setResetConfirm("");
    setResetting(false);
    setShowResetModal(false);
  }

  // ============================================================
  // REAL BUSINESS DATA RESET
  // ============================================================

  async function handleReset() {
    if (!resetPassword.trim()) {
      push(
        "Enter your administrator password.",
        "error"
      );
      return;
    }

    if (
      resetConfirm.trim().toUpperCase() !== "RESET"
    ) {
      push(
        'Type "RESET" to confirm.',
        "error"
      );
      return;
    }

    if (resetting) {
      return;
    }

    try {
      setResetting(true);

      // REAL RESET CALL
      await call("system:reset", {
  password: resetPassword,
  confirmation: resetConfirm.trim().toUpperCase(),
});
        

      push(
        "Business data has been reset successfully.",
        "success"
      );

      setResetPassword("");
      setResetConfirm("");
      setShowResetModal(false);

      // Refresh backup information
      await load();
    } catch (err) {
      push(
        err instanceof Error
          ? err.message
          : "Business data reset failed.",
        "error"
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-1">

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
            ⚙️
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Settings & Backup
            </h1>

            <p className="mt-1 text-sm text-emerald-50">
              Manage your account security, database protection
              and system controls.
            </p>
          </div>

        </div>
      </div>

      {/* ============================================================
          APPLICATION UPDATE
      ============================================================ */}

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
            🔄
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Application Update
            </h2>
            <p className="text-sm text-slate-500">
              Keep Torki Bazar up to date.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">
                Current version
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                v{appVersion}
              </p>

              {updateStatus === "checking" && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        Checking for updates...
                      </p>
                      <p className="text-sm text-slate-500">
                        Please wait while Torki Bazar checks for a newer version.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {updateStatus === "available" && availableVersion && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold text-emerald-800">
                    New version found: v{availableVersion}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Starting the automatic download...
                  </p>
                </div>
              )}

              {updateStatus === "downloading" && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-blue-900">
                        Downloading update...
                      </p>
                      <p className="text-sm text-blue-700">
                        Please keep Torki Bazar open.
                      </p>
                    </div>

                    <span className="text-lg font-bold text-blue-900">
                      {downloadPercent}%
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${downloadPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {updateStatus === "downloaded" && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold text-emerald-800">
                    Update downloaded.
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Installing automatically. Torki Bazar will restart with the new version.
                  </p>
                </div>
              )}

              {updateStatus === "installing" && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                    <div>
                      <p className="font-semibold text-emerald-800">
                        Installing update...
                      </p>
                      <p className="text-sm text-emerald-700">
                        The new version will open automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {updateStatus === "latest" && (
                <p className="mt-3 text-sm font-medium text-emerald-700">
                  You are using the latest version.
                </p>
              )}

              </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={checkForUpdates}
                disabled={
                  updateStatus === "checking" ||
                  updateStatus === "downloading" ||
                  updateStatus === "downloaded" ||
                  updateStatus === "installing"
                }
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateStatus === "checking"
                  ? "Checking..."
                  : updateStatus === "downloading"
                    ? `Downloading ${downloadPercent}%...`
                    : updateStatus === "downloaded"
                      ? "Installing..."
                      : updateStatus === "installing"
                        ? "Installing..."
                        : "Check for Updates"}
              </button>
            </div>
          </div>
        </div>
        </Card>

      {/* ============================================================
          ACCOUNT SECURITY
      ============================================================ */}

      <Card>

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
            🔐
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Account Security
            </h2>

            <p className="text-sm text-slate-500">
              Change your administrator password.
            </p>
          </div>

        </div>

        <form
          onSubmit={handleChangePassword}
          className="grid gap-4 md:grid-cols-2"
        >

          <Field label="Current password">
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="Enter current password"
            />
          </Field>

          <Field label="New password">
            <Input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Minimum 8 characters"
            />
          </Field>

          <div className="md:col-span-2">
            <Button type="submit">
              Update Password
            </Button>
          </div>

        </form>

      </Card>

      {/* ============================================================
          DATABASE BACKUPS
      ============================================================ */}

      <Card>

        <div className="mb-5 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
              💾
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Database Backups
              </h2>

              <p className="text-sm text-slate-500">
                Protect your Torki Bazar business data.
              </p>
            </div>

          </div>

          <Button onClick={handleBackup}>
            Create Backup
          </Button>

        </div>

        <DataTable
          rows={backups}
          keyFor={(b) => b.id}
          emptyMessage="No backups yet. Create your first backup to protect your data."
          columns={[
            {
              header: "Created",
              accessor: (b) =>
                formatDateTime(b.createdAt),
            },

            {
              header: "Size",
              accessor: (b) =>
                `${(b.fileSizeBytes / 1024).toFixed(1)} KB`,
            },

            {
              header: "By",
              accessor: (b) =>
                b.createdBy?.fullName ?? "Unknown",
            },

            {
              header: "Path",
              accessor: (b) => (
                <span className="break-all text-xs text-slate-400">
                  {b.filePath}
                </span>
              ),
            },
          ]}
        />

      </Card>

      {/* ============================================================
          DANGER ZONE
      ============================================================ */}

      <Card>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl">
              ⚠️
            </div>

            <div className="flex-1">

              <h2 className="text-lg font-bold text-red-800">
                Danger Zone
              </h2>

              <p className="mt-1 text-sm leading-6 text-red-700">
                Reset Torki Bazar business data and start
                again from a clean system.
              </p>

              <div className="mt-4 grid gap-2 text-sm text-red-700 md:grid-cols-2">

                <div>
                  • Sales and sales history
                </div>

                <div>
                  • Purchases and supplier payments
                </div>

                <div>
                  • Products and inventory
                </div>

                <div>
                  • Customers and memberships
                </div>

                <div>
                  • Suppliers and returns
                </div>

                <div>
                  • Employees and salaries
                </div>

                <div>
                  • Expenses and reports
                </div>

                <div>
                  • Daily closing records
                </div>

              </div>

              <div className="mt-5 border-t border-red-200 pt-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="font-semibold text-red-800">
                      Reset Business Data
                    </p>

                    <p className="mt-1 text-xs text-red-600">
                      Your application code and system
                      structure will not be changed.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={openResetModal}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98]"
                  >
                    Reset Business Data
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </Card>

      {/* ============================================================
          RESET MODAL
      ============================================================ */}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="bg-red-600 px-6 py-5 text-white">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl">
                  ⚠️
                </div>

                <div>

                  <h2 className="text-lg font-bold">
                    Reset Business Data
                  </h2>

                  <p className="text-sm text-red-100">
                    This action is permanent.
                  </p>

                </div>

              </div>

            </div>

            {/* Modal Body */}

            <div className="space-y-5 p-6">

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                <p className="text-sm font-semibold text-red-800">
                  Are you absolutely sure?
                </p>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  All business records will be removed and
                  Torki Bazar will return to a clean starting
                  state.
                </p>

                <p className="mt-2 text-xs text-red-600">
                  Your application, code and system permissions
                  will remain unchanged.
                </p>

              </div>

              {/* Administrator Password */}

              <Field label="Administrator password">

                <Input
                  type="password"
                  autoFocus
                  value={resetPassword}
                  disabled={resetting}
                  onChange={(e) =>
                    setResetPassword(e.target.value)
                  }
                  placeholder="Enter administrator password"
                />

              </Field>

              {/* RESET Confirmation */}

              <Field label='Type "RESET" to confirm'>

                <Input
                  value={resetConfirm}
                  disabled={resetting}
                  onChange={(e) =>
                    setResetConfirm(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="RESET"
                />

              </Field>

              {/* Buttons */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeResetModal}
                  disabled={resetting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={
                    resetting ||
                    !resetPassword.trim() ||
                    resetConfirm.trim().toUpperCase() !==
                      "RESET"
                  }
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resetting
                    ? "Resetting..."
                    : "Reset Everything"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      </div>
  );
}
