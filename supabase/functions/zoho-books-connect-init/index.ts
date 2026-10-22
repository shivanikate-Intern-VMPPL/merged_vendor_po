import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { requireAuth } from "../_shared/auth.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const ZOHO_BOOKS_SCOPE =
  "ZohoBooks.purchaseorders.CREATE,ZohoBooks.purchaseorders.READ,ZohoBooks.contacts.READ,ZohoBooks.settings.READ"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }

  let auth

  try {
    auth = await requireAuth(req)
  } catch (res) {
    return res as Response
  }

  const clientId = Deno.env.get("ZOHO_CLIENT_ID")
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const configuredRedirectUri = Deno.env.get("ZOHO_REDIRECT_URI")

  if (!clientId || !supabaseUrl) {
    console.error("Missing ZOHO_CLIENT_ID or SUPABASE_URL")

    return new Response(
      JSON.stringify({ error: "Zoho configuration is incomplete" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data: stateRow, error: stateError } =
    await supabaseAdmin
      .from("zoho_oauth_states")
      .insert({
        user_id: auth.userId,
      })
      .select("state")
      .single()

  if (stateError || !stateRow?.state) {
    console.error("Failed to create OAuth state:", stateError)

    return new Response(
      JSON.stringify({
        error: "Failed to start Zoho Books connection",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }

  const redirectUri = configuredRedirectUri || new URL(
    "/functions/v1/zoho-books-callback",
    supabaseUrl
  ).toString()

  const authUrl = new URL(
    "https://accounts.zoho.in/oauth/v2/auth"
  )

  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("scope", ZOHO_BOOKS_SCOPE)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("access_type", "offline")
  authUrl.searchParams.set("prompt", "consent")
  authUrl.searchParams.set("state", stateRow.state)

  return new Response(
    JSON.stringify({
      url: authUrl.toString(),
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  )
})