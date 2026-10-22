type Role = 'pending' | 'collector' | 'office' | 'admin'

interface Permissions {
  canCreateOrder: boolean
  canViewOwnOrders: boolean
  canViewAllOrders: boolean
  canDeleteOrder: boolean
  canExportCSV: boolean
  canRegisterFarmer: boolean
  canViewAllFarmers: boolean
  canManageUsers: boolean
  canAccessAdminPanel: boolean
}

const rolePermissions: Record<Role, Permissions> = {
  // Pending users cannot do anything
  pending: {
    canCreateOrder: false,
    canViewOwnOrders: false,
    canViewAllOrders: false,
    canDeleteOrder: false,
    canExportCSV: false,
    canRegisterFarmer: false,
    canViewAllFarmers: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  collector: {
    canCreateOrder: true,
    canViewOwnOrders: true,
    canViewAllOrders: false,
    canDeleteOrder: true,
    canExportCSV: false,
    canRegisterFarmer: true,
    canViewAllFarmers: true,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  office: {
    canCreateOrder: true,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canDeleteOrder: true,
    canExportCSV: true,
    canRegisterFarmer: true,
    canViewAllFarmers: true,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  admin: {
    canCreateOrder: true,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canDeleteOrder: true,
    canExportCSV: true,
    canRegisterFarmer: true,
    canViewAllFarmers: true,
    canManageUsers: true,
    canAccessAdminPanel: true,
  },
}

export function hasPermission(
  role: Role | null | undefined,
  permission: keyof Permissions
): boolean {
  if (!role) return false
  return rolePermissions[role]?.[permission] ?? false
}

export function getPermissions(
  role: Role | null | undefined
): Permissions | null {
  if (!role) return null
  return rolePermissions[role] ?? null
}

