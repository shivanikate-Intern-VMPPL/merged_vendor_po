import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { usePurchaseOrders } from './hooks/usePurchaseOrders';
import { useConvertDraftToOrder } from './hooks/useConvertDraftToOrder';
import { useDeletePurchaseOrder } from './hooks/useDeletePurchaseOrder';
import { useUpdateDraftLineItem } from './hooks/useUpdateDraftLineItem';
import { useUpdateDraftVendor } from './hooks/useUpdateDraftVendor';
import { useVendors } from './hooks/useVendors';
import { useItemCatalog, type ItemCatalogEntry } from './hooks/useItemCatalog';
import { VendorSelect } from './components/VendorSelect';
import { ItemSelect } from './components/ItemSelect';
import { ROUTES } from '../../app/config/constants';
import { Layout } from '../../shared/components/Layout';


function isBulkItem(entry: ItemCatalogEntry) {
  const name = entry.item_name?.toLowerCase() ?? '';

  const looksInactive =
    name.startsWith('inactive-') || entry.active === false;

  return !looksInactive && name.includes('bulk');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}


interface DraftValues {
  item_name: string;
  zoho_item_id: string | null;
  quantity: string;
  rate: string;
}


export default function PurchaseOrdersDraftsPage() {
  const navigate = useNavigate();

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = usePurchaseOrders();

  const drafts = orders.filter((o) => o.is_draft_only);

  const { data: rawCatalog = [] } = useItemCatalog();

  const { data: vendors = [] } = useVendors() as {
    data: Array<{
      id: string;
      name: string;
    }>;
  };

  const catalog = rawCatalog.filter(isBulkItem);

  const convertDraft = useConvertDraftToOrder();
  const deleteOrder = useDeletePurchaseOrder();
  const updateLineItem = useUpdateDraftLineItem();
  const updateVendor = useUpdateDraftVendor();

  const [editingLine, setEditingLine] = useState<string | null>(null);

  const [draftValues, setDraftValues] = useState<DraftValues>({
    item_name: '',
    zoho_item_id: null,
    quantity: '',
    rate: '',
  });

  const [lineError, setLineError] = useState<string | null>(null);


  const startEditLine = (
    poId: string,
    li: {
      id: string;
      item_name: string;
      quantity: number;
      rate: number | null;
    }
  ) => {
    setLineError(null);
    setEditingLine(`${poId}:${li.id}`);

    setDraftValues({
      item_name: li.item_name,
      zoho_item_id: null,
      quantity: li.quantity ? String(li.quantity) : '',
      rate: li.rate ? String(li.rate) : '',
    });
  };


  const cancelEditLine = () => {
    setEditingLine(null);
    setLineError(null);
  };


  const saveEditLine = async (lineItemId: string) => {
    setLineError(null);

    try {
      await updateLineItem.mutateAsync({
        lineItemId,
        updates: {
          item_name: draftValues.item_name,
          zoho_item_id: draftValues.zoho_item_id,
          quantity: Number(draftValues.quantity) || 0,
          rate: Number(draftValues.rate) || 0,
        },
      });

      setEditingLine(null);
      refetch();
    } catch (err) {
      setLineError(
        (err as Error).message || 'Failed to save changes.'
      );
    }
  };


  const handleVendorChange = async (
    poId: string,
    newVendorId: string | null
  ) => {
    if (!newVendorId) return;

    const vendor = vendors.find((v) => v.id === newVendorId);

    if (!vendor) return;

    await updateVendor.mutateAsync({
      poId,
      zohoVendorId: newVendorId,
      vendorName: vendor.name,
    });

    refetch();
  };


  const handleGenerate = async (id: string) => {
    await convertDraft.mutateAsync(id);
    navigate(ROUTES.PURCHASE_ORDERS_REVIEW);
  };


  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this draft?')) return;

    await deleteOrder.mutateAsync(id);
    refetch();
  };


  if (isLoading) {
    return (
      <Layout maxWidth={false}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }


  return (
    <Layout maxWidth={false}>
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, sm: 3 },
        pt: {
          xs: 2,
          sm: 2.5,
          md: 3,
        },
      }}
    >

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
        <Typography
          sx={{
            fontSize: { xs: 24, sm: 28, md: 32 },
            fontWeight: 800,
            color: '#0f2d5c',
            lineHeight: 1.2,
            mb: 0.7,
          }}
        >
          Draft Purchase Orders
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 14, sm: 16 },
            color: '#64748b',
          }}
        >
          Edit vendor, items, quantity, or rate before generating.
          Click "Generate Purchase Order" when ready.
        </Typography>
      </Paper>


      {/* ERROR */}
      {lineError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setLineError(null)}
        >
          {lineError}
        </Alert>
      )}


      {/* EMPTY STATE */}
      {drafts.length === 0 && (
        <Alert severity="info">
          No saved drafts. Select items on Purchase Planning and
          click "Save Draft".
        </Alert>
      )}


      {/* DRAFT PURCHASE ORDERS */}
      <Stack spacing={3}>

        {drafts.map((po) => (

          <Paper
            key={po.id}
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              borderRadius: 2,
            }}
          >

            {/* PO HEADER */}
            <Stack
              direction={{
                xs: 'column',
                md: 'row',
              }}
              justifyContent="space-between"
              alignItems={{
                xs: 'stretch',
                md: 'flex-start',
              }}
              spacing={{
                xs: 2,
                md: 3,
              }}
              mb={3}
            >

              {/* PO DETAILS */}
              <Box
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  maxWidth: {
                    xs: '100%',
                    md: 360,
                  },
                }}
              >

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 0.3,
                    textAlign: {
                      xs: 'center',
                      md: 'left',
                    },
                  }}
                >
                  {po.po_number}
                </Typography>


                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: 12, sm: 13 },
                    mb: 1.5,
                    textAlign: {
                      xs: 'center',
                      md: 'left',
                    },
                  }}
                >
                  {formatDate(po.created_at)}
                </Typography>


                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    textAlign: {
                      xs: 'center',
                      md: 'left',
                    },
                  }}
                >
                  Vendor
                </Typography>


                <VendorSelect
                  vendors={vendors}
                  value={
                    vendors.find(
                      (v) => v.name === po.vendor_name
                    )?.id ?? null
                  }
                  onChange={(vendorId) =>
                    handleVendorChange(po.id, vendorId)
                  }
                />

              </Box>


              {/* ACTION BUTTONS */}
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1}
                alignItems={{
                  xs: 'stretch',
                  sm: 'center',
                }}
                sx={{
                  width: {
                    xs: '100%',
                    sm: 'auto',
                  },
                }}
              >

                <Chip
                  label="Draft"
                  color="warning"
                  size="small"
                  sx={{
                    alignSelf: {
                      xs: 'flex-start',
                      sm: 'center',
                    },
                  }}
                />

                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleGenerate(po.id)}
                  disabled={convertDraft.isPending}
                  sx={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  Generate Purchase Order
                </Button>

                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => handleDelete(po.id)}
                  disabled={deleteOrder.isPending}
                  sx={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  Delete
                </Button>

              </Stack>

            </Stack>


            {/* ITEMS TABLE */}
            <Box
              sx={{
                width: '100%',
                overflowX: 'auto',
              }}
            >

              <Table
                size="small"
                sx={{
                  minWidth: 650,
                }}
              >

                <TableHead>
                  <TableRow>

                    <TableCell>
                      Item
                    </TableCell>

                    <TableCell align="right">
                      Quantity
                    </TableCell>

                    <TableCell align="right">
                      Rate
                    </TableCell>

                    <TableCell align="right">
                      Total
                    </TableCell>

                    <TableCell align="right">
                      Action
                    </TableCell>

                  </TableRow>
                </TableHead>


                <TableBody>

                  {po.items.map((li) => {

                    const key = `${po.id}:${li.id}`;

                    const isEditing =
                      editingLine === key;

                    return (

                      <TableRow key={li.id}>

                        {isEditing ? (

                          <>

                            <TableCell
                              sx={{
                                minWidth: 220,
                              }}
                            >

                              <ItemSelect
                                catalog={catalog}
                                value={draftValues.item_name}
                                onChange={(picked) =>
                                  setDraftValues((v) => ({
                                    ...v,
                                    item_name:
                                      picked?.item_name ??
                                      v.item_name,
                                    zoho_item_id:
                                      picked?.zoho_item_id ??
                                      null,
                                  }))
                                }
                              />

                            </TableCell>


                            <TableCell align="right">

                              <TextField
                                size="small"
                                type="number"
                                value={draftValues.quantity}
                                onChange={(e) =>
                                  setDraftValues((v) => ({
                                    ...v,
                                    quantity: e.target.value,
                                  }))
                                }
                                sx={{
                                  width: 90,
                                }}
                              />

                            </TableCell>


                            <TableCell align="right">

                              <TextField
                                size="small"
                                type="number"
                                value={draftValues.rate}
                                onChange={(e) =>
                                  setDraftValues((v) => ({
                                    ...v,
                                    rate: e.target.value,
                                  }))
                                }
                                sx={{
                                  width: 90,
                                }}
                              />

                            </TableCell>


                            <TableCell align="right">

                              {(
                                (Number(
                                  draftValues.quantity
                                ) || 0) *
                                (Number(
                                  draftValues.rate
                                ) || 0)
                              ).toFixed(2)}

                            </TableCell>


                            <TableCell align="right">

                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                              >

                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() =>
                                    saveEditLine(li.id)
                                  }
                                  disabled={
                                    updateLineItem.isPending
                                  }
                                >
                                  {updateLineItem.isPending
                                    ? 'Saving…'
                                    : 'Save'}
                                </Button>

                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={cancelEditLine}
                                >
                                  Cancel
                                </Button>

                              </Stack>

                            </TableCell>

                          </>

                        ) : (

                          <>

                            <TableCell>
                              {li.item_name}
                            </TableCell>

                            <TableCell align="right">
                              {li.quantity}
                            </TableCell>

                            <TableCell align="right">
                              {li.rate ?? '—'}
                            </TableCell>

                            <TableCell align="right">
                              {li.rate
                                ? (
                                    li.quantity *
                                    li.rate
                                  ).toFixed(2)
                                : '—'}
                            </TableCell>

                            <TableCell align="right">

                              <Button
                                size="small"
                                onClick={() =>
                                  startEditLine(
                                    po.id,
                                    li
                                  )
                                }
                              >
                                Edit
                              </Button>

                            </TableCell>

                          </>

                        )}

                      </TableRow>

                    );
                  })}

                </TableBody>

              </Table>

            </Box>

          </Paper>

        ))}

      </Stack>

    </Box>
    </Layout>
  );
}