import { useEffect, useMemo, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert, Autocomplete, Divider,
  createFilterOptions,
} from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { updateDraftLineItem, updateDraftVendor } from '../api/purchasePlanningApi'
import { fetchZohoVendors } from '../../purchase-orders/api/zohoApi'
import type { ZohoVendor } from '../../purchase-orders/api/zohoApi'
import { useItemCatalog } from '../hooks/useItemCatalog'
import type { ItemCatalogEntry } from '../hooks/useItemCatalog'
import type { ReviewPurchaseOrder } from '../hooks/usePurchaseOrders'

interface Props {
  po: ReviewPurchaseOrder | null
  open: boolean
  onClose: () => void
}

type LineDraft = {
  quantity: string
  rate: string
  item: ItemCatalogEntry | null // only set when the user picks a different item
}

type Draft = Record<string, LineDraft>

// Keeps the lists fast: show at most 100 matches while typing.
const filterVendors = createFilterOptions<ZohoVendor>({ limit: 100 })
const filterItems = createFilterOptions<ItemCatalogEntry>({ limit: 100 })

export function EditPurchaseOrderDialog({ po, open, onClose }: Props) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Draft>({})
  const [vendor, setVendor] = useState<ZohoVendor | null>(null) // only set when changed
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<ZohoVendor[]>({
    queryKey: ['edit-po', 'zoho-vendors'],
    queryFn: () => fetchZohoVendors(false),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: catalog = [], isLoading: itemsLoading } = useItemCatalog()

  const sortedVendors = useMemo(
    () => [...vendors].sort((a, b) => a.name.localeCompare(b.name)),
    [vendors]
  )
  const sortedCatalog = useMemo(
    () => [...catalog].sort((a, b) => a.item_name.localeCompare(b.item_name)),
    [catalog]
  )

  useEffect(() => {
    if (!po || !open) return
    const initial: Draft = {}
    for (const li of po.items) {
      initial[li.id] = {
        quantity: String(li.quantity ?? ''),
        rate: li.rate != null ? String(li.rate) : '',
        item: null,
      }
    }
    setValues(initial)
    setVendor(null)
    setError('')
  }, [po, open])

  if (!po) return null

  const total = po.items.reduce((sum, li) => {
    const v = values[li.id]
    return sum + (Number(v?.quantity) || 0) * (Number(v?.rate) || 0)
  }, 0)

  function setField(id: string, field: 'quantity' | 'rate', value: string) {
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  function setItem(id: string, item: ItemCatalogEntry | null) {
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], item } }))
  }

  async function handleSave() {
    if (!po) return
    setError('')

    for (const li of po.items) {
      const v = values[li.id]
      const qty = Number(v?.quantity)
      const rate = Number(v?.rate)
      const name = v?.item?.item_name ?? li.item_name
      if (!(qty > 0)) return setError(`Enter a quantity greater than 0 for ${name}.`)
      if (v?.rate === '' || !(rate >= 0)) return setError(`Enter a valid rate for ${name}.`)
    }

    setSaving(true)
    try {
      // 1) Vendor (only if the user picked a different one)
      if (vendor) {
        await updateDraftVendor(po.id, vendor.zoho_contact_id, vendor.name)
      }

      // 2) Line items (only the ones that actually changed)
      for (const li of po.items) {
        const v = values[li.id]
        const qty = Number(v.quantity)
        const rate = Number(v.rate)

        const updates: {
          item_name?: string
          quantity?: number
          rate?: number
          zoho_item_id?: string | null
        } = {}

        if (qty !== Number(li.quantity)) updates.quantity = qty
        if (rate !== Number(li.rate ?? 0)) updates.rate = rate
        if (v.item) {
          updates.item_name = v.item.item_name
          updates.zoho_item_id = v.item.zoho_item_id
        }

        if (Object.keys(updates).length > 0) {
          await updateDraftLineItem(li.id, updates)
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit {po.po_number}
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* VENDOR */}
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Vendor</Typography>
        <Autocomplete
          options={sortedVendors}
          loading={vendorsLoading}
          value={vendor}
          onChange={(_, newValue) => setVendor(newValue)}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.zoho_contact_id === b.zoho_contact_id}
          filterOptions={filterVendors}
          noOptionsText="No vendor found"
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={vendor ? 'New vendor' : `Current: ${po.vendor_name}`}
              placeholder="Search to change vendor"
            />
          )}
        />
        <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 0.5 }}>
          Leave empty to keep {po.vendor_name}.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* ITEMS */}
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Items</Typography>

        {po.items.map((li) => (
          <Box key={li.id} sx={{ mb: 2.5 }}>
            <Autocomplete
              options={sortedCatalog}
              loading={itemsLoading}
              value={values[li.id]?.item ?? null}
              onChange={(_, newValue) => setItem(li.id, newValue)}
              getOptionLabel={(o) => o.item_name}
              isOptionEqualToValue={(a, b) => a.zoho_item_id === b.zoho_item_id}
              filterOptions={filterItems}
              noOptionsText="No item found"
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label={values[li.id]?.item ? 'New item' : `Current: ${li.item_name}`}
                  placeholder="Search to change item"
                />
              )}
              sx={{ mb: 1.5 }}
            />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField
                label="Quantity"
                type="number"
                size="small"
                fullWidth
                value={values[li.id]?.quantity ?? ''}
                onChange={(e) => setField(li.id, 'quantity', e.target.value)}
                inputProps={{ min: 0, step: 'any' }}
              />
              <TextField
                label="Rate"
                type="number"
                size="small"
                fullWidth
                value={values[li.id]?.rate ?? ''}
                onChange={(e) => setField(li.id, 'rate', e.target.value)}
                inputProps={{ min: 0, step: 'any' }}
              />
            </Box>
          </Box>
        ))}

        <Typography sx={{ fontWeight: 700, textAlign: 'right' }}>
          Total: {total.toFixed(2)}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}