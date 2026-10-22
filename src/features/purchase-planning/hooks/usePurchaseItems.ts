
// import { useQuery } from '@tanstack/react-query';
// import { fetchRequiredItems } from '../api/purchasePlanningApi';
// import type { Item } from '../../../shared/types/domain';

// export function usePurchaseItems() {
//   return useQuery<Item[]>({
//     queryKey: ['purchase-planning', 'items'],
//     queryFn: fetchRequiredItems,
//   });
// }
import { useQuery } from '@tanstack/react-query';
import { fetchRequiredItems } from '../api/purchasePlanningApi';
import type { Item } from '../../../shared/types/domain';

// One shared key, so the hooks below can update the list on screen directly.
export const PURCHASE_ITEMS_KEY = ['purchase-planning', 'items'] as const;

export function usePurchaseItems() {
  return useQuery<Item[]>({
    queryKey: PURCHASE_ITEMS_KEY,
    queryFn: fetchRequiredItems,
    staleTime: 60 * 1000,          // do not reload again within a minute
    refetchOnWindowFocus: false,   // switching browser tabs must not reload the list
  });
}