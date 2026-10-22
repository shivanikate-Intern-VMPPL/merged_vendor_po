// Shared helpers for the Zoho list caches (items, vendors).
// Saved lists live in the `zoho_cache` table. A short-lived lock row
// ("lock:<key>") makes sure only ONE request refreshes a list from Zoho
// at a time, even when requests land on different server instances.

const LOCK_TTL_MS = 90 * 1000 // a crashed refresh can never block longer than this
const WAIT_STEP_MS = 1500

export class CacheWarmingError extends Error {
  readonly code = "zoho_warming"
  constructor() {
    super("The list is being prepared. Please try again in a few seconds.")
    this.name = "CacheWarmingError"
  }
}

export interface CacheRow {
  data: any[]
  fetchedAt: number
}

export async function readCacheRow(db: any, key: string): Promise<CacheRow | null> {
  const { data } = await db
    .from("zoho_cache")
    .select("data, fetched_at")
    .eq("cache_key", key)
    .maybeSingle()

  if (!data || !Array.isArray(data.data)) return null
  return { data: data.data, fetchedAt: new Date(data.fetched_at).getTime() }
}

export async function writeCacheRow(db: any, key: string, rows: unknown[]): Promise<void> {
  await db
    .from("zoho_cache")
    .upsert({ cache_key: key, data: rows, fetched_at: new Date().toISOString() })
}

async function tryAcquireRefreshLock(db: any, key: string): Promise<boolean> {
  const lockKey = `lock:${key}`

  // Remove an expired lock first, so a crashed refresh cannot block forever.
  await db
    .from("zoho_cache")
    .delete()
    .eq("cache_key", lockKey)
    .lt("fetched_at", new Date(Date.now() - LOCK_TTL_MS).toISOString())

  // Insert (not upsert): if another request already holds the lock, this
  // fails with a duplicate-key error and we know we are not first.
  const { error } = await db
    .from("zoho_cache")
    .insert({ cache_key: lockKey, data: [], fetched_at: new Date().toISOString() })

  if (!error) return true
  if (error.code === "23505") return false

  // Any other problem with the lock itself: carry on without it.
  console.warn("Could not create refresh lock, continuing without it:", error.message)
  return true
}

async function releaseRefreshLock(db: any, key: string): Promise<void> {
  await db.from("zoho_cache").delete().eq("cache_key", `lock:${key}`)
}

async function waitForCache(db: any, key: string, maxMs: number): Promise<CacheRow | null> {
  const until = Date.now() + maxMs
  while (Date.now() < until) {
    await new Promise((resolve) => setTimeout(resolve, WAIT_STEP_MS))
    const row = await readCacheRow(db, key)
    if (row && row.data.length > 0) return row
  }
  return null
}

export interface RefreshOptions<T> {
  db: any
  cacheKey: string
  ttlMs: number                 // how long a saved list counts as fresh
  forceRefresh: boolean         // user pressed the refresh button
  forceMinAgeMs: number         // ignore refresh clicks newer than this
  refresh: () => Promise<{ rows: T[]; debug: Record<string, unknown> }>
}

export interface RefreshResult<T> {
  rows: T[]
  cached: boolean
  stale?: boolean
  debug: Record<string, unknown>
}

export async function getOrRefreshList<T>(o: RefreshOptions<T>): Promise<RefreshResult<T>> {
  const cached = await readCacheRow(o.db, o.cacheKey)
  const cachedRows: T[] | null = cached && cached.data.length > 0 ? (cached.data as T[]) : null
  const ageMs = cached ? Date.now() - cached.fetchedAt : Infinity

  const needsRefresh =
    !cachedRows || (o.forceRefresh ? ageMs >= o.forceMinAgeMs : ageMs >= o.ttlMs)

  // Fresh enough: no Zoho call at all.
  if (!needsRefresh && cachedRows) {
    return {
      rows: cachedRows,
      cached: true,
      debug: { cache: "hit", ageMinutes: Math.round(ageMs / 60000), count: cachedRows.length },
    }
  }

  const gotLock = await tryAcquireRefreshLock(o.db, o.cacheKey)

  // Someone else is already refreshing.
  if (!gotLock) {
    if (cachedRows) {
      return { rows: cachedRows, cached: true, stale: true, debug: { cache: "stale-refresh-running" } }
    }
    const waited = await waitForCache(o.db, o.cacheKey, 25_000)
    if (waited) {
      return { rows: waited.data as T[], cached: true, debug: { cache: "waited-for-refresh" } }
    }
    throw new CacheWarmingError()
  }

  try {
    const { rows, debug } = await o.refresh()

    if (rows.length > 0) {
      await writeCacheRow(o.db, o.cacheKey, rows)
      return { rows, cached: false, debug: { ...debug, cache: "refreshed" } }
    }

    // Zoho answered with an empty list: never replace a good saved list with it.
    if (cachedRows) {
      return { rows: cachedRows, cached: true, stale: true, debug: { ...debug, cache: "kept-saved-list-zoho-empty" } }
    }
    return { rows: [], cached: false, debug: { ...debug, cache: "empty" } }
  } catch (err) {
    console.error("Zoho refresh failed:", err)

    // Zoho failed (rate limit, expired connection, network...):
    // users keep working with the last saved list.
    if (cachedRows) {
      return {
        rows: cachedRows,
        cached: true,
        stale: true,
        debug: { cache: "stale-after-error", refreshError: err instanceof Error ? err.message : String(err) },
      }
    }
    throw err
  } finally {
    await releaseRefreshLock(o.db, o.cacheKey)
  }
}