import { prisma } from "@torki-bazar/database";
import type { AuthSession } from "../context";

export interface AuditEntryInput {
  action: string; // CREATE, UPDATE, VOID, LOGIN, LOGIN_FAILED, ...
  module: string; // PRODUCT, SALE, PURCHASE, CUSTOMER, ...
  recordId?: string;
  previousValue?: unknown;
  newValue?: unknown;
}

// Every important operation must be auditable (section 10). Services call
// this after a successful state change, inside the same transaction when
// the underlying operation is transactional.
export async function recordAuditLog(
  session: Pick<AuthSession, "userId" | "username" | "roleName"> | null,
  entry: AuditEntryInput,
  tx: Pick<typeof prisma, "auditLog"> = prisma
): Promise<void> {
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
