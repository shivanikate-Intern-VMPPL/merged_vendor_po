import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Select, MenuItem, Chip, CircularProgress, Alert, Snackbar,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { getAllRoles } from '../services/roleService'
import { getAllUsersWithRoles, assignUserRole, deleteUser } from '../services/userRoleService'
import type { Role } from '../services/types/rbacTypes'

interface UserRow {
  id: string
  full_name: string | null
  mobile: string | null
  created_at: string
  role_id: number | null
  role_name: string | null
}

export function Users() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [usersData, rolesData] = await Promise.all([getAllUsersWithRoles(), getAllRoles()])
      setUsers(usersData)
      setRoles(rolesData)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, roleId: number) {
    setUpdatingId(userId)
    setError('')
    try {
      await assignUserRole(userId, roleId)
      const role = roles.find((r) => r.id === roleId)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role_id: roleId, role_name: role?.name ?? null } : u))
      )
      setSuccess(true)
    } catch {
      setError('Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await deleteUser(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      setError('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 1 }}>Users</Typography>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
        Assign a role to everyone who has signed in.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {users.map((user) => (
            <Paper key={user.id} elevation={0} sx={{
              p: 2.5, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
            }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography sx={{ fontWeight: 600, color: '#0D1B3E' }}>
                  {user.full_name || 'Unnamed User'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>{user.mobile || 'No contact info'}</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  Joined {formatDate(user.created_at)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label={user.role_name ?? 'No role'}
                  size="small"
                  sx={{
                    textTransform: 'capitalize', fontWeight: 600,
                    bgcolor: user.role_name ? '#DCFCE7' : '#F3F4F6',
                    color: user.role_name ? '#00BD67' : '#6B7280',
                  }}
                />
                {updatingId === user.id ? (
                  <CircularProgress size={20} />
                ) : (
                  <Select
                    size="small" displayEmpty value={user.role_id ?? ''}
                    onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                    sx={{ minWidth: 140, bgcolor: '#EEF2FF', borderRadius: 2 }}
                  >
                    <MenuItem value="" disabled>Assign role...</MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id} sx={{ textTransform: 'capitalize' }}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <IconButton size="small" onClick={() => setDeleteTarget(user)} sx={{ color: '#EF4444' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Snackbar open={success} autoHideDuration={2500} onClose={() => setSuccess(false)}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Role updated!</Alert>
      </Snackbar>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{deleteTarget?.full_name || 'this user'}</strong>?
            They will lose access and need to be re-assigned a role if they sign in again.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}