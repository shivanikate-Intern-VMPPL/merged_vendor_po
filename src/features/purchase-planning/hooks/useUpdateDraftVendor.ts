import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDraftVendor } from '../api/purchasePlanningApi';

export function useUpdateDraftVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      poId, zohoVendorId, vendorName,
    }: { poId: string; zohoVendorId: string; vendorName: string }) =>
      updateDraftVendor(poId, zohoVendorId, vendorName),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}