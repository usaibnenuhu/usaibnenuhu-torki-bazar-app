import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, ValidationError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";

// Local backup/restore for the SQLite database file (section 54). The
// desktop app supplies concrete file paths — this module has no knowledge
// of Electron's userData layout, keeping it portable to a future MySQL
// dump/restore implementation.
export async function createBackup(
  session: AuthSession,
  dbFilePath: string,
  backupsDir: string,
  notes?: string
) {
  assertPermission(session, PERMISSIONS.BACKUP_MANAGE);
  await fs.mkdir(backupsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `torki-bazar-backup-${timestamp}.db`;
  const backupFilePath = path.join(backupsDir, backupFileName);

  await fs.copyFile(dbFilePath, backupFilePath);
  const stats = await fs.stat(backupFilePath);

  const backup = await prisma.backup.create({
    data: {
      filePath: backupFilePath,
      fileSizeBytes: stats.size,
      createdById: session.userId,
      notes,
    },
  });
  await recordAuditLog(session, { action: "CREATE", module: "BACKUP", recordId: backup.id, newValue: { backupFilePath } });
  return backup;
}

export async function listBackups() {
  return prisma.backup.findMany({ orderBy: { createdAt: "desc" }, include: { createdBy: true } });
}

export async function restoreBackup(session: AuthSession, backupId: string, dbFilePath: string) {
  assertPermission(session, PERMISSIONS.BACKUP_MANAGE);
  const backup = await prisma.backup.findUnique({ where: { id: backupId } });
  if (!backup) throw new ValidationError("Backup not found.");

  const exists = await fs
    .access(backup.filePath)
    .then(() => true)
    .catch(() => false);
  if (!exists) throw new ValidationError("Backup file is missing from disk.");

  // Caller must fully close the Prisma connection / restart the app after
  // this completes, since SQLite holds an open file handle on dbFilePath.
  await fs.copyFile(backup.filePath, dbFilePath);
  await recordAuditLog(session, { action: "RESTORE", module: "BACKUP", recordId: backupId });
}
