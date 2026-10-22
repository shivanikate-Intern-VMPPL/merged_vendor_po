import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../app/config/supabaseClient";

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseOrderId: string) => {

      const { error: itemError } = await supabase
        .from("purchase_order_items")
        .delete()
        .eq("po_id", purchaseOrderId);

      if (itemError) throw itemError;

      const { error: poError } = await supabase
        .from("purchase_orders")
        .delete()
        .eq("id", purchaseOrderId);

      if (poError) throw poError;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders"],
      });
    },
  });
}