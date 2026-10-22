import { useAuthContext } from '../../features/auth/AuthContext'
import { can, canAny, helpers } from './permissions'
import type { Permission } from './permissions'
import type { Role } from './roles'
// Re-export from new auth module
// export { usePermissions } from '../auth/usePermissions'

export function usePermissions() {
  const { role, profile, user, isAuthenticated } = useAuthContext()

  return {
    // Raw role and user info
    role: role as Role | null,
    profile,
    user,
    isAuthenticated,

    // Generic permission check
    can: (permission: Permission) => can(role, permission),
    canAny: (permissions: Permission[]) => canAny(role, permissions),

    // Role checks
    isCollector: helpers.isCollector(role),
    isOffice: helpers.isOffice(role),
    isAdmin: helpers.isAdmin(role),
    isPending: helpers.isPending(role),

    // Feature checks
    canExport: helpers.canExport(role),
    canManageUsers: helpers.canManageUsers(role),
    canCreateOrder: helpers.canCreateOrder(role),
    canViewAllOrders: helpers.canViewAllOrders(role),
    canAccessAdmin: helpers.canAccessAdmin(role),
  }
}
// import { useState, useEffect } from 'react'
// import { useAuthContext } from '../../../features/auth/AuthContext'
// import { getUserRole } from '../userRoleService'
// import { getRolePermissions } from '../permissionService'
// import { supabase } from '../../../shared/lib/supabaseClient'

// export function usePermission(requiredPermission: string) {
//   const { user } = useAuthContext()
//   const [hasPermission, setHasPermission] = useState(false)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!user) {
//       setHasPermission(false)
//       setLoading(false)
//       return
//     }
//     checkPermission()
//   }, [user, requiredPermission])

//   // Listen for realtime changes to role_permissions so a permission update
//   // by an admin reflects immediately, without requiring a page refresh or relogin
//   useEffect(() => {
//     if (!user) return

//     const channel = supabase
//       .channel(`role-permissions-${requiredPermission}`)
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'role_permissions' },
//         () => {
//           checkPermission()
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [user, requiredPermission])

//   async function checkPermission() {
//     setLoading(true)
//     try {
//       const role = await getUserRole(user!.id)
//       if (!role) {
//         setHasPermission(false)
//         setLoading(false)
//         return
//       }
//       const permissions = await getRolePermissions(role.id)
//       setHasPermission(permissions.some((p) => p.name === requiredPermission))
//     } catch {
//       setHasPermission(false)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return { hasPermission, loading }
// }