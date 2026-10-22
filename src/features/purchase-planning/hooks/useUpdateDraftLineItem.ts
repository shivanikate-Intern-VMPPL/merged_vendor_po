// useUpdateDraftLineItem.ts — full, final
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDraftLineItem } from '../api/purchasePlanningApi';

export function useUpdateDraftLineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lineItemId, updates,
    }: {
      lineItemId: string;
      updates: { item_name?: string; quantity?: number; rate?: number; zoho_item_id?: string | null };
    }) => updateDraftLineItem(lineItemId, updates),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}