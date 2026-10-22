import { supabase } from '../../shared/lib/supabaseClient'
import type { Role } from './types/rbacTypes'

export async function getAllRoles(): Promise<Role[]> {
  const { data, error } = await supabase.from('roles').select('*').order('name')
  if (error) throw error
  return data
}

export async function createRole(name: string, description: string): Promise<Role> {
  const { data, error } = await supabase
    .from('roles')
    .insert({ name, description })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRole(id: number, name: string, description: string): Promise<Role> {
  const { data, error } = await supabase
    .from('roles')
    .update({ name, description })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRole(id: number): Promise<void> {
  const { error } = await supabase.from('roles').delete().eq('id', id)
  if (error) throw error
}