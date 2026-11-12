// import { useMemo, useState } from 'react';
// import {
//   Box,
//   // Button
//   Stack,
//   Typography,
//   Alert,
// } from '@mui/material';

// import { Layout } from '../../shared/components/Layout';
// import { PurchasePlanningStats } from './components/PurchasePlanningStats';
// import { ItemsTable } from './components/ItemsTable';
// import { PurchasePlanningFooter } from './components/PurchasePlanningFooter';

// import { usePurchaseItems } from './hooks/usePurchaseItems';
// import { useVendors } from './hooks/useVendors';
// import { useAssignVendor } from './hooks/useAssignVendor';
// import { useRenameItem } from './hooks/useRenameItem';
// import { useUpdateItemDetails } from './hooks/useUpdateItemDetails';
// import { useAddItem } from './hooks/useAddItem';
// import { useDeleteItem } from './hooks/useDeleteItem';
// import { useGeneratePurchaseOrders } from './hooks/useGeneratePurchaseOrders';
// import { useItemCatalog, type ItemCatalogEntry } from './hooks/useItemCatalog';

// import type { Item } from '../../shared/types/domain';
// import { useNavigate } from 'react-router-dom';
// import { ROUTES } from '../../app/config/constants';

// function isEligibleBulkItem(item: ItemCatalogEntry) {
//   return item.active && item.item_name.toLowerCase().includes('bulk');
// }

// export default function PurchasePlanningPage() {
//   // const theme = useTheme();

//   // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   // const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

//   const {
//     data: requiredItems = [],
//     isLoading: itemsLoading,
//     refetch,
//   } = usePurchaseItems();

//   const { data: catalog = [], isLoading: catalogLoading, error: catalogError } = useItemCatalog();
//   const items = useMemo(() => {
//     const eligibleCatalog = catalog.filter(isEligibleBulkItem);
//     const allowedZohoIds = new Set(eligibleCatalog.map((item) => item.zoho_item_id));
//     const allowedItemNames = new Set(eligibleCatalog.map((item) => item.item_name.toLowerCase()));

//     return requiredItems.filter((item) =>
//       !item.item_name.trim() || (item.zoho_item_id
//         ? allowedZohoIds.has(item.zoho_item_id)
//         : allowedItemNames.has(item.item_name.toLowerCase()))
//     );
//   }, [catalog, requiredItems]);

//   const {
//     data: vendors = [],
//     isLoading: vendorsLoading,
//   } = useVendors();

//   const assignVendor = useAssignVendor();
//   const renameItem = useRenameItem();
//   const updateItemDetails = useUpdateItemDetails();
//   const addItem = useAddItem();
//   const deleteItem = useDeleteItem();
//   const generateOrders = useGeneratePurchaseOrders();

//   const navigate = useNavigate();

//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const assignedCount = useMemo(
//     () => items.filter((i: Item) => i.vendor_id).length,
//     [items]
//   );

//   const pendingCount = items.length - assignedCount;

//   const toggleSelect = (id: string) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);

//       next.has(id)
//         ? next.delete(id)
//         : next.add(id);

//       return next;
//     });
//   };

//   const toggleSelectAll = (checked: boolean) => {
//     setSelectedIds(
//       checked
//         ? new Set(items.map((i: Item) => i.id))
//         : new Set()
//     );
//   };

//   const handleGenerate = async () => {
//     setErrorMessage(null);

//     const eligible = items.filter(
//       (i: Item) => i.vendor_id
//     );

//     if (eligible.length === 0) {
//       setErrorMessage(
//         'Assign a vendor to at least one item first.'
//       );
//       return;
//     }

//     try {
//       await generateOrders.mutateAsync({
//         items: eligible,
//         vendors,
//         isDraftOnly: false,
//       });

//       setSelectedIds(new Set());
//       await refetch();

//       navigate(ROUTES.PURCHASE_ORDERS_REVIEW);
//     } catch (err) {
//       setErrorMessage(
//         (err as Error).message ||
//           'Failed to generate purchase orders.'
//       );
//     }
//   };

//   const handleSaveDraft = async () => {
//     setErrorMessage(null);

//     const selected = items.filter(
//       (i: Item) =>
//         selectedIds.has(i.id) &&
//         i.vendor_id
//     );

//     if (selected.length === 0) {
//       setErrorMessage(
//         'Select at least one item with a vendor assigned to save as a draft.'
//       );
//       return;
//     }

//     try {
//       await generateOrders.mutateAsync({
//         items: selected,
//         vendors,
//         isDraftOnly: true,
//       });

//       setSelectedIds(new Set());
//       await refetch();

//       navigate(ROUTES.PURCHASE_ORDERS_DRAFTS);
//     } catch (err) {
//       setErrorMessage(
//         (err as Error).message ||
//           'Failed to save draft.'
//       );
//     }
//   };

//   return (
//     <Layout maxWidth={false}>
//     <Box
//       sx={{
//         width: '100%',
//         maxWidth: '100%',
//         minWidth: 0,
//         overflowX: 'hidden',

//         px: {
//           xs: 1,
//           sm: 1.5,
//           md: 1.5,
//         },

//         pb: {
//           xs: 14,
//           sm: 5,
//           md: 4,
//         },

//         pt: {
//           xs: 1,
//           sm: 1.5,
//           md: 2,
//         },

//         boxSizing: 'border-box',
//       }}
//     >

//       {/* =========================================================
//           HEADER — single row: title+description left.
//       ========================================================= */}

//       <Stack
//         direction={{
//           xs: 'column',
//           md: 'row',
//         }}
//         justifyContent="space-between"
//         alignItems={{
//           xs: 'stretch',
//           md: 'center',
//         }}
//         spacing={{
//           xs: 1.5,
//           sm: 2,
//         }}
//         mb={{
//           xs: 2,
//           sm: 2.5,
//           md: 3,
//         }}
//         sx={{
//           width: '100%',
//           minWidth: 0,
//         }}
//       >
//         <Box
//           sx={{
//             minWidth: 0,
//             flex: 1,

//             textAlign: {
//               xs: 'center',
//               md: 'left',
//             },

//             display: 'flex',
//             alignItems: 'baseline',
//             flexWrap: 'wrap',
//             gap: 1,
//           }}
//         >
//           <Typography
//             variant="h5"
//             fontWeight={800}
//             sx={{
//               fontSize: {
//                 xs: '1.55rem',
//                 sm: '1.9rem',
//                 md: '1.8rem',
//               },

//               lineHeight: 1.15,

//               color: '#062B59',

//               wordBreak: 'break-word',
//             }}
//           >
//            Bulk Items Purchase Planning
//           </Typography>

//           <Typography
//             color="text.secondary"
//             sx={{
//               fontSize: {
//                 xs: '0.78rem',
//                 sm: '0.85rem',
//                 md: '0.88rem',
//               },

//               lineHeight: 1.45,
//             }}
//           >
//             Assign vendors to required items and automatically generate Purchase Orders.
//           </Typography>
//         </Box>
//       </Stack>

//       {errorMessage && (
//         <Alert
//           severity="error"
//           sx={{
//             mb: 2.5,

//             borderRadius: 2,

//             fontSize: {
//               xs: '0.78rem',
//               sm: '0.9rem',
//             },
//           }}
//           onClose={() =>
//             setErrorMessage(null)
//           }
//         >
//           {errorMessage}
//         </Alert>
//       )}

//       {catalogError && (
//         <Alert severity="error" sx={{ mb: 2.5 }}>
//           Unable to verify active Zoho items. Purchase requirements are hidden until the item catalog can be checked.
//         </Alert>
//       )}

//       <Box
//         mb={{
//           xs: 2,
//           sm: 2.5,
//           md: 3,
//         }}
//         sx={{
//           width: '100%',
//           minWidth: 0,

//           '& > *': {
//             width: '100%',
//             maxWidth: '100%',
//             minWidth: 0,
//           },
//         }}
//       >
//         <PurchasePlanningStats
//           items={items}
//         />
//       </Box>

//       <Box
//         mb={{
//           xs: 2,
//           sm: 3,
//         }}
//         sx={{
//           width: '100%',
//           maxWidth: '100%',
//           minWidth: 0,

//           overflowX: 'auto',

//           WebkitOverflowScrolling: 'touch',

//           '& > *': {
//             minWidth: 0,
//             maxWidth: '100%',
//           },
//         }}
//       >
//         <ItemsTable
//           items={items}
//           vendors={vendors}
//           selectedIds={selectedIds}
//           onToggleSelect={toggleSelect}
//           onToggleSelectAll={toggleSelectAll}

//           onAssignVendor={(itemId, vendorId) =>
//             assignVendor.mutate({
//               itemId,
//               vendorId,
//             })
//           }

//           onRenameItem={(itemId, picked) =>
//             renameItem.mutate({
//               itemId,
//               itemName:
//                 picked?.item_name ?? '',
//               unit:
//                 picked?.unit ?? 'Kg',
//               zohoItemId:
//                 picked?.zoho_item_id ?? null,
//             })
//           }

//           onUpdateQty={(itemId, qty) =>
//             updateItemDetails.mutate({
//               itemId,
//               requiredQty: qty,
//             })
//           }

//           onUpdateUnit={(itemId, unit) =>
//             updateItemDetails.mutate({
//               itemId,
//               unit,
//             })
//           }

//           onUpdateRate={(itemId, rate) =>
//             updateItemDetails.mutate({
//               itemId,
//               rate,
//             })
//           }

//           onAddItem={() =>
//             addItem.mutate()
//           }

//           onDeleteItem={(itemId) =>
//             deleteItem.mutate(itemId)
//           }

//           onRefresh={() =>
//             refetch()
//           }
//         />
//       </Box>

//       <Box
//         sx={{
//           mt: {
//             xs: 2,
//             sm: 3,
//           },

//           mx: {
//             xs: -1.5,
//             sm: -2.5,
//             md: -3,
//           },

//           width: {
//             xs: 'calc(100% + 12px)',
//             sm: 'calc(100% + 40px)',
//             md: 'calc(100% + 48px)',
//           },

//           maxWidth: 'none',

//           overflow: 'hidden',
//         }}
//       >
//         <PurchasePlanningFooter
//           totalItems={items.length}
//           assignedCount={assignedCount}
//           pendingCount={pendingCount}
//           onSaveDraft={handleSaveDraft}
//           onGenerate={handleGenerate}
//           isGenerating={
//             generateOrders.isPending
//           }
//         />
//       </Box>

//       {(itemsLoading || vendorsLoading || catalogLoading) && (
//         <Typography
//           color="text.secondary"
//           mt={2}
//           sx={{
//             textAlign: {
//               xs: 'center',
//               sm: 'left',
//             },

//             fontSize: {
//               xs: '0.78rem',
//               sm: '0.9rem',
//             },
//           }}
//         >
//           Loading purchase data…
//         </Typography>
//       )}
//     </Box>
//     </Layout>
//   );
// }
import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Alert,
} from '@mui/material';

import { BulkPOUploadModal } from './components/BulkPOUploadModal';
import { BulkPOPreviewDialog } from './components/BulkPOPreviewDialog';
import { generateBulkPOTemplate } from './utils/bulkPOValidation';
import type { ValidatedBulkRow, ActiveVendor } from './utils/bulkPOValidation';
import { DownloadIcon, UploadIcon } from '../../shared/components/icons';

import { Layout } from '../../shared/components/Layout';
import { PurchasePlanningStats } from './components/PurchasePlanningStats';
import { ItemsTable } from './components/ItemsTable';
import { PurchasePlanningFooter } from './components/PurchasePlanningFooter';

import { usePurchaseItems } from './hooks/usePurchaseItems';
import { useVendors } from './hooks/useVendors';
import { useAssignVendor } from './hooks/useAssignVendor';
import { useRenameItem } from './hooks/useRenameItem';
import { useUpdateItemDetails } from './hooks/useUpdateItemDetails';
import { useAddItem } from './hooks/useAddItem';
import { useDeleteItem } from './hooks/useDeleteItem';
import { useGeneratePurchaseOrders } from './hooks/useGeneratePurchaseOrders';
import { isEligibleCatalogItem, useItemCatalog } from './hooks/useItemCatalog';

import type { Item } from '../../shared/types/domain';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/config/constants';

export default function PurchasePlanningPage() {
  const {
    data: requiredItems = [],
    isLoading: itemsLoading,
    refetch,
  } = usePurchaseItems();

  const { data: catalog = [], isLoading: catalogLoading, error: catalogError } = useItemCatalog();
  const items = useMemo(() => {
    const eligibleCatalog = catalog.filter(isEligibleCatalogItem);
    const allowedZohoIds = new Set(eligibleCatalog.map((item) => item.zoho_item_id));
    const allowedItemNames = new Set(eligibleCatalog.map((item) => item.item_name.toLowerCase()));

    return requiredItems.filter((item) =>
      !item.item_name.trim() || (item.zoho_item_id
        ? allowedZohoIds.has(item.zoho_item_id)
        : allowedItemNames.has(item.item_name.toLowerCase()))
    );
  }, [catalog, requiredItems]);

  const {
    data: vendors = [],
    isLoading: vendorsLoading,
  } = useVendors();

  const assignVendor = useAssignVendor();
  const renameItem = useRenameItem();
  const updateItemDetails = useUpdateItemDetails();
  const addItem = useAddItem();
  const deleteItem = useDeleteItem();
  const generateOrders = useGeneratePurchaseOrders();

  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bulk PO Upload & Preview state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [parsedBulkRows, setParsedBulkRows] = useState<ValidatedBulkRow[]>([]);
  const [isLegacySheet, setIsLegacySheet] = useState(false);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  const handleDownloadTemplate = () => {
    try {
      const templateData = generateBulkPOTemplate(vendors as any, catalog);
      const blob = new Blob([templateData as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bulk_PO_Upload_Template_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage('Failed to generate template file. Please try again.');
    }
  };

  const handleBulkParsed = (result: { rows: ValidatedBulkRow[]; isLegacyTemplate: boolean }) => {
    setParsedBulkRows(result.rows);
    setIsLegacySheet(result.isLegacyTemplate);
    setIsPreviewDialogOpen(true);
  };

  const handleConfirmGenerateBulk = async (readyRows: ValidatedBulkRow[], isDraftOnly: boolean) => {
    setIsSubmittingBulk(true);
    setErrorMessage(null);

    try {
      const itemsToCreate: Item[] = readyRows.map((r) => ({
        id: crypto.randomUUID(),
        item_name: r.resolvedItemName || r.raw.article || 'Item',
        required_qty: r.resolvedQty,
        unit: r.resolvedUnit || 'Kg',
        vendor_id: r.resolvedVendorId,
        rate: r.resolvedRate,
        zoho_item_id: r.resolvedItemId,
        vendor_name: r.resolvedVendorName,
        status: 'assigned',
      }));

      // Combine vendors list to ensure all resolved vendors have their names mapped
      const vendorMap = new Map<string, any>();
      for (const v of vendors) {
        vendorMap.set(v.id, v);
      }
      for (const r of readyRows) {
        if (r.resolvedVendorId && !vendorMap.has(r.resolvedVendorId)) {
          vendorMap.set(r.resolvedVendorId, {
            id: r.resolvedVendorId,
            name: r.resolvedVendorName || 'Vendor ' + r.resolvedVendorId,
          });
        }
      }

      await generateOrders.mutateAsync({
        items: itemsToCreate,
        vendors: Array.from(vendorMap.values()),
        isDraftOnly,
      });

      setIsPreviewDialogOpen(false);
      await refetch();

      if (isDraftOnly) {
        navigate(ROUTES.PURCHASE_ORDERS_DRAFTS);
      } else {
        navigate(ROUTES.PURCHASE_ORDERS_REVIEW);
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to create bulk purchase orders.');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Shown when saving a change fails. The list reloads, so the screen shows
  // the value that is really saved.
  const showSaveError = () =>
    setErrorMessage('Could not save your change, so it was undone. Please try again.');

  const assignedCount = useMemo(
    () => items.filter((i: Item) => i.vendor_id).length,
    [items]
  );

  const pendingCount = items.length - assignedCount;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      next.has(id)
        ? next.delete(id)
        : next.add(id);

      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(
      checked
        ? new Set(items.map((i: Item) => i.id))
        : new Set()
    );
  };

  const handleGenerate = async () => {
    setErrorMessage(null);

    const eligible = items.filter(
      (i: Item) => i.vendor_id
    );

    if (eligible.length === 0) {
      setErrorMessage(
        'Assign a vendor to at least one item first.'
      );
      return;
    }

    try {
      await generateOrders.mutateAsync({
        items: eligible,
        vendors,
        isDraftOnly: false,
      });

      setSelectedIds(new Set());
      await refetch();

      navigate(ROUTES.PURCHASE_ORDERS_REVIEW);
    } catch (err) {
      setErrorMessage(
        (err as Error).message ||
          'Failed to generate purchase orders.'
      );
    }
  };

  const handleSaveDraft = async () => {
    setErrorMessage(null);

    const selected = items.filter(
      (i: Item) =>
        selectedIds.has(i.id) &&
        i.vendor_id
    );

    if (selected.length === 0) {
      setErrorMessage(
        'Select at least one item with a vendor assigned to save as a draft.'
      );
      return;
    }

    try {
      await generateOrders.mutateAsync({
        items: selected,
        vendors,
        isDraftOnly: true,
      });

      setSelectedIds(new Set());
      await refetch();

      navigate(ROUTES.PURCHASE_ORDERS_DRAFTS);
    } catch (err) {
      setErrorMessage(
        (err as Error).message ||
          'Failed to save draft.'
      );
    }
  };

  return (
    <Layout maxWidth={false}>
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflowX: 'hidden',

        px: {
          xs: 1,
          sm: 1.5,
          md: 1.5,
        },

        pb: {
          xs: 14,
          sm: 5,
          md: 4,
        },

        pt: {
          xs: 1,
          sm: 1.5,
          md: 2,
        },

        boxSizing: 'border-box',
      }}
    >

      {/* =========================================================
          HEADER — single row: title+description left.
      ========================================================= */}

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
        spacing={{
          xs: 1.5,
          sm: 2,
        }}
        mb={{
          xs: 2,
          sm: 2.5,
          md: 3,
        }}
        sx={{
          width: '100%',
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            flex: 1,

            textAlign: {
              xs: 'center',
              md: 'left',
            },

            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: '1.55rem',
                sm: '1.9rem',
                md: '1.8rem',
              },

              lineHeight: 1.15,

              color: '#062B59',

              wordBreak: 'break-word',
            }}
          >
           Bulk Items Purchase Planning
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: {
                xs: '0.78rem',
                sm: '0.85rem',
                md: '0.88rem',
              },

              lineHeight: 1.45,
            }}
          >
            Assign vendors to required items and automatically generate Purchase Orders.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mt: { xs: 1, md: 0 } }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleDownloadTemplate}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderColor: 'divider',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            }}
          >
            Download Template
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadIcon fontSize="small" />}
            onClick={() => setIsUploadModalOpen(true)}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: '#062B59',
              '&:hover': { bgcolor: '#041c3b' },
            }}
          >
            Bulk PO Upload
          </Button>
        </Stack>
      </Stack>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,

            borderRadius: 2,

            fontSize: {
              xs: '0.78rem',
              sm: '0.9rem',
            },
          }}
          onClose={() =>
            setErrorMessage(null)
          }
        >
          {errorMessage}
        </Alert>
      )}

      {catalogError && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          Unable to verify active Zoho items. Purchase requirements are hidden until the item catalog can be checked.
        </Alert>
      )}

      <Box
        mb={{
          xs: 2,
          sm: 2.5,
          md: 3,
        }}
        sx={{
          width: '100%',
          minWidth: 0,

          '& > *': {
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          },
        }}
      >
        <PurchasePlanningStats
          items={items}
        />
      </Box>

      <Box
        mb={{
          xs: 2,
          sm: 3,
        }}
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,

          overflowX: 'auto',

          WebkitOverflowScrolling: 'touch',

          '& > *': {
            minWidth: 0,
            maxWidth: '100%',
          },
        }}
      >
        <ItemsTable
          items={items}
          vendors={vendors}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}

          onAssignVendor={(itemId, vendorId) =>
            assignVendor.mutate(
              { itemId, vendorId },
              { onError: showSaveError }
            )
          }

          onRenameItem={(itemId, picked) =>
            renameItem.mutate(
              {
                itemId,
                itemName: picked?.item_name ?? '',
                unit: picked?.unit ?? 'Kg',
                zohoItemId: picked?.zoho_item_id ?? null,
              },
              { onError: showSaveError }
            )
          }

          onUpdateQty={(itemId, qty) =>
            updateItemDetails.mutate(
              { itemId, requiredQty: qty },
              { onError: showSaveError }
            )
          }

          onUpdateUnit={(itemId, unit) =>
            updateItemDetails.mutate(
              { itemId, unit },
              { onError: showSaveError }
            )
          }

          onUpdateRate={(itemId, rate) =>
            updateItemDetails.mutate(
              { itemId, rate },
              { onError: showSaveError }
            )
          }

          onAddItem={() =>
            addItem.mutate(undefined, { onError: showSaveError })
          }

          onDeleteItem={(itemId) =>
            deleteItem.mutate(itemId, { onError: showSaveError })
          }

          onRefresh={() =>
            refetch()
          }
        />
      </Box>

      <Box
        sx={{
          mt: {
            xs: 2,
            sm: 3,
          },

          mx: {
            xs: -1.5,
            sm: -2.5,
            md: -3,
          },

          width: {
            xs: 'calc(100% + 12px)',
            sm: 'calc(100% + 40px)',
            md: 'calc(100% + 48px)',
          },

          maxWidth: 'none',

          overflow: 'hidden',
        }}
      >
        <PurchasePlanningFooter
          totalItems={items.length}
          assignedCount={assignedCount}
          pendingCount={pendingCount}
          onSaveDraft={handleSaveDraft}
          onGenerate={handleGenerate}
          isGenerating={
            generateOrders.isPending
          }
        />
      </Box>

      {(itemsLoading || vendorsLoading || catalogLoading) && (
        <Typography
          color="text.secondary"
          mt={2}
          sx={{
            textAlign: {
              xs: 'center',
              sm: 'left',
            },

            fontSize: {
              xs: '0.78rem',
              sm: '0.9rem',
            },
          }}
        >
          Loading purchase data…
        </Typography>
      )}

      {/* Bulk PO Upload & Preview Dialogs */}
      <BulkPOUploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        vendors={vendors as any}
        items={catalog}
        onParsed={handleBulkParsed}
      />

      <BulkPOPreviewDialog
        open={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        rows={parsedBulkRows}
        isLegacyTemplate={isLegacySheet}
        allVendors={vendors as any}
        onConfirmGenerate={handleConfirmGenerateBulk}
        isSubmitting={isSubmittingBulk}
      />
    </Box>
    </Layout>
  );
}