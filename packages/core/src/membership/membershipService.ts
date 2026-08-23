import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, INVOICE_PREFIXES, DuplicateError, NotFoundError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { nextInvoiceNumber } from "../invoicing/invoiceNumberService";

export async function issueMembership(
  session: AuthSession,
  input: { customerId: string; tier?: string; expiryDate?: Date | null }
) {
  assertPermission(session, PERMISSIONS.MEMBERSHIP_MANAGE);
  const existing = await prisma.membership.findUnique({ where: { customerId: input.customerId } });
  if (existing) throw new DuplicateError("This customer already has a membership card.");

  return prisma.$transaction(async (tx) => {
    const membershipNumber = await nextInvoiceNumber(tx as unknown as typeof prisma, INVOICE_PREFIXES.MEMBERSHIP, {
      withYear: false,
    });
    const membership = await tx.membership.create({
      data: {
        membershipNumber,
        customerId: input.customerId,
        tier: input.tier ?? "STANDARD",
        expiryDate: input.expiryDate,
        qrCodeData: JSON.stringify({ type: "TB_MEMBER", membershipNumber }),
      },
    });
    await recordAuditLog(session, { action: "CREATE", module: "MEMBERSHIP", recordId: membership.id, newValue: membership }, tx);
    return membership;
  });
}

export async function findMembership(membershipNumberOrQr: string) {
  const membership = await prisma.membership.findFirst({
    where: {
      OR: [{ membershipNumber: membershipNumberOrQr }, { qrCodeData: { contains: membershipNumberOrQr } }],
    },
    include: { customer: true },
  });
  if (!membership) throw new NotFoundError("Membership not found.");
  return membership;
}

export async function reprintMembership(session: AuthSession, membershipId: string) {
  assertPermission(session, PERMISSIONS.MEMBERSHIP_MANAGE);
  const membership = await prisma.membership.findUniqueOrThrow({ where: { id: membershipId }, include: { customer: true } });
  await recordAuditLog(session, { action: "REPRINT", module: "MEMBERSHIP", recordId: membershipId });
  return membership;
}

export async function suspendMembership(session: AuthSession, membershipId: string) {
  assertPermission(session, PERMISSIONS.MEMBERSHIP_MANAGE);
  const membership = await prisma.membership.update({ where: { id: membershipId }, data: { status: "SUSPENDED" } });
  await recordAuditLog(session, { action: "SUSPEND", module: "MEMBERSHIP", recordId: membershipId });
  return membership;
}
