
// // import { useState, useEffect } from 'react'
// // import {
// //   Box, Button, Typography, Paper, CircularProgress, Alert, Divider,
// // } from '@mui/material'
// // import GoogleIcon from '@mui/icons-material/Google'
// // import { useAuthContext } from '../AuthContext'
// // import { useNavigate } from 'react-router-dom'
// // import { MulyamLogo } from '../../../shared/components/MulyamLogo'

// // export function LoginForm() {
// //   const { signInWithGoogle, authError } = useAuthContext()
// //   const navigate = useNavigate()
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState('')

// //   // authError comes from useAuth's post-redirect domain check. Google
// //   // sign-in redirects the browser away and back, so the actual
// //   // "wrong domain" rejection happens after this component has already
// //   // navigated away and been bounced back — not inside handleGoogleSignIn
// //   // below. Syncing it here ensures the message is still shown once the
// //   // user lands back on this screen.
// //   useEffect(() => {
// //     if (authError) {
// //       setError(authError)
// //       setLoading(false)
// //     }
// //   }, [authError])

// //   async function handleGoogleSignIn() {
// //     setLoading(true)
// //     setError('')
// //     const { error } = await signInWithGoogle()
// //     if (error) {
// //       setError('Sign in failed. Please use your @mulyam.in account.')
// //       setLoading(false)
// //       return
// //     }
// //     navigate('/dashboard')
// //   }

// //   return (
// //     <Box sx={{
// //       minHeight: '100vh', display: 'flex', alignItems: 'center',
// //       justifyContent: 'center', bgcolor: '#EEF2FF', px: 2,
// //     }}>
// //       <Paper elevation={0} sx={{
// //         p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 400, borderRadius: 4,
// //         border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0, 75, 139, 0.08)',
// //       }}>
// //         <Box sx={{ textAlign: 'center', mb: 3 }}>
// //           <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
// //             <MulyamLogo size={80} />
// //           </Box>
// //           <Typography sx={{ color: '#004B8B', fontWeight: 800, fontSize: 32 }}>
// //             Mulyam
// //           </Typography>
// //         </Box>

// //         <Box sx={{ textAlign: 'center', mb: 3 }}>
// //           <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 1 }}>
// //             Purchase Management
// //           </Typography>
// //           <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.6 }}>
// //             Sign in using your @mulyam.in workspace account to access procurement tools.
// //           </Typography>
// //         </Box>

// //         {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

// //         <Button
// //           variant="outlined"
// //           fullWidth
// //           size="large"
// //           startIcon={loading ? <CircularProgress size={18} /> : <GoogleIcon />}
// //           onClick={handleGoogleSignIn}
// //           disabled={loading}
// //           sx={{
// //             py: 1.5, borderColor: '#E5E7EB', color: '#0D1B3E',
// //             fontWeight: 600, borderRadius: 2, mb: 3,
// //             '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' },
// //           }}
// //         >
// //           {loading ? 'Signing in...' : 'Sign in with Google'}
// //         </Button>

// //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
// //           <Divider sx={{ flex: 1 }} />
// //           <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
// //             Strictly for INTERNAL USE ONLY
// //           </Typography>
// //           <Divider sx={{ flex: 1 }} />
// //         </Box>

// //         <Box sx={{ textAlign: 'center' }}>
// //           <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600, display: 'block' }}>
// //             contact
// //           </Typography>
// //           <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600, display: 'block' }}>
// //             mahesh@mulyam.in / +91-9766492001
// //           </Typography>
// //           <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600 }}>
// //             for support
// //           </Typography>
// //         </Box>
// //       </Paper>
// //     </Box>
// //   )
// // }
// import { useState, useEffect } from 'react'
// import {
//   Box, Button, Typography, Paper, CircularProgress, Alert, Divider,
// } from '@mui/material'
// import LoginIcon from '@mui/icons-material/Login'
// import { useAuthContext } from '../AuthContext'
// import { useNavigate } from 'react-router-dom'
// import { MulyamLogo } from '../../../shared/components/MulyamLogo'

// export function LoginForm() {
//   const { signInWithZoho, authError } = useAuthContext()
//   const navigate = useNavigate()
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   // authError comes from useAuth's post-redirect domain check. Zoho
//   // sign-in redirects the browser away and back, so the actual
//   // "wrong domain" rejection happens after this component has already
//   // navigated away and been bounced back — not inside handleZohoSignIn
//   // below. Syncing it here ensures the message is still shown once the
//   // user lands back on this screen.
//   useEffect(() => {
//     if (authError) {
//       setError(authError)
//       setLoading(false)
//     }
//   }, [authError])

//   async function handleZohoSignIn() {
//     setLoading(true)
//     setError('')
//     const { error } = await signInWithZoho()
//     if (error) {
//       setError('Sign in failed. Please use your @mulyam.in account.')
//       setLoading(false)
//       return
//     }
//     navigate('/dashboard')
//   }

//   return (
//     <Box sx={{
//       minHeight: '100vh', display: 'flex', alignItems: 'center',
//       justifyContent: 'center', bgcolor: '#EEF2FF', px: 2,
//     }}>
//       <Paper elevation={0} sx={{
//         p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 400, borderRadius: 4,
//         border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0, 75, 139, 0.08)',
//       }}>
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
//             <MulyamLogo size={80} />
//           </Box>
//           <Typography sx={{ color: '#004B8B', fontWeight: 800, fontSize: 32 }}>
//             Mulyam
//           </Typography>
//         </Box>

//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 1 }}>
//             Purchase Management
//           </Typography>
//           <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.6 }}>
//             Sign in using your @mulyam.in workspace account to access procurement tools.
//           </Typography>
//         </Box>

//         {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

//         <Button
//           variant="outlined"
//           fullWidth
//           size="large"
//           startIcon={loading ? <CircularProgress size={18} /> : <LoginIcon />}
//           onClick={handleZohoSignIn}
//           disabled={loading}
//           sx={{
//             py: 1.5, borderColor: '#E5E7EB', color: '#0D1B3E',
//             fontWeight: 600, borderRadius: 2, mb: 3,
//             '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' },
//           }}
//         >
//           {loading ? 'Signing in...' : 'Sign in with Zoho'}
//         </Button>

//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
//           <Divider sx={{ flex: 1 }} />
//           <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
//             Strictly for INTERNAL USE ONLY
//           </Typography>
//           <Divider sx={{ flex: 1 }} />
//         </Box>

//         <Box sx={{ textAlign: 'center' }}>
//           <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600, display: 'block' }}>
//             contact
//           </Typography>
//           <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600, display: 'block' }}>
//             mahesh@mulyam.in / +91-9766492001
//           </Typography>
//           <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600 }}>
//             for support
//           </Typography>
//         </Box>
//       </Paper>
//     </Box>
//   )
// }
import { useState, useEffect } from 'react'
import {
  Box, Button, Typography, Paper, CircularProgress, Alert, Divider,
} from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'
import { useAuthContext } from '../AuthContext'
import { useNavigate, Navigate } from 'react-router-dom'
import { MulyamLogo } from '../../../shared/components/MulyamLogo'

export function LoginForm() {
  const { signInWithZoho, authError, user, loading: authLoading } = useAuthContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // authError comes from useAuth's post-redirect domain check. Zoho
  // sign-in redirects the browser away and back, so the actual
  // "wrong domain" rejection happens after this component has already
  // navigated away and been bounced back — not inside handleZohoSignIn
  // below. Syncing it here ensures the message is still shown once the
  // user lands back on this screen.
  useEffect(() => {
    if (authError) {
      setError(authError)
      setLoading(false)
    }
  }, [authError])

  async function handleZohoSignIn() {
    setLoading(true)
    setError('')
    const { error } = await signInWithZoho()
    if (error) {
      setError('Sign in failed. Please use your @mulyam.in account.')
      setLoading(false)
      return
    }
    navigate('/dashboard')
  }

  // Already signed in (saved session restored): go straight to the app
  // instead of showing the login screen again.
  if (user && !authError) {
    return <Navigate to="/dashboard" replace />
  }

  // Saved session is still being restored: show a spinner, not the login form.
  if (authLoading && !user) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', bgcolor: '#EEF2FF',
      }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', bgcolor: '#EEF2FF', px: 2,
    }}>
      <Paper elevation={0} sx={{
        p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 400, borderRadius: 4,
        border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0, 75, 139, 0.08)',
      }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <MulyamLogo size={80} />
          </Box>
          <Typography sx={{ color: '#004B8B', fontWeight: 800, fontSize: 32 }}>
            Mulyam
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 1 }}>
            Purchase Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.6 }}>
            Sign in using your @mulyam.in workspace account to access procurement tools.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={loading ? <CircularProgress size={18} /> : <LoginIcon />}
          onClick={handleZohoSignIn}
          disabled={loading}
          sx={{
            py: 1.5, borderColor: '#E5E7EB', color: '#0D1B3E',
            fontWeight: 600, borderRadius: 2, mb: 3,
            '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' },
          }}
        >
          {loading ? 'Signing in...' : 'Sign in with Zoho'}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
            Strictly for INTERNAL USE ONLY
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600, display: 'block' }}>
            contact
          </Typography>
          <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600, display: 'block' }}>
            mahesh@mulyam.in / +91-9766492001
          </Typography>
          <Typography variant="caption" sx={{ color: '#004B8B', fontWeight: 600 }}>
            for support
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}