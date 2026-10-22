import { invalidateZohoConnection } from "./zoho.ts"

const PAGE_SIZE = 200
const PAGE_BATCH = 4   // pages downloaded at the same time
const MAX_PAGES = 100  // safety limit

interface PagesOptions {
  userId: string        // the user whose Zoho connection is used
  accessToken: string
  orgId: string
  path: string          // "items" or "contacts"
  listKey: string       // key that holds the rows in Zoho's reply
  idKey: string         // unique id inside each row
  params?: Record<string, string>
}

async function fetchPage(o: PagesOptions, page: number): Promise<{ rows: any[]; hasMore: boolean }> {
  const url = new URL(`https://www.zohoapis.in/books/v3/${o.path}`)
  url.searchParams.set("organization_id", o.orgId)
  url.searchParams.set("per_page", String(PAGE_SIZE))
  url.searchParams.set("page", String(page))
  for (const [key, value] of Object.entries(o.params ?? {})) url.searchParams.set(key, value)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Zoho-oauthtoken ${o.accessToken}` },
  })

  if (res.status === 401) invalidateZohoConnection(o.userId)
  if (res.status === 429) throw new Error("Zoho is limiting requests right now.")

  const data = await res.json().catch(() => ({}))
  const rows = data?.[o.listKey]
  if (!Array.isArray(rows)) {
    throw new Error(`Zoho ${o.path} page ${page} failed: ${data?.message ?? `HTTP ${res.status}`}`)
  }

  return { rows, hasMore: data?.page_context?.has_more_page === true }
}

// Downloads every page. Several pages are fetched together, and it keeps
// going until Zoho says there are no more.
export async function fetchAllZohoPages(o: PagesOptions): Promise<{ rows: any[]; pages: number }> {
  const byId = new Map<string, any>()
  let page = 1
  let pagesFetched = 0

  while (page <= MAX_PAGES) {
    const numbers = Array.from({ length: PAGE_BATCH }, (_, i) => page + i)
    const results = await Promise.all(numbers.map((n) => fetchPage(o, n)))

    let finished = false
    for (const result of results) {
      pagesFetched++
      for (const row of result.rows) byId.set(String(row[o.idKey]), row)
      if (!result.hasMore) {
        finished = true
        break
      }
    }

    if (finished) break
    page += PAGE_BATCH
  }

  return { rows: [...byId.values()], pages: pagesFetched }
}