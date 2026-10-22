// import { useState } from 'react';
// import { Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress, Alert } from '@mui/material';
// import { usePurchaseOrders } from './hooks/usePurchaseOrders';
// import type { ReviewPurchaseOrder } from './hooks/usePurchaseOrders';
// import { useSyncPurchaseOrder } from './hooks/useSyncPurchaseOrder';
// import { useDeletePurchaseOrder } from './hooks/useDeletePurchaseOrder';
// import { printReceipt } from './utils/printReceipt';
// import { Layout } from '../../shared/components/Layout';
// import { EditPurchaseOrderDialog } from './components/EditPurchaseOrderDialog';

// function statusColor(status: string): 'default' | 'success' | 'error' | 'warning' {
//   if (status === 'failed') return 'error';
//   return 'warning';
// }

// function formatDate(iso: string) {
//   return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
// }

// export default function PurchaseOrdersReviewPage() {
//   const { data: orders = [], isLoading, refetch } = usePurchaseOrders();
//   const syncOrder = useSyncPurchaseOrder();
//   const deleteOrder = useDeletePurchaseOrder();
//   const [editingPo, setEditingPo] = useState<ReviewPurchaseOrder | null>(null);

//   const visibleOrders = orders.filter((o) => !o.is_draft_only && o.status !== 'synced' && !o.zoho_po_id);
  
//   const handlePrintReceipt = (po: typeof visibleOrders[number]) => {
//     printReceipt(po);
//   };

//   const handleUploadOne = async (id: string) => {
//     await syncOrder.mutateAsync(id);
//     refetch();
//   };

//   const handleUploadAll = async () => {
//     for (const order of visibleOrders) {
//       await syncOrder.mutateAsync(order.id);
//     }
//     refetch();
//   };

//   const handleDelete = async (id: string) => {
//     if (!window.confirm('Delete this Purchase Order?')) return;
//     await deleteOrder.mutateAsync(id);
//     refetch();
//   };

//   if (isLoading) {
//     return (
//       <Layout maxWidth={false}>
//         <Box display="flex" justifyContent="center" py={10}>
//           <CircularProgress />
//         </Box>
//       </Layout>
//     );
//   }

//   return (
//     <Layout maxWidth={false}>
//     <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>

//       {/* HEADER — same bordered/gradient card style as the Synced page */}
//       <Paper
//         elevation={0}
//         sx={{
//           p: { xs: 2.5, sm: 3 },
//           mb: 3,
//           borderRadius: 3,
//           border: '1px solid #dbe3f0',
//           background: 'linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)',
//         }}
//       >
//         <Stack
//           direction={{ xs: 'column', md: 'row' }}
//           justifyContent="space-between"
//           alignItems={{ xs: 'stretch', md: 'center' }}
//           spacing={3}
//         >
//           <Box>
//             <Typography sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, fontWeight: 800, color: '#0f2d5c', lineHeight: 1.2, mb: 0.7 }}>
//               Generated Purchase Orders
//             </Typography>
//             <Typography sx={{ fontSize: { xs: 14, sm: 16 }, color: '#64748b' }}>
//               Review each PO below, then upload it to Zoho Books.
//             </Typography>
//           </Box>

//           <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', md: 'auto' } }}>
//             <Button
//               variant="contained"
//               onClick={handleUploadAll}
//               disabled={syncOrder.isPending || visibleOrders.length === 0}
//               sx={{
//                 minWidth: { xs: '100%', sm: 170 },
//                 height: 44,
//                 borderRadius: 2,
//                 textTransform: 'none',
//                 fontWeight: 700,
//                 backgroundColor: '#07579e',
//                 boxShadow: 'none',
//                 '&:hover': { backgroundColor: '#064a86', boxShadow: 'none' },
//                 '&:disabled': { backgroundColor: '#cbd5e1', color: '#64748b' },
//               }}
//             >
//               {syncOrder.isPending ? 'Uploading…' : 'Upload All to Zoho'}
//             </Button>
//           </Stack>
//         </Stack>
//       </Paper>

//       {visibleOrders.length === 0 && (
//         <Alert severity="info">
//           Nothing to review right now. Generated POs land here until uploaded.
//         </Alert>
//       )}

//       <Stack spacing={3}>
//         {visibleOrders.map((po) => (
//           <Paper key={po.id} sx={{ p: { xs: 2, sm: 3 } }}>
//             <Stack
//               direction={{ xs: 'column', sm: 'row' }}
//               justifyContent="space-between"
//               alignItems={{ xs: 'stretch', sm: 'flex-start' }}
//               spacing={1.5}
//               mb={2}
//             >
//               <Box>
//                 <Typography variant="h6" fontWeight={800} fontSize={{ xs: 16, sm: 20 }}>{po.po_number}</Typography>
//                 <Typography color="text.secondary" fontSize={{ xs: 13, sm: 14 }}>Vendor: {po.vendor_name}</Typography>
//                 <Typography color="text.secondary" fontSize={{ xs: 12, sm: 13 }}>{formatDate(po.created_at)}</Typography>
//               </Box>
//               <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
//                 <Chip
//                   label={po.status === 'failed' ? 'Sync failed' : 'Draft'}
//                   color={statusColor(po.status)}
//                   size="small"
//                 />
//                 <Button size="small" variant="contained" onClick={() => handleUploadOne(po.id)} disabled={syncOrder.isPending}>
//                   Upload to Zoho
//                 </Button>
//                 <Button size="small" variant="outlined" onClick={() => setEditingPo(po)} disabled={syncOrder.isPending}>
//                   Edit
//                 </Button>
//                 <Button size="small" variant="outlined" color="secondary" onClick={() => handlePrintReceipt(po)}>
//                   Print Receipt
//                 </Button>
//                 <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(po.id)} disabled={deleteOrder.isPending}>
//                   Delete
//                 </Button>
//               </Stack>
//             </Stack>

//             {po.status === 'failed' && po.notes && (
//               <Alert severity="error" sx={{ mb: 2 }}>{po.notes}</Alert>
//             )}

//             <Box sx={{ overflowX: 'auto' }}>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Item</TableCell>
//                     <TableCell align="right">Quantity</TableCell>
//                     <TableCell align="right">Rate</TableCell>
//                     <TableCell align="right">Total</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {po.items.map((li) => (
//                     <TableRow key={li.id}>
//                       <TableCell>{li.item_name}</TableCell>
//                       <TableCell align="right">{li.quantity}</TableCell>
//                       <TableCell align="right">{li.rate ?? '—'}</TableCell>
//                       <TableCell align="right">{li.rate ? (li.quantity * li.rate).toFixed(2) : '—'}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </Box>
//           </Paper>
//         ))}
//       </Stack>
//     </Box>

//     <EditPurchaseOrderDialog
//       po={editingPo}
//       open={!!editingPo}
//       onClose={() => setEditingPo(null)}
//     />
//     </Layout>
//   );
// }
import { useState } from 'react';
import { Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress, Alert } from '@mui/material';
import { usePurchaseOrders } from './hooks/usePurchaseOrders';
import type { ReviewPurchaseOrder } from './hooks/usePurchaseOrders';
import { useSyncPurchaseOrder } from './hooks/useSyncPurchaseOrder';
import { useDeletePurchaseOrder } from './hooks/useDeletePurchaseOrder';
import { printReceipt } from './utils/printReceipt';
import { Layout } from '../../shared/components/Layout';
import { EditPurchaseOrderDialog } from './components/EditPurchaseOrderDialog';

function statusColor(status: string): 'default' | 'success' | 'error' | 'warning' {
  if (status === 'failed') return 'error';
  return 'warning';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PurchaseOrdersReviewPage() {
  const { data: orders = [], isLoading, refetch } = usePurchaseOrders();
  const syncOrder = useSyncPurchaseOrder();
  const deleteOrder = useDeletePurchaseOrder();
  const [editingPo, setEditingPo] = useState<ReviewPurchaseOrder | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const visibleOrders = orders.filter((o) => !o.is_draft_only && o.status !== 'synced' && !o.zoho_po_id);

  const handlePrintReceipt = (po: typeof visibleOrders[number]) => {
    printReceipt(po);
  };

  // Uploads one PO. The list is reloaded once afterwards, whether the
  // upload worked or not, so the card shows the real state.
  const handleUploadOne = async (id: string) => {
    setUploadMessage(null);
    try {
      await syncOrder.mutateAsync(id);
    } catch (err) {
      setUploadMessage((err as Error).message || 'Upload failed. Please try again.');
    } finally {
      await refetch();
    }
  };

  // Uploads every PO one by one. One failing PO no longer stops the others,
  // and the list is reloaded ONCE at the end, not after every PO.
  const handleUploadAll = async () => {
    setUploadMessage(null);
    const failed: string[] = [];
    let uploaded = 0;
    let lastReason = '';

    for (const order of visibleOrders) {
      try {
        await syncOrder.mutateAsync(order.id);
        uploaded++;
      } catch (err) {
        failed.push(order.po_number);
        lastReason = (err as Error).message;
      }
    }

    await refetch();

    if (failed.length > 0) {
      setUploadMessage(
        `${uploaded} uploaded, ${failed.length} not uploaded (${failed.join(', ')}). ` +
        `The reason is shown on each order${lastReason ? `: ${lastReason}` : '.'}`
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this Purchase Order?')) return;
    await deleteOrder.mutateAsync(id);
    refetch();
  };

  if (isLoading) {
    return (
      <Layout maxWidth={false}>
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout maxWidth={false}>
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>

      {/* HEADER — same bordered/gradient card style as the Synced page */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          borderRadius: 3,
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
              Generated Purchase Orders
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, sm: 16 }, color: '#64748b' }}>
              Review each PO below, then upload it to Zoho Books.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="contained"
              onClick={handleUploadAll}
              disabled={syncOrder.isPending || visibleOrders.length === 0}
              sx={{
                minWidth: { xs: '100%', sm: 170 },
                height: 44,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                backgroundColor: '#07579e',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#064a86', boxShadow: 'none' },
                '&:disabled': { backgroundColor: '#cbd5e1', color: '#64748b' },
              }}
            >
              {syncOrder.isPending ? 'Uploading…' : 'Upload All to Zoho'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {uploadMessage && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setUploadMessage(null)}>
          {uploadMessage}
        </Alert>
      )}

      {visibleOrders.length === 0 && (
        <Alert severity="info">
          Nothing to review right now. Generated POs land here until uploaded.
        </Alert>
      )}

      <Stack spacing={3}>
        {visibleOrders.map((po) => (
          <Paper key={po.id} sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'flex-start' }}
              spacing={1.5}
              mb={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={800} fontSize={{ xs: 16, sm: 20 }}>{po.po_number}</Typography>
                <Typography color="text.secondary" fontSize={{ xs: 13, sm: 14 }}>Vendor: {po.vendor_name}</Typography>
                <Typography color="text.secondary" fontSize={{ xs: 12, sm: 13 }}>{formatDate(po.created_at)}</Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip
                  label={po.status === 'failed' ? 'Sync failed' : 'Draft'}
                  color={statusColor(po.status)}
                  size="small"
                />
                <Button size="small" variant="contained" onClick={() => handleUploadOne(po.id)} disabled={syncOrder.isPending}>
                  Upload to Zoho
                </Button>
                <Button size="small" variant="outlined" onClick={() => setEditingPo(po)} disabled={syncOrder.isPending}>
                  Edit
                </Button>
                <Button size="small" variant="outlined" color="secondary" onClick={() => handlePrintReceipt(po)}>
                  Print Receipt
                </Button>
                <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(po.id)} disabled={deleteOrder.isPending}>
                  Delete
                </Button>
              </Stack>
            </Stack>

            {po.status === 'failed' && po.notes && (
              <Alert severity="error" sx={{ mb: 2 }}>{po.notes}</Alert>
            )}

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
                      <TableCell align="right">{li.rate ? (li.quantity * li.rate).toFixed(2) : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>

    <EditPurchaseOrderDialog
      po={editingPo}
      open={!!editingPo}
      onClose={() => setEditingPo(null)}
    />
    </Layout>
  );
}