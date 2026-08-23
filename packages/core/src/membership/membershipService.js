"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueMembership = issueMembership;
exports.findMembership = findMembership;
exports.reprintMembership = reprintMembership;
exports.suspendMembership = suspendMembership;
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
const invoiceNumberService_1 = require("../invoicing/invoiceNumberService");
async function issueMembership(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.MEMBERSHIP_MANAGE);
    const existing = await database_1.prisma.membership.findUnique({ where: { customerId: input.customerId } });
    if (existing)
        throw new shared_1.DuplicateError("This customer already has a membership card.");
    return database_1.prisma.$transaction(async (tx) => {
        const membershipNumber = await (0, invoiceNumberService_1.nextInvoiceNumber)(tx, shared_1.INVOICE_PREFIXES.MEMBERSHIP, {
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
        await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "MEMBERSHIP", recordId: membership.id, newValue: membership }, tx);
        return membership;
    });
}
async function findMembership(membershipNumberOrQr) {
    const membership = await database_1.prisma.membership.findFirst({
        where: {
            OR: [{ membershipNumber: membershipNumberOrQr }, { qrCodeData: { contains: membershipNumberOrQr } }],
        },
        include: { customer: true },
    });
    if (!membership)
        throw new shared_1.NotFoundError("Membership not found.");
    return membership;
}
async function reprintMembership(session, membershipId) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.MEMBERSHIP_MANAGE);
    const membership = await database_1.prisma.membership.findUniqueOrThrow({ where: { id: membershipId }, include: { customer: true } });
    await (0, auditService_1.recordAuditLog)(session, { action: "REPRINT", module: "MEMBERSHIP", recordId: membershipId });
    return membership;
}
async function suspendMembership(session, membershipId) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.MEMBERSHIP_MANAGE);
    const membership = await database_1.prisma.membership.update({ where: { id: membershipId }, data: { status: "SUSPENDED" } });
    await (0, auditService_1.recordAuditLog)(session, { action: "SUSPEND", module: "MEMBERSHIP", recordId: membershipId });
    return membership;
}
