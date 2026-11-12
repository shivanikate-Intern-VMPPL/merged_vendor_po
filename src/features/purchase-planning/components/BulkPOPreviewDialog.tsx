import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Alert,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  generateErrorReport,
} from '../utils/bulkPOValidation';
import type {
  ValidatedBulkRow,
  RowValidationStatus,
  ActiveVendor,
} from '../utils/bulkPOValidation';
import { DownloadIcon, CheckIcon, AlertTriangleIcon, CloseIcon } from '../../../shared/components/icons';

interface Props {
  open: boolean;
  onClose: () => void;
  rows: ValidatedBulkRow[];
  isLegacyTemplate: boolean;
  allVendors: ActiveVendor[];
  onConfirmGenerate: (validRows: ValidatedBulkRow[], isDraftOnly: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

export function BulkPOPreviewDialog({
  open,
  onClose,
  rows: initialRows,
  isLegacyTemplate,
  allVendors,
  onConfirmGenerate,
  isSubmitting = false,
}: Props) {
  const [rows, setRows] = useState<ValidatedBulkRow[]>(initialRows);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Keep internal rows in sync when initialRows prop updates
  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  // Handle user resolution of an ambiguous row
  const handleResolveAmbiguousVendor = (rowNumber: number, selectedVendorId: string) => {
    const pickedVendor = allVendors.find((v) => v.id === selectedVendorId);
    if (!pickedVendor) return;

    setRows((prev) =>
      prev.map((r) => {
        if (r.rowNumber !== rowNumber) return r;

        // Check if there are other errors remaining (e.g. missing item or rate)
        const nonVendorErrors = r.reasons.filter(
          (reason) => !reason.toLowerCase().includes('mobile') && !reason.toLowerCase().includes('ambiguous') && !reason.toLowerCase().includes('vendor')
        );

        const hasRemainingErrors = nonVendorErrors.length > 0 || !r.resolvedItemId || !r.resolvedQty || !r.resolvedRate;
        const newStatus: RowValidationStatus = hasRemainingErrors ? 'ERROR' : 'OK';

        return {
          ...r,
          status: newStatus,
          resolvedVendorId: pickedVendor.id,
          resolvedVendorName: pickedVendor.name,
          resolvedVendorMobile: pickedVendor.mobile || pickedVendor.phone || r.resolvedVendorMobile,
          reasons: hasRemainingErrors
            ? [`Resolved vendor manually: ${pickedVendor.name}`, ...nonVendorErrors]
            : [`Resolved vendor manually: ${pickedVendor.name}`],
        };
      })
    );
  };

  // Counts
  const totalCount = rows.length;
  const okCount = rows.filter((r) => r.status === 'OK').length;
  const ambiguousCount = rows.filter((r) => r.status === 'AMBIGUOUS').length;
  const errorCount = rows.filter((r) => r.status === 'ERROR').length;
  const skippedCount = rows.filter((r) => r.status === 'SKIPPED').length;

  // Filtered rows for current view
  const filteredRows = useMemo(() => {
    let result = rows;

    if (activeTab === 'ok') {
      result = result.filter((r) => r.status === 'OK');
    } else if (activeTab === 'ambiguous') {
      result = result.filter((r) => r.status === 'AMBIGUOUS');
    } else if (activeTab === 'error') {
      result = result.filter((r) => r.status === 'ERROR');
    } else if (activeTab === 'skipped') {
      result = result.filter((r) => r.status === 'SKIPPED');
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.resolvedVendorName && r.resolvedVendorName.toLowerCase().includes(q)) ||
          (r.resolvedVendorId && r.resolvedVendorId.toLowerCase().includes(q)) ||
          (r.resolvedItemName && r.resolvedItemName.toLowerCase().includes(q)) ||
          (r.resolvedItemId && r.resolvedItemId.toLowerCase().includes(q)) ||
          (r.raw.vendorMobile && r.raw.vendorMobile.includes(q)) ||
          (r.raw.article && r.raw.article.toLowerCase().includes(q)) ||
          r.reasons.some((reason) => reason.toLowerCase().includes(q))
      );
    }

    return result;
  }, [rows, activeTab, search]);

  // Valid rows ready to proceed (OK rows)
  const readyRows = useMemo(() => rows.filter((r) => r.status === 'OK'), [rows]);

  // Download error report handler
  const handleDownloadErrorReport = () => {
    const errorData = generateErrorReport(rows);
    const blob = new Blob([errorData as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bulk_PO_Validation_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusChip = (status: RowValidationStatus) => {
    switch (status) {
      case 'OK':
        return <Chip label="OK" size="small" color="success" sx={{ fontWeight: 700 }} />;
      case 'AMBIGUOUS':
        return (
          <Chip
            label="Ambiguous"
            size="small"
            color="warning"
            sx={{ fontWeight: 700 }}
          />
        );
      case 'ERROR':
        return <Chip label="Error" size="small" color="error" sx={{ fontWeight: 700 }} />;
      case 'SKIPPED':
        return <Chip label="Skipped" size="small" variant="outlined" sx={{ fontWeight: 600, color: 'text.secondary' }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#062B59">
              Bulk PO Upload — Preview & Validation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review resolved vendor and item IDs before Purchase Orders are generated.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={handleDownloadErrorReport}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Download Error Report (xlsx)
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Legacy Sheet Notice */}
        {isLegacyTemplate && (
          <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
            <Typography variant="body2" fontWeight={700}>
              Old Name-Based Sheet Detected
            </Typography>
            <Typography variant="caption" display="block">
              The uploaded file does not include <code>Vendor ID</code> or <code>Item ID</code> columns.
              Rows have been auto-mapped by name/mobile for your confirmation. No Purchase Orders will be created without your review.
            </Typography>
          </Alert>
        )}

        {/* Ambiguous Callout Banner */}
        {ambiguousCount > 0 && (
          <Alert severity="info" sx={{ borderRadius: 1.5 }}>
            <Typography variant="body2" fontWeight={700}>
              {ambiguousCount} row{ambiguousCount > 1 ? 's have' : ' has'} ambiguous vendor mobile numbers.
            </Typography>
            <Typography variant="caption" display="block">
              Per business rules, multiple vendors share this mobile number. Please select the intended vendor in the dropdown below for each row to proceed.
            </Typography>
          </Alert>
        )}

        {/* Metric Badges */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Paper variant="outlined" sx={{ p: 1.5, minWidth: 110, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL ROWS</Typography>
            <Typography variant="h6" fontWeight={800}>{totalCount}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, minWidth: 110, textAlign: 'center', borderRadius: 2, borderColor: 'success.light', bgcolor: 'success.50' }}>
            <Typography variant="caption" color="success.dark" fontWeight={700}>READY (OK)</Typography>
            <Typography variant="h6" fontWeight={800} color="success.main">{okCount}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, minWidth: 110, textAlign: 'center', borderRadius: 2, borderColor: 'warning.light', bgcolor: 'warning.50' }}>
            <Typography variant="caption" color="warning.dark" fontWeight={700}>AMBIGUOUS</Typography>
            <Typography variant="h6" fontWeight={800} color="warning.main">{ambiguousCount}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, minWidth: 110, textAlign: 'center', borderRadius: 2, borderColor: 'error.light', bgcolor: 'error.50' }}>
            <Typography variant="caption" color="error.dark" fontWeight={700}>ERRORS</Typography>
            <Typography variant="h6" fontWeight={800} color="error.main">{errorCount}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, minWidth: 110, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>SKIPPED (NO QTY)</Typography>
            <Typography variant="h6" fontWeight={800} color="text.secondary">{skippedCount}</Typography>
          </Paper>
        </Stack>

        {/* Filter Tabs & Search Bar */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={1.5}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 38 }}
          >
            <Tab value="all" label={`All (${totalCount})`} sx={{ minHeight: 38, py: 0.5, fontWeight: 700 }} />
            <Tab value="ok" label={`Ready (${okCount})`} sx={{ minHeight: 38, py: 0.5, fontWeight: 700, color: 'success.main' }} />
            <Tab value="ambiguous" label={`Ambiguous (${ambiguousCount})`} sx={{ minHeight: 38, py: 0.5, fontWeight: 700, color: 'warning.main' }} />
            <Tab value="error" label={`Errors (${errorCount})`} sx={{ minHeight: 38, py: 0.5, fontWeight: 700, color: 'error.main' }} />
            <Tab value="skipped" label={`Skipped (${skippedCount})`} sx={{ minHeight: 38, py: 0.5, fontWeight: 700 }} />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search preview..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 240 } }}
          />
        </Stack>

        {/* Validation Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ flexGrow: 1, maxHeight: '48vh', overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Row</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Vendor (Resolved)</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Item / Article (Resolved)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Rate</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: '#F8FAFC' }}>Notes / Validation Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No rows matching the current filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => {
                  const isAmbiguous = row.status === 'AMBIGUOUS';
                  const rowTotal = row.resolvedQty && row.resolvedRate ? (row.resolvedQty * row.resolvedRate).toFixed(2) : '—';

                  return (
                    <TableRow
                      key={row.rowNumber}
                      sx={{
                        bgcolor:
                          row.status === 'ERROR'
                            ? 'error.50'
                            : row.status === 'AMBIGUOUS'
                            ? 'warning.50'
                            : row.status === 'SKIPPED'
                            ? 'action.hover'
                            : undefined,
                      }}
                    >
                      <TableCell>{getStatusChip(row.status)}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>#{row.rowNumber}</TableCell>

                      {/* Vendor Cell */}
                      <TableCell sx={{ minWidth: 200, maxWidth: 280 }}>
                        {isAmbiguous ? (
                          <Box>
                            <Typography variant="caption" color="warning.dark" fontWeight={700} display="block" gutterBottom>
                              Pick matching vendor:
                            </Typography>
                            <FormControl size="small" fullWidth>
                              <Select
                                value={row.resolvedVendorId || ''}
                                displayEmpty
                                onChange={(e) => handleResolveAmbiguousVendor(row.rowNumber, e.target.value as string)}
                                sx={{ bgcolor: 'background.paper', fontSize: '0.8rem' }}
                              >
                                <MenuItem value="" disabled>
                                  <em>Select Vendor...</em>
                                </MenuItem>
                                {(row.ambiguousCandidates || allVendors).map((cand) => (
                                  <MenuItem key={cand.id} value={cand.id} sx={{ fontSize: '0.8rem' }}>
                                    {cand.name} (ID: {cand.id})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary">
                              Mobile: {row.raw.vendorMobile || '—'}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" fontWeight={600} color={row.resolvedVendorName ? 'text.primary' : 'error.main'}>
                              {row.resolvedVendorName || 'Unresolved Vendor'}
                            </Typography>
                            {row.resolvedVendorId && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                ID: {row.resolvedVendorId}
                              </Typography>
                            )}
                            {row.raw.vendorMobile && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Mob: {row.raw.vendorMobile}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>

                      {/* Item Cell */}
                      <TableCell sx={{ minWidth: 180, maxWidth: 260 }}>
                        <Typography variant="body2" fontWeight={600} color={row.resolvedItemName ? 'text.primary' : 'error.main'}>
                          {row.resolvedItemName || row.raw.article || 'Unresolved Item'}
                        </Typography>
                        {row.resolvedItemId && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            ID: {row.resolvedItemId}
                          </Typography>
                        )}
                        {row.resolvedUnit && (
                          <Typography variant="caption" color="text.secondary">
                            Unit: {row.resolvedUnit}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Qty Cell */}
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {row.resolvedQty !== null ? row.resolvedQty : <Typography variant="caption" color="error.main">No Qty</Typography>}
                      </TableCell>

                      {/* Rate Cell */}
                      <TableCell align="right">
                        {row.resolvedRate !== null ? (
                          <Box>
                            <Typography variant="body2" fontWeight={600}>₹{row.resolvedRate}</Typography>
                            {row.rateSource === 'item_catalog_default' && (
                              <Chip label="Default Rate" size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="error.main">Missing</Typography>
                        )}
                      </TableCell>

                      {/* Row Total */}
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {rowTotal !== '—' ? `₹${rowTotal}` : '—'}
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {row.location || '—'}
                        </Typography>
                      </TableCell>

                      {/* Notes / Reason */}
                      <TableCell sx={{ maxWidth: 260 }}>
                        {row.reasons.length > 0 ? (
                          <Stack spacing={0.3}>
                            {row.reasons.map((r, i) => (
                              <Typography
                                key={i}
                                variant="caption"
                                color={row.status === 'ERROR' ? 'error.main' : row.status === 'AMBIGUOUS' ? 'warning.dark' : 'text.secondary'}
                                sx={{ lineHeight: 1.2 }}
                              >
                                • {r}
                              </Typography>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="success.main">
                            Ready
                          </Typography>
                        )}
                        {row.rowComment && (
                          <Typography variant="caption" color="text.secondary" display="block" fontStyle="italic" mt={0.5}>
                            Comment: {row.rowComment}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {readyRows.length} of {totalCount} rows ready to create
          {ambiguousCount > 0 && ` (${ambiguousCount} unresolved ambiguous rows will not be included)`}
        </Typography>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={readyRows.length === 0 || isSubmitting}
            onClick={() => onConfirmGenerate(readyRows, true)}
            sx={{ fontWeight: 700 }}
          >
            Save as Drafts ({readyRows.length})
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={readyRows.length === 0 || isSubmitting}
            onClick={() => onConfirmGenerate(readyRows, false)}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <CheckIcon fontSize="small" />}
            sx={{ fontWeight: 800, bgcolor: '#062B59', '&:hover': { bgcolor: '#041c3b' } }}
          >
            Create Purchase Orders ({readyRows.length})
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
