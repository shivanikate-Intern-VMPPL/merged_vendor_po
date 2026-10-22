import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuthContext } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

export function PendingScreen() {
  const { signOut, profile } = useAuthContext()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f1f8e9',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Hourglass icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            bgcolor: '#fff8e1',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <HourglassEmptyIcon
            sx={{ fontSize: 40, color: '#f9a825' }}
          />
        </Box>

        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          Waiting for Access
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 1 }}
        >
          Hello{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 3 }}
        >
          Your account has been created but your role has not been
          assigned yet. Please contact your admin to get access.
        </Typography>

        {/* Info box */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: '#e8f5e9',
            border: '1px solid #c8e6c9',
            borderRadius: 2,
            textAlign: 'left',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 0.5 }}
          >
            What to do next?
          </Typography>
          <Typography variant="body2" sx={{ color: '#388e3c' }}>
            1. Tell your admin your email address
          </Typography>
          <Typography variant="body2" sx={{ color: '#388e3c' }}>
            2. Admin will assign you a role
          </Typography>
          <Typography variant="body2" sx={{ color: '#388e3c' }}>
            3. Log out and log back in
          </Typography>
        </Paper>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderRadius: 2, py: 1.2 }}
        >
          Logout
        </Button>
      </Paper>
    </Box>
  )
}