// // // import { useState, useEffect } from 'react'
// // // import {
// // //   Box, Button, TextField, Typography, Paper, CircularProgress, Alert,
// // //   Autocomplete, IconButton, Divider,
// // // } from '@mui/material'
// // // import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// // // import AddIcon from '@mui/icons-material/Add'
// // // import SaveIcon from '@mui/icons-material/Save'
// // // import RefreshIcon from '@mui/icons-material/Refresh'
// // // import { useNavigate } from 'react-router-dom'
// // // import { useAuthContext } from '../../auth/AuthContext'
// // // import { getAllFarmers } from '../../farmers/api/farmersApi'
// // // import { getAllItems } from '../../items/api/itemsApi'
// // // import { createPurchaseOrder, previewNextPoNumber } from '../api/purchaseOrdersApi'
// // // import { AddFarmerDialog } from '../../farmers/components/AddFarmerDialog'
// // // import { ItemRow } from './ItemRow'
// // // import { calculateOrderTotals } from '../utils/calculateTotals'
// // // import type { OrderItem } from '../utils/calculateTotals'
// // // import type { Farmer, Item } from '../../../shared/types'
// // // import { fetchZohoVendors, fetchZohoItems } from '../api/zohoApi'
// // // import type { ZohoVendor, ZohoItem } from '../api/zohoApi'
// // // import { resolveZohoFarmer } from '../../farmers/api/resolveZohoFarmer'
// // // import { resolveZohoItem } from '../../items/api/resolveZohoItem'
// // // import { Layout } from '../../../shared/components/Layout'

// // // const emptyItem: OrderItem = {
// // //   item_id: '', item_name: '', quantity: 0, rate: 0, amount: 0, row_comment: '', unit: 'Kg', gst_percent: 0, gst_amount: 0,
// // // }

// // // interface CombinedVendorOption {
// // //   type: 'local' | 'zoho'
// // //   id: string
// // //   name: string
// // //   village: string | null
// // //   phone: string | null
// // //   linkedToZoho: boolean
// // //   raw: Farmer | ZohoVendor
// // // }

// // // function normalizeName(name: string): string {
// // //   return name.trim().toLowerCase().replace(/\s+/g, ' ')
// // // }

// // // function normalizePhone(phone: string | null | undefined): string | null {
// // //   if (!phone) return null
// // //   const digits = phone.replace(/\D/g, '')
// // //   return digits.length >= 10 ? digits.slice(-10) : digits || null
// // // }

// // // export function NewPurchaseForm() {
// // //   const { user } = useAuthContext()
// // //   const navigate = useNavigate()

// // //   const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
// // //   const [showAddFarmer, setShowAddFarmer] = useState(false)
// // //   const [orderItems, setOrderItems] = useState<OrderItem[]>([{ ...emptyItem }])
// // //   const [notes, setNotes] = useState('')
// // //   const [poPreview, setPoPreview] = useState('PO-XXXX-XXXX')
// // //   const [loading, setLoading] = useState(false)
// // //   const [error, setError] = useState('')

// // //   const [farmerOptions, setFarmerOptions] = useState<Farmer[]>([])
// // //   const [zohoVendors, setZohoVendors] = useState<ZohoVendor[]>([])
// // //   const [loadingVendors, setLoadingVendors] = useState(false)
// // //   const [resolvingVendor, setResolvingVendor] = useState(false)

// // //   const [localItems, setLocalItems] = useState<Item[]>([])
// // //   const [zohoItems, setZohoItems] = useState<ZohoItem[]>([])
// // //   const [loadingItems, setLoadingItems] = useState(false)

// // //   useEffect(() => { previewNextPoNumber().then(setPoPreview) }, [])

// // //   async function loadAllVendors(forceRefresh = false) {
// // //     setLoadingVendors(true)
// // //     try {
// // //       if (farmerOptions.length === 0) {
// // //         const local = await getAllFarmers()
// // //         setFarmerOptions(local)
// // //       }

// // //       const zoho = await fetchZohoVendors(forceRefresh)
// // //       setZohoVendors(zoho)
// // //       setError('')
// // //     } catch (loadError) {
// // //       setError(loadError instanceof Error ? loadError.message : 'Unable to load Zoho vendors.')
// // //     } finally {
// // //       setLoadingVendors(false)
// // //     }
// // //   }

// // //   async function loadAllItems(forceRefresh = false) {
// // //     setLoadingItems(true)
// // //     try {
// // //       if (localItems.length === 0) {
// // //         const local = await getAllItems()
// // //         setLocalItems(local)
// // //       }

// // //       const zoho = await fetchZohoItems(forceRefresh)
// // //       setZohoItems(zoho)
// // //     } catch (loadError) {
// // //       setError(loadError instanceof Error ? loadError.message : 'Unable to load Zoho items.')
// // //     } finally {
// // //       setLoadingItems(false)
// // //     }
// // //   }

// // //   useEffect(() => { loadAllVendors() }, [])
// // //   useEffect(() => { loadAllItems() }, [])

// // //   const localZohoIds = new Set(
// // //     farmerOptions.map((f) => (f as Farmer & { zoho_contact_id?: string }).zoho_contact_id).filter(Boolean)
// // //   )

// // //   const zohoVendorMatchesLocal = (vendor: ZohoVendor, farmer: Farmer): boolean => {
// // //     if (localZohoIds.has(vendor.zoho_contact_id)) {
// // //       return (farmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id === vendor.zoho_contact_id
// // //     }
// // //     const nameMatches = normalizeName(farmer.name ?? '') === normalizeName(vendor.name)
// // //     const targetPhone = normalizePhone(vendor.phone)
// // //     const phoneMatches = targetPhone !== null && normalizePhone(farmer.mobile) === targetPhone
// // //     return nameMatches || phoneMatches
// // //   }

// // //   const unmatchedZohoVendors = zohoVendors.filter(
// // //     (v) => !farmerOptions.some((f) => zohoVendorMatchesLocal(v, f))
// // //   )

// // //   const combinedOptions: CombinedVendorOption[] = [
// // //     ...farmerOptions.map((f) => ({
// // //       type: 'local' as const,
// // //       id: f.id,
// // //       name: f.name,
// // //       village: f.village ?? null,
// // //       phone: f.mobile ?? null,
// // //       linkedToZoho: !!(f as Farmer & { zoho_contact_id?: string }).zoho_contact_id,
// // //       raw: f,
// // //     })),
// // //     ...unmatchedZohoVendors.map((v) => ({
// // //       type: 'zoho' as const,
// // //       id: v.zoho_contact_id,
// // //       name: v.name,
// // //       village: v.company_name,
// // //       phone: v.phone,
// // //       linkedToZoho: true,
// // //       raw: v,
// // //     })),
// // //   ]

// // //   const selectedOption: CombinedVendorOption | null = selectedFarmer
// // //     ? {
// // //         type: 'local',
// // //         id: selectedFarmer.id,
// // //         name: selectedFarmer.name,
// // //         village: selectedFarmer.village ?? null,
// // //         phone: selectedFarmer.mobile ?? null,
// // //         linkedToZoho: !!(selectedFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id,
// // //         raw: selectedFarmer,
// // //       }
// // //     : null

// // //   const localItemNames = new Set(localItems.map((i) => i.name.toLowerCase()))
// // //   const availableItems: Item[] = [
// // //     ...localItems,
// // //     ...zohoItems
// // //       .filter((z) => !localItemNames.has(z.name.toLowerCase()))
// // //       .map((z) => ({
// // //         id: `zoho:${z.zoho_item_id}`,
// // //         name: z.name,
// // //         default_rate: z.rate,
// // //         default_gst_percent: 0,
// // //         zoho_item_id: z.zoho_item_id,
// // //         purchase_rate: z.purchase_rate,
// // //       })),
// // //   ]

// // //   async function handleResolveZohoItem(matched: Item): Promise<Item | null> {
// // //     if (!matched.zoho_item_id) return null
// // //     const resolved = await resolveZohoItem({
// // //       zoho_item_id: matched.zoho_item_id,
// // //       name: matched.name,
// // //       unit: null,
// // //       rate: matched.default_rate,
// // //       purchase_rate: matched.purchase_rate ?? 0,
// // //       category: null,
// // //     })
// // //     if (resolved) {
// // //       setLocalItems((prev) => [...prev, resolved])
// // //     }
// // //     return resolved
// // //   }

// // //   function handleItemChange(index: number, updated: OrderItem) {
// // //     const newItems = [...orderItems]
// // //     newItems[index] = updated
// // //     setOrderItems(newItems)
// // //   }

// // //   function handleRemoveItem(index: number) {
// // //     if (orderItems.length === 1) return
// // //     setOrderItems(orderItems.filter((_, i) => i !== index))
// // //   }

// // //   function handleAddItem() {
// // //     setOrderItems([...orderItems, { ...emptyItem }])
// // //   }

// // //   const { subtotal, total_tax, grand_total } = calculateOrderTotals(orderItems)
// // //   const hasInvalidItem = orderItems.some((i) => i.item_name && !i.item_id)

// // //   const orderDateStr = new Date().toLocaleDateString('en-IN', {
// // //     month: 'short', day: 'numeric', year: 'numeric',
// // //   })

// // //   async function handleVendorChange(value: CombinedVendorOption | null) {
// // //     if (!value) {
// // //       setSelectedFarmer(null)
// // //       return
// // //     }
// // //     if (value.type === 'local') {
// // //       const localFarmer = value.raw as Farmer
// // //       const isLinked = !!(localFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id

// // //       if (isLinked) {
// // //         setSelectedFarmer(localFarmer)
// // //         return
// // //       }

// // //       const match = zohoVendors.find((v) => zohoVendorMatchesLocal(v, localFarmer))
// // //       if (match) {
// // //         setResolvingVendor(true)
// // //         const resolved = await resolveZohoFarmer(match)
// // //         setResolvingVendor(false)
// // //         if (resolved) {
// // //           setSelectedFarmer(resolved)
// // //           setFarmerOptions((prev) => prev.map((f) => (f.id === resolved.id ? resolved : f)))
// // //         } else {
// // //           setError('Failed to link this vendor to Zoho. Please try again.')
// // //         }
// // //         return
// // //       }

// // //       setSelectedFarmer(localFarmer)
// // //     } else {
// // //       setResolvingVendor(true)
// // //       const resolved = await resolveZohoFarmer(value.raw as ZohoVendor)
// // //       setResolvingVendor(false)
// // //       if (resolved) {
// // //         setSelectedFarmer(resolved)
// // //         setFarmerOptions((prev) => {
// // //           const exists = prev.some((f) => f.id === resolved.id)
// // //           return exists ? prev.map((f) => (f.id === resolved.id ? resolved : f)) : [...prev, resolved]
// // //         })
// // //       } else {
// // //         setError('Failed to link Zoho vendor. Please try again.')
// // //       }
// // //     }
// // //   }

// // //   async function handleSave() {
// // //     if (!selectedFarmer) { setError('Please select a vendor / farmer'); return }

// // //     const isLinkedToZoho = !!(selectedFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id
// // //     if (!isLinkedToZoho) {
// // //       setError(
// // //         `"${selectedFarmer.name}" isn't linked to a Zoho contact, so this order can't be uploaded to Zoho Books. Please re-select them from the list, or use "Add New Farmer" if they're genuinely new.`
// // //       )
// // //       return
// // //     }

// // //     const validItems = orderItems.filter((item) => item.item_name && item.quantity > 0 && item.rate > 0)
// // //     if (validItems.length === 0) {
// // //       setError('Please add at least one item with quantity and rate')
// // //       return
// // //     }
// // //     if (hasInvalidItem) {
// // //       setError('One or more items are not in the master list. Please review before saving.')
// // //       return
// // //     }
// // //     if (!user) return
// // //     setLoading(true)
// // //     setError('')
// // //     const result = await createPurchaseOrder({
// // //       farmer_id: selectedFarmer.id,
// // //       created_by: user.id,
// // //       grand_total,
// // //       subtotal,
// // //       total_tax,
// // //       notes,
// // //       items: validItems,
// // //     })
// // //     if (!result) {
// // //       setError('Failed to save. Please try again.')
// // //       setLoading(false)
// // //       return
// // //     }
// // //     navigate(`/purchase-orders/success/${result.po_number}`, {
// // //       state: { po_id: result.id, po_number: result.po_number, farmer: selectedFarmer, items: validItems, subtotal, total_tax, grand_total, notes },
// // //     })
// // //   }

// // //   return (
// // //     <Layout maxWidth={false}>
// // //     <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
// // //       <Box sx={{
// // //         bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.2,
// // //         display: 'flex', alignItems: 'center', gap: 1, position: 'sticky', top: 0, zIndex: 100,
// // //       }}>
// // //         <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ color: '#004B8B' }}>
// // //           <ArrowBackIcon />
// // //         </IconButton>
// // //         <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 16 }}>Purchase order</Typography>
// // //       </Box>

// // //       <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 3, pb: 6 }}>
// // //         <Box sx={{ mb: 3 }}>
// // //           <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 0.5 }}>
// // //             New Purchase Order
// // //           </Typography>
// // //           <Typography variant="body2" sx={{ color: '#6B7280' }}>
// // //             Enter vendor details and line items below.
// // //           </Typography>
// // //         </Box>

// // //         {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

// // //         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
// // //           <Box sx={{ p: 2.5 }}>
// // //             <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15, mb: 2 }}>
// // //               Vendor Information
// // //             </Typography>

// // //             <Box sx={{ mb: 1 }}>
// // //               <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.8 }}>
// // //                 Vendor *
// // //               </Typography>

// // //               <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
// // //                 <Autocomplete
// // //                   fullWidth
// // //                   options={combinedOptions}
// // //                   loading={loadingVendors}
// // //                   value={selectedOption}
// // //                   getOptionLabel={(option) =>
// // //                     `${option.name}${option.village ? ` — ${option.village}` : ''}`
// // //                   }
// // //                   getOptionKey={(option) => option.id}
// // //                   isOptionEqualToValue={(option, value) => option.id === value.id}
// // //                   onChange={(_, value) => handleVendorChange(value)}
// // //                   filterOptions={(options, state) => {
// // //                     const query = state.inputValue.toLowerCase().trim()
// // //                     if (!query) return options
// // //                     return options.filter((opt) =>
// // //                       opt.name.toLowerCase().includes(query) ||
// // //                       (opt.phone ?? '').toLowerCase().includes(query) ||
// // //                       (opt.village ?? '').toLowerCase().includes(query)
// // //                     )
// // //                   }}
// // //                   renderOption={(props, option) => (
// // //                     <Box component="li" {...props} key={option.id} sx={{ display: 'block !important', py: 1 }}>
// // //                       <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E' }}>
// // //                         {option.name}
// // //                       </Typography>
// // //                       {(option.village || option.phone) && (
// // //                         <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
// // //                           {[option.village, option.phone].filter(Boolean).join(' · ')}
// // //                         </Typography>
// // //                       )}
// // //                     </Box>
// // //                   )}
// // //                   noOptionsText="No farmers found"
// // //                   renderInput={(params) => (
// // //                     <TextField
// // //                       {...params}
// // //                       placeholder={resolvingVendor ? 'Linking vendor...' : 'Search name or phone...'}
// // //                       size="small"
// // //                       sx={{
// // //                         '& .MuiOutlinedInput-root': {
// // //                           bgcolor: 'white', borderRadius: 2,
// // //                           border: '1px solid #E5E7EB', '& fieldset': { border: 'none' },
// // //                         },
// // //                       }}
// // //                     />
// // //                   )}
// // //                 />
// // //                 <IconButton
// // //                   onClick={() => loadAllVendors(true)}
// // //                   disabled={loadingVendors}
// // //                   sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 2, mt: 0.2 }}
// // //                 >
// // //                   <RefreshIcon sx={{ color: '#004B8B' }} />
// // //                 </IconButton>
// // //               </Box>
// // //             </Box>

// // //             <Box sx={{ textAlign: 'center', mb: 1 }}>
// // //               <Button
// // //                 size="small"
// // //                 startIcon={<AddIcon />}
// // //                 onClick={() => setShowAddFarmer(true)}
// // //                 sx={{ mt: 0.8, color: '#004B8B', fontSize: 12, fontWeight: 600 }}
// // //               >
// // //                 Add New Farmer
// // //               </Button>
// // //             </Box>

// // //             <Divider sx={{ my: 1.5 }} />

// // //             <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
// // //               <Box>
// // //                 <Typography variant="caption" sx={{ color: '#6B7280' }}>Order Date</Typography>
// // //                 <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontSize: 14 }}>{orderDateStr}</Typography>
// // //               </Box>
// // //               <Box>
// // //                 <Typography variant="caption" sx={{ color: '#6B7280' }}>PO Number</Typography>
// // //                 <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontSize: 14 }}>{poPreview}</Typography>
// // //               </Box>
// // //             </Box>
// // //           </Box>
// // //         </Paper>

// // //         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
// // //           <Box sx={{ p: 2.5 }}>
// // //             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
// // //               <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15 }}>Line Items</Typography>
// // //               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
// // //                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
// // //                   <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: hasInvalidItem ? '#EF4444' : '#00BD67' }} />
// // //                   <Typography variant="caption" sx={{ color: hasInvalidItem ? '#EF4444' : '#00BD67', fontWeight: 600 }}>
// // //                     {hasInvalidItem ? 'Validation Errors' : 'Strict Validation Active'}
// // //                   </Typography>
// // //                 </Box>
// // //                 <IconButton
// // //                   onClick={() => loadAllItems(true)}
// // //                   disabled={loadingItems}
// // //                   size="small"
// // //                   sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 1.5 }}
// // //                 >
// // //                   <RefreshIcon sx={{ color: '#004B8B', fontSize: 18 }} />
// // //                 </IconButton>
// // //               </Box>
// // //             </Box>

// // //             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
// // //               {orderItems.map((item, index) => (
// // //                 <ItemRow key={index} index={index} item={item} availableItems={availableItems}
// // //                   onChange={handleItemChange} onRemove={handleRemoveItem}
// // //                   onResolveZohoItem={handleResolveZohoItem} loadingItems={loadingItems} />
// // //               ))}
// // //             </Box>

// // //             <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem}
// // //               sx={{ mt: 2, borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, px: 2.5,
// // //                 '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}>
// // //               Add Row
// // //             </Button>

// // //             <Divider sx={{ my: 2 }} />

// // //             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
// // //               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Subtotal</Typography>
// // //               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
// // //                 ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
// // //               </Typography>
// // //             </Box>
// // //             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
// // //               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Tax</Typography>
// // //               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
// // //                 ₹ {total_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
// // //               </Typography>
// // //             </Box>
// // //             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
// // //               <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>Grand Total</Typography>
// // //               <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 20 }}>
// // //                 ₹ {grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
// // //               </Typography>
// // //             </Box>
// // //           </Box>
// // //         </Paper>

// // //         <Box sx={{ mb: 3 }}>
// // //           <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1 }}>
// // //             PO Comments / Terms
// // //           </Typography>
// // //           <TextField
// // //             multiline rows={3} fullWidth placeholder="Add any special instructions or terms for this order..."
// // //             value={notes} onChange={(e) => setNotes(e.target.value)}
// // //             sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2, border: '1px solid #E5E7EB', '& fieldset': { border: 'none' }, fontSize: 14 } }}
// // //           />
// // //         </Box>

// // //         <Box sx={{ position: 'sticky', bottom: 0, bgcolor: '#EEF2FF', pt: 1, pb: 2, display: 'flex', gap: 1.5 }}>
// // //           <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')}
// // //             sx={{ flex: 1, borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white',
// // //               '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>
// // //             Cancel
// // //           </Button>
// // //           <Button
// // //             variant="contained" size="large"
// // //             startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
// // //             onClick={handleSave} disabled={loading}
// // //             sx={{ flex: 2, bgcolor: '#004B8B', borderRadius: 3, py: 1.5, fontWeight: 600, fontSize: 15,
// // //               '&:hover': { bgcolor: '#003666' }, '&.Mui-disabled': { bgcolor: '#93A8C4', color: 'white' } }}>
// // //             {loading ? 'Saving...' : 'Save PO'}
// // //           </Button>
// // //         </Box>
// // //       </Box>

// // //       <AddFarmerDialog
// // //         open={showAddFarmer}
// // //         onClose={() => setShowAddFarmer(false)}
// // //         onFarmerAdded={(farmer) => {
// // //           setSelectedFarmer(farmer)
// // //           setFarmerOptions((prev) => [...prev, farmer])
// // //           setShowAddFarmer(false)
// // //         }}
// // //       />
// // //     </Box>
// // //     </Layout>
// // //   )
// // // }
// // import { useState, useEffect } from 'react'
// // import {
// //   Box, Button, TextField, Typography, Paper, CircularProgress, Alert,
// //   Autocomplete, IconButton, Divider,
// // } from '@mui/material'
// // import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// // import AddIcon from '@mui/icons-material/Add'
// // import SaveIcon from '@mui/icons-material/Save'
// // import RefreshIcon from '@mui/icons-material/Refresh'
// // import { useNavigate } from 'react-router-dom'
// // import { useAuthContext } from '../../auth/AuthContext'
// // import { getAllFarmers } from '../../farmers/api/farmersApi'
// // import { getAllItems } from '../../items/api/itemsApi'
// // import { createPurchaseOrder, previewNextPoNumber } from '../api/purchaseOrdersApi'
// // import { AddFarmerDialog } from '../../farmers/components/AddFarmerDialog'
// // import { ItemRow } from './ItemRow'
// // import { calculateOrderTotals } from '../utils/calculateTotals'
// // import type { OrderItem } from '../utils/calculateTotals'
// // import type { Farmer, Item } from '../../../shared/types'
// // import { fetchZohoVendors, fetchZohoItems } from '../api/zohoApi'
// // import type { ZohoVendor, ZohoItem } from '../api/zohoApi'
// // import { resolveZohoFarmer } from '../../farmers/api/resolveZohoFarmer'
// // import { resolveZohoItem } from '../../items/api/resolveZohoItem'
// // import { Layout } from '../../../shared/components/Layout'

// // const emptyItem: OrderItem = {
// //   item_id: '', item_name: '', quantity: 0, rate: 0, amount: 0, row_comment: '', unit: 'Kg', gst_percent: 0, gst_amount: 0,
// // }

// // interface CombinedVendorOption {
// //   type: 'local' | 'zoho'
// //   id: string
// //   name: string
// //   village: string | null
// //   phone: string | null
// //   linkedToZoho: boolean
// //   raw: Farmer | ZohoVendor
// // }

// // function normalizeName(name: string): string {
// //   return name.trim().toLowerCase().replace(/\s+/g, ' ')
// // }

// // function normalizePhone(phone: string | null | undefined): string | null {
// //   if (!phone) return null
// //   const digits = phone.replace(/\D/g, '')
// //   return digits.length >= 10 ? digits.slice(-10) : digits || null
// // }

// // // Module-level cache: survives leaving and re-entering this page, so the
// // // vendor and item lists show instantly and refresh silently in the background.
// // const formCache: {
// //   farmers: Farmer[]
// //   zohoVendors: ZohoVendor[]
// //   localItems: Item[]
// //   zohoItems: ZohoItem[]
// // } = {
// //   farmers: [],
// //   zohoVendors: [],
// //   localItems: [],
// //   zohoItems: [],
// // }

// // export function NewPurchaseForm() {
// //   const { user } = useAuthContext()
// //   const navigate = useNavigate()

// //   const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
// //   const [showAddFarmer, setShowAddFarmer] = useState(false)
// //   const [orderItems, setOrderItems] = useState<OrderItem[]>([{ ...emptyItem }])
// //   const [notes, setNotes] = useState('')
// //   const [poPreview, setPoPreview] = useState('PO-XXXX-XXXX')
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState('')

// //   const [farmerOptions, setFarmerOptions] = useState<Farmer[]>(formCache.farmers)
// //   const [zohoVendors, setZohoVendors] = useState<ZohoVendor[]>(formCache.zohoVendors)
// //   const [loadingVendors, setLoadingVendors] = useState(false)
// //   const [resolvingVendor, setResolvingVendor] = useState(false)

// //   const [localItems, setLocalItems] = useState<Item[]>(formCache.localItems)
// //   const [zohoItems, setZohoItems] = useState<ZohoItem[]>(formCache.zohoItems)
// //   const [loadingItems, setLoadingItems] = useState(false)

// //   useEffect(() => { previewNextPoNumber().then(setPoPreview) }, [])

// //   async function loadAllVendors(forceRefresh = false) {
// //     // Only show the loading state when there is nothing cached to display.
// //     const hasCache = formCache.farmers.length > 0 || formCache.zohoVendors.length > 0
// //     if (!hasCache || forceRefresh) setLoadingVendors(true)
// //     try {
// //       const local = await getAllFarmers()
// //       formCache.farmers = local
// //       setFarmerOptions(local)

// //       const zoho = await fetchZohoVendors(forceRefresh)
// //       formCache.zohoVendors = zoho
// //       setZohoVendors(zoho)
// //       setError('')
// //     } catch (loadError) {
// //       setError(loadError instanceof Error ? loadError.message : 'Unable to load Zoho vendors.')
// //     } finally {
// //       setLoadingVendors(false)
// //     }
// //   }

// //   async function loadAllItems(forceRefresh = false) {
// //     const hasCache = formCache.localItems.length > 0 || formCache.zohoItems.length > 0
// //     if (!hasCache || forceRefresh) setLoadingItems(true)
// //     try {
// //       const local = await getAllItems()
// //       formCache.localItems = local
// //       setLocalItems(local)

// //       const zoho = await fetchZohoItems(forceRefresh)
// //       formCache.zohoItems = zoho
// //       setZohoItems(zoho)
// //     } catch (loadError) {
// //       setError(loadError instanceof Error ? loadError.message : 'Unable to load Zoho items.')
// //     } finally {
// //       setLoadingItems(false)
// //     }
// //   }

// //   useEffect(() => { loadAllVendors() }, [])
// //   useEffect(() => { loadAllItems() }, [])
  
// //   const localZohoIds = new Set(
// //     farmerOptions.map((f) => (f as Farmer & { zoho_contact_id?: string }).zoho_contact_id).filter(Boolean)
// //   )

// //   const zohoVendorMatchesLocal = (vendor: ZohoVendor, farmer: Farmer): boolean => {
// //     if (localZohoIds.has(vendor.zoho_contact_id)) {
// //       return (farmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id === vendor.zoho_contact_id
// //     }
// //     const nameMatches = normalizeName(farmer.name ?? '') === normalizeName(vendor.name)
// //     const targetPhone = normalizePhone(vendor.phone)
// //     const phoneMatches = targetPhone !== null && normalizePhone(farmer.mobile) === targetPhone
// //     return nameMatches || phoneMatches
// //   }

// //   const unmatchedZohoVendors = zohoVendors.filter(
// //     (v) => !farmerOptions.some((f) => zohoVendorMatchesLocal(v, f))
// //   )

// //   const combinedOptions: CombinedVendorOption[] = [
// //     ...farmerOptions.map((f) => ({
// //       type: 'local' as const,
// //       id: f.id,
// //       name: f.name,
// //       village: f.village ?? null,
// //       phone: f.mobile ?? null,
// //       linkedToZoho: !!(f as Farmer & { zoho_contact_id?: string }).zoho_contact_id,
// //       raw: f,
// //     })),
// //     ...unmatchedZohoVendors.map((v) => ({
// //       type: 'zoho' as const,
// //       id: v.zoho_contact_id,
// //       name: v.name,
// //       village: v.company_name,
// //       phone: v.phone,
// //       linkedToZoho: true,
// //       raw: v,
// //     })),
// //   ]

// //   const selectedOption: CombinedVendorOption | null = selectedFarmer
// //     ? {
// //         type: 'local',
// //         id: selectedFarmer.id,
// //         name: selectedFarmer.name,
// //         village: selectedFarmer.village ?? null,
// //         phone: selectedFarmer.mobile ?? null,
// //         linkedToZoho: !!(selectedFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id,
// //         raw: selectedFarmer,
// //       }
// //     : null

// //   const availableItems: Item[] = zohoItems.map((zohoItem) => {
// //     const localItem = localItems.find((item) => item.zoho_item_id === zohoItem.zoho_item_id)

// //     if (localItem) {
// //       return { ...localItem, name: zohoItem.name }
// //     }

// //     return {
// //       id: `zoho:${zohoItem.zoho_item_id}`,
// //       name: zohoItem.name,
// //       default_rate: zohoItem.rate,
// //       default_gst_percent: 0,
// //       zoho_item_id: zohoItem.zoho_item_id,
// //       purchase_rate: zohoItem.purchase_rate,
// //     }
// //   })

// //   async function handleResolveZohoItem(matched: Item): Promise<Item | null> {
// //     if (!matched.zoho_item_id) return null
// //     const resolved = await resolveZohoItem({
// //       zoho_item_id: matched.zoho_item_id,
// //       name: matched.name,
// //       unit: null,
// //       rate: matched.default_rate,
// //       purchase_rate: matched.purchase_rate ?? 0,
// //       category: null,
// //       active: true,
// //     })
// //     if (resolved) {
// //       setLocalItems((prev) => [...prev, resolved])
// //     }
// //     return resolved
// //   }

// //   function handleItemChange(index: number, updated: OrderItem) {
// //     const newItems = [...orderItems]
// //     newItems[index] = updated
// //     setOrderItems(newItems)
// //   }

// //   function handleRemoveItem(index: number) {
// //     if (orderItems.length === 1) return
// //     setOrderItems(orderItems.filter((_, i) => i !== index))
// //   }

// //   function handleAddItem() {
// //     setOrderItems([...orderItems, { ...emptyItem }])
// //   }

// //   const { subtotal, total_tax, grand_total } = calculateOrderTotals(orderItems)
// //   const hasInvalidItem = orderItems.some((i) => i.item_name && !i.item_id)

// //   const orderDateStr = new Date().toLocaleDateString('en-IN', {
// //     month: 'short', day: 'numeric', year: 'numeric',
// //   })

// //   async function handleVendorChange(value: CombinedVendorOption | null) {
// //     if (!value) {
// //       setSelectedFarmer(null)
// //       return
// //     }
// //     if (value.type === 'local') {
// //       const localFarmer = value.raw as Farmer
// //       const isLinked = !!(localFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id

// //       if (isLinked) {
// //         setSelectedFarmer(localFarmer)
// //         return
// //       }

// //       const match = zohoVendors.find((v) => zohoVendorMatchesLocal(v, localFarmer))
// //       if (match) {
// //         setResolvingVendor(true)
// //         const resolved = await resolveZohoFarmer(match)
// //         setResolvingVendor(false)
// //         if (resolved) {
// //           setSelectedFarmer(resolved)
// //           setFarmerOptions((prev) => prev.map((f) => (f.id === resolved.id ? resolved : f)))
// //         } else {
// //           setError('Failed to link this vendor to Zoho. Please try again.')
// //         }
// //         return
// //       }

// //       setSelectedFarmer(localFarmer)
// //     } else {
// //       setResolvingVendor(true)
// //       const resolved = await resolveZohoFarmer(value.raw as ZohoVendor)
// //       setResolvingVendor(false)
// //       if (resolved) {
// //         setSelectedFarmer(resolved)
// //         setFarmerOptions((prev) => {
// //           const exists = prev.some((f) => f.id === resolved.id)
// //           return exists ? prev.map((f) => (f.id === resolved.id ? resolved : f)) : [...prev, resolved]
// //         })
// //       } else {
// //         setError('Failed to link Zoho vendor. Please try again.')
// //       }
// //     }
// //   }

// //   async function handleSave() {
// //     if (!selectedFarmer) { setError('Please select a vendor / farmer'); return }

// //     const isLinkedToZoho = !!(selectedFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id
// //     if (!isLinkedToZoho) {
// //       setError(
// //         `"${selectedFarmer.name}" isn't linked to a Zoho contact, so this order can't be uploaded to Zoho Books. Please re-select them from the list, or use "Add New Farmer" if they're genuinely new.`
// //       )
// //       return
// //     }

// //     const validItems = orderItems.filter((item) => item.item_name && item.quantity > 0 && item.rate > 0)
// //     if (validItems.length === 0) {
// //       setError('Please add at least one item with quantity and rate')
// //       return
// //     }
// //     if (hasInvalidItem) {
// //       setError('One or more items are not in the master list. Please review before saving.')
// //       return
// //     }
// //     if (!user) return
// //     setLoading(true)
// //     setError('')
// //     const result = await createPurchaseOrder({
// //       farmer_id: selectedFarmer.id,
// //       created_by: user.id,
// //       grand_total,
// //       subtotal,
// //       total_tax,
// //       notes,
// //       items: validItems,
// //     })
// //     if (!result) {
// //       setError('Failed to save. Please try again.')
// //       setLoading(false)
// //       return
// //     }
// //     navigate(`/purchase-orders/success/${result.po_number}`, {
// //       state: { po_id: result.id, po_number: result.po_number, farmer: selectedFarmer, items: validItems, subtotal, total_tax, grand_total, notes },
// //     })
// //   }

// //   return (
// //     <Layout maxWidth={false}>
// //     <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
// //       <Box sx={{
// //         bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.2,
// //         display: 'flex', alignItems: 'center', gap: 1, position: 'sticky', top: 0, zIndex: 100,
// //       }}>
// //         <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ color: '#004B8B' }}>
// //           <ArrowBackIcon />
// //         </IconButton>
// //         <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 16 }}>Purchase order</Typography>
// //       </Box>

// //       <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 3, pb: 6 }}>
// //         <Box sx={{ mb: 3 }}>
// //           <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 0.5 }}>
// //             New Purchase Order
// //           </Typography>
// //           <Typography variant="body2" sx={{ color: '#6B7280' }}>
// //             Enter vendor details and line items below.
// //           </Typography>
// //         </Box>

// //         {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

// //         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
// //           <Box sx={{ p: 2.5 }}>
// //             <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15, mb: 2 }}>
// //               Vendor Information
// //             </Typography>

// //             <Box sx={{ mb: 1 }}>
// //               <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.8 }}>
// //                 Vendor *
// //               </Typography>

// //               <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
// //                 <Autocomplete
// //                   fullWidth
// //                   options={combinedOptions}
// //                   loading={loadingVendors}
// //                   value={selectedOption}
// //                   getOptionLabel={(option) =>
// //                     `${option.name}${option.village ? ` — ${option.village}` : ''}`
// //                   }
// //                   getOptionKey={(option) => option.id}
// //                   isOptionEqualToValue={(option, value) => option.id === value.id}
// //                   onChange={(_, value) => handleVendorChange(value)}
// //                   filterOptions={(options, state) => {
// //                     const query = state.inputValue.toLowerCase().trim()
// //                     if (!query) return options
// //                     return options.filter((opt) =>
// //                       opt.name.toLowerCase().includes(query) ||
// //                       (opt.phone ?? '').toLowerCase().includes(query) ||
// //                       (opt.village ?? '').toLowerCase().includes(query)
// //                     )
// //                   }}
// //                   renderOption={(props, option) => (
// //                     <Box component="li" {...props} key={option.id} sx={{ display: 'block !important', py: 1 }}>
// //                       <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E' }}>
// //                         {option.name}
// //                       </Typography>
// //                       {(option.village || option.phone) && (
// //                         <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
// //                           {[option.village, option.phone].filter(Boolean).join(' · ')}
// //                         </Typography>
// //                       )}
// //                     </Box>
// //                   )}
// //                   noOptionsText="No farmers found"
// //                   renderInput={(params) => (
// //                     <TextField
// //                       {...params}
// //                       placeholder={resolvingVendor ? 'Linking vendor...' : 'Search name or phone...'}
// //                       size="small"
// //                       sx={{
// //                         '& .MuiOutlinedInput-root': {
// //                           bgcolor: 'white', borderRadius: 2,
// //                           border: '1px solid #E5E7EB', '& fieldset': { border: 'none' },
// //                         },
// //                       }}
// //                     />
// //                   )}
// //                 />
// //                 <IconButton
// //                   onClick={() => loadAllVendors(true)}
// //                   disabled={loadingVendors}
// //                   sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 2, mt: 0.2 }}
// //                 >
// //                   <RefreshIcon sx={{ color: '#004B8B' }} />
// //                 </IconButton>
// //               </Box>
// //             </Box>

// //             <Box sx={{ textAlign: 'center', mb: 1 }}>
// //               <Button
// //                 size="small"
// //                 startIcon={<AddIcon />}
// //                 onClick={() => setShowAddFarmer(true)}
// //                 sx={{ mt: 0.8, color: '#004B8B', fontSize: 12, fontWeight: 600 }}
// //               >
// //                 Add New Farmer
// //               </Button>
// //             </Box>

// //             <Divider sx={{ my: 1.5 }} />

// //             <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
// //               <Box>
// //                 <Typography variant="caption" sx={{ color: '#6B7280' }}>Order Date</Typography>
// //                 <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontSize: 14 }}>{orderDateStr}</Typography>
// //               </Box>
// //               <Box>
// //                 <Typography variant="caption" sx={{ color: '#6B7280' }}>PO Number</Typography>
// //                 <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontSize: 14 }}>{poPreview}</Typography>
// //               </Box>
// //             </Box>
// //           </Box>
// //         </Paper>

// //         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
// //           <Box sx={{ p: 2.5 }}>
// //             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
// //               <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15 }}>Line Items</Typography>
// //               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
// //                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
// //                   <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: hasInvalidItem ? '#EF4444' : '#00BD67' }} />
// //                   <Typography variant="caption" sx={{ color: hasInvalidItem ? '#EF4444' : '#00BD67', fontWeight: 600 }}>
// //                     {hasInvalidItem ? 'Validation Errors' : 'Strict Validation Active'}
// //                   </Typography>
// //                 </Box>
// //                 <IconButton
// //                   onClick={() => loadAllItems(true)}
// //                   disabled={loadingItems}
// //                   size="small"
// //                   sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 1.5 }}
// //                 >
// //                   <RefreshIcon sx={{ color: '#004B8B', fontSize: 18 }} />
// //                 </IconButton>
// //               </Box>
// //             </Box>

// //             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
// //               {orderItems.map((item, index) => (
// //                 <ItemRow key={index} index={index} item={item} availableItems={availableItems}
// //                   onChange={handleItemChange} onRemove={handleRemoveItem}
// //                   onResolveZohoItem={handleResolveZohoItem} loadingItems={loadingItems} />
// //               ))}
// //             </Box>

// //             <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem}
// //               sx={{ mt: 2, borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, px: 2.5,
// //                 '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}>
// //               Add Row
// //             </Button>

// //             <Divider sx={{ my: 2 }} />

// //             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
// //               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Subtotal</Typography>
// //               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
// //                 ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
// //               </Typography>
// //             </Box>
// //             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
// //               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Tax</Typography>
// //               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
// //                 ₹ {total_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
// //               </Typography>
// //             </Box>
// //             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
// //               <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>Grand Total</Typography>
// //               <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 20 }}>
// //                 ₹ {grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
// //               </Typography>
// //             </Box>
// //           </Box>
// //         </Paper>

// //         <Box sx={{ mb: 3 }}>
// //           <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1 }}>
// //             PO Comments / Terms
// //           </Typography>
// //           <TextField
// //             multiline rows={3} fullWidth placeholder="Add any special instructions or terms for this order..."
// //             value={notes} onChange={(e) => setNotes(e.target.value)}
// //             sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2, border: '1px solid #E5E7EB', '& fieldset': { border: 'none' }, fontSize: 14 } }}
// //           />
// //         </Box>

// //         <Box sx={{ position: 'sticky', bottom: 0, bgcolor: '#EEF2FF', pt: 1, pb: 2, display: 'flex', gap: 1.5 }}>
// //           <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')}
// //             sx={{ flex: 1, borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white',
// //               '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>
// //             Cancel
// //           </Button>
// //           <Button
// //             variant="contained" size="large"
// //             startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
// //             onClick={handleSave} disabled={loading}
// //             sx={{ flex: 2, bgcolor: '#004B8B', borderRadius: 3, py: 1.5, fontWeight: 600, fontSize: 15,
// //               '&:hover': { bgcolor: '#003666' }, '&.Mui-disabled': { bgcolor: '#93A8C4', color: 'white' } }}>
// //             {loading ? 'Saving...' : 'Save PO'}
// //           </Button>
// //         </Box>
// //       </Box>

// //       <AddFarmerDialog
// //         open={showAddFarmer}
// //         onClose={() => setShowAddFarmer(false)}
// //         onFarmerAdded={(farmer) => {
// //           setSelectedFarmer(farmer)
// //           setFarmerOptions((prev) => [...prev, farmer])
// //           setShowAddFarmer(false)
// //         }}
// //       />
// //     </Box>
// //     </Layout>
// //   )
// // }
// import { useState, useEffect } from 'react'
// import {
//   Box, Button, TextField, Typography, Paper, CircularProgress, Alert,
//   Autocomplete, IconButton, Divider,
// } from '@mui/material'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// import AddIcon from '@mui/icons-material/Add'
// import SaveIcon from '@mui/icons-material/Save'
// import RefreshIcon from '@mui/icons-material/Refresh'
// import { useNavigate, useLocation } from 'react-router-dom'
// import { useAuthContext } from '../../auth/AuthContext'
// import { getAllFarmers } from '../../farmers/api/farmersApi'
// import { getAllItems } from '../../items/api/itemsApi'
// import {
//   createPurchaseOrder,
//   previewNextPoNumber,
//   fetchPurchaseOrderForEdit,
//   updatePurchaseOrder,
// } from '../api/purchaseOrdersApi'
// import { AddFarmerDialog } from '../../farmers/components/AddFarmerDialog'
// import { ItemRow } from './ItemRow'
// import { calculateOrderTotals } from '../utils/calculateTotals'
// import type { OrderItem } from '../utils/calculateTotals'
// import type { Farmer, Item } from '../../../shared/types'
// import { fetchZohoVendors, fetchZohoItems } from '../api/zohoApi'
// import type { ZohoVendor, ZohoItem } from '../api/zohoApi'
// import { resolveZohoFarmer } from '../../farmers/api/resolveZohoFarmer'
// import { resolveZohoItem } from '../../items/api/resolveZohoItem'
// import { Layout } from '../../../shared/components/Layout'

// const emptyItem: OrderItem = {
//   item_id: '', item_name: '', quantity: 0, rate: 0, amount: 0, row_comment: '', unit: 'Kg', gst_percent: 0, gst_amount: 0,
// }

// interface CombinedVendorOption {
//   type: 'local' | 'zoho'
//   id: string
//   name: string
//   village: string | null
//   phone: string | null
//   linkedToZoho: boolean
//   raw: Farmer | ZohoVendor
// }

// function normalizeName(name: string): string {
//   return name.trim().toLowerCase().replace(/\s+/g, ' ')
// }

// function normalizePhone(phone: string | null | undefined): string | null {
//   if (!phone) return null
//   const digits = phone.replace(/\D/g, '')
//   return digits.length >= 10 ? digits.slice(-10) : digits || null
// }

// // Module-level cache: survives leaving and re-entering this page, so the
// // vendor and item lists show instantly and refresh silently in the background.
// const formCache: {
//   farmers: Farmer[]
//   zohoVendors: ZohoVendor[]
//   localItems: Item[]
//   zohoItems: ZohoItem[]
// } = {
//   farmers: [],
//   zohoVendors: [],
//   localItems: [],
//   zohoItems: [],
// }

// export function NewPurchaseForm() {
//   const { user } = useAuthContext()
//   const navigate = useNavigate()
//   const location = useLocation()

//   // When opened with { editPoId } this form edits an existing purchase order.
//   const editPoId: string | null = (location.state as { editPoId?: string } | null)?.editPoId ?? null
//   const isEditMode = !!editPoId

//   const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
//   const [showAddFarmer, setShowAddFarmer] = useState(false)
//   const [orderItems, setOrderItems] = useState<OrderItem[]>([{ ...emptyItem }])
//   const [notes, setNotes] = useState('')
//   const [poPreview, setPoPreview] = useState('PO-XXXX-XXXX')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const [editLoaded, setEditLoaded] = useState(false)
//   const [editBlocked, setEditBlocked] = useState(false)
//   const [editCreatedAt, setEditCreatedAt] = useState<string | null>(null)

//   const [farmerOptions, setFarmerOptions] = useState<Farmer[]>(formCache.farmers)
//   const [zohoVendors, setZohoVendors] = useState<ZohoVendor[]>(formCache.zohoVendors)
//   const [loadingVendors, setLoadingVendors] = useState(false)
//   const [resolvingVendor, setResolvingVendor] = useState(false)

//   const [localItems, setLocalItems] = useState<Item[]>(formCache.localItems)
//   const [zohoItems, setZohoItems] = useState<ZohoItem[]>(formCache.zohoItems)
//   const [loadingItems, setLoadingItems] = useState(false)
//   const [itemsLoadedOnce, setItemsLoadedOnce] = useState(formCache.zohoItems.length > 0)

//   useEffect(() => {
//     if (!isEditMode) previewNextPoNumber().then(setPoPreview)
//   }, [isEditMode])

//   // Load the existing order when editing
//   useEffect(() => {
//     if (!editPoId) return
//     let cancelled = false

//     async function loadExisting() {
//       const po = await fetchPurchaseOrderForEdit(editPoId as string)
//       if (cancelled) return

//       if (!po) {
//         setError('Could not load this purchase order.')
//         setEditBlocked(true)
//         setEditLoaded(true)
//         return
//       }

//       if (po.zoho_po_id) {
//         setError('This purchase order is already uploaded to Zoho and cannot be edited.')
//         setEditBlocked(true)
//       }

//       const loadedItems: OrderItem[] = (po.items ?? []).map((li: any) => {
//         const quantity = Number(li.quantity) || 0
//         const rate = Number(li.rate) || 0
//         const amount = li.amount != null ? Number(li.amount) : Math.round(quantity * rate * 100) / 100
//         const gst_percent = li.gst_percent != null ? Number(li.gst_percent) : 0
//         const gst_amount =
//           li.gst_amount != null
//             ? Number(li.gst_amount)
//             : Math.round((amount * gst_percent / 100) * 100) / 100

//         return {
//           item_id: li.item_id ?? '',
//           item_name: li.item_name ?? '',
//           quantity,
//           rate,
//           amount,
//           row_comment: '',
//           unit: 'Kg',
//           gst_percent,
//           gst_amount,
//           is_manual: false,
//         }
//       })

//       setSelectedFarmer(po.farmer ?? null)
//       setOrderItems(loadedItems.length > 0 ? loadedItems : [{ ...emptyItem }])
//       setNotes(po.notes ?? '')
//       setPoPreview(po.po_number)
//       setEditCreatedAt(po.created_at)
//       setEditLoaded(true)
//     }

//     loadExisting()
//     return () => { cancelled = true }
//   }, [editPoId])

//   async function loadAllVendors(forceRefresh = false) {
//     // Only show the loading state when there is nothing cached to display.
//     const hasCache = formCache.farmers.length > 0 || formCache.zohoVendors.length > 0
//     if (!hasCache || forceRefresh) setLoadingVendors(true)
//     try {
//       const local = await getAllFarmers()
//       formCache.farmers = local
//       setFarmerOptions(local)

//       const zoho = await fetchZohoVendors(forceRefresh)
//       formCache.zohoVendors = zoho
//       setZohoVendors(zoho)
//       setError((prev) => (isEditMode ? prev : ''))
//     } catch (loadError) {
//       setError(loadError instanceof Error ? loadError.message : 'Unable to load Zoho vendors.')
//     } finally {
//       setLoadingVendors(false)
//     }
//   }

//   async function loadAllItems(forceRefresh = false) {
//     const hasCache = formCache.localItems.length > 0 || formCache.zohoItems.length > 0
//     if (!hasCache || forceRefresh) setLoadingItems(true)
//     try {
//       const local = await getAllItems()
//       formCache.localItems = local
//       setLocalItems(local)

//       const zoho = await fetchZohoItems(forceRefresh)
//       formCache.zohoItems = zoho
//       setZohoItems(zoho)
//     } catch (loadError) {
//       setError(loadError instanceof Error ? loadError.message : 'Unable to load Zoho items.')
//     } finally {
//       setLoadingItems(false)
//       setItemsLoadedOnce(true)
//     }
//   }

//   useEffect(() => { loadAllVendors() }, [])
//   useEffect(() => { loadAllItems() }, [])
  
//   const localZohoIds = new Set(
//     farmerOptions.map((f) => (f as Farmer & { zoho_contact_id?: string }).zoho_contact_id).filter(Boolean)
//   )

//   const zohoVendorMatchesLocal = (vendor: ZohoVendor, farmer: Farmer): boolean => {
//     if (localZohoIds.has(vendor.zoho_contact_id)) {
//       return (farmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id === vendor.zoho_contact_id
//     }
//     const nameMatches = normalizeName(farmer.name ?? '') === normalizeName(vendor.name)
//     const targetPhone = normalizePhone(vendor.phone)
//     const phoneMatches = targetPhone !== null && normalizePhone(farmer.mobile) === targetPhone
//     return nameMatches || phoneMatches
//   }

//   const unmatchedZohoVendors = zohoVendors.filter(
//     (v) => !farmerOptions.some((f) => zohoVendorMatchesLocal(v, f))
//   )

//   const combinedOptions: CombinedVendorOption[] = [
//     ...farmerOptions.map((f) => ({
//       type: 'local' as const,
//       id: f.id,
//       name: f.name,
//       village: f.village ?? null,
//       phone: f.mobile ?? null,
//       linkedToZoho: !!(f as Farmer & { zoho_contact_id?: string }).zoho_contact_id,
//       raw: f,
//     })),
//     ...unmatchedZohoVendors.map((v) => ({
//       type: 'zoho' as const,
//       id: v.zoho_contact_id,
//       name: v.name,
//       village: v.company_name,
//       phone: v.phone,
//       linkedToZoho: true,
//       raw: v,
//     })),
//   ]

//   const selectedOption: CombinedVendorOption | null = selectedFarmer
//     ? {
//         type: 'local',
//         id: selectedFarmer.id,
//         name: selectedFarmer.name,
//         village: selectedFarmer.village ?? null,
//         phone: selectedFarmer.mobile ?? null,
//         linkedToZoho: !!(selectedFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id,
//         raw: selectedFarmer,
//       }
//     : null

//   const availableItems: Item[] = zohoItems.map((zohoItem) => {
//     const localItem = localItems.find((item) => item.zoho_item_id === zohoItem.zoho_item_id)

//     if (localItem) {
//       return { ...localItem, name: zohoItem.name }
//     }

//     return {
//       id: `zoho:${zohoItem.zoho_item_id}`,
//       name: zohoItem.name,
//       default_rate: zohoItem.rate,
//       default_gst_percent: 0,
//       zoho_item_id: zohoItem.zoho_item_id,
//       purchase_rate: zohoItem.purchase_rate,
//     }
//   })

//   async function handleResolveZohoItem(matched: Item): Promise<Item | null> {
//     if (!matched.zoho_item_id) return null
//     const resolved = await resolveZohoItem({
//       zoho_item_id: matched.zoho_item_id,
//       name: matched.name,
//       unit: null,
//       rate: matched.default_rate,
//       purchase_rate: matched.purchase_rate ?? 0,
//       category: null,
//       active: true,
//     })
//     if (resolved) {
//       setLocalItems((prev) => [...prev, resolved])
//     }
//     return resolved
//   }

//   function handleItemChange(index: number, updated: OrderItem) {
//     const newItems = [...orderItems]
//     newItems[index] = updated
//     setOrderItems(newItems)
//   }

//   function handleRemoveItem(index: number) {
//     if (orderItems.length === 1) return
//     setOrderItems(orderItems.filter((_, i) => i !== index))
//   }

//   function handleAddItem() {
//     setOrderItems([...orderItems, { ...emptyItem }])
//   }

//   const { subtotal, total_tax, grand_total } = calculateOrderTotals(orderItems)
//   const hasInvalidItem = orderItems.some((i) => i.item_name && !i.item_id)

//   const orderDateStr = (editCreatedAt ? new Date(editCreatedAt) : new Date()).toLocaleDateString('en-IN', {
//     month: 'short', day: 'numeric', year: 'numeric',
//   })

//   // In edit mode, wait until the saved order AND the item list are loaded,
//   // so the item rows start with the correct saved values.
//   const itemsReady = !isEditMode || (editLoaded && itemsLoadedOnce)

//   async function handleVendorChange(value: CombinedVendorOption | null) {
//     if (!value) {
//       setSelectedFarmer(null)
//       return
//     }
//     if (value.type === 'local') {
//       const localFarmer = value.raw as Farmer
//       const isLinked = !!(localFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id

//       if (isLinked) {
//         setSelectedFarmer(localFarmer)
//         return
//       }

//       const match = zohoVendors.find((v) => zohoVendorMatchesLocal(v, localFarmer))
//       if (match) {
//         setResolvingVendor(true)
//         const resolved = await resolveZohoFarmer(match)
//         setResolvingVendor(false)
//         if (resolved) {
//           setSelectedFarmer(resolved)
//           setFarmerOptions((prev) => prev.map((f) => (f.id === resolved.id ? resolved : f)))
//         } else {
//           setError('Failed to link this vendor to Zoho. Please try again.')
//         }
//         return
//       }

//       setSelectedFarmer(localFarmer)
//     } else {
//       setResolvingVendor(true)
//       const resolved = await resolveZohoFarmer(value.raw as ZohoVendor)
//       setResolvingVendor(false)
//       if (resolved) {
//         setSelectedFarmer(resolved)
//         setFarmerOptions((prev) => {
//           const exists = prev.some((f) => f.id === resolved.id)
//           return exists ? prev.map((f) => (f.id === resolved.id ? resolved : f)) : [...prev, resolved]
//         })
//       } else {
//         setError('Failed to link Zoho vendor. Please try again.')
//       }
//     }
//   }

//   function handleBack() {
//     if (isEditMode) navigate(-1)
//     else navigate('/dashboard')
//   }

//   async function handleSave() {
//     if (editBlocked) return
//     if (!selectedFarmer) { setError('Please select a vendor / farmer'); return }

//     const isLinkedToZoho = !!(selectedFarmer as Farmer & { zoho_contact_id?: string }).zoho_contact_id
//     if (!isLinkedToZoho) {
//       setError(
//         `"${selectedFarmer.name}" isn't linked to a Zoho contact, so this order can't be uploaded to Zoho Books. Please re-select them from the list, or use "Add New Farmer" if they're genuinely new.`
//       )
//       return
//     }

//     const validItems = orderItems.filter((item) => item.item_name && item.quantity > 0 && item.rate > 0)
//     if (validItems.length === 0) {
//       setError('Please add at least one item with quantity and rate')
//       return
//     }
//     if (hasInvalidItem) {
//       setError('One or more items are not in the master list. Please review before saving.')
//       return
//     }
//     if (!user) return
//     setLoading(true)
//     setError('')

//     // ---- EDIT: update the existing order and keep its PO number ----
//     if (isEditMode && editPoId) {
//       const result = await updatePurchaseOrder(editPoId, {
//         farmer_id: selectedFarmer.id,
//         grand_total,
//         subtotal,
//         total_tax,
//         notes,
//         items: validItems,
//       })
//       if (!result.success) {
//         setError(result.error ?? 'Failed to update. Please try again.')
//         setLoading(false)
//         return
//       }
//       navigate(`/purchase-orders/success/${poPreview}`, {
//         replace: true,
//         state: { po_id: editPoId, po_number: poPreview, farmer: selectedFarmer, items: validItems, subtotal, total_tax, grand_total, notes },
//       })
//       return
//     }

//     // ---- CREATE: new order ----
//     const result = await createPurchaseOrder({
//       farmer_id: selectedFarmer.id,
//       created_by: user.id,
//       grand_total,
//       subtotal,
//       total_tax,
//       notes,
//       items: validItems,
//     })
//     if (!result) {
//       setError('Failed to save. Please try again.')
//       setLoading(false)
//       return
//     }
//     navigate(`/purchase-orders/success/${result.po_number}`, {
//       state: { po_id: result.id, po_number: result.po_number, farmer: selectedFarmer, items: validItems, subtotal, total_tax, grand_total, notes },
//     })
//   }

//   return (
//     <Layout maxWidth={false}>
//     <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
//       <Box sx={{
//         bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.2,
//         display: 'flex', alignItems: 'center', gap: 1, position: 'sticky', top: 0, zIndex: 100,
//       }}>
//         <IconButton onClick={handleBack} size="small" sx={{ color: '#004B8B' }}>
//           <ArrowBackIcon />
//         </IconButton>
//         <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 16 }}>Purchase order</Typography>
//       </Box>

//       <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 3, pb: 6 }}>
//         <Box sx={{ mb: 3 }}>
//           <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 0.5 }}>
//             {isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
//           </Typography>
//           <Typography variant="body2" sx={{ color: '#6B7280' }}>
//             {isEditMode
//               ? 'Change the vendor, items or notes, then update the order.'
//               : 'Enter vendor details and line items below.'}
//           </Typography>
//         </Box>

//         {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

//         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
//           <Box sx={{ p: 2.5 }}>
//             <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15, mb: 2 }}>
//               Vendor Information
//             </Typography>

//             <Box sx={{ mb: 1 }}>
//               <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.8 }}>
//                 Vendor *
//               </Typography>

//               <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
//                 <Autocomplete
//                   fullWidth
//                   options={combinedOptions}
//                   loading={loadingVendors}
//                   value={selectedOption}
//                   getOptionLabel={(option) =>
//                     `${option.name}${option.village ? ` — ${option.village}` : ''}`
//                   }
//                   getOptionKey={(option) => option.id}
//                   isOptionEqualToValue={(option, value) => option.id === value.id}
//                   onChange={(_, value) => handleVendorChange(value)}
//                   filterOptions={(options, state) => {
//                     const query = state.inputValue.toLowerCase().trim()
//                     if (!query) return options
//                     return options.filter((opt) =>
//                       opt.name.toLowerCase().includes(query) ||
//                       (opt.phone ?? '').toLowerCase().includes(query) ||
//                       (opt.village ?? '').toLowerCase().includes(query)
//                     )
//                   }}
//                   renderOption={(props, option) => (
//                     <Box component="li" {...props} key={option.id} sx={{ display: 'block !important', py: 1 }}>
//                       <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E' }}>
//                         {option.name}
//                       </Typography>
//                       {(option.village || option.phone) && (
//                         <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
//                           {[option.village, option.phone].filter(Boolean).join(' · ')}
//                         </Typography>
//                       )}
//                     </Box>
//                   )}
//                   noOptionsText="No farmers found"
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       placeholder={resolvingVendor ? 'Linking vendor...' : 'Search name or phone...'}
//                       size="small"
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           bgcolor: 'white', borderRadius: 2,
//                           border: '1px solid #E5E7EB', '& fieldset': { border: 'none' },
//                         },
//                       }}
//                     />
//                   )}
//                 />
//                 <IconButton
//                   onClick={() => loadAllVendors(true)}
//                   disabled={loadingVendors}
//                   sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 2, mt: 0.2 }}
//                 >
//                   <RefreshIcon sx={{ color: '#004B8B' }} />
//                 </IconButton>
//               </Box>
//             </Box>

//             <Box sx={{ textAlign: 'center', mb: 1 }}>
//               <Button
//                 size="small"
//                 startIcon={<AddIcon />}
//                 onClick={() => setShowAddFarmer(true)}
//                 sx={{ mt: 0.8, color: '#004B8B', fontSize: 12, fontWeight: 600 }}
//               >
//                 Add New Farmer
//               </Button>
//             </Box>

//             <Divider sx={{ my: 1.5 }} />

//             <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
//               <Box>
//                 <Typography variant="caption" sx={{ color: '#6B7280' }}>Order Date</Typography>
//                 <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontSize: 14 }}>{orderDateStr}</Typography>
//               </Box>
//               <Box>
//                 <Typography variant="caption" sx={{ color: '#6B7280' }}>PO Number</Typography>
//                 <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontSize: 14 }}>{poPreview}</Typography>
//               </Box>
//             </Box>
//           </Box>
//         </Paper>

//         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
//           <Box sx={{ p: 2.5 }}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//               <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15 }}>Line Items</Typography>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: hasInvalidItem ? '#EF4444' : '#00BD67' }} />
//                   <Typography variant="caption" sx={{ color: hasInvalidItem ? '#EF4444' : '#00BD67', fontWeight: 600 }}>
//                     {hasInvalidItem ? 'Validation Errors' : 'Strict Validation Active'}
//                   </Typography>
//                 </Box>
//                 <IconButton
//                   onClick={() => loadAllItems(true)}
//                   disabled={loadingItems}
//                   size="small"
//                   sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 1.5 }}
//                 >
//                   <RefreshIcon sx={{ color: '#004B8B', fontSize: 18 }} />
//                 </IconButton>
//               </Box>
//             </Box>

//             {itemsReady ? (
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 {orderItems.map((item, index) => (
//                   <ItemRow key={index} index={index} item={item} availableItems={availableItems}
//                     onChange={handleItemChange} onRemove={handleRemoveItem}
//                     onResolveZohoItem={handleResolveZohoItem} loadingItems={loadingItems} />
//                 ))}
//               </Box>
//             ) : (
//               <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//                 <CircularProgress size={28} />
//               </Box>
//             )}

//             <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem}
//               sx={{ mt: 2, borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, px: 2.5,
//                 '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}>
//               Add Row
//             </Button>

//             <Divider sx={{ my: 2 }} />

//             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Subtotal</Typography>
//               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
//                 ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//               </Typography>
//             </Box>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Tax</Typography>
//               <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
//                 ₹ {total_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//               </Typography>
//             </Box>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//               <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>Grand Total</Typography>
//               <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 20 }}>
//                 ₹ {grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//               </Typography>
//             </Box>
//           </Box>
//         </Paper>

//         <Box sx={{ mb: 3 }}>
//           <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1 }}>
//             PO Comments / Terms
//           </Typography>
//           <TextField
//             multiline rows={3} fullWidth placeholder="Add any special instructions or terms for this order..."
//             value={notes} onChange={(e) => setNotes(e.target.value)}
//             sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2, border: '1px solid #E5E7EB', '& fieldset': { border: 'none' }, fontSize: 14 } }}
//           />
//         </Box>

//         <Box sx={{ position: 'sticky', bottom: 0, bgcolor: '#EEF2FF', pt: 1, pb: 2, display: 'flex', gap: 1.5 }}>
//           <Button variant="outlined" size="large" onClick={handleBack}
//             sx={{ flex: 1, borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white',
//               '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained" size="large"
//             startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
//             onClick={handleSave} disabled={loading || editBlocked || (isEditMode && !itemsReady)}
//             sx={{ flex: 2, bgcolor: '#004B8B', borderRadius: 3, py: 1.5, fontWeight: 600, fontSize: 15,
//               '&:hover': { bgcolor: '#003666' }, '&.Mui-disabled': { bgcolor: '#93A8C4', color: 'white' } }}>
//             {loading ? 'Saving...' : isEditMode ? 'Update PO' : 'Save PO'}
//           </Button>
//         </Box>
//       </Box>

//       <AddFarmerDialog
//         open={showAddFarmer}
//         onClose={() => setShowAddFarmer(false)}
//         onFarmerAdded={(farmer) => {
//           setSelectedFarmer(farmer)
//           setFarmerOptions((prev) => [...prev, farmer])
//           setShowAddFarmer(false)
//         }}
//       />
//     </Box>
//     </Layout>
//   )
// }
import { useState, useEffect } from 'react'
import {
  Box, Button, TextField, Typography, Paper, CircularProgress, Alert,
  Autocomplete, IconButton, Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../auth/AuthContext'
import { getAllFarmers } from '../../farmers/api/farmersApi'
import { getAllItems } from '../../items/api/itemsApi'
import {
  createPurchaseOrder,
  previewNextPoNumber,
  fetchPurchaseOrderForEdit,
  updatePurchaseOrder,
} from '../api/purchaseOrdersApi'
import { AddFarmerDialog } from '../../farmers/components/AddFarmerDialog'
import { ItemRow } from './ItemRow'
import { calculateOrderTotals } from '../utils/calculateTotals'
import type { OrderItem } from '../utils/calculateTotals'
import type { Farmer, Item } from '../../../shared/types'
import { fetchZohoVendors, fetchZohoItems } from '../api/zohoApi'
import type { ZohoVendor, ZohoItem } from '../api/zohoApi'
import { resolveZohoFarmer } from '../../farmers/api/resolveZohoFarmer'
import { resolveZohoItem } from '../../items/api/resolveZohoItem'
import { Layout } from '../../../shared/components/Layout'

const emptyItem: OrderItem = {
  item_id: '', item_name: '', quantity: 0, rate: 0, amount: 0, row_comment: '', unit: 'Kg', gst_percent: 0, gst_amount: 0,
}

type FarmerWithZoho = Farmer & { zoho_contact_id?: string | null }

interface VendorOption {
  type: 'zoho' | 'local'
  id: string
  name: string
  secondary: string | null
  phone: string | null
  raw: ZohoVendor | Farmer
}

function normalizeName(name: string | null | undefined): string {
  return (name ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : digits
}

// Shows a second line only when it adds something (not the same as the name).
function secondaryLine(name: string, ...parts: Array<string | null | undefined>): string | null {
  const text = parts
    .filter((p): p is string => !!p && normalizeName(p) !== normalizeName(name))
    .join(' · ')
  return text || null
}

// Module-level cache: survives leaving and re-entering this page, so the
// vendor and item lists show instantly and refresh silently in the background.
const formCache: {
  farmers: Farmer[]
  zohoVendors: ZohoVendor[]
  localItems: Item[]
  zohoItems: ZohoItem[]
} = {
  farmers: [],
  zohoVendors: [],
  localItems: [],
  zohoItems: [],
}

export function NewPurchaseForm() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  // When opened with { editPoId } this form edits an existing purchase order.
  const editPoId: string | null = (location.state as { editPoId?: string } | null)?.editPoId ?? null
  const isEditMode = !!editPoId

  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null)
  const [showAddFarmer, setShowAddFarmer] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ ...emptyItem }])
  const [notes, setNotes] = useState('')
  const [poPreview, setPoPreview] = useState('PO-XXXX-XXXX')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [editLoaded, setEditLoaded] = useState(false)
  const [editBlocked, setEditBlocked] = useState(false)
  const [editCreatedAt, setEditCreatedAt] = useState<string | null>(null)

  const [farmerOptions, setFarmerOptions] = useState<Farmer[]>(formCache.farmers)
  const [zohoVendors, setZohoVendors] = useState<ZohoVendor[]>(formCache.zohoVendors)
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [resolvingVendor, setResolvingVendor] = useState(false)

  const [localItems, setLocalItems] = useState<Item[]>(formCache.localItems)
  const [zohoItems, setZohoItems] = useState<ZohoItem[]>(formCache.zohoItems)
  const [loadingItems, setLoadingItems] = useState(false)
  const [itemsLoadedOnce, setItemsLoadedOnce] = useState(formCache.zohoItems.length > 0)

  useEffect(() => {
    if (!isEditMode) previewNextPoNumber().then(setPoPreview)
  }, [isEditMode])

  // Load the existing order when editing
  useEffect(() => {
    if (!editPoId) return
    let cancelled = false

    async function loadExisting() {
      const po = await fetchPurchaseOrderForEdit(editPoId as string)
      if (cancelled) return

      if (!po) {
        setError('Could not load this purchase order.')
        setEditBlocked(true)
        setEditLoaded(true)
        return
      }

      if (po.zoho_po_id) {
        setError('This purchase order is already uploaded to Zoho and cannot be edited.')
        setEditBlocked(true)
      }

      const loadedItems: OrderItem[] = (po.items ?? []).map((li: any) => {
        const quantity = Number(li.quantity) || 0
        const rate = Number(li.rate) || 0
        const amount = li.amount != null ? Number(li.amount) : Math.round(quantity * rate * 100) / 100
        const gst_percent = li.gst_percent != null ? Number(li.gst_percent) : 0
        const gst_amount =
          li.gst_amount != null
            ? Number(li.gst_amount)
            : Math.round((amount * gst_percent / 100) * 100) / 100

        return {
          item_id: li.item_id ?? '',
          item_name: li.item_name ?? '',
          quantity,
          rate,
          amount,
          row_comment: '',
          unit: 'Kg',
          gst_percent,
          gst_amount,
          is_manual: false,
        }
      })

      setSelectedFarmer(po.farmer ?? null)
      setOrderItems(loadedItems.length > 0 ? loadedItems : [{ ...emptyItem }])
      setNotes(po.notes ?? '')
      setPoPreview(po.po_number)
      setEditCreatedAt(po.created_at)
      setEditLoaded(true)
    }

    loadExisting()
    return () => { cancelled = true }
  }, [editPoId])

  async function loadAllVendors(forceRefresh = false) {
    // Only show the loading state when there is nothing cached to display.
    const hasCache = formCache.farmers.length > 0 || formCache.zohoVendors.length > 0
    if (!hasCache || forceRefresh) setLoadingVendors(true)
    try {
      const local = await getAllFarmers()
      formCache.farmers = local
      setFarmerOptions(local)

      const zoho = await fetchZohoVendors(forceRefresh)
      formCache.zohoVendors = zoho
      setZohoVendors(zoho)
      setError((prev) => (isEditMode ? prev : ''))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Zoho vendors.')
    } finally {
      setLoadingVendors(false)
    }
  }

  async function loadAllItems(forceRefresh = false) {
    const hasCache = formCache.localItems.length > 0 || formCache.zohoItems.length > 0
    if (!hasCache || forceRefresh) setLoadingItems(true)
    try {
      const local = await getAllItems()
      formCache.localItems = local
      setLocalItems(local)

      const zoho = await fetchZohoItems(forceRefresh)
      formCache.zohoItems = zoho
      setZohoItems(zoho)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Zoho items.')
    } finally {
      setLoadingItems(false)
      setItemsLoadedOnce(true)
    }
  }

  useEffect(() => { loadAllVendors() }, [])
  useEffect(() => { loadAllItems() }, [])

  // ---------------------------------------------------------------------
  // VENDOR LIST
  // Same source as the Bulk Purchase Order screen: the Zoho vendor list.
  // The local farmers table is NOT merged in any more, because the same
  // vendor can exist there twice and showed up as double names.
  // Exact duplicates (same Zoho id, or same name + phone + company) are
  // removed.
  // ---------------------------------------------------------------------
  const zohoOptions: VendorOption[] = (() => {
    const seen = new Set<string>()
    const result: VendorOption[] = []

    for (const v of zohoVendors) {
      const key = v.zoho_contact_id
      const sameKey = `${normalizeName(v.name)}|${normalizePhone(v.phone)}|${normalizeName(v.company_name)}`
      if (seen.has(key) || seen.has(sameKey)) continue
      seen.add(key)
      seen.add(sameKey)

      result.push({
        type: 'zoho',
        id: v.zoho_contact_id,
        name: v.name,
        secondary: secondaryLine(v.name, v.company_name, v.phone),
        phone: v.phone,
        raw: v,
      })
    }

    return result.sort((a, b) => a.name.localeCompare(b.name))
  })()

  // If the Zoho list could not be loaded, fall back to the vendors already
  // linked to Zoho in the local table, so the user can still pick one.
  const fallbackOptions: VendorOption[] =
    zohoVendors.length > 0
      ? []
      : (() => {
          const seen = new Set<string>()
          const result: VendorOption[] = []

          for (const f of farmerOptions as FarmerWithZoho[]) {
            const key = f.zoho_contact_id || `${normalizeName(f.name)}|${normalizePhone(f.mobile)}`
            if (seen.has(key)) continue
            seen.add(key)

            result.push({
              type: 'local',
              id: f.zoho_contact_id || f.id,
              name: f.name,
              secondary: secondaryLine(f.name, f.village, f.mobile),
              phone: f.mobile ?? null,
              raw: f,
            })
          }

          return result.sort((a, b) => a.name.localeCompare(b.name))
        })()

  const vendorOptions: VendorOption[] = zohoOptions.length > 0 ? zohoOptions : fallbackOptions

  // The currently selected vendor, matched to its option in the list.
  const selectedOption: VendorOption | null = selectedFarmer
    ? (() => {
        const zohoId = (selectedFarmer as FarmerWithZoho).zoho_contact_id
        const match = vendorOptions.find((o) => o.id === zohoId || o.id === selectedFarmer.id)
        if (match) return match

        return {
          type: 'local' as const,
          id: zohoId || selectedFarmer.id,
          name: selectedFarmer.name,
          secondary: secondaryLine(selectedFarmer.name, selectedFarmer.village, selectedFarmer.mobile),
          phone: selectedFarmer.mobile ?? null,
          raw: selectedFarmer,
        }
      })()
    : null

  // ---------------------------------------------------------------------
  // ITEM LIST
  // Built only from the Zoho item list (the same list the Bulk Purchase
  // Order screen uses), with duplicates removed.
  // ---------------------------------------------------------------------
  const availableItems: Item[] = (() => {
    const seen = new Set<string>()
    const result: Item[] = []

    for (const zohoItem of zohoItems) {
      if (seen.has(zohoItem.zoho_item_id)) continue
      seen.add(zohoItem.zoho_item_id)

      const localItem = localItems.find((item) => item.zoho_item_id === zohoItem.zoho_item_id)

      if (localItem) {
        result.push({
          ...localItem,
          name: zohoItem.name,
          can_be_purchased: zohoItem.can_be_purchased,
          can_be_sold: zohoItem.can_be_sold,
        })
      } else {
        result.push({
          id: `zoho:${zohoItem.zoho_item_id}`,
          name: zohoItem.name,
          default_rate: zohoItem.rate,
          default_gst_percent: 0,
          zoho_item_id: zohoItem.zoho_item_id,
          purchase_rate: zohoItem.purchase_rate,
          can_be_purchased: zohoItem.can_be_purchased,
          can_be_sold: zohoItem.can_be_sold,
        })
      }
    }

    return result
  })()

  async function handleResolveZohoItem(matched: Item): Promise<Item | null> {
    if (!matched.zoho_item_id) return null
    const resolved = await resolveZohoItem({
      zoho_item_id: matched.zoho_item_id,
      name: matched.name,
      unit: null,
      rate: matched.default_rate,
      purchase_rate: matched.purchase_rate ?? 0,
      category: null,
      active: true,
      can_be_purchased: matched.can_be_purchased ?? null,
      can_be_sold: matched.can_be_sold ?? null,
    })
    if (resolved) {
      setLocalItems((prev) => [...prev, resolved])
    }
    return resolved
  }

  function handleItemChange(index: number, updated: OrderItem) {
    const newItems = [...orderItems]
    newItems[index] = updated
    setOrderItems(newItems)
  }

  function handleRemoveItem(index: number) {
    if (orderItems.length === 1) return
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  function handleAddItem() {
    setOrderItems([...orderItems, { ...emptyItem }])
  }

  const { subtotal, total_tax, grand_total } = calculateOrderTotals(orderItems)
  const hasInvalidItem = orderItems.some((i) => i.item_name && !i.item_id)

  const orderDateStr = (editCreatedAt ? new Date(editCreatedAt) : new Date()).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  // In edit mode, wait until the saved order AND the item list are loaded,
  // so the item rows start with the correct saved values.
  const itemsReady = !isEditMode || (editLoaded && itemsLoadedOnce)

  async function handleVendorChange(value: VendorOption | null) {
    if (!value) {
      setSelectedFarmer(null)
      return
    }

    // A vendor that comes from Zoho: link it to a farmer record.
    if (value.type === 'zoho') {
      setResolvingVendor(true)
      const resolved = await resolveZohoFarmer(value.raw as ZohoVendor)
      setResolvingVendor(false)
      if (resolved) {
        setSelectedFarmer(resolved)
        setFarmerOptions((prev) => {
          const exists = prev.some((f) => f.id === resolved.id)
          return exists ? prev.map((f) => (f.id === resolved.id ? resolved : f)) : [...prev, resolved]
        })
      } else {
        setError('Failed to link Zoho vendor. Please try again.')
      }
      return
    }

    // Fallback list (Zoho list unavailable): use the local farmer as is.
    setSelectedFarmer(value.raw as Farmer)
  }

  function handleBack() {
    if (isEditMode) navigate(-1)
    else navigate('/dashboard')
  }

  async function handleSave() {
    if (editBlocked) return
    if (!selectedFarmer) { setError('Please select a vendor / farmer'); return }

    const isLinkedToZoho = !!(selectedFarmer as FarmerWithZoho).zoho_contact_id
    if (!isLinkedToZoho) {
      setError(
        `"${selectedFarmer.name}" isn't linked to a Zoho contact, so this order can't be uploaded to Zoho Books. Please re-select them from the list, or use "Add New Farmer" if they're genuinely new.`
      )
      return
    }

    const validItems = orderItems.filter((item) => item.item_name && item.quantity > 0 && item.rate > 0)
    if (validItems.length === 0) {
      setError('Please add at least one item with quantity and rate')
      return
    }
    if (hasInvalidItem) {
      setError('One or more items are not in the master list. Please review before saving.')
      return
    }
    if (!user) return
    setLoading(true)
    setError('')

    // ---- EDIT: update the existing order and keep its PO number ----
    if (isEditMode && editPoId) {
      const result = await updatePurchaseOrder(editPoId, {
        farmer_id: selectedFarmer.id,
        grand_total,
        subtotal,
        total_tax,
        notes,
        items: validItems,
      })
      if (!result.success) {
        setError(result.error ?? 'Failed to update. Please try again.')
        setLoading(false)
        return
      }
      navigate(`/purchase-orders/success/${poPreview}`, {
        replace: true,
        state: { po_id: editPoId, po_number: poPreview, farmer: selectedFarmer, items: validItems, subtotal, total_tax, grand_total, notes },
      })
      return
    }

    // ---- CREATE: new order ----
    const result = await createPurchaseOrder({
      farmer_id: selectedFarmer.id,
      created_by: user.id,
      grand_total,
      subtotal,
      total_tax,
      notes,
      items: validItems,
    })
    if (!result) {
      setError('Failed to save. Please try again.')
      setLoading(false)
      return
    }
    navigate(`/purchase-orders/success/${result.po_number}`, {
      state: { po_id: result.id, po_number: result.po_number, farmer: selectedFarmer, items: validItems, subtotal, total_tax, grand_total, notes },
    })
  }

  return (
    <Layout maxWidth={false}>
    <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
      <Box sx={{
        bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.2,
        display: 'flex', alignItems: 'center', gap: 1, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <IconButton onClick={handleBack} size="small" sx={{ color: '#004B8B' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 16 }}>Purchase order</Typography>
      </Box>

      <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 3, pb: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 0.5 }}>
            {isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            {isEditMode
              ? 'Change the vendor, items or notes, then update the order.'
              : 'Enter vendor details and line items below.'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15, mb: 2 }}>
              Vendor Information
            </Typography>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D1B3E', mb: 0.8 }}>
                Vendor *
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={vendorOptions}
                  loading={loadingVendors}
                  value={selectedOption}
                  getOptionLabel={(option) => option.name}
                  getOptionKey={(option) => option.id}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, value) => handleVendorChange(value)}
                  filterOptions={(options, state) => {
                    const query = state.inputValue.toLowerCase().trim()
                    if (!query) return options
                    return options.filter((opt) =>
                      opt.name.toLowerCase().includes(query) ||
                      (opt.phone ?? '').toLowerCase().includes(query) ||
                      (opt.secondary ?? '').toLowerCase().includes(query)
                    )
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id} sx={{ display: 'block !important', py: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E' }}>
                        {option.name}
                      </Typography>
                      {option.secondary && (
                        <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                          {option.secondary}
                        </Typography>
                      )}
                    </Box>
                  )}
                  noOptionsText="No vendors found"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={resolvingVendor ? 'Linking vendor...' : 'Search name or phone...'}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white', borderRadius: 2,
                          border: '1px solid #E5E7EB', '& fieldset': { border: 'none' },
                        },
                      }}
                    />
                  )}
                />
                <IconButton
                  onClick={() => loadAllVendors(true)}
                  disabled={loadingVendors}
                  sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 2, mt: 0.2 }}
                >
                  <RefreshIcon sx={{ color: '#004B8B' }} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setShowAddFarmer(true)}
                sx={{ mt: 0.8, color: '#004B8B', fontSize: 12, fontWeight: 600 }}
              >
                Add New Farmer
              </Button>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>Order Date</Typography>
                <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontSize: 14 }}>{orderDateStr}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>PO Number</Typography>
                <Typography sx={{ fontWeight: 600, color: '#0D1B3E', fontSize: 14 }}>{poPreview}</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15 }}>Line Items</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: hasInvalidItem ? '#EF4444' : '#00BD67' }} />
                  <Typography variant="caption" sx={{ color: hasInvalidItem ? '#EF4444' : '#00BD67', fontWeight: 600 }}>
                    {hasInvalidItem ? 'Validation Errors' : 'Strict Validation Active'}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => loadAllItems(true)}
                  disabled={loadingItems}
                  size="small"
                  sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 1.5 }}
                >
                  <RefreshIcon sx={{ color: '#004B8B', fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            {itemsReady ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {orderItems.map((item, index) => (
                  <ItemRow key={index} index={index} item={item} availableItems={availableItems}
                    onChange={handleItemChange} onRemove={handleRemoveItem}
                    onResolveZohoItem={handleResolveZohoItem} loadingItems={loadingItems} />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem}
              sx={{ mt: 2, borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, px: 2.5,
                '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}>
              Add Row
            </Button>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Subtotal</Typography>
              <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
                ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: '#6B7280', fontSize: 14 }}>Tax</Typography>
              <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
                ₹ {total_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>Grand Total</Typography>
              <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 20 }}>
                ₹ {grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1 }}>
            PO Comments / Terms
          </Typography>
          <TextField
            multiline rows={3} fullWidth placeholder="Add any special instructions or terms for this order..."
            value={notes} onChange={(e) => setNotes(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2, border: '1px solid #E5E7EB', '& fieldset': { border: 'none' }, fontSize: 14 } }}
          />
        </Box>

        <Box sx={{ position: 'sticky', bottom: 0, bgcolor: '#EEF2FF', pt: 1, pb: 2, display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" size="large" onClick={handleBack}
            sx={{ flex: 1, borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white',
              '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' } }}>
            Cancel
          </Button>
          <Button
            variant="contained" size="large"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave} disabled={loading || editBlocked || (isEditMode && !itemsReady)}
            sx={{ flex: 2, bgcolor: '#004B8B', borderRadius: 3, py: 1.5, fontWeight: 600, fontSize: 15,
              '&:hover': { bgcolor: '#003666' }, '&.Mui-disabled': { bgcolor: '#93A8C4', color: 'white' } }}>
            {loading ? 'Saving...' : isEditMode ? 'Update PO' : 'Save PO'}
          </Button>
        </Box>
      </Box>

      <AddFarmerDialog
        open={showAddFarmer}
        onClose={() => setShowAddFarmer(false)}
        onFarmerAdded={(farmer) => {
          setSelectedFarmer(farmer)
          setFarmerOptions((prev) => [...prev, farmer])
          setShowAddFarmer(false)
        }}
      />
    </Box>
    </Layout>
  )
}