import { useMemo } from "react";
import { Member } from "@/lib/types";

export type Permission =
  | "create_project"
  | "edit_project"
  | "delete_project"
  | "manage_members"
  | "create_issue"
  | "edit_issue"
  | "delete_issue"
  | "assign_issue";

const ROLE_PERMISSIONS: Record<Member["role"], Permission[]> = {
  OWNER: [
    "create_project",
    "edit_project",
    "delete_project",
    "manage_members",
    "create_issue",
    "edit_issue",
    "delete_issue",
    "assign_issue",
  ],
  ADMIN: [
    "create_project",
    "edit_project",
    "manage_members",
    "create_issue",
    "edit_issue",
    "delete_issue",
    "assign_issue",
  ],
  MEMBER: ["create_issue", "edit_issue", "assign_issue"],
  VIEWER: [],
};

export function usePermissions(member: Member | null) {
  const permissions = useMemo(() => {
    if (!member) return new Set<Permission>();

    return new Set(ROLE_PERMISSIONS[member.role]);
  }, [member]);

  const hasPermission = (permission: Permission) => {
    return permissions.has(permission);
  };

  const hasAnyPermission = (permissions: Permission[]) => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]) => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    role: member?.role || null,
  };
}
