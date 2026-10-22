// // import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

// // const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in/oauth/v2/token"
// // const ZOHO_BOOKS_API_URL = "https://www.zohoapis.in/books/v3"

// // export class ZohoConnectionError extends Error {
// //   readonly status: number
// //   readonly code: string

// //   constructor(message: string, code: string, status = 409) {
// //     super(message)
// //     this.name = "ZohoConnectionError"
// //     this.code = code
// //     this.status = status
// //   }
// // }

// // export interface UserZohoConnection {
// //   accessToken: string
// //   organizationId: string
// // }

// // export async function getUserZohoConnection(
// //   supabaseAdmin: SupabaseClient,
// //   userId: string,
// // ): Promise<UserZohoConnection> {
// //   const { data: connection, error: connectionError } = await supabaseAdmin
// //     .from("zoho_books_connections")
// //     .select("refresh_token")
// //     .eq("user_id", userId)
// //     .maybeSingle()

// //   if (connectionError) {
// //     throw new ZohoConnectionError(
// //       "Failed to load the Zoho Books connection",
// //       "connection_lookup_failed",
// //       500,
// //     )
// //   }

// //   if (!connection?.refresh_token) {
// //     throw new ZohoConnectionError(
// //       "Connect your Zoho Books account in Settings before using Zoho data.",
// //       "zoho_not_connected",
// //     )
// //   }

// //   const clientId = Deno.env.get("ZOHO_CLIENT_ID")
// //   const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")

// //   if (!clientId || !clientSecret) {
// //     throw new ZohoConnectionError(
// //       "Zoho OAuth configuration is incomplete",
// //       "zoho_configuration_missing",
// //       500,
// //     )
// //   }

// //   const tokenResponse = await fetch(ZOHO_ACCOUNTS_URL, {
// //     method: "POST",
// //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
// //     body: new URLSearchParams({
// //       refresh_token: connection.refresh_token,
// //       client_id: clientId,
// //       client_secret: clientSecret,
// //       grant_type: "refresh_token",
// //     }),
// //   })
// //   const tokenData = await tokenResponse.json()

// //   if (!tokenResponse.ok || !tokenData.access_token) {
// //     throw new ZohoConnectionError(
// //       "Your Zoho Books connection has expired. Reconnect it in Settings.",
// //       "zoho_reconnect_required",
// //     )
// //   }

// //   const organizationsResponse = await fetch(
// //     `${ZOHO_BOOKS_API_URL}/organizations`,
// //     { headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` } },
// //   )
// //   const organizationsData = await organizationsResponse.json()
// //   const organizationId = organizationsData?.organizations?.[0]?.organization_id

// //   if (!organizationsResponse.ok || !organizationId) {
// //     throw new ZohoConnectionError(
// //       "No Zoho Books organization is available for this account.",
// //       "zoho_organization_missing",
// //     )
// //   }

// //   return {
// //     accessToken: tokenData.access_token,
// //     organizationId,
// //   }
// // }
// import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

// const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in/oauth/v2/token"
// const ZOHO_BOOKS_API_URL = "https://www.zohoapis.in/books/v3"

// export class ZohoConnectionError extends Error {
//   readonly status: number
//   readonly code: string

//   constructor(message: string, code: string, status = 409) {
//     super(message)
//     this.name = "ZohoConnectionError"
//     this.code = code
//     this.status = status
//   }
// }

// export interface UserZohoConnection {
//   accessToken: string
//   organizationId: string
//   organizationName: string | null
//   organizationCount: number
// }

// // Decides WHICH Zoho connection and cache to use.
// // If SHARED_ZOHO_USER_ID is set, every user uses that one connection and
// // one shared cache, so everybody sees exactly the same Zoho data.
// // If it is not set, it falls back to the old per-user behaviour.
// export function getSharedZohoSource(callerUserId: string): {
//   zohoUserId: string
//   cacheId: string
//   shared: boolean
// } {
//   const sharedUserId = Deno.env.get("SHARED_ZOHO_USER_ID")?.trim()
//   if (sharedUserId) {
//     return { zohoUserId: sharedUserId, cacheId: "shared", shared: true }
//   }
//   return { zohoUserId: callerUserId, cacheId: callerUserId, shared: false }
// }

// export async function getUserZohoConnection(
//   supabaseAdmin: SupabaseClient,
//   userId: string,
// ): Promise<UserZohoConnection> {
//   const { data: connection, error: connectionError } = await supabaseAdmin
//     .from("zoho_books_connections")
//     .select("refresh_token")
//     .eq("user_id", userId)
//     .maybeSingle()

//   if (connectionError) {
//     throw new ZohoConnectionError(
//       "Failed to load the Zoho Books connection",
//       "connection_lookup_failed",
//       500,
//     )
//   }

//   if (!connection?.refresh_token) {
//     throw new ZohoConnectionError(
//       "Connect your Zoho Books account in Settings before using Zoho data.",
//       "zoho_not_connected",
//     )
//   }

//   const clientId = Deno.env.get("ZOHO_CLIENT_ID")
//   const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")

//   if (!clientId || !clientSecret) {
//     throw new ZohoConnectionError(
//       "Zoho OAuth configuration is incomplete",
//       "zoho_configuration_missing",
//       500,
//     )
//   }

//   const tokenResponse = await fetch(ZOHO_ACCOUNTS_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       refresh_token: connection.refresh_token,
//       client_id: clientId,
//       client_secret: clientSecret,
//       grant_type: "refresh_token",
//     }),
//   })
//   const tokenData = await tokenResponse.json()

//   if (!tokenResponse.ok || !tokenData.access_token) {
//     throw new ZohoConnectionError(
//       "Your Zoho Books connection has expired. Reconnect it in Settings.",
//       "zoho_reconnect_required",
//     )
//   }

//   const organizationsResponse = await fetch(
//     `${ZOHO_BOOKS_API_URL}/organizations`,
//     { headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` } },
//   )
//   const organizationsData = await organizationsResponse.json()
//   const organizations: any[] = organizationsData?.organizations ?? []

//   // Optional: pin the organization with the ZOHO_ORGANIZATION_ID secret.
//   // Without it, the first organization of the Zoho login is used.
//   const pinnedOrgId = Deno.env.get("ZOHO_ORGANIZATION_ID")?.trim()
//   const chosenOrg =
//     (pinnedOrgId &&
//       organizations.find((o) => String(o.organization_id) === pinnedOrgId)) ||
//     organizations[0]

//   const organizationId = chosenOrg?.organization_id

//   if (!organizationsResponse.ok || !organizationId) {
//     throw new ZohoConnectionError(
//       "No Zoho Books organization is available for this account.",
//       "zoho_organization_missing",
//     )
//   }

//   return {
//     accessToken: tokenData.access_token,
//     organizationId: String(organizationId),
//     organizationName: chosenOrg?.name ?? null,
//     organizationCount: organizations.length,
//   }
// }
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in/oauth/v2/token"
const ZOHO_BOOKS_API_URL = "https://www.zohoapis.in/books/v3"

// A Zoho access token lives for 60 minutes. Reuse it for 50 minutes so that
// hundreds of requests share ONE token instead of each asking Zoho for a new
// one (Zoho limits how often tokens can be generated).
const CONNECTION_TTL_MS = 50 * 60 * 1000

export class ZohoConnectionError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, code: string, status = 409) {
    super(message)
    this.name = "ZohoConnectionError"
    this.code = code
    this.status = status
  }
}

export interface UserZohoConnection {
  accessToken: string
  organizationId: string
  organizationName: string | null
  organizationCount: number
}

// Decides WHICH Zoho connection and cache to use.
// If SHARED_ZOHO_USER_ID is set, every user uses that one connection and
// one shared cache, so everybody sees exactly the same Zoho data.
export function getSharedZohoSource(callerUserId: string): {
  zohoUserId: string
  cacheId: string
  shared: boolean
} {
  const sharedUserId = Deno.env.get("SHARED_ZOHO_USER_ID")?.trim()
  if (sharedUserId) {
    return { zohoUserId: sharedUserId, cacheId: "shared", shared: true }
  }
  return { zohoUserId: callerUserId, cacheId: callerUserId, shared: false }
}

const connectionCache = new Map<string, UserZohoConnection & { expiresAt: number }>()
const connectionInFlight = new Map<string, Promise<UserZohoConnection>>()

// Call this when Zoho answers 401 so the next request gets a fresh token.
export function invalidateZohoConnection(userId: string): void {
  connectionCache.delete(userId)
}

export async function getUserZohoConnection(
  supabaseAdmin: SupabaseClient,
  userId: string,
): Promise<UserZohoConnection> {
  const cached = connectionCache.get(userId)
  if (cached && cached.expiresAt > Date.now()) {
    return {
      accessToken: cached.accessToken,
      organizationId: cached.organizationId,
      organizationName: cached.organizationName,
      organizationCount: cached.organizationCount,
    }
  }

  // If another request is already loading the connection, wait for it.
  const running = connectionInFlight.get(userId)
  if (running) return running

  const promise = loadConnection(supabaseAdmin, userId)
    .then((connection) => {
      connectionCache.set(userId, {
        ...connection,
        expiresAt: Date.now() + CONNECTION_TTL_MS,
      })
      return connection
    })
    .finally(() => {
      connectionInFlight.delete(userId)
    })

  connectionInFlight.set(userId, promise)
  return promise
}

async function loadConnection(
  supabaseAdmin: SupabaseClient,
  userId: string,
): Promise<UserZohoConnection> {
  const { data: connection, error: connectionError } = await supabaseAdmin
    .from("zoho_books_connections")
    .select("refresh_token")
    .eq("user_id", userId)
    .maybeSingle()

  if (connectionError) {
    throw new ZohoConnectionError(
      "Failed to load the Zoho Books connection",
      "connection_lookup_failed",
      500,
    )
  }

  if (!connection?.refresh_token) {
    throw new ZohoConnectionError(
      "Connect your Zoho Books account in Settings before using Zoho data.",
      "zoho_not_connected",
    )
  }

  const clientId = Deno.env.get("ZOHO_CLIENT_ID")
  const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")

  if (!clientId || !clientSecret) {
    throw new ZohoConnectionError(
      "Zoho OAuth configuration is incomplete",
      "zoho_configuration_missing",
      500,
    )
  }

  const tokenResponse = await fetch(ZOHO_ACCOUNTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: connection.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  })
  const tokenData = await tokenResponse.json().catch(() => ({}))

  if (!tokenResponse.ok || !tokenData.access_token) {
    const description = String(tokenData?.error_description ?? "").toLowerCase()

    // Zoho limits how many tokens can be created in a short time. That is NOT
    // a broken connection, so don't tell people to reconnect.
    if (description.includes("too many requests")) {
      throw new ZohoConnectionError(
        "Zoho is limiting requests right now. Please try again in a few minutes.",
        "zoho_rate_limited",
        429,
      )
    }

    throw new ZohoConnectionError(
      "Your Zoho Books connection has expired. Reconnect it in Settings.",
      "zoho_reconnect_required",
    )
  }

  const organizationsResponse = await fetch(
    `${ZOHO_BOOKS_API_URL}/organizations`,
    { headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` } },
  )
  const organizationsData = await organizationsResponse.json().catch(() => ({}))
  const organizations: any[] = organizationsData?.organizations ?? []

  // Optional: pin the organization with the ZOHO_ORGANIZATION_ID secret.
  // Without it, the first organization of the Zoho login is used.
  const pinnedOrgId = Deno.env.get("ZOHO_ORGANIZATION_ID")?.trim()
  const chosenOrg =
    (pinnedOrgId &&
      organizations.find((o) => String(o.organization_id) === pinnedOrgId)) ||
    organizations[0]

  const organizationId = chosenOrg?.organization_id

  if (!organizationsResponse.ok || !organizationId) {
    throw new ZohoConnectionError(
      "No Zoho Books organization is available for this account.",
      "zoho_organization_missing",
    )
  }

  return {
    accessToken: tokenData.access_token,
    organizationId: String(organizationId),
    organizationName: chosenOrg?.name ?? null,
    organizationCount: organizations.length,
  }
}