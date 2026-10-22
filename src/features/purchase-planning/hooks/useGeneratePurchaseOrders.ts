import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generatePurchaseOrders } from '../api/purchasePlanningApi';
import type { Item } from '../../../shared/types/domain';

export function useGeneratePurchaseOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      items, vendors, isDraftOnly,
    }: { items: Item[]; vendors: any[]; isDraftOnly?: boolean }) => {
      const vendorNameById = Object.fromEntries(vendors.map((v) => [v.id, v.name]));
      return generatePurchaseOrders(items, vendorNameById, isDraftOnly ?? false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-planning', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}