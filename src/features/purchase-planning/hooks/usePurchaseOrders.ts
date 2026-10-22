// // import { useQuery } from '@tanstack/react-query';
// // import { supabase } from '../../../app/config/supabaseClient';

// // export interface ReviewLineItem {
// //   id: string;
// //   item_name: string;
// //   quantity: number;
// //   rate: number | null;
// // }

// // export interface ReviewPurchaseOrder {
// //   id: string;
// //   po_number: string;
// //   status: string;
// //   zoho_po_id: string | null;
// //   vendor_name: string;
// //   items: ReviewLineItem[];
// //   created_at: string;
// //   notes: string | null;
// //   is_draft_only: boolean;
// // }

// // export function usePurchaseOrders() {
// //   return useQuery<ReviewPurchaseOrder[]>({
// //     queryKey: ['purchase-orders'],
// //     queryFn: async () => {
// //       const { data, error } = await supabase
// //         .from('purchase_orders')
// //         .select('*, purchase_order_items(id, item_name, quantity, rate), farmers(name)')
// //         .order('created_at', { ascending: false });

// //       if (error) throw error;

// //       return (data ?? []).map((po: any) => ({
// //         id: po.id,
// //         po_number: po.po_number,
// //         status: po.status,
// //         zoho_po_id: po.zoho_po_id,
// //         vendor_name: po.farmers?.name ?? 'Unknown Vendor',
// //         created_at: po.created_at,
// //         notes: po.notes,
// //         is_draft_only: po.is_draft_only ?? false,
// //         items: (po.purchase_order_items ?? []).map((li: any) => ({
// //           id: li.id,
// //           item_name: li.item_name,
// //           quantity: li.quantity,
// //           rate: li.rate,
// //         })),
// //       }));
// //     },
// //   });
// // }
// import { useQuery } from '@tanstack/react-query';
// import { supabase } from '../../../app/config/supabaseClient';

// export interface ReviewLineItem {
//   id: string;
//   item_name: string;
//   quantity: number;
//   rate: number | null;
// }

// export interface ReviewPurchaseOrder {
//   id: string;
//   po_number: string;
//   status: string;
//   zoho_po_id: string | null;
//   vendor_name: string;
//   items: ReviewLineItem[];
//   created_at: string;
//   notes: string | null;
//   is_draft_only: boolean;
//   created_by?: string | null;
//   created_by_name?: string | null; // name of the person who collected / created this PO
// }

// export function usePurchaseOrders() {
//   return useQuery<ReviewPurchaseOrder[]>({
//     queryKey: ['purchase-orders'],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from('purchase_orders')
//         .select('*, purchase_order_items(id, item_name, quantity, rate), farmers(name)')
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       const rows = data ?? [];

//       // Look up the creators' names in one extra query.
//       const creatorIds = Array.from(
//         new Set(rows.map((po: any) => po.created_by).filter(Boolean))
//       ) as string[];

//       const nameById: Record<string, string> = {};
//       if (creatorIds.length > 0) {
//         const { data: profiles, error: profilesError } = await supabase
//           .from('profiles')
//           .select('id, full_name')
//           .in('id', creatorIds);

//         if (profilesError) {
//           // Don't break the page if names can't be loaded; the receipt
//           // falls back to "Procurement Team".
//           console.warn('Could not load creator names:', profilesError);
//         } else {
//           for (const p of profiles ?? []) {
//             if (p.full_name) nameById[p.id] = p.full_name;
//           }
//         }
//       }

//       return rows.map((po: any) => ({
//         id: po.id,
//         po_number: po.po_number,
//         status: po.status,
//         zoho_po_id: po.zoho_po_id,
//         vendor_name: po.farmers?.name ?? 'Unknown Vendor',
//         created_at: po.created_at,
//         notes: po.notes,
//         is_draft_only: po.is_draft_only ?? false,
//         created_by: po.created_by ?? null,
//         created_by_name: po.created_by ? nameById[po.created_by] ?? null : null,
//         items: (po.purchase_order_items ?? []).map((li: any) => ({
//           id: li.id,
//           item_name: li.item_name,
//           quantity: li.quantity,
//           rate: li.rate,
//         })),
//       }));
//     },
//   });
// }
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../app/config/supabaseClient';

export interface ReviewLineItem {
  id: string;
  item_name: string;
  quantity: number;
  rate: number | null;
}

export interface ReviewPurchaseOrder {
  id: string;
  po_number: string;
  status: string;
  zoho_po_id: string | null;
  vendor_name: string;
  items: ReviewLineItem[];
  created_at: string;
  notes: string | null;
  is_draft_only: boolean;
  created_by?: string | null;
  created_by_name?: string | null; // name of the person who collected / created this PO
}

// Names of the people who create POs change almost never, so each name is
// looked up once and then remembered. An empty string means "looked up, no
// name found".
const creatorNameCache = new Map<string, string>();

async function loadCreatorNames(ids: string[]): Promise<void> {
  const missing = ids.filter((id) => !creatorNameCache.has(id));
  if (missing.length === 0) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', missing);

  if (error) {
    // Don't break the page; the receipt falls back to "Procurement Team".
    console.warn('Could not load creator names:', error);
    return;
  }

  for (const id of missing) creatorNameCache.set(id, '');
  for (const p of data ?? []) {
    if (p.full_name) creatorNameCache.set(p.id, p.full_name);
  }
}

export function usePurchaseOrders() {
  return useQuery<ReviewPurchaseOrder[]>({
    queryKey: ['purchase-orders'],
    staleTime: 30 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, purchase_order_items(id, item_name, quantity, rate), farmers(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = data ?? [];

      const creatorIds = Array.from(
        new Set(rows.map((po: any) => po.created_by).filter(Boolean))
      ) as string[];
      await loadCreatorNames(creatorIds);

      return rows.map((po: any) => ({
        id: po.id,
        po_number: po.po_number,
        status: po.status,
        zoho_po_id: po.zoho_po_id,
        vendor_name: po.farmers?.name ?? 'Unknown Vendor',
        created_at: po.created_at,
        notes: po.notes,
        is_draft_only: po.is_draft_only ?? false,
        created_by: po.created_by ?? null,
        created_by_name: po.created_by ? creatorNameCache.get(po.created_by) || null : null,
        items: (po.purchase_order_items ?? []).map((li: any) => ({
          id: li.id,
          item_name: li.item_name,
          quantity: li.quantity,
          rate: li.rate,
        })),
      }));
    },
  });
}