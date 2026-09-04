import type { PermissionCode } from "@torki-bazar/shared";
import { UnauthorizedError } from "@torki-bazar/shared";

// Represents the authenticated session for the current user. Computed once
// at login and passed into every service call — services never re-derive
// permissions from the database on every operation.
export interface AuthSession {
  userId: string;
  username: string;
  fullName: string;
  roleName: string;
  permissions: PermissionCode[];
}

export function assertPermission(session: AuthSession, permission: PermissionCode): void {
  if (!session.permissions.includes(permission)) {
    throw new UnauthorizedError(
      `Your role (${session.roleName}) does not have permission to perform this action.`
    );
  }
}
