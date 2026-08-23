"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAuditLog = recordAuditLog;
const database_1 = require("@torki-bazar/database");
// Every important operation must be auditable (section 10). Services call
// this after a successful state change, inside the same transaction when
// the underlying operation is transactional.
async function recordAuditLog(session, entry, tx = database_1.prisma) {
    await tx.auditLog.create({
        data: {
            userId: session?.userId,
            username: session?.username ?? "system",
            role: session?.roleName ?? "SYSTEM",
            action: entry.action,
            module: entry.module,
            recordId: entry.recordId,
            previousValue: entry.previousValue !== undefined ? JSON.stringify(entry.previousValue) : undefined,
            newValue: entry.newValue !== undefined ? JSON.stringify(entry.newValue) : undefined,
        },
    });
}
