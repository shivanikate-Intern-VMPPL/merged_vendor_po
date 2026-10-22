import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Button, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { getAllRoles, createRole, updateRole, deleteRole } from '../services/roleService'
import type { Role } from '../services/types/rbacTypes'

export function Roles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchRoles() }, [])

  async function fetchRoles() {
    setLoading(true)
    try {
      const data = await getAllRoles()
      setRoles(data)
    } catch {
      setError('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingRole(null)
    setName('')
    setDescription('')
    setDialogOpen(true)
  }

  function openEditDialog(role: Role) {
    setEditingRole(role)
    setName(role.name)
    setDescription(role.description ?? '')
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim()) { setError('Role name is required'); return }
    setSaving(true)
    setError('')
    try {
      if (editingRole) {
        await updateRole(editingRole.id, name.trim(), description.trim())
      } else {
        await createRole(name.trim(), description.trim())
      }
      setDialogOpen(false)
      fetchRoles()
    } catch {
      setError('Failed to save role. Name might already exist.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteRole(deleteTarget.id)
      setDeleteTarget(null)
      fetchRoles()
    } catch {
      setError('Failed to delete role. It may still be assigned to users.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E' }}>Roles</Typography>
        <Button
          variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}
          sx={{ bgcolor: '#004B8B', borderRadius: 2, '&:hover': { bgcolor: '#003666' } }}
        >
          New Role
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {roles.map((role) => (
            <Paper key={role.id} elevation={0} sx={{
              p: 2, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography sx={{ fontWeight: 600, color: '#0D1B3E', textTransform: 'capitalize' }}>
                  {role.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  {role.description || 'No description'}
                </Typography>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => openEditDialog(role)} sx={{ color: '#004B8B' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setDeleteTarget(role)} sx={{ color: '#EF4444' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingRole ? 'Edit Role' : 'New Role'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Role name" value={name} onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            multiline rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#004B8B', '&:hover': { bgcolor: '#003666' } }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Role?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
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