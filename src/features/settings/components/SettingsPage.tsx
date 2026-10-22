// import { useState } from 'react'
// import {
//   Box, Typography, Paper, Avatar, TextField, Button, IconButton,
//   CircularProgress, Alert, Snackbar,
// } from '@mui/material'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// import SyncIcon from '@mui/icons-material/Sync'
// import { useNavigate } from 'react-router-dom'
// import { useAuthContext } from '../../auth/AuthContext'
// import { supabase } from '../../../shared/lib/supabaseClient'

// export function SettingsPage() {
//   const navigate = useNavigate()
//   const { profile, user } = useAuthContext()

//   const [syncing, setSyncing] = useState(false)
//   const [syncSuccess, setSyncSuccess] = useState(false)
//   const [syncError, setSyncError] = useState('')

//   function getInitials(name: string) {
//     return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
//   }

//   const nameParts = profile?.full_name?.split(' ') ?? []
//   const firstName = nameParts[0] ?? ''
//   const lastName = nameParts.slice(1).join(' ') ?? ''

//   async function handleSyncData() {
//     setSyncing(true)
//     setSyncError('')
//     try {
//       const [farmersRes, itemsRes] = await Promise.all([
//         supabase.from('farmers').select('count', { count: 'exact' }),
//         supabase.from('items').select('count', { count: 'exact' }),
//       ])
//       if (farmersRes.error || itemsRes.error) throw new Error('Sync failed')
//       setSyncSuccess(true)
//     } catch {
//       setSyncError('Sync failed. Please check your connection and try again.')
//     } finally {
//       setSyncing(false)
//     }
//   }

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
//       <Box sx={{
//         bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.5,
//         display: 'flex', alignItems: 'center', gap: 1, position: 'sticky', top: 0, zIndex: 100,
//       }}>
//         <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ color: '#004B8B' }}>
//           <ArrowBackIcon />
//         </IconButton>
//         <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>Settings</Typography>
//       </Box>

//       <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 3 }}>
//         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 2.5, mb: 2, bgcolor: 'white' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
//             <Avatar sx={{ bgcolor: '#004B8B', width: 56, height: 56, fontSize: 20, fontWeight: 700 }}>
//               {profile?.full_name ? getInitials(profile.full_name) : 'U'}
//             </Avatar>
//             <Box>
//               <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E' }}>User Profile</Typography>
//               <Typography variant="body2" sx={{ color: '#6B7280' }}>Your account information</Typography>
//             </Box>
//           </Box>

//           <Box sx={{ borderTop: '1px solid #E5E7EB', pt: 2.5 }}>
//             {[
//               { label: 'First Name', value: firstName },
//               { label: 'Last Name', value: lastName },
//               { label: 'Email ID', value: user?.email ?? profile?.email ?? 'No email on record' },
//             ].map((field) => (
//               <Box key={field.label} sx={{ mb: 2 }}>
//                 <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.8 }}>
//                   {field.label}
//                 </Typography>
//                 <TextField
//                   fullWidth size="small" value={field.value} slotProps={{ input: { readOnly: true } }}
//                   sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#EEF2FF', borderRadius: 2, '& fieldset': { border: 'none' }, color: '#6B7280', fontSize: 14 } }}
//                 />
//               </Box>
//             ))}

//             <Box sx={{ mt: 1.5 }}>
//               <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.8 }}>Role</Typography>
//               <Box sx={{
//                 display: 'inline-block', bgcolor: '#EEF2FF', color: '#004B8B', px: 2, py: 0.5,
//                 borderRadius: 10, fontSize: 13, fontWeight: 700, textTransform: 'capitalize',
//               }}>
//                 {profile?.role ?? 'Unknown'}
//               </Box>
//             </Box>
//           </Box>
//         </Paper>

//         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 2.5, bgcolor: 'white' }}>
//           <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 1 }}>
//             Data Synchronization
//           </Typography>
//           <Typography variant="body2" sx={{ color: '#6B7280', mb: 2.5, lineHeight: 1.6 }}>
//             Sync your local data with the Mulyam server to ensure you have the latest metadata for Vendors and Items
//           </Typography>

//           {syncError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{syncError}</Alert>}

//           <Button
//             variant="contained" fullWidth size="large"
//             startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
//             onClick={handleSyncData} disabled={syncing}
//             sx={{
//               bgcolor: '#0D1B3E', borderRadius: 2.5, py: 1.5, fontWeight: 600, fontSize: 15,
//               '&:hover': { bgcolor: '#050B1E' }, '&.Mui-disabled': { bgcolor: '#93A8C4', color: 'white' },
//             }}>
//             {syncing ? 'Syncing...' : 'Sync Data'}
//           </Button>
//         </Paper>
//       </Box>

//       <Snackbar open={syncSuccess} autoHideDuration={3000} onClose={() => setSyncSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
//         <Alert severity="success" onClose={() => setSyncSuccess(false)}>Data synced successfully!</Alert>
//       </Snackbar>
//     </Box>
//   )
// }
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SyncIcon from '@mui/icons-material/Sync'
import LinkIcon from '@mui/icons-material/Link'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../../auth/AuthContext'
import { supabase } from '../../../shared/lib/supabaseClient'

export function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profile, user } = useAuthContext()

  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [syncError, setSyncError] = useState('')

  const [connectingZoho, setConnectingZoho] = useState(false)
  const [zohoConnected, setZohoConnected] = useState(false)
  const [zohoChecking, setZohoChecking] = useState(true)
  const [zohoError, setZohoError] = useState('')

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const nameParts = profile?.full_name?.split(' ') ?? []
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ') ?? ''

  /*
   * Check whether the currently logged-in Mulyam user
   * already has a Zoho Books connection.
   */
  useEffect(() => {
    async function checkZohoConnection() {
      if (!user?.id) {
        setZohoConnected(false)
        setZohoChecking(false)
        return
      }

      setZohoChecking(true)
      setZohoError('')

      try {
        const { data, error } = await supabase
          .from('zoho_books_connections')
          .select('user_id, zoho_email, connected_at')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Zoho connection check failed:', error)
          setZohoError(
            'Unable to check your Zoho Books connection.'
          )
          setZohoConnected(false)
          return
        }

        setZohoConnected(!!data)
      } catch (error) {
        console.error('Unexpected Zoho connection error:', error)
        setZohoError(
          'Unable to check your Zoho Books connection.'
        )
        setZohoConnected(false)
      } finally {
        setZohoChecking(false)
      }
    }

    void checkZohoConnection()
  }, [user?.id])

  /*
   * Handle the result returned by zoho-books-callback.
   *
   * The callback redirects the browser to:
   * /settings?zoho_books=connected
   *
   * or:
   * /settings?zoho_books=error&message=...
   */
  useEffect(() => {
    const zohoStatus = searchParams.get('zoho_books')
    const message = searchParams.get('message')

    if (!zohoStatus) return

    if (zohoStatus === 'connected') {
      setZohoConnected(true)
      setZohoError('')
    } else if (zohoStatus === 'error') {
      setZohoError(
        message || 'Zoho Books connection failed. Please try again.'
      )
    }

    /*
     * Remove the OAuth status/message from the browser URL
     * after processing it.
     */
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  /*
   * Start the Zoho Books OAuth flow.
   *
   * The current Supabase session is automatically sent by
   * supabase.functions.invoke(), allowing the Edge Function
   * to identify the logged-in Mulyam user.
   */
  async function handleConnectZoho() {
    setConnectingZoho(true)
    setZohoError('')

    try {
      const { data, error } = await supabase.functions.invoke(
        'zoho-books-connect-init',
        {
          method: 'POST',
          body: {},
        }
      )

      if (error) {
        console.error(
          'Zoho Books connection initialization failed:',
          error
        )
        throw new Error(
          error.message || 'Failed to start Zoho Books connection.'
        )
      }

      if (!data?.url) {
        console.error('Invalid Zoho OAuth response:', data)
        throw new Error(
          'Zoho authorization URL was not returned.'
        )
      }

      /*
       * Send the browser to Zoho.
       */
      window.location.href = data.url
    } catch (error) {
      console.error('Zoho Books connection error:', error)

      setZohoError(
        error instanceof Error
          ? error.message
          : 'Failed to connect Zoho Books. Please try again.'
      )

      setConnectingZoho(false)
    }
  }

  async function handleSyncData() {
    setSyncing(true)
    setSyncError('')

    try {
      const [farmersRes, itemsRes] = await Promise.all([
        supabase
          .from('farmers')
          .select('count', { count: 'exact' }),
        supabase
          .from('items')
          .select('count', { count: 'exact' }),
      ])

      if (farmersRes.error || itemsRes.error) {
        throw new Error('Sync failed')
      }

      setSyncSuccess(true)
    } catch {
      setSyncError(
        'Sync failed. Please check your connection and try again.'
      )
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #E5E7EB',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <IconButton
          onClick={() => navigate('/dashboard')}
          size="small"
          sx={{ color: '#004B8B' }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography
          sx={{
            fontWeight: 700,
            color: '#0D1B3E',
            fontSize: 18,
          }}
        >
          Settings
        </Typography>
      </Box>

      <Box
        sx={{
          maxWidth: 600,
          mx: 'auto',
          px: 2,
          py: 3,
        }}
      >
        {/* User Profile */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: 3,
            p: 2.5,
            mb: 2,
            bgcolor: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2.5,
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#004B8B',
                width: 56,
                height: 56,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {profile?.full_name
                ? getInitials(profile.full_name)
                : 'U'}
            </Avatar>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#0D1B3E',
                }}
              >
                User Profile
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: '#6B7280' }}
              >
                Your account information
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              borderTop: '1px solid #E5E7EB',
              pt: 2.5,
            }}
          >
            {[
              {
                label: 'First Name',
                value: firstName,
              },
              {
                label: 'Last Name',
                value: lastName,
              },
              {
                label: 'Email ID',
                value:
                  user?.email ??
                  profile?.email ??
                  'No email on record',
              },
            ].map((field) => (
              <Box key={field.label} sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#0D1B3E',
                    mb: 0.8,
                  }}
                >
                  {field.label}
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  value={field.value}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#EEF2FF',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none',
                      },
                      color: '#6B7280',
                      fontSize: 14,
                    },
                  }}
                />
              </Box>
            ))}

            <Box sx={{ mt: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#0D1B3E',
                  mb: 0.8,
                }}
              >
                Role
              </Typography>

              <Box
                sx={{
                  display: 'inline-block',
                  bgcolor: '#EEF2FF',
                  color: '#004B8B',
                  px: 2,
                  py: 0.5,
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                }}
              >
                {profile?.role ?? 'Unknown'}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Zoho Books Connection */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: 3,
            p: 2.5,
            mb: 2,
            bgcolor: 'white',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#0D1B3E',
              mb: 1,
            }}
          >
            Zoho Books
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              mb: 2.5,
              lineHeight: 1.6,
            }}
          >
            Connect your own Zoho Books account to create and
            manage Purchase Orders using your Zoho account.
          </Typography>

          {zohoError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
              onClose={() => setZohoError('')}
            >
              {zohoError}
            </Alert>
          )}

          {zohoChecking ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1,
                color: '#6B7280',
              }}
            >
              <CircularProgress size={18} />
              <Typography variant="body2">
                Checking Zoho Books connection...
              </Typography>
            </Box>
          ) : zohoConnected ? (
            <Box>
              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                Your Zoho Books account is connected.
              </Alert>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<LinkIcon />}
                onClick={handleConnectZoho}
                disabled={connectingZoho}
                sx={{
                  borderColor: '#0D1B3E',
                  color: '#0D1B3E',
                  borderRadius: 2.5,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: 15,
                  '&:hover': {
                    borderColor: '#050B1E',
                    bgcolor: '#F5F7FF',
                  },
                }}
              >
                {connectingZoho
                  ? 'Connecting...'
                  : 'Reconnect Zoho Books'}
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={
                connectingZoho ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <LinkIcon />
                )
              }
              onClick={handleConnectZoho}
              disabled={connectingZoho}
              sx={{
                bgcolor: '#0D1B3E',
                borderRadius: 2.5,
                py: 1.5,
                fontWeight: 600,
                fontSize: 15,
                '&:hover': {
                  bgcolor: '#050B1E',
                },
                '&.Mui-disabled': {
                  bgcolor: '#93A8C4',
                  color: 'white',
                },
              }}
            >
              {connectingZoho
                ? 'Connecting to Zoho...'
                : 'Connect Zoho Books'}
            </Button>
          )}

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {zohoConnected ? (
              <>
                <CheckCircleIcon
                  sx={{
                    fontSize: 18,
                    color: '#16A34A',
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: '#166534',
                    fontWeight: 600,
                  }}
                >
                  Zoho Books connection active
                </Typography>
              </>
            ) : (
              <>
                <LinkOffIcon
                  sx={{
                    fontSize: 18,
                    color: '#6B7280',
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: '#6B7280',
                  }}
                >
                  No Zoho Books account connected
                </Typography>
              </>
            )}
          </Box>
        </Paper>

        {/* Data Synchronization */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: 3,
            p: 2.5,
            bgcolor: 'white',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#0D1B3E',
              mb: 1,
            }}
          >
            Data Synchronization
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              mb: 2.5,
              lineHeight: 1.6,
            }}
          >
            Sync your local data with the Mulyam server to
            ensure you have the latest metadata for Vendors
            and Items
          </Typography>

          {syncError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
            >
              {syncError}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={
              syncing ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <SyncIcon />
              )
            }
            onClick={handleSyncData}
            disabled={syncing}
            sx={{
              bgcolor: '#0D1B3E',
              borderRadius: 2.5,
              py: 1.5,
              fontWeight: 600,
              fontSize: 15,
              '&:hover': {
                bgcolor: '#050B1E',
              },
              '&.Mui-disabled': {
                bgcolor: '#93A8C4',
                color: 'white',
              },
            }}
          >
            {syncing ? 'Syncing...' : 'Sync Data'}
          </Button>
        </Paper>
      </Box>

      <Snackbar
        open={syncSuccess}
        autoHideDuration={3000}
        onClose={() => setSyncSuccess(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Alert
          severity="success"
          onClose={() => setSyncSuccess(false)}
        >
          Data synced successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}