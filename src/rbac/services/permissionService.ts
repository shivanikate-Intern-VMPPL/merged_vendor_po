import { supabase } from '../../shared/lib/supabaseClient'
import type { Permission } from './types/rbacTypes'

export async function getAllPermissions(): Promise<Permission[]> {
  const { data, error } = await supabase.from('permissions').select('*').order('name')
  if (error) throw error
  return data
}

export async function createPermission(name: string, description: string): Promise<Permission> {
  const { data, error } = await supabase
    .from('permissions')
    .insert({ name, description })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePermission(id: number, name: string, description: string): Promise<Permission> {
  const { data, error } = await supabase
    .from('permissions')
    .update({ name, description })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePermission(id: number): Promise<void> {
  const { error } = await supabase.from('permissions').delete().eq('id', id)
  if (error) throw error
}

// Get permissions belonging to a specific role
export async function getRolePermissions(roleId: number): Promise<Permission[]> {
  const { data: rolePerms, error } = await supabase
    .from('role_permissions')
    .select('permission_id')
    .eq('role_id', roleId)
  if (error) throw error

  const ids = rolePerms.map((p: { permission_id: number }) => p.permission_id)
  if (ids.length === 0) return []

  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('*')
    .in('id', ids)
  if (permError) throw permError
  return permissions
}

// Set (replace) which permissions belong to a role
export async function setRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
  // Remove existing links for this role
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)
  if (deleteError) throw deleteError

  if (permissionIds.length === 0) return

  // Insert new links
  const rows = permissionIds.map((permission_id) => ({ role_id: roleId, permission_id }))
  const { error: insertError } = await supabase.from('role_permissions').insert(rows)
  if (insertError) throw insertError
}