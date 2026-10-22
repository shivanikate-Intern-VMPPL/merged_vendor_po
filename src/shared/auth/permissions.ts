import type { Role } from './roles'

export type Permission =
  | 'dashboard:view'
  | 'purchase_orders:create'
  | 'purchase_orders:view_own'
  | 'purchase_orders:view_all'
  | 'purchase_orders:delete'
  | 'export:csv'
  // | 'farmers:register'
  // | 'farmers:view'
  | 'users:manage'
  | 'users:assign_roles'
  | 'admin:panel'

// Define permissions for each role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  pending: [],

  collector: [
    'dashboard:view',
    'purchase_orders:create',
    'purchase_orders:view_own',
    'purchase_orders:delete',
    // 'farmers:register',
    // 'farmers:view',
  ],

  office: [
    'dashboard:view',
    'purchase_orders:create',
    'purchase_orders:view_own',
    'purchase_orders:view_all',
    'purchase_orders:delete',
    'export:csv',
    // 'farmers:register',
    // 'farmers:view',
  ],

  admin: [
    'dashboard:view',
    'purchase_orders:create',
    'purchase_orders:view_own',
    'purchase_orders:view_all',
    'purchase_orders:delete',
    'export:csv',
    // 'farmers:register',
    // 'farmers:view',
    'users:manage',
    'users:assign_roles',
    'admin:panel',
  ],
}

// Check if a role has a specific permission
export function can(
  role: Role | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Check if a role has ANY of the given permissions
export function canAny(
  role: Role | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => can(role, p))
}

// Check if a role has ALL of the given permissions
export function canAll(
  role: Role | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => can(role, p))
}

// Convenience helpers
export const helpers = {
  isCollector: (role: Role | null | undefined) => role === 'collector',
  isOffice: (role: Role | null | undefined) => role === 'office',
  isAdmin: (role: Role | null | undefined) => role === 'admin',
  isPending: (role: Role | null | undefined) => role === 'pending',
  canExport: (role: Role | null | undefined) => can(role, 'export:csv'),
  canManageUsers: (role: Role | null | undefined) => can(role, 'users:manage'),
  canCreateOrder: (role: Role | null | undefined) =>
    can(role, 'purchase_orders:create'),
  canViewAllOrders: (role: Role | null | undefined) =>
    can(role, 'purchase_orders:view_all'),
  canAccessAdmin: (role: Role | null | undefined) => can(role, 'admin:panel'),
}