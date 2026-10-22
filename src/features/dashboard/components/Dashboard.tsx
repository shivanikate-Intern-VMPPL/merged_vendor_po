// // // import { useState } from 'react'
// // // import {
// // //   Box, Button, Typography, Paper, Skeleton, Chip, IconButton,
// // //   Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
// // // } from '@mui/material'
// // // import AddIcon from '@mui/icons-material/Add'
// // // import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
// // // import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
// // // import PendingActionsIcon from '@mui/icons-material/PendingActions'
// // // import DeleteIcon from '@mui/icons-material/Delete'
// // // import DownloadIcon from '@mui/icons-material/Download'
// // // import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
// // // import LocalShippingIcon from '@mui/icons-material/LocalShipping'
// // // import { useNavigate } from 'react-router-dom'
// // // import { useAuthContext } from '../../auth/AuthContext'
// // // import { useDashboardStats } from '../hooks/useDashboardStats'
// // // import { StatsCard } from './StatsCard'
// // // import { Layout } from '../../../shared/components/Layout'
// // // import { deletePurchaseOrder } from '../../purchase-orders/api/purchaseOrdersApi'
// // // import { RoleGuard } from '../../../shared/auth/RoleGuard'
// // // import { ROUTES } from '../../../app/config/constants'

// // // export function Dashboard() {
// // //   const { profile } = useAuthContext()
// // //   const navigate = useNavigate()
// // //   const { stats, recentOrders, loading, refetch } = useDashboardStats(profile)

// // //   const [deleteId, setDeleteId] = useState<string | null>(null)
// // //   const [deletePONumber, setDeletePONumber] = useState('')
// // //   const [deleting, setDeleting] = useState(false)

// // //   function formatDate(dateStr: string) {
// // //     return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
// // //   }

// // //   function getStatusChip(status: string) {
// // //     const map: Record<string, { label: string; bgcolor: string; color: string }> = {
// // //       draft: { label: 'Draft', bgcolor: '#F3F4F6', color: '#6B7280' },
// // //       confirmed: { label: 'Approved', bgcolor: '#DCFCE7', color: '#00BD67' },
// // //       exported: { label: 'Exported', bgcolor: '#DBEAFE', color: '#004B8B' },
// // //     }
// // //     const cfg = map[status] ?? map.draft
// // //     return (
// // //       <Chip label={cfg.label} size="small" sx={{
// // //         bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 600,
// // //         fontSize: 12, height: 24, borderRadius: 10,
// // //       }} />
// // //     )
// // //   }

// // //   async function handleDelete() {
// // //     if (!deleteId) return
// // //     setDeleting(true)
// // //     const success = await deletePurchaseOrder(deleteId)
// // //     if (success) {
// // //       setDeleteId(null)
// // //       setDeletePONumber('')
// // //       refetch()
// // //     }
// // //     setDeleting(false)
// // //   }

// // //   const firstName = profile?.full_name?.split(' ')[0] ?? ''

// // //   return (
// // //     <Layout maxWidth="sm">
// // //       <Box sx={{ mb: 3 }}>
// // //         <Typography
// // //           variant="h4"
// // //           sx={{
// // //             fontWeight: 700,
// // //             color: '#0D1B3E',
// // //             mb: 0.5,
// // //             fontSize: { xs: '1.6rem', sm: '2.25rem' },
// // //             lineHeight: { xs: 1.1, sm: 1.15 },
// // //             textAlign: { xs: 'center', sm: 'left' },
// // //             wordBreak: 'break-word',
// // //           }}
// // //         >
// // //           Welcome back, {firstName}
// // //         </Typography>
// // //         <Typography
// // //           variant="body1"
// // //           sx={{
// // //             color: '#6B7280',
// // //             fontSize: { xs: 13, sm: 15 },
// // //             textAlign: { xs: 'center', sm: 'left' },
// // //           }}
// // //         >
// // //           Here is what's happening with your procurement operations today.
// // //         </Typography>
// // //       </Box>

// // //       <Button
// // //         variant="contained"
// // //         fullWidth
// // //         size="large"
// // //         startIcon={<AddIcon />}
// // //         onClick={() => navigate('/purchase-orders/new')}
// // //         sx={{
// // //           bgcolor: '#004B8B',
// // //           py: { xs: 1.2, sm: 2 },
// // //           fontSize: { xs: 14, sm: 16 },
// // //           fontWeight: 600,
// // //           borderRadius: 3,
// // //           mb: 1.5,
// // //           '&:hover': { bgcolor: '#003666' },
// // //           minHeight: { xs: 44, sm: 'auto' },
// // //           whiteSpace: 'normal',
// // //           textAlign: 'center',
// // //         }}
// // //       >
// // //         Create New Purchase Order
// // //       </Button>

// // //       <RoleGuard permission="purchase_orders:create">
// // //         <Button
// // //           variant="contained"
// // //           fullWidth
// // //           size="large"
// // //           startIcon={<LocalShippingIcon />}
// // //           onClick={() => navigate(ROUTES.PURCHASE_PLANNING)}
// // //           sx={{
// // //             bgcolor: '#00838F',
// // //             py: { xs: 1.2, sm: 2 },
// // //             fontSize: { xs: 14, sm: 16 },
// // //             fontWeight: 600,
// // //             borderRadius: 3,
// // //             mb: 3,
// // //             '&:hover': { bgcolor: '#006064' },
// // //             minHeight: { xs: 44, sm: 'auto' },
// // //             whiteSpace: 'normal',
// // //             textAlign: 'center',
// // //           }}
// // //         >
// // //           Bulk Purchase Order
// // //         </Button>
// // //       </RoleGuard>

// // //       {loading ? (
// // //         <>
// // //           <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
// // //           <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
// // //         </>
// // //       ) : (
// // //         <>
// // //           <StatsCard
// // //             title="Your Purchase Orders This Week"
// // //             value={stats.totalOrders}
// // //             subtitle={`+${stats.weeklyDelta} this week`}
// // //             icon={<ShoppingCartIcon sx={{ fontSize: 22 }} />}
// // //             iconBgColor="#EEF2FF" iconColor="#004B8B" subtitleColor="#00BD67"
// // //           />
// // //           <StatsCard
// // //             title="Pending for Approvals"
// // //             value={stats.pendingApprovals}
// // //             subtitle="Needs attention"
// // //             icon={<PendingActionsIcon sx={{ fontSize: 22 }} />}
// // //             iconBgColor="#FFF8E1" iconColor="#FFC400" subtitleColor="#6B7280"
// // //           />
// // //         </>
// // //       )}

// // //       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
// // //         <RoleGuard permission="export:csv">
// // //           <Button variant="outlined" fullWidth size="large" startIcon={<DownloadIcon />}
// // //             onClick={() => navigate('/export')}
// // //             sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 3, py: 1.3, fontWeight: 600, bgcolor: 'white',
// // //               '&:hover': { bgcolor: '#F8FAFF', borderColor: '#004B8B' } }}>
// // //             Export CSV
// // //           </Button>
// // //         </RoleGuard>

// // //         <RoleGuard permission="admin:panel">
// // //           <Button variant="outlined" fullWidth size="large" startIcon={<AdminPanelSettingsIcon />}
// // //             onClick={() => navigate('/admin/users')}
// // //             sx={{ borderColor: '#FECACA', color: '#991B1B', borderRadius: 3, py: 1.3, fontWeight: 600, bgcolor: '#FEF2F2',
// // //               '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' } }}>
// // //             Manage Users
// // //           </Button>
// // //         </RoleGuard>
// // //       </Box>

// // //       <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 2 }}>
// // //         Your Purchase Orders this month
// // //       </Typography>

// // //       {loading ? (
// // //         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
// // //           {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />)}
// // //         </Box>
// // //       ) : recentOrders.length === 0 ? (
// // //         <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #E5E7EB', bgcolor: 'white' }}>
// // //           <AssignmentLateIcon sx={{ fontSize: 40, color: '#D1D5DB', mb: 1 }} />
// // //           <Typography sx={{ color: '#6B7280', mb: 0.5 }}>No orders today yet</Typography>
// // //           <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Tap the button above to create one</Typography>
// // //         </Paper>
// // //       ) : (
// // //         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
// // //           {recentOrders.map((order) => (
// // //             <Paper
// // //               key={order.id}
// // //               elevation={0}
// // //               sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB', bgcolor: 'white' }}
// // //             >
// // //               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
// // //                 <Typography sx={{ color: '#004B8B', fontWeight: 700, fontSize: 15 }}>
// // //                   {order.po_number}
// // //                 </Typography>
// // //                 <IconButton
// // //                   size="small"
// // //                   onClick={() => {
// // //                     setDeleteId(order.id)
// // //                     setDeletePONumber(order.po_number)
// // //                   }}
// // //                   sx={{ color: '#D1D5DB', p: 0.3, '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
// // //                 >
// // //                   <DeleteIcon sx={{ fontSize: 16 }} />
// // //                 </IconButton>
// // //               </Box>

// // //               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// // //                 <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>
// // //                   {order.farmers?.name ?? 'Unknown Farmer'}
// // //                 </Typography>
// // //                 <Typography variant="body2" sx={{ color: '#6B7280' }}>
// // //                   {formatDate(order.created_at)}
// // //                 </Typography>
// // //                 <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 20, mt: 1 }}>
// // //                   ₹{order.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
// // //                 </Typography>
// // //                 <Box sx={{ mt: 1 }}>{getStatusChip(order.status)}</Box>
// // //               </Box>
// // //             </Paper>
// // //           ))}
// // //         </Box>
// // //       )}

// // //       <Dialog
// // //         open={!!deleteId}
// // //         onClose={() => setDeleteId(null)}
// // //         maxWidth="xs"
// // //         fullWidth
// // //         slotProps={{ paper: { sx: { borderRadius: 3 } } }}
// // //       >
// // //         <DialogTitle sx={{ fontWeight: 700, color: '#0D1B3E' }}>Delete Purchase Order?</DialogTitle>
// // //         <DialogContent>
// // //           <Typography sx={{ color: '#6B7280' }}>
// // //             Are you sure you want to delete <strong style={{ color: '#004B8B' }}>{deletePONumber}</strong>? This cannot be undone.
// // //           </Typography>
// // //         </DialogContent>
// // //         <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
// // //           <Button variant="outlined" onClick={() => setDeleteId(null)} disabled={deleting}
// // //             sx={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 2 }}>Cancel</Button>
// // //           <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
// // //             startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
// // //             sx={{ borderRadius: 2 }}>
// // //             {deleting ? 'Deleting...' : 'Delete'}
// // //           </Button>
// // //         </DialogActions>
// // //       </Dialog>
// // //     </Layout>
// // //   )
// // // }
// // import { useState } from 'react'
// // import {
// //   Box, Button, Typography, Paper, Skeleton, Chip, IconButton, Alert,
// //   Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
// // } from '@mui/material'
// // import AddIcon from '@mui/icons-material/Add'
// // import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
// // import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
// // import PendingActionsIcon from '@mui/icons-material/PendingActions'
// // import DeleteIcon from '@mui/icons-material/Delete'
// // import DownloadIcon from '@mui/icons-material/Download'
// // import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
// // import LocalShippingIcon from '@mui/icons-material/LocalShipping'
// // import { useNavigate } from 'react-router-dom'
// // import { useAuthContext } from '../../auth/AuthContext'
// // import { useDashboardStats } from '../hooks/useDashboardStats'
// // import { StatsCard } from './StatsCard'
// // import { Layout } from '../../../shared/components/Layout'
// // import { deletePurchaseOrder } from '../../purchase-orders/api/purchaseOrdersApi'
// // import { RoleGuard } from '../../../shared/auth/RoleGuard'
// // import { ROUTES } from '../../../app/config/constants'
// // import { supabase } from '../../../shared/lib/supabaseClient'

// // export function Dashboard() {
// //   const { profile } = useAuthContext()
// //   const navigate = useNavigate()
// //   const { stats, recentOrders, loading, refetch } = useDashboardStats(profile)

// //   const [deleteId, setDeleteId] = useState<string | null>(null)
// //   const [deletePONumber, setDeletePONumber] = useState('')
// //   const [deleting, setDeleting] = useState(false)

// //   // Which order card is currently being opened, and any error while opening it
// //   const [openingId, setOpeningId] = useState<string | null>(null)
// //   const [openError, setOpenError] = useState('')

// //   function formatDate(dateStr: string) {
// //     return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
// //   }

// //   function getStatusChip(status: string) {
// //     const map: Record<string, { label: string; bgcolor: string; color: string }> = {
// //       draft: { label: 'Draft', bgcolor: '#F3F4F6', color: '#6B7280' },
// //       confirmed: { label: 'Approved', bgcolor: '#DCFCE7', color: '#00BD67' },
// //       exported: { label: 'Exported', bgcolor: '#DBEAFE', color: '#004B8B' },
// //     }
// //     const cfg = map[status] ?? map.draft
// //     return (
// //       <Chip label={cfg.label} size="small" sx={{
// //         bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 600,
// //         fontSize: 12, height: 24, borderRadius: 10,
// //       }} />
// //     )
// //   }

// //   async function handleDelete() {
// //     if (!deleteId) return
// //     setDeleting(true)
// //     const success = await deletePurchaseOrder(deleteId)
// //     if (success) {
// //       setDeleteId(null)
// //       setDeletePONumber('')
// //       refetch()
// //     }
// //     setDeleting(false)
// //   }

// //   // Opens one particular order. The order page needs the full order data,
// //   // so it is loaded first and then passed along.
// //   async function handleOpenOrder(orderId: string) {
// //     if (openingId) return
// //     setOpeningId(orderId)
// //     setOpenError('')

// //     try {
// //       const { data: po, error } = await supabase
// //         .from('purchase_orders')
// //         .select('*, farmer:farmers(*), items:purchase_order_items(*)')
// //         .eq('id', orderId)
// //         .maybeSingle()

// //       if (error || !po) {
// //         throw error ?? new Error('Order not found')
// //       }

// //       const items = (po.items ?? []).map((li: any) => {
// //         const quantity = Number(li.quantity) || 0
// //         const rate = Number(li.rate) || 0
// //         const amount = li.amount != null ? Number(li.amount) : quantity * rate
// //         const gstPercent = li.gst_percent != null ? Number(li.gst_percent) : 0
// //         const gstAmount =
// //           li.gst_amount != null ? Number(li.gst_amount) : (amount * gstPercent) / 100

// //         return {
// //           ...li,
// //           item_name: li.item_name,
// //           quantity,
// //           unit: li.unit ?? 'Kg',
// //           rate,
// //           amount,
// //           gst_percent: gstPercent,
// //           gst_amount: gstAmount,
// //           row_comment: li.row_comment ?? null,
// //         }
// //       })

// //       const subtotal =
// //         po.subtotal != null
// //           ? Number(po.subtotal)
// //           : items.reduce((sum: number, i: any) => sum + i.amount, 0)
// //       const totalTax =
// //         po.total_tax != null
// //           ? Number(po.total_tax)
// //           : items.reduce((sum: number, i: any) => sum + i.gst_amount, 0)
// //       const grandTotal =
// //         po.grand_total != null ? Number(po.grand_total) : subtotal + totalTax

// //       navigate(`/purchase-orders/success/${po.po_number}`, {
// //         state: {
// //           po_id: po.id,
// //           po_number: po.po_number,
// //           farmer: po.farmer ?? { name: 'Unknown Vendor', village: null },
// //           items,
// //           subtotal,
// //           total_tax: totalTax,
// //           grand_total: grandTotal,
// //           notes: po.notes ?? '',
// //         },
// //       })
// //     } catch (err) {
// //       console.error('Failed to open purchase order:', err)
// //       setOpenError('Could not open this purchase order. Please try again.')
// //     } finally {
// //       setOpeningId(null)
// //     }
// //   }

// //   const firstName = profile?.full_name?.split(' ')[0] ?? ''

// //   return (
// //     <Layout maxWidth="sm">
// //       <Box sx={{ mb: 3 }}>
// //         <Typography
// //           variant="h4"
// //           sx={{
// //             fontWeight: 700,
// //             color: '#0D1B3E',
// //             mb: 0.5,
// //             fontSize: { xs: '1.6rem', sm: '2.25rem' },
// //             lineHeight: { xs: 1.1, sm: 1.15 },
// //             textAlign: { xs: 'center', sm: 'left' },
// //             wordBreak: 'break-word',
// //           }}
// //         >
// //           Welcome back, {firstName}
// //         </Typography>
// //         <Typography
// //           variant="body1"
// //           sx={{
// //             color: '#6B7280',
// //             fontSize: { xs: 13, sm: 15 },
// //             textAlign: { xs: 'center', sm: 'left' },
// //           }}
// //         >
// //           Here is what's happening with your procurement operations today.
// //         </Typography>
// //       </Box>

// //       <Button
// //         variant="contained"
// //         fullWidth
// //         size="large"
// //         startIcon={<AddIcon />}
// //         onClick={() => navigate('/purchase-orders/new')}
// //         sx={{
// //           bgcolor: '#004B8B',
// //           py: { xs: 1.2, sm: 2 },
// //           fontSize: { xs: 14, sm: 16 },
// //           fontWeight: 600,
// //           borderRadius: 3,
// //           mb: 1.5,
// //           '&:hover': { bgcolor: '#003666' },
// //           minHeight: { xs: 44, sm: 'auto' },
// //           whiteSpace: 'normal',
// //           textAlign: 'center',
// //         }}
// //       >
// //         Create New Purchase Order
// //       </Button>

// //       <RoleGuard permission="purchase_orders:create">
// //         <Button
// //           variant="contained"
// //           fullWidth
// //           size="large"
// //           startIcon={<LocalShippingIcon />}
// //           onClick={() => navigate(ROUTES.PURCHASE_PLANNING)}
// //           sx={{
// //             bgcolor: '#00838F',
// //             py: { xs: 1.2, sm: 2 },
// //             fontSize: { xs: 14, sm: 16 },
// //             fontWeight: 600,
// //             borderRadius: 3,
// //             mb: 3,
// //             '&:hover': { bgcolor: '#006064' },
// //             minHeight: { xs: 44, sm: 'auto' },
// //             whiteSpace: 'normal',
// //             textAlign: 'center',
// //           }}
// //         >
// //           Bulk Purchase Order
// //         </Button>
// //       </RoleGuard>

// //       {loading ? (
// //         <>
// //           <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
// //           <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
// //         </>
// //       ) : (
// //         <>
// //           <StatsCard
// //             title="Your Purchase Orders This Week"
// //             value={stats.totalOrders}
// //             subtitle={`+${stats.weeklyDelta} this week`}
// //             icon={<ShoppingCartIcon sx={{ fontSize: 22 }} />}
// //             iconBgColor="#EEF2FF" iconColor="#004B8B" subtitleColor="#00BD67"
// //           />
// //           <StatsCard
// //             title="Pending for Approvals"
// //             value={stats.pendingApprovals}
// //             subtitle="Needs attention"
// //             icon={<PendingActionsIcon sx={{ fontSize: 22 }} />}
// //             iconBgColor="#FFF8E1" iconColor="#FFC400" subtitleColor="#6B7280"
// //           />
// //         </>
// //       )}

// //       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
// //         <RoleGuard permission="export:csv">
// //           <Button variant="outlined" fullWidth size="large" startIcon={<DownloadIcon />}
// //             onClick={() => navigate('/export')}
// //             sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 3, py: 1.3, fontWeight: 600, bgcolor: 'white',
// //               '&:hover': { bgcolor: '#F8FAFF', borderColor: '#004B8B' } }}>
// //             Export CSV
// //           </Button>
// //         </RoleGuard>

// //         <RoleGuard permission="admin:panel">
// //           <Button variant="outlined" fullWidth size="large" startIcon={<AdminPanelSettingsIcon />}
// //             onClick={() => navigate('/admin/users')}
// //             sx={{ borderColor: '#FECACA', color: '#991B1B', borderRadius: 3, py: 1.3, fontWeight: 600, bgcolor: '#FEF2F2',
// //               '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' } }}>
// //             Manage Users
// //           </Button>
// //         </RoleGuard>
// //       </Box>

// //       <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 2 }}>
// //         Your Purchase Orders this month
// //       </Typography>

// //       {openError && (
// //         <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setOpenError('')}>
// //           {openError}
// //         </Alert>
// //       )}

// //       {loading ? (
// //         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
// //           {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />)}
// //         </Box>
// //       ) : recentOrders.length === 0 ? (
// //         <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #E5E7EB', bgcolor: 'white' }}>
// //           <AssignmentLateIcon sx={{ fontSize: 40, color: '#D1D5DB', mb: 1 }} />
// //           <Typography sx={{ color: '#6B7280', mb: 0.5 }}>No orders today yet</Typography>
// //           <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Tap the button above to create one</Typography>
// //         </Paper>
// //       ) : (
// //         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
// //           {recentOrders.map((order) => (
// //             <Paper
// //               key={order.id}
// //               elevation={0}
// //               role="button"
// //               tabIndex={0}
// //               aria-label={`Open purchase order ${order.po_number}`}
// //               onClick={() => handleOpenOrder(order.id)}
// //               onKeyDown={(e) => {
// //                 if (e.key === 'Enter' || e.key === ' ') {
// //                   e.preventDefault()
// //                   handleOpenOrder(order.id)
// //                 }
// //               }}
// //               sx={{
// //                 p: 3,
// //                 borderRadius: 3,
// //                 border: '1px solid #E5E7EB',
// //                 bgcolor: 'white',
// //                 cursor: openingId ? 'progress' : 'pointer',
// //                 opacity: openingId && openingId !== order.id ? 0.6 : 1,
// //                 transition: 'border-color 0.15s, box-shadow 0.15s',
// //                 '&:hover': { borderColor: '#004B8B', boxShadow: '0 2px 12px rgba(0, 75, 139, 0.10)' },
// //                 '&:focus-visible': { outline: '2px solid #004B8B', outlineOffset: 2 },
// //               }}
// //             >
// //               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
// //                 <Typography sx={{ color: '#004B8B', fontWeight: 700, fontSize: 15 }}>
// //                   {order.po_number}
// //                 </Typography>

// //                 {openingId === order.id ? (
// //                   <CircularProgress size={16} />
// //                 ) : (
// //                   <IconButton
// //                     size="small"
// //                     aria-label={`Delete ${order.po_number}`}
// //                     onClick={(e) => {
// //                       // Don't open the order when the bin icon is clicked
// //                       e.stopPropagation()
// //                       setDeleteId(order.id)
// //                       setDeletePONumber(order.po_number)
// //                     }}
// //                     onKeyDown={(e) => e.stopPropagation()}
// //                     sx={{ color: '#D1D5DB', p: 0.3, '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
// //                   >
// //                     <DeleteIcon sx={{ fontSize: 16 }} />
// //                   </IconButton>
// //                 )}
// //               </Box>

// //               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
// //                 <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>
// //                   {order.farmers?.name ?? 'Unknown Farmer'}
// //                 </Typography>
// //                 <Typography variant="body2" sx={{ color: '#6B7280' }}>
// //                   {formatDate(order.created_at)}
// //                 </Typography>
// //                 <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 20, mt: 1 }}>
// //                   ₹{order.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
// //                 </Typography>
// //                 <Box sx={{ mt: 1 }}>{getStatusChip(order.status)}</Box>
// //               </Box>
// //             </Paper>
// //           ))}
// //         </Box>
// //       )}

// //       <Dialog
// //         open={!!deleteId}
// //         onClose={() => setDeleteId(null)}
// //         maxWidth="xs"
// //         fullWidth
// //         slotProps={{ paper: { sx: { borderRadius: 3 } } }}
// //       >
// //         <DialogTitle sx={{ fontWeight: 700, color: '#0D1B3E' }}>Delete Purchase Order?</DialogTitle>
// //         <DialogContent>
// //           <Typography sx={{ color: '#6B7280' }}>
// //             Are you sure you want to delete <strong style={{ color: '#004B8B' }}>{deletePONumber}</strong>? This cannot be undone.
// //           </Typography>
// //         </DialogContent>
// //         <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
// //           <Button variant="outlined" onClick={() => setDeleteId(null)} disabled={deleting}
// //             sx={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 2 }}>Cancel</Button>
// //           <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
// //             startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
// //             sx={{ borderRadius: 2 }}>
// //             {deleting ? 'Deleting...' : 'Delete'}
// //           </Button>
// //         </DialogActions>
// //       </Dialog>
// //     </Layout>
// //   )
// // }
// import { useState } from 'react'
// import {
//   Box, Button, Typography, Paper, Skeleton, Chip, IconButton, Alert,
//   Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
// } from '@mui/material'
// import AddIcon from '@mui/icons-material/Add'
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
// import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
// import PendingActionsIcon from '@mui/icons-material/PendingActions'
// import DeleteIcon from '@mui/icons-material/Delete'
// import DownloadIcon from '@mui/icons-material/Download'
// import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
// import LocalShippingIcon from '@mui/icons-material/LocalShipping'
// import { useNavigate } from 'react-router-dom'
// import { useAuthContext } from '../../auth/AuthContext'
// import { useDashboardStats } from '../hooks/useDashboardStats'
// import { StatsCard } from './StatsCard'
// import { Layout } from '../../../shared/components/Layout'
// import { deletePurchaseOrder } from '../../purchase-orders/api/purchaseOrdersApi'
// import { RoleGuard } from '../../../shared/auth/RoleGuard'
// import { ROUTES } from '../../../app/config/constants'
// import { supabase } from '../../../shared/lib/supabaseClient'

// type OrderKind = 'synced' | 'bulk-draft' | 'bulk' | 'single'

// interface OrderLike {
//   status: string
//   zoho_po_id: string | null
//   is_draft_only: boolean | null
// }

// // Decides which page a dashboard card opens.
// // - Uploaded to Zoho            -> View Synced
// // - Bulk "draft only" order     -> View Drafts
// // - Bulk order                  -> Review Orders
// // - Single PO                   -> order page with the receipt
// //
// // A bulk order is recognised by purchase_orders.is_draft_only having a value
// // (true/false). Single POs leave it empty (null). If your data is different,
// // change ONLY the line marked "BULK CHECK" below.
// function getOrderKind(order: OrderLike): OrderKind {
//   if (order.zoho_po_id || order.status === 'synced') return 'synced'

//   const isBulk = order.is_draft_only !== null && order.is_draft_only !== undefined // BULK CHECK
//   if (!isBulk) return 'single'

//   return order.is_draft_only ? 'bulk-draft' : 'bulk'
// }

// export function Dashboard() {
//   const { profile } = useAuthContext()
//   const navigate = useNavigate()
//   const { stats, recentOrders, loading, refetch } = useDashboardStats(profile)

//   const [deleteId, setDeleteId] = useState<string | null>(null)
//   const [deletePONumber, setDeletePONumber] = useState('')
//   const [deleting, setDeleting] = useState(false)

//   const [openingId, setOpeningId] = useState<string | null>(null)
//   const [openError, setOpenError] = useState('')

//   function formatDate(dateStr: string) {
//     return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
//   }

//   function getStatusChip(status: string, zohoPoId: string | null) {
//     const map: Record<string, { label: string; bgcolor: string; color: string }> = {
//       draft: { label: 'Draft', bgcolor: '#F3F4F6', color: '#6B7280' },
//       failed: { label: 'Sync failed', bgcolor: '#FEE2E2', color: '#B91C1C' },
//       confirmed: { label: 'Approved', bgcolor: '#DCFCE7', color: '#00BD67' },
//       exported: { label: 'Exported', bgcolor: '#DBEAFE', color: '#004B8B' },
//       synced: { label: 'Synced to Zoho', bgcolor: '#DCFCE7', color: '#00BD67' },
//     }
//     const key = zohoPoId && status !== 'synced' ? 'synced' : status
//     const cfg = map[key] ?? map.draft
//     return (
//       <Chip label={cfg.label} size="small" sx={{
//         bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 600,
//         fontSize: 12, height: 24, borderRadius: 10,
//       }} />
//     )
//   }

//   async function handleDelete() {
//     if (!deleteId) return
//     setDeleting(true)
//     const success = await deletePurchaseOrder(deleteId)
//     if (success) {
//       setDeleteId(null)
//       setDeletePONumber('')
//       refetch()
//     }
//     setDeleting(false)
//   }

//   // Single PO: load the full order and open its receipt page.
//   async function openSingleOrder(orderId: string) {
//     const { data: po, error } = await supabase
//       .from('purchase_orders')
//       .select('*, farmer:farmers(*), items:purchase_order_items(*)')
//       .eq('id', orderId)
//       .maybeSingle()

//     if (error || !po) throw error ?? new Error('Order not found')

//     const items = (po.items ?? []).map((li: any) => {
//       const quantity = Number(li.quantity) || 0
//       const rate = Number(li.rate) || 0
//       const amount = li.amount != null ? Number(li.amount) : quantity * rate
//       const gstPercent = li.gst_percent != null ? Number(li.gst_percent) : 0
//       const gstAmount =
//         li.gst_amount != null ? Number(li.gst_amount) : (amount * gstPercent) / 100

//       return {
//         ...li,
//         item_name: li.item_name,
//         quantity,
//         unit: li.unit ?? 'Kg',
//         rate,
//         amount,
//         gst_percent: gstPercent,
//         gst_amount: gstAmount,
//         row_comment: li.row_comment ?? null,
//       }
//     })

//     const subtotal =
//       po.subtotal != null
//         ? Number(po.subtotal)
//         : items.reduce((sum: number, i: any) => sum + i.amount, 0)
//     const totalTax =
//       po.total_tax != null
//         ? Number(po.total_tax)
//         : items.reduce((sum: number, i: any) => sum + i.gst_amount, 0)
//     const grandTotal =
//       po.grand_total != null ? Number(po.grand_total) : subtotal + totalTax

//     navigate(`/purchase-orders/success/${po.po_number}`, {
//       state: {
//         po_id: po.id,
//         po_number: po.po_number,
//         farmer: po.farmer ?? { name: 'Unknown Vendor', village: null },
//         items,
//         subtotal,
//         total_tax: totalTax,
//         grand_total: grandTotal,
//         notes: po.notes ?? '',
//       },
//     })
//   }

//   async function handleOpenOrder(order: OrderLike & { id: string }) {
//     if (openingId) return
//     setOpenError('')

//     const kind = getOrderKind(order)

//     if (kind === 'synced') {
//       navigate(ROUTES.PURCHASE_ORDERS_SYNCED)
//       return
//     }
//     if (kind === 'bulk-draft') {
//       navigate(ROUTES.PURCHASE_ORDERS_DRAFTS)
//       return
//     }
//     if (kind === 'bulk') {
//       navigate(ROUTES.PURCHASE_ORDERS_REVIEW)
//       return
//     }

//     // single PO
//     setOpeningId(order.id)
//     try {
//       await openSingleOrder(order.id)
//     } catch (err) {
//       console.error('Failed to open purchase order:', err)
//       setOpenError('Could not open this purchase order. Please try again.')
//     } finally {
//       setOpeningId(null)
//     }
//   }

//   const firstName = profile?.full_name?.split(' ')[0] ?? ''

//   return (
//     <Layout maxWidth="sm">
//       <Box sx={{ mb: 3 }}>
//         <Typography
//           variant="h4"
//           sx={{
//             fontWeight: 700,
//             color: '#0D1B3E',
//             mb: 0.5,
//             fontSize: { xs: '1.6rem', sm: '2.25rem' },
//             lineHeight: { xs: 1.1, sm: 1.15 },
//             textAlign: { xs: 'center', sm: 'left' },
//             wordBreak: 'break-word',
//           }}
//         >
//           Welcome back, {firstName}
//         </Typography>
//         <Typography
//           variant="body1"
//           sx={{
//             color: '#6B7280',
//             fontSize: { xs: 13, sm: 15 },
//             textAlign: { xs: 'center', sm: 'left' },
//           }}
//         >
//           Here is what's happening with your procurement operations today.
//         </Typography>
//       </Box>

//       <Button
//         variant="contained"
//         fullWidth
//         size="large"
//         startIcon={<AddIcon />}
//         onClick={() => navigate('/purchase-orders/new')}
//         sx={{
//           bgcolor: '#004B8B',
//           py: { xs: 1.2, sm: 2 },
//           fontSize: { xs: 14, sm: 16 },
//           fontWeight: 600,
//           borderRadius: 3,
//           mb: 1.5,
//           '&:hover': { bgcolor: '#003666' },
//           minHeight: { xs: 44, sm: 'auto' },
//           whiteSpace: 'normal',
//           textAlign: 'center',
//         }}
//       >
//         Create New Purchase Order
//       </Button>

//       <RoleGuard permission="purchase_orders:create">
//         <Button
//           variant="contained"
//           fullWidth
//           size="large"
//           startIcon={<LocalShippingIcon />}
//           onClick={() => navigate(ROUTES.PURCHASE_PLANNING)}
//           sx={{
//             bgcolor: '#00838F',
//             py: { xs: 1.2, sm: 2 },
//             fontSize: { xs: 14, sm: 16 },
//             fontWeight: 600,
//             borderRadius: 3,
//             mb: 3,
//             '&:hover': { bgcolor: '#006064' },
//             minHeight: { xs: 44, sm: 'auto' },
//             whiteSpace: 'normal',
//             textAlign: 'center',
//           }}
//         >
//           Bulk Purchase Order
//         </Button>
//       </RoleGuard>

//       {loading ? (
//         <>
//           <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
//           <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
//         </>
//       ) : (
//         <>
//           <StatsCard
//             title="Your Purchase Orders This Week"
//             value={stats.totalOrders}
//             subtitle={`+${stats.weeklyDelta} this week`}
//             icon={<ShoppingCartIcon sx={{ fontSize: 22 }} />}
//             iconBgColor="#EEF2FF" iconColor="#004B8B" subtitleColor="#00BD67"
//           />
//           <StatsCard
//             title="Pending for Approvals"
//             value={stats.pendingApprovals}
//             subtitle="Needs attention"
//             icon={<PendingActionsIcon sx={{ fontSize: 22 }} />}
//             iconBgColor="#FFF8E1" iconColor="#FFC400" subtitleColor="#6B7280"
//           />
//         </>
//       )}

//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
//         <RoleGuard permission="export:csv">
//           <Button variant="outlined" fullWidth size="large" startIcon={<DownloadIcon />}
//             onClick={() => navigate('/export')}
//             sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 3, py: 1.3, fontWeight: 600, bgcolor: 'white',
//               '&:hover': { bgcolor: '#F8FAFF', borderColor: '#004B8B' } }}>
//             Export CSV
//           </Button>
//         </RoleGuard>

//         <RoleGuard permission="admin:panel">
//           <Button variant="outlined" fullWidth size="large" startIcon={<AdminPanelSettingsIcon />}
//             onClick={() => navigate('/admin/users')}
//             sx={{ borderColor: '#FECACA', color: '#991B1B', borderRadius: 3, py: 1.3, fontWeight: 600, bgcolor: '#FEF2F2',
//               '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' } }}>
//             Manage Users
//           </Button>
//         </RoleGuard>
//       </Box>

//       <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 2 }}>
//         Your Purchase Orders this month
//       </Typography>

//       {openError && (
//         <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setOpenError('')}>
//           {openError}
//         </Alert>
//       )}

//       {loading ? (
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//           {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />)}
//         </Box>
//       ) : recentOrders.length === 0 ? (
//         <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #E5E7EB', bgcolor: 'white' }}>
//           <AssignmentLateIcon sx={{ fontSize: 40, color: '#D1D5DB', mb: 1 }} />
//           <Typography sx={{ color: '#6B7280', mb: 0.5 }}>No orders today yet</Typography>
//           <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Tap the button above to create one</Typography>
//         </Paper>
//       ) : (
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//           {recentOrders.map((order) => (
//             <Paper
//               key={order.id}
//               elevation={0}
//               role="button"
//               tabIndex={0}
//               aria-label={`Open purchase order ${order.po_number}`}
//               onClick={() => handleOpenOrder(order)}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' || e.key === ' ') {
//                   e.preventDefault()
//                   handleOpenOrder(order)
//                 }
//               }}
//               sx={{
//                 p: 3,
//                 borderRadius: 3,
//                 border: '1px solid #E5E7EB',
//                 bgcolor: 'white',
//                 cursor: openingId ? 'progress' : 'pointer',
//                 opacity: openingId && openingId !== order.id ? 0.6 : 1,
//                 transition: 'border-color 0.15s, box-shadow 0.15s',
//                 '&:hover': { borderColor: '#004B8B', boxShadow: '0 2px 12px rgba(0, 75, 139, 0.10)' },
//                 '&:focus-visible': { outline: '2px solid #004B8B', outlineOffset: 2 },
//               }}
//             >
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
//                 <Typography sx={{ color: '#004B8B', fontWeight: 700, fontSize: 15 }}>
//                   {order.po_number}
//                 </Typography>

//                 {openingId === order.id ? (
//                   <CircularProgress size={16} />
//                 ) : (
//                   <IconButton
//                     size="small"
//                     aria-label={`Delete ${order.po_number}`}
//                     onClick={(e) => {
//                       e.stopPropagation()
//                       setDeleteId(order.id)
//                       setDeletePONumber(order.po_number)
//                     }}
//                     onKeyDown={(e) => e.stopPropagation()}
//                     sx={{ color: '#D1D5DB', p: 0.3, '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
//                   >
//                     <DeleteIcon sx={{ fontSize: 16 }} />
//                   </IconButton>
//                 )}
//               </Box>

//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                 <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>
//                   {order.farmers?.name ?? 'Unknown Farmer'}
//                 </Typography>
//                 <Typography variant="body2" sx={{ color: '#6B7280' }}>
//                   {formatDate(order.created_at)}
//                 </Typography>
//                 <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 20, mt: 1 }}>
//                   ₹{order.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//                 </Typography>
//                 <Box sx={{ mt: 1 }}>{getStatusChip(order.status, order.zoho_po_id)}</Box>
//               </Box>
//             </Paper>
//           ))}
//         </Box>
//       )}

//       <Dialog
//         open={!!deleteId}
//         onClose={() => setDeleteId(null)}
//         maxWidth="xs"
//         fullWidth
//         slotProps={{ paper: { sx: { borderRadius: 3 } } }}
//       >
//         <DialogTitle sx={{ fontWeight: 700, color: '#0D1B3E' }}>Delete Purchase Order?</DialogTitle>
//         <DialogContent>
//           <Typography sx={{ color: '#6B7280' }}>
//             Are you sure you want to delete <strong style={{ color: '#004B8B' }}>{deletePONumber}</strong>? This cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
//           <Button variant="outlined" onClick={() => setDeleteId(null)} disabled={deleting}
//             sx={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 2 }}>Cancel</Button>
//           <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
//             startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
//             sx={{ borderRadius: 2 }}>
//             {deleting ? 'Deleting...' : 'Delete'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Layout>
//   )
// }
import { useState } from 'react'
import {
  Box, Button, Typography, Paper, Skeleton, Chip, IconButton, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../auth/AuthContext'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { StatsCard } from './StatsCard'
import { Layout } from '../../../shared/components/Layout'
import { deletePurchaseOrder } from '../../purchase-orders/api/purchaseOrdersApi'
import { RoleGuard } from '../../../shared/auth/RoleGuard'
import { ROUTES } from '../../../app/config/constants'
import { supabase } from '../../../shared/lib/supabaseClient'

// Page that lists synced SINGLE purchase orders (SinglePO -> View Synced).
const SINGLE_PO_SYNCED_ROUTE = '/purchase-orders/synced'

// Single POs are numbered like PO261007004 (letters PO + digits only).
// Bulk POs look like PO-20261007-0003.
const SINGLE_PO_PATTERN = /^PO\d+$/

type OrderKind =
  | 'single-synced'
  | 'single'
  | 'bulk-synced'
  | 'bulk-draft'
  | 'bulk-review'

interface OrderLike {
  po_number: string
  status: string
  zoho_po_id: string | null
  is_draft_only: boolean | null
}

// Decides which page a dashboard card opens.
function getOrderKind(order: OrderLike): OrderKind {
  const isSingle = SINGLE_PO_PATTERN.test(order.po_number ?? '')
  const isSynced = !!order.zoho_po_id || order.status === 'synced'

  if (isSingle) return isSynced ? 'single-synced' : 'single'

  // bulk orders
  if (isSynced) return 'bulk-synced'
  return order.is_draft_only ? 'bulk-draft' : 'bulk-review'
}

export function Dashboard() {
  const { profile } = useAuthContext()
  const navigate = useNavigate()
  const { stats, recentOrders, loading, refetch } = useDashboardStats(profile)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletePONumber, setDeletePONumber] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [openingId, setOpeningId] = useState<string | null>(null)
  const [openError, setOpenError] = useState('')

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function getStatusChip(status: string, zohoPoId: string | null) {
    const map: Record<string, { label: string; bgcolor: string; color: string }> = {
      draft: { label: 'Draft', bgcolor: '#F3F4F6', color: '#6B7280' },
      failed: { label: 'Sync failed', bgcolor: '#FEE2E2', color: '#B91C1C' },
      confirmed: { label: 'Approved', bgcolor: '#DCFCE7', color: '#00BD67' },
      exported: { label: 'Exported', bgcolor: '#DBEAFE', color: '#004B8B' },
      synced: { label: 'Synced to Zoho', bgcolor: '#DCFCE7', color: '#00BD67' },
    }
    const key = zohoPoId && status !== 'synced' ? 'synced' : status
    const cfg = map[key] ?? map.draft
    return (
      <Chip label={cfg.label} size="small" sx={{
        bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 600,
        fontSize: 12, height: 24, borderRadius: 10,
      }} />
    )
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const success = await deletePurchaseOrder(deleteId)
    if (success) {
      setDeleteId(null)
      setDeletePONumber('')
      refetch()
    }
    setDeleting(false)
  }

  // Single PO that is not synced yet: load the full order and open its
  // receipt page (with the Edit / Print / Upload buttons).
  async function openSingleOrder(orderId: string) {
    const { data: po, error } = await supabase
      .from('purchase_orders')
      .select('*, farmer:farmers(*), items:purchase_order_items(*)')
      .eq('id', orderId)
      .maybeSingle()

    if (error || !po) throw error ?? new Error('Order not found')

    const items = (po.items ?? []).map((li: any) => {
      const quantity = Number(li.quantity) || 0
      const rate = Number(li.rate) || 0
      const amount = li.amount != null ? Number(li.amount) : quantity * rate
      const gstPercent = li.gst_percent != null ? Number(li.gst_percent) : 0
      const gstAmount =
        li.gst_amount != null ? Number(li.gst_amount) : (amount * gstPercent) / 100

      return {
        ...li,
        item_name: li.item_name,
        quantity,
        unit: li.unit ?? 'Kg',
        rate,
        amount,
        gst_percent: gstPercent,
        gst_amount: gstAmount,
        row_comment: li.row_comment ?? null,
      }
    })

    const subtotal =
      po.subtotal != null
        ? Number(po.subtotal)
        : items.reduce((sum: number, i: any) => sum + i.amount, 0)
    const totalTax =
      po.total_tax != null
        ? Number(po.total_tax)
        : items.reduce((sum: number, i: any) => sum + i.gst_amount, 0)
    const grandTotal =
      po.grand_total != null ? Number(po.grand_total) : subtotal + totalTax

    navigate(`/purchase-orders/success/${po.po_number}`, {
      state: {
        po_id: po.id,
        po_number: po.po_number,
        farmer: po.farmer ?? { name: 'Unknown Vendor', village: null },
        items,
        subtotal,
        total_tax: totalTax,
        grand_total: grandTotal,
        notes: po.notes ?? '',
      },
    })
  }

  async function handleOpenOrder(order: OrderLike & { id: string }) {
    if (openingId) return
    setOpenError('')

    const kind = getOrderKind(order)

    switch (kind) {
      case 'single-synced':
        navigate(SINGLE_PO_SYNCED_ROUTE)
        return
      case 'bulk-synced':
        navigate(ROUTES.PURCHASE_ORDERS_SYNCED)
        return
      case 'bulk-draft':
        navigate(ROUTES.PURCHASE_ORDERS_DRAFTS)
        return
      case 'bulk-review':
        navigate(ROUTES.PURCHASE_ORDERS_REVIEW)
        return
      case 'single':
        break
    }

    // single PO, not synced yet
    setOpeningId(order.id)
    try {
      await openSingleOrder(order.id)
    } catch (err) {
      console.error('Failed to open purchase order:', err)
      setOpenError('Could not open this purchase order. Please try again.')
    } finally {
      setOpeningId(null)
    }
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? ''

  return (
    <Layout maxWidth="sm">
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#0D1B3E',
            mb: 0.5,
            fontSize: { xs: '1.6rem', sm: '2.25rem' },
            lineHeight: { xs: 1.1, sm: 1.15 },
            textAlign: { xs: 'center', sm: 'left' },
            wordBreak: 'break-word',
          }}
        >
          Welcome back, {firstName}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6B7280',
            fontSize: { xs: 13, sm: 15 },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          Here is what's happening with your procurement operations today.
        </Typography>
      </Box>

      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<AddIcon />}
        onClick={() => navigate('/purchase-orders/new')}
        sx={{
          bgcolor: '#004B8B',
          py: { xs: 1.2, sm: 2 },
          fontSize: { xs: 14, sm: 16 },
          fontWeight: 600,
          borderRadius: 3,
          mb: 1.5,
          '&:hover': { bgcolor: '#003666' },
          minHeight: { xs: 44, sm: 'auto' },
          whiteSpace: 'normal',
          textAlign: 'center',
        }}
      >
        Create New Purchase Order
      </Button>

      <RoleGuard permission="purchase_orders:create">
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<LocalShippingIcon />}
          onClick={() => navigate(ROUTES.PURCHASE_PLANNING)}
          sx={{
            bgcolor: '#00838F',
            py: { xs: 1.2, sm: 2 },
            fontSize: { xs: 14, sm: 16 },
            fontWeight: 600,
            borderRadius: 3,
            mb: 3,
            '&:hover': { bgcolor: '#006064' },
            minHeight: { xs: 44, sm: 'auto' },
            whiteSpace: 'normal',
            textAlign: 'center',
          }}
        >
          Bulk Purchase Order
        </Button>
      </RoleGuard>

      {loading ? (
        <>
          <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
          <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
        </>
      ) : (
        <>
          <StatsCard
            title="Your Purchase Orders This Week"
            value={stats.totalOrders}
            subtitle={`+${stats.weeklyDelta} this week`}
            icon={<ShoppingCartIcon sx={{ fontSize: 22 }} />}
            iconBgColor="#EEF2FF" iconColor="#004B8B" subtitleColor="#00BD67"
          />
          <StatsCard
            title="Pending for Approvals"
            value={stats.pendingApprovals}
            subtitle="Needs attention"
            icon={<PendingActionsIcon sx={{ fontSize: 22 }} />}
            iconBgColor="#FFF8E1" iconColor="#FFC400" subtitleColor="#6B7280"
          />
        </>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        <RoleGuard permission="export:csv">
          <Button variant="outlined" fullWidth size="large" startIcon={<DownloadIcon />}
            onClick={() => navigate('/export')}
            sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 3, py: 1.3, fontWeight: 600, bgcolor: 'white',
              '&:hover': { bgcolor: '#F8FAFF', borderColor: '#004B8B' } }}>
            Export CSV
          </Button>
        </RoleGuard>

        <RoleGuard permission="admin:panel">
          <Button variant="outlined" fullWidth size="large" startIcon={<AdminPanelSettingsIcon />}
            onClick={() => navigate('/admin/users')}
            sx={{ borderColor: '#FECACA', color: '#991B1B', borderRadius: 3, py: 1.3, fontWeight: 600, bgcolor: '#FEF2F2',
              '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' } }}>
            Manage Users
          </Button>
        </RoleGuard>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 2 }}>
        Your Purchase Orders this month
      </Typography>

      {openError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setOpenError('')}>
          {openError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : recentOrders.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #E5E7EB', bgcolor: 'white' }}>
          <AssignmentLateIcon sx={{ fontSize: 40, color: '#D1D5DB', mb: 1 }} />
          <Typography sx={{ color: '#6B7280', mb: 0.5 }}>No orders today yet</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Tap the button above to create one</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recentOrders.map((order) => (
            <Paper
              key={order.id}
              elevation={0}
              role="button"
              tabIndex={0}
              aria-label={`Open purchase order ${order.po_number}`}
              onClick={() => handleOpenOrder(order)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleOpenOrder(order)
                }
              }}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                bgcolor: 'white',
                cursor: openingId ? 'progress' : 'pointer',
                opacity: openingId && openingId !== order.id ? 0.6 : 1,
                transition: 'border-color 0.15s, box-shadow 0.15s',
                '&:hover': { borderColor: '#004B8B', boxShadow: '0 2px 12px rgba(0, 75, 139, 0.10)' },
                '&:focus-visible': { outline: '2px solid #004B8B', outlineOffset: 2 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ color: '#004B8B', fontWeight: 700, fontSize: 15 }}>
                  {order.po_number}
                </Typography>

                {openingId === order.id ? (
                  <CircularProgress size={16} />
                ) : (
                  <IconButton
                    size="small"
                    aria-label={`Delete ${order.po_number}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(order.id)
                      setDeletePONumber(order.po_number)
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    sx={{ color: '#D1D5DB', p: 0.3, '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 18 }}>
                  {order.farmers?.name ?? 'Unknown Farmer'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  {formatDate(order.created_at)}
                </Typography>
                <Typography sx={{ fontWeight: 700, color: '#0D1B3E', fontSize: 20, mt: 1 }}>
                  ₹{order.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
                <Box sx={{ mt: 1 }}>{getStatusChip(order.status, order.zoho_po_id)}</Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0D1B3E' }}>Delete Purchase Order?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#6B7280' }}>
            Are you sure you want to delete <strong style={{ color: '#004B8B' }}>{deletePONumber}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteId(null)} disabled={deleting}
            sx={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: 2 }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}