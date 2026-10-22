import { supabase } from '../../../shared/lib/supabaseClient'
import type { Item } from '../../../shared/types'

// Get all items
export async function getAllItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching items:', error)
    return []
  }

  return data || []
}