import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Button, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { getAllPermissions, createPermission, updatePermission, deletePermission } from '../services/permissionService'
import type { Permission } from '../services/types/rbacTypes'

export function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchPermissions() }, [])

  async function fetchPermissions() {
    setLoading(true)
    try {
      const data = await getAllPermissions()
      setPermissions(data)
    } catch {
      setError('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingPerm(null)
    setName('')
    setDescription('')
    setDialogOpen(true)
  }

  function openEditDialog(perm: Permission) {
    setEditingPerm(perm)
    setName(perm.name)
    setDescription(perm.description ?? '')
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim()) { setError('Permission name is required'); return }
    setSaving(true)
    setError('')
    try {
      if (editingPerm) {
        await updatePermission(editingPerm.id, name.trim(), description.trim())
      } else {
        await createPermission(name.trim(), description.trim())
      }
      setDialogOpen(false)
      fetchPermissions()
    } catch {
      setError('Failed to save permission. Name might already exist.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePermission(deleteTarget.id)
      setDeleteTarget(null)
      fetchPermissions()
    } catch {
      setError('Failed to delete permission.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E' }}>Permissions</Typography>
        <Button
          variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}
          sx={{ bgcolor: '#004B8B', borderRadius: 2, '&:hover': { bgcolor: '#003666' } }}
        >
          New Permission
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {permissions.map((perm) => (
            <Paper key={perm.id} elevation={0} sx={{
              p: 2, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontFamily: 'monospace' }}>
                  {perm.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  {perm.description || 'No description'}
                </Typography>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => openEditDialog(perm)} sx={{ color: '#004B8B' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setDeleteTarget(perm)} sx={{ color: '#EF4444' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingPerm ? 'Edit Permission' : 'New Permission'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Permission name (e.g. orders:create)" value={name}
            onChange={(e) => setName(e.target.value)} sx={{ mt: 1, mb: 2 }}
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

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Permission?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</Typography>
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