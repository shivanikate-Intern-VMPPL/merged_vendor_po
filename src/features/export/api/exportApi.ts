import { supabase } from '../../../shared/lib/supabaseClient'

export interface ExportRow {
  po_number: string
  farmer_name: string
  village: string
  item_name: string
  quantity: number
  rate: number
  amount: number
  grand_total: number
  date: string
}

export async function fetchExportData(
  fromDate: string,
  toDate: string
): Promise<ExportRow[]> {
  const toDatePlusOne = new Date(toDate)
  toDatePlusOne.setDate(toDatePlusOne.getDate() + 1)

  const { data: orders, error } = await supabase
    .from('purchase_orders')
    .select(`
      po_number,
      grand_total,
      created_at,
      farmers (
        name,
        village
      ),
      purchase_order_items (
        item_name,
        quantity,
        rate,
        amount
      )
    `)
    .gte('created_at', new Date(fromDate).toISOString())
    .lt('created_at', toDatePlusOne.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Export fetch error:', error)
    return []
  }

  if (!orders || orders.length === 0) return []

  const rows: ExportRow[] = []

  for (const order of orders) {
    const farmer = Array.isArray(order.farmers)
      ? order.farmers[0]
      : order.farmers

    const items = Array.isArray(order.purchase_order_items)
      ? order.purchase_order_items
      : []

    for (const item of items) {
      rows.push({
        po_number: order.po_number,
        farmer_name: farmer?.name ?? '',
        village: farmer?.village ?? '',
        item_name: item.item_name,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        grand_total: order.grand_total,
        date: new Date(order.created_at).toLocaleDateString('en-IN'),
      })
    }
  }

  return rows
}