// import { supabase } from '../../../shared/lib/supabaseClient'

// interface POItem {
//   item_id: string
//   item_name: string
//   quantity: number
//   rate: number
//   amount: number
//   gst_percent?: number
//   gst_amount?: number
// }

// interface CreatePOPayload {
//   farmer_id: string
//   created_by: string
//   grand_total: number
//   subtotal?: number
//   total_tax?: number
//   notes: string
//   items: POItem[]
// }

// export async function createPurchaseOrder(
//   payload: CreatePOPayload
// ): Promise<{ po_number: string; id: string } | null> {

//   // Generate PO number
//   const { data: poNumberData, error: poNumberError } = await supabase
//     .rpc('generate_po_number')

//   if (poNumberError) {
//     console.error('Error generating PO number:', poNumberError)
//     return null
//   }

//   const po_number = poNumberData as string

//   // Insert purchase order
//   const { data: po, error: poError } = await supabase
//     .from('purchase_orders')
//     .insert({
//       po_number,
//       farmer_id: payload.farmer_id,
//       created_by: payload.created_by,
//       status: 'draft',
//       subtotal: payload.subtotal ?? payload.grand_total,
//       total_tax: payload.total_tax ?? 0,
//       grand_total: payload.grand_total,
//       notes: payload.notes,
//     })
//     .select()
//     .single()

//   if (poError) {
//     console.error('Error creating purchase order:', poError)
//     return null
//   }

//   // Insert items
//   const itemsToInsert = payload.items.map((item) => ({
//     po_id: po.id,
//     item_id: item.item_id,
//     item_name: item.item_name,
//     quantity: item.quantity,
//     rate: item.rate,
//     gst_percent: item.gst_percent ?? 0,
//     gst_amount: item.gst_amount ?? 0,
//     amount: item.amount,
//   }))

//   const { error: itemsError } = await supabase
//     .from('purchase_order_items')
//     .insert(itemsToInsert)

//   if (itemsError) {
//     console.error('Error inserting items:', itemsError)
//     return null
//   }

//   return { id: po.id, po_number: po.po_number }
// }

// // Delete a purchase order and its items
// export async function deletePurchaseOrder(id: string): Promise<boolean> {
//   const { error } = await supabase
//     .from('purchase_orders')
//     .delete()
//     .eq('id', id)

//   if (error) {
//     console.error('Error deleting purchase order:', error)
//     return false
//   }

//   return true
// }

// export async function previewNextPoNumber(): Promise<string> {
//   const year = new Date().getFullYear()
//   const { count, error } = await supabase
//     .from('purchase_orders')
//     .select('*', { count: 'exact', head: true })
//     .gte('created_at', `${year}-01-01`)

//   if (error) return `PO-${year}-XXXX`
//   const next = (count ?? 0) + 1
//   return `PO-${year}-${String(next).padStart(4, '0')}`
// }
import { supabase } from '../../../shared/lib/supabaseClient'

interface POItem {
  item_id: string
  item_name: string
  quantity: number
  rate: number
  amount: number
  gst_percent?: number
  gst_amount?: number
}

interface CreatePOPayload {
  farmer_id: string
  created_by: string
  grand_total: number
  subtotal?: number
  total_tax?: number
  notes: string
  items: POItem[]
}

export async function createPurchaseOrder(
  payload: CreatePOPayload
): Promise<{ po_number: string; id: string } | null> {

  // Generate PO number
  const { data: poNumberData, error: poNumberError } = await supabase
    .rpc('generate_po_number')

  if (poNumberError) {
    console.error('Error generating PO number:', poNumberError)
    return null
  }

  const po_number = poNumberData as string

  // Insert purchase order
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      po_number,
      farmer_id: payload.farmer_id,
      created_by: payload.created_by,
      status: 'draft',
      subtotal: payload.subtotal ?? payload.grand_total,
      total_tax: payload.total_tax ?? 0,
      grand_total: payload.grand_total,
      notes: payload.notes,
    })
    .select()
    .single()

  if (poError) {
    console.error('Error creating purchase order:', poError)
    return null
  }

  // Insert items
  const itemsToInsert = payload.items.map((item) => ({
    po_id: po.id,
    item_id: item.item_id,
    item_name: item.item_name,
    quantity: item.quantity,
    rate: item.rate,
    gst_percent: item.gst_percent ?? 0,
    gst_amount: item.gst_amount ?? 0,
    amount: item.amount,
  }))

  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(itemsToInsert)

  if (itemsError) {
    console.error('Error inserting items:', itemsError)
    return null
  }

  return { id: po.id, po_number: po.po_number }
}

// Loads one purchase order (with its vendor and items) so it can be edited.
export async function fetchPurchaseOrderForEdit(poId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, farmer:farmers(*), items:purchase_order_items(*)')
    .eq('id', poId)
    .maybeSingle()

  if (error) {
    console.error('Error loading purchase order for edit:', error)
    return null
  }
  return data
}

// Updates an existing purchase order in place (same PO number).
// Safe order of operations: new items are added first, then the header is
// updated, then the old items are removed. If anything fails, the new items
// are removed again so the order is never left half-changed.
export async function updatePurchaseOrder(
  poId: string,
  payload: Omit<CreatePOPayload, 'created_by'>
): Promise<{ success: boolean; error?: string }> {

  const { data: existing, error: existingError } = await supabase
    .from('purchase_orders')
    .select('id, zoho_po_id')
    .eq('id', poId)
    .maybeSingle()

  if (existingError || !existing) {
    return { success: false, error: 'Purchase order not found.' }
  }
  if (existing.zoho_po_id) {
    return { success: false, error: 'This purchase order is already uploaded to Zoho and cannot be edited.' }
  }

  const { data: oldItems, error: oldItemsError } = await supabase
    .from('purchase_order_items')
    .select('id')
    .eq('po_id', poId)

  if (oldItemsError) {
    console.error('Error reading existing items:', oldItemsError)
    return { success: false, error: 'Failed to read the existing items.' }
  }
  const oldItemIds = (oldItems ?? []).map((i: any) => i.id)

  // 1) add the new items
  const itemsToInsert = payload.items.map((item) => ({
    po_id: poId,
    item_id: item.item_id,
    item_name: item.item_name,
    quantity: item.quantity,
    rate: item.rate,
    gst_percent: item.gst_percent ?? 0,
    gst_amount: item.gst_amount ?? 0,
    amount: item.amount,
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('purchase_order_items')
    .insert(itemsToInsert)
    .select('id')

  if (insertError || !inserted) {
    console.error('Error inserting edited items:', insertError)
    return { success: false, error: 'Failed to save the items.' }
  }
  const newItemIds = inserted.map((i: any) => i.id)

  // 2) update the order header
  const { error: updateError } = await supabase
    .from('purchase_orders')
    .update({
      farmer_id: payload.farmer_id,
      subtotal: payload.subtotal ?? payload.grand_total,
      total_tax: payload.total_tax ?? 0,
      grand_total: payload.grand_total,
      notes: payload.notes,
      status: 'draft',
      notes_updated_at: undefined,
    })
    .eq('id', poId)

  if (updateError) {
    console.error('Error updating purchase order:', updateError)
    if (newItemIds.length > 0) {
      await supabase.from('purchase_order_items').delete().in('id', newItemIds)
    }
    return { success: false, error: 'Failed to update the purchase order.' }
  }

  // 3) remove the old items
  if (oldItemIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('purchase_order_items')
      .delete()
      .in('id', oldItemIds)

    if (deleteError) {
      console.error('Error removing old items:', deleteError)
      return { success: false, error: 'Saved, but the old items could not be removed. Please check the order.' }
    }
  }

  return { success: true }
}

// Delete a purchase order and its items
export async function deletePurchaseOrder(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting purchase order:', error)
    return false
  }

  return true
}

export async function previewNextPoNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const { count, error } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)

  if (error) return `PO-${year}-XXXX`
  const next = (count ?? 0) + 1
  return `PO-${year}-${String(next).padStart(4, '0')}`
}