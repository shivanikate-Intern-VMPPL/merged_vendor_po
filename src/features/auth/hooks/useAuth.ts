
// import { useState, useEffect, useRef } from 'react'
// import type { User } from '@supabase/supabase-js'
// import { supabase } from '../../../shared/lib/supabaseClient'
// import type { Role } from '../../../shared/auth/roles'

// export interface AuthProfile {
//   id: string
//   full_name: string
//   mobile: string | null
//   role: Role
//   is_active: boolean
//   created_at: string
//   email?: string | null
// }

// // SECURITY: Zoho sign-in has no enforced domain restriction at the
// // OAuth/Supabase level. This is the application-level backstop: any
// // authenticated session whose email isn't on this domain is immediately
// // signed out before profile/role data is ever fetched.
// const ALLOWED_EMAIL_DOMAIN = 'mulyam.in'

// function isAllowedDomain(email: string | null | undefined): boolean {
//   if (!email) return false
//   return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
// }

// function clearLocalAuthSession() {
//   for (const storage of [localStorage, sessionStorage]) {
//     const storageKeys = Object.keys(storage).filter((key) =>
//       key.startsWith('sb-') && key.endsWith('-auth-token')
//     )

//     for (const key of storageKeys) {
//       storage.removeItem(key)
//     }
//   }
// }

// export interface UseAuthResult {
//   user: User | null
//   profile: AuthProfile | null
//   role: Role | null
//   loading: boolean
//   isAuthenticated: boolean
//   authError: string | null
//   signIn: (email: string, password: string) => Promise<{ error: unknown }>
//   signInWithZoho: () => Promise<{ error: unknown }>
//   signOut: () => Promise<void>
// }

// export function useAuth(): UseAuthResult {
//   const [user, setUser] = useState<User | null>(null)
//   const [profile, setProfile] = useState<AuthProfile | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [authError, setAuthError] = useState<string | null>(null)
//   const profileRequests = useRef(new Map<string, Promise<void>>())
//   const domainRejectionInFlight = useRef(false)

//   useEffect(() => {
//     supabase.auth.getSession().then(async ({ data: { session } }) => {
//       const authUser = session?.user ?? null

//       if (authUser && !isAllowedDomain(authUser.email)) {
//         setAuthError(`Access is restricted to @${ALLOWED_EMAIL_DOMAIN} accounts.`)
//         domainRejectionInFlight.current = true
//         try {
//           await supabase.auth.signOut()
//         } finally {
//           clearLocalAuthSession()
//           domainRejectionInFlight.current = false
//         }
//         setUser(null)
//         setProfile(null)
//         setLoading(false)
//         return
//       }

//       setUser(authUser)
//       if (authUser) {
//         const zohoName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || null
//         fetchProfile(authUser.id, authUser.email ?? null, zohoName)
//       } else {
//         setLoading(false)
//       }
//     })

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (_event, session) => {
//         const authUser = session?.user ?? null

//         if (authUser && !isAllowedDomain(authUser.email)) {
//           setAuthError(`Access is restricted to @${ALLOWED_EMAIL_DOMAIN} accounts.`)
//           domainRejectionInFlight.current = true
//           setUser(null)
//           setProfile(null)
//           setLoading(false)
//           void (async () => {
//             try {
//               await supabase.auth.signOut()
//             } finally {
//               clearLocalAuthSession()
//               domainRejectionInFlight.current = false
//             }
//           })()
//           return
//         }

//         setUser(authUser)
//         if (authUser) {
//           setAuthError(null)
//           const zohoName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || null
//           fetchProfile(authUser.id, authUser.email ?? null, zohoName)
//         } else if (_event === 'SIGNED_OUT' && domainRejectionInFlight.current) {
//           setUser(null)
//           setProfile(null)
//           setLoading(false)
//         } else {
//           setProfile(null)
//           setLoading(false)
//         }
//       }
//     )

//     return () => subscription.unsubscribe()
//   }, [])

//   // Listen for realtime role changes so a pending user is upgraded
//   // automatically the moment an admin assigns them a role — no relogin needed
//   useEffect(() => {
//     if (!user?.id) return

//     const channel = supabase
//       .channel('role-changes')
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'user_roles', filter: `user_id=eq.${user.id}` },
//         () => {
//           const zohoName = user.user_metadata?.full_name || user.user_metadata?.name || null
//           fetchProfile(user.id, user.email ?? null, zohoName)
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [user?.id])

//   async function fetchProfile(userId: string, email: string | null = null, fullName: string | null = null) {
//     const existingRequest = profileRequests.current.get(userId)
//     if (existingRequest) {
//       await existingRequest
//       return
//     }

//     const request = loadProfile(userId, email, fullName)
//     profileRequests.current.set(userId, request)

//     try {
//       await request
//     } catch (err) {
//       console.error('Unexpected error:', err)
//     } finally {
//       profileRequests.current.delete(userId)
//       setLoading(false)
//     }
//   }

//   async function loadProfile(userId: string, email: string | null, fullName: string | null) {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', userId)
//       .maybeSingle()

//     let dynamicRole: Role | undefined
//     const { data: userRoleRow, error: userRoleError } = await supabase
//       .from('user_roles')
//       .select('role_id')
//       .eq('user_id', userId)
//       .maybeSingle()

//     if (userRoleError) console.error('userRoleRow error:', userRoleError)

//     if (userRoleRow && !userRoleError) {
//       const { data: roleRow, error: roleError } = await supabase
//         .from('roles')
//         .select('name')
//         .eq('id', userRoleRow.role_id)
//         .maybeSingle()

//       if (roleError) console.error('roleRow error:', roleError)
//       dynamicRole = roleRow?.name as Role | undefined
//     }

//     let profile = data as AuthProfile | null
//     if (error) {
//       console.error('Profile fetch error:', error.message)
//       setAuthError('Unable to load your profile. Please try again.')
//       return
//     }

//     if (!profile) {
//       const { data: created, error: insertError } = await supabase
//         .from('profiles')
//         .insert({
//           id: userId,
//           full_name: fullName || email?.split('@')[0] || 'User',
//           mobile: null,
//           role: 'pending',
//           is_active: true,
//           created_at: new Date().toISOString(),
//         })
//         .select()
//         .maybeSingle()

//       if (insertError && insertError.code !== '23505') {
//         console.error('Profile self-heal insert error:', insertError.message)
//       }

//       profile = (created as AuthProfile | null) ?? (await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)
//         .maybeSingle()).data as AuthProfile | null
//     }

//     if (profile) {
//       setProfile({
//         ...profile,
//         role: dynamicRole ?? profile.role ?? 'pending',
//         email: profile.email ?? email,
//       })
//     }
//   }

//   async function signIn(email: string, password: string) {
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })
//     return { error }
//   }

//     async function signInWithZoho() {
//     setAuthError(null)
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: 'custom:zoho',
//       options: {
//         redirectTo: window.location.origin + '/dashboard',
//         queryParams: {
//           prompt: 'consent',
//         },
//       },
//     })
//     return { error }
//   }
  
//   // function forceZohoBrowserLogout(): Promise<void> {
//   //   return new Promise((resolve) => {
//   //     try {
//   //       const popup = window.open(
//   //         'https://accounts.zoho.in/logout',
//   //         'zoho-logout',
//   //         'width=50,height=50,left=-2000,top=-2000'
//   //       )
//   //       setTimeout(() => {
//   //         try {
//   //           popup?.close()
//   //         } catch {
//   //         }
//   //         resolve()
//   //       }, 1500)
//   //     } catch {
//   //       resolve()
//   //     }
//   //   })
//   // }

//   // async function signOut() {
//   //   try {
//   //     await supabase.auth.signOut()
//   //   } finally {
//   //     clearLocalAuthSession()
//   //     await forceZohoBrowserLogout()
//   //   }
//   // }
//     async function signOut() {
//     try {
//       await supabase.auth.signOut()
//     } finally {
//       clearLocalAuthSession()
//     }
//   }

//   return {
//     user,
//     profile,
//     role: profile?.role ?? null,
//     loading,
//     isAuthenticated: !!user,
//     authError,
//     signIn,
//     signInWithZoho,
//     signOut,
//   }
// }
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../../shared/lib/supabaseClient'
import type { Role } from '../../../shared/auth/roles'
import { clearPermissionCache } from '../../../rbac/services/hooks/usePermission'

export interface AuthProfile {
  id: string
  full_name: string
  mobile: string | null
  role: Role
  is_active: boolean
  created_at: string
  email?: string | null
}

// SECURITY: Zoho sign-in has no enforced domain restriction at the
// OAuth/Supabase level. This is the application-level backstop: any
// authenticated session whose email isn't on this domain is immediately
// signed out before profile/role data is ever fetched.
const ALLOWED_EMAIL_DOMAIN = 'mulyam.in'

function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
}

function clearLocalAuthSession() {
  for (const storage of [localStorage, sessionStorage]) {
    const storageKeys = Object.keys(storage).filter((key) =>
      key.startsWith('sb-') && key.endsWith('-auth-token')
    )

    for (const key of storageKeys) {
      storage.removeItem(key)
    }
  }
}

function sameProfile(a: AuthProfile | null, b: AuthProfile | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

export interface UseAuthResult {
  user: User | null
  profile: AuthProfile | null
  role: Role | null
  loading: boolean
  isAuthenticated: boolean
  authError: string | null
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signInWithZoho: () => Promise<{ error: unknown }>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const profileRequests = useRef(new Map<string, Promise<void>>())
  const domainRejectionInFlight = useRef(false)
  // Id of the user whose profile is already loaded. Used to ignore the
  // redundant SIGNED_IN / TOKEN_REFRESHED events Supabase fires whenever
  // the browser tab regains focus.
  const loadedUserId = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      const authUser = session?.user ?? null

      if (authUser && !isAllowedDomain(authUser.email)) {
        setAuthError(`Access is restricted to @${ALLOWED_EMAIL_DOMAIN} accounts.`)
        domainRejectionInFlight.current = true
        try {
          await supabase.auth.signOut()
        } finally {
          clearLocalAuthSession()
          domainRejectionInFlight.current = false
        }
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser((prev) => (prev && authUser && prev.id === authUser.id ? prev : authUser))
      if (authUser) {
        if (loadedUserId.current !== authUser.id) {
          const zohoName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || null
          fetchProfile(authUser.id, authUser.email ?? null, zohoName)
        }
      } else {
        setLoading(false)
      }
    })

    const handleAuthEvent = async (
      event: string,
      session: { user: User } | null
    ) => {
      const authUser = session?.user ?? null

      if (authUser && !isAllowedDomain(authUser.email)) {
        setAuthError(`Access is restricted to @${ALLOWED_EMAIL_DOMAIN} accounts.`)
        domainRejectionInFlight.current = true
        loadedUserId.current = null
        setUser(null)
        setProfile(null)
        setLoading(false)
        void (async () => {
          try {
            await supabase.auth.signOut()
          } finally {
            clearLocalAuthSession()
            domainRejectionInFlight.current = false
          }
        })()
        return
      }

      if (authUser) {
        // Same user already loaded (tab refocus / token refresh):
        // do nothing, so nothing re-renders and nothing refetches.
        if (loadedUserId.current === authUser.id && event !== 'USER_UPDATED') {
          return
        }

        setUser((prev) =>
          prev && prev.id === authUser.id && event !== 'USER_UPDATED' ? prev : authUser
        )
        setAuthError(null)
        const zohoName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || null
        fetchProfile(authUser.id, authUser.email ?? null, zohoName)
      } else if (event === 'SIGNED_OUT' && domainRejectionInFlight.current) {
        loadedUserId.current = null
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else {
        loadedUserId.current = null
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Defer: never run Supabase queries synchronously inside this
        // callback (it can deadlock the auth lock when the tab resumes).
        setTimeout(() => {
          if (!cancelled) void handleAuthEvent(event, session)
        }, 0)
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for realtime role changes so a pending user is upgraded
  // automatically the moment an admin assigns them a role — no relogin needed
  useEffect(() => {
    if (!user?.id) return

    const userId = user.id
    const userEmail = user.email ?? null
    const zohoName = user.user_metadata?.full_name || user.user_metadata?.name || null

    const channel = supabase
      .channel('role-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles', filter: `user_id=eq.${userId}` },
        () => {
          fetchProfile(userId, userEmail, zohoName)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function fetchProfile(userId: string, email: string | null = null, fullName: string | null = null) {
    const existingRequest = profileRequests.current.get(userId)
    if (existingRequest) {
      await existingRequest
      return
    }

    const request = loadProfile(userId, email, fullName)
    profileRequests.current.set(userId, request)

    try {
      await request
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      profileRequests.current.delete(userId)
      setLoading(false)
    }
  }

  async function loadProfile(userId: string, email: string | null, fullName: string | null) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    let dynamicRole: Role | undefined
    const { data: userRoleRow, error: userRoleError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (userRoleError) console.error('userRoleRow error:', userRoleError)

    if (userRoleRow && !userRoleError) {
      const { data: roleRow, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userRoleRow.role_id)
        .maybeSingle()

      if (roleError) console.error('roleRow error:', roleError)
      dynamicRole = roleRow?.name as Role | undefined
    }

    let profile = data as AuthProfile | null
    if (error) {
      console.error('Profile fetch error:', error.message)
      setAuthError('Unable to load your profile. Please try again.')
      return
    }

    if (!profile) {
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName || email?.split('@')[0] || 'User',
          mobile: null,
          role: 'pending',
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle()

      if (insertError && insertError.code !== '23505') {
        console.error('Profile self-heal insert error:', insertError.message)
      }

      profile = (created as AuthProfile | null) ?? (await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()).data as AuthProfile | null
    }

    if (profile) {
      const next: AuthProfile = {
        ...profile,
        role: dynamicRole ?? profile.role ?? 'pending',
        email: profile.email ?? email,
      }
      loadedUserId.current = userId
      // Keep the same object if nothing changed -> no needless re-renders.
      setProfile((prev) => (sameProfile(prev, next) ? prev : next))
    }
  }

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }, [])

  const signInWithZoho = useCallback(async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'custom:zoho',
      options: {
        redirectTo: window.location.origin + '/dashboard',
        queryParams: {
          prompt: 'consent',
        },
      },
    })
    return { error }
  }, [])

  // const signOut = useCallback(async () => {
  //   try {
  //     await supabase.auth.signOut()
  //   } finally {
  //     loadedUserId.current = null
  //     clearLocalAuthSession()
  //   }
  // }, [])
  const signOut = useCallback(async () => {
  try {
    await supabase.auth.signOut()
  } finally {
    loadedUserId.current = null
    clearPermissionCache()
    clearLocalAuthSession()
  }
}, [])

  return useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      isAuthenticated: !!user,
      authError,
      signIn,
      signInWithZoho,
      signOut,
    }),
    [user, profile, loading, authError, signIn, signInWithZoho, signOut]
  )
}