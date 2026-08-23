"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.setUserActive = setUserActive;
exports.resetUserPassword = resetUserPassword;
exports.listRoles = listRoles;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("@torki-bazar/database");
const shared_1 = require("@torki-bazar/shared");
const context_1 = require("../context");
const auditService_1 = require("../audit/auditService");
async function listUsers(session) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.USERS_MANAGE);
    return database_1.prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "asc" } });
}
async function createUser(session, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.USERS_MANAGE);
    if (input.password.length < 8) {
        throw new shared_1.ValidationError("Password must be at least 8 characters long.");
    }
    const existing = await database_1.prisma.user.findUnique({ where: { username: input.username } });
    if (existing) {
        throw new shared_1.DuplicateError(`Username "${input.username}" is already in use.`);
    }
    const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
    const user = await database_1.prisma.user.create({
        data: {
            username: input.username,
            passwordHash,
            fullName: input.fullName,
            roleId: input.roleId,
            phone: input.phone,
        },
    });
    await (0, auditService_1.recordAuditLog)(session, { action: "CREATE", module: "USER", recordId: user.id, newValue: { username: user.username } });
    return user;
}
async function updateUser(session, userId, input) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.USERS_MANAGE);
    const before = await database_1.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const user = await database_1.prisma.user.update({ where: { id: userId }, data: input });
    await (0, auditService_1.recordAuditLog)(session, {
        action: "UPDATE",
        module: "USER",
        recordId: userId,
        previousValue: before,
        newValue: user,
    });
    return user;
}
async function setUserActive(session, userId, isActive) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.USERS_MANAGE);
    const user = await database_1.prisma.user.update({ where: { id: userId }, data: { isActive } });
    await (0, auditService_1.recordAuditLog)(session, {
        action: isActive ? "USER_ENABLED" : "USER_DISABLED",
        module: "USER",
        recordId: userId,
    });
    return user;
}
async function resetUserPassword(session, userId, newPassword) {
    (0, context_1.assertPermission)(session, shared_1.PERMISSIONS.USERS_MANAGE);
    if (newPassword.length < 8) {
        throw new shared_1.ValidationError("Password must be at least 8 characters long.");
    }
    const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
    await database_1.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await (0, auditService_1.recordAuditLog)(session, { action: "PASSWORD_RESET", module: "USER", recordId: userId });
}
async function listRoles() {
    return database_1.prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
}
