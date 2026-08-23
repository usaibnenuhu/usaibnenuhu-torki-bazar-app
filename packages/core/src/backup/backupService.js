"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBackup = createBackup;
exports.listBackups = listBackups;
exports.restoreBackup = restoreBackup;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
// Local backup/restore for the SQLite database file (section 54). The
// desktop app supplies concrete file paths — this module has no knowledge
// of Electron's userData layout, keeping it portable to a future MySQL
// dump/restore implementation.
async function createBackup(session, dbFilePath, backupsDir, notes) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.BACKUP_MANAGE);
    await node_fs_1.promises.mkdir(backupsDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `torki-bazar-backup-${timestamp}.db`;
    const backupFilePath = node_path_1.default.join(backupsDir, backupFileName);
    await node_fs_1.promises.copyFile(dbFilePath, backupFilePath);
    const stats = await node_fs_1.promises.stat(backupFilePath);
    const backup = await database_1.prisma.backup.create({
        data: {
            filePath: backupFilePath,
            fileSizeBytes: stats.size,
            createdById: session.userId,
            notes,
        },
    });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "BACKUP", recordId: backup.id, newValue: { backupFilePath } });
    return backup;
}
async function listBackups() {
    return database_1.prisma.backup.findMany({ orderBy: { createdAt: "desc" }, include: { createdBy: true } });
}
async function restoreBackup(session, backupId, dbFilePath) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.BACKUP_MANAGE);
    const backup = await database_1.prisma.backup.findUnique({ where: { id: backupId } });
    if (!backup)
        throw new shared_1.ValidationError("Backup not found.");
    const exists = await node_fs_1.promises
        .access(backup.filePath)
        .then(() => true)
        .catch(() => false);
    if (!exists)
        throw new shared_1.ValidationError("Backup file is missing from disk.");
    // Caller must fully close the Prisma connection / restart the app after
    // this completes, since SQLite holds an open file handle on dbFilePath.
    await node_fs_1.promises.copyFile(backup.filePath, dbFilePath);
    await (0, auditService_1.recordAuditLog)(session, { action: "RESTORE", module: "BACKUP", recordId: backupId });
}
