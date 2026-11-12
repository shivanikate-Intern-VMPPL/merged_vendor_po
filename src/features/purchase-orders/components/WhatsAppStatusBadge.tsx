import React, { useState } from 'react';
import {
  Box,
  Chip,
  Button,
  Tooltip,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Done as SingleCheckIcon,
  DoneAll as DoubleCheckIcon,
  ErrorOutline as ErrorIcon,
  Refresh as ResendIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../shared/lib/supabaseClient';
import { useAuthContext } from '../../auth/AuthContext';

interface Props {
  poId: string;
  poNumber: string;
}

export function WhatsAppStatusBadge({ poId, poNumber }: Props) {
  const { role } = useAuthContext();
  const queryClient = useQueryClient();
  const [isResending, setIsResending] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const canResend = role === 'admin' || role === 'office';

  const { data: message, isLoading, refetch } = useQuery({
    queryKey: ['whatsapp-message', poId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('id, status, error, phone, updated_at, attempts')
        .eq('po_id', poId)
        .eq('message_type', 'po_notification')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not read whatsapp_messages:', error);
      }
      return data || null;
    },
    staleTime: 15 * 1000,
  });

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-send-po', {
        body: { po_id: poId, force: true },
      });

      if (error) {
        throw new Error(error.message || 'Failed to dispatch WhatsApp resend');
      }

      if (data?.status === 'disabled') {
        setToast({
          open: true,
          message: 'WhatsApp feature is currently disabled (WHATSAPP_ENABLED=false).',
          severity: 'info',
        });
      } else if (data?.success) {
        setToast({
          open: true,
          message: `WhatsApp PO message sent successfully to vendor (${data.status}).`,
          severity: 'success',
        });
      } else {
        setToast({
          open: true,
          message: `WhatsApp send failed: ${data?.error || data?.message || 'Unknown error'}`,
          severity: 'error',
        });
      }

      await refetch();
      queryClient.invalidateQueries({ queryKey: ['whatsapp-message', poId] });
    } catch (err) {
      setToast({
        open: true,
        message: `Error resending WhatsApp: ${(err as Error).message}`,
        severity: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  const status = message?.status;

  const renderBadge = () => {
    if (isLoading) {
      return (
        <Chip
          label="WhatsApp..."
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.75rem', height: 24, borderColor: 'divider' }}
        />
      );
    }

    if (!message) {
      return (
        <Chip
          label="WhatsApp: Not Sent"
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.75rem',
            height: 24,
            color: 'text.secondary',
            borderColor: 'divider',
          }}
        />
      );
    }

    switch (status) {
      case 'read':
        return (
          <Tooltip title="Vendor opened and read the WhatsApp message">
            <Chip
              icon={<DoubleCheckIcon sx={{ fontSize: '14px !important', color: '#0284C7 !important' }} />}
              label="WhatsApp Read"
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 600,
                bgcolor: '#E0F2FE',
                color: '#0369A1',
                border: '1px solid #BAE6FD',
              }}
            />
          </Tooltip>
        );

      case 'delivered':
        return (
          <Tooltip title="Delivered to vendor's phone">
            <Chip
              icon={<DoubleCheckIcon sx={{ fontSize: '14px !important', color: '#16A34A !important' }} />}
              label="WhatsApp Delivered"
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 600,
                bgcolor: '#DCFCE7',
                color: '#15803D',
                border: '1px solid #BBF7D0',
              }}
            />
          </Tooltip>
        );

      case 'sent':
        return (
          <Tooltip title="Sent from server, awaiting delivery receipt">
            <Chip
              icon={<SingleCheckIcon sx={{ fontSize: '14px !important', color: '#0284C7 !important' }} />}
              label="WhatsApp Sent"
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 600,
                bgcolor: '#F0F9FF',
                color: '#0284C7',
                border: '1px solid #E0F2FE',
              }}
            />
          </Tooltip>
        );

      case 'failed':
        return (
          <Tooltip title={message.error || 'Failed to deliver message'}>
            <Chip
              icon={<ErrorIcon sx={{ fontSize: '14px !important', color: '#DC2626 !important' }} />}
              label="WhatsApp Failed"
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 600,
                bgcolor: '#FEE2E2',
                color: '#B91C1C',
                border: '1px solid #FECACA',
              }}
            />
          </Tooltip>
        );

      case 'skipped':
        return (
          <Tooltip title="Vendor has opted out of WhatsApp messages">
            <Chip
              icon={<BlockIcon sx={{ fontSize: '14px !important', color: '#64748B !important' }} />}
              label="WhatsApp Opted-Out"
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 600,
                color: 'text.secondary',
                borderColor: 'divider',
              }}
            />
          </Tooltip>
        );

      case 'queued':
      default:
        return (
          <Chip
            icon={<SendIcon sx={{ fontSize: '12px !important', color: '#D97706 !important' }} />}
            label="WhatsApp Queued"
            size="small"
            sx={{
              fontSize: '0.75rem',
              height: 24,
              fontWeight: 600,
              bgcolor: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FDE68A',
            }}
          />
        );
    }
  };

  return (
    <Stack direction="row" spacing={0.8} alignItems="center">
      {renderBadge()}

      {canResend && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={isResending}
          onClick={handleResend}
          startIcon={isResending ? <CircularProgress size={12} color="inherit" /> : <ResendIcon sx={{ fontSize: 14 }} />}
          sx={{
            fontSize: '0.72rem',
            height: 24,
            px: 1,
            py: 0,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'divider',
            borderRadius: 1.5,
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          {isResending ? 'Sending...' : 'Resend'}
        </Button>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
