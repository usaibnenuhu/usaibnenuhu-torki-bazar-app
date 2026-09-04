import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, INVOICE_PREFIXES, DuplicateError, NotFoundError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";
import { nextInvoiceNumber } from "../invoicing/invoiceNumberService";
import { enqueueSync } from "../sync/syncService";

export async function issueMembership(
  session: AuthSession,
  input: {
    customerId: string;
    tier?: string;
    expiryDate?: Date | null;
    discountPercent?: number;
  }
) {
  assertPermission(session, PERMISSIONS.MEMBERSHIP_MANAGE);

  const discountPercent = input.discountPercent ?? 0;

  if (
    !Number.isFinite(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    throw new Error("Membership discount must be between 0 and 100 percent.");
  }
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
        discountPercent,
        expiryDate: input.expiryDate,
        qrCodeData: JSON.stringify({ type: "TB_MEMBER", membershipNumber }),
      },
    });
    await recordAuditLog(session, { action: "CREATE", module: "MEMBERSHIP", recordId: membership.id, newValue: membership }, tx);

    await enqueueSync(
      "MEMBERSHIP",
      membership.id,
      "CREATE",
      { id: membership.id },
      tx
    );

    return membership;
  });
}

export async function listMemberships(session: AuthSession) {
  assertPermission(session, PERMISSIONS.MEMBERSHIP_MANAGE);

  return prisma.membership.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateMembership(
  session: AuthSession,
  membershipId: string,
  input: {
    tier?: string;
    expiryDate?: Date | null;
    discountPercent?: number;
    status?: string;
  }
) {
  assertPermission(session, PERMISSIONS.MEMBERSHIP_MANAGE);

  if (
    input.discountPercent !== undefined &&
    (!Number.isFinite(input.discountPercent) ||
      input.discountPercent < 0 ||
      input.discountPercent > 100)
  ) {
    throw new Error("Membership discount must be between 0 and 100 percent.");
  }

  const existing = await prisma.membership.findUnique({
    where: { id: membershipId },
  });

  if (!existing) {
    throw new NotFoundError("Membership not found.");
  }

  const membership = await prisma.membership.update({
    where: { id: membershipId },
    data: {
      ...(input.tier !== undefined ? { tier: input.tier } : {}),
      ...(input.expiryDate !== undefined
        ? { expiryDate: input.expiryDate }
        : {}),
      ...(input.discountPercent !== undefined
        ? { discountPercent: input.discountPercent }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
    include: { customer: true },
  });

  await recordAuditLog(session, {
    action: "UPDATE",
    module: "MEMBERSHIP",
    recordId: membershipId,
    previousValue: existing,
    newValue: membership,
  });

  await enqueueSync(
    "MEMBERSHIP",
    membership.id,
    "UPDATE",
    { id: membership.id }
  );

  return membership;
}

export async function deleteMembership(
  session: AuthSession,
  membershipId: string
) {
  assertPermission(session, PERMISSIONS.MEMBERSHIP_MANAGE);

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { customer: true },
  });

  if (!membership) {
    throw new NotFoundError("Membership not found.");
  }

  if (membership.status === "ACTIVE") {
    throw new Error("Only inactive memberships can be deleted.");
  }

  await prisma.membership.delete({
    where: { id: membershipId },
  });

  await recordAuditLog(session, {
    action: "DELETE",
    module: "MEMBERSHIP",
    recordId: membershipId,
    previousValue: membership,
  });

  return { success: true };
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

  await enqueueSync(
    "MEMBERSHIP",
    membership.id,
    "UPDATE",
    { id: membership.id }
  );

  return membership;
}
