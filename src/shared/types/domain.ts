export interface Item {
  id: string;
  item_name: string;
  required_qty: number | null;
  unit: string;
  vendor_id: string | null;
  rate?: number | null;
  zoho_item_id?: string | null;
  vendor_name?: string | null;
  status?: 'pending' | 'assigned';
}

export interface Vendor {
  id: string;
  zoho_vendor_id?: string;
  name: string;
  mobile?: string | null;
  phone?: string | null;
}

export interface PurchaseOrderLineItem {
  item_id: string;
  item_name: string;
  quantity: number;
  rate?: number | null;
  unit: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  vendor_name: string;
  status: string;
  is_draft_only: boolean;
  zoho_po_id: string | null;
  items: PurchaseOrderLineItem[];
  created_at: string;
}