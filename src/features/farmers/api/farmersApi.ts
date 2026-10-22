import { supabase } from '../../../shared/lib/supabaseClient'
import type { Farmer } from '../../../shared/types'

// Search farmers by name
export async function searchFarmers(query: string): Promise<Farmer[]> {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching farmers:', error)
    return []
  }

  return data || []
}

export async function getAllFarmers(): Promise<Farmer[]> {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching farmers:', error)
    return []
  }

  return data ?? []
}

// Add a new farmer
export async function addFarmer(
  farmer: Omit<Farmer, 'id' | 'created_at'>
): Promise<Farmer | null> {
  const { data, error } = await supabase
    .from('farmers')
    .insert(farmer)
    .select()
    .single()

  if (error) {
    console.error('Error adding farmer:', error)
    return null
  }

  return data
}