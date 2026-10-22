import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../app/config/supabaseClient';
import { TABLES } from '../../../app/config/constants';

export function useUpdateItemDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId, requiredQty, unit, rate,
    }: { itemId: string; requiredQty?: number | null; unit?: string; rate?: number | null }) => {
      const updates: Record<string, any> = {};
      if (requiredQty !== undefined) updates.required_qty = requiredQty;
      if (unit !== undefined) updates.unit = unit;
      if (rate !== undefined) updates.rate = rate;

      const { error } = await supabase.from(TABLES.ITEMS).update(updates).eq('id', itemId);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-planning', 'items'] });
    },
  });
}