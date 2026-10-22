
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { requireAuth, requireRole } from "../_shared/auth.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

// Only these four fields may ever be written via updateLineItem — fixes
// mass assignment where the client could otherwise set po_id or any other
// column on purchase_order_items directly from the request body.
const ALLOWED_LINE_ITEM_FIELDS = ["item_name", "quantity", "rate", "zoho_item_id"] as const

function pickAllowed(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of ALLOWED_LINE_ITEM_FIELDS) {
    if (key in input) out[key] = input[key]
  }
  return out
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  let auth
  try {
    auth = await requireAuth(req)
  } catch (res) {
    return res as Response
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  try {
    const body = await req.json()
    const action = body.action

    if (action === "generate") {
      try {
        requireRole(auth, ["collector", "office", "admin"])
      } catch (res) {
        return res as Response
      }

      const items = body.items as any[]
      const vendorNameById = (body.vendorNameById || {}) as Record<string, string>
      const isDraftOnly = !!body.isDraftOnly

      const grouped: Record<string, any[]> = {}
      for (const item of items || []) {
        if (!item.vendor_id) continue
        if (!grouped[item.vendor_id]) grouped[item.vendor_id] = []
        grouped[item.vendor_id].push(item)
      }

      const createdOrders: any[] = []

      for (const [zohoVendorId, vendorItems] of Object.entries(grouped)) {
        const vendorName = vendorNameById[zohoVendorId] ?? "Unknown Vendor"

        const { data: farmer, error: farmerError } = await supabaseAdmin
          .from("farmers")
          .upsert({ zoho_contact_id: zohoVendorId, name: vendorName }, { onConflict: "zoho_contact_id" })
          .select()
          .single()
        if (farmerError) throw farmerError

        const { data: poNumberData, error: counterError } = await supabaseAdmin.rpc("next_po_number")
        if (counterError) throw counterError
        const poNumber = poNumberData as string

        const { data: po, error: poError } = await supabaseAdmin
          .from("purchase_orders")
          .insert({ po_number: poNumber, farmer_id: farmer.id, status: "draft", is_draft_only: isDraftOnly, created_by: auth.userId })
          .select()
          .single()
        if (poError) throw poError

        const lineItems = (vendorItems as any[]).map((item: any) => {
          const qty = item.required_qty ?? 0
          const rate = item.rate ?? 0
          const amount = qty * rate
          return {
            po_id: po.id,
            item_name: item.item_name,
            zoho_item_id: item.zoho_item_id ?? null,
            quantity: qty,
            rate,
            gst_percent: 0,
            gst_amount: 0,
            amount,
          }
        })

        const { error: lineItemsError } = await supabaseAdmin
          .from("purchase_order_items")
          .insert(lineItems)
        if (lineItemsError) throw lineItemsError

        const subtotal = lineItems.reduce((sum: number, li: any) => sum + li.amount, 0)
        const { error: subtotalError } = await supabaseAdmin
          .from("purchase_orders")
          .update({ subtotal, total_tax: 0, grand_total: subtotal })
          .eq("id", po.id)
        if (subtotalError) throw subtotalError

        createdOrders.push({
          id: po.id,
          po_number: po.po_number,
          vendor_id: zohoVendorId,
          vendor_name: vendorName,
          status: "draft",
          is_draft_only: isDraftOnly,
          zoho_po_id: null,
          items: lineItems.map((li: any) => ({
            item_id: li.zoho_item_id ?? "",
            item_name: li.item_name,
            quantity: li.quantity,
            rate: li.rate,
            unit: "",
          })),
          created_at: new Date().toISOString(),
        })

        const ids = (vendorItems as any[]).map((i: any) => i.id)
        const { error: deleteError } = await supabaseAdmin
          .from("purchase_requirements")
          .delete()
          .in("id", ids)
        if (deleteError) throw deleteError
      }

      return json({ createdOrders })
    }

    if (action === "convertDraft") {
      try {
        requireRole(auth, ["collector", "office", "admin"])
      } catch (res) {
        return res as Response
      }

      const { poId } = body
      if (!poId) return json({ error: "poId is required" }, 400)

      const { error } = await supabaseAdmin
        .from("purchase_orders")
        .update({ is_draft_only: false })
        .eq("id", poId)
      if (error) throw error

      return json({ success: true })
    }

    if (action === "delete") {
      try {
        requireRole(auth, ["office", "admin"])
      } catch (res) {
        return res as Response
      }

      const { poId } = body
      if (!poId) return json({ error: "poId is required" }, 400)

      const { error: itemError } = await supabaseAdmin
        .from("purchase_order_items")
        .delete()
        .eq("po_id", poId)
      if (itemError) throw itemError

      const { error } = await supabaseAdmin
        .from("purchase_orders")
        .delete()
        .eq("id", poId)
      if (error) throw error

      return json({ success: true })
    }

    if (action === "updateLineItem") {
      try {
        requireRole(auth, ["collector", "office", "admin"])
      } catch (res) {
        return res as Response
      }

      const { lineItemId, updates } = body
      if (!lineItemId) return json({ error: "lineItemId is required" }, 400)

      const safeUpdates = pickAllowed(updates || {})

      const { data: current, error: fetchError } = await supabaseAdmin
        .from("purchase_order_items")
        .select("po_id, quantity, rate")
        .eq("id", lineItemId)
        .single()
      if (fetchError) throw fetchError

      const newQuantity = safeUpdates.quantity ?? current.quantity
      const newRate = safeUpdates.rate ?? current.rate
      const amount = (newQuantity as number ?? 0) * (newRate as number ?? 0)

      const { data: updatedRows, error } = await supabaseAdmin
        .from("purchase_order_items")
        .update({ ...safeUpdates, amount })
        .eq("id", lineItemId)
        .select("id")
      if (error) throw error
      if (!updatedRows || updatedRows.length === 0) {
        return json({ error: "The update did not save — line item not found." }, 404)
      }

      const { data: allLines, error: linesError } = await supabaseAdmin
        .from("purchase_order_items")
        .select("amount")
        .eq("po_id", current.po_id)
      if (linesError) throw linesError

      const subtotal = (allLines ?? []).reduce((sum: number, li: any) => sum + (li.amount ?? 0), 0)
      const { error: poUpdateError } = await supabaseAdmin
        .from("purchase_orders")
        .update({ subtotal, grand_total: subtotal })
        .eq("id", current.po_id)
      if (poUpdateError) throw poUpdateError

      return json({ success: true })
    }

    if (action === "updateVendor") {
      try {
        requireRole(auth, ["collector", "office", "admin"])
      } catch (res) {
        return res as Response
      }

      const { poId, zohoVendorId, vendorName } = body
      if (!poId || !zohoVendorId || !vendorName) {
        return json({ error: "poId, zohoVendorId and vendorName are required" }, 400)
      }

      const { data: farmer, error: farmerError } = await supabaseAdmin
        .from("farmers")
        .upsert({ zoho_contact_id: zohoVendorId, name: vendorName }, { onConflict: "zoho_contact_id" })
        .select()
        .single()
      if (farmerError) throw farmerError

      const { error } = await supabaseAdmin
        .from("purchase_orders")
        .update({ farmer_id: farmer.id })
        .eq("id", poId)
      if (error) throw error

      return json({ success: true, farmer })
    }

    if (action === "list") {
      // requireAuth already guarantees a non-null role (pending/collector/
      // office/admin). "pending" is meant to mean no access — the client's
      // ROLE_PERMISSIONS.pending: [] says as much — so explicitly exclude
      // it here rather than letting a pending user read every PO.
      try {
        requireRole(auth, ["collector", "office", "admin"])
      } catch (res) {
        return res as Response
      }

      const { data, error } = await supabaseAdmin
        .from("purchase_orders")
        .select("*, purchase_order_items(id, item_name, quantity, rate), farmers(name)")
        .order("created_at", { ascending: false })
      if (error) throw error

      const orders = (data ?? []).map((po: any) => ({
        id: po.id,
        po_number: po.po_number,
        status: po.status,
        zoho_po_id: po.zoho_po_id,
        vendor_name: po.farmers?.name ?? "Unknown Vendor",
        created_at: po.created_at,
        notes: po.notes,
        is_draft_only: po.is_draft_only ?? false,
        items: (po.purchase_order_items ?? []).map((li: any) => ({
          id: li.id,
          item_name: li.item_name,
          quantity: li.quantity,
          rate: li.rate,
        })),
      }))

      return json({ orders })
    }

    return json({ error: `Unknown action: ${action}` }, 400)
  } catch (err) {
    if (err instanceof Response) return err
    return json({ error: "Unexpected error", details: String(err) }, 500)
  }
})