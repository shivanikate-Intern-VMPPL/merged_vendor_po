export interface OrderItem {
  item_id: string
  item_name: string
  quantity: number
  rate: number
  amount: number
  row_comment?: string
  is_manual?: boolean
  unit?: string   // NEW — 'Kg' | 'Bunch' | 'Packs' | 'Bags'
  gst_percent?: number
  gst_amount?: number
}

export function calculateItemAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate * 100) / 100
}

export function calculateOrderTotals(items: OrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const total_tax = items.reduce((sum, item) => sum + (item.gst_amount || 0), 0)
  const grand_total = subtotal + total_tax
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    total_tax: Math.round(total_tax * 100) / 100,
    grand_total: Math.round(grand_total * 100) / 100,
  }
}