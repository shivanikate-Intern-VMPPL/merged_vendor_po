// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { supabase } from '../../../app/config/supabaseClient';
// import { TABLES } from '../../../app/config/constants';

// export function useRenameItem() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       itemId, itemName, unit, zohoItemId,
//     }: { itemId: string; itemName: string; unit: string; zohoItemId?: string | null }) => {
//       const { error } = await supabase
//         .from(TABLES.ITEMS)
//         .update({ item_name: itemName, unit, zoho_item_id: zohoItemId ?? null })
//         .eq('id', itemId);
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

interface RenameVars {
  itemId: string;
  itemName: string;
  unit: string;
  zohoItemId?: string | null;
}

export function useRenameItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, itemName, unit, zohoItemId }: RenameVars) => {
      const { error } = await supabase
        .from(TABLES.ITEMS)
        .update({ item_name: itemName, unit, zoho_item_id: zohoItemId ?? null })
        .eq('id', itemId);
      if (error) throw error;
    },

    onMutate: async (vars: RenameVars) => {
      await queryClient.cancelQueries({ queryKey: PURCHASE_ITEMS_KEY });

      queryClient.setQueryData<Item[]>(PURCHASE_ITEMS_KEY, (old) =>
        old?.map((item) =>
          item.id !== vars.itemId
            ? item
            : {
                ...item,
                item_name: vars.itemName,
                unit: vars.unit,
                zoho_item_id: vars.zohoItemId ?? null,
              }
        )
      );
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ITEMS_KEY });
    },
  });
}