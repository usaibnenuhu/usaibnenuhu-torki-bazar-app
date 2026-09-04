import bcrypt from "bcryptjs";
import { prisma } from "@torki-bazar/database";
import { PERMISSIONS, ValidationError, DuplicateError } from "@torki-bazar/shared";
import type { AuthSession } from "../context";
import { assertPermission } from "../context";
import { recordAuditLog } from "../audit/auditService";

export async function listUsers(session: AuthSession) {
  assertPermission(session, PERMISSIONS.USERS_MANAGE);
  return prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "asc" } });
}

export async function createUser(
  session: AuthSession,
  input: { username: string; password: string; fullName: string; roleId: string; phone?: string }
) {
  assertPermission(session, PERMISSIONS.USERS_MANAGE);
  if (input.password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long.");
  }
  const existing = await prisma.user.findUnique({ where: { username: input.username } });
  if (existing) {
    throw new DuplicateError(`Username "${input.username}" is already in use.`);
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      passwordHash,
      fullName: input.fullName,
      roleId: input.roleId,
      phone: input.phone,
    },
  });
  await recordAuditLog(session, { action: "CREATE", module: "USER", recordId: user.id, newValue: { username: user.username } });
  return user;
}

export async function updateUser(
  session: AuthSession,
  userId: string,
  input: { fullName?: string; roleId?: string; phone?: string }
) {
  assertPermission(session, PERMISSIONS.USERS_MANAGE);
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const user = await prisma.user.update({ where: { id: userId }, data: input });
  await recordAuditLog(session, {
    action: "UPDATE",
    module: "USER",
    recordId: userId,
    previousValue: before,
    newValue: user,
  });
  return user;
}

export async function setUserActive(session: AuthSession, userId: string, isActive: boolean) {
  assertPermission(session, PERMISSIONS.USERS_MANAGE);
  const user = await prisma.user.update({ where: { id: userId }, data: { isActive } });
  await recordAuditLog(session, {
    action: isActive ? "USER_ENABLED" : "USER_DISABLED",
    module: "USER",
    recordId: userId,
  });
  return user;
}

export async function resetUserPassword(session: AuthSession, userId: string, newPassword: string) {
  assertPermission(session, PERMISSIONS.USERS_MANAGE);
  if (newPassword.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long.");
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await recordAuditLog(session, { action: "PASSWORD_RESET", module: "USER", recordId: userId });
}

export async function listRoles() {
  return prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
}
