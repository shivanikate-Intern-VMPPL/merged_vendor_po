import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import {
  generateBulkPOTemplate,
  parseBulkPOWorkbook,
} from '../utils/bulkPOValidation';
import type {
  ActiveVendor,
  ValidatedBulkRow,
} from '../utils/bulkPOValidation';
import type { ItemCatalogEntry } from '../hooks/useItemCatalog';
import { UploadIcon, DownloadIcon, CloseIcon } from '../../../shared/components/icons';

interface Props {
  open: boolean;
  onClose: () => void;
  vendors: ActiveVendor[];
  items: ItemCatalogEntry[];
  onParsed: (result: { rows: ValidatedBulkRow[]; isLegacyTemplate: boolean }) => void;
}

export function BulkPOUploadModal({ open, onClose, vendors, items, onParsed }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDownloadTemplate = () => {
    try {
      const templateData = generateBulkPOTemplate(vendors, items);
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
      console.error('Failed to generate template:', err);
      setError('Failed to generate template file. Please try again.');
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please select a valid Excel (.xlsx, .xls) file.');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const parseResult = parseBulkPOWorkbook(buffer, vendors, items);

      if (parseResult.totalRows === 0) {
        setError('The uploaded file does not contain any data rows.');
        setIsProcessing(false);
        return;
      }

      onParsed({
        rows: parseResult.rows,
        isLegacyTemplate: parseResult.isLegacyTemplate,
      });

      // Reset and close this upload modal (the preview screen will open)
      setSelectedFile(null);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Failed to parse Excel file:', err);
      setError(`Failed to read file: ${(err as Error).message || 'Invalid format'}`);
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={800} color="#062B59">
          Upload Bulk Purchase Orders
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={isProcessing}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 3 }}>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            Upload an Excel sheet to create Purchase Orders in bulk. Rows are matched strictly by <strong>Vendor ID / Mobile</strong> and <strong>Item ID</strong>.
          </Typography>

          {/* Download Template Banner */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Need the official format?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Includes template columns and active Master List lookup sheet.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={handleDownloadTemplate}
              sx={{ whiteSpace: 'nowrap', textTransform: 'none', fontWeight: 700 }}
            >
              Download Template
            </Button>
          </Paper>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          {/* Drag & Drop File Area */}
          <Box
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: isDragOver ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: isDragOver ? 'action.hover' : 'background.paper',
              cursor: isProcessing ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={isProcessing}
            />

            {isProcessing ? (
              <Stack spacing={1.5} alignItems="center">
                <CircularProgress size={36} />
                <Typography variant="body2" fontWeight={700}>
                  Validating IDs and rows…
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1} alignItems="center">
                <UploadIcon sx={{ fontSize: 44, color: 'primary.main', opacity: 0.85 }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  {selectedFile ? selectedFile.name : 'Choose or drop your Excel file here'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports .xlsx or .xls (side summaries will be safely ignored)
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          sx={{ fontWeight: 700, bgcolor: '#062B59', '&:hover': { bgcolor: '#041c3b' } }}
        >
          Browse File
        </Button>
      </DialogActions>
    </Dialog>
  );
}
