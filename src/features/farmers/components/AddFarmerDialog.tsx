import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material'
import { addFarmer } from '../api/farmersApi'
import type { Farmer } from '../../../shared/types'

interface AddFarmerDialogProps {
  open: boolean
  onClose: () => void
  onFarmerAdded: (farmer: Farmer) => void
  initialName?: string
}

export function AddFarmerDialog({
  open,
  onClose,
  onFarmerAdded,
  initialName = '',
}: AddFarmerDialogProps) {
  const [name, setName] = useState(initialName)
  const [village, setVillage] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!name.trim()) {
      setError('Farmer name is required')
      return
    }

    setLoading(true)
    setError('')

    const newFarmer = await addFarmer({
      name: name.trim(),
      village: village.trim() || null,
      mobile: mobile.trim() || null,
      farmer_code: null,
    })

    if (!newFarmer) {
      setError('Failed to add farmer. Please try again.')
      setLoading(false)
      return
    }

    onFarmerAdded(newFarmer)
    setName('')
    setVillage('')
    setMobile('')
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Add New Farmer
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && (
            <Box sx={{ color: 'error.main', fontSize: 14 }}>{error}</Box>
          )}
          <TextField
            label="Farmer Name *"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Village"
            fullWidth
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Mobile Number"
            fullWidth
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Add Farmer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}