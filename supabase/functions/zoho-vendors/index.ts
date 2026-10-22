
// // import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// // import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// // import { requireAuth, requireRole } from "../_shared/auth.ts"
// // import { getUserZohoConnection, ZohoConnectionError } from "../_shared/zoho.ts"

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// // }

// // const CACHE_KEY = "zoho_vendors"
// // // const CACHE_TTL_MS = 10 * 60 * 1000
// // const CACHE_TTL_MS = 60 * 60 * 1000

// // serve(async (req) => {
// //   if (req.method === "OPTIONS") {
// //     return new Response("ok", { headers: corsHeaders })
// //   }

// //   let auth
// //   try {
// //     auth = await requireAuth(req)
// //     requireRole(auth, ["collector", "office", "admin"])
// //   } catch (res) {
// //     return res as Response
// //   }

// //   try {
// //     const supabaseAdmin = createClient(
// //       Deno.env.get("SUPABASE_URL")!,
// //       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
// //     )

// //     const url = new URL(req.url)
// //     const forceRefresh = url.searchParams.get("refresh") === "true"

// //     if (!forceRefresh) {
// //       const { data: cached } = await supabaseAdmin
// //         .from("zoho_cache")
// //         .select("data, fetched_at")
// //         .eq("cache_key", `${CACHE_KEY}:${auth.userId}`)
// //         .maybeSingle()

// //       if (cached) {
// //         const age = Date.now() - new Date(cached.fetched_at).getTime()
// //         if (age < CACHE_TTL_MS) {
// //           return new Response(
// //             JSON.stringify({ vendors: cached.data, cached: true }),
// //             { headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //           )
// //         }
// //       }
// //     }

// //     const { accessToken, organizationId: ORG_ID } =
// //       await getUserZohoConnection(supabaseAdmin, auth.userId)

// //     async function serveStaleOrError(errPayload: any) {
// //       const { data: staleCache } = await supabaseAdmin
// //         .from("zoho_cache")
// //         .select("data")
// //         .eq("cache_key", `${CACHE_KEY}:${auth.userId}`)
// //         .maybeSingle()

// //       if (staleCache) {
// //         return new Response(
// //           JSON.stringify({ vendors: staleCache.data, cached: true, stale: true }),
// //           { headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //         )
// //       }
// //       return new Response(
// //         JSON.stringify(errPayload),
// //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// //       )
// //     }

// //     let allContacts: any[] = []
// //     let page = 1
// //     let hasMorePages = true

// //     while (hasMorePages) {
// //       const vendorsRes = await fetch(
// //         `https://www.zohoapis.in/books/v3/contacts?organization_id=${ORG_ID}&contact_type=vendor&per_page=200&page=${page}`,
// //         { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
// //       )
// //       const vendorsData = await vendorsRes.json()

// //       if (!vendorsData.contacts) {
// //         return await serveStaleOrError({ error: "Failed to fetch vendors", details: vendorsData })
// //       }

// //       allContacts = allContacts.concat(vendorsData.contacts)
// //       hasMorePages = vendorsData.page_context?.has_more_page === true
// //       page++
// //       // if (page > 20) break
// //       if (page > 60) break
// //     }

// //     const cleanVendors = allContacts.map((v: any) => ({
// //       zoho_contact_id: v.contact_id,
// //       name: v.contact_name,
// //       company_name: v.company_name || null,
// //       email: v.email || null,
// //       phone: v.phone || v.mobile || null,
// //     }))

// //     await supabaseAdmin
// //       .from("zoho_cache")
// //       .upsert({ cache_key: `${CACHE_KEY}:${auth.userId}`, data: cleanVendors, fetched_at: new Date().toISOString() })

// //     return new Response(
// //       JSON.stringify({ vendors: cleanVendors, cached: false }),
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
//   ZohoConnectionError,
// } from "../_shared/zoho.ts"
// import { CacheWarmingError, getOrRefreshList } from "../_shared/cache.ts"
// import { fetchAllZohoPages } from "../_shared/zoho-pages.ts"

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// }

// const CACHE_KEY = "zoho_vendors"
// const CACHE_TTL_MS = 60 * 60 * 1000            // keep the list for 1 hour
// const FORCE_REFRESH_MIN_AGE_MS = 2 * 60 * 1000 // ignore refresh clicks within 2 minutes

// function json(body: unknown, status = 200): Response {
//   return new Response(JSON.stringify(body), {
//     status,
//     headers: { ...corsHeaders, "Content-Type": "application/json" },
//   })
// }

// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders })
//   }

//   let auth
//   try {
//     auth = await requireAuth(req)
//     requireRole(auth, ["collector", "office", "admin"])
//   } catch (res) {
//     return res as Response
//   }

//   try {
//     const supabaseAdmin = createClient(
//       Deno.env.get("SUPABASE_URL")!,
//       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
//     )

//     // One Zoho connection + one cache for everybody (when
//     // SHARED_ZOHO_USER_ID is set), so all users get the identical list.
//     const { zohoUserId, cacheId, shared } = getSharedZohoSource(auth.userId)
//     const source = shared ? "shared" : "per-user"
//     const forceRefresh = new URL(req.url).searchParams.get("refresh") === "true"

//     const result = await getOrRefreshList<any>({
//       db: supabaseAdmin,
//       cacheKey: `${CACHE_KEY}:${cacheId}`,
//       ttlMs: CACHE_TTL_MS,
//       forceRefresh,
//       forceMinAgeMs: FORCE_REFRESH_MIN_AGE_MS,
//       refresh: async () => {
//         const { accessToken, organizationId, organizationName, organizationCount } =
//           await getUserZohoConnection(supabaseAdmin, zohoUserId)

//         const { rows, pages } = await fetchAllZohoPages({
//           userId: zohoUserId,
//           accessToken,
//           orgId: organizationId,
//           path: "contacts",
//           listKey: "contacts",
//           idKey: "contact_id",
//           params: { contact_type: "vendor" },
//         })

//         const vendors = rows.map((v: any) => ({
//           zoho_contact_id: v.contact_id,
//           name: v.contact_name,
//           company_name: v.company_name || null,
//           email: v.email || null,
//           phone: v.phone || v.mobile || null,
//         }))

//         return {
//           rows: vendors,
//           debug: { organizationId, organizationName, organizationCount, pages, vendorCount: vendors.length },
//         }
//       },
//     })

//     return json({
//       vendors: result.rows,
//       cached: result.cached,
//       ...(result.stale ? { stale: true } : {}),
//       debug: { source, ...result.debug },
//     })
//   } catch (err) {
//     if (err instanceof ZohoConnectionError) {
//       return json({ error: err.message, code: err.code }, err.status)
//     }
//     if (err instanceof CacheWarmingError) {
//       return json({ error: err.message, code: err.code }, 503)
//     }
//     return json({ error: "Failed to load vendors", details: String(err) }, 500)
//   }
// })
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { requireAuth, requireRole } from "../_shared/auth.ts"
import {
  getSharedZohoSource,
  getUserZohoConnection,
  ZohoConnectionError,
} from "../_shared/zoho.ts"
import { CacheWarmingError, getOrRefreshList } from "../_shared/cache.ts"
import { fetchAllZohoPages } from "../_shared/zoho-pages.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const CACHE_KEY = "zoho_vendors"
const CACHE_TTL_MS = 60 * 60 * 1000            // keep the list for 1 hour
const FORCE_REFRESH_MIN_AGE_MS = 2 * 60 * 1000 // ignore refresh clicks within 2 minutes

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // One Zoho connection + one cache for everybody (when
    // SHARED_ZOHO_USER_ID is set), so all users get the identical list.
    const { zohoUserId, cacheId, shared } = getSharedZohoSource(auth.userId)
    const source = shared ? "shared" : "per-user"
    const forceRefresh = new URL(req.url).searchParams.get("refresh") === "true"

    const result = await getOrRefreshList<any>({
      db: supabaseAdmin,
      cacheKey: `${CACHE_KEY}:${cacheId}`,
      ttlMs: CACHE_TTL_MS,
      forceRefresh,
      forceMinAgeMs: FORCE_REFRESH_MIN_AGE_MS,
      refresh: async () => {
        const { accessToken, organizationId, organizationName, organizationCount } =
          await getUserZohoConnection(supabaseAdmin, zohoUserId)

        // Only ACTIVE vendors: an inactive or deleted vendor can never receive
        // a purchase order, so it must not be offered in the lists.
        const { rows, pages } = await fetchAllZohoPages({
          userId: zohoUserId,
          accessToken,
          orgId: organizationId,
          path: "contacts",
          listKey: "contacts",
          idKey: "contact_id",
          params: { contact_type: "vendor", filter_by: "Status.Active" },
        })

        const vendors = rows
          .filter((v: any) => String(v.status ?? "active").toLowerCase() !== "inactive")
          .map((v: any) => ({
            zoho_contact_id: v.contact_id,
            name: v.contact_name,
            company_name: v.company_name || null,
            email: v.email || null,
            phone: v.phone || v.mobile || null,
          }))

        return {
          rows: vendors,
          debug: {
            organizationId,
            organizationName,
            organizationCount,
            pages,
            totalFromZoho: rows.length,
            vendorCount: vendors.length,
          },
        }
      },
    })

    return json({
      vendors: result.rows,
      cached: result.cached,
      ...(result.stale ? { stale: true } : {}),
      debug: { source, ...result.debug },
    })
  } catch (err) {
    if (err instanceof ZohoConnectionError) {
      return json({ error: err.message, code: err.code }, err.status)
    }
    if (err instanceof CacheWarmingError) {
      return json({ error: err.message, code: err.code }, 503)
    }
    return json({ error: "Failed to load vendors", details: String(err) }, 500)
  }
})