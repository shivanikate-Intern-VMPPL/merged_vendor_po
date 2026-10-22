import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { supabase } from '../../../shared/lib/supabaseClient'

function clearLocalAuthSession() {
  const storageKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith('sb-') && key.endsWith('-auth-token')
  )
  for (const key of storageKeys) {
    localStorage.removeItem(key)
  }
}

// Opens Zoho's logout page in a small window and takes FULL control of
// closing it ourselves — we never depend on Zoho redirecting back, which
// is what made the previous approach unreliable (especially on
// non-HTTPS/localhost). This works the same on localhost and production.
function forceZohoLogout(): Promise<void> {
  return new Promise((resolve) => {
    let popup: Window | null = null
    try {
      popup = window.open(
        'https://accounts.zoho.in/logout',
        'zoho-logout',
        'width=480,height=560'
      )
    } catch {
      resolve()
      return
    }

    if (!popup) {
      // Popup blocked by the browser — don't block the user, just move on
      resolve()
      return
    }

    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      clearInterval(pollTimer)
      clearTimeout(hardTimeout)
      try {
        popup?.close()
      } catch {
        // ignore
      }
      resolve()
    }

    // If the user closes it manually, we're done immediately
    const pollTimer = setInterval(() => {
      if (popup?.closed) finish()
    }, 300)

    // Otherwise, give Zoho's logout page enough time to actually process
    // the logout, then we close it ourselves
    const hardTimeout = setTimeout(finish, 2000)
  })
}

export function ZohoLogoutRedirect() {
  const hasRun = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function doLogout() {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signOut failed (safe to ignore):', err)
      }

      clearLocalAuthSession()
      await forceZohoLogout()

      // We control the return trip ourselves now — no dependency on
      // Zoho redirecting back.
      navigate('/', { replace: true })
    }

    doLogout()
  }, [navigate])

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 2,
    }}>
      <CircularProgress />
      <Typography variant="body2" sx={{ color: '#6B7280' }}>
        Signing out...
      </Typography>
    </Box>
  )
}