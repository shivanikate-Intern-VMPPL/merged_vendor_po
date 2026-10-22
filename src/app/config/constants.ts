export const ROUTES = {
  PURCHASE_PLANNING: '/purchase-planning',
  PURCHASE_ORDERS_REVIEW: '/purchase-planning/review',
  PURCHASE_ORDERS_DRAFTS: '/purchase-planning/drafts',
  PURCHASE_ORDERS_SYNCED: '/purchase-planning/synced',
} as const;

export const EDGE_FUNCTIONS = {
  ZOHO_VENDORS: 'zoho-vendors',
  ZOHO_ITEMS: 'zoho-items',
  ZOHO_UPLOAD_PO: 'zoho-upload-po',
} as const;

export const TABLES = {
  ITEMS: 'purchase_requirements',
  FARMERS: 'farmers',
  PURCHASE_ORDERS: 'purchase_orders',
  PURCHASE_ORDER_ITEMS: 'purchase_order_items',
  ZOHO_CACHE: 'zoho_cache',
  PO_NUMBER_COUNTERS: 'po_number_counters',
} as const;