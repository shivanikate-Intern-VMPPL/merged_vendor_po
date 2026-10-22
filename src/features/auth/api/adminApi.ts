import { supabase } from '../../../shared/lib/supabaseClient'
import type { Profile } from '../../../shared/types'

interface UserWithEmail extends Profile {
  email?: string
}

// Get all users
export async function getAllUsers(): Promise<UserWithEmail[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return (data || []) as UserWithEmail[]
}

// Update a user role
export async function updateUserRole(
  userId: string,
  role: 'pending' | 'collector' | 'office' | 'admin'
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating role:', error)
    return false
  }

  return true
}

// Update user name
export async function updateUserName(
  userId: string,
  full_name: string
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name })
    .eq('id', userId)

  if (error) {
    console.error('Error updating name:', error)
    return false
  }

  return true
}