
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { requireAuth, requireRole } from "../_shared/auth.ts"
import { getUserZohoConnection } from "../_shared/zoho.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  let auth
  try {
    auth = await requireAuth(req)
    requireRole(auth, ["collector", "office", "admin"])
  } catch (res) {
    return res as Response
  }

  try {
    const { po_id } = await req.json()
    if (!po_id) {
      return new Response(
        JSON.stringify({ error: "po_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: po, error: poError } = await supabaseAdmin
      .from("purchase_orders")
      .select("id, zoho_po_id, created_by")
      .eq("id", po_id)
      .maybeSingle()

    if (poError || !po) {
      return new Response(
        JSON.stringify({ error: "Purchase order not found", details: poError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!po.zoho_po_id) {
      return new Response(
        JSON.stringify({ error: "This purchase order hasn't been uploaded to Zoho yet. Upload it before attaching files." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // SECURITY FIX: paths are no longer trusted from the client. We list
    // only the files that live under this PO's own storage folder
    // (matches the "${po_id}/${Date.now()}_${safeName}" convention used
    // by SuccessScreen's uploader), so a caller can never name an
    // arbitrary path belonging to a different PO and exfiltrate it.
    const { data: files, error: listError } = await supabaseAdmin
      .storage
      .from("po-attachments")
      .list(po_id)

    if (listError) {
      return new Response(
        JSON.stringify({ error: "Failed to list attachments for this purchase order", details: listError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const paths = (files ?? []).map((f) => `${po_id}/${f.name}`)

    if (paths.length === 0) {
      return new Response(
        JSON.stringify({ success: true, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!po.created_by) {
      return new Response(
        JSON.stringify({ error: "This purchase order has no creator. Cannot select the Zoho account." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { accessToken, organizationId: ORG_ID } =
      await getUserZohoConnection(supabaseAdmin, po.created_by)

    const results: { path: string; success: boolean; error?: string }[] = []

    for (const path of paths) {
      try {
        const { data: fileBlob, error: downloadError } = await supabaseAdmin
          .storage
          .from("po-attachments")
          .download(path)

        if (downloadError || !fileBlob) {
          results.push({ path, success: false, error: "Failed to download from storage" })
          continue
        }

        const fileName = path.split("/").pop() || "attachment"
        const form = new FormData()
        form.append("attachment", fileBlob, fileName)

        const uploadRes = await fetch(
          `https://www.zohoapis.in/books/v3/purchaseorders/${po.zoho_po_id}/attachment?organization_id=${ORG_ID}`,
          {
            method: "POST",
            headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
            body: form,
          }
        )
        const uploadData = await uploadRes.json()

        if (uploadData.code !== 0) {
          results.push({ path, success: false, error: uploadData.message || "Zoho rejected the attachment" })
        } else {
          results.push({ path, success: true })
        }
      } catch (err) {
        results.push({ path, success: false, error: String(err) })
      }
    }

    const anyFailed = results.some((r) => !r.success)

    return new Response(
      JSON.stringify({ success: !anyFailed, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})