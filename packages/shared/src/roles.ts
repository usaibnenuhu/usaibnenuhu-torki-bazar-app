// Built-in system role names. Additional custom roles can be created later
// through the RolePermission table without any code changes.
export const SYSTEM_ROLES = {
  OWNER_ADMIN: "OWNER_ADMIN",
  MANAGER: "MANAGER",
} as const;

export type SystemRoleName = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
