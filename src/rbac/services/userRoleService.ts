import { supabase } from '../../shared/lib/supabaseClient'
import type { Role } from './types/rbacTypes'

// Get a user's assigned role (used by RoleGuard/usePermissions)
export async function getUserRole(userId: string): Promise<Role | null> {
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .single()

  if (error || !userRole) return null

  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('*')
    .eq('id', userRole.role_id)
    .single()

  if (roleError) return null
  return role
}

// Assign or change a user's role (used by Admin Panel)
export async function assignUserRole(userId: string, roleId: number): Promise<void> {
  const { data: existing } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('user_roles')
      .update({ role_id: roleId })
      .eq('user_id', userId)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })
    if (error) throw error
  }
}

// List every user with their role name attached (for Admin Panel table)
// export async function getAllUsersWithRoles() {
//   const { data: profiles, error } = await supabase
//     .from('profiles')
//     .select('id, full_name, email, created_at')
//   if (error) throw error

//   const { data: userRoles, error: urError } = await supabase
//     .from('user_roles')
//     .select('user_id, role_id, roles(name)')
//   if (urError) throw urError

//   return profiles.map((p: any) => {
//     const match = userRoles.find((ur) => ur.user_id === p.id)
//     return {
//       ...p,
//       role_id: match?.role_id ?? null,
//       role_name: (match?.roles as any)?.name ?? null,
//     }
//   })
// }
export async function getAllUsersWithRoles() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, mobile, created_at, is_active')

  if (error) {
    console.error('getAllUsersWithRoles - profiles error:', error)
    throw error
  }

  const { data: userRoles, error: urError } = await supabase
    .from('user_roles')
    .select('user_id, role_id')

  if (urError) {
    console.error('getAllUsersWithRoles - user_roles error:', urError)
    throw urError
  }

  const { data: rolesData, error: rolesError } = await supabase
    .from('roles')
    .select('id, name')

  if (rolesError) {
    console.error('getAllUsersWithRoles - roles error:', rolesError)
    throw rolesError
  }

  return profiles.map((p) => {
    const match = userRoles?.find((ur) => ur.user_id === p.id)
    const roleObj = rolesData?.find((r) => r.id === match?.role_id)
    return {
      ...p,
      role_id: match?.role_id ?? null,
      role_name: roleObj?.name ?? null,
    }
  })
}

// Remove a user's access (deletes their profile + role assignment)
export async function deleteUser(userId: string): Promise<void> {
  const { error: urError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
  if (urError) throw urError

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
  if (profileError) throw profileError
}