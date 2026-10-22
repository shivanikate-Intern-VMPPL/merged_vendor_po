import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url)

  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const zohoError = url.searchParams.get("error")

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const clientId = Deno.env.get("ZOHO_CLIENT_ID")
  const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")
  const appUrl = Deno.env.get("APP_URL")
  const configuredRedirectUri = Deno.env.get("ZOHO_REDIRECT_URI")

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !clientId ||
    !clientSecret ||
    !appUrl
  ) {
    console.error("Missing required environment variables")

    return new Response("Server configuration error", {
      status: 500,
    })
  }

  let appBaseUrl: URL
  try {
    appBaseUrl = new URL(appUrl)
  } catch {
    console.error("APP_URL is not a valid URL")
    return new Response("Server configuration error", { status: 500 })
  }

  const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey
  )

  const redirectToSettings = (
    status: "connected" | "error",
    message?: string
  ) => {
    const redirectUrl = new URL("/settings", appBaseUrl)

    redirectUrl.searchParams.set(
      "zoho_books",
      status
    )

    if (message) {
      redirectUrl.searchParams.set(
        "message",
        message
      )
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
      },
    })
  }

  // User cancelled Zoho authorization
  if (zohoError) {
    console.error("Zoho authorization error:", zohoError)

    return redirectToSettings(
      "error",
      "Zoho authorization was cancelled."
    )
  }

  // Required OAuth parameters
  if (!code || !state) {
    return redirectToSettings(
      "error",
      "Missing authorization code or state."
    )
  }

  // Find the state created when the Mulyam user started the connection
  const { data: stateRow, error: stateError } =
    await supabaseAdmin
      .from("zoho_oauth_states")
      .select("user_id, expires_at")
      .eq("state", state)
      .maybeSingle()

  if (stateError) {
    console.error(
      "Failed to read OAuth state:",
      stateError
    )

    return redirectToSettings(
      "error",
      "Failed to verify the connection request."
    )
  }

  if (!stateRow) {
    return redirectToSettings(
      "error",
      "Invalid or expired connection request. Please try again."
    )
  }

  // Delete the state immediately so it cannot be reused
  await supabaseAdmin
    .from("zoho_oauth_states")
    .delete()
    .eq("state", state)

  // Check expiration
  if (
    new Date(stateRow.expires_at).getTime() <
    Date.now()
  ) {
    return redirectToSettings(
      "error",
      "Connection request expired. Please try again."
    )
  }

  const redirectUri = configuredRedirectUri || new URL(
    "/functions/v1/zoho-books-callback",
    supabaseUrl
  ).toString()

  // Exchange authorization code for tokens
  const tokenResponse = await fetch(
    "https://accounts.zoho.in/oauth/v2/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    }
  )

  const tokenData = await tokenResponse.json()

  if (!tokenResponse.ok) {
    console.error(
      "Zoho token exchange failed:",
      tokenData
    )

    return redirectToSettings(
      "error",
      "Zoho authorization failed. Please try again."
    )
  }

  if (!tokenData.refresh_token) {
    console.error(
      "No refresh token returned by Zoho:",
      tokenData
    )

    return redirectToSettings(
      "error",
      "Zoho did not return a refresh token. Please try again."
    )
  }

  // Save the refresh token against the Mulyam user
  const { error: upsertError } =
    await supabaseAdmin
      .from("zoho_books_connections")
      .upsert(
        {
          user_id: stateRow.user_id,
          refresh_token: tokenData.refresh_token,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

  if (upsertError) {
    console.error(
      "Failed to save Zoho connection:",
      upsertError
    )

    return redirectToSettings(
      "error",
      "Failed to save your Zoho Books connection."
    )
  }

  console.log(
    `Zoho Books connected successfully for Mulyam user ${stateRow.user_id}`
  )

  return redirectToSettings("connected")
})