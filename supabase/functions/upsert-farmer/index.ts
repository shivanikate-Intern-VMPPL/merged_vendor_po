
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { requireAuth, requireRole } from "../_shared/auth.ts"

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
    const body = await req.json()
    const zohoVendorId = body.zohoVendorId
    const vendorName = body.vendorName

    if (!zohoVendorId || !vendorName) {
      return new Response(
        JSON.stringify({ error: "zohoVendorId and vendorName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: farmer, error } = await supabaseAdmin
      .from("farmers")
      .upsert(
        { zoho_contact_id: zohoVendorId, name: vendorName },
        { onConflict: "zoho_contact_id" }
      )
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message, details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ farmer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})