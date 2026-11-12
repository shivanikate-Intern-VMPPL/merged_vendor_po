// // // import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// // // import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// // // import { requireAuth, requireRole } from "../_shared/auth.ts"
// // // import { getUserZohoConnection, ZohoConnectionError } from "../_shared/zoho.ts"

// // // const corsHeaders = {
// // //   "Access-Control-Allow-Origin": "*",
// // //   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// // // }

// // // const CACHE_KEY = "zoho_items_v2"
// // // // const CACHE_TTL_MS = 10 * 60 * 1000
// // // const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// // // serve(async (req) => {
// // //   if (req.method === "OPTIONS") {
// // //     return new Response("ok", { headers: corsHeaders })
// // //   }

// // //   let auth
// // //   try {
// // //     auth = await requireAuth(req)
// // //     requireRole(auth, ["collector", "office", "admin"])
// // //   } catch (res) {
// // //     return res as Response
// // //   }

// // //   try {
// // //     const supabaseAdmin = createClient(
// // //       Deno.env.get("SUPABASE_URL")!,
// // //       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
// // //     )

// // //     const url = new URL(req.url)
// // //     const forceRefresh = url.searchParams.get("refresh") === "true"

// // //     if (!forceRefresh) {
// // //       const { data: cached } = await supabaseAdmin
// // //         .from("zoho_cache")
// // //         .select("data, fetched_at")
// // //         .eq("cache_key", `${CACHE_KEY}:${auth.userId}`)
// // //         .maybeSingle()

// // //       if (cached) {
// // //         const age = Date.now() - new Date(cached.fetched_at).getTime()
// // //         if (age < CACHE_TTL_MS) {
// // //           return new Response(
// // //             JSON.stringify({ items: cached.data, cached: true }),
// // //             { headers: { ...corsHeaders, "Content-Type": "application/json" } }
// // //           )
// // //         }
// // //       }
// // //     }

// // //     const { accessToken, organizationId: ORG_ID } =
// // //       await getUserZohoConnection(supabaseAdmin, auth.userId)

// // //     async function serveStaleOrError(errPayload: any) {
// // //       const { data: staleCache } = await supabaseAdmin
// // //         .from("zoho_cache")
// // //         .select("data")
// // //         .eq("cache_key", `${CACHE_KEY}:${auth.userId}`)
// // //         .maybeSingle()

// // //       if (staleCache) {
// // //         return new Response(
// // //           JSON.stringify({ items: staleCache.data, cached: true, stale: true }),
// // //           { headers: { ...corsHeaders, "Content-Type": "application/json" } }
// // //         )
// // //       }
// // //       return new Response(
// // //         JSON.stringify(errPayload),
// // //         { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// // //       )
// // //     }

// // //     let allItems: any[] = []
// // //     let page = 1
// // //     let hasMorePages = true

// // //     while (hasMorePages) {
// // //       const itemsRes = await fetch(
// // //         `https://www.zohoapis.in/books/v3/items?organization_id=${ORG_ID}&filter_by=Status.Active&per_page=200&page=${page}`,
// // //         { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
// // //       )
// // //       const itemsData = await itemsRes.json()

// // //       if (!itemsData.items) {
// // //         return await serveStaleOrError({ error: "Failed to fetch items", details: itemsData })
// // //       }

// // //       allItems = allItems.concat(itemsData.items)
// // //       hasMorePages = itemsData.page_context?.has_more_page === true
// // //       page++
// // //       if (page > 20) break
// // //     }

// // //     const purchasableItems = allItems.filter((item: any) =>
// // //       item.can_be_purchased === true &&
// // //       item.name.toLowerCase().includes('bulk')
// // //     )

// // //     const cleanItems = purchasableItems.map((item: any) => ({
// // //       zoho_item_id: item.item_id,
// // //       name: item.name,
// // //       unit: item.unit || null,
// // //       rate: item.rate ?? 0,
// // //       purchase_rate: item.purchase_rate ?? 0,
// // //       category: item.category_name || null,
// // //       active: item.status === "active",
// // //     }))

// // //     await supabaseAdmin
// // //       .from("zoho_cache")
// // //       .upsert({ cache_key: `${CACHE_KEY}:${auth.userId}`, data: cleanItems, fetched_at: new Date().toISOString() })

// // //     return new Response(
// // //       JSON.stringify({ items: cleanItems, cached: false }),
// // //       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
// // //     )
// // //   } catch (err) {
// // //     if (err instanceof ZohoConnectionError) {
// // //       return new Response(
// // //         JSON.stringify({ error: err.message, code: err.code }),
// // //         { status: err.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
// // //       )
// // //     }
// // //     return new Response(
// // //       JSON.stringify({ error: "Unexpected error", details: String(err) }),
// // //       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
// // //     )
// // //   }
// // // })
// // import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// // import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// // import { requireAuth, requireRole } from "../_shared/auth.ts"
// // import {
// //   getSharedZohoSource,
// //   getUserZohoConnection,
// //   ZohoConnectionError,
// // } from "../_shared/zoho.ts"

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// // }

// // const CACHE_KEY = "zoho_items_v2"
// // const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// // function json(body: unknown, status = 200): Response {
// //   return new Response(JSON.stringify(body), {
// //     status,
// //     headers: { ...corsHeaders, "Content-Type": "application/json" },
// //   })
// // }

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

// //     // One Zoho connection + one cache for everybody (when
// //     // SHARED_ZOHO_USER_ID is set), so all users get the identical list.
// //     const { zohoUserId, cacheId, shared } = getSharedZohoSource(auth.userId)
// //     const cacheKey = `${CACHE_KEY}:${cacheId}`

// //     const url = new URL(req.url)
// //     const forceRefresh = url.searchParams.get("refresh") === "true"

// //     if (!forceRefresh) {
// //       const { data: cached } = await supabaseAdmin
// //         .from("zoho_cache")
// //         .select("data, fetched_at")
// //         .eq("cache_key", cacheKey)
// //         .maybeSingle()

// //       if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
// //         const age = Date.now() - new Date(cached.fetched_at).getTime()
// //         if (age < CACHE_TTL_MS) {
// //           return json({
// //             items: cached.data,
// //             cached: true,
// //             debug: { source: shared ? "shared" : "per-user", itemCount: cached.data.length },
// //           })
// //         }
// //       }
// //     }

// //     const { accessToken, organizationId, organizationName, organizationCount } =
// //       await getUserZohoConnection(supabaseAdmin, zohoUserId)

// //     async function serveStaleOrError(errPayload: unknown) {
// //       const { data: staleCache } = await supabaseAdmin
// //         .from("zoho_cache")
// //         .select("data")
// //         .eq("cache_key", cacheKey)
// //         .maybeSingle()

// //       if (staleCache && Array.isArray(staleCache.data) && staleCache.data.length > 0) {
// //         return json({ items: staleCache.data, cached: true, stale: true })
// //       }
// //       return json(errPayload, 500)
// //     }

// //     let allItems: any[] = []
// //     let page = 1
// //     let hasMorePages = true

// //     while (hasMorePages) {
// //       const itemsRes = await fetch(
// //         `https://www.zohoapis.in/books/v3/items?organization_id=${organizationId}&filter_by=Status.Active&per_page=200&page=${page}`,
// //         { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
// //       )
// //       const itemsData = await itemsRes.json()

// //       if (!itemsData.items) {
// //         return await serveStaleOrError({ error: "Failed to fetch items", details: itemsData })
// //       }

// //       allItems = allItems.concat(itemsData.items)
// //       hasMorePages = itemsData.page_context?.has_more_page === true
// //       page++
// //       if (page > 20) break
// //     }

// //     const purchasableItems = allItems.filter((item: any) =>
// //       item.can_be_purchased === true &&
// //       String(item.name ?? "").toLowerCase().includes("bulk")
// //     )

// //     const cleanItems = purchasableItems.map((item: any) => ({
// //       zoho_item_id: item.item_id,
// //       name: item.name,
// //       unit: item.unit || null,
// //       rate: item.rate ?? 0,
// //       purchase_rate: item.purchase_rate ?? 0,
// //       category: item.category_name || null,
// //       active: item.status === "active",
// //     }))

// //     const debug = {
// //       source: shared ? "shared" : "per-user",
// //       organizationId,
// //       organizationName,
// //       organizationCount,
// //       totalFromZoho: allItems.length,
// //       afterFilter: cleanItems.length,
// //     }

// //     // Never cache an empty list: it would hide the real problem and
// //     // lock the user out until the cache expires.
// //     if (cleanItems.length === 0) {
// //       console.warn("zoho-items: filter returned 0 items", debug)
// //       return json({ items: [], cached: false, debug })
// //     }

// //     await supabaseAdmin
// //       .from("zoho_cache")
// //       .upsert({ cache_key: cacheKey, data: cleanItems, fetched_at: new Date().toISOString() })

// //     return json({ items: cleanItems, cached: false, debug })
// //   } catch (err) {
// //     if (err instanceof ZohoConnectionError) {
// //       return json({ error: err.message, code: err.code }, err.status)
// //     }
// //     return json({ error: "Unexpected error", details: String(err) }, 500)
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

// const CACHE_KEY = "zoho_items_v2"
// const CACHE_TTL_MS = 60 * 60 * 1000          // keep the list for 1 hour
// const FORCE_REFRESH_MIN_AGE_MS = 2 * 60 * 1000 // ignore refresh clicks within 2 minutes
// const PAGE_SIZE = 200
// const PAGE_BATCH = 4                          // pages downloaded at the same time
// const MAX_PAGES = 100                         // safety limit: 20,000 items

// function json(body: unknown, status = 200): Response {
//   return new Response(JSON.stringify(body), {
//     status,
//     headers: { ...corsHeaders, "Content-Type": "application/json" },
//   })
// }

// interface RefreshResult {
//   items: any[]
//   debug: Record<string, unknown>
// }

// // If several users trigger a refresh at the same moment, they share ONE
// // download instead of each calling Zoho.
// const inFlightRefresh = new Map<string, Promise<RefreshResult>>()

// async function fetchItemsPage(
//   userId: string,
//   accessToken: string,
//   orgId: string,
//   page: number
// ): Promise<{ items: any[]; hasMore: boolean }> {
//   const res = await fetch(
//     `https://www.zohoapis.in/books/v3/items?organization_id=${orgId}&filter_by=Status.Active&per_page=${PAGE_SIZE}&page=${page}`,
//     { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } }
//   )

//   if (res.status === 401) invalidateZohoConnection(userId)

//   const data = await res.json().catch(() => ({}))
//   if (!Array.isArray(data.items)) {
//     throw new Error(`Zoho items page ${page} failed: ${data?.message ?? `HTTP ${res.status}`}`)
//   }

//   return { items: data.items, hasMore: data.page_context?.has_more_page === true }
// }

// // Downloads every active item. Several pages are fetched together, and it
// // keeps going until Zoho says there are no more pages.
// async function fetchAllActiveItems(
//   userId: string,
//   accessToken: string,
//   orgId: string
// ): Promise<{ items: any[]; pages: number }> {
//   const byId = new Map<string, any>()
//   let page = 1
//   let pagesFetched = 0

//   while (page <= MAX_PAGES) {
//     const pageNumbers = Array.from({ length: PAGE_BATCH }, (_, i) => page + i)
//     const results = await Promise.all(
//       pageNumbers.map((p) => fetchItemsPage(userId, accessToken, orgId, p))
//     )

//     let finished = false
//     for (const result of results) {
//       pagesFetched++
//       for (const item of result.items) byId.set(String(item.item_id), item)
//       if (!result.hasMore) {
//         finished = true
//         break
//       }
//     }

//     if (finished) break
//     page += PAGE_BATCH
//   }

//   return { items: [...byId.values()], pages: pagesFetched }
// }

// async function refreshCatalog(
//   supabaseAdmin: any,
//   zohoUserId: string,
//   cacheKey: string,
//   source: string
// ): Promise<RefreshResult> {
//   const { accessToken, organizationId, organizationName, organizationCount } =
//     await getUserZohoConnection(supabaseAdmin, zohoUserId)

//   const { items: allItems, pages } = await fetchAllActiveItems(zohoUserId, accessToken, organizationId)

//   const cleanItems = allItems
//     .filter((item: any) =>
//       item.can_be_purchased === true &&
//       String(item.name ?? "").toLowerCase().includes("bulk")
//     )
//     .map((item: any) => ({
//       zoho_item_id: item.item_id,
//       name: item.name,
//       unit: item.unit || null,
//       rate: item.rate ?? 0,
//       purchase_rate: item.purchase_rate ?? 0,
//       category: item.category_name || null,
//       active: item.status === "active",
//     }))

//   const debug = {
//     source,
//     cache: "refreshed",
//     organizationId,
//     organizationName,
//     organizationCount,
//     pages,
//     totalFromZoho: allItems.length,
//     afterFilter: cleanItems.length,
//   }

//   // Never save an empty list: it would hide the real problem.
//   if (cleanItems.length > 0) {
//     await supabaseAdmin
//       .from("zoho_cache")
//       .upsert({ cache_key: cacheKey, data: cleanItems, fetched_at: new Date().toISOString() })
//   } else {
//     console.warn("zoho-items: filter returned 0 items", debug)
//   }

//   return { items: cleanItems, debug }
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
//     const cacheKey = `${CACHE_KEY}:${cacheId}`
//     const source = shared ? "shared" : "per-user"

//     const forceRefresh = new URL(req.url).searchParams.get("refresh") === "true"

//     const { data: cachedRow } = await supabaseAdmin
//       .from("zoho_cache")
//       .select("data, fetched_at")
//       .eq("cache_key", cacheKey)
//       .maybeSingle()

//     const cachedItems: any[] = Array.isArray(cachedRow?.data) ? cachedRow.data : []
//     const hasCache = cachedItems.length > 0
//     const ageMs = cachedRow ? Date.now() - new Date(cachedRow.fetched_at).getTime() : Infinity

//     const needsRefresh =
//       !hasCache || (forceRefresh ? ageMs >= FORCE_REFRESH_MIN_AGE_MS : ageMs >= CACHE_TTL_MS)

//     // Fresh enough: no Zoho call at all.
//     if (!needsRefresh) {
//       return json({
//         items: cachedItems,
//         cached: true,
//         debug: { source, cache: "hit", ageMinutes: Math.round(ageMs / 60000), itemCount: cachedItems.length },
//       })
//     }

//     let pending = inFlightRefresh.get(cacheKey)
//     if (!pending) {
//       pending = refreshCatalog(supabaseAdmin, zohoUserId, cacheKey, source).finally(() => {
//         inFlightRefresh.delete(cacheKey)
//       })
//       inFlightRefresh.set(cacheKey, pending)
//     }

//     try {
//       const result = await pending

//       // Zoho answered with an empty list but we have a good saved list: keep it.
//       if (result.items.length === 0 && hasCache) {
//         return json({ items: cachedItems, cached: true, stale: true, debug: { ...result.debug, cache: "stale-kept" } })
//       }

//       return json({ items: result.items, cached: false, debug: result.debug })
//     } catch (err) {
//       console.error("zoho-items refresh failed:", err)

//       // Zoho failed (rate limit, network...). Users keep working with the saved list.
//       if (hasCache) {
//         return json({ items: cachedItems, cached: true, stale: true, debug: { source, cache: "stale-after-error" } })
//       }

//       if (err instanceof ZohoConnectionError) throw err
//       return json({ error: "Failed to fetch items", details: String(err) }, 500)
//     }
//   } catch (err) {
//     if (err instanceof ZohoConnectionError) {
//       return json({ error: err.message, code: err.code }, err.status)
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
  ZohoConnectionError,
} from "../_shared/zoho.ts"
import { CacheWarmingError, getOrRefreshList } from "../_shared/cache.ts"
import { fetchAllZohoPages } from "../_shared/zoho-pages.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const CACHE_KEY = "zoho_items_v4"
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

        const { rows, pages } = await fetchAllZohoPages({
          userId: zohoUserId,
          accessToken,
          orgId: organizationId,
          path: "items",
          listKey: "items",
          idKey: "item_id",
          params: { filter_by: "Status.Active" },
        })

        const { error: syncError } = await supabaseAdmin.rpc("sync_zoho_item_flags", {
          p_item_flags: rows.map((item: any) => ({
            zoho_item_id: item.item_id,
            can_be_purchased: item.can_be_purchased ?? null,
            can_be_sold: item.can_be_sold ?? null,
          })),
        })
        if (syncError) {
          throw new Error(`Failed to sync Zoho item flags: ${syncError.message}`)
        }

        const items = rows
          .filter((item: any) => {
            const isActive = item.status === "active"
            const isLegacyBulkItem = String(item.name ?? "").toLowerCase().includes("bulk")
            return isActive && (
              isLegacyBulkItem ||
              item.can_be_purchased === true ||
              item.can_be_sold === true
            )
          })
          .map((item: any) => ({
            zoho_item_id: item.item_id,
            name: item.name,
            unit: item.unit || null,
            rate: item.rate ?? 0,
            purchase_rate: item.purchase_rate ?? 0,
            category: item.category_name || null,
            active: item.status === "active",
            can_be_purchased: item.can_be_purchased ?? null,
            can_be_sold: item.can_be_sold ?? null,
          }))

        return {
          rows: items,
          debug: {
            organizationId,
            organizationName,
            organizationCount,
            pages,
            totalFromZoho: rows.length,
            previousBulkCount: rows.filter((item: any) =>
              item.status === "active" &&
              item.can_be_purchased === true &&
              String(item.name ?? "").toLowerCase().includes("bulk")
            ).length,
            afterFilter: items.length,
          },
        }
      },
    })

    return json({
      items: result.rows,
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
    return json({ error: "Failed to fetch items", details: String(err) }, 500)
  }
})