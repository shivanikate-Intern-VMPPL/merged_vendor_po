// import { useState, useEffect } from 'react'
// import { supabase } from '../../../shared/lib/supabaseClient'
// import type { Profile } from '../../../shared/types'

// interface DashboardStats {
//   totalOrders: number
//   weeklyDelta: number
//   pendingApprovals: number
// }

// interface FarmerInfo {
//   name: string
//   village: string | null
// }

// interface NormalizedOrder {
//   id: string
//   po_number: string
//   grand_total: number
//   created_at: string
//   status: string
//   farmers: FarmerInfo | null
// }

// export function useDashboardStats(profile: Profile | null) {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalOrders: 0,
//     weeklyDelta: 0,
//     pendingApprovals: 0,
//   })
//   const [recentOrders, setRecentOrders] = useState<NormalizedOrder[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (profile === null) return
//     fetchStats()
//   }, [profile])

//   function normalizeFarmer(farmers: FarmerInfo | FarmerInfo[] | null): FarmerInfo | null {
//     if (!farmers) return null
//     return Array.isArray(farmers) ? (farmers[0] ?? null) : farmers
//   }

//   async function fetchStats() {
//     setLoading(true)
//     try {
//       const now = new Date()
//       const weekAgo = new Date(now)
//       weekAgo.setDate(weekAgo.getDate() - 7)

//       const { data: orders, error } = await supabase
//         .from('purchase_orders')
//         .select(`
//           id, po_number, grand_total, created_at, status,
//           farmers ( name, village )
//         `)
//         .gte('created_at', weekAgo.toISOString())
//         .order('created_at', { ascending: false })

//       if (error || !orders) {
//         console.error('Error fetching stats:', error)
//         setLoading(false)
//         return
//       }

//       const normalized: NormalizedOrder[] = orders.map((o) => ({
//         id: o.id,
//         po_number: o.po_number,
//         grand_total: o.grand_total,
//         created_at: o.created_at,
//         status: o.status ?? 'draft',
//         farmers: normalizeFarmer(o.farmers as FarmerInfo | FarmerInfo[] | null),
//       }))

//       const threeDaysAgo = new Date(now)
//       threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
//       const weeklyDelta = normalized.filter(
//         (o) => new Date(o.created_at) >= threeDaysAgo
//       ).length

//       const pendingApprovals = normalized.filter((o) => o.status === 'draft').length

//       setStats({
//         totalOrders: normalized.length,
//         weeklyDelta,
//         pendingApprovals,
//       })
//       setRecentOrders(normalized.slice(0, 20))
//     } catch (err) {
//       console.error('Dashboard error:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return { stats, recentOrders, loading, refetch: fetchStats }
// }
import { useState, useEffect } from 'react'
import { supabase } from '../../../shared/lib/supabaseClient'
import type { Profile } from '../../../shared/types'

interface DashboardStats {
  totalOrders: number
  weeklyDelta: number
  pendingApprovals: number
}

interface FarmerInfo {
  name: string
  village: string | null
}

interface NormalizedOrder {
  id: string
  po_number: string
  grand_total: number
  created_at: string
  status: string
  is_draft_only: boolean | null
  zoho_po_id: string | null
  farmers: FarmerInfo | null
}

export function useDashboardStats(profile: Profile | null) {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    weeklyDelta: 0,
    pendingApprovals: 0,
  })
  const [recentOrders, setRecentOrders] = useState<NormalizedOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile === null) return
    fetchStats()
  }, [profile])

  function normalizeFarmer(farmers: FarmerInfo | FarmerInfo[] | null): FarmerInfo | null {
    if (!farmers) return null
    return Array.isArray(farmers) ? (farmers[0] ?? null) : farmers
  }

  async function fetchStats() {
    setLoading(true)
    try {
      const now = new Date()
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data: orders, error } = await supabase
        .from('purchase_orders')
        .select(`
          id, po_number, grand_total, created_at, status, is_draft_only, zoho_po_id,
          farmers ( name, village )
        `)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })

      if (error || !orders) {
        console.error('Error fetching stats:', error)
        setLoading(false)
        return
      }

      const normalized: NormalizedOrder[] = orders.map((o: any) => ({
        id: o.id,
        po_number: o.po_number,
        grand_total: o.grand_total,
        created_at: o.created_at,
        status: o.status ?? 'draft',
        is_draft_only: o.is_draft_only ?? null,
        zoho_po_id: o.zoho_po_id ?? null,
        farmers: normalizeFarmer(o.farmers as FarmerInfo | FarmerInfo[] | null),
      }))

      const threeDaysAgo = new Date(now)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      const weeklyDelta = normalized.filter(
        (o) => new Date(o.created_at) >= threeDaysAgo
      ).length

      const pendingApprovals = normalized.filter((o) => o.status === 'draft').length

      setStats({
        totalOrders: normalized.length,
        weeklyDelta,
        pendingApprovals,
      })
      setRecentOrders(normalized.slice(0, 20))
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  return { stats, recentOrders, loading, refetch: fetchStats }
}