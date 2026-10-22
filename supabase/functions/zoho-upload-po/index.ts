// // import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// // import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// // import { requireAuth, requireRole } from "../_shared/auth.ts"
// // import { getUserZohoConnection, ZohoConnectionError } from "../_shared/zoho.ts"

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// // }

// // interface TaxOption {
// //   tax_id: string
// //   tax_name: string
// //   is_igst: boolean
// // }

// // // Keeps ALL tax options per percentage (not just the first one found), so
// // // callers can pick the IGST vs CGST+SGST variant for the same rate. Zoho
// // // requires IGST for interstate transactions and CGST+SGST for intrastate
// // // ones — same percentage, different tax_id, and which one applies depends
// // // on vendor/company state, which this function doesn't need to know: the
// // // retry loop below asks Zoho directly via its error message instead.
// // async function getZohoTaxMap(accessToken: string, orgId: string): Promise<{ map: Map<number, TaxOption[]>; debug: any }> {
// //   const taxMap = new Map<number, TaxOption[]>()
// //   const debug: any = { fetched: false, count: 0, taxes: [], error: null }

// //   try {
// //     const res = await fetch(
// //       `https://www.zohoapis.in/books/v3/settings/taxes?organization_id=${orgId}`,
// //       { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
// //     )
// //     const data = await res.json()

// //     if (data.code !== 0) {
// //       debug.error = data
// //       return { map: taxMap, debug }
// //     }

// //     const taxes = data?.taxes ?? []
// //     debug.fetched = true
// //     debug.count = taxes.length

// //     for (const tax of taxes) {
// //       const pct = Number(tax.tax_percentage)
// //       const isIgst = /igst/i.test(tax.tax_name ?? "")
// //       const option: TaxOption = { tax_id: tax.tax_id, tax_name: tax.tax_name, is_igst: isIgst }

// //       debug.taxes.push({ tax_id: tax.tax_id, name: tax.tax_name, percentage: pct, is_igst: isIgst })

// //       const existing = taxMap.get(pct) ?? []
// //       existing.push(option)
// //       taxMap.set(pct, existing)
// //     }
// //   } catch (err) {
// //     debug.error = String(err)
// //   }

// //   return { map: taxMap, debug }
// // }

// // // Some Zoho Books orgs require every PO line to explicitly declare ONE of:
// // // tax_id, tax_exemption_id, or reverse charge — a line with none of these
// // // gets rejected with "Specify either a Tax or Tax Exemption or Reverse
// // // Charge." This fetches the org's configured tax exemption reasons so we
// // // have something to attach to lines that genuinely have no GST (e.g.
// // // 0%-rate items like some fresh produce).
// // async function getZohoTaxExemptionId(accessToken: string, orgId: string): Promise<string | null> {
// //   try {
// //     const res = await fetch(
// //       `https://www.zohoapis.in/books/v3/settings/taxexemptions?organization_id=${orgId}`,
// //       { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
// //     )
// //     const data = await res.json()
// //     const exemptions = data?.tax_exemptions ?? []
// //     return exemptions.length > 0 ? exemptions[0].tax_exemption_id : null
// //   } catch (err) {
// //     console.error("Failed to fetch Zoho tax exemptions:", err)
// //     return null
// //   }
// // }

// // // Picks the tax_id for a percentage, preferring IGST or non-IGST depending
// // // on `wantIgst`. Falls back to whatever's available at that percentage if
// // // the preferred type isn't found, so we still send SOMETHING valid rather
// // // than silently dropping tax on the line.
// // function pickTaxId(options: TaxOption[] | undefined, wantIgst: boolean): string | undefined {
// //   if (!options || options.length === 0) return undefined
// //   const preferred = options.find((o) => o.is_igst === wantIgst)
// //   return (preferred ?? options[0]).tax_id
// // }

// // async function isVendorGstRegistered(accessToken: string, orgId: string, contactId: string): Promise<{ registered: boolean; gst_treatment: string | null }> {
// //   try {
// //     const res = await fetch(
// //       `https://www.zohoapis.in/books/v3/contacts/${contactId}?organization_id=${orgId}`,
// //       { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
// //     )
// //     const data = await res.json()
// //     const treatment: string | null = data?.contact?.gst_treatment ?? null
// //     const registered = treatment === "business_gst"
// //     return { registered, gst_treatment: treatment }
// //   } catch (err) {
// //     console.error("Failed to fetch vendor GST treatment:", err)
// //     return { registered: false, gst_treatment: null }
// //   }
// // }

// // serve(async (req) => {
// //   if (req.method === "OPTIONS") {
// //     return new Response("ok", { headers: corsHeaders })
// //   }

// //   let auth
// //   try {
// //     auth = await requireAuth(req)
// //     // Uploading a real PO into Zoho Books is a sensitive, irreversible
// //     // write against a live external system — restrict it the same way
// //     // the "generate"/"convertDraft" actions are restricted.
// //     requireRole(auth, ["collector", "office", "admin"])
// //   } catch (res) {
// //     return res as Response
// //   }

// //   try {
// //     const body = await req.json()
// //     const po_id = body.po_id || body.purchaseOrderId
// //     if (!po_id) {
// //       return new Response(
// //         JSON.stringify({ error: "po_id is required" }),
// //         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     const supabaseAdmin = createClient(
// //       Deno.env.get("SUPABASE_URL")!,
// //       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
// //     )

// //     const { data: po, error: poError } = await supabaseAdmin
// //       .from("purchase_orders")
// //       .select("*, farmer:farmers(*), items:purchase_order_items(*, item:items(*))")
// //       .eq("id", po_id)
// //       .maybeSingle()

// //     if (poError || !po) {
// //       return new Response(
// //         JSON.stringify({ error: "Purchase order not found", details: poError }),
// //         { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     if (po.zoho_po_id) {
// //       return new Response(
// //         JSON.stringify({ error: "This purchase order was already uploaded to Zoho", zoho_po_id: po.zoho_po_id }),
// //         { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     if (!po.po_number) {
// //       return new Response(
// //         JSON.stringify({ error: "This purchase order has no po_number set in the database. Cannot upload to Zoho." }),
// //         { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     if (!po.farmer?.zoho_contact_id) {
// //       return new Response(
// //         JSON.stringify({ error: "Vendor is not linked to a Zoho contact. Cannot upload." }),
// //         { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     if (!po.created_by) {
// //       return new Response(
// //         JSON.stringify({ error: "This purchase order has no creator. Cannot select the Zoho account." }),
// //         { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     const { data: creator } = await supabaseAdmin
// //       .from("profiles")
// //       // .select("full_name, email")
// //       .select("full_name")
// //       .eq("id", po.created_by)
// //       .maybeSingle()

// //     const { accessToken, organizationId: ORG_ID } =
// //       await getUserZohoConnection(supabaseAdmin, po.created_by)

// //     const activeBulkItems = new Map<string, any>()
// //     let catalogPage = 1
// //     let hasMoreCatalogPages = true

// //     while (hasMoreCatalogPages) {
// //       const catalogResponse = await fetch(
// //         `https://www.zohoapis.in/books/v3/items?organization_id=${ORG_ID}&filter_by=Status.Active&per_page=200&page=${catalogPage}`,
// //         { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
// //       )
// //       const catalogData = await catalogResponse.json()

// //       if (!catalogResponse.ok || catalogData.code !== 0 || !Array.isArray(catalogData.items)) {
// //         return new Response(
// //           JSON.stringify({ error: "Could not verify the current Zoho item status. No purchase order was uploaded." }),
// //           { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         )
// //       }

// //       for (const item of catalogData.items) {
// //         if (
// //           item.status === "active" &&
// //           item.can_be_purchased === true &&
// //           item.name?.toLowerCase().includes("bulk")
// //         ) {
// //           activeBulkItems.set(String(item.item_id), item)
// //         }
// //       }

// //       hasMoreCatalogPages = catalogData.page_context?.has_more_page === true
// //       catalogPage++
// //       if (catalogPage > 20) break
// //     }

// //     const invalidItems: string[] = []
// //     for (const line of po.items || []) {
// //       const existingId = line.zoho_item_id || line.item?.zoho_item_id
// //       const activeItem = existingId
// //         ? activeBulkItems.get(String(existingId))
// //         : [...activeBulkItems.values()].find(
// //           (item) => item.name.trim().toLowerCase() === String(line.item_name || "").trim().toLowerCase()
// //         )

// //       if (!activeItem) {
// //         invalidItems.push(line.item_name || "Unnamed item")
// //         continue
// //       }

// //       line.zoho_item_id = String(activeItem.item_id)
// //     }

// //     if (invalidItems.length > 0) {
// //       return new Response(
// //         JSON.stringify({
// //           error: `Purchase order contains items that are inactive, deleted, or not purchasable bulk items in Zoho: ${invalidItems.join(", ")}. No purchase order was uploaded.`,
// //         }),
// //         { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     const { map: taxMap, debug: taxDebug } = await getZohoTaxMap(accessToken, ORG_ID)

// //     let anyTaxApplied = false
// //     const lineItemDebug: any[] = []

// //     for (const li of po.items || []) {
// //       const gstPercent = Number(li.gst_percent) || 0
// //       if (gstPercent > 0 && taxMap.has(gstPercent)) {
// //         anyTaxApplied = true
// //       }
// //     }

// //     let reverseChargeApplied = false
// //     let gstDebug: any = { checked: false }

// //     if (anyTaxApplied) {
// //       const { registered, gst_treatment } = await isVendorGstRegistered(accessToken, ORG_ID, po.farmer.zoho_contact_id)
// //       gstDebug = { checked: true, registered, gst_treatment }
// //       if (!registered) {
// //         reverseChargeApplied = true
// //       }
// //     }

// //     // Builds line items with a given IGST preference and item_id-strip
// //     // state. Called upfront (wantIgst = false, stripItemId = false) and
// //     // again from the retry loop if Zoho rejects for either reason.
// //     // stripItemId is tracked as its own flag (not inferred from wantIgst)
// //     // so that rebuilding for one reason never silently undoes a fix
// //     // already applied for the other reason.
// //     //
// //     // taxDeclarationFallback: used when a line has no matching GST tax at
// //     // all (e.g. a genuinely 0%-GST item). Some Zoho orgs require every
// //     // line to declare a tax, tax exemption, or reverse charge — this
// //     // provides a 0%-rate tax_id (preferred) or a tax_exemption_id as a
// //     // fallback so those lines don't get silently sent with nothing.
// //     function buildLineItems(
// //       wantIgst: boolean,
// //       stripItemId: boolean,
// //       taxDeclarationFallback: { zeroRateTaxId: string | null; exemptionId: string | null } | null
// //     ) {
// //       lineItemDebug.length = 0
// //       return (po.items || []).map((li: any) => {
// //         const gstPercent = Number(li.gst_percent) || 0
// //         const options = gstPercent > 0 ? taxMap.get(gstPercent) : undefined
// //         let zohoTaxId = pickTaxId(options, wantIgst)
// //         let usedExemptionId: string | null = null

// //         if (!zohoTaxId && taxDeclarationFallback) {
// //           if (taxDeclarationFallback.zeroRateTaxId) {
// //             zohoTaxId = taxDeclarationFallback.zeroRateTaxId
// //           } else if (taxDeclarationFallback.exemptionId) {
// //             usedExemptionId = taxDeclarationFallback.exemptionId
// //           }
// //         }

// //         const resolvedZohoItemId = stripItemId
// //           ? null
// //           : (li.zoho_item_id || li.item?.zoho_item_id || null)

// //         lineItemDebug.push({
// //           item_name: li.item_name,
// //           zoho_item_id_used: resolvedZohoItemId,
// //           source: stripItemId ? "stripped" : li.zoho_item_id ? "direct_column" : li.item?.zoho_item_id ? "joined_catalog" : "none",
// //           gst_percent_in_db: li.gst_percent,
// //           matched_tax_id: zohoTaxId ?? null,
// //           tax_exemption_id_used: usedExemptionId,
// //           tax_type_used: zohoTaxId ? (wantIgst ? "igst" : "cgst_sgst") : (usedExemptionId ? "exemption" : null),
// //           reverse_charge_applied_to_this_line: !!(zohoTaxId && reverseChargeApplied),
// //         })

// //         const base = {
// //           ...(resolvedZohoItemId ? { item_id: resolvedZohoItemId } : {}),
// //           name: li.item_name,
// //           rate: li.rate,
// //           quantity: li.quantity,
// //         }

// //         if (usedExemptionId) {
// //           return { ...base, tax_exemption_id: usedExemptionId }
// //         }

// //         if (!zohoTaxId) {
// //           return base
// //         }

// //         if (reverseChargeApplied) {
// //           return { ...base, reverse_charge_tax_id: zohoTaxId }
// //         }

// //         return { ...base, tax_id: zohoTaxId }
// //       })
// //     }

// //     let wantIgst = false
// //     let itemIdStripped = false
// //     let taxDeclarationRequired = false
// //     let cachedTaxFallback: { zeroRateTaxId: string | null; exemptionId: string | null } | null = null
// //     let lineItems = buildLineItems(wantIgst, itemIdStripped, null)

// //     function buildPayload() {
// //       return {
// //         vendor_id: po.farmer.zoho_contact_id,
// //         date: new Date(po.created_at).toISOString().split("T")[0],
// //         reference_number: po.po_number,
// //         notes: [
// //           po.notes || "",
// //           // `Created by: ${creator?.full_name || creator?.email || "Mulyam employee"}`,
// //           `Created by: ${creator?.full_name || "Mulyam employee"}`,
// //         ].filter(Boolean).join("\n"),
// //         line_items: lineItems,
// //         ...(reverseChargeApplied ? { is_reverse_charge_applied: true } : {}),
// //       }
// //     }

// //     let zohoPayload = buildPayload()

// //     console.log("Zoho PO payload:", JSON.stringify(zohoPayload))
// //     console.log("GST debug:", JSON.stringify(gstDebug))

// //     async function createZohoPurchaseOrder(payload: any) {
// //       const res = await fetch(
// //         `https://www.zohoapis.in/books/v3/purchaseorders?organization_id=${ORG_ID}`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Zoho-oauthtoken ${accessToken}`,
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify(payload),
// //         }
// //       )
// //       return res.json()
// //     }

// //     // ------------------------------------------------------------------
// //     // Adaptive retry loop. Each pass inspects Zoho's actual error message
// //     // and adjusts the payload to address that SPECIFIC complaint, then
// //     // tries again — instead of guessing the right payload shape upfront.
// //     // Handles five independent, self-correcting problems that can each
// //     // show up on their own or together:
// //     //   1. Item catalog mapping ("non-purchase item" etc.) → strip item_id
// //     //      from every line, falling back to plain name/rate/quantity lines.
// //     //      itemIdStripped is a standalone flag so a later IGST-triggered
// //     //      rebuild doesn't silently restore item_id.
// //     //   2. PO numbering ("enter the purchase order number" vs "does not
// //     //      match the auto-generated number") → add purchaseorder_number
// //     //      if Zoho says it's required, or remove it if Zoho says our
// //     //      number conflicts with its own auto-sequence.
// //     //   3. Interstate/IGST ("IGST has to be applied as this is an
// //     //      interstate transaction") → rebuild line items using the IGST
// //     //      tax_id instead of CGST+SGST for the same percentage, while
// //     //      preserving whatever itemIdStripped is currently set to.
// //     //   4. Missing tax declaration ("Specify either a Tax or Tax
// //     //      Exemption or Reverse Charge") → fetch a 0%-rate tax or tax
// //     //      exemption reason from the org and attach it to lines that
// //     //      have no GST at all.
// //     // Each transition only fires once per direction (guarded by whether
// //     // the field is currently present/absent, or by wantIgst/itemIdStripped's
// //     // current value), so this always terminates — capped at 5 attempts as
// //     // a hard safety limit regardless.
// //     // ------------------------------------------------------------------
// //     let attemptPayload: any = zohoPayload
// //     let createData: any = null
// //     let itemMappingFallbackApplied = false

// //     for (let attempt = 0; attempt < 5; attempt++) {
// //       createData = await createZohoPurchaseOrder(attemptPayload)

// //       if (createData.purchaseorder) break

// //       const zohoErrorMessage: string = createData?.message || ""

// //       const isItemMappingError =
// //         /non-purchase item|purchase information|item.*not.*(active|found|available)/i.test(zohoErrorMessage)
// //       const isInactiveOrDeletedItemError =
// //         /deleted|marked as inactive|inactive item/i.test(zohoErrorMessage)
// //       const needsExplicitPoNumber =
// //         /enter the purchase order number/i.test(zohoErrorMessage) && !attemptPayload.purchaseorder_number
// //       const poNumberConflictsWithAutoSequence =
// //         /does not match the auto-generated number/i.test(zohoErrorMessage) && !!attemptPayload.purchaseorder_number
// //       const needsIgst =
// //         /igst.*interstate|interstate.*igst/i.test(zohoErrorMessage) && !wantIgst
// //       const needsIntrastate =
// //         /cgst.*sgst.*intrastate|intrastate.*cgst/i.test(zohoErrorMessage) && wantIgst
// //       const needsTaxDeclaration =
// //         /specify either a tax or tax exemption/i.test(zohoErrorMessage) && !taxDeclarationRequired

// //       if (isInactiveOrDeletedItemError) break

// //       if (needsIgst || needsIntrastate) {
// //         wantIgst = needsIgst ? true : false
// //         console.log(`Retrying with ${wantIgst ? "IGST" : "CGST+SGST"} tax due to Zoho error:`, zohoErrorMessage)
// //         lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
// //         attemptPayload = { ...attemptPayload, line_items: lineItems }
// //         continue
// //       }

// //       if (isItemMappingError) {
// //         console.log("Retrying without item_id mapping due to Zoho error:", zohoErrorMessage)
// //         itemIdStripped = true
// //         lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
// //         attemptPayload = { ...attemptPayload, line_items: lineItems }
// //         continue
// //       }

// //       if (needsExplicitPoNumber) {
// //         console.log("Retrying WITH purchaseorder_number — Zoho requires it explicitly:", zohoErrorMessage)
// //         attemptPayload = { ...attemptPayload, purchaseorder_number: po.po_number }
// //         continue
// //       }

// //       if (poNumberConflictsWithAutoSequence) {
// //         console.log("Retrying WITHOUT purchaseorder_number — Zoho auto-generates it and rejected ours:", zohoErrorMessage)
// //         const { purchaseorder_number, ...rest } = attemptPayload
// //         attemptPayload = rest
// //         continue
// //       }

// //       if (needsTaxDeclaration) {
// //         console.log("Zoho requires every line to declare tax/exemption — fetching fallback options:", zohoErrorMessage)
// //         taxDeclarationRequired = true
// //         const zeroRateOptions = taxMap.get(0)
// //         const zeroRateTaxId = zeroRateOptions && zeroRateOptions.length > 0 ? zeroRateOptions[0].tax_id : null
// //         const exemptionId = zeroRateTaxId ? null : await getZohoTaxExemptionId(accessToken, ORG_ID)
// //         cachedTaxFallback = { zeroRateTaxId, exemptionId }
// //         lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
// //         attemptPayload = { ...attemptPayload, line_items: lineItems }
// //         continue
// //       }

// //       // Unrecognized error — stop retrying, surface it as-is below.
// //       break
// //     }

// //     if (itemIdStripped && lineItems.some((li: any) => !li.item_id)) {
// //       itemMappingFallbackApplied = true
// //     }

// //     if (!createData.purchaseorder) {
// //       return new Response(
// //         JSON.stringify({
// //           error: "Failed to create Zoho purchase order",
// //           details: createData,
// //           debug: { taxDebug, lineItemDebug, gstDebug, sentPayload: attemptPayload },
// //         }),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     const zohoPoId = createData.purchaseorder.purchaseorder_id

// //     await supabaseAdmin
// //       .from("purchase_orders")
// //       .update({ zoho_po_id: zohoPoId, zoho_uploaded_at: new Date().toISOString() })
// //       .eq("id", po_id)

// //     return new Response(
// //       JSON.stringify({
// //         success: true,
// //         zoho_po_id: zohoPoId,
// //         itemMappingFallbackApplied,
// //         debug: { taxDebug, lineItemDebug, gstDebug, sentPayload: attemptPayload },
// //       }),
// //       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //     )
// //   } catch (err) {
// //     if (err instanceof ZohoConnectionError) {
// //       return new Response(
// //         JSON.stringify({ error: err.message, code: err.code }),
// //         { status: err.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
// //       )
// //     }
// //     return new Response(
// //       JSON.stringify({ error: "Unexpected error", details: String(err) }),
// //       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //     )
// //   }
// // })
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// import { requireAuth, requireRole } from "../_shared/auth.ts"
// import {
//   getSharedZohoSource,
//   getUserZohoConnection,
//   invalidateZohoConnection,
//   ZohoConnectionError,
// } from "../_shared/zoho.ts"

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// }

// const ZOHO_API = "https://www.zohoapis.in/books/v3"
// const TAX_CACHE_TTL_MS = 12 * 60 * 60 * 1000
// const ITEMS_CACHE_KEY = "zoho_items_v2"
// const ITEMS_NAME_LOOKUP_MAX_AGE_MS = 24 * 60 * 60 * 1000

// function json(body: unknown, status = 200): Response {
//   return new Response(JSON.stringify(body), {
//     status,
//     headers: { ...corsHeaders, "Content-Type": "application/json" },
//   })
// }

// // Thrown when Zoho is busy or the token needs a refresh. The caller can
// // simply try again, so it is reported separately from "invalid item".
// class ZohoTemporaryError extends Error {
//   constructor(message: string) {
//     super(message)
//     this.name = "ZohoTemporaryError"
//   }
// }

// interface ZohoCtx {
//   supabaseAdmin: any
//   userId: string // the user whose Zoho connection is used
//   accessToken: string
//   orgId: string
//   cacheId: string
// }

// // Case and extra spaces are ignored. The "(3)" / "(4)" part is KEPT because
// // those are different items in Zoho.
// function normalizeName(value: unknown): string {
//   return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim()
// }

// async function zohoGet(
//   ctx: ZohoCtx,
//   path: string,
//   params: Record<string, string> = {}
// ): Promise<{ ok: boolean; status: number; data: any }> {
//   const url = new URL(`${ZOHO_API}/${path}`)
//   url.searchParams.set("organization_id", ctx.orgId)
//   for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

//   const res = await fetch(url.toString(), {
//     headers: { Authorization: `Zoho-oauthtoken ${ctx.accessToken}` },
//   })

//   if (res.status === 401) {
//     invalidateZohoConnection(ctx.userId)
//     throw new ZohoTemporaryError("The Zoho session was refreshed. Please try again.")
//   }
//   if (res.status === 429 || res.status >= 500) {
//     throw new ZohoTemporaryError("Zoho is busy right now. Please try again in a minute.")
//   }

//   let data: any = {}
//   try {
//     data = await res.json()
//   } catch {
//     // non-JSON reply: leave data empty
//   }
//   return { ok: res.ok, status: res.status, data }
// }

// async function readCache(supabaseAdmin: any, key: string, maxAgeMs: number): Promise<any | null> {
//   const { data } = await supabaseAdmin
//     .from("zoho_cache")
//     .select("data, fetched_at")
//     .eq("cache_key", key)
//     .maybeSingle()

//   if (!data) return null
//   const age = Date.now() - new Date(data.fetched_at).getTime()
//   if (age > maxAgeMs) return null
//   return data.data
// }

// async function writeCache(supabaseAdmin: any, key: string, value: unknown): Promise<void> {
//   await supabaseAdmin
//     .from("zoho_cache")
//     .upsert({ cache_key: key, data: value, fetched_at: new Date().toISOString() })
// }

// interface TaxOption {
//   tax_id: string
//   tax_name: string
//   is_igst: boolean
// }

// // Keeps ALL tax options per percentage so the IGST vs CGST+SGST variant can
// // be chosen. The tax list almost never changes, so it is cached for 12 hours.
// async function getZohoTaxMap(ctx: ZohoCtx): Promise<{ map: Map<number, TaxOption[]>; debug: any }> {
//   const taxMap = new Map<number, TaxOption[]>()
//   const debug: any = { fetched: false, fromCache: false, count: 0, taxes: [], error: null }
//   const cacheKey = `zoho_taxes:${ctx.orgId}`

//   try {
//     let taxes: any[] | null = await readCache(ctx.supabaseAdmin, cacheKey, TAX_CACHE_TTL_MS)

//     if (Array.isArray(taxes) && taxes.length > 0) {
//       debug.fromCache = true
//     } else {
//       const res = await zohoGet(ctx, "settings/taxes")
//       if (res.data?.code !== 0) {
//         debug.error = res.data
//         return { map: taxMap, debug }
//       }
//       taxes = res.data?.taxes ?? []
//       if (taxes && taxes.length > 0) await writeCache(ctx.supabaseAdmin, cacheKey, taxes)
//     }

//     debug.fetched = true
//     debug.count = taxes?.length ?? 0

//     for (const tax of taxes ?? []) {
//       const pct = Number(tax.tax_percentage)
//       const isIgst = /igst/i.test(tax.tax_name ?? "")
//       const option: TaxOption = { tax_id: tax.tax_id, tax_name: tax.tax_name, is_igst: isIgst }

//       debug.taxes.push({ tax_id: tax.tax_id, name: tax.tax_name, percentage: pct, is_igst: isIgst })

//       const existing = taxMap.get(pct) ?? []
//       existing.push(option)
//       taxMap.set(pct, existing)
//     }
//   } catch (err) {
//     if (err instanceof ZohoTemporaryError) throw err
//     debug.error = String(err)
//   }

//   return { map: taxMap, debug }
// }

// // Some Zoho orgs require every PO line to declare a tax, a tax exemption or
// // reverse charge. This fetches an exemption reason for lines with no GST.
// async function getZohoTaxExemptionId(ctx: ZohoCtx): Promise<string | null> {
//   try {
//     const res = await zohoGet(ctx, "settings/taxexemptions")
//     const exemptions = res.data?.tax_exemptions ?? []
//     return exemptions.length > 0 ? exemptions[0].tax_exemption_id : null
//   } catch (err) {
//     if (err instanceof ZohoTemporaryError) throw err
//     console.error("Failed to fetch Zoho tax exemptions:", err)
//     return null
//   }
// }

// function pickTaxId(options: TaxOption[] | undefined, wantIgst: boolean): string | undefined {
//   if (!options || options.length === 0) return undefined
//   const preferred = options.find((o) => o.is_igst === wantIgst)
//   return (preferred ?? options[0]).tax_id
// }

// async function isVendorGstRegistered(
//   ctx: ZohoCtx,
//   contactId: string
// ): Promise<{ registered: boolean; gst_treatment: string | null }> {
//   try {
//     const res = await zohoGet(ctx, `contacts/${contactId}`)
//     const treatment: string | null = res.data?.contact?.gst_treatment ?? null
//     return { registered: treatment === "business_gst", gst_treatment: treatment }
//   } catch (err) {
//     if (err instanceof ZohoTemporaryError) throw err
//     console.error("Failed to fetch vendor GST treatment:", err)
//     return { registered: false, gst_treatment: null }
//   }
// }

// // Finds an item id by its exact name: first in the catalog the app already
// // saved, then with ONE targeted Zoho search (never a full catalog scan).
// async function findItemIdByName(ctx: ZohoCtx, name: string): Promise<string | null> {
//   const target = normalizeName(name)
//   if (!target) return null

//   const savedCatalog = await readCache(
//     ctx.supabaseAdmin,
//     `${ITEMS_CACHE_KEY}:${ctx.cacheId}`,
//     ITEMS_NAME_LOOKUP_MAX_AGE_MS
//   )
//   if (Array.isArray(savedCatalog)) {
//     const hit = savedCatalog.find((i: any) => normalizeName(i.name) === target)
//     if (hit?.zoho_item_id) return String(hit.zoho_item_id)
//   }

//   const res = await zohoGet(ctx, "items", {
//     search_text: name,
//     filter_by: "Status.Active",
//     per_page: "200",
//   })
//   const list: any[] = Array.isArray(res.data?.items) ? res.data.items : []
//   const live = list.find((i) => normalizeName(i.name) === target)
//   return live?.item_id ? String(live.item_id) : null
// }

// interface LineResult {
//   id?: string
//   problem?: string
// }

// // Checks ONE PO line against Zoho by item id.
// async function resolveLine(ctx: ZohoCtx, line: any): Promise<LineResult> {
//   const label = line.item_name || "Unnamed item"
//   const storedId = String(line.zoho_item_id || line.item?.zoho_item_id || "").trim()

//   const verifyById = async (id: string): Promise<LineResult & { notFound?: boolean }> => {
//     const res = await zohoGet(ctx, `items/${id}`)
//     const item = res.data?.item
//     if (!res.ok || !item) return { notFound: true }
//     if (String(item.status ?? "").toLowerCase() !== "active") {
//       return { problem: `${label} (inactive in Zoho)` }
//     }
//     if (item.can_be_purchased === false) {
//       return { problem: `${label} (not marked as purchasable in Zoho)` }
//     }
//     return { id: String(item.item_id) }
//   }

//   if (storedId) {
//     const byId = await verifyById(storedId)
//     if (!byId.notFound) return byId
//     // The stored id does not exist in this Zoho organization (for example it
//     // came from another organization): fall back to the exact name.
//   }

//   const idByName = await findItemIdByName(ctx, label)
//   if (!idByName) return { problem: `${label} (not found in Zoho, it may be renamed or deleted)` }

//   const byName = await verifyById(idByName)
//   if (byName.notFound) return { problem: `${label} (not found in Zoho)` }
//   return byName
// }

// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders })
//   }

//   let auth
//   try {
//     auth = await requireAuth(req)
//     // Uploading a real PO into Zoho Books is a sensitive write against a
//     // live external system, so it is restricted by role.
//     requireRole(auth, ["collector", "office", "admin"])
//   } catch (res) {
//     return res as Response
//   }

//   try {
//     const body = await req.json()
//     const po_id = body.po_id || body.purchaseOrderId
//     if (!po_id) {
//       return json({ error: "po_id is required" }, 400)
//     }

//     const supabaseAdmin = createClient(
//       Deno.env.get("SUPABASE_URL")!,
//       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
//     )

//     const { data: po, error: poError } = await supabaseAdmin
//       .from("purchase_orders")
//       .select("*, farmer:farmers(*), items:purchase_order_items(*, item:items(*))")
//       .eq("id", po_id)
//       .maybeSingle()

//     if (poError || !po) {
//       return json({ error: "Purchase order not found", details: poError }, 404)
//     }

//     if (po.zoho_po_id) {
//       return json({ error: "This purchase order was already uploaded to Zoho", zoho_po_id: po.zoho_po_id }, 409)
//     }

//     if (!po.po_number) {
//       return json({ error: "This purchase order has no po_number set in the database. Cannot upload to Zoho." }, 422)
//     }

//     if (!po.farmer?.zoho_contact_id) {
//       return json({ error: "Vendor is not linked to a Zoho contact. Cannot upload." }, 422)
//     }

//     let creator: { full_name: string | null } | null = null
//     if (po.created_by) {
//       const { data } = await supabaseAdmin
//         .from("profiles")
//         .select("full_name")
//         .eq("id", po.created_by)
//         .maybeSingle()
//       creator = data
//     }

//     // Every upload goes through the shared Zoho connection (SHARED_ZOHO_USER_ID).
//     const { zohoUserId, cacheId } = getSharedZohoSource(po.created_by ?? auth.userId)
//     const { accessToken, organizationId: ORG_ID } =
//       await getUserZohoConnection(supabaseAdmin, zohoUserId)

//     const ctx: ZohoCtx = {
//       supabaseAdmin,
//       userId: zohoUserId,
//       accessToken,
//       orgId: ORG_ID,
//       cacheId,
//     }

//     // ------------------------------------------------------------------
//     // Check every PO line directly in Zoho (by item id, then by exact name).
//     // No catalog scan, so there is no page limit and no false "not found".
//     // ------------------------------------------------------------------
//     const lines: any[] = po.items ?? []
//     const checks = await Promise.all(lines.map((line) => resolveLine(ctx, line)))

//     const problems = checks.filter((c) => c.problem).map((c) => c.problem as string)
//     if (problems.length > 0) {
//       return json(
//         {
//           error: `These items cannot be uploaded to Zoho: ${problems.join("; ")}. No purchase order was uploaded.`,
//         },
//         422
//       )
//     }

//     lines.forEach((line, index) => {
//       line.zoho_item_id = checks[index].id
//     })

//     const { map: taxMap, debug: taxDebug } = await getZohoTaxMap(ctx)

//     let anyTaxApplied = false
//     const lineItemDebug: any[] = []

//     for (const li of lines) {
//       const gstPercent = Number(li.gst_percent) || 0
//       if (gstPercent > 0 && taxMap.has(gstPercent)) {
//         anyTaxApplied = true
//       }
//     }

//     let reverseChargeApplied = false
//     let gstDebug: any = { checked: false }

//     if (anyTaxApplied) {
//       const { registered, gst_treatment } = await isVendorGstRegistered(ctx, po.farmer.zoho_contact_id)
//       gstDebug = { checked: true, registered, gst_treatment }
//       if (!registered) {
//         reverseChargeApplied = true
//       }
//     }

//     // Builds line items with a given IGST preference and item_id-strip state.
//     // stripItemId is its own flag so rebuilding for one reason never undoes a
//     // fix already applied for another reason.
//     function buildLineItems(
//       wantIgst: boolean,
//       stripItemId: boolean,
//       taxDeclarationFallback: { zeroRateTaxId: string | null; exemptionId: string | null } | null
//     ) {
//       lineItemDebug.length = 0
//       return lines.map((li: any) => {
//         const gstPercent = Number(li.gst_percent) || 0
//         const options = gstPercent > 0 ? taxMap.get(gstPercent) : undefined
//         let zohoTaxId = pickTaxId(options, wantIgst)
//         let usedExemptionId: string | null = null

//         if (!zohoTaxId && taxDeclarationFallback) {
//           if (taxDeclarationFallback.zeroRateTaxId) {
//             zohoTaxId = taxDeclarationFallback.zeroRateTaxId
//           } else if (taxDeclarationFallback.exemptionId) {
//             usedExemptionId = taxDeclarationFallback.exemptionId
//           }
//         }

//         const resolvedZohoItemId = stripItemId ? null : (li.zoho_item_id || null)

//         lineItemDebug.push({
//           item_name: li.item_name,
//           zoho_item_id_used: resolvedZohoItemId,
//           source: stripItemId ? "stripped" : "verified_in_zoho",
//           gst_percent_in_db: li.gst_percent,
//           matched_tax_id: zohoTaxId ?? null,
//           tax_exemption_id_used: usedExemptionId,
//           tax_type_used: zohoTaxId ? (wantIgst ? "igst" : "cgst_sgst") : (usedExemptionId ? "exemption" : null),
//           reverse_charge_applied_to_this_line: !!(zohoTaxId && reverseChargeApplied),
//         })

//         const base = {
//           ...(resolvedZohoItemId ? { item_id: resolvedZohoItemId } : {}),
//           name: li.item_name,
//           rate: li.rate,
//           quantity: li.quantity,
//         }

//         if (usedExemptionId) {
//           return { ...base, tax_exemption_id: usedExemptionId }
//         }

//         if (!zohoTaxId) {
//           return base
//         }

//         if (reverseChargeApplied) {
//           return { ...base, reverse_charge_tax_id: zohoTaxId }
//         }

//         return { ...base, tax_id: zohoTaxId }
//       })
//     }

//     let wantIgst = false
//     let itemIdStripped = false
//     let taxDeclarationRequired = false
//     let cachedTaxFallback: { zeroRateTaxId: string | null; exemptionId: string | null } | null = null
//     let lineItems = buildLineItems(wantIgst, itemIdStripped, null)

//     function buildPayload() {
//       return {
//         vendor_id: po.farmer.zoho_contact_id,
//         date: new Date(po.created_at).toISOString().split("T")[0],
//         reference_number: po.po_number,
//         notes: [
//           po.notes || "",
//           `Created by: ${creator?.full_name || "Mulyam employee"}`,
//         ].filter(Boolean).join("\n"),
//         line_items: lineItems,
//         ...(reverseChargeApplied ? { is_reverse_charge_applied: true } : {}),
//       }
//     }

//     const zohoPayload = buildPayload()

//     console.log("Zoho PO payload:", JSON.stringify(zohoPayload))
//     console.log("GST debug:", JSON.stringify(gstDebug))

//     async function createZohoPurchaseOrder(payload: any) {
//       const res = await fetch(
//         `${ZOHO_API}/purchaseorders?organization_id=${ORG_ID}`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Zoho-oauthtoken ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       )
//       if (res.status === 401) invalidateZohoConnection(zohoUserId)
//       try {
//         return await res.json()
//       } catch {
//         return { message: `Zoho returned an unreadable reply (HTTP ${res.status}).` }
//       }
//     }

//     // ------------------------------------------------------------------
//     // Adaptive retry loop. Each pass reads Zoho's actual error message and
//     // adjusts the payload for that SPECIFIC complaint:
//     //   1. Item catalog mapping -> strip item_id from every line.
//     //   2. PO numbering -> add or remove purchaseorder_number as Zoho asks.
//     //   3. Interstate/IGST -> rebuild lines with IGST or CGST+SGST.
//     //   4. Missing tax declaration -> attach a 0%-rate tax or an exemption.
//     // Each transition fires only once per direction, and the loop is capped
//     // at 5 attempts, so it always ends.
//     // ------------------------------------------------------------------
//     let attemptPayload: any = zohoPayload
//     let createData: any = null
//     let itemMappingFallbackApplied = false

//     for (let attempt = 0; attempt < 5; attempt++) {
//       createData = await createZohoPurchaseOrder(attemptPayload)

//       if (createData.purchaseorder) break

//       const zohoErrorMessage: string = createData?.message || ""

//       const isItemMappingError =
//         /non-purchase item|purchase information|item.*not.*(active|found|available)/i.test(zohoErrorMessage)
//       const isInactiveOrDeletedItemError =
//         /deleted|marked as inactive|inactive item/i.test(zohoErrorMessage)
//       const needsExplicitPoNumber =
//         /enter the purchase order number/i.test(zohoErrorMessage) && !attemptPayload.purchaseorder_number
//       const poNumberConflictsWithAutoSequence =
//         /does not match the auto-generated number/i.test(zohoErrorMessage) && !!attemptPayload.purchaseorder_number
//       const needsIgst =
//         /igst.*interstate|interstate.*igst/i.test(zohoErrorMessage) && !wantIgst
//       const needsIntrastate =
//         /cgst.*sgst.*intrastate|intrastate.*cgst/i.test(zohoErrorMessage) && wantIgst
//       const needsTaxDeclaration =
//         /specify either a tax or tax exemption/i.test(zohoErrorMessage) && !taxDeclarationRequired

//       if (isInactiveOrDeletedItemError) break

//       if (needsIgst || needsIntrastate) {
//         wantIgst = needsIgst ? true : false
//         console.log(`Retrying with ${wantIgst ? "IGST" : "CGST+SGST"} tax due to Zoho error:`, zohoErrorMessage)
//         lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
//         attemptPayload = { ...attemptPayload, line_items: lineItems }
//         continue
//       }

//       if (isItemMappingError) {
//         console.log("Retrying without item_id mapping due to Zoho error:", zohoErrorMessage)
//         itemIdStripped = true
//         lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
//         attemptPayload = { ...attemptPayload, line_items: lineItems }
//         continue
//       }

//       if (needsExplicitPoNumber) {
//         console.log("Retrying WITH purchaseorder_number, Zoho requires it:", zohoErrorMessage)
//         attemptPayload = { ...attemptPayload, purchaseorder_number: po.po_number }
//         continue
//       }

//       if (poNumberConflictsWithAutoSequence) {
//         console.log("Retrying WITHOUT purchaseorder_number, Zoho auto-generates it:", zohoErrorMessage)
//         const { purchaseorder_number, ...rest } = attemptPayload
//         attemptPayload = rest
//         continue
//       }

//       if (needsTaxDeclaration) {
//         console.log("Zoho requires every line to declare tax/exemption:", zohoErrorMessage)
//         taxDeclarationRequired = true
//         const zeroRateOptions = taxMap.get(0)
//         const zeroRateTaxId = zeroRateOptions && zeroRateOptions.length > 0 ? zeroRateOptions[0].tax_id : null
//         const exemptionId = zeroRateTaxId ? null : await getZohoTaxExemptionId(ctx)
//         cachedTaxFallback = { zeroRateTaxId, exemptionId }
//         lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
//         attemptPayload = { ...attemptPayload, line_items: lineItems }
//         continue
//       }

//       // Unrecognized error: stop retrying, surface it as-is below.
//       break
//     }

//     if (itemIdStripped && lineItems.some((li: any) => !li.item_id)) {
//       itemMappingFallbackApplied = true
//     }

//     if (!createData?.purchaseorder) {
//       return json(
//         {
//           error: "Failed to create Zoho purchase order",
//           details: createData,
//           debug: { taxDebug, lineItemDebug, gstDebug, sentPayload: attemptPayload },
//         },
//         500
//       )
//     }

//     const zohoPoId = createData.purchaseorder.purchaseorder_id

//     const { error: updateError } = await supabaseAdmin
//       .from("purchase_orders")
//       .update({
//         zoho_po_id: zohoPoId,
//         zoho_uploaded_at: new Date().toISOString(),
//         status: "synced",
//       })
//       .eq("id", po_id)

//     if (updateError) {
//       console.error("PO was created in Zoho but the app record could not be updated:", updateError)
//     }

//     return json({
//       success: true,
//       zoho_po_id: zohoPoId,
//       status_set: !updateError,
//       zoho_po_number: createData.purchaseorder.purchaseorder_number ?? null,
//       organizationId: ORG_ID,
//       itemMappingFallbackApplied,
//       ...(updateError ? { warning: "Uploaded to Zoho, but the app status could not be updated." } : {}),
//       debug: { taxDebug, lineItemDebug, gstDebug, sentPayload: attemptPayload },
//     })
//   } catch (err) {
//     if (err instanceof ZohoConnectionError) {
//       return json({ error: err.message, code: err.code }, err.status)
//     }
//     if (err instanceof ZohoTemporaryError) {
//       return json({ error: err.message, code: "zoho_temporary" }, 503)
//     }
//     return json({ error: "Unexpected error", details: String(err) }, 500)
//   }
// })
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { requireAuth, requireRole } from "../_shared/auth.ts"
import {
  getSharedZohoSource,
  getUserZohoConnection,
  invalidateZohoConnection,
  ZohoConnectionError,
} from "../_shared/zoho.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const ZOHO_API = "https://www.zohoapis.in/books/v3"
const TAX_CACHE_TTL_MS = 12 * 60 * 60 * 1000
const ITEMS_CACHE_KEY = "zoho_items_v2"
const ITEMS_NAME_LOOKUP_MAX_AGE_MS = 24 * 60 * 60 * 1000

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

// Thrown when Zoho is busy or the token needs a refresh. The caller can
// simply try again, so it is reported separately from "invalid item/vendor".
class ZohoTemporaryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ZohoTemporaryError"
  }
}

interface ZohoCtx {
  supabaseAdmin: any
  userId: string // the user whose Zoho connection is used
  accessToken: string
  orgId: string
  cacheId: string
}

// Case and extra spaces are ignored. The "(3)" / "(4)" part is KEPT because
// those are different items in Zoho.
function normalizeName(value: unknown): string {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim()
}

async function zohoGet(
  ctx: ZohoCtx,
  path: string,
  params: Record<string, string> = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const url = new URL(`${ZOHO_API}/${path}`)
  url.searchParams.set("organization_id", ctx.orgId)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Zoho-oauthtoken ${ctx.accessToken}` },
  })

  if (res.status === 401) {
    invalidateZohoConnection(ctx.userId)
    throw new ZohoTemporaryError("The Zoho session was refreshed. Please try again.")
  }
  if (res.status === 429 || res.status >= 500) {
    throw new ZohoTemporaryError("Zoho is busy right now. Please try again in a minute.")
  }

  let data: any = {}
  try {
    data = await res.json()
  } catch {
    // non-JSON reply: leave data empty
  }
  return { ok: res.ok, status: res.status, data }
}

async function readCache(supabaseAdmin: any, key: string, maxAgeMs: number): Promise<any | null> {
  const { data } = await supabaseAdmin
    .from("zoho_cache")
    .select("data, fetched_at")
    .eq("cache_key", key)
    .maybeSingle()

  if (!data) return null
  const age = Date.now() - new Date(data.fetched_at).getTime()
  if (age > maxAgeMs) return null
  return data.data
}

async function writeCache(supabaseAdmin: any, key: string, value: unknown): Promise<void> {
  await supabaseAdmin
    .from("zoho_cache")
    .upsert({ cache_key: key, data: value, fetched_at: new Date().toISOString() })
}

interface TaxOption {
  tax_id: string
  tax_name: string
  is_igst: boolean
}

// Keeps ALL tax options per percentage so the IGST vs CGST+SGST variant can
// be chosen. The tax list almost never changes, so it is cached for 12 hours.
async function getZohoTaxMap(ctx: ZohoCtx): Promise<{ map: Map<number, TaxOption[]>; debug: any }> {
  const taxMap = new Map<number, TaxOption[]>()
  const debug: any = { fetched: false, fromCache: false, count: 0, taxes: [], error: null }
  const cacheKey = `zoho_taxes:${ctx.orgId}`

  try {
    let taxes: any[] | null = await readCache(ctx.supabaseAdmin, cacheKey, TAX_CACHE_TTL_MS)

    if (Array.isArray(taxes) && taxes.length > 0) {
      debug.fromCache = true
    } else {
      const res = await zohoGet(ctx, "settings/taxes")
      if (res.data?.code !== 0) {
        debug.error = res.data
        return { map: taxMap, debug }
      }
      taxes = res.data?.taxes ?? []
      if (taxes && taxes.length > 0) await writeCache(ctx.supabaseAdmin, cacheKey, taxes)
    }

    debug.fetched = true
    debug.count = taxes?.length ?? 0

    for (const tax of taxes ?? []) {
      const pct = Number(tax.tax_percentage)
      const isIgst = /igst/i.test(tax.tax_name ?? "")
      const option: TaxOption = { tax_id: tax.tax_id, tax_name: tax.tax_name, is_igst: isIgst }

      debug.taxes.push({ tax_id: tax.tax_id, name: tax.tax_name, percentage: pct, is_igst: isIgst })

      const existing = taxMap.get(pct) ?? []
      existing.push(option)
      taxMap.set(pct, existing)
    }
  } catch (err) {
    if (err instanceof ZohoTemporaryError) throw err
    debug.error = String(err)
  }

  return { map: taxMap, debug }
}

// Some Zoho orgs require every PO line to declare a tax, a tax exemption or
// reverse charge. This fetches an exemption reason for lines with no GST.
async function getZohoTaxExemptionId(ctx: ZohoCtx): Promise<string | null> {
  try {
    const res = await zohoGet(ctx, "settings/taxexemptions")
    const exemptions = res.data?.tax_exemptions ?? []
    return exemptions.length > 0 ? exemptions[0].tax_exemption_id : null
  } catch (err) {
    if (err instanceof ZohoTemporaryError) throw err
    console.error("Failed to fetch Zoho tax exemptions:", err)
    return null
  }
}

function pickTaxId(options: TaxOption[] | undefined, wantIgst: boolean): string | undefined {
  if (!options || options.length === 0) return undefined
  const preferred = options.find((o) => o.is_igst === wantIgst)
  return (preferred ?? options[0]).tax_id
}

// ---------------------------------------------------------------------
// VENDOR CHECK
// Checks the vendor in Zoho BEFORE the PO is sent:
//  - inactive            -> stop with a clear message
//  - deleted / id from another organization -> find the vendor again by its
//    exact name, relink it, and carry on
//  - truly gone          -> stop with a clear message
// The same Zoho reply also gives the GST type, so no extra call is needed.
// ---------------------------------------------------------------------
interface VendorResult {
  id?: string
  contact?: any
  problem?: string
  code?: string
  relinked?: boolean
}

function isInactiveContact(contact: any): boolean {
  return String(contact?.status ?? "").toLowerCase() === "inactive"
}

async function resolveVendor(ctx: ZohoCtx, farmer: any): Promise<VendorResult> {
  const name = String(farmer?.name ?? "").trim() || "this vendor"
  const storedId = String(farmer?.zoho_contact_id ?? "").trim()

  if (storedId) {
    const res = await zohoGet(ctx, `contacts/${storedId}`)
    const contact = res.data?.contact
    if (res.ok && contact) {
      if (isInactiveContact(contact)) {
        return {
          problem: `Vendor "${name}" is inactive in Zoho Books. Make the vendor active in Zoho, or press Edit and choose another vendor.`,
          code: "vendor_inactive",
        }
      }
      return { id: storedId, contact }
    }
    // Not found with this id: it was deleted, or it belongs to another Zoho
    // organization. Fall through to a search by exact name.
  }

  const search = await zohoGet(ctx, "contacts", {
    contact_type: "vendor",
    search_text: name,
    per_page: "200",
  })
  const list: any[] = Array.isArray(search.data?.contacts) ? search.data.contacts : []
  const target = normalizeName(name)
  const sameName = list.filter((c) => normalizeName(c.contact_name) === target)
  const active = sameName.find((c) => !isInactiveContact(c))

  if (active) {
    // Relink the farmer so this (and every later PO) uses the right vendor.
    if (farmer?.id) {
      const { error } = await ctx.supabaseAdmin
        .from("farmers")
        .update({ zoho_contact_id: String(active.contact_id) })
        .eq("id", farmer.id)
      if (error) console.warn("Could not relink farmer to the Zoho vendor:", error.message)
    }

    const detail = await zohoGet(ctx, `contacts/${active.contact_id}`)
    return {
      id: String(active.contact_id),
      contact: detail.data?.contact ?? active,
      relinked: true,
    }
  }

  if (sameName.length > 0) {
    return {
      problem: `Vendor "${name}" is inactive in Zoho Books. Make the vendor active in Zoho, or press Edit and choose another vendor.`,
      code: "vendor_inactive",
    }
  }

  return {
    problem: `Vendor "${name}" was deleted or does not exist in Zoho Books. Press Edit and choose another vendor.`,
    code: "vendor_missing",
  }
}

// Finds an item id by its exact name: first in the catalog the app already
// saved, then with ONE targeted Zoho search (never a full catalog scan).
async function findItemIdByName(ctx: ZohoCtx, name: string): Promise<string | null> {
  const target = normalizeName(name)
  if (!target) return null

  const savedCatalog = await readCache(
    ctx.supabaseAdmin,
    `${ITEMS_CACHE_KEY}:${ctx.cacheId}`,
    ITEMS_NAME_LOOKUP_MAX_AGE_MS
  )
  if (Array.isArray(savedCatalog)) {
    const hit = savedCatalog.find((i: any) => normalizeName(i.name) === target)
    if (hit?.zoho_item_id) return String(hit.zoho_item_id)
  }

  const res = await zohoGet(ctx, "items", {
    search_text: name,
    filter_by: "Status.Active",
    per_page: "200",
  })
  const list: any[] = Array.isArray(res.data?.items) ? res.data.items : []
  const live = list.find((i) => normalizeName(i.name) === target)
  return live?.item_id ? String(live.item_id) : null
}

interface LineResult {
  id?: string
  problem?: string
}

// Checks ONE PO line against Zoho by item id.
async function resolveLine(ctx: ZohoCtx, line: any): Promise<LineResult> {
  const label = line.item_name || "Unnamed item"
  const storedId = String(line.zoho_item_id || line.item?.zoho_item_id || "").trim()

  const verifyById = async (id: string): Promise<LineResult & { notFound?: boolean }> => {
    const res = await zohoGet(ctx, `items/${id}`)
    const item = res.data?.item
    if (!res.ok || !item) return { notFound: true }
    if (String(item.status ?? "").toLowerCase() !== "active") {
      return { problem: `${label} (inactive in Zoho)` }
    }
    if (item.can_be_purchased === false) {
      return { problem: `${label} (not marked as purchasable in Zoho)` }
    }
    return { id: String(item.item_id) }
  }

  if (storedId) {
    const byId = await verifyById(storedId)
    if (!byId.notFound) return byId
    // The stored id does not exist in this Zoho organization: fall back to the exact name.
  }

  const idByName = await findItemIdByName(ctx, label)
  if (!idByName) return { problem: `${label} (not found in Zoho, it may be renamed or deleted)` }

  const byName = await verifyById(idByName)
  if (byName.notFound) return { problem: `${label} (not found in Zoho)` }
  return byName
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  let auth
  try {
    auth = await requireAuth(req)
    // Uploading a real PO into Zoho Books is a sensitive write against a
    // live external system, so it is restricted by role.
    requireRole(auth, ["collector", "office", "admin"])
  } catch (res) {
    return res as Response
  }

  try {
    const body = await req.json()
    const po_id = body.po_id || body.purchaseOrderId
    if (!po_id) {
      return json({ error: "po_id is required" }, 400)
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: po, error: poError } = await supabaseAdmin
      .from("purchase_orders")
      .select("*, farmer:farmers(*), items:purchase_order_items(*, item:items(*))")
      .eq("id", po_id)
      .maybeSingle()

    if (poError || !po) {
      return json({ error: "Purchase order not found", details: poError }, 404)
    }

    if (po.zoho_po_id) {
      return json({ error: "This purchase order was already uploaded to Zoho", zoho_po_id: po.zoho_po_id }, 409)
    }

    if (!po.po_number) {
      return json({ error: "This purchase order has no po_number set in the database. Cannot upload to Zoho." }, 422)
    }

    if (!po.farmer) {
      return json({ error: "This purchase order has no vendor. Press Edit and choose a vendor.", code: "vendor_missing" }, 422)
    }

    let creator: { full_name: string | null } | null = null
    if (po.created_by) {
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", po.created_by)
        .maybeSingle()
      creator = data
    }

    // Every upload goes through the shared Zoho connection (SHARED_ZOHO_USER_ID).
    const { zohoUserId, cacheId } = getSharedZohoSource(po.created_by ?? auth.userId)
    const { accessToken, organizationId: ORG_ID } =
      await getUserZohoConnection(supabaseAdmin, zohoUserId)

    const ctx: ZohoCtx = {
      supabaseAdmin,
      userId: zohoUserId,
      accessToken,
      orgId: ORG_ID,
      cacheId,
    }

    // ------------------------------------------------------------------
    // Check the vendor and every PO line directly in Zoho, all together.
    // ------------------------------------------------------------------
    const lines: any[] = po.items ?? []
    const [vendor, checks] = await Promise.all([
      resolveVendor(ctx, po.farmer),
      Promise.all(lines.map((line) => resolveLine(ctx, line))),
    ])

    const problems: string[] = []
    if (vendor.problem) problems.push(vendor.problem)
    for (const c of checks) if (c.problem) problems.push(c.problem)

    if (problems.length > 0) {
      const itemProblems = checks.filter((c) => c.problem).map((c) => c.problem as string)
      const message = vendor.problem
        ? [vendor.problem, ...(itemProblems.length ? [`Items: ${itemProblems.join("; ")}.`] : [])].join(" ")
        : `These items cannot be uploaded to Zoho: ${itemProblems.join("; ")}.`

      return json(
        { error: `${message} No purchase order was uploaded.`, ...(vendor.code ? { code: vendor.code } : {}) },
        422
      )
    }

    const vendorId = vendor.id as string
    lines.forEach((line, index) => {
      line.zoho_item_id = checks[index].id
    })

    const { map: taxMap, debug: taxDebug } = await getZohoTaxMap(ctx)

    let anyTaxApplied = false
    const lineItemDebug: any[] = []

    for (const li of lines) {
      const gstPercent = Number(li.gst_percent) || 0
      if (gstPercent > 0 && taxMap.has(gstPercent)) {
        anyTaxApplied = true
      }
    }

    let reverseChargeApplied = false
    let gstDebug: any = { checked: false }

    // The GST type comes from the vendor reply we already have (no extra call).
    if (anyTaxApplied) {
      const gstTreatment: string | null = vendor.contact?.gst_treatment ?? null
      const registered = gstTreatment === "business_gst"
      gstDebug = { checked: true, registered, gst_treatment: gstTreatment }
      if (!registered) {
        reverseChargeApplied = true
      }
    }

    // Builds line items with a given IGST preference and item_id-strip state.
    function buildLineItems(
      wantIgst: boolean,
      stripItemId: boolean,
      taxDeclarationFallback: { zeroRateTaxId: string | null; exemptionId: string | null } | null
    ) {
      lineItemDebug.length = 0
      return lines.map((li: any) => {
        const gstPercent = Number(li.gst_percent) || 0
        const options = gstPercent > 0 ? taxMap.get(gstPercent) : undefined
        let zohoTaxId = pickTaxId(options, wantIgst)
        let usedExemptionId: string | null = null

        if (!zohoTaxId && taxDeclarationFallback) {
          if (taxDeclarationFallback.zeroRateTaxId) {
            zohoTaxId = taxDeclarationFallback.zeroRateTaxId
          } else if (taxDeclarationFallback.exemptionId) {
            usedExemptionId = taxDeclarationFallback.exemptionId
          }
        }

        const resolvedZohoItemId = stripItemId ? null : (li.zoho_item_id || null)

        lineItemDebug.push({
          item_name: li.item_name,
          zoho_item_id_used: resolvedZohoItemId,
          source: stripItemId ? "stripped" : "verified_in_zoho",
          gst_percent_in_db: li.gst_percent,
          matched_tax_id: zohoTaxId ?? null,
          tax_exemption_id_used: usedExemptionId,
          tax_type_used: zohoTaxId ? (wantIgst ? "igst" : "cgst_sgst") : (usedExemptionId ? "exemption" : null),
          reverse_charge_applied_to_this_line: !!(zohoTaxId && reverseChargeApplied),
        })

        const base = {
          ...(resolvedZohoItemId ? { item_id: resolvedZohoItemId } : {}),
          name: li.item_name,
          rate: li.rate,
          quantity: li.quantity,
        }

        if (usedExemptionId) {
          return { ...base, tax_exemption_id: usedExemptionId }
        }

        if (!zohoTaxId) {
          return base
        }

        if (reverseChargeApplied) {
          return { ...base, reverse_charge_tax_id: zohoTaxId }
        }

        return { ...base, tax_id: zohoTaxId }
      })
    }

    let wantIgst = false
    let itemIdStripped = false
    let taxDeclarationRequired = false
    let cachedTaxFallback: { zeroRateTaxId: string | null; exemptionId: string | null } | null = null
    let lineItems = buildLineItems(wantIgst, itemIdStripped, null)

    function buildPayload() {
      return {
        vendor_id: vendorId,
        date: new Date(po.created_at).toISOString().split("T")[0],
        reference_number: po.po_number,
        notes: [
          po.notes || "",
          `Created by: ${creator?.full_name || "Mulyam employee"}`,
        ].filter(Boolean).join("\n"),
        line_items: lineItems,
        ...(reverseChargeApplied ? { is_reverse_charge_applied: true } : {}),
      }
    }

    const zohoPayload = buildPayload()

    console.log("Zoho PO payload:", JSON.stringify(zohoPayload))
    console.log("GST debug:", JSON.stringify(gstDebug))

    async function createZohoPurchaseOrder(payload: any) {
      const res = await fetch(
        `${ZOHO_API}/purchaseorders?organization_id=${ORG_ID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )
      if (res.status === 401) invalidateZohoConnection(zohoUserId)
      try {
        return await res.json()
      } catch {
        return { message: `Zoho returned an unreadable reply (HTTP ${res.status}).` }
      }
    }

    // ------------------------------------------------------------------
    // Adaptive retry loop. Each pass reads Zoho's actual error message and
    // adjusts the payload for that SPECIFIC complaint:
    //   1. Item catalog mapping -> strip item_id from every line.
    //   2. PO numbering -> add or remove purchaseorder_number as Zoho asks.
    //   3. Interstate/IGST -> rebuild lines with IGST or CGST+SGST.
    //   4. Missing tax declaration -> attach a 0%-rate tax or an exemption.
    // Each transition fires only once per direction, and the loop is capped
    // at 5 attempts, so it always ends.
    // ------------------------------------------------------------------
    let attemptPayload: any = zohoPayload
    let createData: any = null
    let itemMappingFallbackApplied = false

    for (let attempt = 0; attempt < 5; attempt++) {
      createData = await createZohoPurchaseOrder(attemptPayload)

      if (createData.purchaseorder) break

      const zohoErrorMessage: string = createData?.message || ""

      const isItemMappingError =
        /non-purchase item|purchase information|item.*not.*(active|found|available)/i.test(zohoErrorMessage)
      const isInactiveOrDeletedItemError =
        /deleted|marked as inactive|inactive item/i.test(zohoErrorMessage)
      const needsExplicitPoNumber =
        /enter the purchase order number/i.test(zohoErrorMessage) && !attemptPayload.purchaseorder_number
      const poNumberConflictsWithAutoSequence =
        /does not match the auto-generated number/i.test(zohoErrorMessage) && !!attemptPayload.purchaseorder_number
      const needsIgst =
        /igst.*interstate|interstate.*igst/i.test(zohoErrorMessage) && !wantIgst
      const needsIntrastate =
        /cgst.*sgst.*intrastate|intrastate.*cgst/i.test(zohoErrorMessage) && wantIgst
      const needsTaxDeclaration =
        /specify either a tax or tax exemption/i.test(zohoErrorMessage) && !taxDeclarationRequired

      if (isInactiveOrDeletedItemError) break

      if (needsIgst || needsIntrastate) {
        wantIgst = needsIgst ? true : false
        console.log(`Retrying with ${wantIgst ? "IGST" : "CGST+SGST"} tax due to Zoho error:`, zohoErrorMessage)
        lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
        attemptPayload = { ...attemptPayload, line_items: lineItems }
        continue
      }

      if (isItemMappingError) {
        console.log("Retrying without item_id mapping due to Zoho error:", zohoErrorMessage)
        itemIdStripped = true
        lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
        attemptPayload = { ...attemptPayload, line_items: lineItems }
        continue
      }

      if (needsExplicitPoNumber) {
        console.log("Retrying WITH purchaseorder_number, Zoho requires it:", zohoErrorMessage)
        attemptPayload = { ...attemptPayload, purchaseorder_number: po.po_number }
        continue
      }

      if (poNumberConflictsWithAutoSequence) {
        console.log("Retrying WITHOUT purchaseorder_number, Zoho auto-generates it:", zohoErrorMessage)
        const { purchaseorder_number, ...rest } = attemptPayload
        attemptPayload = rest
        continue
      }

      if (needsTaxDeclaration) {
        console.log("Zoho requires every line to declare tax/exemption:", zohoErrorMessage)
        taxDeclarationRequired = true
        const zeroRateOptions = taxMap.get(0)
        const zeroRateTaxId = zeroRateOptions && zeroRateOptions.length > 0 ? zeroRateOptions[0].tax_id : null
        const exemptionId = zeroRateTaxId ? null : await getZohoTaxExemptionId(ctx)
        cachedTaxFallback = { zeroRateTaxId, exemptionId }
        lineItems = buildLineItems(wantIgst, itemIdStripped, cachedTaxFallback)
        attemptPayload = { ...attemptPayload, line_items: lineItems }
        continue
      }

      // Unrecognized error: stop retrying, surface it as-is below.
      break
    }

    if (itemIdStripped && lineItems.some((li: any) => !li.item_id)) {
      itemMappingFallbackApplied = true
    }

    if (!createData?.purchaseorder) {
      return json(
        {
          error: "Failed to create Zoho purchase order",
          details: createData,
          debug: { taxDebug, lineItemDebug, gstDebug, sentPayload: attemptPayload },
        },
        500
      )
    }

    const zohoPoId = createData.purchaseorder.purchaseorder_id

    const { error: updateError } = await supabaseAdmin
      .from("purchase_orders")
      .update({
        zoho_po_id: zohoPoId,
        zoho_uploaded_at: new Date().toISOString(),
        status: "synced",
      })
      .eq("id", po_id)

    if (updateError) {
      console.error("PO was created in Zoho but the app record could not be updated:", updateError)
    }

    return json({
      success: true,
      zoho_po_id: zohoPoId,
      status_set: !updateError,
      zoho_po_number: createData.purchaseorder.purchaseorder_number ?? null,
      organizationId: ORG_ID,
      vendorRelinked: vendor.relinked === true,
      itemMappingFallbackApplied,
      ...(updateError ? { warning: "Uploaded to Zoho, but the app status could not be updated." } : {}),
      debug: { taxDebug, lineItemDebug, gstDebug, sentPayload: attemptPayload },
    })
  } catch (err) {
    if (err instanceof ZohoConnectionError) {
      return json({ error: err.message, code: err.code }, err.status)
    }
    if (err instanceof ZohoTemporaryError) {
      return json({ error: err.message, code: "zoho_temporary" }, 503)
    }
    return json({ error: "Unexpected error", details: String(err) }, 500)
  }
})