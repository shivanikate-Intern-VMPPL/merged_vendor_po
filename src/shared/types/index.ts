import type { Role } from '../auth/roles'

export type { Role }

export interface Profile {
  id: string
  full_name: string
  mobile: string | null
  role: Role
  is_active: boolean
  created_at: string
}

export interface Farmer {
  id: string
  name: string
  village: string | null
  mobile: string | null
  farmer_code: string | null
  created_at: string
  zoho_contact_id?: string | null
}

export interface Item {
  id: string
  name: string
  default_rate: number
  default_gst_percent: number
  zoho_item_id?: string | null
  purchase_rate?: number
}

export interface PurchaseOrder {
  id: string
  po_number: string
  farmer_id: string
  created_by: string
  status: 'draft' | 'confirmed' | 'exported'
  subtotal: number
  total_tax: number
  grand_total: number
  notes: string | null
  created_at: string
  farmer?: Farmer
}

export interface PurchaseOrderItem {
  id: string
  po_id: string
  item_id: string
  item_name: string
  quantity: number
  rate: number
  gst_percent: number
  gst_amount: number
  amount: number
}