import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../shared/components/Layout'
import { getAllUsers, updateUserRole } from '../api/adminApi'
import type { Profile } from '../../../shared/types'
import { useAuthContext } from '../AuthContext'

interface UserWithEmail extends Profile {
  email?: string
}

export function AdminPanel() {
  const navigate = useNavigate()

  // Get currently logged in admin's profile
  const { profile: currentUserProfile } = useAuthContext()

  const [users, setUsers] = useState<UserWithEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')

  const [selectedUser, setSelectedUser] =
    useState<UserWithEmail | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const data = await getAllUsers()
    setUsers(data)
    setLoading(false)
  }

  async function handleAssignRole(
    userId: string,
    newRole: 'collector' | 'office' | 'admin'
  ) {
    setSaving(userId)
    setError('')

    const success = await updateUserRole(userId, newRole)

    if (success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      )
      setSuccessMsg(`Role changed to ${newRole} successfully`)
      setSelectedUser(null)
    } else {
      setError('Failed to update role. Please try again.')
    }

    setSaving(null)
  }

  function getRoleColor(
    role: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' {
    if (role === 'admin') return 'error'
    if (role === 'office') return 'primary'
    if (role === 'collector') return 'success'
    return 'warning'
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function getAvatarBg(role: string) {
    if (role === 'admin') return { bg: '#FEE2E2', color: '#991B1B' }
    if (role === 'office') return { bg: '#EEF2FF', color: '#3730A3' }
    if (role === 'collector') return { bg: '#F0FDF4', color: '#166534' }
    return { bg: '#FFF8E1', color: '#F57F17' }
  }

  const pendingCount = users.filter((u) => u.role === 'pending').length
  const collectorCount = users.filter((u) => u.role === 'collector').length
  const officeCount = users.filter((u) => u.role === 'office').length
  const adminCount = users.filter((u) => u.role === 'admin').length

  const sortedUsers = [...users].sort((a, b) => {
    const order = { pending: 0, collector: 1, office: 2, admin: 3 }
    return (order[a.role] ?? 0) - (order[b.role] ?? 0)
  })

  return (
    <Layout>

      {/* Back + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/dashboard')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Manage Users
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 1,
          mb: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #FEF08A',
            bgcolor: '#FEFCE8',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#A16207' }}>
            {pendingCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#A16207' }}>
            Pending
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #BBF7D0',
            bgcolor: '#F0FDF4',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#166534' }}>
            {collectorCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#166534' }}>
            Collectors
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #C7D2FE',
            bgcolor: '#EEF2FF',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3730A3' }}>
            {officeCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#3730A3' }}>
            Office
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #FECACA',
            bgcolor: '#FEF2F2',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#991B1B' }}>
            {adminCount}
          </Typography>
          <Typography variant="caption" sx={{ color: '#991B1B' }}>
            Admins
          </Typography>
        </Paper>
      </Box>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
          icon={<HourglassEmptyIcon />}
        >
          <strong>{pendingCount} user{pendingCount > 1 ? 's' : ''}</strong>{' '}
          waiting for role assignment. Tap on them to assign a role.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* How it works */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          bgcolor: '#F0FDF4',
          border: '1px solid #BBF7D0',
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 'bold', color: '#166534', mb: 0.5 }}
        >
          How to assign a role
        </Typography>
        <Typography variant="body2" sx={{ color: '#15803D' }}>
          Tap on any user card → select their role → done.
          They will get access immediately after logging back in.
        </Typography>
      </Paper>

      {/* Users List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sortedUsers.map((user) => {
            const avatarStyle = getAvatarBg(user.role)
            const isCurrentUser = user.id === currentUserProfile?.id

            return (
              <Paper
                key={user.id}
                elevation={0}
                onClick={() => {
                  // Prevent admin from changing their own role
                  if (isCurrentUser) return
                  setSelectedUser(user)
                }}
                sx={{
                  border: '1px solid',
                  borderColor:
                    user.role === 'pending' ? '#FEF08A' : 'divider',
                  borderRadius: 2,
                  p: 2,
                  bgcolor: user.role === 'pending' ? '#FEFCE8' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  // Not-allowed cursor on own card, pointer on others
                  cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                  opacity: isCurrentUser ? 0.85 : 1,
                  '&:hover': {
                    bgcolor: isCurrentUser
                      ? user.role === 'pending'
                        ? '#FEFCE8'
                        : 'white'
                      : '#f9f9f9',
                  },
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    bgcolor: avatarStyle.bg,
                    color: avatarStyle.color,
                    width: 44,
                    height: 44,
                    fontSize: 14,
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {user.full_name ? getInitials(user.full_name) : <PersonIcon />}
                </Avatar>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 'bold', fontSize: 14 }}
                    >
                      {user.full_name || 'Unknown User'}
                    </Typography>
                    {/* YOU label on current user */}
                    {isCurrentUser && (
                      <Chip
                        label="You"
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: 10,
                          height: 18,
                          color: 'text.secondary',
                          borderColor: 'text.disabled',
                        }}
                      />
                    )}
                  </Box>
                  {user.mobile && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      📞 {user.mobile}
                    </Typography>
                  )}
                  {/* Show cannot change own role hint */}
                  {isCurrentUser && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.disabled', display: 'block' }}
                    >
                      You cannot change your own role
                    </Typography>
                  )}
                </Box>

                {/* Role badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {saving === user.id ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Chip
                      label={
                        user.role === 'pending' ? '⏳ Pending' : user.role
                      }
                      size="small"
                      color={getRoleColor(user.role)}
                      sx={{
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                        fontSize: 11,
                      }}
                    />
                  )}
                </Box>
              </Paper>
            )
          })}
        </Box>
      )}

      {/* Role Assignment Dialog */}
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
          Assign Role
        </DialogTitle>

        <DialogContent>
          {selectedUser && (
            <>
              {/* User info */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  p: 1.5,
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: getAvatarBg(selectedUser.role).bg,
                    color: getAvatarBg(selectedUser.role).color,
                    width: 40,
                    height: 40,
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  {getInitials(selectedUser.full_name || 'U')}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {selectedUser.full_name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    Current role: <strong>{selectedUser.role}</strong>
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2, fontSize: 13 }}
              >
                Select a role to assign to this user:
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* Collector */}
              <Paper
                elevation={0}
                onClick={() => handleAssignRole(selectedUser.id, 'collector')}
                sx={{
                  p: 2,
                  mb: 1.5,
                  border: '1.5px solid',
                  borderColor:
                    selectedUser.role === 'collector' ? '#22C55E' : '#E5E7EB',
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor:
                    selectedUser.role === 'collector' ? '#F0FDF4' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&:hover': {
                    bgcolor: '#F0FDF4',
                    borderColor: '#22C55E',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#DCFCE7',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  🧑‍🌾
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: '#166534' }}
                  >
                    Collector
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Can create purchase orders at collection center
                  </Typography>
                </Box>
                {selectedUser.role === 'collector' && (
                  <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 20 }} />
                )}
              </Paper>

              {/* Office */}
              <Paper
                elevation={0}
                onClick={() => handleAssignRole(selectedUser.id, 'office')}
                sx={{
                  p: 2,
                  mb: 1.5,
                  border: '1.5px solid',
                  borderColor:
                    selectedUser.role === 'office' ? '#6366F1' : '#E5E7EB',
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor:
                    selectedUser.role === 'office' ? '#EEF2FF' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&:hover': {
                    bgcolor: '#EEF2FF',
                    borderColor: '#6366F1',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#E0E7FF',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  🏢
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: '#3730A3' }}
                  >
                    Office
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Can view all orders and export CSV to Zoho
                  </Typography>
                </Box>
                {selectedUser.role === 'office' && (
                  <CheckCircleIcon sx={{ color: '#6366F1', fontSize: 20 }} />
                )}
              </Paper>

              {/* Admin */}
              <Paper
                elevation={0}
                onClick={() => handleAssignRole(selectedUser.id, 'admin')}
                sx={{
                  p: 2,
                  border: '1.5px solid',
                  borderColor:
                    selectedUser.role === 'admin' ? '#EF4444' : '#E5E7EB',
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor:
                    selectedUser.role === 'admin' ? '#FEF2F2' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&:hover': {
                    bgcolor: '#FEF2F2',
                    borderColor: '#EF4444',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#FEE2E2',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  👑
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: '#991B1B' }}
                  >
                    Admin
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Full access including managing all users
                  </Typography>
                </Box>
                {selectedUser.role === 'admin' && (
                  <CheckCircleIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                )}
              </Paper>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setSelectedUser(null)}
            disabled={!!saving}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success snackbar */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      </Snackbar>

    </Layout>
  )
}