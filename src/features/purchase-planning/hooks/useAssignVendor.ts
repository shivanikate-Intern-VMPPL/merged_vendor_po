// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { assignVendorToItem } from '../api/purchasePlanningApi';
// import type { Item } from '../../../shared/types/domain';

// export function useAssignVendor() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ itemId, vendorId }: { itemId: string; vendorId: string | null }) =>
//       assignVendorToItem(itemId, vendorId),

//     onMutate: async ({ itemId, vendorId }) => {
//       await queryClient.cancelQueries({ queryKey: ['purchase-planning', 'items'] });
//       const previous = queryClient.getQueryData<Item[]>(['purchase-planning', 'items']);

//       queryClient.setQueryData<Item[]>(['purchase-planning', 'items'], (old) =>
//         old?.map((item) =>
//           item.id === itemId ? { ...item, vendor_id: vendorId, status: vendorId ? 'assigned' : 'pending' } : item
//         )
//       );

//       return { previous };
//     },

//     onError: (_err, _vars, context) => {
//       if (context?.previous) {
//         queryClient.setQueryData(['purchase-planning', 'items'], context.previous);
//       }
//     },

//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ['purchase-planning', 'items'] });
//     },
//   });
// }
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignVendorToItem } from '../api/purchasePlanningApi';
import type { Item } from '../../../shared/types/domain';
import { PURCHASE_ITEMS_KEY } from './usePurchaseItems';

interface AssignVars {
  itemId: string;
  vendorId: string | null;
}

export function useAssignVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, vendorId }: AssignVars) => assignVendorToItem(itemId, vendorId),

    onMutate: async (vars: AssignVars) => {
      await queryClient.cancelQueries({ queryKey: PURCHASE_ITEMS_KEY });

      queryClient.setQueryData<Item[]>(PURCHASE_ITEMS_KEY, (old) =>
        old?.map((item) =>
          item.id !== vars.itemId
            ? item
            : {
                ...item,
                vendor_id: vars.vendorId,
                status: vars.vendorId ? 'assigned' : 'pending',
              }
        )
      );
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_ITEMS_KEY });
    },
  });
}