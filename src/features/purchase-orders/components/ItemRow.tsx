import { Box, Typography, Autocomplete, TextField, IconButton, Select, MenuItem } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import type { Item } from '../../../shared/types'
import type { OrderItem } from '../utils/calculateTotals'
import { calculateItemAmount } from '../utils/calculateTotals'

interface ItemRowProps {
  index: number
  item: OrderItem
  availableItems: Item[]
  onChange: (index: number, updated: OrderItem) => void
  onRemove: (index: number) => void
  onResolveZohoItem?: (matched: Item) => Promise<Item | null>
  loadingItems?: boolean
}

export function ItemRow({ index, item, availableItems, onChange, onRemove, onResolveZohoItem }: ItemRowProps)  {
  const isValid = !!item.item_id && !item.is_manual
  const isInvalid = !!item.item_name && !isValid
  const cardBg = isInvalid ? '#FEE2E2' : '#D6E4FF'
  const cardBorder = isInvalid ? '#F5B5B5' : '#BFCFE8'
  const headerColor = isInvalid ? '#B91C1C' : '#004B8B'

  async function handleItemInput(_: unknown, value: string) {
    const matched = availableItems.find((i) => i.name.toLowerCase() === value.toLowerCase())

    if (matched && matched.id.startsWith('zoho:')) {
      // Placeholder while we resolve the real local item behind the scenes
      const amount = calculateItemAmount(item.quantity, matched.default_rate)
      const gst_percent = (matched as any).default_gst_percent ?? 0
      const gst_amount = Math.round((amount * gst_percent / 100) * 100) / 100
      onChange(index, {
        ...item, item_id: '', item_name: matched.name,
        rate: matched.default_rate, amount, gst_percent, gst_amount, is_manual: true,
      })
      if (onResolveZohoItem) {
        const resolved = await onResolveZohoItem(matched)
        if (resolved) {
          const amount2 = calculateItemAmount(item.quantity, resolved.default_rate)
          const gst_percent2 = (resolved as any).default_gst_percent ?? 0
          const gst_amount2 = Math.round((amount2 * gst_percent2 / 100) * 100) / 100
          onChange(index, {
            ...item, item_id: resolved.id, item_name: resolved.name,
            rate: resolved.default_rate, amount: amount2, gst_percent: gst_percent2, gst_amount: gst_amount2, is_manual: false,
          })
        }
      }
      return
    }

    if (matched) {
      const amount = calculateItemAmount(item.quantity, matched.default_rate)
      const gst_percent = (matched as any).default_gst_percent ?? 0
      const gst_amount = Math.round((amount * gst_percent / 100) * 100) / 100
      onChange(index, {
        ...item, item_id: matched.id, item_name: matched.name,
        rate: matched.default_rate, amount, gst_percent, gst_amount, is_manual: false,
      })
    } else {
      onChange(index, { ...item, item_id: '', item_name: value, is_manual: true })
    }
  }

  function handleQuantityChange(value: string) {
    const quantity = parseFloat(value) || 0
    const amount = calculateItemAmount(quantity, item.rate)
    const gst_percent_num = Number(item.gst_percent) || 0
    const gst_amount = Math.round((amount * gst_percent_num / 100) * 100) / 100
    onChange(index, { ...item, quantity, amount, gst_amount })
  }

  function handleRateChange(value: string) {
    const rate = parseFloat(value) || 0
    const amount = calculateItemAmount(item.quantity, rate)
    const gst_percent_num = Number(item.gst_percent) || 0
    const gst_amount = Math.round((amount * gst_percent_num / 100) * 100) / 100
    onChange(index, { ...item, rate, amount, gst_amount })
  }

  function handleTaxChange(value: number | string) {
    // value may be number or string; handle special keys
    let gst_percent = 0
    if (value === 'out-of-scope' || value === 'non-gst' || value === 'new-tax') {
      gst_percent = 0
    } else if (typeof value === 'number') {
      gst_percent = value
    } else {
      const parsed = Number(value)
      gst_percent = isNaN(parsed) ? 0 : parsed
    }
    const amount = calculateItemAmount(item.quantity, item.rate)
    const gst_amount = Math.round((amount * (gst_percent || 0) / 100) * 100) / 100
    onChange(index, { ...item, gst_percent, gst_amount })
  }

  function handleRowComment(value: string) {
    onChange(index, { ...item, row_comment: value })
  }

  return (
    <Box sx={{ bgcolor: cardBg, borderRadius: 3, p: 2, border: `1px solid ${cardBorder}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, color: headerColor, fontSize: 15 }}>
          Item {index + 1}
        </Typography>
        <IconButton size="small" onClick={() => onRemove(index)}
          sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
          <DeleteIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.5 }}>
        Item Name *
      </Typography>
      <Box sx={{ position: 'relative', mb: isInvalid ? 0.5 : 2 }}>

        <Autocomplete
          freeSolo
          options={availableItems.map((i) => i.name)}
          value={item.item_name || null}
          onInputChange={handleItemInput}
          renderOption={(props, optionName) => {
            const matched = availableItems.find((i) => i.name === optionName)
            return (
              <Box component="li" {...props} key={optionName} sx={{ display: 'flex !important', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                <Typography sx={{ fontSize: 14, color: '#0D1B3E' }}>{optionName}</Typography>
                {matched && (
                  <Typography sx={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap', ml: 2 }}>
                    Rate: ₹{matched.default_rate}{matched.purchase_rate !== undefined ? ` · Purchase: ₹${matched.purchase_rate}` : ''}
                  </Typography>
                )}
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="Select or type an item..."
              error={isInvalid}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white', borderRadius: 2, fontSize: 14,
                  '& fieldset': { borderColor: isInvalid ? '#EF4444' : '#E5E7EB' },
                },
              }}
            />
          )}
        />
        {isValid && (
          <CheckCircleIcon sx={{
            position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)',
            color: '#00BD67', fontSize: 20, pointerEvents: 'none',
          }} />
        )}
        {isInvalid && (
          <ErrorIcon sx={{
            position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)',
            color: '#EF4444', fontSize: 20, pointerEvents: 'none',
          }} />
        )}
      </Box>

      {isInvalid && (
        <Typography variant="caption" sx={{ color: '#B91C1C', display: 'block', mb: 1.5 }}>
          Item not found in master list.
        </Typography>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mb: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.5 }}>Qty *</Typography>
          <TextField
            type="number" size="small" fullWidth placeholder="0"
            value={item.quantity || ''} onChange={(e) => handleQuantityChange(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 20, fontSize: 14, px: 1 } }}
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.5 }}>Unit</Typography>
          <Select
            size="small"
            fullWidth
            value={item.unit ?? 'Kg'}
            onChange={(e) => onChange(index, { ...item, unit: e.target.value })}
            sx={{ bgcolor: 'white', borderRadius: 20, fontSize: 14 }}
          >
            <MenuItem value="Kg">Kg</MenuItem>
            <MenuItem value="Bunch">Bunch</MenuItem>
            <MenuItem value="PKT">PKT</MenuItem>
            <MenuItem value="Bags">Bags</MenuItem>
          </Select>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.5 }}>Rate (₹) *</Typography>
          <TextField
            type="number" size="small" fullWidth placeholder="0.00"
            value={item.rate || ''} onChange={(e) => handleRateChange(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 20, fontSize: 14, px: 1 } }}
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.5 }}>Tax</Typography>
          <Select
            size="small"
            fullWidth
            value={item.gst_percent ?? 0}
            onChange={(e) => handleTaxChange(e.target.value as any)}
            sx={{ bgcolor: 'white', borderRadius: 20, fontSize: 14 }}
          >
            <MenuItem value={0}>Non-Taxable</MenuItem>
            <MenuItem value={'out-of-scope'} disabled>Out of Scope</MenuItem>
            <MenuItem value={'non-gst'} disabled>Non-GST Supply</MenuItem>
            <MenuItem disabled sx={{ opacity: 1, fontWeight: 700 }}>—— Tax Group ——</MenuItem>
            <MenuItem value={0}>GST0 [0%]</MenuItem>
            <MenuItem value={5}>GST5 [5%]</MenuItem>
            <MenuItem value={12}>GST12 [12%]</MenuItem>
            <MenuItem value={18}>GST18 [18%]</MenuItem>
            <MenuItem value={40}>GST40 [40%]</MenuItem>
            <MenuItem value={28}>GST28 [28%]</MenuItem>
            <MenuItem value={'new-tax'}>+ New Tax</MenuItem>
          </Select>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.5 }}>Row Comment</Typography>
          <TextField
            size="small" fullWidth placeholder="Add comment..."
            value={item.row_comment ?? ''} onChange={(e) => handleRowComment(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 20, fontSize: 14 } }}
          />
        </Box>

        <Box sx={{ textAlign: 'right', width: 120 }}>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.2 }}>Total</Typography>
          <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, py: 1, px: 2, boxShadow: 'none' }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#0D1B3E', lineHeight: 1 }}>
              ₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}