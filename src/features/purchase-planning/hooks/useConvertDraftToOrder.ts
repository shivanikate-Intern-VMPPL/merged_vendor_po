import { useMutation, useQueryClient } from '@tanstack/react-query';
import { convertDraftToPurchaseOrder } from '../api/purchasePlanningApi';

export function useConvertDraftToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => convertDraftToPurchaseOrder(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}