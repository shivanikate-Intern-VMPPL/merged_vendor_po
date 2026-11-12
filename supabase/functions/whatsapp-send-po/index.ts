import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getSharedZohoSource, getUserZohoConnection } from "../_shared/zoho.ts"
import { getWhatsAppProvider } from "../_shared/whatsapp/provider.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

/**
 * Strict mobile normalization (Phase 1 rule):
 * - strip spaces, hyphens, brackets, dots, "+"
 * - drop leading 91 or 0 when longer than 10 digits
 * - must be 10 digits starting with 6-9
 * - format as +91XXXXXXXXXX
 */
function normalizeMobile(raw: unknown): { isValid: boolean; normalized: string; error?: string } {
  if (!raw) return { isValid: false, normalized: "", error: "Missing mobile" }
  let cleaned = String(raw).trim().replace(/[\s\-\(\)\[\]\.\+]/g, "")
  if (cleaned.length > 10) {
    if (cleaned.startsWith("91")) cleaned = cleaned.slice(2)
    else if (cleaned.startsWith("0")) cleaned = cleaned.slice(1)
  }
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: false, normalized: cleaned, error: "Must be 10 digits starting with 6-9" }
  }
  return { isValid: true, normalized: `+91${cleaned}` }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  try {
    const body = await req.json().catch(() => ({}))
    const poId = body.po_id || body.purchaseOrderId
    const forceResend = !!body.force

    if (!poId) {
      return json({ error: "Missing po_id" }, 400)
    }

    // 1. Feature Flag: WHATSAPP_ENABLED (Default OFF / false)
    const isEnabled = Deno.env.get("WHATSAPP_ENABLED") === "true"
    if (!isEnabled) {
      console.info("[WhatsApp Send] Feature flag WHATSAPP_ENABLED is false; notification skipped.")
      return json({
        success: false,
        status: "disabled",
        message: "WhatsApp feature is currently disabled via feature flag (WHATSAPP_ENABLED=false).",
      })
    }

    // 2. Fetch Purchase Order
    const { data: po, error: poError } = await supabaseAdmin
      .from("purchase_orders")
      .select(`
        id,
        po_number,
        farmer_id,
        vendor_id,
        vendor_name,
        grand_total,
        subtotal,
        status,
        zoho_po_id,
        created_at,
        created_by
      `)
      .eq("id", poId)
      .maybeSingle()

    if (poError || !po) {
      return json({ error: "Purchase Order not found", details: poError }, 404)
    }

    // Must have a Zoho PO ID to fetch PDF and send
    if (!po.zoho_po_id) {
      return json({
        success: false,
        status: "skipped",
        error: "PO is not yet synced to Zoho Books (missing zoho_po_id)",
      }, 400)
    }

    // 3. Check Idempotency in whatsapp_messages table
    const { data: existingMsg } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("id, status, attempts, provider_message_id")
      .eq("po_id", poId)
      .eq("message_type", "po_notification")
      .maybeSingle()

    if (existingMsg && !forceResend && ["sent", "delivered", "read"].includes(existingMsg.status)) {
      console.info(`[WhatsApp Send] PO ${po.po_number} was already sent (status: ${existingMsg.status}).`)
      return json({
        success: true,
        status: existingMsg.status,
        provider_message_id: existingMsg.provider_message_id,
        message: "PO notification was already sent on WhatsApp.",
      })
    }

    // Check retry limits (max 3 attempts unless forced manual resend)
    const currentAttempts = existingMsg?.attempts || 0
    if (!forceResend && currentAttempts >= 3 && existingMsg?.status === "failed") {
      return json({
        success: false,
        status: "failed",
        error: "Maximum retry limit (3) reached. Use manual Resend to try again.",
      }, 429)
    }

    // 4. Resolve Vendor & Recipient Phone
    let vendorMobile: string | null = null
    let vendorName: string = po.vendor_name || "Valued Vendor"
    let whatsappOptIn: boolean | null = null

    // Look up in farmers table
    if (po.farmer_id) {
      const { data: farmer } = await supabaseAdmin
        .from("farmers")
        .select("id, name, mobile, zoho_vendor_id, zoho_contact_id")
        .eq("id", po.farmer_id)
        .maybeSingle()

      if (farmer) {
        if (farmer.mobile) vendorMobile = farmer.mobile
        if (farmer.name) vendorName = farmer.name
      }
    }

    // Look up in vendors table (for KYC mobile & opt-in consent)
    const { data: vendorRecord } = await supabaseAdmin
      .from("vendors")
      .select("id, vendor_name, mobile, whatsapp_opt_in, zoho_contact_id")
      .or(`zoho_contact_id.eq.${po.vendor_id},mobile.eq.${vendorMobile}`)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (vendorRecord) {
      if (vendorRecord.mobile) vendorMobile = vendorRecord.mobile
      if (vendorRecord.vendor_name && !vendorName) vendorName = vendorRecord.vendor_name
      whatsappOptIn = vendorRecord.whatsapp_opt_in
    }

    // 5. Consent Check: Never message opted-out vendors (whatsapp_opt_in === false)
    if (whatsappOptIn === false) {
      console.info(`[WhatsApp Send] Vendor ${vendorName} has opted out of WhatsApp messages.`)
      await supabaseAdmin.from("whatsapp_messages").upsert({
        po_id: po.id,
        vendor_id: po.vendor_id,
        phone: vendorMobile || "unknown",
        message_type: "po_notification",
        status: "skipped",
        error: "vendor opted out of whatsapp",
        updated_at: new Date().toISOString(),
      }, { onConflict: "po_id,message_type" })

      return json({
        success: false,
        status: "skipped",
        message: "Vendor has opted out of WhatsApp messages.",
      })
    }

    // 6. Recipient Phone Validation
    const norm = normalizeMobile(vendorMobile)
    let recipientPhone = norm.normalized

    if (!norm.isValid) {
      console.warn(`[WhatsApp Send] Invalid or missing mobile for PO ${po.po_number}: ${vendorMobile}`)
      await supabaseAdmin.from("whatsapp_messages").upsert({
        po_id: po.id,
        vendor_id: po.vendor_id,
        phone: vendorMobile || "unknown",
        message_type: "po_notification",
        status: "failed",
        error: "failed: no valid number",
        attempts: currentAttempts + 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: "po_id,message_type" })

      return json({
        success: false,
        status: "failed",
        error: "failed: no valid number",
      })
    }

    // Test Mode Override
    const isTestMode = Deno.env.get("WHATSAPP_TEST_MODE") === "true"
    const testPhone = Deno.env.get("WHATSAPP_TEST_PHONE")
    if (isTestMode && testPhone) {
      recipientPhone = testPhone
      console.info(`[WhatsApp Send] TEST MODE active: Redirecting send from ${norm.normalized} to ${testPhone}`)
    }

    // 7. Fetch PO PDF from Zoho Books
    let signedPdfUrl: string | undefined = undefined
    let pdfStoragePath: string | undefined = undefined

    try {
      const { zohoUserId } = getSharedZohoSource(po.created_by || "system")
      const { accessToken, organizationId } = await getUserZohoConnection(supabaseAdmin, zohoUserId)

      const zohoPdfUrl = `https://www.zohoapis.in/books/v3/purchaseorders/${po.zoho_po_id}?organization_id=${organizationId}&accept=pdf`
      const pdfRes = await fetch(zohoPdfUrl, {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
      })

      if (pdfRes.ok) {
        const pdfBytes = await pdfRes.arrayBuffer()
        pdfStoragePath = `${po.id}/${po.po_number}.pdf`

        // Upload to private Supabase Storage bucket 'po-pdfs'
        const { error: uploadError } = await supabaseAdmin.storage
          .from("po-pdfs")
          .upload(pdfStoragePath, pdfBytes, {
            contentType: "application/pdf",
            upsert: true,
          })

        if (!uploadError) {
          // Generate 24-hour signed URL for document delivery
          const { data: signedData } = await supabaseAdmin.storage
            .from("po-pdfs")
            .createSignedUrl(pdfStoragePath, 86400)

          if (signedData?.signedUrl) {
            signedPdfUrl = signedData.signedUrl
          }
        } else {
          console.warn("[WhatsApp Send] Failed to save PO PDF to Supabase Storage:", uploadError)
        }
      } else {
        console.warn(`[WhatsApp Send] Zoho PDF fetch returned HTTP ${pdfRes.status}`)
      }
    } catch (pdfErr) {
      console.warn("[WhatsApp Send] Exception fetching PO PDF from Zoho:", pdfErr)
      // Continue without PDF if fetch fails; message template will still deliver
    }

    // 8. Template & Parameters
    const templateName = Deno.env.get("WHATSAPP_TEMPLATE_NAME") || "purchase_order_notification"
    const templateLang = Deno.env.get("WHATSAPP_TEMPLATE_LANG") || "en"
    const poDate = new Date(po.created_at).toLocaleDateString("en-IN")
    const totalAmount = Number(po.grand_total ?? po.subtotal ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    const provider = getWhatsAppProvider()
    console.info(`[WhatsApp Send] Sending via provider '${provider.name}' to ${recipientPhone} (PO: ${po.po_number})...`)

    const result = await provider.sendMessage({
      toPhone: recipientPhone,
      templateName,
      templateLanguage: templateLang,
      parameters: {
        vendorName,
        poNumber: po.po_number,
        poDate,
        totalAmount,
      },
      document: signedPdfUrl
        ? {
            url: signedPdfUrl,
            filename: `${po.po_number}.pdf`,
          }
        : undefined,
    })

    // 9. Update whatsapp_messages tracking table
    const newStatus = result.success ? "sent" : "failed"
    const errorMsg = result.error || null

    await supabaseAdmin.from("whatsapp_messages").upsert({
      po_id: po.id,
      vendor_id: po.vendor_id,
      phone: recipientPhone,
      template_name: templateName,
      message_type: "po_notification",
      provider_message_id: result.providerMessageId || null,
      status: newStatus,
      error: errorMsg,
      attempts: currentAttempts + 1,
      pdf_storage_path: pdfStoragePath || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "po_id,message_type" })

    return json({
      success: result.success,
      status: newStatus,
      providerMessageId: result.providerMessageId,
      error: errorMsg,
      pdfAttached: !!signedPdfUrl,
    })
  } catch (fatalErr) {
    console.error("[WhatsApp Send Fatal Error]", fatalErr)
    return json({ error: (fatalErr as Error).message || "Internal server error" }, 500)
  }
})
