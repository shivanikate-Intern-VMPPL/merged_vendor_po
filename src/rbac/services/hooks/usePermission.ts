// // import { useState, useEffect } from 'react'
// // import { useAuthContext } from '../../../features/auth/AuthContext'
// // import { getUserRole } from '../userRoleService'
// // import { getRolePermissions } from '../permissionService'

// // export function usePermission(requiredPermission: string) {
// //   const { user } = useAuthContext()
// //   const [hasPermission, setHasPermission] = useState(false)
// //   const [loading, setLoading] = useState(true)

// //   useEffect(() => {
// //     if (!user) {
// //       setHasPermission(false)
// //       setLoading(false)
// //       return
// //     }
// //     checkPermission()
// //   }, [user, requiredPermission])

// //   async function checkPermission() {
// //     setLoading(true)
// //     try {
// //       const role = await getUserRole(user!.id)
// //       if (!role) {
// //         setHasPermission(false)
// //         setLoading(false)
// //         return
// //       }
// //       const permissions = await getRolePermissions(role.id)
// //       setHasPermission(permissions.some((p) => p.name === requiredPermission))
// //     } catch {
// //       setHasPermission(false)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   return { hasPermission, loading }
// // }
// import { useState, useEffect } from 'react'
// import { useAuthContext } from '../../../features/auth/AuthContext'
// import { getUserRole } from '../userRoleService'
// import { getRolePermissions } from '../permissionService'


// // Module-level cache: survives sidebar/page remounts, so navigating between
// // routes never resets permissions back to "loading / false".
// const CACHE_TTL_MS = 60_000 // re-check in the background at most once a minute

// interface CacheEntry {
//   permissions: Set<string>
//   fetchedAt: number
// }

// const permissionCache = new Map<string, CacheEntry>()
// const inflight = new Map<string, Promise<CacheEntry | null>>()

// // One shared request per user, no matter how many components ask at once.
// function loadPermissions(userId: string): Promise<CacheEntry | null> {
//   const existing = inflight.get(userId)
//   if (existing) return existing

//   const request = (async (): Promise<CacheEntry | null> => {
//     try {
//       const role = await getUserRole(userId)
//       let names: string[] = []
//       if (role) {
//         const permissions = await getRolePermissions(role.id)
//         names = permissions.map((p) => p.name)
//       }
//       const entry: CacheEntry = {
//         permissions: new Set(names),
//         fetchedAt: Date.now(),
//       }
//       permissionCache.set(userId, entry)
//       return entry
//     } catch {
//       return null
//     } finally {
//       inflight.delete(userId)
//     }
//   })()

//   inflight.set(userId, request)
//   return request
// }

// export function clearPermissionCache() {
//   permissionCache.clear()
//   inflight.clear()
// }

// export function usePermission(requiredPermission: string) {
//   const { user } = useAuthContext()
//   const userId = user?.id
//   const [, setTick] = useState(0)
//   const [loading, setLoading] = useState(
//     () => !!userId && !permissionCache.has(userId)
//   )

//   useEffect(() => {
//     if (!userId) {
//       setLoading(false)
//       return
//     }

//     const cached = permissionCache.get(userId)
//     const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS

//     // Cached and fresh: nothing to do, sidebar is already correct.
//     if (isFresh) {
//       setLoading(false)
//       return
//     }

//     // Cached but stale: keep showing cached values, refresh silently.
//     // Not cached at all: show loading until the first result arrives.
//     if (!cached) setLoading(true)

//     let cancelled = false
//     loadPermissions(userId).then(() => {
//       if (cancelled) return
//       setLoading(false)
//       setTick((t) => t + 1) // re-render with the fresh cache
//     })

//     return () => {
//       cancelled = true
//     }
//   }, [userId, requiredPermission])

//   const entry = userId ? permissionCache.get(userId) : undefined
//   const hasPermission = entry ? entry.permissions.has(requiredPermission) : false

//   return { hasPermission, loading: loading && !entry }
// }
import { useState, useEffect } from 'react'
import { useAuthContext } from '../../../features/auth/AuthContext'
import { getUserRole } from '../userRoleService'
import { getRolePermissions } from '../permissionService'


// Module-level cache: survives sidebar/page remounts, so navigating between
// routes never resets permissions back to "loading / false".
// Permissions change rarely, so they are re-checked in the background at
// most once every 15 minutes (it used to be every minute, which meant 4
// database calls on almost every page change).
const CACHE_TTL_MS = 15 * 60_000

interface CacheEntry {
  permissions: Set<string>
  fetchedAt: number
}

const permissionCache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<CacheEntry | null>>()

// One shared request per user, no matter how many components ask at once.
function loadPermissions(userId: string): Promise<CacheEntry | null> {
  const existing = inflight.get(userId)
  if (existing) return existing

  const request = (async (): Promise<CacheEntry | null> => {
    try {
      const role = await getUserRole(userId)
      let names: string[] = []
      if (role) {
        const permissions = await getRolePermissions(role.id)
        names = permissions.map((p) => p.name)
      }
      const entry: CacheEntry = {
        permissions: new Set(names),
        fetchedAt: Date.now(),
      }
      permissionCache.set(userId, entry)
      return entry
    } catch {
      return null
    } finally {
      inflight.delete(userId)
    }
  })()

  inflight.set(userId, request)
  return request
}

export function clearPermissionCache() {
  permissionCache.clear()
  inflight.clear()
}

export function usePermission(requiredPermission: string) {
  const { user } = useAuthContext()
  const userId = user?.id
  const [, setTick] = useState(0)
  const [loading, setLoading] = useState(
    () => !!userId && !permissionCache.has(userId)
  )

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const cached = permissionCache.get(userId)
    const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS

    // Cached and fresh: nothing to do, sidebar is already correct.
    if (isFresh) {
      setLoading(false)
      return
    }

    // Cached but stale: keep showing cached values, refresh silently.
    // Not cached at all: show loading until the first result arrives.
    if (!cached) setLoading(true)

    let cancelled = false
    loadPermissions(userId).then(() => {
      if (cancelled) return
      setLoading(false)
      setTick((t) => t + 1) // re-render with the fresh cache
    })

    return () => {
      cancelled = true
    }
  }, [userId, requiredPermission])

  const entry = userId ? permissionCache.get(userId) : undefined
  const hasPermission = entry ? entry.permissions.has(requiredPermission) : false

  return { hasPermission, loading: loading && !entry }
}