// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { supabase } from '../../../app/config/supabaseClient';
// import { TABLES } from '../../../app/config/constants';

// export function useDeleteItem() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (itemId: string) => {
//       const { error } = await supabase.from(TABLES.ITEMS).delete().eq('id', itemId);
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
import { PURCHASE_ITEMS_KEY } from './usePurchaseItems';

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from(TABLES.ITEMS).delete().eq('id', itemId);
      if (error) throw error;
    },

    // Remove the row from the list on screen immediately, no reload needed.
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: PURCHASE_ITEMS_KEY });
      queryClient.setQueryData<Item[]>(PURCHASE_ITEMS_KEY, (old) =>
        old?.filter((item) => item.id !== itemId)
      );
    },

    // Only when deleting fails: reload so the screen matches the database.
    onError: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ITEMS_KEY });
    },
  });
}