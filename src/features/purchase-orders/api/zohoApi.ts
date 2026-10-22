
import { supabase } from '../../../shared/lib/supabaseClient'

// const VENDOR_LOCAL_CACHE_KEY = 'mulyam_zoho_vendors_cache'
const VENDOR_LOCAL_CACHE_KEY = 'mulyam_zoho_vendors_cache_v2'
const ITEM_LOCAL_CACHE_KEY = 'mulyam_zoho_items_cache_v2'
const LOCAL_CACHE_TTL_MS = 4 * 60 * 60 * 1000 // 4 hours
// const ITEM_LOCAL_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const ITEM_LOCAL_CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes
const FORCE_REFRESH_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes between real Zoho pulls

interface LocalCacheEntry<T> {
  data: T
  timestamp: number
}

async function userScopedKey(baseKey: string): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession()
    const userId = data.session?.user.id
    return userId ? `${baseKey}:${userId}` : baseKey
  } catch {
    return baseKey
  }
}

function loadLocalCache<T>(storageKey: string, ttlMs = LOCAL_CACHE_TTL_MS): T | null {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null
  try {
    const rawItem = window.localStorage.getItem(storageKey)
    if (!rawItem) return null
    const cached = JSON.parse(rawItem) as LocalCacheEntry<T>
    if (Date.now() - cached.timestamp > ttlMs) {
      window.localStorage.removeItem(storageKey)
      return null
    }
    if (Array.isArray(cached.data) && cached.data.length === 0) {
      window.localStorage.removeItem(storageKey)
      return null
    }
    return cached.data
  } catch (error) {
    console.warn('Failed to read Zoho local cache:', error)
    return null
  }
}

function saveLocalCache<T>(storageKey: string, data: T): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return
  if (Array.isArray(data) && data.length === 0) return
  try {
    const payload: LocalCacheEntry<T> = { data, timestamp: Date.now() }
    window.localStorage.setItem(storageKey, JSON.stringify(payload))
  } catch (error) {
    console.warn('Failed to save Zoho local cache:', error)
  }
}

// Tracks the last time a REAL forced refresh actually hit Zoho, per cache
// key. Clicking "refresh" again within the cooldown window just re-serves
// whatever is cached instead of starting another slow 10+ second pull —
// this is what stops repeated clicks from hammering Zoho's API.
const lastForceRefreshAt = new Map<string, number>()

async function getFunctionError(error: unknown): Promise<string> {
  try {
    const context = (error as { context?: Response })?.context
    if (context) {
      const body = await context.json()
      if (body?.error) return body.error
    }
  } catch {
    // Use the stable fallback when the response body is unavailable.
  }
  return 'Zoho Books is not connected for this account. Connect it in Settings.'
}

export interface ZohoVendor {
  zoho_contact_id: string
  name: string
  company_name: string | null
  email: string | null
  phone: string | null
}

export interface ZohoItem {
  zoho_item_id: string
  name: string
  unit: string | null
  rate: number
  purchase_rate: number
  category: string | null
  active: boolean
}

const inFlightVendorRequests = new Map<string, Promise<ZohoVendor[]>>()
const inFlightItemRequests = new Map<string, Promise<ZohoItem[]>>()

export async function fetchZohoVendors(forceRefresh = false): Promise<ZohoVendor[]> {
  const cacheKey = await userScopedKey(VENDOR_LOCAL_CACHE_KEY)

  // Cooldown: a forced refresh within 5 minutes of the last one is
  // downgraded to a normal cached read, so rapid clicking never fires
  // multiple slow full Zoho pulls back to back.
  const lastForced = lastForceRefreshAt.get(cacheKey) ?? 0
  const cooldownActive = Date.now() - lastForced < FORCE_REFRESH_COOLDOWN_MS
  const effectiveForceRefresh = forceRefresh && !cooldownActive

  const lockKey = `${cacheKey}:${effectiveForceRefresh}`
  const existing = inFlightVendorRequests.get(lockKey)
  if (existing) return existing

  const request = (async (): Promise<ZohoVendor[]> => {
    if (effectiveForceRefresh) {
      window?.localStorage?.removeItem(cacheKey)
    } else {
      const cachedVendors = loadLocalCache<ZohoVendor[]>(cacheKey)
      if (cachedVendors) {
        return cachedVendors
      }
    }

    const { data, error } = await supabase.functions.invoke(
      `zoho-vendors${effectiveForceRefresh ? '?refresh=true' : ''}`,
      { method: 'POST' }
    )

    if (error) {
      console.error('Failed to fetch Zoho vendors:', error)
      throw new Error(await getFunctionError(error))
    }

    const vendors = data?.vendors ?? []
    if (vendors.length === 0) {
      console.warn('zoho-vendors returned an empty list for this user.', data)
    }
    console.info(`[Zoho vendors] ${vendors.length} vendors loaded (${effectiveForceRefresh ? 'fresh from Zoho' : 'from cache'}).`)
    saveLocalCache<ZohoVendor[]>(cacheKey, vendors)
    if (effectiveForceRefresh) lastForceRefreshAt.set(cacheKey, Date.now())
    return vendors
  })()

  inFlightVendorRequests.set(lockKey, request)
  try {
    return await request
  } finally {
    inFlightVendorRequests.delete(lockKey)
  }
}

export async function fetchZohoItems(forceRefresh = false): Promise<ZohoItem[]> {
  const cacheKey = await userScopedKey(ITEM_LOCAL_CACHE_KEY)

  const lastForced = lastForceRefreshAt.get(cacheKey) ?? 0
  const cooldownActive = Date.now() - lastForced < FORCE_REFRESH_COOLDOWN_MS
  const effectiveForceRefresh = forceRefresh && !cooldownActive

  const lockKey = `${cacheKey}:${effectiveForceRefresh}`
  const existing = inFlightItemRequests.get(lockKey)
  if (existing) return existing

  const request = (async (): Promise<ZohoItem[]> => {
    if (effectiveForceRefresh) {
      window?.localStorage?.removeItem(cacheKey)
    } else {
      const cachedItems = loadLocalCache<ZohoItem[]>(cacheKey, ITEM_LOCAL_CACHE_TTL_MS)
      if (cachedItems) {
        return cachedItems
      }
    }

    const { data, error } = await supabase.functions.invoke(
      `zoho-items${effectiveForceRefresh ? '?refresh=true' : ''}`,
      { method: 'POST' }
    )

    if (error) {
      console.error('Failed to fetch Zoho items:', error)
      throw new Error(await getFunctionError(error))
    }

    const items = data?.items ?? []
    if (items.length === 0) {
      console.warn('zoho-items returned an empty list for this user.', data)
    }
    // Tells you exactly how many items are being shown in the app, and
    // whether this came from Zoho just now or from the saved cache.
    // Open the browser console (F12 → Console) to see this line.
    console.info(
      `[Zoho items] ${items.length} items loaded (${effectiveForceRefresh ? 'fresh from Zoho' : 'from cache'}).`,
      data?.debug ?? ''
    )
    saveLocalCache<ZohoItem[]>(cacheKey, items)
    if (effectiveForceRefresh) lastForceRefreshAt.set(cacheKey, Date.now())
    return items
  })()

  inFlightItemRequests.set(lockKey, request)
  try {
    return await request
  } finally {
    inFlightItemRequests.delete(lockKey)
  }
}

export interface ZohoUploadResult {
  success: boolean
  zoho_po_id?: string
  error?: string
}

export async function uploadPurchaseOrderToZoho(poId: string): Promise<ZohoUploadResult> {
  const { data, error } = await supabase.functions.invoke('zoho-upload-po', {
    method: 'POST',
    body: { po_id: poId },
  })

  if (error) {
    console.error('Failed to upload PO to Zoho:', error)
    try {
      const context = (error as any).context
      if (context) {
        const body = await context.json()
        const zohoMessage = body?.details?.message || body?.details?.error?.message
        const message = zohoMessage || body?.error
        if (message) {
          return { success: false, error: message }
        }
      }
    } catch {
      // fall through to generic message below
    }
    return { success: false, error: 'Failed to upload to Zoho. Please try again.' }
  }

  if (data?.error) {
    return { success: false, error: data.error }
  }

  return { success: true, zoho_po_id: data?.zoho_po_id }
}

export interface AttachmentUploadResult {
  success: boolean
  results?: { path: string; success: boolean; error?: string }[]
  error?: string
}

export async function attachFilesToZoho(poId: string): Promise<AttachmentUploadResult> {
  const { data, error } = await supabase.functions.invoke('zoho-attach-files', {
    method: 'POST',
    body: { po_id: poId },
  })
  if (error) {
    console.error('Failed to attach files to Zoho:', error)
    return { success: false, error: 'Failed to attach files. Please try again.' }
  }
  if (data?.error) {
    return { success: false, error: data.error }
  }
  return { success: true, results: data?.results }
}