
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../features/auth/AuthContext'
import { can } from '../auth/permissions'
import type { Permission } from '../auth/permissions'
import type { Role } from '../auth/roles'
import { PendingScreen } from '../../features/auth/components/PendingScreen'
import { Box, CircularProgress, Typography, Button } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import { useNavigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  // Allowed roles (any of these)
  allowedRoles?: Role[]
  // Required permission
  permission?: Permission
}

export function ProtectedRoute({
  children,
  allowedRoles,
  permission,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuthContext()
  const navigate = useNavigate()

  // Show spinner while loading
    if (loading && !profile) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f1f8e9',
        }}
      >
        <CircularProgress color="success" />
      </Box>
    )
  }

  // Not logged in — redirect to login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Role is pending — show waiting screen
  if (profile?.role === 'pending') {
    return <PendingScreen />
  }

  // Admin bypasses all restrictions
  if (profile?.role === 'admin') {
    return <>{children}</>
  }

  // Check allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!profile?.role || !allowedRoles.includes(profile.role)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  // Check specific permission
  if (permission && !can(profile?.role, permission)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f1f8e9',
          px: 3,
          textAlign: 'center',
        }}
      >
        <LockIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Access Denied
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 3 }}
        >
          You don't have permission to view this page.
          Your role is <strong>{profile?.role}</strong>.
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Box>
    )
  }

  return <>{children}</>
}