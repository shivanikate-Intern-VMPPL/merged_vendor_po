// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { syncPurchaseOrderToZoho } from '../api/purchasePlanningApi';

// export function useSyncPurchaseOrder() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (purchaseOrderId: string) => syncPurchaseOrderToZoho(purchaseOrderId),
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
//     },
//   });
// }
import { useMutation } from '@tanstack/react-query';
import { syncPurchaseOrderToZoho } from '../api/purchasePlanningApi';

export function useSyncPurchaseOrder() {
  return useMutation({
    mutationFn: (purchaseOrderId: string) => syncPurchaseOrderToZoho(purchaseOrderId),
  });
}