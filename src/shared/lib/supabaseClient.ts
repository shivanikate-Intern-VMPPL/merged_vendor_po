// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables')
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://dlnnavewgvuvqofowprr.supabase.co'

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_GQrh1hIor2e69Jhb2eymQQ_IoPOx9KB'

// A login stays valid for this long, then the user must sign in again.
const SESSION_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const LOGIN_AT_KEY = 'mulyam_login_at'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,     // keep the login after the browser is closed
    autoRefreshToken: true,   // renew the short-lived token in the background
    detectSessionInUrl: true,
  },
})

function markLoginTime() {
  try {
    if (!window.localStorage.getItem(LOGIN_AT_KEY)) {
      window.localStorage.setItem(LOGIN_AT_KEY, String(Date.now()))
    }
  } catch {
    /* storage unavailable: ignore */
  }
}

async function enforceSessionLimit() {
  try {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return

    const raw = window.localStorage.getItem(LOGIN_AT_KEY)
    if (!raw) {
      markLoginTime() // logged in before this update: start the clock now
      return
    }

    if (Date.now() - Number(raw) > SESSION_MAX_AGE_MS) {
      window.localStorage.removeItem(LOGIN_AT_KEY)
      await supabase.auth.signOut()
    }
  } catch (error) {
    console.warn('Session limit check failed:', error)
  }
}

supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') markLoginTime()
  if (event === 'SIGNED_OUT') {
    try {
      window.localStorage.removeItem(LOGIN_AT_KEY)
    } catch {
      /* ignore */
    }
  }
})

void enforceSessionLimit()
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void enforceSessionLimit()
})
window.setInterval(() => void enforceSessionLimit(), 10 * 60 * 1000)