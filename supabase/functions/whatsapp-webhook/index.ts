import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getWhatsAppProvider } from "../_shared/whatsapp/provider.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function text(msg: string, status = 200): Response {
  return new Response(msg, { status, headers: corsHeaders })
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

// Order of states so a late callback cannot downgrade a message from 'read' to 'delivered'
const STATUS_PRECEDENCE: Record<string, number> = {
  failed: -1,
  queued: 0,
  sent: 1,
  delivered: 2,
  read: 3,
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const url = new URL(req.url)

  // 1. GET: Webhook Verification Challenge (Meta Verification)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode")
    const token = url.searchParams.get("hub.verify_token")
    const challenge = url.searchParams.get("hub.challenge")

    const expectedToken = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN") || "mulyam_whatsapp_verify_token"

    if (mode === "subscribe" && token === expectedToken) {
      console.info("[WhatsApp Webhook] Challenge verified successfully.")
      return text(challenge || "ok", 200)
    } else {
      console.warn("[WhatsApp Webhook] Verification token mismatch.")
      return text("Forbidden", 403)
    }
  }

  // 2. POST: Event Notification (Delivery & Read receipts)
  if (req.method === "POST") {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const rawBody = await req.text()

    // Signature Verification
    const provider = getWhatsAppProvider()
    if (provider.verifyWebhookSignature) {
      const isValid = await provider.verifyWebhookSignature(req, rawBody)
      if (!isValid) {
        console.warn("[WhatsApp Webhook] Invalid webhook HMAC signature.")
        return json({ error: "Invalid signature" }, 401)
      }
    }

    try {
      const payload = JSON.parse(rawBody)

      // Meta Cloud API structure: entry[].changes[].value.statuses[]
      const entries = payload.entry || []
      const updatesProcessed: any[] = []

      for (const entry of entries) {
        const changes = entry.changes || []
        for (const change of changes) {
          const value = change.value || {}
          const statuses = value.statuses || []

          for (const s of statuses) {
            const providerMsgId = s.id
            const rawStatus = (s.status || "").toLowerCase() // sent, delivered, read, failed
            const errorDetails = s.errors ? JSON.stringify(s.errors) : null

            if (!providerMsgId || !rawStatus) continue

            // Find existing message record
            const { data: existing } = await supabaseAdmin
              .from("whatsapp_messages")
              .select("id, status")
              .eq("provider_message_id", providerMsgId)
              .maybeSingle()

            if (!existing) {
              console.info(`[WhatsApp Webhook] Message ${providerMsgId} not found in database.`)
              continue
            }

            const currentRank = STATUS_PRECEDENCE[existing.status] ?? 0
            const newRank = STATUS_PRECEDENCE[rawStatus] ?? 0

            // Only update if new status has higher precedence or is a failure
            if (newRank >= currentRank || rawStatus === "failed") {
              const { error: updateError } = await supabaseAdmin
                .from("whatsapp_messages")
                .update({
                  status: rawStatus,
                  error: errorDetails,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id)

              if (!updateError) {
                updatesProcessed.push({ id: providerMsgId, newStatus: rawStatus })
              }
            }
          }
        }
      }

      console.info(`[WhatsApp Webhook] Processed ${updatesProcessed.length} status updates.`)
      return json({ success: true, processed: updatesProcessed.length })
    } catch (parseErr) {
      console.error("[WhatsApp Webhook Error]", parseErr)
      return json({ error: "Failed to process webhook" }, 400)
    }
  }

  return text("Method Not Allowed", 405)
})
