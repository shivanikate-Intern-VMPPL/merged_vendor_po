// // import { supabase } from '../../../app/config/supabaseClient';
// // import { TABLES, EDGE_FUNCTIONS } from '../../../app/config/constants';
// // import type { Item, PurchaseOrder, Vendor } from '../../../shared/types/domain';

// // const PURCHASE_ORDER_WRITE_FN = 'purchase-order-write';

// // async function callPurchaseOrderWrite<T = any>(action: string, payload: Record<string, any>): Promise<T> {
// //   const { data, error } = await supabase.functions.invoke(PURCHASE_ORDER_WRITE_FN, {
// //     body: { action, ...payload },
// //   });

// //   if (error) {
// //     let failureReason = `Failed to ${action}`;
// //     try {
// //       const context = (error as any).context;
// //       if (context) {
// //         const body = await context.json();
// //         failureReason = body?.error || failureReason;
// //       }
// //     } catch {
// //       // fall back to generic message
// //     }
// //     throw new Error(failureReason);
// //   }

// //   if (data?.error) {
// //     throw new Error(data.error);
// //   }

// //   return data as T;
// // }

// // export async function fetchRequiredItems(): Promise<Item[]> {
// //   const { data, error } = await supabase
// //     .from(TABLES.ITEMS)
// //     .select('id, item_name, required_qty, unit, vendor_id, rate, zoho_item_id, created_at')
// //     .order('created_at', { ascending: true }); // oldest first — new rows land at the bottom, not the top

// //   if (error) throw error;

// //   return (data ?? []).map((row: any) => ({
// //     id: row.id,
// //     item_name: row.item_name,
// //     required_qty: row.required_qty,
// //     unit: row.unit,
// //     vendor_id: row.vendor_id,
// //     rate: row.rate,
// //     zoho_item_id: row.zoho_item_id,
// //     vendor_name: null,
// //     status: row.vendor_id ? 'assigned' : 'pending',
// //   }));
// // }

// // export async function fetchVendors(): Promise<Vendor[]> {
// //   const { data: cached, error: cacheError } = await supabase
// //     .from(TABLES.ZOHO_CACHE)
// //     .select('data')
// //     .eq('cache_key', 'vendors')
// //     .maybeSingle();

// //   if (!cacheError && cached?.data) {
// //     return cached.data as Vendor[];
// //   }

// //   const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.ZOHO_VENDORS);
// //   if (error) throw error;
// //   return data as Vendor[];
// // }

// // export async function assignVendorToItem(itemId: string, vendorId: string | null): Promise<void> {
// //   const { error } = await supabase
// //     .from(TABLES.ITEMS)
// //     .update({ vendor_id: vendorId })
// //     .eq('id', itemId);

// //   if (error) throw error;
// // }

// // export function groupItemsByVendor(items: Item[]): Record<string, Item[]> {
// //   return items
// //     .filter((item) => item.vendor_id)
// //     .reduce<Record<string, Item[]>>((acc, item) => {
// //       const key = item.vendor_id as string;
// //       if (!acc[key]) acc[key] = [];
// //       acc[key].push(item);
// //       return acc;
// //     }, {});
// // }

// // // Generating POs used to write directly to `farmers`, `purchase_orders`,
// // // `purchase_order_items` and delete from `items` from the client — all
// // // four hit RLS 403s whenever the logged-in user wasn't the one the
// // // policies expected. This now runs as a single call into the
// // // `purchase-order-write` edge function (service role), so it works
// // // identically no matter who's logged in.
// // export async function generatePurchaseOrders(
// //   items: Item[],
// //   vendorNameById: Record<string, string>,
// //   isDraftOnly: boolean = false
// // ): Promise<PurchaseOrder[]> {
// //   const result = await callPurchaseOrderWrite<{ createdOrders: PurchaseOrder[] }>('generate', {
// //     items,
// //     vendorNameById,
// //     isDraftOnly,
// //   });
// //   return result.createdOrders;
// // }

// // export async function convertDraftToPurchaseOrder(id: string): Promise<void> {
// //   await callPurchaseOrderWrite('convertDraft', { poId: id });
// // }

// // export async function syncPurchaseOrderToZoho(purchaseOrderId: string): Promise<void> {
// //   const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.ZOHO_UPLOAD_PO, {
// //     body: { purchaseOrderId, po_id: purchaseOrderId },
// //   });

// //   if (error) {
// //     let failureReason = 'Zoho sync failed';
// //     try {
// //       const context = (error as any).context;
// //       if (context) {
// //         const body = await context.json();
// //         // Surface the real Zoho rejection reason (body.details), not just
// //         // the generic wrapper message — this is what was hidden before.
// //         const zohoMessage = body?.details?.message || body?.details?.error?.message;
// //         failureReason = zohoMessage || body?.error || failureReason;
// //       }
// //     } catch {
// //       // fall back to generic message
// //     }

// //     await supabase
// //       .from(TABLES.PURCHASE_ORDERS)
// //       .update({ status: 'failed', notes: failureReason })
// //       .eq('id', purchaseOrderId);
// //     throw new Error(failureReason);
// //   }

// //   await supabase
// //     .from(TABLES.PURCHASE_ORDERS)
// //     .update({
// //       status: 'synced',
// //       zoho_po_id: data.zohoPoId,
// //       zoho_uploaded_at: new Date().toISOString(),
// //     })
// //     .eq('id', purchaseOrderId);
// // }

// // export async function deletePurchaseOrder(id: string) {
// //   await callPurchaseOrderWrite('delete', { poId: id });
// // }

// // export async function updateDraftLineItem(
// //   lineItemId: string,
// //   updates: { item_name?: string; quantity?: number; rate?: number; zoho_item_id?: string | null }
// // ): Promise<void> {
// //   await callPurchaseOrderWrite('updateLineItem', { lineItemId, updates });
// // }

// // export async function updateDraftVendor(
// //   poId: string,
// //   zohoVendorId: string,
// //   vendorName: string
// // ): Promise<void> {
// //   await callPurchaseOrderWrite('updateVendor', { poId, zohoVendorId, vendorName });
// // }
// import { supabase } from '../../../app/config/supabaseClient';
// import { TABLES, EDGE_FUNCTIONS } from '../../../app/config/constants';
// import type { Item, PurchaseOrder, Vendor } from '../../../shared/types/domain';

// const PURCHASE_ORDER_WRITE_FN = 'purchase-order-write';

// async function callPurchaseOrderWrite<T = any>(action: string, payload: Record<string, any>): Promise<T> {
//   const { data, error } = await supabase.functions.invoke(PURCHASE_ORDER_WRITE_FN, {
//     body: { action, ...payload },
//   });

//   if (error) {
//     let failureReason = `Failed to ${action}`;
//     try {
//       const context = (error as any).context;
//       if (context) {
//         const body = await context.json();
//         failureReason = body?.error || failureReason;
//       }
//     } catch {
//       // fall back to generic message
//     }
//     throw new Error(failureReason);
//   }

//   if (data?.error) {
//     throw new Error(data.error);
//   }

//   return data as T;
// }

// // Columns of one row in the "items to purchase" list.
// export const REQUIRED_ITEM_COLUMNS =
//   'id, item_name, required_qty, unit, vendor_id, rate, zoho_item_id, created_at';

// // One place that turns a database row into an Item, used by the loader and
// // by the add-item hook, so the list on screen never differs from a reload.
// export function toRequiredItem(row: any): Item {
//   return {
//     id: row.id,
//     item_name: row.item_name,
//     required_qty: row.required_qty,
//     unit: row.unit,
//     vendor_id: row.vendor_id,
//     rate: row.rate,
//     zoho_item_id: row.zoho_item_id,
//     vendor_name: null,
//     status: row.vendor_id ? 'assigned' : 'pending',
//   };
// }

// export async function fetchRequiredItems(): Promise<Item[]> {
//   const { data, error } = await supabase
//     .from(TABLES.ITEMS)
//     .select(REQUIRED_ITEM_COLUMNS)
//     .order('created_at', { ascending: true }); // oldest first, new rows land at the bottom

//   if (error) throw error;

//   return (data ?? []).map(toRequiredItem);
// }

// export async function fetchVendors(): Promise<Vendor[]> {
//   const { data: cached, error: cacheError } = await supabase
//     .from(TABLES.ZOHO_CACHE)
//     .select('data')
//     .eq('cache_key', 'vendors')
//     .maybeSingle();

//   if (!cacheError && cached?.data) {
//     return cached.data as Vendor[];
//   }

//   const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.ZOHO_VENDORS);
//   if (error) throw error;
//   return data as Vendor[];
// }

// export async function assignVendorToItem(itemId: string, vendorId: string | null): Promise<void> {
//   const { error } = await supabase
//     .from(TABLES.ITEMS)
//     .update({ vendor_id: vendorId })
//     .eq('id', itemId);

//   if (error) throw error;
// }

// export function groupItemsByVendor(items: Item[]): Record<string, Item[]> {
//   return items
//     .filter((item) => item.vendor_id)
//     .reduce<Record<string, Item[]>>((acc, item) => {
//       const key = item.vendor_id as string;
//       if (!acc[key]) acc[key] = [];
//       acc[key].push(item);
//       return acc;
//     }, {});
// }

// // Generating POs runs as a single call into the `purchase-order-write` edge
// // function (service role), so it works identically no matter who is logged in.
// export async function generatePurchaseOrders(
//   items: Item[],
//   vendorNameById: Record<string, string>,
//   isDraftOnly: boolean = false
// ): Promise<PurchaseOrder[]> {
//   const result = await callPurchaseOrderWrite<{ createdOrders: PurchaseOrder[] }>('generate', {
//     items,
//     vendorNameById,
//     isDraftOnly,
//   });
//   return result.createdOrders;
// }

// export async function convertDraftToPurchaseOrder(id: string): Promise<void> {
//   await callPurchaseOrderWrite('convertDraft', { poId: id });
// }

// export async function syncPurchaseOrderToZoho(purchaseOrderId: string): Promise<void> {
//   const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.ZOHO_UPLOAD_PO, {
//     body: { purchaseOrderId, po_id: purchaseOrderId },
//   });

//   if (error) {
//     let failureReason = 'Zoho sync failed';
//     let errorCode: string | undefined;
//     let alreadyUploadedId: string | undefined;

//     try {
//       const context = (error as any).context;
//       if (context) {
//         const body = await context.json();
//         // Surface the real Zoho rejection reason, not just the generic wrapper.
//         const zohoMessage = body?.details?.message || body?.details?.error?.message;
//         failureReason = zohoMessage || body?.error || failureReason;
//         errorCode = body?.code;
//         alreadyUploadedId = body?.zoho_po_id;
//       }
//     } catch {
//       // fall back to generic message
//     }

//     // The PO is already in Zoho: record that, it is not a failure.
//     if (alreadyUploadedId) {
//       await supabase
//         .from(TABLES.PURCHASE_ORDERS)
//         .update({ status: 'synced', zoho_po_id: alreadyUploadedId })
//         .eq('id', purchaseOrderId);
//       return;
//     }

//     // Zoho busy / rate limited: the PO is fine, the user can simply try again,
//     // so do not mark it as failed.
//     const isTemporary = errorCode === 'zoho_temporary' || errorCode === 'zoho_rate_limited';
//     if (!isTemporary) {
//       await supabase
//         .from(TABLES.PURCHASE_ORDERS)
//         .update({ status: 'failed', notes: failureReason })
//         .eq('id', purchaseOrderId);
//     }

//     throw new Error(failureReason);
//   }

//   // The upload function already saves the PO as synced. Only write it from
//   // here if the function did not (older version), so a normal upload costs
//   // one call instead of two.
//   if (data?.status_set !== true) {
//     await supabase
//       .from(TABLES.PURCHASE_ORDERS)
//       .update({
//         status: 'synced',
//         zoho_po_id: data?.zoho_po_id ?? data?.zohoPoId,
//         zoho_uploaded_at: new Date().toISOString(),
//       })
//       .eq('id', purchaseOrderId);
//   }
// }

// export async function deletePurchaseOrder(id: string) {
//   await callPurchaseOrderWrite('delete', { poId: id });
// }

// export async function updateDraftLineItem(
//   lineItemId: string,
//   updates: { item_name?: string; quantity?: number; rate?: number; zoho_item_id?: string | null }
// ): Promise<void> {
//   await callPurchaseOrderWrite('updateLineItem', { lineItemId, updates });
// }

// export async function updateDraftVendor(
//   poId: string,
//   zohoVendorId: string,
//   vendorName: string
// ): Promise<void> {
//   await callPurchaseOrderWrite('updateVendor', { poId, zohoVendorId, vendorName });
// }
import { supabase } from '../../../app/config/supabaseClient';
import { TABLES, EDGE_FUNCTIONS } from '../../../app/config/constants';
import type { Item, PurchaseOrder, Vendor } from '../../../shared/types/domain';
import { fetchZohoVendors } from '../../purchase-orders/api/zohoApi';

const PURCHASE_ORDER_WRITE_FN = 'purchase-order-write';

function isUnauthorizedFunctionError(error: unknown): boolean {
  if (!(error instanceof Error) || !('context' in error)) return false;
  const context = error.context;
  return context instanceof Response && context.status === 401;
}

async function callPurchaseOrderWrite<T = any>(action: string, payload: Record<string, any>): Promise<T> {
  const invoke = () => supabase.functions.invoke(PURCHASE_ORDER_WRITE_FN, {
    body: { action, ...payload },
  });
  let result = await invoke();

  if (result.error && isUnauthorizedFunctionError(result.error)) {
    const { data: sessionData, error: refreshError } =
      await supabase.auth.refreshSession();

    if (refreshError) {
      throw new Error(`Your session expired and could not be refreshed: ${refreshError.message}`);
    }

    if (!sessionData.session) {
      throw new Error('Your session expired. Please sign in again.');
    }

    result = await invoke();
  }

  const { data, error } = result;

  if (error) {
    let failureReason = `Failed to ${action}`;
    try {
      const context = (error as any).context;
      if (context) {
        const body = await context.json();
        failureReason = body?.error || failureReason;
      }
    } catch {
      // fall back to generic message
    }
    throw new Error(failureReason);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as T;
}

// Columns of one row in the "items to purchase" list.
export const REQUIRED_ITEM_COLUMNS =
  'id, item_name, required_qty, unit, vendor_id, rate, zoho_item_id, created_at';

// One place that turns a database row into an Item, used by the loader and
// by the add-item hook, so the list on screen never differs from a reload.
export function toRequiredItem(row: any): Item {
  return {
    id: row.id,
    item_name: row.item_name,
    required_qty: row.required_qty,
    unit: row.unit,
    vendor_id: row.vendor_id,
    rate: row.rate,
    zoho_item_id: row.zoho_item_id,
    vendor_name: null,
    status: row.vendor_id ? 'assigned' : 'pending',
  };
}

export async function fetchRequiredItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from(TABLES.ITEMS)
    .select(REQUIRED_ITEM_COLUMNS)
    .order('created_at', { ascending: true }); // oldest first, new rows land at the bottom

  if (error) throw error;

  return (data ?? []).map(toRequiredItem);
}

// Vendor list for the Bulk screens. It uses the SAME Zoho vendor list as the
// Single PO form (browser copy -> shared saved list -> Zoho), so both screens
// always show identical vendors. The vendor id is the Zoho contact id.
// This always returns a real list, never an object.
export async function fetchVendors(): Promise<Vendor[]> {
  const zohoVendors = await fetchZohoVendors(false);

  // Also fetch mobile numbers from Supabase vendors table (onboarded vendors)
  let sbVendors: any[] = [];
  try {
    const { data } = await supabase
      .from('vendors')
      .select('id, vendor_name, mobile, zoho_contact_id, status')
      .not('zoho_contact_id', 'is', null);
    sbVendors = data || [];
  } catch (err) {
    console.warn('Could not read Supabase vendors table for mobile numbers:', err);
  }

  const sbMobileByZohoId = new Map<string, string>();
  for (const sv of sbVendors) {
    if (sv.zoho_contact_id && sv.mobile) {
      sbMobileByZohoId.set(sv.zoho_contact_id, sv.mobile);
    }
  }

  const seen = new Set<string>();
  const vendors: Vendor[] = [];

  for (const v of zohoVendors) {
    if (!v.zoho_contact_id || seen.has(v.zoho_contact_id)) continue;
    seen.add(v.zoho_contact_id);

    // Prefer Supabase mobile if present, else Zoho phone
    const mobile = sbMobileByZohoId.get(v.zoho_contact_id) || v.phone || null;

    vendors.push({
      id: v.zoho_contact_id,
      name: v.name,
      company_name: v.company_name,
      email: v.email,
      phone: v.phone,
      mobile,
    } as unknown as Vendor);
  }

  return vendors.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

export async function assignVendorToItem(itemId: string, vendorId: string | null): Promise<void> {
  const { error } = await supabase
    .from(TABLES.ITEMS)
    .update({ vendor_id: vendorId })
    .eq('id', itemId);

  if (error) throw error;
}

export function groupItemsByVendor(items: Item[]): Record<string, Item[]> {
  return items
    .filter((item) => item.vendor_id)
    .reduce<Record<string, Item[]>>((acc, item) => {
      const key = item.vendor_id as string;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
}

// Generating POs runs as a single call into the `purchase-order-write` edge
// function (service role), so it works identically no matter who is logged in.
export async function generatePurchaseOrders(
  items: Item[],
  vendorNameById: Record<string, string>,
  isDraftOnly: boolean = false
): Promise<PurchaseOrder[]> {
  const result = await callPurchaseOrderWrite<{ createdOrders: PurchaseOrder[] }>('generate', {
    items,
    vendorNameById,
    isDraftOnly,
  });
  return result.createdOrders;
}

export async function convertDraftToPurchaseOrder(id: string): Promise<void> {
  await callPurchaseOrderWrite('convertDraft', { poId: id });
}

export async function syncPurchaseOrderToZoho(purchaseOrderId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.ZOHO_UPLOAD_PO, {
    body: { purchaseOrderId, po_id: purchaseOrderId },
  });

  if (error) {
    let failureReason = 'Zoho sync failed';
    let errorCode: string | undefined;
    let alreadyUploadedId: string | undefined;

    try {
      const context = (error as any).context;
      if (context) {
        const body = await context.json();
        // Surface the real Zoho rejection reason, not just the generic wrapper.
        const zohoMessage = body?.details?.message || body?.details?.error?.message;
        failureReason = zohoMessage || body?.error || failureReason;
        errorCode = body?.code;
        alreadyUploadedId = body?.zoho_po_id;
      }
    } catch {
      // fall back to generic message
    }

    // The PO is already in Zoho: record that, it is not a failure.
    if (alreadyUploadedId) {
      await supabase
        .from(TABLES.PURCHASE_ORDERS)
        .update({ status: 'synced', zoho_po_id: alreadyUploadedId })
        .eq('id', purchaseOrderId);
      return;
    }

    // Zoho busy / rate limited: the PO is fine and the user can simply try
    // again, so do not mark it as failed.
    const isTemporary = errorCode === 'zoho_temporary' || errorCode === 'zoho_rate_limited';
    if (!isTemporary) {
      await supabase
        .from(TABLES.PURCHASE_ORDERS)
        .update({ status: 'failed', notes: failureReason })
        .eq('id', purchaseOrderId);
    }

    throw new Error(failureReason);
  }

  // The upload function already saves the PO as synced. Only write it from
  // here if the function did not (older version).
  if (data?.status_set !== true) {
    await supabase
      .from(TABLES.PURCHASE_ORDERS)
      .update({
        status: 'synced',
        zoho_po_id: data?.zoho_po_id ?? data?.zohoPoId,
        zoho_uploaded_at: new Date().toISOString(),
      })
      .eq('id', purchaseOrderId);
  }
}

export async function deletePurchaseOrder(id: string) {
  await callPurchaseOrderWrite('delete', { poId: id });
}

export async function updateDraftLineItem(
  lineItemId: string,
  updates: { item_name?: string; quantity?: number; rate?: number; zoho_item_id?: string | null }
): Promise<void> {
  await callPurchaseOrderWrite('updateLineItem', { lineItemId, updates });
}

export async function updateDraftVendor(
  poId: string,
  zohoVendorId: string,
  vendorName: string
): Promise<void> {
  await callPurchaseOrderWrite('updateVendor', { poId, zohoVendorId, vendorName });
}