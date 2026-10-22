import { supabase } from '../../../shared/lib/supabaseClient'
import type { Item } from '../../../shared/types'
import type { ZohoItem } from '../../purchase-orders/api/zohoApi'

export async function resolveZohoItem(zohoItem: ZohoItem): Promise<Item | null> {
  const { data: existing } = await supabase
    .from('items')
    .select('*')
    .eq('zoho_item_id', zohoItem.zoho_item_id)
    .maybeSingle()

  if (existing) return existing as Item

  const { data: created, error } = await supabase
    .from('items')
    .insert({
      name: zohoItem.name,
      default_rate: zohoItem.purchase_rate,
      default_gst_percent: 0,
      zoho_item_id: zohoItem.zoho_item_id,
    })
    .select()
    .maybeSingle()

  if (error) {
    console.error('Failed to create local item from Zoho item:', error)
    return null
  }

  return created as Item
}