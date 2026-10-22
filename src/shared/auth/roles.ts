// Single source of truth for all roles in the system
export type Role = 'pending' | 'collector' | 'office' | 'admin'

export const ROLES = {
  PENDING: 'pending' as Role,
  COLLECTOR: 'collector' as Role,
  OFFICE: 'office' as Role,
  ADMIN: 'admin' as Role,
} as const

// Role display labels
export const ROLE_LABELS: Record<Role, string> = {
  pending: 'Pending',
  collector: 'Collector',
  office: 'Office',
  admin: 'Admin',
}

// Role hierarchy — higher number = more access
export const ROLE_HIERARCHY: Record<Role, number> = {
  pending: 0,
  collector: 1,
  office: 2,
  admin: 3,
}

// Check if a role has at least the minimum required role
export function hasMinimumRole(
  userRole: Role | null | undefined,
  minimumRole: Role
): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}