// // import { useQuery } from '@tanstack/react-query';
// // import { supabase } from '../../../app/config/supabaseClient';
// // import { TABLES, EDGE_FUNCTIONS } from '../../../app/config/constants';

// // export interface ItemCatalogEntry {
// //   zoho_item_id: string;
// //   item_name: string;
// //   unit: string;
// //   rate?: number;
// //   purchase_rate?: number;
// //   category?: string | null;
// //   active?: boolean;
// // }

// // async function fetchItemCatalog(): Promise<ItemCatalogEntry[]> {
// //   const { data: cached, error: cacheError } = await supabase
// //     .from(TABLES.ZOHO_CACHE)
// //     .select('data')
// //     .eq('cache_key', 'items_catalog')
// //     .maybeSingle();

// //   if (!cacheError && cached?.data) {
// //     return cached.data as ItemCatalogEntry[];
// //   }

// //   const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.ZOHO_ITEMS);
// //   if (error) throw error;
// //   return data as ItemCatalogEntry[];
// // }

// // export function useItemCatalog() {
// //   return useQuery<ItemCatalogEntry[]>({
// //     queryKey: ['purchase-planning', 'item-catalog'],
// //     queryFn: fetchItemCatalog,
// //     staleTime: 8 * 60 * 1000,
// //   });
// // }
// import { useQuery } from '@tanstack/react-query';
// import { fetchZohoItems } from '../../purchase-orders/api/zohoApi';
// import type { ZohoItem } from '../../purchase-orders/api/zohoApi';

// export interface ItemCatalogEntry {
//   zoho_item_id: string;
//   item_name: string;
//   unit: string;
//   rate?: number;
//   purchase_rate?: number;
//   category?: string | null;
//   active?: boolean;
// }

// function toItemCatalogEntry(item: ZohoItem): ItemCatalogEntry {
//   return {
//     zoho_item_id: item.zoho_item_id,
//     item_name: item.name,
//     unit: item.unit ?? 'Kg',
//     rate: item.rate,
//     purchase_rate: item.purchase_rate,
//     category: item.category,
//     active: item.active,
//   };
// }

// async function fetchItemCatalog(): Promise<ItemCatalogEntry[]> {
//   // Same function, same cache, same result as Single PO — no separate
//   // code path, so both screens always show the identical item list.
//   const items = await fetchZohoItems(false);
//   return items.map(toItemCatalogEntry);
// }

// export function useItemCatalog() {
//   return useQuery<ItemCatalogEntry[]>({
//     queryKey: ['purchase-planning', 'item-catalog'],
//     queryFn: fetchItemCatalog,
//     staleTime: 5 * 60 * 1000, // 5 minutes — matches the Zoho item cache
//   });
// }
import { useQuery } from '@tanstack/react-query';
import { fetchZohoItems } from '../../purchase-orders/api/zohoApi';
import type { ZohoItem } from '../../purchase-orders/api/zohoApi';

export interface ItemCatalogEntry {
  zoho_item_id: string;
  item_name: string;
  unit: string;
  rate?: number;
  purchase_rate?: number;
  category?: string | null;
  active?: boolean;
}

function toItemCatalogEntry(item: ZohoItem): ItemCatalogEntry {
  return {
    zoho_item_id: item.zoho_item_id,
    item_name: item.name,
    unit: item.unit ?? 'Kg',
    rate: item.rate,
    purchase_rate: item.purchase_rate,
    category: item.category,
    active: item.active,
  };
}

async function fetchItemCatalog(): Promise<ItemCatalogEntry[]> {
  // Same function, same cache, same result as Single PO, so both screens
  // always show the identical item list.
  const items = await fetchZohoItems(false);
  return items.map(toItemCatalogEntry);
}

export function useItemCatalog() {
  return useQuery<ItemCatalogEntry[]>({
    queryKey: ['purchase-planning', 'item-catalog'],
    queryFn: fetchItemCatalog,
    staleTime: 30 * 60 * 1000,      // 30 minutes, matches the saved list
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,    // don't reload when the user switches tabs
    refetchOnReconnect: false,
  });
}