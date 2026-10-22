import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Select, MenuItem, FormControlLabel, Checkbox,
  Button, CircularProgress, Alert, Snackbar,
} from '@mui/material'
import { getAllRoles } from '../services/roleService'
import { getAllPermissions, getRolePermissions, setRolePermissions } from '../services/permissionService'
import type { Role, Permission } from '../services/types/rbacTypes'

export function RolePermissions() {
  const [roles, setRoles] = useState<Role[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('')
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())

  const [loading, setLoading] = useState(true)
  const [loadingRolePerms, setLoadingRolePerms] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => { fetchInitial() }, [])

  async function fetchInitial() {
    setLoading(true)
    try {
      const [rolesData, permsData] = await Promise.all([getAllRoles(), getAllPermissions()])
      setRoles(rolesData)
      setAllPermissions(permsData)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleSelect(roleId: number) {
    setSelectedRoleId(roleId)
    setLoadingRolePerms(true)
    try {
      const rolePerms = await getRolePermissions(roleId)
      setCheckedIds(new Set(rolePerms.map((p) => p.id)))
    } catch {
      setError('Failed to load role permissions')
    } finally {
      setLoadingRolePerms(false)
    }
  }

  function toggleCheck(id: number) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave() {
    if (!selectedRoleId) return
    setSaving(true)
    setError('')
    try {
      await setRolePermissions(selectedRoleId, Array.from(checkedIds))
      setSuccess(true)
    } catch {
      setError('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 2 }}>
        Role Permissions
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
        Select a role, then tick the permissions it should have.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <>
          <Select
            fullWidth
            displayEmpty
            value={selectedRoleId}
            onChange={(e) => handleRoleSelect(Number(e.target.value))}
            sx={{ mb: 3, bgcolor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="" disabled>Select a role...</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id} sx={{ textTransform: 'capitalize' }}>
                {role.name}
              </MenuItem>
            ))}
          </Select>

          {selectedRoleId && (
            loadingRolePerms ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {allPermissions.map((perm) => (
                    <FormControlLabel
                      key={perm.id}
                      control={
                        <Checkbox
                          checked={checkedIds.has(perm.id)}
                          onChange={() => toggleCheck(perm.id)}
                          sx={{ color: '#004B8B', '&.Mui-checked': { color: '#004B8B' } }}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: 14 }}>{perm.name}</Typography>
                          {perm.description && (
                            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{perm.description}</Typography>
                          )}
                        </Box>
                      }
                    />
                  ))}
                </Box>

                <Button
                  variant="contained" onClick={handleSave} disabled={saving}
                  sx={{ mt: 3, bgcolor: '#004B8B', borderRadius: 2, '&:hover': { bgcolor: '#003666' } }}
                >
                  {saving ? 'Saving...' : 'Save Permissions'}
                </Button>
              </Paper>
            )
          )}
        </>
      )}

      <Snackbar open={success} autoHideDuration={2500} onClose={() => setSuccess(false)}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Permissions updated!</Alert>
      </Snackbar>
    </Box>
  )
}