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
} from '@mui/material';

import {
  Print,
  ShoppingCart,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import { usePurchaseOrders } from './hooks/usePurchaseOrders';
import { useDeletePurchaseOrder } from './hooks/useDeletePurchaseOrder';

import { ROUTES } from '../../app/config/constants';
import { WhatsAppStatusBadge } from '../purchase-orders/components/WhatsAppStatusBadge';
import { Layout } from '../../shared/components/Layout';

import {
  printReceipt,
  printAllReceipts,
} from './utils/printReceipt';


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}


export default function PurchaseOrdersSyncedPage() {

  const navigate = useNavigate();

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = usePurchaseOrders();

  const deleteOrder = useDeletePurchaseOrder();


  const synced = orders.filter(
    (o) => o.status === 'synced'
  );


  // ==========================================
  // PRINT ONE RECEIPT
  // ==========================================

  const handlePrintReceipt = (
    po: typeof synced[number]
  ) => {
    printReceipt(po);
  };


  // ==========================================
  // PRINT ALL RECEIPTS
  // ==========================================

  const handlePrintAll = () => {

    if (synced.length === 0) {
      alert(
        'There are no synced purchase orders to print.'
      );

      return;
    }

    printAllReceipts(synced);
  };


  // ==========================================
  // DELETE PURCHASE ORDER
  // ==========================================

  const handleDelete = async (
    id: string
  ) => {

    if (
      !window.confirm(
        'Delete this record? (This only removes it from this app — it stays in Zoho Books.)'
      )
    ) {
      return;
    }

    await deleteOrder.mutateAsync(id);

    refetch();
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {

    return (
      <Layout maxWidth={false}>
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2.5,
            sm: 3,
          },

          mb: 3,

          borderRadius: 3,

          border: '1px solid #dbe3f0',

          background:
            'linear-gradient(135deg, #f8faff 0%, #eef4ff 100%)',

          '@media print': {
            display: 'none',
          },
        }}
      >

        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'stretch',
            md: 'center',
          }}
          spacing={3}
        >

          {/* =====================================
              TITLE
              ===================================== */}

          <Box>

            <Typography
              sx={{
                fontSize: {
                  xs: 24,
                  sm: 28,
                  md: 32,
                },

                fontWeight: 800,

                color: '#0f2d5c',

                lineHeight: 1.2,

                mb: 0.7,
              }}
            >
              Synced Purchase Orders
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: 14,
                  sm: 16,
                },

                color: '#64748b',
              }}
            >
              Purchase orders already uploaded
              to Zoho Books.
            </Typography>

          </Box>


          {/* =====================================
              ACTION BUTTONS
              ===================================== */}

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.2}
            sx={{
              width: {
                xs: '100%',
                md: 'auto',
              },
            }}
          >

            {/* PRINT ALL */}

            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrintAll}
              disabled={synced.length === 0}
              sx={{
                minWidth: {
                  xs: '100%',
                  sm: 130,
                },

                height: 44,

                borderRadius: 2,

                textTransform: 'none',

                fontWeight: 700,

                backgroundColor: '#07579e',

                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: '#064a86',
                  boxShadow: 'none',
                },

                '&:disabled': {
                  backgroundColor: '#cbd5e1',
                  color: '#64748b',
                },
              }}
            >
              Print All
            </Button>

          </Stack>

        </Stack>

      </Paper>


      {/* =====================================================
          EMPTY STATE
          ===================================================== */}

      {synced.length === 0 && (

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,

            border: '1px solid #dbe3f0',

            overflow: 'hidden',

            backgroundColor: '#fff',
          }}
        >

          <Box
            sx={{
              py: {
                xs: 7,
                sm: 10,
              },

              px: 3,

              textAlign: 'center',

              background:
                'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)',
            }}
          >

            <Box
              sx={{
                width: 64,
                height: 64,

                borderRadius: '50%',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                mx: 'auto',
                mb: 2,

                backgroundColor: '#edf5ff',

                color: '#07579e',
              }}
            >
              <ShoppingCart
                sx={{
                  fontSize: 30,
                }}
              />
            </Box>


            <Typography
              sx={{
                fontSize: 21,
                fontWeight: 700,
                color: '#0f2d5c',
                mb: 0.8,
              }}
            >
              No Synced Purchase Orders
            </Typography>


            <Typography
              sx={{
                maxWidth: 520,
                mx: 'auto',
                color: '#64748b',
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              Nothing has been uploaded to Zoho Books yet.
              Once a purchase order is synced, it will
              appear here.
            </Typography>


            <Button
              variant="outlined"
              startIcon={<ShoppingCart />}
              onClick={() =>
                navigate(
                  ROUTES.PURCHASE_PLANNING
                )
              }
              sx={{
                mt: 3,

                borderRadius: 2,

                textTransform: 'none',

                fontWeight: 600,

                color: '#07579e',

                borderColor: '#9bb9df',

                '&:hover': {
                  backgroundColor: '#edf5ff',
                  borderColor: '#07579e',
                },
              }}
            >
              Go to Purchase Planning
            </Button>

          </Box>

        </Paper>

      )}


      {/* =====================================================
          SYNCED PURCHASE ORDERS
          ===================================================== */}

      {synced.length > 0 && (

        <Stack spacing={3}>

          {synced.map((po) => (

            <Paper
              key={po.id}
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },

                borderRadius: 3,

                border: '1px solid #dbe3f0',

                backgroundColor: '#fff',

                '@media print': {
                  boxShadow: 'none',
                  border: '1px solid #ccc',
                  pageBreakAfter: 'always',
                },
              }}
            >

              {/* =====================================
                  PO HEADER
                  ===================================== */}

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: 'stretch',
                  sm: 'flex-start',
                }}
                spacing={2}
                mb={2.5}
              >

                <Box>

                  <Typography
                    sx={{
                      fontSize: {
                        xs: 19,
                        sm: 23,
                      },

                      fontWeight: 800,

                      color: '#0f2d5c',

                      mb: 0.5,
                    }}
                  >
                    {po.po_number}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: 15,
                    }}
                  >
                    Vendor: {po.vendor_name}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: 13,
                    }}
                  >
                    {formatDate(po.created_at)}
                  </Typography>

                </Box>


                {/* =================================
                    PO ACTIONS
                    ================================= */}

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{
                    '@media print': {
                      display: 'none',
                    },
                  }}
                >

                  <Chip
                    label="Synced to Zoho"
                    color="success"
                    size="small"
                    sx={{
                      fontWeight: 600,
                    }}
                  />

                  <WhatsAppStatusBadge poId={po.id} poNumber={po.po_number} />


                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<Print />}
                    onClick={() =>
                      handlePrintReceipt(po)
                    }
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Print Receipt
                  </Button>


                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() =>
                      handleDelete(po.id)
                    }
                    disabled={
                      deleteOrder.isPending
                    }
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Delete
                  </Button>

                </Stack>

              </Stack>


              {/* =====================================
                  ITEMS TABLE
                  ===================================== */}

              <Box
                sx={{
                  overflowX: 'auto',
                }}
              >

                <Table size="small">

                  <TableHead>

                    <TableRow>

                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: '#07579e',
                          backgroundColor: '#f8faff',
                        }}
                      >
                        Item
                      </TableCell>


                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: '#07579e',
                          backgroundColor: '#f8faff',
                        }}
                      >
                        Quantity
                      </TableCell>


                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: '#07579e',
                          backgroundColor: '#f8faff',
                        }}
                      >
                        Rate
                      </TableCell>


                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: '#07579e',
                          backgroundColor: '#f8faff',
                        }}
                      >
                        Total
                      </TableCell>

                    </TableRow>

                  </TableHead>


                  <TableBody>

                    {po.items.map((li) => (

                      <TableRow key={li.id}>

                        <TableCell>
                          {li.item_name}
                        </TableCell>


                        <TableCell align="right">
                          {li.quantity}
                        </TableCell>


                        <TableCell align="right">
                          {li.rate ?? '—'}
                        </TableCell>


                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 600,
                          }}
                        >

                          {li.rate
                            ? (
                                li.quantity *
                                li.rate
                              ).toFixed(2)
                            : '—'}

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
    </Layout>
  );
}