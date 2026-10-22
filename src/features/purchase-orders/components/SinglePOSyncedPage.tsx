// import { useNavigate } from 'react-router-dom'
// import {
//   Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead,
//   TableRow, Typography, CircularProgress,
// } from '@mui/material'
// import PrintIcon from '@mui/icons-material/Print'
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
// import { Layout } from '../../../shared/components/Layout'
// import { usePurchaseOrders } from '../../purchase-planning/hooks/usePurchaseOrders'
// import { printReceipt, printAllReceipts } from '../../purchase-planning/utils/printReceipt'

// // Single POs are numbered like PO261007001 (letters PO + digits only).
// // Bulk POs look like PO-20261007-0003, so they are not matched here.
// const SINGLE_PO_PATTERN = /^PO\d+$/

// function formatDate(iso: string) {
//   return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
// }

// export default function SinglePOSyncedPage() {
//   const navigate = useNavigate()
//   const { data: orders = [], isLoading } = usePurchaseOrders()

//   const syncedSingleOrders = orders.filter(
//     (o) => SINGLE_PO_PATTERN.test(o.po_number ?? '') && (o.status === 'synced' || !!o.zoho_po_id)
//   )

//   if (isLoading) {
//     return (
//       <Layout maxWidth={false}>
//         <Box display="flex" justifyContent="center" py={10}>
//           <CircularProgress />
//         </Box>
//       </Layout>
//     )
//   }

//   return (
//     <Layout maxWidth={false}>
//       <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
//         <Paper
//           elevation={0}
//           sx={{
//             p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 3,
//             border: '1px solid #dbe3f0',
//             background: 'linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)',
//           }}
//         >
//           <Stack
//             direction={{ xs: 'column', md: 'row' }}
//             justifyContent="space-between"
//             alignItems={{ xs: 'stretch', md: 'center' }}
//             spacing={3}
//           >
//             <Box>
//               <Typography sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, fontWeight: 800, color: '#0f2d5c', lineHeight: 1.2, mb: 0.7 }}>
//                 Synced Single Purchase Orders
//               </Typography>
//               <Typography sx={{ fontSize: { xs: 14, sm: 16 }, color: '#64748b' }}>
//                 Single purchase orders already uploaded to Zoho Books.
//               </Typography>
//             </Box>

//             <Button
//               variant="contained"
//               startIcon={<PrintIcon />}
//               onClick={() => printAllReceipts(syncedSingleOrders)}
//               disabled={syncedSingleOrders.length === 0}
//               sx={{
//                 minWidth: { xs: '100%', md: 150 }, height: 44, borderRadius: 2,
//                 textTransform: 'none', fontWeight: 700, backgroundColor: '#07579e', boxShadow: 'none',
//                 '&:hover': { backgroundColor: '#064a86', boxShadow: 'none' },
//                 '&:disabled': { backgroundColor: '#cbd5e1', color: '#64748b' },
//               }}
//             >
//               Print All
//             </Button>
//           </Stack>
//         </Paper>

//         {syncedSingleOrders.length === 0 ? (
//           <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid #E5E7EB', bgcolor: 'white' }}>
//             <Box sx={{
//               width: 64, height: 64, borderRadius: '50%', bgcolor: '#EEF2FF', mx: 'auto', mb: 2,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//             }}>
//               <ShoppingCartIcon sx={{ color: '#004B8B' }} />
//             </Box>
//             <Typography sx={{ fontWeight: 800, color: '#0f2d5c', fontSize: 22, mb: 1 }}>
//               No Synced Single Purchase Orders
//             </Typography>
//             <Typography sx={{ color: '#64748b', mb: 3 }}>
//               Nothing has been uploaded to Zoho Books yet. Once a single purchase order is synced, it will appear here.
//             </Typography>
//             <Button
//               variant="outlined"
//               startIcon={<ShoppingCartIcon />}
//               onClick={() => navigate('/purchase-orders/new')}
//               sx={{ borderRadius: 5, textTransform: 'none', fontWeight: 600 }}
//             >
//               Create Single PO
//             </Button>
//           </Paper>
//         ) : (
//           <Stack spacing={3}>
//             {syncedSingleOrders.map((po) => (
//               <Paper key={po.id} sx={{ p: { xs: 2, sm: 3 } }}>
//                 <Stack
//                   direction={{ xs: 'column', sm: 'row' }}
//                   justifyContent="space-between"
//                   alignItems={{ xs: 'stretch', sm: 'flex-start' }}
//                   spacing={1.5}
//                   mb={2}
//                 >
//                   <Box>
//                     <Typography variant="h6" fontWeight={800} fontSize={{ xs: 16, sm: 20 }}>
//                       {po.po_number}
//                     </Typography>
//                     <Typography color="text.secondary" fontSize={{ xs: 13, sm: 14 }}>
//                       Vendor: {po.vendor_name}
//                     </Typography>
//                     <Typography color="text.secondary" fontSize={{ xs: 12, sm: 13 }}>
//                       {formatDate(po.created_at)}
//                     </Typography>
//                   </Box>
//                   <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
//                     <Chip label="Synced to Zoho" color="success" size="small" />
//                     <Button
//                       size="small"
//                       variant="outlined"
//                       color="secondary"
//                       startIcon={<PrintIcon />}
//                       onClick={() => printReceipt(po)}
//                     >
//                       Print Receipt
//                     </Button>
//                   </Stack>
//                 </Stack>

//                 <Box sx={{ overflowX: 'auto' }}>
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Item</TableCell>
//                         <TableCell align="right">Quantity</TableCell>
//                         <TableCell align="right">Rate</TableCell>
//                         <TableCell align="right">Total</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {po.items.map((li) => (
//                         <TableRow key={li.id}>
//                           <TableCell>{li.item_name}</TableCell>
//                           <TableCell align="right">{li.quantity}</TableCell>
//                           <TableCell align="right">{li.rate ?? '—'}</TableCell>
//                           <TableCell align="right">
//                             {li.rate ? (li.quantity * li.rate).toFixed(2) : '—'}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </Box>
//               </Paper>
//             ))}
//           </Stack>
//         )}
//       </Box>
//     </Layout>
//   )
// }
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, CircularProgress, IconButton, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import DeleteIcon from '@mui/icons-material/Delete'
import { useQueryClient } from '@tanstack/react-query'
import { Layout } from '../../../shared/components/Layout'
import { usePurchaseOrders } from '../../purchase-planning/hooks/usePurchaseOrders'
import { printReceipt, printAllReceipts } from '../../purchase-planning/utils/printReceipt'
import { deletePurchaseOrder } from '../api/purchaseOrdersApi'

// Single POs are numbered like PO261007001 (letters PO + digits only).
// Bulk POs look like PO-20261007-0003, so they are not matched here.
const SINGLE_PO_PATTERN = /^PO\d+$/

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function SinglePOSyncedPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: orders = [], isLoading } = usePurchaseOrders()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletePoNumber, setDeletePoNumber] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const syncedSingleOrders = orders.filter(
    (o) => SINGLE_PO_PATTERN.test(o.po_number ?? '') && (o.status === 'synced' || !!o.zoho_po_id)
  )

  function openDelete(id: string, poNumber: string) {
    setDeleteError('')
    setDeleteId(id)
    setDeletePoNumber(poNumber)
  }

  function closeDelete() {
    if (deleting) return
    setDeleteId(null)
    setDeletePoNumber('')
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    setDeleteError('')

    const success = await deletePurchaseOrder(deleteId)

    if (success) {
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setDeleteId(null)
      setDeletePoNumber('')
    } else {
      setDeleteError('Could not delete this purchase order. Please try again.')
    }
    setDeleting(false)
  }

  if (isLoading) {
    return (
      <Layout maxWidth={false}>
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout maxWidth={false}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 3,
            border: '1px solid #dbe3f0',
            background: 'linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={3}
          >
            <Box>
              <Typography sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, fontWeight: 800, color: '#0f2d5c', lineHeight: 1.2, mb: 0.7 }}>
                Synced Single Purchase Orders
              </Typography>
              <Typography sx={{ fontSize: { xs: 14, sm: 16 }, color: '#64748b' }}>
                Single purchase orders already uploaded to Zoho Books.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => printAllReceipts(syncedSingleOrders)}
              disabled={syncedSingleOrders.length === 0}
              sx={{
                minWidth: { xs: '100%', md: 150 }, height: 44, borderRadius: 2,
                textTransform: 'none', fontWeight: 700, backgroundColor: '#07579e', boxShadow: 'none',
                '&:hover': { backgroundColor: '#064a86', boxShadow: 'none' },
                '&:disabled': { backgroundColor: '#cbd5e1', color: '#64748b' },
              }}
            >
              Print All
            </Button>
          </Stack>
        </Paper>

        {syncedSingleOrders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid #E5E7EB', bgcolor: 'white' }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '50%', bgcolor: '#EEF2FF', mx: 'auto', mb: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingCartIcon sx={{ color: '#004B8B' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: '#0f2d5c', fontSize: 22, mb: 1 }}>
              No Synced Single Purchase Orders
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 3 }}>
              Nothing has been uploaded to Zoho Books yet. Once a single purchase order is synced, it will appear here.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate('/purchase-orders/new')}
              sx={{ borderRadius: 5, textTransform: 'none', fontWeight: 600 }}
            >
              Create Single PO
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {syncedSingleOrders.map((po) => (
              <Paper key={po.id} sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                  spacing={1.5}
                  mb={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800} fontSize={{ xs: 16, sm: 20 }}>
                      {po.po_number}
                    </Typography>
                    <Typography color="text.secondary" fontSize={{ xs: 13, sm: 14 }}>
                      Vendor: {po.vendor_name}
                    </Typography>
                    <Typography color="text.secondary" fontSize={{ xs: 12, sm: 13 }}>
                      {formatDate(po.created_at)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip label="Synced to Zoho" color="success" size="small" />
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<PrintIcon />}
                      onClick={() => printReceipt(po)}
                    >
                      Print Receipt
                    </Button>
                    <IconButton
                      size="small"
                      aria-label={`Delete ${po.po_number}`}
                      title="Delete"
                      onClick={() => openDelete(po.id, po.po_number)}
                      sx={{
                        color: '#EF4444',
                        border: '1px solid #FCA5A5',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#FEF2F2' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {po.items.map((li) => (
                        <TableRow key={li.id}>
                          <TableCell>{li.item_name}</TableCell>
                          <TableCell align="right">{li.quantity}</TableCell>
                          <TableCell align="right">{li.rate ?? '—'}</TableCell>
                          <TableCell align="right">
                            {li.rate ? (li.quantity * li.rate).toFixed(2) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      <Dialog
        open={!!deleteId}
        onClose={closeDelete}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0D1B3E' }}>Delete Purchase Order?</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{deleteError}</Alert>
          )}
          <Typography sx={{ color: '#6B7280', mb: 1.5 }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: '#004B8B' }}>{deletePoNumber}</strong>? This cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This PO was already uploaded to Zoho. Deleting it here removes it from this app only.
            It will stay in Zoho Books, so delete it there too if needed.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={closeDelete}
            disabled={deleting}
            sx={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  )
}