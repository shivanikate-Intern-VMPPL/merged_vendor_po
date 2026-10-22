// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { supabase } from '../../../app/config/supabaseClient';
// import { TABLES } from '../../../app/config/constants';

// export function useAddItem() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async () => {
//       const { error } = await supabase.from(TABLES.ITEMS).insert({
//         item_name: '',
//         required_qty: null,
//         unit: 'Kg',
//         rate: null,
//       });
//       if (error) throw error;
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ['purchase-planning', 'items'] });
//     },
//   });
// }
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../app/config/supabaseClient';
import { TABLES } from '../../../app/config/constants';
import type { Item } from '../../../shared/types/domain';
import { REQUIRED_ITEM_COLUMNS, toRequiredItem } from '../api/purchasePlanningApi';
import { PURCHASE_ITEMS_KEY } from './usePurchaseItems';

export function useAddItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from(TABLES.ITEMS)
        .insert({
          item_name: '',
          required_qty: null,
          unit: 'Kg',
          rate: null,
        })
        .select(REQUIRED_ITEM_COLUMNS)
        .single();

      if (error) throw error;
      return data;
    },

    // Add the new row to the list on screen, using the row the database returned.
    onSuccess: (row) => {
      queryClient.setQueryData<Item[]>(PURCHASE_ITEMS_KEY, (old) => [
        ...(old ?? []),
        toRequiredItem(row),
      ]);
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ITEMS_KEY });
    },
  });
}